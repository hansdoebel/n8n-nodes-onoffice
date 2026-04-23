/* eslint-disable n8n-nodes-base/node-filename-against-convention */

import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";

import { router } from "./utils/router";

import * as address from "./actions/address";
import * as agentslog from "./actions/agentslog";
import * as appointments from "./actions/appointments";
import * as email from "./actions/email";
import * as estate from "./actions/estate";
import * as files from "./actions/files";
import * as relation from "./actions/relation";
import * as settings from "./actions/settings";
import * as templates from "./actions/templates";
import * as task from "./actions/task";
import * as searchcriteria from "./actions/searchcriteria";

export class OnOffice implements INodeType {
  description: INodeTypeDescription = {
    displayName: "onOffice",
    name: "onoffice",
    icon: "file:../../icons/onoffice.svg",
    group: ["output"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "onOffice custom node for n8n",
    defaults: {
      name: "onOffice",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "onOfficeApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Address",
            value: "address",
          },
          {
            name: "Agentslog",
            value: "agentslog",
          },
          {
            name: "Appointment",
            value: "appointments",
          },
          {
            name: "E-Mail",
            value: "email",
          },
          {
            name: "Estate",
            value: "estate",
          },
          {
            name: "File",
            value: "files",
          },
          {
            name: "Relation",
            value: "relation",
          },
          {
            name: "Search Criterion",
            value: "searchcriteria",
          },
          {
            name: "Setting",
            value: "settings",
          },
          {
            name: "Task",
            value: "task",
          },
          {
            name: "Template",
            value: "templates",
          },
        ],
        default: "address",
      },
      ...address.descriptions,
      ...agentslog.descriptions,
      ...appointments.descriptions,
      ...email.descriptions,
      ...estate.descriptions,
      ...files.descriptions,
      ...relation.descriptions,
      ...searchcriteria.descriptions,
      ...settings.descriptions,
      ...task.descriptions,
      ...templates.descriptions,
    ],
  };
  async execute(this: IExecuteFunctions) {
    return await router.call(this);
  }
}
