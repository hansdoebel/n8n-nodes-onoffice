import { describe, it, expect } from "bun:test";
import {
  IdListError,
  normalizeIdList,
  parseCommaSeparatedNumbers,
  parseCommaSeparatedStrings,
} from "../../nodes/OnOffice/utils/parameterBuilder";

describe("parameterBuilder", () => {
  describe("parseCommaSeparatedStrings", () => {
    it("should parse single string", () => {
      const result = parseCommaSeparatedStrings("test");
      expect(result).toEqual(["test"]);
    });

    it("should parse multiple comma-separated strings", () => {
      const result = parseCommaSeparatedStrings("test1,test2,test3");
      expect(result).toEqual(["test1", "test2", "test3"]);
    });

    it("should handle strings with spaces around commas", () => {
      const result = parseCommaSeparatedStrings("test1, test2, test3");
      expect(result).toEqual(["test1", "test2", "test3"]);
    });

    it("should handle strings with leading/trailing spaces", () => {
      const result = parseCommaSeparatedStrings("  test1, test2, test3  ");
      expect(result).toEqual(["test1", "test2", "test3"]);
    });

    it("should return empty array for empty string", () => {
      const result = parseCommaSeparatedStrings("");
      expect(result).toEqual([]);
    });

    it("should return empty array for whitespace-only string", () => {
      const result = parseCommaSeparatedStrings("   ");
      expect(result).toEqual([]);
    });

    it("should handle numeric strings", () => {
      const result = parseCommaSeparatedStrings("123,456,789");
      expect(result).toEqual(["123", "456", "789"]);
    });

    it("should handle recordids from real-world example", () => {
      const result = parseCommaSeparatedStrings("123,124,125");
      expect(result).toEqual(["123", "124", "125"]);
    });

    it("should handle single string with trailing comma", () => {
      const result = parseCommaSeparatedStrings("test,");
      expect(result).toEqual(["test"]);
    });

    it("should handle duplicate strings", () => {
      const result = parseCommaSeparatedStrings("test,test,value,value");
      expect(result).toEqual(["test", "test", "value", "value"]);
    });

    it("should not mutate input string", () => {
      const input = "test1, test2, test3";
      const inputCopy = input;
      parseCommaSeparatedStrings(input);
      expect(input).toBe(inputCopy);
    });

    it("should handle mixed spacing patterns", () => {
      const result = parseCommaSeparatedStrings("test1 , test2,test3 , test4");
      expect(result).toEqual(["test1", "test2", "test3", "test4"]);
    });

    it("should filter out empty strings after trimming", () => {
      const result = parseCommaSeparatedStrings("test1,,test2,  ,test3");
      expect(result).toEqual(["test1", "test2", "test3"]);
    });

    it("should handle special characters in strings", () => {
      const result = parseCommaSeparatedStrings("test-1,test_2,test.3");
      expect(result).toEqual(["test-1", "test_2", "test.3"]);
    });
  });

  describe("parseCommaSeparatedNumbers", () => {
    it("should parse single number", () => {
      const result = parseCommaSeparatedNumbers("123");
      expect(result).toEqual([123]);
    });

    it("should parse multiple comma-separated numbers", () => {
      const result = parseCommaSeparatedNumbers("123,456,789");
      expect(result).toEqual([123, 456, 789]);
    });

    it("should handle numbers with spaces around commas", () => {
      const result = parseCommaSeparatedNumbers("123, 456, 789");
      expect(result).toEqual([123, 456, 789]);
    });

    it("should handle numbers with leading/trailing spaces", () => {
      const result = parseCommaSeparatedNumbers("  123, 456, 789  ");
      expect(result).toEqual([123, 456, 789]);
    });

    it("should return empty array for empty string", () => {
      const result = parseCommaSeparatedNumbers("");
      expect(result).toEqual([]);
    });

    it("should return array with 0 for whitespace-only string", () => {
      const result = parseCommaSeparatedNumbers("   ");
      expect(result).toEqual([0]);
    });

    it("should handle zero values", () => {
      const result = parseCommaSeparatedNumbers("0,1,2");
      expect(result).toEqual([0, 1, 2]);
    });

    it("should handle large numbers", () => {
      const result = parseCommaSeparatedNumbers("1000000,2000000,3000000");
      expect(result).toEqual([1000000, 2000000, 3000000]);
    });

    it("should skip invalid/non-numeric entries", () => {
      const result = parseCommaSeparatedNumbers("123,abc,456,xyz,789");
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain(123);
      expect(result).toContain(456);
      expect(result).toContain(789);
    });

    it("should handle negative numbers", () => {
      const result = parseCommaSeparatedNumbers("-123,-456,789");
      expect(result).toContain(-123);
      expect(result).toContain(-456);
      expect(result).toContain(789);
    });

    it("should parse IDs from real-world example", () => {
      const result = parseCommaSeparatedNumbers("8565,5795,8569,6475,7831");
      expect(result).toEqual([8565, 5795, 8569, 6475, 7831]);
    });

    it("should handle single number with trailing comma", () => {
      const result = parseCommaSeparatedNumbers("123,");
      expect(result).toContain(123);
    });

    it("should handle duplicate numbers", () => {
      const result = parseCommaSeparatedNumbers("123,123,456,456");
      expect(result).toEqual([123, 123, 456, 456]);
    });

    it("should handle decimal numbers (converts to integer)", () => {
      const result = parseCommaSeparatedNumbers("123.5,456.7");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should not mutate input string", () => {
      const input = "123, 456, 789";
      const inputCopy = input;
      parseCommaSeparatedNumbers(input);
      expect(input).toBe(inputCopy);
    });

    it("should handle mixed spacing patterns", () => {
      const result = parseCommaSeparatedNumbers("123 , 456,789 , 999");
      expect(result).toContain(123);
      expect(result).toContain(456);
      expect(result).toContain(789);
      expect(result).toContain(999);
    });
  });

  describe("normalizeIdList", () => {
    it("returns undefined for undefined", () => {
      expect(normalizeIdList(undefined)).toBeUndefined();
    });

    it("returns undefined for null", () => {
      expect(normalizeIdList(null)).toBeUndefined();
    });

    it("returns undefined for empty string", () => {
      expect(normalizeIdList("")).toBeUndefined();
    });

    it("returns undefined for empty array", () => {
      expect(normalizeIdList([])).toBeUndefined();
    });

    it("returns undefined for a string with only invalid entries", () => {
      expect(normalizeIdList("abc,def")).toBeUndefined();
    });

    it("parses a comma-separated string into numbers", () => {
      expect(normalizeIdList("123,456,789")).toEqual([123, 456, 789]);
    });

    it("trims whitespace in comma-separated strings", () => {
      expect(normalizeIdList(" 123 , 456 ")).toEqual([123, 456]);
    });

    it("wraps a single number into an array", () => {
      expect(normalizeIdList(123)).toEqual([123]);
    });

    it("returns undefined for NaN number", () => {
      expect(normalizeIdList(NaN)).toBeUndefined();
    });

    it("accepts an array of numbers", () => {
      expect(normalizeIdList([123, 456])).toEqual([123, 456]);
    });

    it("accepts an array of numeric strings", () => {
      expect(normalizeIdList(["123", "456"])).toEqual([123, 456]);
    });

    it("accepts a mixed array of numbers and numeric strings", () => {
      expect(normalizeIdList([123, "456", 789])).toEqual([123, 456, 789]);
    });

    it("filters non-numeric entries from arrays", () => {
      expect(normalizeIdList([123, "abc", 456])).toEqual([123, 456]);
    });

    it("throws IdListError for an object", () => {
      expect(() => normalizeIdList({ id: 123 })).toThrow(IdListError);
    });

    it("throws IdListError for a boolean", () => {
      expect(() => normalizeIdList(true)).toThrow(IdListError);
    });

    it("throws IdListError with a descriptive message", () => {
      expect(() => normalizeIdList({ id: 123 })).toThrow(
        /number, comma-separated string, or array/i,
      );
    });
  });
});
