import { IDataObject } from "n8n-workflow";

export interface PollStaticData extends IDataObject {
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

export function maxDate(
  records: IDataObject[],
  dateField: string,
): string | undefined {
  let max: string | undefined;
  for (const r of records) {
    const v = r[dateField];
    if (typeof v === "string" && (!max || v > max)) {
      max = v;
    }
  }
  return max;
}
