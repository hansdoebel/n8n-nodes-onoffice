import {
  IAuthenticate,
  ICredentialDataDecryptedObject,
  ICredentialType,
  IDataObject,
  IHttpRequestOptions,
  Icon,
  INodeProperties,
} from "n8n-workflow";
import { generateHmac } from "../nodes/OnOffice/utils/hmac";
import { API_CONFIG } from "../nodes/OnOffice/utils/constants";
import { RequestBody } from "../nodes/OnOffice/utils/types";

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

  authenticate: IAuthenticate = async (
    credentials: ICredentialDataDecryptedObject,
    requestOptions: IHttpRequestOptions,
  ): Promise<IHttpRequestOptions> => {
    const secret = credentials.secret as string;
    const token = credentials.token as string;
    const timestamp = Math.floor(Date.now() / 1000);

    const body = (requestOptions.body as IDataObject) ?? {};
    const requestPayload = body.request as
      | { actions?: RequestBody[] }
      | undefined;

    for (const action of requestPayload?.actions ?? []) {
      Object.assign(action, {
        timestamp,
        hmac_version: API_CONFIG.HMAC_VERSION,
        hmac: generateHmac(
          secret,
          timestamp,
          token,
          action.resourcetype,
          action.actionid,
        ),
      });
    }

    requestOptions.body = { ...body, token };
    return requestOptions;
  };
}
