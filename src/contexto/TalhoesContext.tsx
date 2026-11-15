import { createContext, useContext, useState, type ReactNode } from 'react'
import { MUNICIPIOS } from '../dados/municipios'
import { dataISOValida, dataLocalHoje } from '../dominio/talhoes'
import type { Operacao, TipoOperacao } from '../tipos/operacao'
import type { Cultura, Talhao } from '../tipos/talhao'

const CHAVE_TALHOES = 'agropainel-talhoes'
const CHAVE_OPERACOES = 'agropainel-operacoes'

interface TalhoesContexto {
  talhoes: Talhao[]
  operacoes: Operacao[]
  adicionarTalhao: (talhao: Talhao) => void
  atualizarTalhao: (talhao: Talhao) => void
  excluirTalhao: (id: string) => void
  adicionarOperacao: (operacao: Operacao) => void
}

const ContextoTalhoes = createContext<TalhoesContexto | null>(null)

function lerTalhoes(): Talhao[] {
  const salvo = localStorage.getItem(CHAVE_TALHOES)
  if (!salvo) return []

  try {
    const dados: unknown = JSON.parse(salvo)
    if (!Array.isArray(dados) || !dados.every(ehTalhao)) return []
    return dados
  } catch (erro: unknown) {
    if (erro instanceof SyntaxError) return []
    throw erro
  }
}

function lerOperacoes(talhoes: Talhao[]): Operacao[] {
  const salvo = localStorage.getItem(CHAVE_OPERACOES)
  if (!salvo) return []

  try {
    const dados: unknown = JSON.parse(salvo)
    if (!Array.isArray(dados) || !dados.every((valor) => ehOperacao(valor, talhoes))) {
      return []
    }
    const colheitas = dados.filter((operacao) => operacao.tipo === 'colheita')
    if (new Set(colheitas.map((operacao) => operacao.talhaoId)).size !== colheitas.length) {
      return []
    }
    return dados
  } catch (erro: unknown) {
    if (erro instanceof SyntaxError) return []
    throw erro
  }
}

function ehTalhao(valor: unknown): valor is Talhao {
  if (typeof valor !== 'object' || valor === null) return false
  const talhao = valor as Record<string, unknown>
  return (
    typeof talhao.id === 'string' &&
    typeof talhao.nome === 'string' &&
    talhao.nome.trim().length >= 3 &&
    ehCultura(talhao.cultura) &&
    typeof talhao.areaHa === 'number' &&
    Number.isFinite(talhao.areaHa) &&
    talhao.areaHa > 0 &&
    talhao.areaHa <= 10000 &&
    typeof talhao.municipioId === 'string' &&
    MUNICIPIOS.some((municipio) => municipio.id === talhao.municipioId) &&
    (talhao.dataPlantio === null ||
      (typeof talhao.dataPlantio === 'string' &&
        dataISOValida(talhao.dataPlantio) &&
        talhao.dataPlantio <= dataLocalHoje()))
  )
}

function ehCultura(valor: unknown): valor is Cultura {
  return (
    valor === 'soja' ||
    valor === 'milho' ||
    valor === 'algodao' ||
    valor === 'arroz' ||
    valor === 'feijao'
  )
}

function ehOperacao(valor: unknown, talhoes: Talhao[]): valor is Operacao {
  if (typeof valor !== 'object' || valor === null) return false
  const operacao = valor as Record<string, unknown>
  if (
    typeof operacao.id !== 'string' ||
    typeof operacao.talhaoId !== 'string' ||
    !ehTipoOperacao(operacao.tipo) ||
    typeof operacao.data !== 'string' ||
    !dataISOValida(operacao.data) ||
    operacao.data > dataLocalHoje() ||
    typeof operacao.descricao !== 'string' ||
    !operacao.descricao.trim() ||
    typeof operacao.custoCentavos !== 'number' ||
    !Number.isInteger(operacao.custoCentavos) ||
    operacao.custoCentavos < 0 ||
    !talhoes.some((talhao) => talhao.id === operacao.talhaoId)
  ) {
    return false
  }

  const talhao = talhoes.find((item) => item.id === operacao.talhaoId)
  if (!talhao) return false
  if (
    ['adubacao', 'pulverizacao', 'colheita'].includes(operacao.tipo) &&
    (!talhao.dataPlantio || operacao.data < talhao.dataPlantio)
  ) {
    return false
  }
  if (operacao.tipo !== 'colheita') return operacao.produtividadeScHa === undefined
  return (
    typeof operacao.produtividadeScHa === 'number' &&
    Number.isFinite(operacao.produtividadeScHa) &&
    operacao.produtividadeScHa > 0
  )
}

function ehTipoOperacao(valor: unknown): valor is TipoOperacao {
  return (
    valor === 'preparo' ||
    valor === 'plantio' ||
    valor === 'adubacao' ||
    valor === 'pulverizacao' ||
    valor === 'colheita'
  )
}

export function TalhoesProvider({ children }: { children: ReactNode }) {
  const [talhoes, setTalhoes] = useState<Talhao[]>(lerTalhoes)
  const [operacoes, setOperacoes] = useState<Operacao[]>(() => lerOperacoes(talhoes))

  function salvarTalhoes(proximosTalhoes: Talhao[]) {
    localStorage.setItem(CHAVE_TALHOES, JSON.stringify(proximosTalhoes))
    setTalhoes(proximosTalhoes)
  }

  function salvarOperacoes(proximasOperacoes: Operacao[]) {
    localStorage.setItem(CHAVE_OPERACOES, JSON.stringify(proximasOperacoes))
    setOperacoes(proximasOperacoes)
  }

  function adicionarTalhao(talhao: Talhao) {
    salvarTalhoes([...talhoes, talhao])
  }

  function atualizarTalhao(atualizado: Talhao) {
    salvarTalhoes(
      talhoes.map((talhao) => (talhao.id === atualizado.id ? atualizado : talhao)),
    )
  }

  function excluirTalhao(id: string) {
    const proximasOperacoes = operacoes.filter((operacao) => operacao.talhaoId !== id)
    localStorage.setItem(CHAVE_OPERACOES, JSON.stringify(proximasOperacoes))
    localStorage.setItem(
      CHAVE_TALHOES,
      JSON.stringify(talhoes.filter((talhao) => talhao.id !== id)),
    )
    setOperacoes(proximasOperacoes)
    setTalhoes(talhoes.filter((talhao) => talhao.id !== id))
  }

  function adicionarOperacao(operacao: Operacao) {
    salvarOperacoes([...operacoes, operacao])
  }

  return (
    <ContextoTalhoes.Provider
      value={{
        talhoes,
        operacoes,
        adicionarTalhao,
        atualizarTalhao,
        excluirTalhao,
        adicionarOperacao,
      }}
    >
      {children}
    </ContextoTalhoes.Provider>
  )
}

// O hook avisa quando uma tela é usada fora do provider.
export function useTalhoes(): TalhoesContexto {
  const contexto = useContext(ContextoTalhoes)
  if (!contexto) throw new Error('useTalhoes precisa estar dentro de TalhoesProvider.')
  return contexto
}
