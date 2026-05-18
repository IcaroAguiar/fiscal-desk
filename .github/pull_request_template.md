## Resumo

-

## Classificação do PR

- [ ] Material: código, testes, comportamento, UI, build, providers, credenciais, persistência, auto-update ou distribuição.
- [ ] Não material: docs/processo/metadata sem efeito em runtime.

Justificativa se não material:

-

## Validação

- [ ] Teste focado:
- [ ] Typecheck/build relevante:
- [ ] Smoke/caminho real afetado:
- [ ] Evidência visual, quando aplicável:
- [ ] Checks pulados e risco residual:

## Agentic Code Review

- [ ] Packet determinístico gerado com:

```bash
node ~/.agents/skills/agentic-code-review/scripts/collect-review-context.mjs
```

- [ ] Reviewer independente capaz acionado para mudança material:
- [ ] Status do reviewer:
- [ ] Todos os findings acionáveis foram corrigidos ou justificados tecnicamente.
- [ ] O packet determinístico foi tratado como evidência, não como aprovação.
- [ ] Spark/executor barato não foi usado como reviewer aprovador.

Se o reviewer independente não rodou em PR material, declarar explicitamente:

> O deterministic packet pode estar limpo, mas o gate `agentic-code-review` está incompleto porque o reviewer independente não rodou.

## Riscos

-

## Observações

-
