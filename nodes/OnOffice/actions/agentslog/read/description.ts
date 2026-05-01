import type { INodeProperties } from "n8n-workflow";

export const readAgentslogDescription: INodeProperties[] = [
  {
    displayName: "Parameters",
    name: "parameters",
    type: "multiOptions",
    displayOptions: {
      show: {
        resource: ["agentslog"],
        operation: ["read"],
      },
    },
    options: [
      {
        name: "Absagegrund",
        value: "Absagegrund",
      },
      {
        name: "Adress_nr",
        value: "Adress_nr",
      },
      {
        name: "Aktionsart",
        value: "Aktionsart",
      },
      {
        name: "Aktionstyp",
        value: "Aktionstyp",
      },
      {
        name: "Bemerkung",
        value: "Bemerkung",
      },
      {
        name: "Benutzer",
        value: "Benutzer",
      },
      {
        name: "Benutzer_nr",
        value: "Benutzer_nr",
      },
      {
        name: "Beratungsebene",
        value: "Beratungsebene",
      },
      {
        name: "Created",
        value: "created",
      },
      {
        name: "Datum",
        value: "Datum",
      },
      {
        name: "Datum_bearb",
        value: "Datum_bearb",
      },
      {
        name: "Dauer",
        value: "dauer",
      },
      {
        name: "Herkunft Kontakt",
        value: "HerkunftKontakt",
      },
      {
        name: "Kosten",
        value: "Kosten",
      },
      {
        name: "Merkmal",
        value: "merkmal",
      },
      {
        name: "Objekt_nr",
        value: "Objekt_nr",
      },
    ],
    default: [],
  },
  {
    displayName: "Additional Fields",
    name: "additionalFields",
    type: "collection",
    placeholder: "Add Field",
    default: {},
    displayOptions: {
      show: {
        resource: ["agentslog"],
        operation: ["read"],
      },
    },
    options: [
      {
        displayName: "Address ID",
        name: "addressid",
        type: "string",
        default: "",
        description:
          'Return only entries associated with these address records. Accepts a single ID, a comma-separated string (e.g. "123,456"), or an array of IDs from an expression.',
      },
      {
        displayName: "Estate ID",
        name: "estateid",
        type: "string",
        default: "",
        description:
          'Return only entries associated with these estate records. Accepts a single ID, a comma-separated string (e.g. "123,456"), or an array of IDs from an expression.',
      },
      {
        displayName: "Filter Rules",
        name: "filterRules",
        type: "fixedCollection",
        placeholder: "Add Filter Rule",
        description:
          "Add one or more filter rules. Values for In, Not In, and Between must be entered comma-separated.",
        typeOptions: {
          multipleValues: true,
        },
        default: {},
        options: [
          {
            name: "rule",
            displayName: "Rule",
            values: [
              {
                displayName: "Field",
                name: "field",
                type: "options",
                description:
                  "Field to filter on. Note: the onOffice API does not support filtering on Adress_nr, Objekt_nr, Benutzer, or dauer — use the dedicated Address ID / Estate ID parameters instead.",
                options: [
                  { name: "Aktionsart", value: "Aktionsart" },
                  { name: "Aktionstyp", value: "Aktionstyp" },
                  { name: "Bemerkung", value: "Bemerkung" },
                  { name: "Datum", value: "Datum" },
                ],
                default: "Aktionsart",
              },
              {
                displayName: "Operator",
                name: "operator",
                type: "options",
                options: [
                  { name: "Between", value: "between" },
                  { name: "Equals (=)", value: "is" },
                  { name: "Greater Than (>)", value: ">" },
                  { name: "Greater Than or Equal (>=)", value: ">=" },
                  { name: "In", value: "in" },
                  { name: "Less Than (<)", value: "<" },
                  { name: "Less Than or Equal (<=)", value: "<=" },
                  { name: "Like", value: "like" },
                  { name: "Not Equal (!=)", value: "!=" },
                  { name: "Not In", value: "not in" },
                  { name: "Not Like", value: "not like" },
                ],
                default: "is",
              },
              {
                displayName: "Value",
                name: "value",
                type: "string",
                default: "",
                description:
                  "For In, Not In, and Between, use comma-separated values (e.g. 'Download,Email' or '2024-01-01,2024-12-31'). For Like and Not Like, use '%' as a wildcard.",
              },
            ],
          },
        ],
      },
      {
        displayName: "Full Mail",
        name: "fullmail",
        type: "boolean",
        default: false,
        description:
          "Whether to return the full email in the response parameter mailbody",
      },
      {
        displayName: "List Limit",
        name: "listlimit",
        type: "number",
        default: 20,
        description:
          "Maximum number of records returned in the response. Maximum: 500.",
      },
      {
        displayName: "List Offset",
        name: "listoffset",
        type: "number",
        default: 0,
        description:
          "Offset of the list, from which data record onwards the list should be output",
      },
      {
        displayName: "Project ID",
        name: "projectid",
        type: "number",
        default: "",
        description: "Return only entries associated with this project record",
      },
      {
        displayName: "Sort By",
        name: "sortby",
        type: "string",
        default: "",
        description:
          'Fields to sort by in JSON format, e.g. {"Aktionsart": "ASC", "Aktionstyp": "DESC"}',
      },
      {
        displayName: "Sort Order",
        name: "sortorder",
        description:
          "Possible values: ASC or DESC. Only applicable if sortby was specified as a string without sorting information.",
        type: "options",
        options: [
          {
            name: "Ascending",
            value: "ASC",
          },
          {
            name: "Descending",
            value: "DESC",
          },
        ],
        default: "ASC",
      },
      {
        displayName: "Tracking",
        name: "tracking",
        type: "boolean",
        default: false,
        description:
          "Whether to return only entries released for object tracking",
      },
    ],
  },
];
