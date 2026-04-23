import { describe, it, expect, mock, beforeEach } from "bun:test";
import { IExecuteFunctions } from "n8n-workflow";
import {
  extractBoolean,
  extractNumber,
  extractString,
} from "../../nodes/OnOffice/utils/parameterExtraction";

type MockFn = ReturnType<typeof mock>;

describe("parameterExtraction", () => {
  const mockExecuteFunctions = {
    getNodeParameter: mock(),
  } as unknown as IExecuteFunctions;

  beforeEach(() => {
    (mockExecuteFunctions.getNodeParameter as MockFn).mockClear();
  });

  describe("extractString", () => {
    it("should extract string parameter", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "test-value",
      );

      const result = extractString(mockExecuteFunctions, "testParam", 0, "");
      expect(result).toBe("test-value");
      expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith(
        "testParam",
        0,
        "",
      );
    });

    it("should convert non-string values to string", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        123,
      );

      const result = extractString(mockExecuteFunctions, "testParam", 0, "");
      expect(result).toBe("123");
    });

    it("should convert null to string", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        null,
      );

      const result = extractString(mockExecuteFunctions, "testParam", 0, "");
      expect(result).toBe("null");
    });

    it("should convert undefined to string", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        undefined,
      );

      const result = extractString(mockExecuteFunctions, "testParam", 0, "");
      expect(result).toBe("undefined");
    });

    it("should handle nested parameter paths", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "nested-value",
      );

      const result = extractString(
        mockExecuteFunctions,
        "additionalFields.parentids",
        0,
        "",
      );
      expect(result).toBe("nested-value");
      expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith(
        "additionalFields.parentids",
        0,
        "",
      );
    });

    it("should handle different itemIndex values", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "value",
      );

      extractString(mockExecuteFunctions, "testParam", 5, "");
      expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith(
        "testParam",
        5,
        "",
      );
    });

    it("should handle string with special characters", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "test@example.com",
      );

      const result = extractString(mockExecuteFunctions, "email", 0, "");
      expect(result).toBe("test@example.com");
    });

    it("should handle URN format strings", () => {
      const urnValue =
        "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        urnValue,
      );

      const result = extractString(mockExecuteFunctions, "relationtype", 0, "");
      expect(result).toBe(urnValue);
    });

    it("should use default value when getNodeParameter returns it", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "default-val",
      );

      const result = extractString(
        mockExecuteFunctions,
        "param",
        0,
        "default-val",
      );
      expect(result).toBe("default-val");
    });

    it("should handle empty string", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue("");

      const result = extractString(mockExecuteFunctions, "param", 0, "");
      expect(result).toBe("");
    });
  });

  describe("extractNumber", () => {
    it("should extract numeric parameter", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(123);

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(result).toBe(123);
      expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith(
        "testParam",
        0,
        0,
      );
    });

    it("should convert string to number", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "456",
      );

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(result).toBe(456);
    });

    it("should handle zero", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(0);

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(result).toBe(0);
    });

    it("should handle negative numbers", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        -456,
      );

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(result).toBe(-456);
    });

    it("should handle large numbers", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        999999999,
      );

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(result).toBe(999999999);
    });

    it("should convert decimal strings to number", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "123.45",
      );

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(result).toBe(123.45);
    });

    it("should handle NaN by converting to number", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "not-a-number",
      );

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(isNaN(result)).toBe(true);
    });

    it("should preserve itemIndex parameter", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(123);

      extractNumber(mockExecuteFunctions, "testParam", 3, 0);
      expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith(
        "testParam",
        3,
        0,
      );
    });

    it("should handle pagination parameters", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(50);

      const result = extractNumber(
        mockExecuteFunctions,
        "listlimit",
        0,
        100,
      );
      expect(result).toBe(50);
    });

    it("should convert null to 0", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        null,
      );

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(result).toBe(0);
    });

    it("should convert undefined to NaN", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        undefined,
      );

      const result = extractNumber(mockExecuteFunctions, "testParam", 0, 0);
      expect(isNaN(result)).toBe(true);
    });
  });

  describe("extractBoolean", () => {
    it("should extract boolean parameter as true", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        true,
      );

      const result = extractBoolean(
        mockExecuteFunctions,
        "testParam",
        0,
        false,
      );
      expect(result).toBe(true);
      expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith(
        "testParam",
        0,
        false,
      );
    });

    it("should extract boolean parameter as false", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        false,
      );

      const result = extractBoolean(mockExecuteFunctions, "testParam", 0, true);
      expect(result).toBe(false);
    });

    it("should convert truthy number to boolean", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(1);

      const result = extractBoolean(
        mockExecuteFunctions,
        "testParam",
        0,
        false,
      );
      expect(result).toBe(true);
    });

    it("should convert falsy number to boolean", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(0);

      const result = extractBoolean(mockExecuteFunctions, "testParam", 0, true);
      expect(result).toBe(false);
    });

    it("should convert truthy string to boolean", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "true",
      );

      const result = extractBoolean(
        mockExecuteFunctions,
        "testParam",
        0,
        false,
      );
      expect(result).toBe(true);
    });

    it("should convert falsy string to boolean", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        "false",
      );

      const result = extractBoolean(mockExecuteFunctions, "testParam", 0, true);
      expect(result).toBe(true);
    });

    it("should convert null to false", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        null,
      );

      const result = extractBoolean(mockExecuteFunctions, "testParam", 0, true);
      expect(result).toBe(false);
    });

    it("should convert undefined to false", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        undefined,
      );

      const result = extractBoolean(mockExecuteFunctions, "testParam", 0, true);
      expect(result).toBe(false);
    });

    it("should handle different itemIndex values", () => {
      (mockExecuteFunctions.getNodeParameter as MockFn).mockReturnValue(
        true,
      );

      extractBoolean(mockExecuteFunctions, "testParam", 7, false);
      expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith(
        "testParam",
        7,
        false,
      );
    });
  });
});
