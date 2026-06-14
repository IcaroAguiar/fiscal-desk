import ExcelJS from "exceljs";

export type XlsxRow = Record<string, string>;

export type XlsxReadResult = {
  headers: string[];
  rowLineNumbers: number[];
  rows: XlsxRow[];
  worksheetName: string | null;
};

export async function readXlsx(
  input: Buffer | ArrayBuffer | Uint8Array,
): Promise<XlsxReadResult> {
  const workbook = new ExcelJS.Workbook();
  type ExcelJsLoadBuffer = Parameters<typeof workbook.xlsx.load>[0];

  await workbook.xlsx.load(
    normalizeInputBuffer(input) as unknown as ExcelJsLoadBuffer,
  );

  for (const worksheet of workbook.worksheets) {
    const parsedWorksheet = parseWorksheet(worksheet);

    if (parsedWorksheet) {
      return parsedWorksheet;
    }
  }

  return {
    headers: [],
    rowLineNumbers: [],
    rows: [],
    worksheetName: null,
  };
}

function normalizeInputBuffer(
  input: Buffer | ArrayBuffer | Uint8Array,
): Buffer {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (input instanceof ArrayBuffer) {
    return Buffer.from(input);
  }

  return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
}

function parseWorksheet(worksheet: ExcelJS.Worksheet): XlsxReadResult | null {
  const rows = collectNonEmptyRows(worksheet);
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    return null;
  }

  const headers = headerRow.values.map((value, index) => {
    const header = value.trim();

    return header.length > 0 ? header : `Coluna ${index + 1}`;
  });

  return {
    headers,
    rowLineNumbers: dataRows.map((row) => row.number),
    rows: dataRows.map((row) => {
      return headers.reduce<XlsxRow>((record, header, index) => {
        record[header] = row.values[index] ?? "";
        return record;
      }, {});
    }),
    worksheetName: worksheet.name,
  };
}

function collectNonEmptyRows(worksheet: ExcelJS.Worksheet): Array<{
  number: number;
  values: string[];
}> {
  const rows: Array<{ number: number; values: string[] }> = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = collectRowValues(row);

    if (values.some((value) => value.trim().length > 0)) {
      rows.push({
        number: rowNumber,
        values,
      });
    }
  });

  return rows;
}

function collectRowValues(row: ExcelJS.Row): string[] {
  const values: string[] = [];

  row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
    values[columnNumber - 1] = cellToString(cell);
  });

  return values;
}

function cellToString(cell: ExcelJS.Cell): string {
  const text = cell.text;

  if (text.length > 0) {
    return text;
  }

  const value = cell.value;

  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if ("result" in value && value.result !== undefined) {
      return String(value.result);
    }

    if ("text" in value && value.text !== undefined) {
      return String(value.text);
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("");
    }
  }

  return String(value);
}
