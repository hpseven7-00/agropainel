import { MUNICIPIOS } from '../dados/municipios'
import type {
  CamposTalhao,
  Cultura,
  ErrosTalhao,
  SituacaoTalhao,
  Talhao,
} from '../tipos/talhao'
import type { Operacao } from '../tipos/operacao'

export const CULTURAS: { id: Cultura; nome: string; cicloDias: number }[] = [
  { id: 'soja', nome: 'Soja', cicloDias: 120 },
  { id: 'milho', nome: 'Milho', cicloDias: 140 },
  { id: 'algodao', nome: 'Algodão', cicloDias: 180 },
  { id: 'arroz', nome: 'Arroz', cicloDias: 120 },
  { id: 'feijao', nome: 'Feijão', cicloDias: 90 },
]

export function dataLocalHoje(): string {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function dataISOValida(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
  const dataUtc = new Date(`${data}T00:00:00.000Z`)
  return !Number.isNaN(dataUtc.getTime()) && dataUtc.toISOString().slice(0, 10) === data
}

export function validarTalhao(
  campos: CamposTalhao,
  talhoes: Talhao[],
  hoje = dataLocalHoje(),
  idIgnorado?: string,
  operacoes: Operacao[] = [],
): ErrosTalhao {
  const erros: ErrosTalhao = {}
  const nome = campos.nome.trim()
  const area = Number(campos.areaHa)

  if (nome.length < 3) {
    erros.nome = 'Informe um nome com pelo menos 3 caracteres.'
  } else if (
    talhoes.some(
      (talhao) =>
        talhao.id !== idIgnorado &&
        talhao.nome.trim().toLocaleLowerCase('pt-BR') ===
          nome.toLocaleLowerCase('pt-BR'),
    )
  ) {
    erros.nome = 'Já existe um talhão com esse nome.'
  }

  if (!Number.isFinite(area) || area <= 0) {
    erros.areaHa = 'A área deve ser maior que 0 ha.'
  } else if (area > 10000) {
    erros.areaHa = 'A área máxima é 10.000 ha.'
  }

  if (!MUNICIPIOS.some((municipio) => municipio.id === campos.municipioId)) {
    erros.municipioId = 'Selecione um município válido.'
  }

  if (campos.dataPlantio && !dataISOValida(campos.dataPlantio)) {
    erros.dataPlantio = 'Informe uma data válida.'
  } else if (campos.dataPlantio && campos.dataPlantio > hoje) {
    erros.dataPlantio = 'A data de plantio não pode ser futura.'
  } else if (
    idIgnorado &&
    operacoes.some(
      (operacao) =>
        operacao.talhaoId === idIgnorado &&
        ['adubacao', 'pulverizacao', 'colheita'].includes(operacao.tipo) &&
        (!campos.dataPlantio || operacao.data < campos.dataPlantio),
    )
  ) {
    erros.dataPlantio = 'A data não pode ser removida ou ficar depois de uma operação.'
  }

  return erros
}

function diasEntre(inicio: string, fim: string): number {
  const [anoInicio, mesInicio, diaInicio] = inicio.split('-').map(Number)
  const [anoFim, mesFim, diaFim] = fim.split('-').map(Number)
  const inicioUtc = Date.UTC(anoInicio, mesInicio - 1, diaInicio)
  const fimUtc = Date.UTC(anoFim, mesFim - 1, diaFim)
  return Math.floor((fimUtc - inicioUtc) / 86400000)
}

export function diasDesdePlantio(dataPlantio: string, hoje = dataLocalHoje()): number {
  return diasEntre(dataPlantio, hoje)
}

export function preverColheita(talhao: Talhao): string | null {
  if (!talhao.dataPlantio) return null
  const ciclo = CULTURAS.find((cultura) => cultura.id === talhao.cultura)!.cicloDias
  const [ano, mes, dia] = talhao.dataPlantio.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia + ciclo)).toISOString().slice(0, 10)
}

export function situacaoTalhao(
  talhao: Talhao,
  hoje = dataLocalHoje(),
  operacoes: Operacao[] = [],
): SituacaoTalhao {
  // A colheita registrada prevalece sobre a situação calculada pelo ciclo.
  if (
    operacoes.some(
      (operacao) => operacao.talhaoId === talhao.id && operacao.tipo === 'colheita',
    )
  ) {
    return 'Colhido'
  }
  if (!talhao.dataPlantio) return 'Aguardando plantio'

  const ciclo = CULTURAS.find((cultura) => cultura.id === talhao.cultura)!.cicloDias
  const dias = diasDesdePlantio(talhao.dataPlantio, hoje)

  if (dias < ciclo - 15) return 'Em desenvolvimento'
  if (dias < ciclo) return 'Colheita próxima'
  return 'Ponto de colheita'
}

export function nomeCultura(culturaId: Cultura): string {
  return CULTURAS.find((cultura) => cultura.id === culturaId)?.nome ?? culturaId
}
