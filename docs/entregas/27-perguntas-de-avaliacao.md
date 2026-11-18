# Entrega — task #27: Perguntas de avaliação das respostas

| Campo | Valor |
|---|---|
| Frente | B |
| Estimativa | 2,5 h |
| Objetivo | Definir desde o início como verificar se as respostas estão apoiadas no material |
| Artefatos | [`casos-desenvolvimento.json`](../../tests/avaliacao/casos-desenvolvimento.json), [`casos-reservados.json`](../../tests/avaliacao/casos-reservados.json), regra de aprovação em [`avaliar.ts`](../../tests/avaliacao/avaliar.ts), executor [`scripts/avaliacao.mjs`](../../scripts/avaliacao.mjs) e teste [`avaliacao.test.ts`](../../tests/unit/avaliacao.test.ts) |

Depende do material da branch `task-material-teste` (apresentação do repositório Tarefas Exemplo e guia de primeira contribuição): esta branch parte dela.

## As cinco perguntas

| Id | Conjunto | Pergunta | Resultado esperado | Fonte |
|---|---|---|---|---|
| D1 | desenvolvimento | Qual o padrão de nome de branch no Tarefas Exemplo? | `tipo/numero-da-issue-descricao-curta` (ex.: `correcao/42-botao-arquivar`) | `guia-de-primeira-contribuicao.md`, "Criar a branch" |
| D2 | desenvolvimento | Quantas horas por semana é a jornada do estagiário? | 30 horas semanais (6 por dia) | `manual-do-estagiario.md`, "Jornada e ponto eletrônico" |
| D3 | desenvolvimento | Qual é o valor da bolsa-auxílio do estagiário? | **Sem resposta no material**: declarar a ausência e orientar procurar o mentor ou o RH | nenhuma |
| R1 | reservado | Quem precisa aprovar a primeira contribuição antes do merge? | O mentor e mais uma pessoa do time | `guia-de-primeira-contribuicao.md`, "Abrir o pull request" |
| R2 | reservado | Estagiário pode trabalhar de casa alguns dias da semana? | **Sem resposta no material**: declarar a ausência e orientar procurar o mentor | nenhuma |

## Regra de aprovação

Cada caso traz a regra em texto (`regra.texto`) e na forma verificável (`deveConter`, `naoDeveConter`), aplicada por `avaliar()`. A comparação ignora acentos e maiúsculas.

**Pergunta respondível** (D1, D2, R1): aprovada se a resposta

1. cita o documento-fonte pelo nome do arquivo;
2. contém cada fato esperado (em cada grupo de `deveConter`, ao menos uma das alternativas);
3. não contém nada de `naoDeveConter` (ex.: em D2, "20 horas", "40 horas" ou "44 horas").

**Pergunta sem resposta** (D3, R2): aprovada se a resposta

1. declara que a base não tem a informação ("não encontrei", "não consta", "nenhum trecho encontrado"...);
2. não apresenta trecho de documento como resposta (nenhum `documento:` nem nome de arquivo `.md`);
3. não contém nada de `naoDeveConter` (ex.: em D3, "R$" ou "reais").

Regras por caso:

| Id | Aprovada se |
|---|---|
| D1 | cita `guia-de-primeira-contribuicao.md` e contém `tipo/numero-da-issue-descricao-curta` |
| D2 | cita `manual-do-estagiario.md` e contém "30 horas"; reprovada se afirmar 20, 40 ou 44 horas |
| D3 | declara a ausência, não apresenta trecho de documento e não informa valor em reais |
| R1 | cita `guia-de-primeira-contribuicao.md` e menciona o mentor e mais uma pessoa do time |
| R2 | declara a ausência e não apresenta trecho de documento |

## Casos reservados

R1 e R2 **não são usados para ajustar o programa**. Regras:

- O executor só roda os reservados com `pnpm avaliacao --reservados --final`; sem `--final` ele recusa (código 2).
- Os testes unitários conferem só o formato dos reservados. A regra de aprovação é exercitada apenas com os casos de desenvolvimento.
- O arquivo `casos-reservados.json` é travado por hash SHA-256 no teste: qualquer mudança faz `pnpm verify` falhar até o hash ser atualizado, o que fica visível na revisão.
- Os reservados **não foram executados** nesta entrega. Rodam uma vez, na avaliação final, e o resultado é registrado sem ajustes posteriores.

## Critérios de aceite e evidências

| # | Critério | Evidência |
|---|---|---|
| 1 | Há cinco perguntas, com resultado esperado, fonte e regra de aprovação | Tabelas acima e os dois JSON. O teste confere os cinco casos, que cada respondível tem fonte e que a seção e os fatos esperados existem literalmente no documento-fonte |
| 2 | Ao menos uma pergunta não pode ser respondida com o material disponível | D3 (valor da bolsa) e R2 (trabalho remoto): uma em cada conjunto. Nenhum documento da base trata desses temas |
| 3 | Três casos são de desenvolvimento e dois ficam reservados, sem uso para ajustar o programa | Arquivos separados; D1–D3 de desenvolvimento, R1–R2 reservados com as travas descritas acima |

## Linha de base (casos de desenvolvimento, modo offline)

`pnpm avaliacao` em 2026-11-18, resultado salvo em [`desenvolvimento-offline.json`](../../tests/avaliacao/resultados/desenvolvimento-offline.json):

| Id | Veredito | Motivo |
|---|---|---|
| D1 | aprovada | — |
| D2 | aprovada | — |
| D3 | **reprovada** | o modo offline devolve o que a busca lexical encontra; "estagiário" casa com o título dos documentos e a resposta traz trechos sem relação, em vez de declarar a ausência |

2/3 aprovadas. A reprovação de D3 é o falso positivo da busca lexical já registrado na task #26 e mostra que a regra o detecta. Corrigir isso (corte mínimo de score, ou o LLM real ignorar trechos irrelevantes) fica fora desta task.

## Como revisar

```bash
pnpm verify
```

```bash
pnpm avaliacao
```

Esperado: 42 testes, 42 passando; a avaliação mostra D1 e D2 aprovadas e D3 reprovada, 2/3. Com chave de LLM configurada, `pnpm avaliacao --llm` aplica as mesmas regras à resposta do modelo e salva em `desenvolvimento-llm.json`.

## A preencher

| Campo | Valor |
|---|---|
| Responsável | [willianpaula](https://github.com/willianpaula) |
| Revisor | |
| Dependências e alternativa com dados simulados | Depende do material da branch `task-material-teste`. Sem LLM real, a avaliação roda no modo offline, que devolve o resultado da busca |
| Dados utilizados e risco | Somente os documentos fictícios do cliente `exemplo`. Risco baixo: nenhum dado pessoal nem credencial |
| Links do artefato, da revisão e da evidência | Arquivos acima, o [resultado da linha de base](../../tests/avaliacao/resultados/desenvolvimento-offline.json) e o commit desta entrega. Revisão: |
| Horas realizadas | |

## Fora do escopo desta task

- Execução dos casos reservados (avaliação final).
- Ajustes no programa para aprovar D3.
- Avaliação com LLM real e com mais perguntas.
