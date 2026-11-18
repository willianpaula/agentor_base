# Entrega — task #__: Material de teste seguro e controlado

| Campo | Valor |
|---|---|
| Frente | B |
| Estimativa | 2,5 h |
| Objetivo | Criar um material seguro e controlado para testar importação, busca e respostas |
| Artefatos | [Apresentação do repositório Tarefas Exemplo](../../config/clients/exemplo/conhecimento/repositorio-tarefas-exemplo.md) e [Guia de primeira contribuição](../../config/clients/exemplo/conhecimento/guia-de-primeira-contribuicao.md); teste [`material-teste.test.ts`](../../tests/unit/material-teste.test.ts) |

## Cenário

O cenário do projeto é o tutor de onboarding de estagiários. Este material cobre a chegada a um **time de desenvolvimento**: a pessoa precisa conhecer o repositório em que vai trabalhar e fazer a primeira contribuição. O repositório "Tarefas Exemplo" e o processo descritos são fictícios.

Os dois arquivos ficam na base de conhecimento do cliente `exemplo` (`config/clients/exemplo/conhecimento/`). Assim a importação é a do provider de pasta local: os arquivos são lidos sem nenhuma configuração nova, e a busca e as respostas podem ser testadas na hora com `pnpm agentor --client exemplo --offline "<pergunta>"`.

## Critérios de aceite e evidências

| # | Critério | Evidência |
|---|---|---|
| 1 | Há dois arquivos Markdown: apresentação de um repositório de exemplo e guia de primeira contribuição | [`repositorio-tarefas-exemplo.md`](../../config/clients/exemplo/conhecimento/repositorio-tarefas-exemplo.md): o que é, tecnologias, pastas, como rodar e quem mantém. [`guia-de-primeira-contribuicao.md`](../../config/clients/exemplo/conhecimento/guia-de-primeira-contribuicao.md): escolher a issue, criar a branch, commits, pull request e depois do merge |
| 2 | Cada arquivo tem título, autoria, versão, finalidade e origem | Título na primeira linha e, logo abaixo, os campos **Autoria** (Frente B do projeto Agentor), **Versão** (1.0, 2026-11-18), **Finalidade** e **Origem** (texto fictício). O teste confere os cinco em cada arquivo |
| 3 | Os arquivos não contêm dados pessoais, senhas nem referências a sistemas internos reais | Sem nomes de pessoas (a autoria é a Frente B, os papéis são "mentor" e "time"), sem empresa real ("Cliente Exemplo") e o único endereço é `http://localhost:3000`. O teste procura e-mail, CPF, telefone, chaves e tokens, `senha:`/`password=` com valor, endereço IP e URL fora de localhost: nenhuma ocorrência. Controle: os mesmos padrões detectam um exemplo fictício de cada tipo |
| 4 | Os dois permitem responder ao menos uma pergunta do cenário escolhido | Veja a tabela abaixo. O teste confere documento, título, seção e conteúdo da resposta |

### Perguntas do cenário

Executado pelo agente em modo offline (`pnpm agentor --client exemplo --offline "<pergunta>"`), que devolve o trecho encontrado pela `knowledge_search`:

| Pergunta | Documento e seção devolvidos | Resposta no trecho |
|---|---|---|
| Como rodar o projeto Tarefas Exemplo localmente? | `repositorio-tarefas-exemplo.md`, "Como rodar o projeto localmente" | `npm install`, `npm run dev`, abre em `http://localhost:3000`; testes com `npm test`; dados com `npm run seed` |
| Qual o padrão de nome de branch? | `guia-de-primeira-contribuicao.md`, "Criar a branch" | `tipo/numero-da-issue-descricao-curta`, por exemplo `correcao/42-botao-arquivar` |

Outras perguntas conferidas na busca, com o documento certo em 1º lugar: "Quem revisa meu pull request?" (seção "Abrir o pull request") e "Como escolho minha primeira issue?" (seção "Escolher a primeira issue").

## Impacto na base existente

Os textos evitam as palavras das consultas já usadas nos testes. Antes e depois dos arquivos novos, a busca devolve os mesmos resultados para "Como funciona o ponto eletrônico?", "Qual a regra de senhas?" (testes e2e) e para as três consultas da task #26 (crachá, reembolso de transporte e plano de saúde). Durante a escrita, "regras de negócio" foi trocado por "lógica das tarefas", porque "regras" contém "regra"; e "não é revisado" por "só é analisado", porque "revisado" contém "revisa" e desviava a pergunta sobre revisão para a seção de commits.

## Como revisar

```bash
pnpm verify
```

```bash
pnpm agentor --client exemplo --offline "Qual o padrão de nome de branch?"
```

Esperado: 33 testes, 33 passando; a resposta cita `guia-de-primeira-contribuicao.md` com o padrão de branch.

## Como foi verificado

2026-11-18, Windows 11 Pro, Node 24.21.0, pnpm 10.28.0: `pnpm verify` com typecheck ok e 33 testes, 33 passando (26 anteriores e 7 novos); as duas perguntas da tabela pelo agente offline; as consultas antigas comparadas antes e depois.

## A preencher

| Campo | Valor |
|---|---|
| Responsável | [willianpaula](https://github.com/willianpaula) |
| Revisor | |
| Dependências e alternativa com dados simulados | Nenhuma: o material já é simulado. O teste de respostas usa o adaptador offline, sem LLM real |
| Dados utilizados e risco | Somente texto fictício escrito para o projeto. Risco baixo: nenhum dado pessoal, credencial ou sistema real, conferido por teste |
| Links do artefato, da revisão e da evidência | Os dois arquivos acima, o [teste](../../tests/unit/material-teste.test.ts) e o commit desta entrega. Revisão: |
| Horas realizadas | |

## Fora do escopo desta task

- Teste com LLM real sobre o material novo.
- Casos salvos de busca para estas perguntas no formato da task #26 (`tests/busca-lexical/`), que está em outra branch.
- Material de outros cenários ou em outros formatos (PDF, planilha).
