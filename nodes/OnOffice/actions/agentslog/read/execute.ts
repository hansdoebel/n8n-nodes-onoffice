import { IExecuteFunctions, INodeExecutionData } from "n8n-workflow";
import { apiRequest } from "../../../utils/apiRequest";
import {
	buildParameters,
	IdListError,
	normalizeIdList,
} from "../../../utils/parameterBuilder";
import {
	handleExecutionError,
	throwValidationError,
} from "../../../utils/errorHandling";
import { AgentslogParameters } from "../../../utils/types";
import {
	extractObject,
	extractStringArray,
} from "../../../utils/parameterExtraction";
import { extractResponseData } from "../../../utils/responseHandler";
import {
	buildFilterFromRules,
	FilterRuleError,
	parseFilterFromJsonOrObject,
} from "../../../utils/filterBuilder";

const AGENTSLOG_COMMON_FIELDS = [
	"listlimit",
	"listoffset",
	"sortby",
	"sortorder",
	"fullmail",
	"tracking",
] as const;

export async function readAgentslog(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	try {
		const additionalFields = extractObject(this, "additionalFields", itemIndex, {});
		const fieldSelections = extractStringArray(this, "parameters", itemIndex, []);

		const parameters: AgentslogParameters = {
			data: fieldSelections,
		};

		const addressIds = normalizeIdList(additionalFields.addressid);
		if (addressIds) {
			parameters.addressid = addressIds;
		}

		const estateIds = normalizeIdList(additionalFields.estateid);
		if (estateIds) {
			parameters.estateid = estateIds;
		}

		const projectIdValue = additionalFields.projectid;
		if (projectIdValue !== undefined && projectIdValue !== null) {
			const projectId = Number(projectIdValue);
			if (!isNaN(projectId)) {
				parameters.projectid = projectId;
			}
		}

		const computedFilter =
			buildFilterFromRules(additionalFields.filterRules) ??
			parseFilterFromJsonOrObject(additionalFields.filter);

		if (computedFilter) {
			parameters.filter = computedFilter;
		}

		const commonFields = buildParameters({}, additionalFields, AGENTSLOG_COMMON_FIELDS);
		Object.assign(parameters, commonFields);

		const response = await apiRequest.call(this, {
			resourceType: "agentslog",
			operation: "read",
			parameters,
		});

		const responseData = extractResponseData(response);
		return this.helpers.returnJsonArray(responseData);
	} catch (error) {
		if (error instanceof FilterRuleError || error instanceof IdListError) {
			throwValidationError(this, error.message, itemIndex);
		}
		handleExecutionError(this, error, {
			resource: "agentslog",
			operation: "read",
			itemIndex,
		});
	}
}
