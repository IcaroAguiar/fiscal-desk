import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import { readXlsx } from "../../src/core/ingestion/xlsx-reader";

describe("readXlsx", () => {
  it("reads the first non-empty worksheet into string records", async () => {
    const input = await createWorkbookBuffer([
      {
        name: "Vazia",
        rows: [],
      },
      {
        name: "Clientes",
        rows: [
          ["CNPJ", "Nome", "Ativo"],
          ["44.555.666/0001-81", "Empresa A", true],
          ["11.222.333/0001-81", "Empresa B", false],
        ],
      },
    ]);

    const result = await readXlsx(input);

    expect(result).toEqual({
      headers: ["CNPJ", "Nome", "Ativo"],
      rowLineNumbers: [2, 3],
      rows: [
        {
          Ativo: "true",
          CNPJ: "44.555.666/0001-81",
          Nome: "Empresa A",
        },
        {
          Ativo: "false",
          CNPJ: "11.222.333/0001-81",
          Nome: "Empresa B",
        },
      ],
      worksheetName: "Clientes",
    });
  });

  it("returns an empty result for a workbook without relevant rows", async () => {
    const input = await createWorkbookBuffer([
      {
        name: "Vazia",
        rows: [],
      },
    ]);

    await expect(readXlsx(input)).resolves.toEqual({
      headers: [],
      rowLineNumbers: [],
      rows: [],
      worksheetName: null,
    });
  });
});

async function createWorkbookBuffer(
  sheets: Array<{
    name: string;
    rows: Array<Array<boolean | string>>;
  }>,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);

    for (const row of sheet.rows) {
      worksheet.addRow(row);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}
