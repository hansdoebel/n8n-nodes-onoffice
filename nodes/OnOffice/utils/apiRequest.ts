import {
  IExecuteFunctions,
  IHttpRequestOptions,
  IPollFunctions,
  NodeOperationError,
} from "n8n-workflow";
import { getActionId } from "./actionIds";
import { generateHmac } from "./hmac";
import { API_CONFIG, API_URL } from "./constants";
import { ApiRequestOptions, OnOfficeApiResponse, RequestBody } from "./types";

export async function apiRequest(
  this: IExecuteFunctions | IPollFunctions,
  options: ApiRequestOptions,
): Promise<OnOfficeApiResponse> {
  const { resourceType, operation, parameters, resourceId = "" } = options;

  const credentials = await this.getCredentials("onOfficeApi");
  if (!credentials) {
    throw new NodeOperationError(
      this.getNode(),
      "No credentials were returned!",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const actionId = getActionId(operation);

  if (!actionId) {
    throw new NodeOperationError(
      this.getNode(),
      `Invalid operation: ${operation}`,
    );
  }

  const hmacSignature = generateHmac(
    credentials.secret as string,
    timestamp,
    credentials.token as string,
    resourceType,
    actionId,
  );

  const requestBody: RequestBody = {
    actionid: actionId,
    resourcetype: resourceType,
    identifier: "",
    timestamp,
    hmac: hmacSignature,
    hmac_version: API_CONFIG.HMAC_VERSION,
    resourceid: resourceId,
    parameters,
  };

  const request: IHttpRequestOptions = {
    method: "POST",
    url: API_URL,
    body: {
      token: credentials.token,
      request: { actions: [requestBody] },
    },
    json: true,
    timeout: API_CONFIG.DEFAULT_TIMEOUT,
  };

  try {
    const response =
      (await this.helpers.request(request)) as OnOfficeApiResponse;
    return response;
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `OnOffice API request error: ${error.message}`,
    );
  }
}
