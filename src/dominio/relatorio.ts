import { CULTURAS } from './talhoes'
import { producaoEmSacas, somarCustos } from './operacoes'
import type { Operacao } from '../tipos/operacao'
import type { Talhao } from '../tipos/talhao'

export interface ResumoSafra {
  areaPorCultura: { cultura: string; areaHa: number }[]
  custoTotalCentavos: number
  custoPorTalhao: { talhaoId: string; custoPorHectareCentavos: number }[]
  producaoTotalSacas: number
}

// Calcula o relatório apenas com os talhões e operações já salvos.
export function resumirSafra(
  talhoes: Talhao[],
  operacoes: Operacao[],
): ResumoSafra {
  const areaPorCultura = CULTURAS.map((cultura) => ({
    cultura: cultura.nome,
    areaHa: talhoes
      .filter((talhao) => talhao.cultura === cultura.id)
      .reduce((total, talhao) => total + talhao.areaHa, 0),
  }))

  const custoPorTalhao = talhoes.map((talhao) => {
    const operacoesDoTalhao = operacoes.filter(
      (operacao) => operacao.talhaoId === talhao.id,
    )
    return {
      talhaoId: talhao.id,
      custoPorHectareCentavos: Math.round(
        somarCustos(operacoesDoTalhao) / talhao.areaHa,
      ),
    }
  })

  const talhoesPorId = new Map(talhoes.map((talhao) => [talhao.id, talhao]))
  const producaoTotalSacas = operacoes.reduce((total, operacao) => {
    const talhao = talhoesPorId.get(operacao.talhaoId)
    return total + (talhao ? producaoEmSacas(talhao, operacao) : 0)
  }, 0)

  return {
    areaPorCultura,
    custoTotalCentavos: somarCustos(operacoes),
    custoPorTalhao,
    producaoTotalSacas,
  }
}
