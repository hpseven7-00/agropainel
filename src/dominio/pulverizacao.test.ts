import { describe, expect, it } from 'vitest'
import { avaliarPulverizacao } from './pulverizacao'

const condicoesFavoraveis = {
  vento: 6,
  temperatura: 27,
  umidade: 70,
  precipitacao: 0,
  probabilidadeChuva: 20,
}

describe('avaliarPulverizacao', () => {
  it('considera favoráveis os limites inclusivos de vento e umidade', () => {
    expect(
      avaliarPulverizacao({
        ...condicoesFavoraveis,
        vento: 3,
        umidade: 55,
      }).nivel,
    ).toBe('Favorável')
  })

  it('considera favorável o vento máximo permitido', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, vento: 10 }).nivel,
    ).toBe('Favorável')
  })

  it('alerta para vento abaixo de 3 km/h', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, vento: 2 }).motivos,
    ).toContain('Vento abaixo de 3 km/h, risco de inversão térmica')
  })

  it('alerta para vento acima de 10 km/h', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, vento: 12 }).motivos,
    ).toContain('Vento acima de 10 km/h, risco de deriva')
  })

  it('considera 30 °C uma condição de atenção', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, temperatura: 30 }).motivos,
    ).toContain('Temperatura de 30 °C ou mais')
  })

  it('avisa quando a umidade fica abaixo de 55%', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, umidade: 54 }).motivos,
    ).toContain('Umidade abaixo de 55%')
  })

  it('avisa quando está chovendo', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, precipitacao: 0.1 }).motivos,
    ).toContain('Chovendo agora')
  })

  it('avisa a partir de 50% de probabilidade de chuva', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, probabilidadeChuva: 50 }).motivos,
    ).toContain('Chuva provável hoje (50%)')
  })

  it('classifica uma condição fora do limite como atenção', () => {
    expect(
      avaliarPulverizacao({ ...condicoesFavoraveis, temperatura: 30 }).nivel,
    ).toBe('Atenção')
  })

  it('classifica duas condições fora do limite como desfavorável', () => {
    expect(
      avaliarPulverizacao({
        ...condicoesFavoraveis,
        vento: 2,
        temperatura: 30,
      }).nivel,
    ).toBe('Desfavorável')
  })
})
