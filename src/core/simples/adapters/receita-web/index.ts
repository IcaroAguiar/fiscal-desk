export {
  RECEITA_SELECTORS,
  RECEITA_TEXT_INDICATORS,
} from "./receita.selectors.js";
export type {
  ReceitaBrowserClientOptions,
  ReceitaNavigationResult,
} from "./receita-browser.client.js";
export { ReceitaBrowserClient } from "./receita-browser.client.js";
export { ReceitaConsultaOptantesAdapter } from "./receita-consulta-optantes.adapter.js";
export type {
  ReceitaWebDiagnostic,
  ReceitaWebDiagnosticCode,
} from "./receita-diagnostics.js";
export {
  createReceitaWebDiagnostic,
  createReceitaWebResult,
  RECEITA_WEB_DIAGNOSTIC_CODE,
  RECEITA_WEB_SOURCE,
} from "./receita-diagnostics.js";
export type { ParseReceitaResultInput } from "./receita-result.parser.js";
export { parseReceitaResult } from "./receita-result.parser.js";
