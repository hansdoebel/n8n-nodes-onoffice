import { describe, it, expect } from "bun:test";
import { getRelationTypeOptions } from "../../nodes/OnOffice/utils/relationTypes";
import { RELATION_TYPES } from "../../nodes/OnOffice/utils/constants";

describe("relationTypes", () => {
  describe("getRelationTypeOptions", () => {
    it("should return an array of options", () => {
      const options = getRelationTypeOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it("should include all relation types from RELATION_TYPES map", () => {
      const options = getRelationTypeOptions();
      let totalTypesInMap = 0;

      for (const types of Object.values(RELATION_TYPES)) {
        totalTypesInMap += types.length;
      }

      expect(options.length).toBe(totalTypesInMap);
    });

    it("should have correct structure for each option", () => {
      const options = getRelationTypeOptions();

      options.forEach((option) => {
        expect(option).toHaveProperty("name");
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("description");
        expect(typeof option.name).toBe("string");
        expect(typeof option.value).toBe("string");
        expect(typeof option.description).toBe("string");
      });
    });

    it("should include category prefix in option names", () => {
      const options = getRelationTypeOptions();

      const optionsWithCategory = options.filter((opt) =>
        opt.name.includes("[")
      );
      expect(optionsWithCategory.length).toBe(options.length);
    });

    it("should have Estate & Address relations", () => {
      const options = getRelationTypeOptions();
      const estateAddressOptions = options.filter((opt) =>
        opt.name.includes("[Estate & Address]")
      );

      expect(estateAddressOptions.length).toBeGreaterThan(0);
      expect(estateAddressOptions.some((opt) => opt.name.includes("Buyer")))
        .toBe(
          true,
        );
      expect(estateAddressOptions.some((opt) => opt.name.includes("Tenant")))
        .toBe(
          true,
        );
      expect(estateAddressOptions.some((opt) => opt.name.includes("Owner")))
        .toBe(
          true,
        );
    });

    it("should have Estate & File relations", () => {
      const options = getRelationTypeOptions();
      const estateFileOptions = options.filter((opt) =>
        opt.name.includes("[Estate & File]")
      );

      expect(estateFileOptions.length).toBeGreaterThan(0);
      expect(
        estateFileOptions.some((opt) => opt.name.includes("All Files")),
      ).toBe(true);
      expect(
        estateFileOptions.some((opt) => opt.name.includes("Title Image")),
      ).toBe(true);
    });

    it("should have Address Relations", () => {
      const options = getRelationTypeOptions();
      const addressOptions = options.filter((opt) =>
        opt.name.includes("[Address Relations]")
      );

      expect(addressOptions.length).toBeGreaterThan(0);
      expect(addressOptions.some((opt) => opt.name.includes("Process"))).toBe(
        true,
      );
      expect(
        addressOptions.some((opt) => opt.name.includes("Offer/Angebot")),
      ).toBe(true);
    });

    it("should have Calendar Relations", () => {
      const options = getRelationTypeOptions();
      const calendarOptions = options.filter((opt) =>
        opt.name.includes("[Calendar Relations]")
      );

      expect(calendarOptions.length).toBeGreaterThan(0);
      expect(
        calendarOptions.some((opt) => opt.name.includes("Calendar Address")),
      ).toBe(true);
      expect(
        calendarOptions.some((opt) => opt.name.includes("Calendar Estate")),
      ).toBe(true);
    });

    it("should have Project Relations", () => {
      const options = getRelationTypeOptions();
      const projectOptions = options.filter((opt) =>
        opt.name.includes("[Project Relations]")
      );

      expect(projectOptions.length).toBeGreaterThan(0);
      expect(
        projectOptions.some((opt) => opt.name.includes("Project Address")),
      ).toBe(true);
      expect(
        projectOptions.some((opt) => opt.name.includes("Project Estate")),
      ).toBe(true);
    });

    it("should have all relation values as valid URNs", () => {
      const options = getRelationTypeOptions();

      options.forEach((option) => {
        expect(option.value).toMatch(/^urn:onoffice-de-ns:smart:/);
      });
    });

    it("should have unique relation values", () => {
      const options = getRelationTypeOptions();
      const values = options.map((opt) => opt.value);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(values.length);
    });

    it("should have non-empty descriptions for all options", () => {
      const options = getRelationTypeOptions();

      options.forEach((option) => {
        expect(option.description).toBeDefined();
        expect(option.description!.length).toBeGreaterThan(0);
      });
    });

    it("should have descriptive text about parent/child relationships", () => {
      const options = getRelationTypeOptions();
      const optionsWithParentChild = options.filter((opt) =>
        (opt.description && opt.description.includes("parent")) ||
        (opt.description && opt.description.includes("child"))
      );

      expect(optionsWithParentChild.length).toBeGreaterThan(0);
    });

    it("should format category prefix correctly with brackets", () => {
      const options = getRelationTypeOptions();

      options.forEach((option) => {
        const categoryMatch = option.name.match(/^\[(.+?)\]\s+/);
        expect(categoryMatch).not.toBeNull();
        expect(categoryMatch![1].length).toBeGreaterThan(0);
      });
    });
  });

  describe("RELATION_TYPES constant", () => {
    it("should have multiple categories", () => {
      const categories = Object.keys(RELATION_TYPES);
      expect(categories.length).toBeGreaterThan(10);
    });

    it("should have consistent structure across all categories", () => {
      for (const [_category, types] of Object.entries(RELATION_TYPES)) {
        expect(Array.isArray(types)).toBe(true);
        expect(types.length).toBeGreaterThan(0);

        types.forEach((type) => {
          expect(type).toHaveProperty("name");
          expect(type).toHaveProperty("value");
          expect(type).toHaveProperty("description");
          expect(typeof type.name).toBe("string");
          expect(typeof type.value).toBe("string");
          expect(typeof type.description).toBe("string");
          expect(type.name.length).toBeGreaterThan(0);
          expect(type.value.length).toBeGreaterThan(0);
          expect(type.description.length).toBeGreaterThan(0);
        });
      }
    });

    it("should have Estate & Address as a category", () => {
      expect(RELATION_TYPES).toHaveProperty("Estate & Address");
      expect(RELATION_TYPES["Estate & Address"].length).toBeGreaterThan(0);
    });

    it("should have all Estate & Address relation types", () => {
      const estateAddressTypes = RELATION_TYPES["Estate & Address"];
      const names = estateAddressTypes.map((t) => t.name);

      expect(names).toContain("Buyer");
      expect(names).toContain("Tenant/Renter");
      expect(names).toContain("Owner");
      expect(names).toContain("Interested/Prospective Buyer");
    });
  });
});
