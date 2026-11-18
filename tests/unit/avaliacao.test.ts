/**
 * Perguntas de avaliação: formato dos cinco casos e regra de aprovação.
 *
 * A regra é exercitada só com os casos de desenvolvimento. Os reservados são
 * conferidos apenas no formato e travados por hash, para que ninguém os ajuste
 * ao programa sem que isso apareça na revisão.
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { avaliar, type Caso } from '../avaliacao/avaliar.ts'

const DIR = join(import.meta.dirname, '..', 'avaliacao')
const DOCS = join(import.meta.dirname, '..', '..', 'config', 'clients', 'exemplo', 'conhecimento')
const ler = (arquivo: string) => readFileSync(join(DIR, arquivo))
const desenvolvimento = JSON.parse(ler('casos-desenvolvimento.json').toString('utf8')) as Caso[]
const reservados = JSON.parse(ler('casos-reservados.json').toString('utf8')) as Caso[]
const todos = [...desenvolvimento, ...reservados]

/** Hash de casos-reservados.json. Mudar o arquivo exige mudar este valor, de propósito. */
const HASH_RESERVADOS = '0e026d5134d7e808fee05d92161321e87c59c2be3f436e499610215446b69b0b'

const caso = (id: string) => desenvolvimento.find(c => c.id === id)!

describe('perguntas de avaliação: conjunto', () => {
  it('há cinco perguntas: três de desenvolvimento e duas reservadas', () => {
    assert.equal(desenvolvimento.length, 3)
    assert.equal(reservados.length, 2)
    assert.ok(desenvolvimento.every(c => c.conjunto === 'desenvolvimento'))
    assert.ok(reservados.every(c => c.conjunto === 'reservado'))
    assert.equal(new Set(todos.map(c => c.id)).size, 5)
  })

  it('cada pergunta tem resultado esperado, fonte e regra de aprovação', () => {
    for (const c of todos) {
      assert.ok(c.pergunta.endsWith('?'), c.id)
      assert.ok(c.resultadoEsperado.length > 10, c.id)
      assert.ok(c.regra.texto.startsWith('Aprovada se'), c.id)
      if (c.tipo === 'respondivel') {
        assert.ok(c.fonte, `${c.id} precisa de fonte`)
        assert.ok(c.regra.deveConter.length > 0, `${c.id} precisa de fatos esperados`)
        // A fonte existe e contém os fatos esperados.
        const documento = readFileSync(join(DOCS, c.fonte.documento), 'utf8')
        assert.ok(documento.includes(`## ${c.fonte.secao}`), `${c.id}: seção não encontrada`)
        for (const grupo of c.regra.deveConter) assert.ok(grupo.some(fato => documento.includes(fato)), `${c.id}: fato fora da fonte: ${grupo}`)
      } else {
        assert.equal(c.fonte, null, `${c.id}: pergunta sem resposta não tem fonte`)
      }
    }
  })

  it('ao menos uma pergunta não pode ser respondida com o material', () => {
    assert.ok(todos.filter(c => c.tipo === 'sem-resposta').length >= 1)
    assert.ok(desenvolvimento.some(c => c.tipo === 'sem-resposta'))
    assert.ok(reservados.some(c => c.tipo === 'sem-resposta'))
  })

  it('os casos reservados não mudaram', () => {
    assert.equal(createHash('sha256').update(ler('casos-reservados.json')).digest('hex'), HASH_RESERVADOS)
  })
})

describe('perguntas de avaliação: regra de aprovação (casos de desenvolvimento)', () => {
  it('aprova resposta respondível que cita a fonte e contém o fato', () => {
    const v = avaliar(caso('D2-jornada-semanal'), 'A jornada é de 30 horas semanais, 6 horas por dia (fonte: manual-do-estagiario.md).')
    assert.deepEqual(v, { aprovado: true, motivos: [] })
  })

  it('reprova resposta sem a fonte, sem o fato ou com fato contrário', () => {
    assert.deepEqual(avaliar(caso('D2-jornada-semanal'), 'A jornada é de 30 horas semanais.').motivos, ['não cita o documento manual-do-estagiario.md'])
    assert.equal(avaliar(caso('D2-jornada-semanal'), 'Segundo o manual-do-estagiario.md, são 6 horas por dia.').aprovado, false)
    assert.equal(avaliar(caso('D2-jornada-semanal'), 'manual-do-estagiario.md: 30 horas, ou 40 horas em época de provas.').aprovado, false)
  })

  it('ignora acentos e maiúsculas na comparação', () => {
    assert.equal(avaliar(caso('D1-padrao-de-branch'), 'Use TIPO/NUMERO-DA-ISSUE-DESCRICAO-CURTA (Guia-de-Primeira-Contribuicao.md).').aprovado, true)
  })

  it('aprova pergunta sem resposta quando a ausência é declarada', () => {
    const d3 = caso('D3-valor-da-bolsa')
    assert.equal(avaliar(d3, 'Não encontrei essa informação na base de conhecimento. Procure seu mentor ou o RH.').aprovado, true)
    assert.equal(avaliar(d3, 'Nenhum trecho encontrado na base de conhecimento do cliente.').aprovado, true)
  })

  it('reprova pergunta sem resposta quando inventa valor ou apresenta trecho', () => {
    const d3 = caso('D3-valor-da-bolsa')
    assert.equal(avaliar(d3, 'A bolsa é de R$ 1.200,00.').aprovado, false)
    assert.equal(avaliar(d3, '[1] Manual (fonte: exemplo-manual, documento: manual-do-estagiario.md) A jornada é de 6 horas.').aprovado, false)
  })
})
