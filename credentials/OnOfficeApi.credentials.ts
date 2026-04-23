import { Icon, ICredentialType, INodeProperties } from "n8n-workflow";

export class OnOfficeApi implements ICredentialType {
  name = "onOfficeApi";

  displayName = "onOffice API";

  documentationUrl = "https://apidoc.onoffice.de/";
  icon: Icon = "file:../icons/onoffice.svg";
  properties: INodeProperties[] = [
    {
      displayName: "Secret",
      name: "secret",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
    },
    {
      displayName: "API Token",
      name: "token",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
    },
  ];
}
