import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import { writeXlsxWorkbook } from "../../src/core/export/xlsx-writer";

describe("writeXlsxWorkbook", () => {
  it("writes a multi-sheet Excel delivery with summary, results, failures, divergences and audit", async () => {
    const bytes = await writeXlsxWorkbook({
      columns: ["empresa", "cnpj_normalizado", "status", "mensagem"],
      generatedAt: new Date("2026-05-20T12:00:00.000Z"),
      rows: [
        {
          cnpj_normalizado: "11222333000181",
          empresa: "Empresa A",
          mensagem: "",
          status: "SUCCESS",
        },
        {
          cnpj_normalizado: "123",
          empresa: "Empresa B",
          mensagem: "CNPJ invalido",
          status: "INVALID_CNPJ",
        },
      ],
      summary: {
        totalCnpjsEncontrados: 2,
        totalCnpjsRetomados: 0,
        totalCnpjsUnicosConsultados: 1,
        totalCnpjsValidos: 1,
        totalErros: 1,
        totalLinhas: 2,
        totalNaoOptantesSimples: 0,
        totalOptantesSimples: 1,
      },
    });

    expect(bytes.byteLength).toBeGreaterThan(1000);

    const workbook = new ExcelJS.Workbook();
    type ExcelJsLoadBuffer = Parameters<typeof workbook.xlsx.load>[0];
    const loadBuffer = Buffer.from(bytes) as unknown as ExcelJsLoadBuffer;
    await workbook.xlsx.load(loadBuffer);

    expect(workbook.worksheets.map((worksheet) => worksheet.name)).toEqual([
      "Resumo",
      "Resultados",
      "Falhas",
      "Divergencias",
      "Auditoria",
    ]);
    expect(workbook.getWorksheet("Resumo")?.getCell("A2").value).toBe(
      "Total de linhas",
    );
    expect(workbook.getWorksheet("Resumo")?.getCell("B2").value).toBe(2);
    expect(workbook.getWorksheet("Resultados")?.getCell("A2").value).toBe(
      "Empresa A",
    );
    expect(workbook.getWorksheet("Falhas")?.getCell("A2").value).toBe(
      "Empresa B",
    );
    expect(workbook.getWorksheet("Auditoria")?.getCell("B6").value).toBe("2");
  });
});
