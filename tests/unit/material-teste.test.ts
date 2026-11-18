/**
 * Material de teste do cenário "pessoa recém-chegada a um time de
 * desenvolvimento": apresentação do repositório Tarefas Exemplo e guia de
 * primeira contribuição, na base do cliente `exemplo`.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { createFsSource } from '@agentor/knowledge-fs'

const ROOT = join(import.meta.dirname, '..', '..', 'config', 'clients', 'exemplo', 'conhecimento')

const MATERIAL = [
  {
    file: 'repositorio-tarefas-exemplo.md',
    title: 'Apresentação do repositório Tarefas Exemplo',
    question: 'Como rodar o projeto Tarefas Exemplo localmente?',
    section: '## Como rodar o projeto localmente',
    answer: /npm install.*npm run dev/,
  },
  {
    file: 'guia-de-primeira-contribuicao.md',
    title: 'Guia de primeira contribuição no Tarefas Exemplo',
    question: 'Qual o padrão de nome de branch?',
    section: '## Criar a branch',
    answer: /tipo\/numero-da-issue-descricao-curta/,
  },
] as const

/** Padrões de dados pessoais, segredos e endereços de sistemas reais. */
const PROIBIDOS: Array<[string, RegExp]> = [
  ['e-mail', /[\w.+-]+@[\w-]+\.[\w.-]+/],
  ['CPF', /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/],
  ['telefone', /\(?\b\d{2}\)?\s?9?\d{4}-?\d{4}\b/],
  ['chave ou token', /sk-[\w-]{16,}|AKIA[0-9A-Z]{16}|gh[pousr]_\w{30,}|AIza[\w-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY/],
  ['senha com valor', /(senha|password|token|secret)\s*[:=]\s*\S+/i],
  ['endereço IP', /\b\d{1,3}(\.\d{1,3}){3}\b/],
  ['URL fora de localhost', /https?:\/\/(?!localhost[:/])[^\s)`]+/],
]

const source = createFsSource({ id: 'exemplo-manual', description: 'teste', root: ROOT, extensions: ['.md'], maxExcerptChars: 800 })

for (const doc of MATERIAL) {
  describe(`material de teste: ${doc.file}`, () => {
    const content = readFileSync(join(ROOT, doc.file), 'utf8')

    it('tem título, autoria, versão, finalidade e origem', () => {
      assert.equal(content.split('\n')[0], `# ${doc.title}`)
      for (const field of ['Autoria', 'Versão', 'Finalidade', 'Origem']) {
        assert.match(content, new RegExp(`^- \\*\\*${field}:\\*\\* \\S`, 'm'), `falta o campo ${field}`)
      }
      assert.match(content, /\*\*Origem:\*\* texto fictício/)
    })

    it('não contém dados pessoais, senhas nem endereços de sistemas reais', () => {
      for (const [label, pattern] of PROIBIDOS) assert.doesNotMatch(content, pattern, `encontrado: ${label}`)
    })

    it(`responde "${doc.question}"`, async () => {
      const [hit] = await source.search({ text: doc.question, limit: 5 })
      assert.ok(hit)
      assert.equal(hit.documentId, doc.file)
      assert.equal(hit.title, doc.title)
      assert.ok(hit.excerpt.startsWith(doc.section), hit.excerpt)
      assert.match(hit.excerpt, doc.answer)
    })
  })
}

describe('material de teste: controle dos padrões proibidos', () => {
  it('os padrões detectam exemplos fictícios', () => {
    const amostras = ['fulano@empresa.com.br', '123.456.789-09', '(31) 98765-4321', 'sk-abcdefghijklmnop1234', 'senha: abc123', '10.0.0.1', 'https://intranet.empresa.com']
    amostras.forEach((amostra, i) => assert.match(amostra, PROIBIDOS[i]![1]))
  })
})
