import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { PROCESS_CSV_INPUT_FORMAT } from "../../src/core/app/process-csv.types";
import { processCsv } from "../../src/core/app/process-csv.use-case";
import { FISCAL_EXPORT_DELIVERY_OPTION_ID } from "../../src/core/export/export-contract";
import {
  createLocalPublicBaseIndexFromRecords,
  prepareLocalPublicBaseFromCsv,
} from "../../src/core/public-base/local-public-base.index";
import { LocalPublicBaseSimplesLookupAdapter } from "../../src/core/simples/adapters/local-public-base-simples-lookup.adapter";
import { MockSimplesLookupAdapter } from "../../src/core/simples/adapters/mock-simples-lookup.adapter";
import type {
  SimplesLookupOptions,
  SimplesLookupPort,
} from "../../src/core/simples/simples-lookup.port";
import type { SimplesLookupResult } from "../../src/core/simples/simples-lookup.types";

class ErrorStatusLookupAdapter implements SimplesLookupPort {
  constructor(
    private readonly responseByCnpj: Record<string, SimplesLookupResult>,
  ) {}

  async lookup(
    cnpj: string,
    _options?: SimplesLookupOptions,
  ): Promise<SimplesLookupResult> {
    const response = this.responseByCnpj[cnpj];

    if (!response) {
      throw new Error(`Missing fixture for ${cnpj}`);
    }

    return response;
  }
}

class CountingSuccessLookupAdapter implements SimplesLookupPort {
  readonly calls: string[] = [];

  async lookup(
    cnpj: string,
    _options?: SimplesLookupOptions,
  ): Promise<SimplesLookupResult> {
    this.calls.push(cnpj);

    return {
      cnpj,
      simplesNacional: false,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    };
  }
}

