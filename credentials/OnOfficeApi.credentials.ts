import {
  IAuthenticate,
  ICredentialDataDecryptedObject,
  ICredentialTestRequest,
  ICredentialType,
  IDataObject,
  IHttpRequestOptions,
  Icon,
  INodeProperties,
} from "n8n-workflow";
import { generateHmac } from "../nodes/OnOffice/utils/hmac";
import { API_CONFIG, API_URL } from "../nodes/OnOffice/utils/constants";
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

  test: ICredentialTestRequest = {
    request: {
      method: "POST",
      url: API_URL,
      body: {
        request: {
          actions: [
            {
              actionid: "urn:onoffice-de-ns:smart:2.5:smartml:action:read",
              resourcetype: "basicsettings",
              identifier: "",
              resourceid: "",
              parameters: {
                data: {
                  basicData: {
                    characteristicsCi: ["claim"],
                  },
                },
              },
            },
          ],
        },
      },
    },
    rules: [
      {
        type: "responseSuccessBody",
        properties: {
          key: "status.code",
          value: 400,
          message: "Invalid Secret or API Token",
        },
      },
      {
        type: "responseSuccessBody",
        properties: {
          key: "status.code",
          value: 500,
          message: "OnOffice API server error",
        },
      },
    ],
  };
}
