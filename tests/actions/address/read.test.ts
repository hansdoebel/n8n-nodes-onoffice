import { describe, it, expect, mock, beforeEach } from "bun:test";
import { IExecuteFunctions } from "n8n-workflow";

mock.module("../../../nodes/OnOffice/utils/apiRequest", () => ({
  apiRequest: mock(),
}));

import { readAddress } from "../../../nodes/OnOffice/actions/address/read/execute";
import { apiRequest } from "../../../nodes/OnOffice/utils/apiRequest";
import addressSuccessResponse from "../../__fixtures__/api-responses/address-success.json";

type MockFn = ReturnType<typeof mock>;
const mockApiRequest = apiRequest as unknown as MockFn;

describe("OnOffice Address Read Action", () => {
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
    it("should successfully read address with specific recordids and fields", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123,124";
        }
        if (paramName === "parameters") {
          return ["Name", "Vorname", "Email", "Telefon1"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          recordids: ["123", "124"],
          data: ["Name", "Vorname", "Email", "Telefon1"],
        }),
      });

      expect(result).toHaveLength(2);
      expect(result[0].json).toEqual(
        expect.objectContaining({
          id: "123",
          type: "address",
          elements: expect.objectContaining({
            email: "john.doe@example.com",
          }),
        }),
      );
    });

    it("should handle single recordid", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123";
        }
        if (paramName === "parameters") {
          return ["Name", "Email"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          recordids: ["123"],
          data: ["Name", "Email"],
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should handle empty recordids", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "";
        }
        if (paramName === "parameters") {
          return ["Name", "Email"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          recordids: [],
          data: ["Name", "Email"],
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should handle all available fields", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      const allFields = [
        "Anrede-Titel",
        "Benutzer",
        "Email",
        "Eintragsdatum",
        "Zusatz1",
        "Geschlecht",
        "HerkunftKontakt",
        "Homepage",
        "contactCategory",
        "Land",
        "letzter_Kontakt",
        "Name",
        "Ort",
        "Plz",
        "Strasse",
        "Telefon1",
        "Telefon2",
        "Vorname",
      ];

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123";
        }
        if (paramName === "parameters") {
          return allFields;
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          recordids: ["123"],
          data: allFields,
        }),
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("Pagination and sorting", () => {
    it("should handle pagination parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "";
        }
        if (paramName === "parameters") {
          return ["Name", "Email"];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 100,
            listoffset: 50,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          listlimit: 100,
          listoffset: 50,
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should handle sorting parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "";
        }
        if (paramName === "parameters") {
          return ["Name", "Email"];
        }
        if (paramName === "additionalFields") {
          return {
            sortby: "Name",
            sortorder: "DESC",
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          sortby: "Name",
          sortorder: "DESC",
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should handle sorting with ASC order", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "";
        }
        if (paramName === "parameters") {
          return ["Name"];
        }
        if (paramName === "additionalFields") {
          return {
            sortby: "Eintragsdatum",
            sortorder: "ASC",
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          sortby: "Eintragsdatum",
          sortorder: "ASC",
        }),
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("Additional fields", () => {
    it("should handle formatoutput parameter", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123";
        }
        if (paramName === "parameters") {
          return ["Name", "Email"];
        }
        if (paramName === "additionalFields") {
          return {
            formatoutput: true,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          formatoutput: true,
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should handle formatoutput as false", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123";
        }
        if (paramName === "parameters") {
          return ["Name", "Email"];
        }
        if (paramName === "additionalFields") {
          return {
            formatoutput: false,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          formatoutput: false,
        }),
      });

      expect(result).toHaveLength(2);
    });
  });

  describe("Complex scenarios", () => {
    it("should handle complete request with all parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123,124,125";
        }
        if (paramName === "parameters") {
          return [
            "Name",
            "Vorname",
            "Email",
            "Telefon1",
            "Strasse",
            "Plz",
            "Ort",
          ];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 20,
            listoffset: 0,
            sortby: "Name",
            sortorder: "ASC",
            formatoutput: true,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          recordids: ["123", "124", "125"],
          data: [
            "Name",
            "Vorname",
            "Email",
            "Telefon1",
            "Strasse",
            "Plz",
            "Ort",
          ],
          listlimit: 20,
          listoffset: 0,
          sortby: "Name",
          sortorder: "ASC",
          formatoutput: true,
        }),
      });

      expect(result).toHaveLength(2);
      expect(result[0].json).toHaveProperty("id");
      expect(result[0].json).toHaveProperty("type", "address");
      expect(result[0].json).toHaveProperty("elements");
    });

    it("should handle minimal request with no optional parameters", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "";
        }
        if (paramName === "parameters") {
          return [];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          recordids: [],
          data: [],
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should verify response data structure", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123";
        }
        if (paramName === "parameters") {
          return ["Name", "Vorname", "Email"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(result).toHaveLength(2);

      // Verify first record
      expect(result[0].json).toEqual(
        expect.objectContaining({
          id: "123",
          type: "address",
          elements: expect.objectContaining({
            salutation: "Mr.",
            firstname: "John",
            lastname: "Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            company: "Acme Corp",
          }),
        }),
      );

      // Verify second record
      expect(result[1].json).toEqual(
        expect.objectContaining({
          id: "124",
          type: "address",
          elements: expect.objectContaining({
            salutation: "Ms.",
            firstname: "Jane",
            lastname: "Smith",
            email: "jane.smith@example.com",
            phone: "+1234567891",
            company: "Tech Solutions",
          }),
        }),
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle recordids with spaces", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "123, 124 , 125";
        }
        if (paramName === "parameters") {
          return ["Name"];
        }
        if (paramName === "additionalFields") {
          return {};
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          recordids: ["123", "124", "125"],
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should handle zero limit", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "";
        }
        if (paramName === "parameters") {
          return ["Name"];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 0,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          listlimit: 0,
        }),
      });

      expect(result).toHaveLength(2);
    });

    it("should handle maximum limit of 500", async () => {
      const mockGetNodeParameter = mockExecuteFunctions
        .getNodeParameter as MockFn;

      mockGetNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === "recordids") {
          return "";
        }
        if (paramName === "parameters") {
          return ["Name"];
        }
        if (paramName === "additionalFields") {
          return {
            listlimit: 500,
          };
        }
        return undefined;
      });

      (apiRequest as MockFn).mockResolvedValue(addressSuccessResponse);

      const result = await readAddress.call(mockExecuteFunctions, 0);

      expect(apiRequest).toHaveBeenCalledWith({
        resourceType: "address",
        operation: "read",
        parameters: expect.objectContaining({
          listlimit: 500,
        }),
      });

      expect(result).toHaveLength(2);
    });
  });
});
