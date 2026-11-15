import { dataISOValida, dataLocalHoje } from './talhoes'
import type { ErrosOperacao, Operacao, TipoOperacao } from '../tipos/operacao'
import type { Talhao } from '../tipos/talhao'

export const TIPOS_OPERACAO: { id: TipoOperacao; nome: string }[] = [
  { id: 'preparo', nome: 'Preparo' },
  { id: 'plantio', nome: 'Plantio' },
  { id: 'adubacao', nome: 'Adubação' },
  { id: 'pulverizacao', nome: 'Pulverização' },
  { id: 'colheita', nome: 'Colheita' },
]

// A6: estas operações só podem ocorrer depois da data de plantio do talhão.
const EXIGE_PLANTIO: TipoOperacao[] = ['adubacao', 'pulverizacao', 'colheita']

export function validarOperacao(
  tipo: TipoOperacao,
  data: string,
  custoReais: string,
  produtividadeScHa: string,
  descricao: string,
  talhao: Talhao,
  operacoes: Operacao[],
  hoje = dataLocalHoje(),
): ErrosOperacao {
  const erros: ErrosOperacao = {}
  const custo = Number(custoReais)

  if (!descricao.trim()) erros.descricao = 'Informe uma descrição.'
  if (!dataISOValida(data)) {
    erros.data = 'Informe uma data válida.'
  } else if (data > hoje) {
    erros.data = 'A data da operação não pode ser futura.'
  } else if (EXIGE_PLANTIO.includes(tipo)) {
    if (!talhao.dataPlantio) {
      erros.data = 'Registre o plantio do talhão antes desta operação.'
    } else if (data < talhao.dataPlantio) {
      erros.data = 'A operação não pode ser anterior ao plantio.'
    }
  }

  if (!custoReais.trim() || !Number.isFinite(custo) || custo < 0) {
    erros.custoReais = 'Informe um custo igual ou maior que R$ 0,00.'
  }

  if (
    tipo === 'colheita' &&
    operacoes.some(
      (operacao) => operacao.talhaoId === talhao.id && operacao.tipo === 'colheita',
    )
  ) {
    erros.tipo = 'Este talhão já possui uma colheita registrada.'
  }

  if (tipo === 'colheita') {
    const produtividade = Number(produtividadeScHa)
    if (!Number.isFinite(produtividade) || produtividade <= 0) {
      erros.produtividadeScHa = 'Informe uma produtividade maior que 0 sc/ha.'
    }
  }

  return erros
}

// O formulário recebe reais; o domínio guarda sempre centavos inteiros.
export function reaisParaCentavos(valor: string): number {
  return Math.round((Number(valor) + Number.EPSILON) * 100)
}

export function producaoEmSacas(talhao: Talhao, operacao: Operacao): number {
  if (operacao.tipo !== 'colheita' || operacao.produtividadeScHa === undefined) {
    return 0
  }
  return Math.round(operacao.produtividadeScHa * talhao.areaHa)
}

export function somarCustos(operacoes: Operacao[]): number {
  return operacoes.reduce((total, operacao) => total + operacao.custoCentavos, 0)
}
