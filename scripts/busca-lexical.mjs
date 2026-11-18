#!/usr/bin/env node
/**
 * Busca lexical de referência: roda os casos de tests/busca-lexical/casos.json
 * sobre os documentos do cliente `exemplo`, pelo mesmo caminho da tool
 * `knowledge_search` (ctx.knowledge → @agentor/knowledge-fs), e salva entrada e
 * saída de cada caso em tests/busca-lexical/resultados/<id>.json.
 *
 *   pnpm busca-lexical            regrava os resultados
 *   pnpm busca-lexical --check    só compara; sai com código 1 se algo mudou
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import KnowledgeRegistry from '@agentor/knowledge'
import * as knowledgeFs from '@agentor/knowledge-fs'
import { renderResult } from '@agentor/tool-knowledge'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const CASES_FILE = join(ROOT, 'tests', 'busca-lexical', 'casos.json')
export const RESULTS_DIR = join(ROOT, 'tests', 'busca-lexical', 'resultados')

/** Mesma fonte declarada em config/clients/exemplo/cordis.patch.yml. */
export const SOURCE = {
  id: 'exemplo-manual',
  description: 'Manual do estagiário e políticas internas do cliente exemplo',
  root: 'config/clients/exemplo/conhecimento',
  extensions: ['.md', '.markdown', '.txt'],
  maxExcerptChars: 800,
}

/** Limite padrão da tool knowledge_search. */
export const LIMIT = 5

export async function loadCases() {
  return JSON.parse(await readFile(CASES_FILE, 'utf8'))
}

/** Executa os casos e devolve, para cada um, o registro de entrada e saída. */
export async function runCases(cases) {
  const ctx = new Context()
  try {
    await ctx.plugin(KnowledgeRegistry)
    await ctx.plugin(knowledgeFs, { ...SOURCE, root: join(ROOT, SOURCE.root) })
    const records = []
    for (const testCase of cases) {
      const result = await ctx.knowledge.search(testCase.consulta, { limit: LIMIT })
      records.push({
        caso: testCase,
        entrada: { consulta: testCase.consulta, limite: LIMIT, fonte: { ...SOURCE } },
        saida: {
          trechos: result.hits,
          falhas: result.failures,
          textoParaOModelo: renderResult(result),
        },
      })
    }
    return records
  } finally {
    await ctx.fiber.dispose()
  }
}

export const serialize = record => `${JSON.stringify(record, null, 2)}\n`
export const resultFile = id => join(RESULTS_DIR, `${id}.json`)

async function main() {
  const check = process.argv.includes('--check')
  const records = await runCases(await loadCases())
  await mkdir(RESULTS_DIR, { recursive: true })
  let changed = 0
  for (const record of records) {
    const file = resultFile(record.caso.id)
    const saved = await readFile(file, 'utf8').catch(() => undefined)
    const fresh = serialize(record)
    const status = saved === fresh ? 'igual' : saved === undefined ? 'novo' : 'mudou'
    if (status !== 'igual') changed++
    if (!check && status !== 'igual') await writeFile(file, fresh)
    console.log(`${record.caso.id}: ${record.saida.trechos.length} trecho(s) [${status}]`)
  }
  if (check && changed > 0) {
    console.error(`${changed} resultado(s) diferem do salvo; rode "pnpm busca-lexical" e revise o diff.`)
    process.exitCode = 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
