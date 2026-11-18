/**
 * Regra de aprovação das perguntas de avaliação.
 *
 * Verifica se uma resposta do assistente está apoiada no material, segundo o
 * caso: pergunta respondível precisa citar o documento-fonte e conter os fatos
 * esperados; pergunta sem resposta precisa declarar a ausência, sem citar
 * documento como resposta. A comparação ignora acentos e maiúsculas.
 */

export interface Caso {
  id: string
  conjunto: 'desenvolvimento' | 'reservado'
  tipo: 'respondivel' | 'sem-resposta'
  pergunta: string
  resultadoEsperado: string
  fonte: { documento: string, secao: string } | null
  regra: {
    texto: string
    /** Cada grupo precisa de ao menos uma das alternativas na resposta. */
    deveConter: string[][]
    /** Nenhum destes pode aparecer na resposta. */
    naoDeveConter: string[]
  }
}

export interface Veredito {
  aprovado: boolean
  motivos: string[]
}

export const normalizar = (texto: string): string =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ')

/** Frases que declaram que a base não tem a informação. */
export const AUSENCIA = /nenhum trecho encontrado|nao (encontrei|encontramos|ha |tem |consta|possui|existe|esta (na|no|nos|nas) )|nao foi (possivel )?encontrad|sem informac|nao (traz|trata|menciona|informa)/

/** Sinais de que um trecho de documento foi apresentado como resposta. */
export const CITACAO = /documento:|\b[\w-]+\.md\b/

export function avaliar(caso: Caso, resposta: string): Veredito {
  const texto = normalizar(resposta)
  const motivos: string[] = []

  if (caso.tipo === 'respondivel') {
    const documento = caso.fonte!.documento
    if (!texto.includes(normalizar(documento))) motivos.push(`não cita o documento ${documento}`)
    for (const grupo of caso.regra.deveConter) {
      if (!grupo.some(alternativa => texto.includes(normalizar(alternativa)))) motivos.push(`falta: ${grupo.join(' | ')}`)
    }
  } else {
    if (!AUSENCIA.test(texto)) motivos.push('não declara que a base não tem a informação')
    if (CITACAO.test(texto)) motivos.push('apresenta trecho de documento como resposta')
  }
  for (const proibido of caso.regra.naoDeveConter) {
    if (texto.includes(normalizar(proibido))) motivos.push(`contém o proibido: ${proibido}`)
  }
  return { aprovado: motivos.length === 0, motivos }
}
