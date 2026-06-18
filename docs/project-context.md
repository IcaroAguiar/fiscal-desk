# Contexto do projeto

Este documento é o contexto público e versionado do projeto. Ele substitui a ideia de usar `CONTEXT.md` na raiz como fonte compartilhada.

`CONTEXT.md` na raiz deve continuar sendo nota local privada e ignorada pelo Git. Use-o para rascunhos, memória operacional e hipóteses ainda não curadas. Quando uma decisão ou regra precisar virar contrato público do repositório, consolide aqui, no `README.md`, em `docs/qa/first-release-validation.md` ou em um plano técnico específico.

## Identidade

O repositório ainda se chama `consulta-simples-csv`, mas o produto está evoluindo para **Fiscal Desk**.

O primeiro produto vendável continua sendo uma ferramenta desktop local para CNPJ em lote: entrada por planilha, validação, consulta de Simples Nacional/SIMEI, execução controlada e entrega profissional em CSV/XLSX.

Fiscal Desk permite expansão futura, mas o MVP não deve virar plataforma fiscal genérica.

## Promessa do produto

- App desktop local-first para usuários não técnicos.
- Processamento de arquivos locais sem backend obrigatório.
- Provedores explícitos, com limites e riscos visíveis.
- Privacidade por padrão: dados fiscais e planilhas do usuário ficam no computador.
- Entrega operacional simples, revisável e útil para conferência.
- Comunicação honesta sobre velocidade, bloqueio, fonte usada e frescor dos dados.

## Escopo atual

O app já cobre:

- leitura de CSV com header;
- leitura de XLSX simples com header;
- detecção ou configuração manual da coluna de CNPJ;
- normalização e validação de CNPJs;
- deduplicação por execução;
- consulta por `mock`, `base-publica-local`, `cnpja-open` ou `receita-web`;
- exportação CSV/XLSX com resultado;
- progresso, ETA, pausa cooperativa, cancelamento e retomada por histórico;
- builds unsigned Windows/macOS via GitHub Actions.

Fora do escopo atual, salvo pedido explícito:

- backend remoto;
- banco de dados remoto;
- SaaS/login/account;
- assinatura, notarização e updater real;
- telemetria real;
- licenciamento comercial;
- PDF/Word como entrega principal;
- OCR real;
- automação massiva da Receita Web.

## Arquitetura de alto nível

- `src/core`: domínio, aplicação, ingestão, exportação, providers, comparação e contratos.
- `src/core/simples`: porta de consulta, nomes, catálogo, configuração, saúde, fallback e adapters.
- `src/core/simples/adapters`: detalhes específicos de cada provider.
- `src/main`: processo Electron, preload, IPC, runtime e persistência local de execução.
- `src/renderer`: interface mínima e operacional.
- `scripts`: smokes, e2e, comparação assistida e utilitários de build.
- `test`: unitários, integração e fixtures sintéticas.

A regra principal é preservar `porta + adapters`: o fluxo de aplicação deve depender do contrato de consulta, não de detalhes de Receita Web, CNPJá, Base Pública Local ou mock.

## Provedores

### `mock`

Provider offline padrão. Deve continuar funcionando sempre para desenvolvimento, testes e smokes determinísticos.

### `base-publica-local`

Caminho recomendado para volume. Exige preparo explícito da base no computador do usuário e deve comunicar data/frescor da base. Durante a execução, consulta localmente sem depender de rede.

### `cnpja-open`

Provider online útil para validar fluxo real, mas sujeito a rede, disponibilidade e rate limit. Não é promessa de throughput de produção.

### `receita-web`

Modo assistido e experimental para Consulta Optantes no portal da Receita. Abre navegador visível, exige supervisão humana e pode parar por CAPTCHA, bloqueio ou mudança do site. Use para amostras, divergências ou conferência, não como motor padrão de volume.

## Vocabulário recomendado

- Use **Lista de CNPJs** para o conjunto consultado.
- Use **Entrada de Consulta** para o arquivo ou conteúdo fornecido pelo usuário.
- Use **Resultado Simples** para a resposta consolidada de Simples Nacional/SIMEI.
- Use **Entrega de Resultado** para o arquivo final gerado ao usuário.
- Use **Provedor** para a fonte de dados ou caminho de consulta.
- Use **Perfil Operacional** para a escolha orientada ao usuário que equilibra velocidade, custo, frescor e risco.
- Use **Base Pública Local** para a cópia local preparada de dados públicos.
- Use **Confirmação Receita Web** para validação assistida no portal, não para automação principal.

Evite linguagem interna como "scrape", "payload", "dump", "robô", "cache" ou "regex simples" em superfícies voltadas ao usuário.

## Privacidade e publicação

Não versione:

- CNPJs reais de cliente;
- nomes de empresas extraídos de planilhas reais;
- screenshots com dados reais;
- logs completos de execução;
- tokens, cookies, chaves ou credenciais;
- outputs gerados por smokes, QA, builds ou agentes;
- relatórios operacionais extensos sem curadoria.

Use fixtures sintéticas em `test/fixtures/` para validação versionada.

## Validação

Para mudança de documentação, no mínimo:

```bash
git diff --check
```

Para mudança de código, escolha a menor matriz que prove a superfície tocada:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm smoke:real-csv
pnpm smoke:electron-ui
pnpm smoke:visual
pnpm test:e2e
```

A matriz completa de release fica em `docs/qa/first-release-validation.md`.

## Release

O workflow `Desktop unsigned builds` gera artifacts Windows/macOS para tags `v*` ou `workflow_dispatch`.

Ele não publica GitHub Release sozinho, não assina, não notariza e não habilita updater real. Para publicar, é necessário criar ou atualizar a release manualmente ou por automação explícita anexando os artifacts verificados.
