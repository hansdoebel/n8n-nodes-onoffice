import { describe, it, expect, mock, beforeEach } from "bun:test";
import { IPollFunctions } from "n8n-workflow";

mock.module("../../nodes/OnOffice/utils/apiRequest", () => ({
  apiRequest: mock(),
}));

import { OnOfficeTrigger } from "../../nodes/OnOfficeTrigger/OnOfficeTrigger.node";
import { apiRequest } from "../../nodes/OnOffice/utils/apiRequest";

type MockFn = ReturnType<typeof mock>;
const mockApiRequest = apiRequest as unknown as MockFn;

function buildResponse(elements: Array<Record<string, string>>) {
  return {
    status: { code: 200, errorcode: 0, message: "OK" },
    response: {
      results: [
        {
          actionid: "urn:onoffice-de-ns:smart:2.5:smartml:action:read",
          resourceid: "",
          resourcetype: "estate",
          cacheable: true,
          identifier: "",
          data: [
            {
              records: elements.map((e) => ({ elements: e })),
            },
          ],
          status: { errorcode: 0, message: "OK" },
        },
      ],
    },
  };
}

function buildPoll(
  params: Record<string, unknown>,
  mode: "manual" | "trigger",
  staticData: Record<string, unknown> = {},
): IPollFunctions {
  return {
    getMode: () => mode,
    getNodeParameter: (name: string, fallback?: unknown) => {
      if (name in params) return params[name];
      return fallback;
    },
    getNode: () => ({
      id: "t",
      name: "OnOffice Trigger",
      type: "n8n-nodes-onoffice.onOfficeTrigger",
      typeVersion: 1,
      position: [0, 0],
    }),
    getWorkflowStaticData: () => staticData,
    helpers: {
      returnJsonArray: (items: unknown) =>
        Array.isArray(items)
          ? items.map((item) => ({ json: item }))
          : [{ json: items }],
    },
  } as unknown as IPollFunctions;
}

