#!/usr/bin/env node
/**
 * Roda as perguntas de avaliação pelo agente do cliente `exemplo` e aplica a
 * regra de aprovação de cada caso (tests/avaliacao/avaliar.ts).
 *
 *   pnpm avaliacao                          casos de desenvolvimento, modo offline
 *   pnpm avaliacao --llm                    casos de desenvolvimento, LLM do cliente
 *   pnpm avaliacao --reservados --final     SÓ na avaliação final (veja docs/entregas/27-perguntas-de-avaliacao.md)
 *
 * Salva entrada, resposta e veredito em tests/avaliacao/resultados/<conjunto>-<modo>.json.
 */
import { execFile } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { avaliar } from '../tests/avaliacao/avaliar.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'tests', 'avaliacao')
const args = process.argv.slice(2)
const reservados = args.includes('--reservados')
const modo = args.includes('--llm') ? 'llm' : 'offline'

if (reservados && !args.includes('--final')) {
  console.error('Os casos reservados só rodam na avaliação final, sem ajustes depois. Se é isso, repita com --final.')
  process.exit(2)
}

const conjunto = reservados ? 'reservados' : 'desenvolvimento'
const casos = JSON.parse(await readFile(join(DIR, `casos-${conjunto}.json`), 'utf8'))

async function perguntar(pergunta) {
  const agentArgs = [join(ROOT, 'scripts', 'agentor.mjs'), '--client', 'exemplo', ...(modo === 'offline' ? ['--offline'] : []), pergunta]
  const { stdout } = await promisify(execFile)(process.execPath, agentArgs, { cwd: ROOT, maxBuffer: 10 * 1024 * 1024, timeout: 10 * 60_000 })
  return stdout.trim()
}

const resultados = []
for (const caso of casos) {
  const resposta = await perguntar(caso.pergunta)
  const veredito = avaliar(caso, resposta)
  resultados.push({ id: caso.id, tipo: caso.tipo, pergunta: caso.pergunta, regra: caso.regra.texto, resposta, ...veredito })
  console.log(`${veredito.aprovado ? 'APROVADA ' : 'REPROVADA'} ${caso.id}${veredito.motivos.length ? ` — ${veredito.motivos.join('; ')}` : ''}`)
}

const aprovadas = resultados.filter(r => r.aprovado).length
console.log(`${aprovadas}/${resultados.length} aprovadas (${conjunto}, ${modo})`)
await mkdir(join(DIR, 'resultados'), { recursive: true })
await writeFile(join(DIR, 'resultados', `${conjunto}-${modo}.json`), `${JSON.stringify({ data: new Date().toISOString().slice(0, 10), conjunto, modo, aprovadas, total: resultados.length, resultados }, null, 2)}\n`)
