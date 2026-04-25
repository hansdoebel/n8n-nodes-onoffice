import { IDataObject } from "n8n-workflow";

export interface ApiCredentials {
  secret: string;
  token: string;
}

export interface ApiAction {
  actionid: string;
  resourcetype: string;
  identifier: string;
  timestamp: number;
  hmac: string;
  hmac_version: number;
  resourceid: string;
  parameters: IDataObject;
}

export interface ApiResponseStatus {
  errorcode: number;
  message: string;
}

export interface ApiResponseAction {
  actionid: string;
  resourceid: string;
  resourcetype: string;
  cacheable: boolean;
  identifier: string;
  data?: IDataObject | IDataObject[];
  status: ApiResponseStatus;
}

export interface OnOfficeApiResponse {
  status: ApiResponseStatus;
  response?: {
    results: ApiResponseAction[];
  };
  errors?: string[];
  message?: string;
}

export interface RequestBody {
  actionid: string;
  resourcetype: string;
  identifier: string;
  resourceid: string;
  parameters: IDataObject;
}

export interface ApiRequestOptions {
  resourceType: string;
  operation: string;
  parameters: IDataObject;
  resourceId?: string;
}

export interface ApiResponse {
  status: string;
  data?: IDataObject | IDataObject[];
  errors?: string[];
}

export interface BaseOperationParameters extends IDataObject {
  formatoutput?: string | boolean;
  listlimit?: number;
  listoffset?: number;
  sortby?: string;
  sortorder?: string;
}

export interface PaginationParameters extends IDataObject {
  listlimit?: number;
  listoffset?: number;
}

export interface SortingParameters extends IDataObject {
  sortby?: string;
  sortorder?: string;
}

export interface FilterParameters extends IDataObject {
  filter?: IDataObject;
}

export interface DataFieldsParameters extends IDataObject {
  data?: string[];
}

export interface AddressParameters extends BaseOperationParameters {
  recordids?: string[];
  data?: string[];
}

export interface EstateParameters extends BaseOperationParameters {
  data?: string[];
  addMobileUrl?: boolean;
}

export interface AgentslogParameters extends IDataObject {
  data?: string[];
  estateid?: number[];
  addressid?: number[];
  projectid?: number;
  filter?: IDataObject;
  listlimit?: number;
  listoffset?: number;
  sortby?: string;
  sortorder?: string;
  fullmail?: boolean;
  tracking?: boolean;
}

export interface AppointmentReadParameters extends IDataObject {
  data?: string[];
}

export interface AppointmentCreateParameters extends IDataObject {
  data?: IDataObject;
  relatedAddressIds?: number[];
  relatedEstateId?: number;
}

export interface EmailParameters extends IDataObject {
  emailidentity: string;
  templateid?: number;
  estateids?: string[];
  receiver: string[];
  pdfexposeidentifiers?: string[];
  useHtml?: boolean;
  attachLinkedMailToHtmlMessage?: boolean;
  forwarded?: boolean;
  replied?: boolean;
  mergeexposeintopdfletter?: boolean;
  displayName?: string;
  bcc?: string[];
  cc?: string[];
  subject?: string;
  onlineattachmentids?: string[];
  replyto?: string;
  body?: string;
  documentattributes?: string[];
  pdfformids?: string[];
  pdfletterids?: string[];
  messageid?: string;
}

export interface RelationType {
  name: string;
  value: string;
  description: string;
}

export interface RelationParameters extends IDataObject {
  relationtype: string;
  parentids?: number[];
  childids?: number[];
}

export interface TemplateParameters extends IDataObject {
  type: string;
  category?: string;
  mailtemplateids?: number[];
  list?: boolean;
}

export interface TaskParameters extends IDataObject {
  data?: string[];
  listlimit?: number;
  listoffset?: number;
  sortby?: string;
  sortorder?: string;
}

export interface SearchCriteriaParameters extends IDataObject {
  data?: string[];
  listlimit?: number;
  listoffset?: number;
  sortby?: string;
  sortorder?: string;
}

export interface RelationCreateParameters extends IDataObject {
  relationtype: string;
  parentids: number[];
  childids: number[];
}

export interface RelationUpdateParameters extends IDataObject {
  relationtype: string;
  parentids: number[];
  childids: number[];
}

export interface RelationDeleteParameters extends IDataObject {
  relationtype: string;
  parentids: number[];
  childids: number[];
}

export type OperationParameters =
  | AddressParameters
  | EstateParameters
  | AgentslogParameters
  | AppointmentReadParameters
  | AppointmentCreateParameters
  | EmailParameters
  | RelationParameters
  | TemplateParameters
  | TaskParameters
  | SearchCriteriaParameters
  | RelationCreateParameters
  | RelationUpdateParameters
  | RelationDeleteParameters;
