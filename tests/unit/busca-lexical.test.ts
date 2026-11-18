/**
 * Busca lexical de referência sobre os documentos do cliente `exemplo`.
 *
 * Os casos ficam em tests/busca-lexical/casos.json e a entrada e a saída de cada
 * um em tests/busca-lexical/resultados/<id>.json, para revisão. Este teste
 * confere os critérios nesses arquivos e garante que eles são iguais ao que a
 * busca produz agora (`pnpm busca-lexical --check`).
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const ROOT = join(import.meta.dirname, '..', '..')
const DOCS = join(ROOT, 'config', 'clients', 'exemplo', 'conhecimento')

interface Hit { sourceId: string, documentId: string, title: string, excerpt: string, score: number }
interface Registro {
  caso: { id: string, tipo: string, consulta: string }
  entrada: { consulta: string, fonte: { id: string } }
  saida: { trechos: Hit[], falhas: unknown[], textoParaOModelo: string }
}

const load = (id: string): Registro =>
  JSON.parse(readFileSync(join(ROOT, 'tests', 'busca-lexical', 'resultados', `${id}.json`), 'utf8')) as Registro

const flat = (text: string) => text.replace(/\s+/g, ' ')

describe('busca lexical de referência (cliente exemplo)', () => {
  it('os resultados salvos são iguais à execução atual', () => {
    execFileSync(process.execPath, [join(ROOT, 'scripts', 'busca-lexical.mjs'), '--check'], { cwd: ROOT, stdio: 'pipe' })
  })

  it('positivo: devolve o trecho adequado com identificador e origem', () => {
    const { entrada, saida } = load('positivo')
    assert.equal(entrada.consulta, 'Onde retiro o crachá no primeiro dia?')
    assert.deepEqual(saida.falhas, [])
    const [hit] = saida.trechos
    assert.ok(hit, 'deveria haver ao menos um trecho')
    assert.equal(hit.sourceId, 'exemplo-manual')
    assert.equal(hit.documentId, 'manual-do-estagiario.md')
    assert.match(hit.excerpt, /^## Primeiro dia /)
    assert.match(hit.excerpt, /recebe o crachá na recepção/)
    assert.ok(hit.score > 0 && hit.score <= 1)
    // O trecho é texto real do documento citado, não gerado.
    const documento = flat(readFileSync(join(DOCS, hit.documentId), 'utf8'))
    assert.ok(documento.includes(hit.excerpt), 'o trecho deveria existir no documento de origem')
    assert.match(saida.textoParaOModelo, /\(fonte: exemplo-manual, documento: manual-do-estagiario\.md\)/)
  })

  it('negativo: retorna ausência, sem texto nem fonte inventados', () => {
    const { entrada, saida } = load('negativo')
    assert.equal(entrada.consulta, 'Como peço reembolso de transporte?')
    assert.deepEqual(saida.trechos, [])
    assert.deepEqual(saida.falhas, [])
    assert.equal(saida.textoParaOModelo, 'Nenhum trecho encontrado na base de conhecimento do cliente.')
    assert.doesNotMatch(saida.textoParaOModelo, /fonte:|documento:/)
  })
})
