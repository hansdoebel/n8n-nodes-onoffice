import { IDataObject } from "n8n-workflow";
import { ensureObject, isArray, isObject, isString } from "./parameterExtraction";

export interface FilterRule {
	field?: unknown;
	operator?: unknown;
	value?: unknown;
}

export class FilterRuleError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FilterRuleError";
	}
}

const ARRAY_VALUE_OPERATORS = new Set(["in", "not in", "between"]);

function isEmptyRule(rule: FilterRule): boolean {
	const hasField = isString(rule.field) && rule.field.length > 0;
	const hasOperator = isString(rule.operator) && rule.operator.length > 0;
	const hasValue = isString(rule.value) && rule.value.length > 0;
	return !hasField && !hasOperator && !hasValue;
}

function splitMultiValue(value: string): string[] {
	return value
		.split(",")
		.map((v) => v.trim())
		.filter((v) => v.length > 0);
}

export function buildFilterFromRules(filterRules: unknown): IDataObject | undefined {
	const container = ensureObject(filterRules);
	const ruleValue = container.rule;

	if (ruleValue === undefined || ruleValue === null) {
		return undefined;
	}

	const rules: FilterRule[] = isArray<FilterRule>(ruleValue)
		? ruleValue
		: [ruleValue as FilterRule];

	const filter: IDataObject = {};

	for (const rule of rules) {
		if (isEmptyRule(rule)) continue;

		const field = isString(rule.field) ? rule.field : "";
		const operator = isString(rule.operator) ? rule.operator : "";
		const rawValue = isString(rule.value) ? rule.value : "";

		if (!field || !operator || rawValue === "") {
			throw new FilterRuleError(
				`Filter rule is incomplete: field, operator, and value are all required (got field="${field}", operator="${operator}", value="${rawValue}").`,
			);
		}

		const op = operator.toLowerCase();
		const val: string | string[] = ARRAY_VALUE_OPERATORS.has(op)
			? splitMultiValue(rawValue)
			: rawValue;

		const existing = filter[field];
		const fieldArray = isArray<{ op: string; val: unknown }>(existing) ? existing : [];
		fieldArray.push({ op, val });
		filter[field] = fieldArray;
	}

	return Object.keys(filter).length > 0 ? filter : undefined;
}

export function parseFilterFromJsonOrObject(filterValue: unknown): IDataObject | undefined {
	if (filterValue === undefined || filterValue === null || filterValue === "") {
		return undefined;
	}

	if (isString(filterValue)) {
		try {
			const parsed = JSON.parse(filterValue);
			return isObject(parsed) ? parsed : undefined;
		} catch {
			throw new FilterRuleError("Filter must be valid JSON");
		}
	}

	if (isObject(filterValue)) {
		return filterValue;
	}

	return undefined;
}
