# Apresentação do repositório Tarefas Exemplo

- **Autoria:** Frente B do projeto Agentor
- **Versão:** 1.0 (2026-11-18)
- **Finalidade:** material de teste para validar importação, busca e respostas do tutor de onboarding. Apresenta o repositório em que a pessoa recém-chegada ao time de desenvolvimento vai trabalhar.
- **Origem:** texto fictício escrito para o projeto Agentor. O repositório, a equipe e os endereços descritos aqui não existem; nenhum dado foi copiado de empresa ou sistema real.

## O que é o Tarefas Exemplo

O Tarefas Exemplo é uma aplicação web de lista de tarefas usada pelo time de desenvolvimento do Cliente Exemplo para treinar quem acaba de chegar. Ela permite criar, concluir e arquivar tarefas e agrupar tarefas em quadros. O repositório é pequeno de propósito: dá para ler o código inteiro em uma tarde.

## Tecnologias usadas

O backend é escrito em TypeScript com Node.js 24 e expõe uma API REST. O frontend usa React. Os dados ficam em um banco SQLite local, criado automaticamente na primeira execução. Os testes usam o executor nativo do Node (`node --test`).

## Organização das pastas

- `api/`: rotas da API REST e a lógica das tarefas.
- `web/`: telas do frontend em React.
- `db/`: migrações do banco SQLite.
- `tests/`: testes automatizados da API e do frontend.
- `docs/`: decisões de arquitetura e este material de apresentação.

## Como rodar o projeto localmente

Instale as dependências com `npm install` e rode `npm run dev`. A aplicação abre em `http://localhost:3000`. Para rodar os testes, use `npm test`. Não há chaves nem variáveis secretas para configurar: o banco é local e os dados de exemplo são gerados pelo comando `npm run seed`.

## Quem mantém o repositório

O repositório é mantido pelo time de Produto Interno do Cliente Exemplo. Dúvidas sobre o código vão para o canal do time no chat corporativo; dúvidas sobre o processo de onboarding vão para o mentor.