describe("OnOfficeTrigger.poll", () => {
  let trigger: OnOfficeTrigger;

  beforeEach(() => {
    trigger = new OnOfficeTrigger();
    mockApiRequest.mockClear();
  });

  describe("estateCreated event", () => {
    it("requests estates sorted by Id DESC and always includes Id in data", async () => {
      mockApiRequest.mockResolvedValue(buildResponse([{ Id: "1001" }]));

      const ctx = buildPoll(
        {
          event: "estateCreated",
          limit: 25,
          estateFields: ["objektnr_extern", "ort"],
          additionalOptions: {},
        },
        "trigger",
        { lastSeen: "999" },
      );

      await trigger.poll.call(ctx);

      expect(mockApiRequest).toHaveBeenCalledTimes(1);
      const call = mockApiRequest.mock.calls[0][0];
      expect(call.resourceType).toBe("estate");
      expect(call.operation).toBe("read");
      expect(call.parameters.sortby).toBe("Id");
      expect(call.parameters.sortorder).toBe("DESC");
      expect(call.parameters.listlimit).toBe(25);
      expect(call.parameters.data).toEqual([
        "Id",
        "objektnr_extern",
        "ort",
      ]);
    });

    it("emits records with numerically greater Id than lastSeen", async () => {
      mockApiRequest.mockResolvedValue(
        buildResponse([{ Id: "11" }, { Id: "10" }, { Id: "9" }]),
      );

      const staticData: Record<string, unknown> = { lastSeen: "9" };
      const ctx = buildPoll(
        {
          event: "estateCreated",
          limit: 25,
          estateFields: ["objektnr_extern"],
          additionalOptions: {},
        },
        "trigger",
        staticData,
      );

      const result = await trigger.poll.call(ctx);

      expect(result).not.toBeNull();
      const ids = (result as Array<Array<{ json: { Id: string } }>>)[0].map(
        (i) => i.json.Id,
      );
      expect(ids.sort()).toEqual(["10", "11"]);
      expect(staticData.lastSeen).toBe("11");
    });

    it("establishes baseline on first poll (no lastSeen) and emits nothing", async () => {
      mockApiRequest.mockResolvedValue(
        buildResponse([{ Id: "11" }, { Id: "10" }]),
      );

      const staticData: Record<string, unknown> = {};
      const ctx = buildPoll(
        {
          event: "estateCreated",
          limit: 25,
          estateFields: ["objektnr_extern"],
          additionalOptions: {},
        },
        "trigger",
        staticData,
      );

      const result = await trigger.poll.call(ctx);

      expect(result).toBeNull();
      expect(staticData.lastSeen).toBe("11");
    });

    it("migrates legacy lastSeenDate into lastSeen on write", async () => {
      mockApiRequest.mockResolvedValue(buildResponse([{ Id: "20" }]));

      const staticData: Record<string, unknown> = { lastSeenDate: "5" };
      const ctx = buildPoll(
        {
          event: "estateCreated",
          limit: 25,
          estateFields: [],
          additionalOptions: {},
        },
        "trigger",
        staticData,
      );

      await trigger.poll.call(ctx);

      expect(staticData.lastSeen).toBe("20");
      expect(staticData.lastSeenDate).toBeUndefined();
    });
  });

  describe("estateUpdated event (regression)", () => {
    it("still sorts by geaendert_am DESC and uses string comparison", async () => {
      mockApiRequest.mockResolvedValue(
        buildResponse([
          { geaendert_am: "2026-04-23 10:00:00" },
          { geaendert_am: "2026-04-22 09:00:00" },
        ]),
      );

      const staticData: Record<string, unknown> = {
        lastSeen: "2026-04-22 12:00:00",
      };
      const ctx = buildPoll(
        {
          event: "estateUpdated",
          limit: 25,
          estateFields: ["objektnr_extern"],
          additionalOptions: {},
        },
        "trigger",
        staticData,
      );

      const result = await trigger.poll.call(ctx);

      const call = mockApiRequest.mock.calls[0][0];
      expect(call.parameters.sortby).toBe("geaendert_am");
      expect(call.parameters.sortorder).toBe("DESC");

      const emitted = (result as Array<Array<{ json: { geaendert_am: string } }>>)[0];
      expect(emitted).toHaveLength(1);
      expect(emitted[0].json.geaendert_am).toBe("2026-04-23 10:00:00");
    });
  });

  describe("addressCreated event (regression)", () => {
    it("still sorts by Eintragsdatum DESC", async () => {
      mockApiRequest.mockResolvedValue(
        buildResponse([{ Eintragsdatum: "2026-04-23 10:00:00", Name: "Doe" }]),
      );

      const ctx = buildPoll(
        {
          event: "addressCreated",
          limit: 25,
          addressFields: ["Vorname", "Name"],
          additionalOptions: {},
        },
        "trigger",
        { lastSeen: "2026-04-01 00:00:00" },
      );

      await trigger.poll.call(ctx);

      const call = mockApiRequest.mock.calls[0][0];
      expect(call.resourceType).toBe("address");
      expect(call.parameters.sortby).toBe("Eintragsdatum");
      expect(call.parameters.sortorder).toBe("DESC");
      expect(call.parameters.data).toEqual([
        "Eintragsdatum",
        "Vorname",
        "Name",
      ]);
    });
  });

  describe("manual mode", () => {
    it("fetches only 1 record and returns it regardless of lastSeen", async () => {
      mockApiRequest.mockResolvedValue(buildResponse([{ Id: "1" }]));

      const ctx = buildPoll(
        {
          event: "estateCreated",
          limit: 25,
          estateFields: [],
          additionalOptions: {},
        },
        "manual",
        {},
      );

      const result = await trigger.poll.call(ctx);

      const call = mockApiRequest.mock.calls[0][0];
      expect(call.parameters.listlimit).toBe(1);
      expect(result).not.toBeNull();
      expect((result as Array<Array<{ json: { Id: string } }>>)[0][0].json.Id).toBe("1");
    });
  });
});
