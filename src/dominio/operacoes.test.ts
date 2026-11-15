import { describe, expect, it } from 'vitest'
import {
  producaoEmSacas,
  reaisParaCentavos,
  validarOperacao,
} from './operacoes'
import { resumirSafra } from './relatorio'
import type { Operacao, TipoOperacao } from '../tipos/operacao'
import type { Talhao } from '../tipos/talhao'

const hoje = '2026-11-09'
const talhao: Talhao = {
  id: 'talhao-1',
  nome: 'Talhão 1',
  cultura: 'soja',
  areaHa: 250,
  municipioId: 'balsas',
  dataPlantio: '2026-10-01',
}

function operacao(tipo: TipoOperacao, alteracoes: Partial<Operacao> = {}): Operacao {
  return {
    id: `operacao-${tipo}`,
    talhaoId: talhao.id,
    tipo,
    data: '2026-10-10',
    descricao: 'Operação da safra',
    custoCentavos: 0,
    ...alteracoes,
  }
}

function validar(
  tipo: TipoOperacao,
  data = '2026-10-10',
  produtividade = '',
  operacoes: Operacao[] = [],
  area = talhao,
) {
  return validarOperacao(
    tipo,
    data,
    '0',
    produtividade,
    'Operação da safra',
    area,
    operacoes,
    hoje,
  )
}

describe('validação das operações', () => {
  it('exige plantio antes de adubação, pulverização e colheita', () => {
    const semPlantio = { ...talhao, dataPlantio: null }
    expect(validar('adubacao', '2026-10-10', '', [], semPlantio).data).toContain(
      'Registre o plantio',
    )
  })

  it('impede pulverização antes da data de plantio', () => {
    expect(validar('pulverizacao', '2026-09-30').data).toBe(
      'A operação não pode ser anterior ao plantio.',
    )
  })

  it('não permite operação com data futura', () => {
    expect(validar('preparo', '2026-11-10').data).toBe(
      'A data da operação não pode ser futura.',
    )
  })

  it('não aceita custo vazio ou negativo', () => {
    expect(
      validarOperacao('preparo', '2026-10-10', '', '', 'Preparo', talhao, [], hoje)
        .custoReais,
    ).toContain('custo')
    expect(
      validarOperacao('preparo', '2026-10-10', '-1', '', 'Preparo', talhao, [], hoje)
        .custoReais,
    ).toContain('custo')
  })

  it('aceita somente uma colheita por talhão', () => {
    expect(
      validar('colheita', '2026-10-10', '62', [operacao('colheita')]).tipo,
    ).toContain('já possui uma colheita')
  })

  it('exige produtividade positiva na colheita', () => {
    expect(validar('colheita', '2026-10-10').produtividadeScHa).toContain(
      'maior que 0',
    )
    expect(validar('colheita', '2026-10-10', '62').produtividadeScHa).toBeUndefined()
  })

  it('converte reais em centavos inteiros e calcula as sacas da colheita', () => {
    expect(reaisParaCentavos('125000.00')).toBe(12500000)
    expect(
      producaoEmSacas(
        talhao,
        operacao('colheita', { produtividadeScHa: 62 }),
      ),
    ).toBe(15500)
  })
})

describe('relatório da safra', () => {
  it('calcula áreas, custo por hectare e produção dos talhões colhidos', () => {
    const operacoes = [
      operacao('preparo', { custoCentavos: reaisParaCentavos('125000') }),
      operacao('adubacao', { custoCentavos: reaisParaCentavos('37500') }),
      operacao('colheita', {
        custoCentavos: 0,
        produtividadeScHa: 62,
      }),
    ]
    const resumo = resumirSafra([talhao], operacoes)

    expect(resumo.areaPorCultura.find((item) => item.cultura === 'Soja')?.areaHa).toBe(250)
    expect(resumo.custoTotalCentavos).toBe(16250000)
    expect(resumo.custoPorTalhao[0].custoPorHectareCentavos).toBe(65000)
    expect(resumo.producaoTotalSacas).toBe(15500)
  })

  it('mostra totais zerados quando ainda não há dados', () => {
    const resumo = resumirSafra([], [])
    expect(resumo.custoTotalCentavos).toBe(0)
    expect(resumo.producaoTotalSacas).toBe(0)
    expect(resumo.areaPorCultura.every((item) => item.areaHa === 0)).toBe(true)
  })
})
