# Receita Web Consulta Optantes research - 2026-06-15

## Scope

Investigate the Receita Web flow currently used by Fiscal Desk for Consulta
Optantes do Simples Nacional and identify whether it can be replicated as a
faster, reliable API path.

Current app target:

- `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATBHE/ConsultaOptantes.app/ConsultarOpcao.html`
- Current page now redirects to `https://consopt.www8.receita.fazenda.gov.br/consultaoptantes`.

## Observed current flow

The old `ConsultarOpcao.html` page returns a meta refresh to the new
`consopt.www8.receita.fazenda.gov.br/consultaoptantes` app.

The new app renders a server-side HTML form:

- method: `POST`
- action: `/consultaoptantes`
- field: `Cnpj`
- hidden ASP.NET Core anti-forgery token
- session anti-forgery cookie
- hCaptcha widget on the submit button
- hCaptcha script loaded from `https://hcaptcha.com/1/api.js?recaptchacompat=off&hl=pt-BR`

No JSON API endpoint was visible from the static page. The observable contract is
a protected form post, not a public API.

## Security and automation implications

hCaptcha's documented flow sends a one-time user response token with the form,
and the server verifies it through hCaptcha's `siteverify` endpoint. Tokens are
intended to prove a human interaction and are short-lived / single-use.

Therefore, replicating the Receita form as a headless high-volume API would mean
automating a flow explicitly protected against automated abuse. That should not
be treated as a core batch provider.

Compliant implementation boundary:

- keep Receita Web as assisted/manual fallback;
- allow a human to solve the challenge in a visible browser;
- do not promise throughput or parallel batch reliability for this provider;
- prefer official data files or documented/public APIs for batch use.

## High-confidence alternative

For the exact fields Fiscal Desk needs from Consulta Optantes:

- optante pelo Simples Nacional;
- enquadrado no SIMEI;
- CNPJ basic identifier;
- official base date.

The better batch source is the Receita public file `Simples.zip` under the
official CNPJ open-data repository. It is official, downloadable, and suitable
for local indexing. It is not necessarily real-time; the app must display Data
da Base and freshness warning.

This gives higher batch reliability than scraping Consulta Optantes, with a
clear limitation: monthly/offline freshness instead of live portal state.

## Architecture recommendation

Provider tiers:

1. Base Publica Local official `Simples.zip`: default for batch speed and
   reliability after preparation.
2. CNPJa Open: online fallback when acceptable for the user.
3. Receita Web assisted: human-visible, low-volume validation/fallback only.
4. Receita Web parallel experimental: keep behind explicit warning and treat as
   best-effort; do not use for core readiness.

Do not implement a direct POST client to `/consultaoptantes` unless there is a
documented authorization path or explicit legal/product approval. Even then, the
client must preserve human challenge completion and cannot bypass hCaptcha.

## Sources

- Receita Consulta Optantes current app:
  `https://consopt.www8.receita.fazenda.gov.br/consultaoptantes`
- Legacy Receita URL used by the app:
  `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATBHE/ConsultaOptantes.app/ConsultarOpcao.html`
- Receita public file repository:
  `https://arquivos.receitafederal.gov.br/`
- hCaptcha developer guide:
  `https://docs.hcaptcha.com/`

## Verification performed

- Fetched legacy Consulta Optantes URL and confirmed meta refresh to the new
  app.
- Fetched the new Consulta Optantes HTML and confirmed protected form structure.
- Confirmed hCaptcha documentation requires user response token and server-side
  verification.
- Confirmed the Receita public file repository exposes the official
  `Simples.zip` used by Fiscal Desk's Base Publica Local path.
