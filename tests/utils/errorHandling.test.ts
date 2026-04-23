import { describe, it, expect, mock } from "bun:test";
import { IExecuteFunctions } from "n8n-workflow";
import {
  handleExecutionError,
  throwInvalidParameterError,
  throwMissingParameterError,
  throwValidationError,
} from "../../nodes/OnOffice/utils/errorHandling";

describe("errorHandling", () => {
  const mockContext = {
    getNode: mock(() => ({ name: "TestNode" })),
  } as unknown as IExecuteFunctions;

  describe("handleExecutionError", () => {
    it("should throw NodeOperationError with formatted message", () => {
      const error = new Error("Test error message");

      expect(() => {
        handleExecutionError(mockContext, error, {
          resource: "relation",
          operation: "get",
          itemIndex: 0,
        });
      }).toThrow(/Error executing get on relation/);
    });

    it("should include original error message in output", () => {
      const error = new Error("Original error");

      expect(() => {
        handleExecutionError(mockContext, error, {
          resource: "address",
          operation: "list",
          itemIndex: 0,
        });
      }).toThrow(/Original error/);
    });

    it("should handle error without context information", () => {
      const error = new Error("Generic error");

      expect(() => {
        handleExecutionError(mockContext, error);
      }).toThrow(/Error executing OnOffice operation/);
    });

    it("should include itemIndex in error context", () => {
      const error = new Error("Item error");

      expect(() => {
        handleExecutionError(mockContext, error, {
          resource: "estate",
          operation: "create",
          itemIndex: 5,
        });
      }).toThrow();
    });
  });

  describe("throwValidationError", () => {
    it("should throw NodeOperationError with validation message", () => {
      expect(() => {
        throwValidationError(
          mockContext,
          "Parent IDs are required",
          0,
        );
      }).toThrow(/Parent IDs are required/);
    });

    it("should throw without itemIndex", () => {
      expect(() => {
        throwValidationError(
          mockContext,
          "Invalid input",
        );
      }).toThrow(/Invalid input/);
    });

    it("should throw with custom validation message", () => {
      expect(() => {
        throwValidationError(
          mockContext,
          "Please provide either Parent IDs OR Child IDs, not both",
          2,
        );
      }).toThrow(/Please provide either Parent IDs OR Child IDs, not both/);
    });
  });

  describe("throwMissingParameterError", () => {
    it("should throw error for missing parameter", () => {
      expect(() => {
        throwMissingParameterError(mockContext, "relationtype", 0);
      }).toThrow(/Missing required parameter: relationtype/);
    });

    it("should include parameter name in error message", () => {
      expect(() => {
        throwMissingParameterError(mockContext, "email", 1);
      }).toThrow(/Missing required parameter: email/);
    });

    it("should throw without itemIndex", () => {
      expect(() => {
        throwMissingParameterError(mockContext, "apiKey");
      }).toThrow(/Missing required parameter: apiKey/);
    });
  });

  describe("throwInvalidParameterError", () => {
    it("should throw error for invalid parameter with reason", () => {
      expect(() => {
        throwInvalidParameterError(
          mockContext,
          "relationtype",
          "Unknown relation type provided",
          0,
        );
      }).toThrow(/Invalid parameter 'relationtype'/);
      expect(() => {
        throwInvalidParameterError(
          mockContext,
          "relationtype",
          "Unknown relation type provided",
          0,
        );
      }).toThrow(/Unknown relation type provided/);
    });

    it("should include both parameter name and reason", () => {
      expect(() => {
        throwInvalidParameterError(
          mockContext,
          "listlimit",
          "must be a positive number",
          1,
        );
      }).toThrow(/Invalid parameter 'listlimit'/);
      expect(() => {
        throwInvalidParameterError(
          mockContext,
          "listlimit",
          "must be a positive number",
          1,
        );
      }).toThrow(/must be a positive number/);
    });

    it("should throw without itemIndex", () => {
      expect(() => {
        throwInvalidParameterError(
          mockContext,
          "email",
          "not a valid email format",
        );
      }).toThrow(/Invalid parameter 'email'/);
    });

    it("should format error message correctly", () => {
      expect(() => {
        throwInvalidParameterError(
          mockContext,
          "sortorder",
          "must be 'ASC' or 'DESC'",
          3,
        );
      }).toThrow(/Invalid parameter 'sortorder': must be 'ASC' or 'DESC'/);
    });
  });
});
