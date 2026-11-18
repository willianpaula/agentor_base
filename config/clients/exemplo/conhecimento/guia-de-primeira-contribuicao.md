# Guia de primeira contribuição no Tarefas Exemplo

- **Autoria:** Frente B do projeto Agentor
- **Versão:** 1.0 (2026-11-18)
- **Finalidade:** material de teste para validar importação, busca e respostas do tutor de onboarding. Orienta a pessoa recém-chegada a fazer a primeira contribuição no repositório Tarefas Exemplo.
- **Origem:** texto fictício escrito para o projeto Agentor. O processo descrito não é de nenhuma empresa real; nenhum dado foi copiado de sistema real.

## Escolher a primeira issue

Comece por uma issue com a etiqueta `boa-primeira-issue`. Essas issues são pequenas, têm o resultado esperado descrito e não mexem no banco. Antes de começar, comente na issue que vai trabalhar nela, para ninguém repetir o trabalho.

## Criar a branch

Crie a branch a partir da `main` atualizada. O nome segue o padrão `tipo/numero-da-issue-descricao-curta`, por exemplo `correcao/42-botao-arquivar`. Os tipos aceitos são `funcionalidade`, `correcao` e `documentacao`.

## Fazer os commits

Faça commits pequenos, com a mensagem em português no imperativo, por exemplo "Corrige o botão de arquivar tarefa". Rode `npm test` antes de cada push: o pull request só é analisado com os testes passando.

## Abrir o pull request

Abra o pull request para a `main` e preencha o modelo: o que mudou, como testar e o número da issue. Quem revisa o pull request é o mentor: marque-o como revisor. A primeira contribuição precisa da aprovação do mentor e de mais uma pessoa do time antes do merge.

## Depois do merge

O merge é feito por quem abriu o pull request, depois das duas aprovações. Apague a branch e mova a issue para "Concluído". Se algo quebrar depois do merge, avise no canal do time e abra uma issue de correção.
