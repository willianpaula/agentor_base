# Entrega — task #26: Busca lexical de referência

| Campo | Valor |
|---|---|
| Frente | B |
| Estimativa | 2,5 h |
| Objetivo | Encontrar trechos relevantes por comparação de palavras, como referência simples para medir o resultado |
| Artefato | Busca do [`@agentor/knowledge-fs`](../../packages/knowledge/knowledge-fs/src/index.ts), casos em [`tests/busca-lexical/`](../../tests/busca-lexical/casos.json) e o teste [`busca-lexical.test.ts`](../../tests/unit/busca-lexical.test.ts) |

## Como a busca funciona

A busca já existia no provider de pasta local, `@agentor/knowledge-fs`, usado pela tool `knowledge_search`. Esta task a fixa como referência, com casos e resultados salvos.

1. A consulta vira termos: minúsculas, sem acentos, só palavras com 3 letras ou mais, sem stopwords ("como", "onde", "qual"...).
2. Cada documento é dividido em seções Markdown (título e corpo). Um título sem corpo é juntado à seção seguinte.
3. Cada seção recebe um score de 0 a 1: 90% pela fração dos termos presentes e 10% pela repetição deles.
4. Cada documento devolve no máximo a sua melhor seção. Os resultados saem em ordem de score, no máximo 5.
5. Se nenhum termo casar, o resultado é vazio, e a tool responde "Nenhum trecho encontrado na base de conhecimento do cliente.".

Os casos rodam pelo mesmo caminho da tool (`ctx.knowledge.search` → `knowledge-fs`), com a mesma fonte declarada no patch do cliente `exemplo`, sobre os documentos fictícios em `config/clients/exemplo/conhecimento/`.

## Critérios de aceite e evidências

| # | Critério | Evidência |
|---|---|---|
| 1 | A busca devolve o trecho com identificador e origem | Cada trecho traz `sourceId` (fonte: `exemplo-manual`), `documentId` (documento: `manual-do-estagiario.md`), `title`, `excerpt` e `score` ([contrato `KnowledgeHit`](../../packages/knowledge/knowledge/src/index.ts)). O texto que o modelo recebe cita os dois: `(fonte: exemplo-manual, documento: manual-do-estagiario.md)`. Veja [`positivo.json`](../../tests/busca-lexical/resultados/positivo.json) |
| 2 | Um teste positivo encontra o trecho adequado | Consulta "Onde retiro o crachá no primeiro dia?" → seção "Primeiro dia" do manual, score 0,69, com "recebe o crachá na recepção". O teste confere ainda que o trecho existe literalmente no documento citado |
| 3 | Um teste negativo retorna ausência, sem inventar texto ou fonte | Consulta "Como peço reembolso de transporte?" → zero trechos, zero falhas e o texto "Nenhum trecho encontrado na base de conhecimento do cliente.", sem `fonte:` nem `documento:`. Veja [`negativo.json`](../../tests/busca-lexical/resultados/negativo.json) |
| 4 | As entradas e saídas dos dois testes estão salvas para revisão | [`tests/busca-lexical/resultados/`](../../tests/busca-lexical/resultados/): um JSON por caso com o caso, a entrada (consulta, limite e fonte) e a saída (trechos, falhas e texto para o modelo). O teste roda `pnpm busca-lexical --check` e falha se o salvo divergir da execução atual. Controle: com o score do positivo alterado à mão no arquivo salvo, o teste falhou |

## Limitação registrada (não é critério)

A consulta "Qual é o plano de saúde dos estagiários?" devolve 2 trechos sem relação, com score 0,30: no manual casa "plano" (de "plano de estudos") e na política casa "estagiários" (do título "resumo para estagiários"); cada trecho cobre 1 dos 3 termos. A busca compara palavras, não sentido. O caso fica salvo em [`limitacao-plano-de-saude.json`](../../tests/busca-lexical/resultados/limitacao-plano-de-saude.json) como linha de base para comparar com a busca semântica do roadmap. No teste com Gemini (14/11) o modelo não usou esses trechos e declarou a ausência ([registro](../registro-execucao.md#teste-com-llm-real-gemini)).

## Como revisar

Em um clone com as dependências instaladas (`pnpm install --frozen-lockfile`):

```bash
pnpm busca-lexical --check
```

```bash
pnpm verify
```

Esperado: o primeiro lista `positivo: 1 trecho(s) [igual]`, `negativo: 0 trecho(s) [igual]` e `limitacao-plano-de-saude: 2 trecho(s) [igual]`; o segundo termina com 29 testes, 29 passando. Para testar outra consulta, acrescente um caso em `casos.json`, rode `pnpm busca-lexical` e leia o JSON gerado.

## Como foi verificado

2026-11-18, Windows 11 Pro, Node 24.21.0, pnpm 10.28.0:

- `pnpm busca-lexical` gerou os três resultados; `--check` em seguida: todos `igual`.
- `pnpm verify`: typecheck ok; 29 testes, 29 passaram (26 anteriores e 3 novos).
- Controle negativo do teste de evidência descrito no critério 4.

## A preencher

| Campo | Valor |
|---|---|
| Responsável | [willianpaula](https://github.com/willianpaula) |
| Revisor | |
| Dependências e alternativa com dados simulados | Nenhuma dependência externa nem LLM: a busca é local e determinística. Usa os documentos fictícios do cliente `exemplo` |
| Dados utilizados e risco | Somente documentos fictícios. Risco baixo: nenhuma credencial nem dado pessoal; o código da busca não mudou |
| Links do artefato, da revisão e da evidência | [Resultados salvos](../../tests/busca-lexical/resultados/), [teste](../../tests/unit/busca-lexical.test.ts) e o commit desta entrega. Revisão: |
| Horas realizadas | |

## Fora do escopo desta task

- Busca semântica com embeddings (`@agentor/knowledge-vector`, no [roadmap](../roadmap.md)).
- Métricas sobre um conjunto maior de perguntas (precisão, cobertura).
- Melhorias na busca lexical, como corte mínimo de score ou ignorar títulos de documento; a limitação acima fica como referência.
