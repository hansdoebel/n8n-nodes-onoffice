import { describe, it, expect, mock, beforeEach } from "bun:test";
import { IExecuteFunctions } from "n8n-workflow";

mock.module("../../../nodes/OnOffice/utils/apiRequest", () => ({
  apiRequest: mock(),
}));

import { readEstate } from "../../../nodes/OnOffice/actions/estate/read/execute";
import { apiRequest } from "../../../nodes/OnOffice/utils/apiRequest";
import estateSuccessResponse from "../../__fixtures__/api-responses/estate-success.json";

type MockFn = ReturnType<typeof mock>;
const mockApiRequest = apiRequest as unknown as MockFn;

describe("OnOffice Estate Read Action", () => {
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

  describe("Basic read operation", () => {
    it("should successfully read estate with specific resourceid and fields", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return ["Id", "objektnr_extern", "strasse", "plz", "ort"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          data: ["Id", "objektnr_extern", "strasse", "plz", "ort"],
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
      expect(result[0].json).toEqual(
        expect.objectContaining({
          id: "1001",
          type: "estate",
          elements: expect.objectContaining({
            Id: "1001",
            objektnr_extern: "EST-2024-001",
            ort: "Berlin",
          }),
        }),
      );
    });

    it("should handle estate read without resourceid", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return ["Id", "objektnr_extern"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          data: ["Id", "objektnr_extern"],
        }),
        resourceId: undefined,
      });

      expect(result).toHaveLength(2);
    });

    it("should handle all available estate fields", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      const allFields = [
        "autoExpose",
        "benutzer",
        "einheit",
        "Id",
        "hausnummer",
        "nutzungsart",
        "objektart",
        "objektnr_extern",
        "objekttyp",
        "ort",
        "plz",
        "stammobjekt",
        "strasse",
        "vermarktungsart",
      ];

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return allFields;
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          data: allFields,
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
    });

    it("should handle empty parameters array", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return [];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          data: [],
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("Pagination and sorting", () => {
    it("should handle pagination parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return ["Id", "objektnr_extern"];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 50,
            listoffset: 10,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          listlimit: 50,
          listoffset: 10,
        }),
        resourceId: undefined,
      });

      expect(result).toHaveLength(2);
    });

    it("should handle sorting parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return ["Id", "ort"];
        }
        if (paramName === "additionalFields") {
          return {
            sortby: "ort",
            sortorder: "DESC",
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          sortby: "ort",
          sortorder: "DESC",
        }),
        resourceId: undefined,
      });

      expect(result).toHaveLength(2);
    });

    it("should handle sorting with ASC order", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return ["Id", "objektnr_extern"];
        }
        if (paramName === "additionalFields") {
          return {
            sortby: "objektnr_extern",
            sortorder: "ASC",
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          sortby: "objektnr_extern",
          sortorder: "ASC",
        }),
        resourceId: undefined,
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("Additional fields", () => {
    it("should handle formatoutput parameter as true", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return ["Id", "ort"];
        }
        if (paramName === "additionalFields") {
          return {
            formatoutput: true,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          formatoutput: true,
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
    });

    it("should handle formatoutput parameter as false", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return ["Id"];
        }
        if (paramName === "additionalFields") {
          return {
            formatoutput: false,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          formatoutput: false,
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
    });

    it("should handle addMobileUrl parameter as true", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return ["Id", "objektnr_extern"];
        }
        if (paramName === "additionalFields") {
          return {
            addMobileUrl: true,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          addMobileUrl: true,
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
    });

    it("should handle addMobileUrl parameter as false", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return ["Id"];
        }
        if (paramName === "additionalFields") {
          return {
            addMobileUrl: false,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          addMobileUrl: false,
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("Complex scenarios", () => {
    it("should handle complete request with all parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1001"];
        }
        if (paramName === "parameters") {
          return [
            "Id",
            "objektnr_extern",
            "strasse",
            "hausnummer",
            "plz",
            "ort",
            "objektart",
            "vermarktungsart",
          ];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 100,
            listoffset: 0,
            sortby: "objektnr_extern",
            sortorder: "ASC",
            formatoutput: true,
            addMobileUrl: true,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          data: [
            "Id",
            "objektnr_extern",
            "strasse",
            "hausnummer",
            "plz",
            "ort",
            "objektart",
            "vermarktungsart",
          ],
          listlimit: 100,
          listoffset: 0,
          sortby: "objektnr_extern",
          sortorder: "ASC",
          formatoutput: true,
          addMobileUrl: true,
        }),
        resourceId: "1001",
      });

      expect(result).toHaveLength(2);
      expect(result[0].json).toHaveProperty("id");
      expect(result[0].json).toHaveProperty("type", "estate");
      expect(result[0].json).toHaveProperty("elements");
    });

    it("should handle minimal request with no optional parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return [];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          data: [],
        }),
        resourceId: undefined,
      });

      expect(result).toHaveLength(2);
    });

    it("should verify response data structure for multiple estates", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return ["Id", "objektnr_extern", "ort", "vermarktungsart"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(result).toHaveLength(2);

      // Verify first estate
      expect(result[0].json).toEqual(
        expect.objectContaining({
          id: "1001",
          type: "estate",
          elements: expect.objectContaining({
            Id: "1001",
            objektnr_extern: "EST-2024-001",
            ort: "Berlin",
            vermarktungsart: "kauf",
          }),
        }),
      );

      // Verify second estate
      expect(result[1].json).toEqual(
        expect.objectContaining({
          id: "1002",
          type: "estate",
          elements: expect.objectContaining({
            Id: "1002",
            objektnr_extern: "EST-2024-002",
            ort: "München",
            vermarktungsart: "miete",
          }),
        }),
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle zero limit", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return ["Id"];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 0,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          listlimit: 0,
        }),
        resourceId: undefined,
      });

      expect(result).toHaveLength(2);
    });

    it("should handle maximum limit of 500", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return [];
        }
        if (paramName === "parameters") {
          return ["Id", "ort"];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 500,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          listlimit: 500,
        }),
        resourceId: undefined,
      });

      expect(result).toHaveLength(2);
    });

    it("should handle specific estate ID for single estate retrieval", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "resourceid") {
          return ["1002"];
        }
        if (paramName === "parameters") {
          return [
            "Id",
            "objektnr_extern",
            "strasse",
            "ort",
            "objekttyp",
          ];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(estateSuccessResponse);

      const result = await readEstate.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "estate",
        operation: "read",
        parameters: expect.objectContaining({
          data: [
            "Id",
            "objektnr_extern",
            "strasse",
            "ort",
            "objekttyp",
          ],
        }),
        resourceId: "1002",
      });

      expect(result).toHaveLength(2);
    });
  });
});
