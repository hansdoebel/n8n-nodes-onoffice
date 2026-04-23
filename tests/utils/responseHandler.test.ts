import { describe, it, expect } from "bun:test";
import {
  extractResponseData,
  getApiResponseError,
  isApiResponseSuccess,
} from "../../nodes/OnOffice/utils/responseHandler";
import { fixtures } from "../__fixtures__/helpers";

describe("responseHandler", () => {
  describe("extractResponseData", () => {
    it("should extract data from successful API response", () => {
      const response = fixtures.relationSuccess();
      const result = extractResponseData(response);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("meta");
      expect(result).toHaveProperty("records");
    });

    it("should throw error when relation type is invalid", () => {
      const response = fixtures.relationErrorInvalidType();

      expect(() => {
        extractResponseData(response);
      }).toThrow("OnOffice API Error (132): No or unknown relation given");
    });

    it("should handle empty result data", () => {
      const response = fixtures.relationEmpty();
      const result = extractResponseData(response);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("meta");
    });

    it("should return empty array for null response", () => {
      const result = extractResponseData(null as any);
      expect(result).toEqual([]);
    });

    it("should return empty array for undefined response", () => {
      const result = extractResponseData(undefined as any);
      expect(result).toEqual([]);
    });

    it("should extract multiple data items from array response", () => {
      const response = fixtures.addressSuccess();
      const result = extractResponseData(response);

      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBeGreaterThan(0);
    });
  });

  describe("isApiResponseSuccess", () => {
    it("should return true for successful response with no errors", () => {
      const response = fixtures.relationSuccess();
      expect(isApiResponseSuccess(response)).toBe(true);
    });

    it("should return false for response with error code", () => {
      const response = fixtures.relationErrorInvalidType();
      expect(isApiResponseSuccess(response)).toBe(false);
    });

    it("should return true when errorcode is 0", () => {
      const response = fixtures.relationEmpty();
      expect(isApiResponseSuccess(response)).toBe(true);
    });
  });

  describe("getApiResponseError", () => {
    it("should return null for successful response", () => {
      const response = fixtures.relationSuccess();
      expect(getApiResponseError(response)).toBeNull();
    });

    it("should return error message from status for error responses", () => {
      const response = fixtures.relationErrorInvalidType();
      const error = getApiResponseError(response);

      expect(error).toBeDefined();
      expect(error).toContain("No or unknown relation given");
    });

    it("should return error message from status", () => {
      const response = fixtures.relationErrorInvalidType();
      const error = getApiResponseError(response);

      expect(error).toBe("No or unknown relation given");
    });

    it("should handle responses with errors array", () => {
      const response: any = {
        status: { errorcode: 0, message: "OK" },
        errors: ["Error 1", "Error 2"],
      };

      const error = getApiResponseError(response);
      expect(error).toContain("Error 1");
      expect(error).toContain("Error 2");
    });

    it("should handle responses with message field", () => {
      const response: any = {
        status: { errorcode: 0, message: "OK" },
        message: "Custom error message",
      };

      const error = getApiResponseError(response);
      expect(error).toBe("Custom error message");
    });
  });
});
