/* eslint-disable n8n-nodes-base/node-filename-against-convention */

import {
  IDataObject,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IPollFunctions,
  NodeOperationError,
} from "n8n-workflow";

import { apiRequest } from "../OnOffice/utils/apiRequest";
import { extractResponseData } from "../OnOffice/utils/responseHandler";
import {
  CompareMode,
  PollStaticData,
  extractRecords,
  isGreater,
  maxValue,
} from "./utils/pollState";

interface EventConfig {
  resourceType: "address" | "estate";
  trackingField: string;
  sortby: string;
  sortorder: "ASC" | "DESC";
  compareAs: CompareMode;
  fieldsParam: string;
  defaultData: string[];
}

const EVENTS: Record<string, EventConfig> = {
  addressCreated: {
    resourceType: "address",
    trackingField: "Eintragsdatum",
    sortby: "Eintragsdatum",
    sortorder: "DESC",
    compareAs: "string",
    fieldsParam: "addressFields",
    defaultData: ["Vorname", "Name", "Email"],
  },
  estateUpdated: {
    resourceType: "estate",
    trackingField: "geaendert_am",
    sortby: "geaendert_am",
    sortorder: "DESC",
    compareAs: "string",
    fieldsParam: "estateFields",
    defaultData: ["objektnr_extern", "objektart", "ort"],
  },
  estateCreated: {
    resourceType: "estate",
    trackingField: "Id",
    sortby: "Id",
    sortorder: "DESC",
    compareAs: "numeric",
    fieldsParam: "estateFields",
    defaultData: ["objektnr_extern", "objektart", "ort"],
  },
};

const ADDRESS_FIELD_OPTIONS = [
  { name: "Anrede, Titel", value: "Anrede-Titel" },
  { name: "Betreuer", value: "Benutzer" },
  { name: "E-Mail", value: "Email" },
  { name: "Eintragsdatum", value: "Eintragsdatum" },
  { name: "Firma", value: "Zusatz1" },
  { name: "Geschlecht", value: "Geschlecht" },
  { name: "Herkunft Kontakt", value: "HerkunftKontakt" },
  { name: "Homepage", value: "Homepage" },
  { name: "Kontaktkategorie", value: "contactCategory" },
  { name: "Land", value: "Land" },
  { name: "Letzter Kontakt", value: "letzter_Kontakt" },
  { name: "Name", value: "Name" },
  { name: "Ort", value: "Ort" },
  { name: "PLZ", value: "Plz" },
  { name: "Straße", value: "Strasse" },
  { name: "Telefonnummer", value: "Telefon1" },
  { name: "Telefonnummer 2", value: "Telefon2" },
  { name: "Vorname", value: "Vorname" },
];

const ESTATE_FIELD_OPTIONS = [
  { name: "Autom. Exposéversand", value: "autoExpose" },
  { name: "Betreuer", value: "benutzer" },
  { name: "Einheit", value: "einheit" },
  { name: "Estate ID", value: "Id" },
  { name: "Hausnummer", value: "hausnummer" },
  { name: "Nutzungsart", value: "nutzungsart" },
  { name: "Objektart", value: "objektart" },
  { name: "Objektnummer (Extern)", value: "objektnr_extern" },
  { name: "Objekttyp", value: "objekttyp" },
  { name: "Ort", value: "ort" },
  { name: "PLZ", value: "plz" },
  { name: "Stammobjekt", value: "stammobjekt" },
  { name: "Straße", value: "strasse" },
  { name: "Vermarktungsart", value: "vermarktungsart" },
];

