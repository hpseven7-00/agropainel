import { describe, expect, it } from 'vitest'
import {
  dataISOValida,
  diasDesdePlantio,
  preverColheita,
  situacaoTalhao,
  validarTalhao,
} from './talhoes'
import type { CamposTalhao, Talhao } from '../tipos/talhao'
import type { Operacao } from '../tipos/operacao'

const hoje = '2026-11-09'
const talhaoBase: Talhao = {
  id: 'talhao-1',
  nome: 'Talhão 1',
  cultura: 'soja',
  areaHa: 250,
  municipioId: 'balsas',
  dataPlantio: '2026-10-01',
}

const camposValidos: CamposTalhao = {
  nome: 'Talhão 2',
  cultura: 'soja',
  areaHa: '250',
  municipioId: 'balsas',
  dataPlantio: '',
}

describe('regras de talhões', () => {
  it('calcula dias e previsão da soja sem erro de fuso horário', () => {
    expect(diasDesdePlantio('2026-10-01', hoje)).toBe(39)
    expect(preverColheita(talhaoBase)).toBe('2027-01-29')
    expect(situacaoTalhao(talhaoBase, hoje)).toBe('Em desenvolvimento')
  })

  it('marca o milho próximo da colheita no cenário do enunciado', () => {
    const milho: Talhao = { ...talhaoBase, cultura: 'milho', dataPlantio: '2026-07-01' }
    expect(diasDesdePlantio('2026-07-01', hoje)).toBe(131)
    expect(preverColheita(milho)).toBe('2026-11-18')
    expect(situacaoTalhao(milho, hoje)).toBe('Colheita próxima')
  })

  it('marca como ponto de colheita quando o ciclo terminou', () => {
    const feijao: Talhao = { ...talhaoBase, cultura: 'feijao', dataPlantio: '2026-08-01' }
    expect(preverColheita(feijao)).toBe('2026-10-30')
    expect(situacaoTalhao(feijao, hoje)).toBe('Ponto de colheita')
  })

  it('aguarda o plantio e não prevê colheita sem data', () => {
    const semPlantio = { ...talhaoBase, dataPlantio: null }
    expect(situacaoTalhao(semPlantio, hoje)).toBe('Aguardando plantio')
    expect(preverColheita(semPlantio)).toBeNull()
  })

  it('marca o talhão como colhido quando há operação de colheita', () => {
    const colheita: Operacao = {
      id: 'colheita-1',
      talhaoId: talhaoBase.id,
      tipo: 'colheita',
      data: '2026-10-10',
      descricao: 'Colheita da safra',
      custoCentavos: 0,
      produtividadeScHa: 62,
    }
    expect(situacaoTalhao(talhaoBase, hoje, [colheita])).toBe('Colhido')
  })

  it('recusa nomes duplicados sem diferenciar maiúsculas', () => {
    const erros = validarTalhao(
      { ...camposValidos, nome: ' talhão 1 ' },
      [talhaoBase],
      hoje,
    )
    expect(erros.nome).toBe('Já existe um talhão com esse nome.')
  })

  it('permite editar sem acusar o próprio nome como duplicado', () => {
    const erros = validarTalhao(
      { ...camposValidos, nome: talhaoBase.nome },
      [talhaoBase],
      hoje,
      talhaoBase.id,
    )
    expect(erros.nome).toBeUndefined()
  })

  it('recusa área acima de 10.000 hectares', () => {
    const erros = validarTalhao({ ...camposValidos, areaHa: '10001' }, [], hoje)
    expect(erros.areaHa).toBe('A área máxima é 10.000 ha.')
  })

  it('recusa data de plantio futura e permite data vazia', () => {
    expect(
      validarTalhao({ ...camposValidos, dataPlantio: '2026-11-10' }, [], hoje).dataPlantio,
    ).toBe('A data de plantio não pode ser futura.')
    expect(validarTalhao(camposValidos, [], hoje).dataPlantio).toBeUndefined()
  })

  it('rejeita datas inexistentes do calendário', () => {
    expect(dataISOValida('2026-02-30')).toBe(false)
    expect(
      validarTalhao({ ...camposValidos, dataPlantio: '2026-02-30' }, [], hoje).dataPlantio,
    ).toBe('Informe uma data válida.')
  })
})
