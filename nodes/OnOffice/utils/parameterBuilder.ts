import { IDataObject } from "n8n-workflow";

export const COMMON_FIELDS = [
  "formatoutput",
  "listlimit",
  "listoffset",
  "sortby",
  "sortorder",
] as const;

export function extractDefinedFields(
  additionalFields: IDataObject,
  fieldNames: readonly string[] = COMMON_FIELDS,
): IDataObject {
  const result: IDataObject = {};

  for (const fieldName of fieldNames) {
    if (additionalFields[fieldName] !== undefined) {
      result[fieldName] = additionalFields[fieldName];
    }
  }

  return result;
}

export function parseCommaSeparatedStrings(input: string): string[] {
  if (!input || typeof input !== "string") {
    return [];
  }

  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function parseCommaSeparatedNumbers(input: string): number[] {
  if (!input || typeof input !== "string") {
    return [];
  }

  return input
    .split(",")
    .map((item) => item.trim())
    .map((item) => Number(item))
    .filter((num) => !isNaN(num));
}

export class IdListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IdListError";
  }
}

export function normalizeIdList(input: unknown): number[] | undefined {
  if (input === undefined || input === null || input === "") {
    return undefined;
  }

  let ids: number[];

  if (typeof input === "string") {
    ids = parseCommaSeparatedNumbers(input);
  } else if (typeof input === "number") {
    ids = isNaN(input) ? [] : [input];
  } else if (Array.isArray(input)) {
    ids = input
      .map((item) => (typeof item === "number" ? item : Number(item)))
      .filter((num) => !isNaN(num));
  } else {
    throw new IdListError(
      `Expected a number, comma-separated string, or array of IDs; got ${typeof input}.`,
    );
  }

  return ids.length > 0 ? ids : undefined;
}

export function buildParameters(
  baseParameters: IDataObject,
  additionalFields: IDataObject,
  commonFieldNames: readonly string[] = COMMON_FIELDS,
): IDataObject {
  const extractedFields = extractDefinedFields(
    additionalFields,
    commonFieldNames,
  );

  return {
    ...baseParameters,
    ...extractedFields,
  };
}
