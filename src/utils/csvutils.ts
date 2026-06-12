import csv from "csv-parser";
import { Readable } from "stream";
import { createObjectCsvStringifier } from "csv-writer";

export const parseCsv = <T>(buffer: Buffer): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];

    Readable.from(buffer)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
        }),
      )
      .on("data", (row) => rows.push(row as T))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
};

export const generateCsv = (data: any[]) => {
  const csvWriter = createObjectCsvStringifier({
    header: [
      { id: "name", title: "NAME" },
      { id: "bio", title: "BIO" },
      { id: "nationality", title: "NATIONALITY" },
      { id: "created_at", title: "CREATED_AT" },
    ],
  });

  const csvHeader = csvWriter.getHeaderString();
  const csvBody = csvWriter.stringifyRecords(data);

  return csvHeader + csvBody;
};