describe("processCsv", () => {
  it("enriches rows, reuses duplicate lookups, and preserves original columns", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;00.000.000/0001-91",
      "Empresa B;00.000.000/0001-91",
      "Empresa C;12.345.678/0001-95",
      "Empresa D;123",
    ].join("\n");

    const provider = new MockSimplesLookupAdapter();

    const result = await processCsv(csv, provider);

    expect(result.summary.totalLinhas).toBe(4);
    expect(result.summary.totalCnpjsEncontrados).toBe(4);
    expect(result.summary.totalCnpjsValidos).toBe(3);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(2);
    expect(result.outputCsv).toContain("simples_nacional");
    expect(result.outputCsv).toContain(
      "Empresa A;00.000.000/0001-91;00.000.000/0001-91;00000000000191;Sim;Sim;Não;SUCCESS;mock;;2",
    );
    expect(result.outputCsv).toContain(
      "Empresa B;00.000.000/0001-91;00.000.000/0001-91;00000000000191;Sim;Sim;Não;SUCCESS;mock;CNPJ repetido. A consulta será reaproveitada da primeira ocorrência válida.;3",
    );
    expect(result.outputCsv).toContain(
      "Empresa C;12.345.678/0001-95;12.345.678/0001-95;12345678000195;Sim;Não;Não;SUCCESS;mock;;4",
    );
    expect(result.outputCsv).toContain(
      "Empresa D;123;123;123;Não;;;INVALID_CNPJ;system;CNPJ inválido. Revise os 14 dígitos antes de consultar esta linha.;5",
    );
    expect(result.delivery).toMatchObject({
      extension: "csv",
      format: "csv",
    });
    expect(result.outputXlsx).toBeNull();
  });

  it("uses the fiscal ingestion batch as the unique lookup handoff while preserving every output row", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;00.000.000/0001-91",
      "Empresa B;123",
      "Empresa A duplicada;00.000.000/0001-91",
      "Empresa C;12.345.678/0001-95",
    ].join("\n");
    const provider = new CountingSuccessLookupAdapter();

    const result = await processCsv(csv, provider);

    expect(provider.calls).toEqual(["00000000000191", "12345678000195"]);
    expect(result.summary).toMatchObject({
      totalLinhas: 4,
      totalCnpjsEncontrados: 4,
      totalCnpjsValidos: 3,
      totalCnpjsUnicosConsultados: 2,
    });
    expect(result.outputCsv).toContain(
      "Empresa B;123;123;123;Não;;;INVALID_CNPJ;system;CNPJ inválido. Revise os 14 dígitos antes de consultar esta linha.;3",
    );
    expect(result.outputCsv).toContain(
      "Empresa A duplicada;00.000.000/0001-91;00.000.000/0001-91;00000000000191;Sim;Não;Não;SUCCESS;mock;CNPJ repetido. A consulta será reaproveitada da primeira ocorrência válida.;4",
    );
  });

  it("keeps duplicate CNPJ visible when the reused lookup has a provider message", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;11.222.333/0001-81",
      "Empresa A duplicada;11.222.333/0001-81",
    ].join("\n");
    const provider = new ErrorStatusLookupAdapter({
      "11222333000181": {
        cnpj: "11222333000181",
        message: "CNPJ não encontrado na base consultada.",
        simplesNacional: null,
        simei: null,
        source: "mock",
        status: "NOT_FOUND",
      },
    });

    const result = await processCsv(csv, provider);

    expect(result.summary).toMatchObject({
      totalCnpjsEncontrados: 2,
      totalCnpjsUnicosConsultados: 1,
      totalErros: 2,
    });
    expect(result.outputCsv).toContain(
      "Empresa A;11.222.333/0001-81;11.222.333/0001-81;11222333000181;Sim;;;NOT_FOUND;mock;CNPJ não encontrado na base consultada.;2",
    );
    expect(result.outputCsv).toContain(
      "Empresa A duplicada;11.222.333/0001-81;11.222.333/0001-81;11222333000181;Sim;;;NOT_FOUND;mock;CNPJ repetido. A consulta será reaproveitada da primeira ocorrência válida. Resultado reaproveitado: CNPJ não encontrado na base consultada.;3",
    );
  });

  it("can generate an Excel delivery while preserving the CSV output contract", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;00.000.000/0001-91",
      "Empresa B;123",
    ].join("\n");

    const result = await processCsv(csv, new MockSimplesLookupAdapter(), {
      deliveryFormat: "xlsx",
    });

    expect(result.delivery).toMatchObject({
      extension: "xlsx",
      format: "xlsx",
    });
    expect(result.outputCsv).toContain("Empresa A");
    expect(result.outputXlsx?.byteLength).toBeGreaterThan(1000);
  });

  it("processes XLSX input through the fiscal ingestion core", async () => {
    const xlsx = await createXlsxBuffer([
      ["nome", "cpf_cnpj"],
      ["Empresa A", "00.000.000/0001-91"],
      ["Empresa B", "123"],
      ["Empresa A duplicada", "00.000.000/0001-91"],
      ["Empresa C", "12.345.678/0001-95"],
    ]);
    const provider = new CountingSuccessLookupAdapter();

    const result = await processCsv(
      {
        content: xlsx,
        format: PROCESS_CSV_INPUT_FORMAT.XLSX,
        sourceFileName: "entrada.xlsx",
      },
      provider,
    );

    expect(provider.calls).toEqual(["00000000000191", "12345678000195"]);
    expect(result.summary).toMatchObject({
      totalLinhas: 4,
      totalCnpjsEncontrados: 4,
      totalCnpjsValidos: 3,
      totalCnpjsUnicosConsultados: 2,
    });
    expect(result.outputCsv).toContain(
      "Empresa B;123;123;123;Não;;;INVALID_CNPJ;system;CNPJ inválido. Revise os 14 dígitos antes de consultar esta linha.;3",
    );
    expect(result.outputCsv).toContain(
      "Empresa A duplicada;00.000.000/0001-91;00.000.000/0001-91;00000000000191;Sim;Não;Não;SUCCESS;mock;CNPJ repetido. A consulta será reaproveitada da primeira ocorrência válida.;4",
    );
  });

  it("can resolve the current CSV delivery through the F6E1 delivery option id", async () => {
    const csv = ["nome;cpf_cnpj", "Empresa A;00.000.000/0001-91"].join("\n");

    const result = await processCsv(csv, new MockSimplesLookupAdapter(), {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
    });

    expect(result.delivery).toMatchObject({
      extension: "csv",
      format: "csv",
    });
    expect(result.outputCsv).toContain("Empresa A");
    expect(result.outputXlsx).toBeNull();
  });

  it("can resolve the current XLSX delivery through the F6E1 delivery option id", async () => {
    const csv = ["nome;cpf_cnpj", "Empresa A;00.000.000/0001-91"].join("\n");

    const result = await processCsv(csv, new MockSimplesLookupAdapter(), {
      deliveryOptionId:
        FISCAL_EXPORT_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
    });

    expect(result.delivery).toMatchObject({
      extension: "xlsx",
      format: "xlsx",
    });
    expect(result.outputCsv).toContain("Empresa A");
    expect(result.outputXlsx?.byteLength).toBeGreaterThan(1000);
  });

  it.each([
    {
      deliveryOptionId: "",
      message: "Opcao de entrega desconhecida.",
    },
    {
      deliveryOptionId: "unknown-delivery-option",
      message: "Opcao de entrega desconhecida.",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.NORMALIZED_WORKBOOK,
      message: "Opcao de entrega indisponivel",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.EXECUTIVE_PDF,
      message: "Opcao de entrega indisponivel",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.DETAILED_JSON,
      message: "Opcao de entrega indisponivel",
    },
  ])("rejects non-executable delivery option $deliveryOptionId before lookup", async ({
    deliveryOptionId,
    message,
  }) => {
    const csv = ["nome;cpf_cnpj", "Empresa A;00.000.000/0001-91"].join("\n");
    const provider = new CountingSuccessLookupAdapter();

    await expect(
      processCsv(csv, provider, {
        deliveryOptionId: deliveryOptionId as never,
      }),
    ).rejects.toThrow(message);
    expect(provider.calls).toEqual([]);
  });

  it("processes rows with the Base Pública Local provider and records Data da Base in the result", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Banco do Brasil;00.000.000/0001-91",
      "Nao encontrado;11.222.333/0001-81",
    ].join("\n");

    const prepared = prepareLocalPublicBaseFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "00000000000191;Banco do Brasil S.A.;sim;nao;2026-05-20",
      ].join("\n"),
      consent: {
        accepted: true,
        acceptedAt: "2026-06-13T00:00:00.000Z",
        baseDateAcknowledged: "2026-05-20",
        stalenessWarningAcknowledged:
          "A Base Pública Local pode estar defasada.",
      },
      sourceFileName: "base.csv",
      sourceFilePath: "/tmp/base.csv",
    });
    const result = await processCsv(
      csv,
      new LocalPublicBaseSimplesLookupAdapter(
        createLocalPublicBaseIndexFromRecords(prepared.records),
        prepared.status,
      ),
    );

    expect(result.summary.totalLinhas).toBe(2);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(2);
    expect(result.summary.totalOptantesSimples).toBe(1);
    expect(result.summary.totalErros).toBe(1);
    expect(result.outputCsv).toContain("SUCCESS;base-publica-local");
    expect(result.outputCsv).toContain(
      "Base Pública Local 2026-05-20: Banco do Brasil S.A.",
    );
    expect(result.outputCsv).toContain("NOT_FOUND;base-publica-local");
  });

  it("keeps tab-separated input and output aligned end to end", async () => {
    const csv = [
      "\uFEFFnome\tcpf_cnpj",
      "Empresa A\t00.000.000/0001-91",
      "Empresa B\t12.345.678/0001-95",
    ].join("\r\n");

    const provider = new MockSimplesLookupAdapter();

    const result = await processCsv(csv, provider);

    expect(result.summary.totalLinhas).toBe(2);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(2);
    expect(result.outputCsv.startsWith("nome\tcpf_cnpj\tcnpj_original")).toBe(
      true,
    );
    expect(result.outputCsv).toContain(
      "Empresa A\t00.000.000/0001-91\t00.000.000/0001-91\t00000000000191\tSim\tSim\tNão\tSUCCESS\tmock\t\t2",
    );
  });

  it("processes single-column input end to end", async () => {
    const csv = ["cnpj", "00.000.000/0001-91", "12.345.678/0001-95"].join("\n");

    const provider = new MockSimplesLookupAdapter();

    const result = await processCsv(csv, provider);

    expect(result.summary.totalLinhas).toBe(2);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(2);
    expect(result.outputCsv.startsWith("cnpj;cnpj_original")).toBe(true);
    expect(result.outputCsv).toContain(
      "00.000.000/0001-91;00.000.000/0001-91;00000000000191;Sim;Sim;Não;SUCCESS;mock;;2",
    );
  });

  it("ignores preamble lines before the actual csv header", async () => {
    const csv = [
      "Tabela 1",
      ";;;;;",
      "Código Fornecedor;Nome 1;CNPJ;Concat;EXT.TEXTO;Regime",
      "513441;PRESMET;23.843.196/0001-81;PRESMET;PRESMET;Normal",
      "513656;BRASIL TELERADIO;05.051.624/0001-51;BRASIL;BRASIL;Simples Nacional",
    ].join("\n");

    const provider = new MockSimplesLookupAdapter();

    const result = await processCsv(csv, provider);

    expect(result.summary.totalLinhas).toBe(2);
    expect(result.summary.totalCnpjsEncontrados).toBe(2);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(2);
    expect(result.outputCsv.startsWith("Código Fornecedor;Nome 1;CNPJ")).toBe(
      true,
    );
    expect(result.outputCsv).not.toContain("Tabela 1");
    expect(result.outputCsv).toContain(
      "513441;PRESMET;23.843.196/0001-81;PRESMET;PRESMET;Normal;23.843.196/0001-81;23843196000181;Sim;",
    );
    expect(result.outputCsv).toContain(
      "513656;BRASIL TELERADIO;05.051.624/0001-51;BRASIL;BRASIL;Simples Nacional;05.051.624/0001-51;05051624000151;Sim;",
    );
    expect(result.outputCsv).toContain(";mock;;4");
    expect(result.outputCsv).toContain(";mock;;5");
  });

  it("counts receita-web blocking and parsing statuses as errors in the summary", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;11.222.333/0001-81",
      "Empresa B;03.426.484/0001-23",
      "Empresa C;61.741.631/0001-56",
    ].join("\n");

    const provider = new ErrorStatusLookupAdapter({
      "11222333000181": {
        cnpj: "11222333000181",
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "BLOCKED",
        message: "Bloqueado pelo portal",
      },
      "03426484000123": {
        cnpj: "03426484000123",
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "CAPTCHA_REQUIRED",
        message: "CAPTCHA detectado",
      },
      "61741631000156": {
        cnpj: "61741631000156",
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "UNPARSABLE_RESULT",
        message: "Resposta não reconhecida",
      },
    });

    const result = await processCsv(csv, provider);

    expect(result.summary.totalErros).toBe(3);
    expect(result.outputCsv).toContain("BLOCKED");
    expect(result.outputCsv).toContain("CAPTCHA_REQUIRED");
    expect(result.outputCsv).toContain("UNPARSABLE_RESULT");
  });
});

async function createXlsxBuffer(rows: string[][]): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("entrada");

  for (const row of rows) {
    worksheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
