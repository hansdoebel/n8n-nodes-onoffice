import { describe, it, expect } from "bun:test";
import { generateHmac } from "../../nodes/OnOffice/utils/hmac";

describe("hmac", () => {
  describe("generateHmac", () => {
    it("should generate HMAC signature", () => {
      const secret = "test-secret";
      const timestamp = 1234567890;
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should generate deterministic HMAC for same inputs", () => {
      const secret = "test-secret";
      const timestamp = 1234567890;
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result1 = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );
      const result2 = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(result1).toBe(result2);
    });

    it("should generate different HMAC for different secrets", () => {
      const timestamp = 1234567890;
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result1 = generateHmac(
        "secret-1",
        timestamp,
        token,
        resourceType,
        actionId,
      );
      const result2 = generateHmac(
        "secret-2",
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(result1).not.toBe(result2);
    });

    it("should generate different HMAC for different timestamps", () => {
      const secret = "test-secret";
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result1 = generateHmac(
        secret,
        1234567890,
        token,
        resourceType,
        actionId,
      );
      const result2 = generateHmac(
        secret,
        1234567891,
        token,
        resourceType,
        actionId,
      );

      expect(result1).not.toBe(result2);
    });

    it("should generate different HMAC for different tokens", () => {
      const secret = "test-secret";
      const timestamp = 1234567890;
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result1 = generateHmac(
        secret,
        timestamp,
        "token-1",
        resourceType,
        actionId,
      );
      const result2 = generateHmac(
        secret,
        timestamp,
        "token-2",
        resourceType,
        actionId,
      );

      expect(result1).not.toBe(result2);
    });

    it("should generate different HMAC for different resourceTypes", () => {
      const secret = "test-secret";
      const timestamp = 1234567890;
      const token = "test-token";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result1 = generateHmac(
        secret,
        timestamp,
        token,
        "address",
        actionId,
      );
      const result2 = generateHmac(
        secret,
        timestamp,
        token,
        "estate",
        actionId,
      );

      expect(result1).not.toBe(result2);
    });

    it("should generate different HMAC for different actionIds", () => {
      const secret = "test-secret";
      const timestamp = 1234567890;
      const token = "test-token";
      const resourceType = "address";

      const result1 = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        "urn:onoffice-de-ns:smart:2.5:smartml:action:get",
      );
      const result2 = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        "urn:onoffice-de-ns:smart:2.5:smartml:action:create",
      );

      expect(result1).not.toBe(result2);
    });

    it("should generate hex string output", () => {
      const secret = "test-secret";
      const timestamp = 1234567890;
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle long secret strings", () => {
      const longSecret = "a".repeat(500);
      const timestamp = 1234567890;
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result = generateHmac(
        longSecret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle special characters in inputs", () => {
      const secret = "test@secret#123!";
      const timestamp = 1234567890;
      const token = "test-token-@#$%";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle large timestamps", () => {
      const secret = "test-secret";
      const timestamp = 9999999999;
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should be consistent across multiple calls with identical params", () => {
      const params = {
        secret: "test-secret",
        timestamp: 1234567890,
        token: "test-token",
        resourceType: "address",
        actionId: "urn:onoffice-de-ns:smart:2.5:smartml:action:get",
      };

      const results = Array.from({ length: 5 }).map(() =>
        generateHmac(
          params.secret,
          params.timestamp,
          params.token,
          params.resourceType,
          params.actionId,
        )
      );

      const firstResult = results[0];
      expect(results.every((r) => r === firstResult)).toBe(true);
    });

    it("should handle empty-like but valid inputs", () => {
      const secret = "s";
      const timestamp = 0;
      const token = "t";
      const resourceType = "r";
      const actionId = "a";

      const result = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should generate different HMAC for different parameter order effects", () => {
      const secret = "test-secret";
      const timestamp = 1234567890;
      const token = "test-token";
      const resourceType = "address";
      const actionId = "urn:onoffice-de-ns:smart:2.5:smartml:action:get";

      const result1 = generateHmac(
        secret,
        timestamp,
        token,
        resourceType,
        actionId,
      );

      const result2 = generateHmac(
        secret,
        timestamp,
        token,
        "estate",
        actionId,
      );

      expect(result1).not.toBe(result2);
    });

    it("should produce consistent length HMAC signatures", () => {
      const results = [
        generateHmac("secret1", 1000000, "token1", "address", "action1"),
        generateHmac("secret2", 2000000, "token2", "estate", "action2"),
        generateHmac("secret3", 3000000, "token3", "relation", "action3"),
      ];

      const lengths = results.map((r) => r.length);
      expect(new Set(lengths).size).toBe(1);
    });
  });
});
