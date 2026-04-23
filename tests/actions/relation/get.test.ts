import { describe, it, expect, mock, beforeEach } from "bun:test";
import { IExecuteFunctions } from "n8n-workflow";

mock.module("../../../nodes/OnOffice/utils/apiRequest", () => ({
  apiRequest: mock(),
}));

import { getRelation } from "../../../nodes/OnOffice/actions/relation/get/execute";
import { apiRequest } from "../../../nodes/OnOffice/utils/apiRequest";
import relationSuccessResponse from "../../__fixtures__/api-responses/relation-success.json";
import relationEmptyResponse from "../../__fixtures__/api-responses/relation-empty.json";

type MockFn = ReturnType<typeof mock>;
const mockApiRequest = apiRequest as unknown as MockFn;

describe("OnOffice Relation Get Action", () => {
  let mockExecuteFunctions: IExecuteFunctions;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: mock(),
      getNode: mock(() => ({
        id: "test-node-id",
        name: "OnOffice",
        type: "n8n-nodes-onoffice.onoffice",
        typeVersion: 1,
        position: [0, 0],
      })),
      helpers: {
        returnJsonArray: (items: any) =>
          Array.isArray(items)
            ? items.map((item) => ({ json: item }))
            : [{ json: items }],
      },
    } as unknown as IExecuteFunctions;

    mockApiRequest.mockClear();
  });

  describe("Basic get operation with parentids", () => {
    it("should successfully get relation with parentids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          parentids: [123],
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty("meta");
      expect(result[0].json).toHaveProperty("records");
      expect(Array.isArray(result[0].json.records)).toBe(true);

      const records = result[0].json.records as any[];
      expect(records).toHaveLength(1);
      expect(records[0]).toEqual(
        expect.objectContaining({
          id: "relatedIds",
          type: "",
          elements: expect.objectContaining({
            "123": ["4535", "6755", "6411", "8661", "2534"],
          }),
        }),
      );
    });

    it("should handle multiple parentids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123,456,789";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          parentids: [123, 456, 789],
        },
      });

      expect(result).toHaveLength(1);
    });

    it("should handle parentids with spaces", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123, 456, 789";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          parentids: [123, 456, 789],
        },
      });

      expect(result).toHaveLength(1);
    });
  });

  describe("Basic get operation with childids", () => {
    it("should successfully get relation with childids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "";
        }
        if (paramName === "additionalFields.childids") {
          return "4535";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          childids: [4535],
        },
      });

      expect(result).toHaveLength(1);
    });

    it("should handle multiple childids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "";
        }
        if (paramName === "additionalFields.childids") {
          return "4535,6755,6411";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          childids: [4535, 6755, 6411],
        },
      });

      expect(result).toHaveLength(1);
    });
  });

  describe("Different relation types", () => {
    it("should handle estate-address buyer relation type", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          parentids: [123],
        },
      });

      expect(result).toHaveLength(1);
    });

    it("should handle estate-address renter relation type", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:renter";
        }
        if (paramName === "additionalFields.parentids") {
          return "123";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:renter",
          parentids: [123],
        },
      });

      expect(result).toHaveLength(1);
    });

    it("should handle address-estate matching relation type", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:address:estate:matching";
        }
        if (paramName === "additionalFields.parentids") {
          return "456";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:address:estate:matching",
          parentids: [456],
        },
      });

      expect(result).toHaveLength(1);
    });

    it("should handle project-address relation type", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:project:address";
        }
        if (paramName === "additionalFields.parentids") {
          return "999";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:project:address",
          parentids: [999],
        },
      });

      expect(result).toHaveLength(1);
    });
  });

  describe("Empty response handling", () => {
    it("should handle empty relation response", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "999";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationEmptyResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty("meta");
      expect(result[0].json).toHaveProperty("records");

      const records = result[0].json.records as any[];
      expect(records).toHaveLength(1);
      expect(records[0]).toEqual(
        expect.objectContaining({
          id: "relatedIds",
          type: "",
          elements: {},
        }),
      );
    });
  });

  describe("Validation errors", () => {
    it("should throw error when neither parentids nor childids are provided", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      await expect(getRelation.call(mockExecuteFunctions, 0)).rejects.toThrow(
        "Please provide either Parent IDs or Child IDs",
      );
    });

    it("should throw error when both parentids and childids are provided", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123";
        }
        if (paramName === "additionalFields.childids") {
          return "456";
        }
        return undefined;
      });

      await expect(getRelation.call(mockExecuteFunctions, 0)).rejects.toThrow(
        "Please provide either Parent IDs OR Child IDs, not both",
      );
    });
  });

  describe("Response data structure", () => {
    it("should verify correct response structure with related IDs", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(result).toHaveLength(1);
      expect(result[0].json).toHaveProperty("meta");
      expect(result[0].json).toHaveProperty("records");

      const records = result[0].json.records as any[];
      expect(records).toHaveLength(1);
      expect(records[0]).toHaveProperty("id", "relatedIds");
      expect(records[0]).toHaveProperty("type", "");
      expect(records[0]).toHaveProperty("elements");

      const elements = records[0].elements as any;
      expect(elements).toHaveProperty("123");
      expect(Array.isArray(elements["123"])).toBe(true);
      expect(elements["123"]).toHaveLength(5);
      expect(elements["123"]).toContain("4535");
      expect(elements["123"]).toContain("6755");
    });
  });

  describe("Edge cases", () => {
    it("should handle very large list of parentids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      const largeIdList = Array.from({ length: 100 }, (_, i) => i + 1).join(
        ",",
      );

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return largeIdList;
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: expect.objectContaining({
          parentids: expect.arrayContaining([1, 2, 3, 100]),
        }),
      });

      expect(result).toHaveLength(1);
    });

    it("should handle trailing comma in parentids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123,456,";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: expect.objectContaining({
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          parentids: expect.arrayContaining([123, 456]),
        }),
      });

      expect(result).toHaveLength(1);
    });

    it("should filter out invalid numbers from parentids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "relationtype") {
          return "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer";
        }
        if (paramName === "additionalFields.parentids") {
          return "123,abc,456,xyz";
        }
        if (paramName === "additionalFields.childids") {
          return "";
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(relationSuccessResponse);

      const result = await getRelation.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "idsfromrelation",
        operation: "get",
        parameters: {
          relationtype:
            "urn:onoffice-de-ns:smart:2.5:relationTypes:estate:address:buyer",
          parentids: [123, 456],
        },
      });

      expect(result).toHaveLength(1);
    });
  });
});
