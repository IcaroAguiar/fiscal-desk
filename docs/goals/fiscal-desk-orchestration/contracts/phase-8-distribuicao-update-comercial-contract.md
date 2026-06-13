# F8 Contract: Distribuicao, Update E Comercial

Updated: 2026-06-13

## Status

`approved_candidate`

Este contrato prepara a futura adocao fora do GitHub sem implementar release real, rede, updater, telemetria, licenca, empacotamento, assinatura, deploy ou UI nesta onda.

## Scope Boundary

Esta fase contrato-only define estados, regras e bloqueios para:

- distribuicao oficial e separacao entre core open source e marca oficial;
- update transparente e bloqueado ate existir canal, assinatura e metadata;
- consentimento local para telemetria opt-in;
- telemetria default-off com allowlist estrita;
- diagnostico local, sanitizado, revisavel e enviado manualmente;
- superficie comercial futura sem bloquear dados do usuario.

Fora de escopo nesta onda:

- qualquer download automatico;
- qualquer chamada de rede;
- `electron-updater`, assinatura, notarizacao, release metadata ou pipeline real;
- coleta automatica de telemetria;
- fluxo de licenca real, validacao externa ou conta obrigatoria;
- mudancas em renderer, main, core, package, lockfile ou configuracao de build.

## Distribution Contract

### Official Distribution Identity

- O app pode ter uma distribuicao oficial controlada pelo mantenedor.
- O core e o codigo aberto continuam conceitualmente separados da distribuicao oficial e da marca.
- Builds derivados nao devem se apresentar como canal oficial sem permissao explicita de marca.
- O contrato de marca deve ser documental antes de enforcement tecnico.

### Channel States

| State | Meaning | User-facing behavior |
|---|---|---|
| `local_only` | Build local ou interno sem canal oficial configurado | Nenhuma promessa de atualizacao automatica |
| `official_channel_pending` | Canal oficial planejado, mas sem decisao de release | Update permanece bloqueado |
| `official_unsigned` | Artefato oficial ainda sem assinatura valida | Download/update automatico proibido |
| `official_signed` | Artefato assinado e metadata validada | Elegivel a fase futura de updater real |
| `third_party_build` | Build de terceiro ou fork | Sem uso de marca/canal oficial por padrao |

## Update Contract

### Update Capability State

O update deve ser modelado como estado local, nao como acao automatica:

```ts
type UpdateCapabilityState =
  | "blocked_no_channel"
  | "blocked_unsigned"
  | "blocked_missing_metadata"
  | "blocked_user_disabled"
  | "check_available_manual"
  | "eligible_future_automatic";
```

### Minimum Metadata For Any Future Real Update

Antes de qualquer updater real, uma fase posterior precisa definir e revisar:

- canal oficial;
- origem da metadata;
- formato e schema da metadata;
- assinatura de artefato;
- verificacao de integridade;
- politica de rollback;
- UX de consentimento/adiamento;
- log sanitizado de falhas de update;
- plano de smoke em Windows com Chrome/Edge quando a release incluir Receita Web.

### Hard Blocks

Update real continua bloqueado enquanto qualquer item abaixo faltar:

- canal oficial aprovado;
- assinatura ou verificacao equivalente aprovada pelo release reviewer;
- metadata versionada e validavel;
- politica de rollback;
- security review da superficie de update;
- teste de falha segura sem instalar nada;
- decisao explicita do orquestrador para sair de contrato-only.

## Consent Contract

Consentimentos devem ser locais, reversiveis e granulares.

```ts
type ConsentKey =
  | "telemetry_basic_opt_in"
  | "diagnostic_package_manual_share"
  | "update_manual_check";

type ConsentState = {
  key: ConsentKey;
  granted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
  source: "user_action" | "migration_default_off";
};
```

Regras:

- todo consentimento nasce `false`;
- migracoes usam `migration_default_off`;
- revogacao deve parar novas coletas/acoes futuras;
- nenhuma revogacao pode apagar dados operacionais do usuario sem acao separada;
- consentimento de diagnostico vale por pacote/envio, nao como permissao permanente.

## Telemetry Contract

Telemetria e opt-in, desligada por padrao e sem dados fiscais identificaveis.

