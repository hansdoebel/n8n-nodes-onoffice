import { IDataObject } from "n8n-workflow";

export type CompareMode = "string" | "numeric";

export interface PollStaticData extends IDataObject {
  lastSeen?: string;
  // Legacy key — read-only fallback so existing trigger instances keep their baseline across upgrades.
  lastSeenDate?: string;
}

export function extractRecords(
  responseData: IDataObject | IDataObject[],
): IDataObject[] {
  const wrappers = Array.isArray(responseData) ? responseData : [responseData];
  const records: IDataObject[] = [];
  for (const wrapper of wrappers) {
    const inner = (wrapper as { records?: unknown }).records;
    if (!Array.isArray(inner)) continue;
    for (const entry of inner) {
      if (entry && typeof entry === "object" && "elements" in entry) {
        const elements = (entry as { elements: unknown }).elements;
        if (elements && typeof elements === "object") {
          records.push(elements as IDataObject);
        }
      }
    }
  }
  return records;
}

export function isGreater(a: string, b: string, mode: CompareMode): boolean {
  if (mode === "numeric") {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isNaN(na) || Number.isNaN(nb)) return false;
    return na > nb;
  }
  return a > b;
}

export function maxValue(
  records: IDataObject[],
  field: string,
  mode: CompareMode,
): string | undefined {
  let max: string | undefined;
  for (const r of records) {
    const v = r[field];
    if (typeof v !== "string") continue;
    if (max === undefined || isGreater(v, max, mode)) {
      max = v;
    }
  }
  return max;
}
