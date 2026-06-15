# Fiscal Desk F9C2 - Official Download And Streaming Index

Status: `validated_reworked_review_approved_for_f9c2`

Data: 2026-06-14

## Escopo

F9C2 implementa o preparo assistido da Base Publica Local usando a fonte oficial
mensal `Simples.zip`, sem exigir que o usuario baixe o pacote completo
`cnpj.tar.gz`.

Este slice entrega:

- download local assistido e retomavel do `Simples.zip`;
- cache por competencia, nome, URL, data de publicacao e tamanho informado;
- validacao real do ZIP antes de reutilizar cache ou promover `.part`;
- parser streaming do CSV oficial sem cabecalho;
- registros consultaveis por CNPJ basico;
- preparo somente apos consentimento explicito;
- UI para buscar a fonte oficial e baixar/preparar a fonte encontrada.

Este slice nao entrega `Empresas*.zip`, `Estabelecimentos*.zip`, base completa,
servico remoto, banco incremental/chunked ou paralelismo da Receita Web.

## Mudancas

- `src/core/public-base/local-public-base.official-download.ts`
  baixa para `userData/public-base/downloads`, usa `.part`, metadata lateral e
  valida cache final/partial antes de aceitar.
- `src/core/public-base/local-public-base.official-zip.ts`
  abre `Simples.zip` com `yauzl`, encontra a entry `Simples.csv`, consome o
  conteudo e valida tamanho descompactado e CRC32.
- `src/core/public-base/local-public-base.official-source.ts`
  restringe descoberta para mesma origem, diretorio mensal esperado e arquivo
  `Simples.zip` sem `../`, query string ou hash.
- `src/core/public-base/local-public-base.official-simples.ts`
  parseia as linhas oficiais de Simples/SIMEI em streaming e cria registros por
  CNPJ basico com CNPJ matriz sintetico.
- `src/core/public-base/local-public-base.index.ts` e
  `src/core/public-base/local-public-base.store.ts`
  aceitam `cnpjBasico` e permitem lookup por CNPJ completo via raiz de 8
  digitos.
- IPC/preload/renderer expõem a acao de preparar a fonte oficial sem confiar em
  `source` vindo do renderer; o main redescobre a fonte e confere a competencia
  aceita antes de baixar.
- `README.md` e a spec F9 documentam o fluxo oficial assistido e seus limites.

## Evidencia

Validacao local aceita:

- `pnpm exec vitest run test/unit/local-public-base.test.ts test/unit/preload.test.ts test/unit/app-sync.test.ts test/unit/app-view.test.ts`: pass, 4 arquivos, 50 testes;
- `pnpm lint`: pass, 128 arquivos;
- `pnpm typecheck`: pass;
- `git diff --check`: pass;
- `pnpm test`: pass, 43 arquivos, 316 testes;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass em desktop, tablet e mobile sem overflow, botoes
  cortados ou sobreposicoes;
- `pnpm smoke:electron-ui`: pass, app Electron real, provider `mock`, CSV,
  XLSX, historico e checkpoint.

Cobertura qualitativa adicionada:

- ZIP invalido com metadata valida nao e reutilizado;
- ZIP estruturalmente aberto, mas com payload `Simples.csv` corrompido, nao e
  reutilizado;
- resposta de download com ZIP corrompido e rejeitada antes de promover `.part`;
- link mensal externo nao e seguido;
- `../Simples.zip` ou URL absoluta externa nao e aceita como fonte oficial;
- main valida consentimento, redescobre a fonte e compara `baseDate` antes de
  baixar/preparar.

## Review

Primeiro re-review independente retornou `Nao aprovar antes de ajustar`:

- P2: cache final ainda podia aceitar ZIP com entry aberta, mas payload
  corrompido, porque a validacao nao consumia conteudo nem conferia CRC;
- P3: descoberta oficial aceitava links fora da raiz oficial;
- P3: parser lia em streaming, mas a persistencia ainda materializava o indice
  inteiro.

Rework aplicado:

- `assertReadableOfficialSimplesZip` passou a consumir a entry inteira e
  validar tamanho descompactado e CRC32;
- download/cache passou a usar essa validacao para cache final e `.part`;
- descoberta passou a rejeitar origem diferente, caminho fora do diretorio
  mensal esperado, `../`, query string e hash;
- testes novos cobrem CRC corrompido, cache corrompido e source trust.

Segundo re-review independente (`019ec73e-745e-78a0-ae36-302098ae6910`)
retornou:

- `Sem findings P0-P3 bloqueantes`;
- P3 de persistencia inteira em JSON classificado como risco residual fora do
  escopo F9C2;
- focused verification do reviewer: 3 arquivos e 46 testes passando.

## Riscos Residuais

- A persistencia atual ainda materializa `records` em memoria e grava um JSON
  unico. Para bases maiores, uma persistencia incremental/chunked deve ser uma
  slice propria antes de prometer preparo robusto em volume amplo.
- A validacao local usa fixtures ZIP e fetch mockado; download real da Receita
  continua dependente da disponibilidade do endpoint no ambiente do usuario.
- `Simples.zip` e menor que o pacote completo, mas ainda pode ter centenas de
  megabytes. O app informa o tamanho e exige consentimento; medicao de espaco
  em disco e progresso detalhado de preparo seguem como follow-up.
- Receita Web continua assistida, serial e sujeita a CAPTCHA/bloqueio.

## Harness Warnings

- `dependency_file_change=3`: esperado por `yauzl` e `@types/yauzl`, usados
  diretamente para leitura streaming de ZIP oficial e cobertos por testes.
- `magic_string_boundary=13`: aceito como warn-only neste slice; os literais
  relevantes sao contratos IPC/action IDs, nomes oficiais de arquivo/metadata e
  fixtures de teste.
- `visual_surface_change=1`: esperado pela nova acao de preparar fonte oficial;
  coberto por `pnpm smoke:visual` e `pnpm smoke:electron-ui`.

## Integracao

Integrado na branch/worktree unica `feat/fiscal-desk-local-base-prep`.

Recomendacao: marcar F9C2 como aprovado e manter F9D2 e F9E pendentes.
