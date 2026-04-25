import {
  IExecuteFunctions,
  IHttpRequestOptions,
  IPollFunctions,
  NodeOperationError,
} from "n8n-workflow";
import { getActionId } from "./actionIds";
import { API_CONFIG, API_URL } from "./constants";
import { ApiRequestOptions, OnOfficeApiResponse, RequestBody } from "./types";

export async function apiRequest(
  this: IExecuteFunctions | IPollFunctions,
  options: ApiRequestOptions,
): Promise<OnOfficeApiResponse> {
  const { resourceType, operation, parameters, resourceId = "" } = options;

  const actionId = getActionId(operation);
  if (!actionId) {
    throw new NodeOperationError(
      this.getNode(),
      `Invalid operation: ${operation}`,
    );
  }

  const action: RequestBody = {
    actionid: actionId,
    resourcetype: resourceType,
    identifier: "",
    resourceid: resourceId,
    parameters,
  };

  const requestOptions: IHttpRequestOptions = {
    method: "POST",
    url: API_URL,
    body: {
      request: { actions: [action] },
    },
    json: true,
    timeout: API_CONFIG.DEFAULT_TIMEOUT,
  };

  try {
    const response = (await this.helpers.httpRequestWithAuthentication.call(
      this,
      "onOfficeApi",
      requestOptions,
    )) as OnOfficeApiResponse;
    return response;
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `OnOffice API request error: ${error.message}`,
    );
  }
}