### Allowed Event Classes

| Event class | Allowed examples | Forbidden examples |
|---|---|---|
| `app_lifecycle` | app aberto, versao, plataforma, modo offline | caminho de arquivo, nome de usuario, host |
| `feature_usage` | provider selecionado como categoria, acao iniciada/cancelada | CNPJ, nome empresarial, resultado fiscal |
| `performance_summary` | duracao agregada, contagem de linhas em bucket | linha individual, documento individual |
| `error_summary` | codigo de erro canonico, boundary afetado | stack com path local, payload bruto, HTML bruto |

### Explicitly Forbidden In Telemetry

- CNPJ bruto, normalizado, hash reversivel ou lista de documentos;
- nomes de empresas, socios, usuarios ou clientes;
- resultados de Simples Nacional/SIMEI por documento;
- caminho local de arquivo;
- conteudo de CSV/XLSX;
- credenciais, cookies, tokens, headers sensiveis;
- HTML bruto, screenshot ou resposta bruta de provider;
- identificador persistente de maquina sem nova decisao de privacidade.

### Required Controls Before Implementation

- allowlist central de eventos e campos;
- redaction test;
- default-off migration test;
- UI/copy de consentimento;
- security review;
- prova de ausencia de rede quando desabilitada.

## Diagnostic Package Contract

Diagnostico deve ser um pacote local gerado sob demanda, revisavel pelo usuario e compartilhado manualmente.

### Package Contents

Permitido:

- versao do app e plataforma;
- provider selecionado como categoria;
- timestamps arredondados;
- contadores agregados;
- codigos de erro canonicos;
- estado de update como enum;
- estado de consentimento sem identificador pessoal;
- logs sanitizados por allowlist.

Proibido:

- CSV/XLSX de entrada ou saida;
- CNPJ, nome empresarial, dados fiscais e resultados por linha;
- HTML bruto, screenshots, dumps de browser ou responses de providers;
- caminhos absolutos locais;
- credenciais, tokens, cookies e headers;
- dados que permitam reconstruir lista de clientes do usuario.

### Review And Share Flow

1. Usuario solicita gerar pacote.
2. App monta pacote local em arquivo temporario.
3. App mostra sumario e caminho local.
4. Usuario revisa antes de qualquer envio.
5. Compartilhamento e manual fora do app ou por fluxo futuro explicitamente aprovado.

Nenhum diagnostico pode ser enviado automaticamente nesta fase.

## Commercial Contract

Monetizacao futura nao pode capturar nem bloquear dados existentes.

Permitido em fase futura:

- recursos Pro opcionais;
- suporte comercial;
- canal oficial assinado;
- providers pagos configurados pelo usuario;
- limites comerciais para features novas claramente separadas.

Proibido:

- bloquear exportacoes existentes;
- bloquear historico ja criado;
- impedir abertura/uso local basico por falta de conta;
- esconder dados do usuario atras de paywall;
- invalidar fluxo `mock` offline;
- transformar telemetria em requisito de uso.

## Release And Security Blockers

### Release Blockers

- Falta canal oficial aprovado.
- Falta assinatura/verificacao de artefato.
- Falta schema de metadata.
- Falta politica de rollback.
- Falta smoke de update sem instalacao real.
- Falta decisao de empacotamento Windows oficial.

### Security Blockers

- Qualquer telemetria default-on.
- Qualquer envio automatico de diagnostico.
- Qualquer log com dado fiscal identificavel.
- Qualquer HTML bruto, screenshot sensivel, credential material ou path local em pacote compartilhavel.
- Falta allowlist central antes de implementar telemetria/diagnostico.
- Falta gitleaks em PR material que toque release, diagnostico, logs ou telemetria.

## Integration Recommendation

Integrar este contrato como base documental F8 antes de qualquer worker de UI ou release. A proxima fase F8 segura pode ser:

1. `api-designer`: transformar estes enums e payloads em contrato local versionado, sem rede.
2. `security-reviewer`: revisar allowlist, redaction e proibicoes.
3. `release-reviewer`: revisar canal, assinatura e metadata antes de qualquer updater real.
4. `frontend-builder`: somente depois, expor estados bloqueados/transparente sem acionar update real.
