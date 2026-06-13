const KNOWN_CNPJ_COLUMNS = [
  "cnpj",
  "documento",
  "cpf_cnpj",
  "cnpj_empresa",
  "cnpj_da_empresa",
  "cnpj_fornecedor",
] as const;

type DetectCnpjColumnOptions = {
  override?: string;
};

export function detectCnpjColumn(
  headers: string[],
  options: DetectCnpjColumnOptions = {},
): string | null {
  if (options.override) {
    const normalizedOverride = normalizeHeader(options.override);

    return (
      headers.find(
        (header) => normalizeHeader(header) === normalizedOverride,
      ) ?? null
    );
  }

  for (const knownColumn of KNOWN_CNPJ_COLUMNS) {
    const match = headers.find(
      (header) => normalizeHeader(header) === knownColumn,
    );
    if (match) {
      return match;
    }
  }

  return null;
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
