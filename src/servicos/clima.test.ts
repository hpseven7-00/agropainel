import { afterEach, describe, expect, it, vi } from 'vitest'
import { MUNICIPIOS } from '../dados/municipios'
import { buscarClima } from './clima'

afterEach(() => vi.unstubAllGlobals())

describe('serviço de clima', () => {
  it('devolve clima atual mesmo quando a previsão diária está vazia', async () => {
    const resposta = {
      current: {
        time: '2026-11-14T12:00',
        temperature_2m: 27,
        relative_humidity_2m: 70,
        precipitation: 0,
        wind_speed_10m: 6,
        weather_code: 1,
      },
      daily: {
        time: [],
        weather_code: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
        precipitation_sum: [],
        precipitation_probability_max: [],
      },
    }
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(resposta), { status: 200 })),
    )

    const clima = await buscarClima(MUNICIPIOS[0], new AbortController().signal)

    expect(clima.atual.temperatura).toBe(27)
    expect(clima.previsao.data).toEqual([])
  })

  it('retorna erro claro quando a API responde com falha', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 503 })),
    )

    await expect(
      buscarClima(MUNICIPIOS[0], new AbortController().signal),
    ).rejects.toThrow('Não foi possível consultar o clima')
  })
})