export class OnOfficeTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "onOffice Trigger",
    name: "onOfficeTrigger",
    icon: "file:../../icons/onoffice.svg",
    group: ["trigger"],
    version: 1,
    description:
      "Polls onOffice for newly created addresses, newly created estates, or modified estates",
    subtitle: '={{$parameter["event"]}}',
    defaults: {
      name: "onOffice Trigger",
    },
    credentials: [
      {
        name: "onOfficeApi",
        required: true,
      },
    ],
    polling: true,
    inputs: [],
    outputs: ["main"],
    properties: [
      {
        displayName: "Event",
        name: "event",
        type: "options",
        noDataExpression: true,
        default: "addressCreated",
        options: [
          {
            name: "Address Created",
            value: "addressCreated",
            description: "Trigger when new addresses appear (sorted by Eintragsdatum DESC)",
          },
          {
            name: "Estate Created",
            value: "estateCreated",
            description: 'Trigger when new estates appear (sorted by ID DESC)',
          },
          {
            name: "Estate Updated",
            value: "estateUpdated",
            description: "Trigger when estates are modified (sorted by geaendert_am DESC)",
          },
        ],
      },
      {
        displayName: "Limit",
        name: "limit",
        type: "number",
        typeOptions: {
          minValue: 1,
          // eslint-disable-next-line n8n-nodes-base/node-param-type-options-max-value-present
          maxValue: 500,
        },
        // eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
        default: 25,
        // eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
        description:
          "Maximum number of records fetched per poll. If more records appear between polls than this limit, the oldest will be missed. Maximum 500.",
      },
      {
        displayName: "Fields",
        name: "addressFields",
        type: "multiOptions",
        displayOptions: {
          show: {
            event: ["addressCreated"],
          },
        },
        options: ADDRESS_FIELD_OPTIONS,
        default: ["Vorname", "Name", "Email"],
        description:
          "Fields to return for each address. Eintragsdatum is always included.",
      },
      {
        displayName: "Fields",
        name: "estateFields",
        type: "multiOptions",
        displayOptions: {
          show: {
            event: ["estateUpdated", "estateCreated"],
          },
        },
        options: ESTATE_FIELD_OPTIONS,
        default: ["objektnr_extern", "objektart", "ort"],
        description: 'Fields to return for each estate. The tracking field (geaendert_am for Estate Updated, ID for Estate Created) is always included.',
      },
      {
        displayName: "Additional Options",
        name: "additionalOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        options: [
          {
            displayName: "Filter ID",
            name: "filterid",
            type: "number",
            default: 0,
            description:
              "Optional onOffice enterprise filter ID applied in addition to the date sort",
          },
          {
            displayName: "Format Output",
            name: "formatoutput",
            type: "boolean",
            default: false,
            description:
              "Whether to format select-field values for display instead of returning raw values",
          },
        ],
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const eventKey = this.getNodeParameter("event") as string;
    const event = EVENTS[eventKey];
    if (!event) {
      throw new NodeOperationError(
        this.getNode(),
        `Unknown event: ${eventKey}`,
      );
    }

    const limit = this.getNodeParameter("limit", 25) as number;
    const selectedFields = this.getNodeParameter(
      event.fieldsParam,
      event.defaultData,
    ) as string[];
    const additionalOptions = this.getNodeParameter(
      "additionalOptions",
      {},
    ) as IDataObject;

    const data =
      selectedFields.length > 0 ? [...selectedFields] : [...event.defaultData];
    if (!data.includes(event.trackingField)) data.unshift(event.trackingField);

    const isManual = this.getMode() === "manual";

    const parameters: IDataObject = {
      data,
      listlimit: isManual ? 1 : limit,
      sortby: event.sortby,
      sortorder: event.sortorder,
    };

    if (additionalOptions.formatoutput !== undefined) {
      parameters.formatoutput = additionalOptions.formatoutput;
    }
    if (
      additionalOptions.filterid !== undefined &&
      additionalOptions.filterid !== 0
    ) {
      parameters.filterid = additionalOptions.filterid;
    }

    const response = await apiRequest.call(this, {
      resourceType: event.resourceType,
      operation: "read",
      parameters,
    });

    const responseData = extractResponseData(response);
    const records = extractRecords(responseData);

    if (isManual) {
      return records.length > 0
        ? [this.helpers.returnJsonArray(records)]
        : null;
    }

    const staticData = this.getWorkflowStaticData("node") as PollStaticData;
    const lastSeen = staticData.lastSeen ?? staticData.lastSeenDate;

    const newMax = maxValue(records, event.trackingField, event.compareAs);
    if (newMax) {
      staticData.lastSeen = newMax;
      delete staticData.lastSeenDate;
    }

    if (!lastSeen) {
      return null;
    }

    const emitted = records.filter((r) => {
      const v = r[event.trackingField];
      return typeof v === "string" && isGreater(v, lastSeen, event.compareAs);
    });

    return emitted.length > 0
      ? [this.helpers.returnJsonArray(emitted)]
      : null;
  }
}
