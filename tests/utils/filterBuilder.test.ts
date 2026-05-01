import { describe, it, expect } from "bun:test";
import {
	buildFilterFromRules,
	FilterRuleError,
	parseFilterFromJsonOrObject,
} from "../../nodes/OnOffice/utils/filterBuilder";

describe("filterBuilder", () => {
	describe("buildFilterFromRules", () => {
		it("returns undefined when input is undefined", () => {
			expect(buildFilterFromRules(undefined)).toBeUndefined();
		});

		it("returns undefined when input is null", () => {
			expect(buildFilterFromRules(null)).toBeUndefined();
		});

		it("returns undefined when input has no rule key", () => {
			expect(buildFilterFromRules({})).toBeUndefined();
		});

		it("returns undefined when rule array is empty", () => {
			expect(buildFilterFromRules({ rule: [] })).toBeUndefined();
		});

		it("returns undefined when only entirely-empty rule objects are provided", () => {
			expect(
				buildFilterFromRules({ rule: [{ field: "", operator: "", value: "" }] }),
			).toBeUndefined();
		});

		it("builds a single 'is' filter with string value", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Aktionsart", operator: "is", value: "Download" }],
				}),
			).toEqual({
				Aktionsart: [{ op: "is", val: "Download" }],
			});
		});

		it("builds an 'in' filter with array value from comma-separated string", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Aktionsart", operator: "in", value: "Download,Email" }],
				}),
			).toEqual({
				Aktionsart: [{ op: "in", val: ["Download", "Email"] }],
			});
		});

		it("builds a 'between' filter with array value from comma-separated string", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Datum", operator: "between", value: "2024-02-01,2024-02-28" }],
				}),
			).toEqual({
				Datum: [{ op: "between", val: ["2024-02-01", "2024-02-28"] }],
			});
		});

		it("builds a 'not in' filter with array value", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Aktionsart", operator: "not in", value: "Email,Anruf" }],
				}),
			).toEqual({
				Aktionsart: [{ op: "not in", val: ["Email", "Anruf"] }],
			});
		});

		it("trims whitespace and drops empty entries from comma-separated values", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Aktionsart", operator: "in", value: " Download , , Email " }],
				}),
			).toEqual({
				Aktionsart: [{ op: "in", val: ["Download", "Email"] }],
			});
		});

		it("builds a '!=' filter with string value", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Aktionsart", operator: "!=", value: "Email" }],
				}),
			).toEqual({
				Aktionsart: [{ op: "!=", val: "Email" }],
			});
		});

		it("builds a '>' filter with string value", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Datum", operator: ">", value: "2024-01-01" }],
				}),
			).toEqual({
				Datum: [{ op: ">", val: "2024-01-01" }],
			});
		});

		it("builds a '<=' filter with string value", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Datum", operator: "<=", value: "2024-12-31" }],
				}),
			).toEqual({
				Datum: [{ op: "<=", val: "2024-12-31" }],
			});
		});

		it("builds a 'like' filter preserving '%' wildcards", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Bemerkung", operator: "like", value: "%Vertrag%" }],
				}),
			).toEqual({
				Bemerkung: [{ op: "like", val: "%Vertrag%" }],
			});
		});

		it("builds a 'not like' filter preserving '%' wildcards", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Bemerkung", operator: "not like", value: "%spam%" }],
				}),
			).toEqual({
				Bemerkung: [{ op: "not like", val: "%spam%" }],
			});
		});

		it("normalizes uppercase operators to lowercase output", () => {
			expect(
				buildFilterFromRules({
					rule: [{ field: "Aktionsart", operator: "IN", value: "Download,Email" }],
				}),
			).toEqual({
				Aktionsart: [{ op: "in", val: ["Download", "Email"] }],
			});
		});

		it("combines multiple rules on different fields", () => {
			expect(
				buildFilterFromRules({
					rule: [
						{ field: "Aktionsart", operator: "in", value: "Download,Email" },
						{ field: "Datum", operator: "between", value: "2024-02-01,2024-02-28" },
					],
				}),
			).toEqual({
				Aktionsart: [{ op: "in", val: ["Download", "Email"] }],
				Datum: [{ op: "between", val: ["2024-02-01", "2024-02-28"] }],
			});
		});

		it("appends multiple rules on the same field as separate entries", () => {
			expect(
				buildFilterFromRules({
					rule: [
						{ field: "Aktionsart", operator: "is", value: "Download" },
						{ field: "Aktionsart", operator: "is", value: "Email" },
					],
				}),
			).toEqual({
				Aktionsart: [
					{ op: "is", val: "Download" },
					{ op: "is", val: "Email" },
				],
			});
		});

		it("treats a single rule object (not in array) as one rule", () => {
			expect(
				buildFilterFromRules({
					rule: { field: "Aktionsart", operator: "is", value: "Download" },
				}),
			).toEqual({
				Aktionsart: [{ op: "is", val: "Download" }],
			});
		});

		it("throws FilterRuleError when only value is provided", () => {
			expect(() =>
				buildFilterFromRules({ rule: [{ value: "Downloads" }] }),
			).toThrow(FilterRuleError);
		});

		it("throws FilterRuleError when field is missing", () => {
			expect(() =>
				buildFilterFromRules({
					rule: [{ operator: "is", value: "Download" }],
				}),
			).toThrow(FilterRuleError);
		});

		it("throws FilterRuleError when operator is missing", () => {
			expect(() =>
				buildFilterFromRules({
					rule: [{ field: "Aktionsart", value: "Download" }],
				}),
			).toThrow(FilterRuleError);
		});

		it("throws FilterRuleError with a descriptive message", () => {
			expect(() =>
				buildFilterFromRules({ rule: [{ value: "Downloads" }] }),
			).toThrow(/incomplete/i);
		});
	});

	describe("parseFilterFromJsonOrObject", () => {
		it("returns undefined for undefined", () => {
			expect(parseFilterFromJsonOrObject(undefined)).toBeUndefined();
		});

		it("returns undefined for null", () => {
			expect(parseFilterFromJsonOrObject(null)).toBeUndefined();
		});

		it("returns undefined for empty string", () => {
			expect(parseFilterFromJsonOrObject("")).toBeUndefined();
		});

		it("parses a JSON string into an object", () => {
			expect(
				parseFilterFromJsonOrObject('{"Aktionsart":[{"op":"=","val":"Download"}]}'),
			).toEqual({
				Aktionsart: [{ op: "=", val: "Download" }],
			});
		});

		it("returns the same object when given an object", () => {
			const input = { Aktionsart: [{ op: "=", val: "Download" }] };
			expect(parseFilterFromJsonOrObject(input)).toEqual(input);
		});

		it("throws FilterRuleError on invalid JSON", () => {
			expect(() => parseFilterFromJsonOrObject("not json")).toThrow(FilterRuleError);
		});
	});
});
