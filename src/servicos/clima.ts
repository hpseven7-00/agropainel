import type { Clima } from '../tipos/clima'
import type { Municipio } from '../tipos/municipio'

interface RespostaOpenMeteo {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
    wind_speed_10m: number
    weather_code: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    precipitation_probability_max: number[]
  }
}

const CAMPOS_ATUAIS = [
  'temperature_2m',
  'relative_humidity_2m',
  'precipitation',
  'wind_speed_10m',
  'weather_code',
]

const CAMPOS_DIARIOS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
]

function eObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function eListaNumerica(valor: unknown): valor is number[] {
  return Array.isArray(valor) && valor.every((item) => typeof item === 'number')
}

function respostaValida(valor: unknown): valor is RespostaOpenMeteo {
  if (!eObjeto(valor)) return false
  const atuais = valor.current
  const dias = valor.daily
  if (!eObjeto(atuais) || !eObjeto(dias)) return false
  const atuaisValidos =
    typeof atuais.time === 'string' &&
    CAMPOS_ATUAIS.every((campo) => typeof atuais[campo] === 'number')
  const datas = dias.time
  const listasValidas =
    Array.isArray(datas) &&
    datas.length >= 7 &&
    datas.every((dia) => typeof dia === 'string') &&
    CAMPOS_DIARIOS.every(
      (campo) =>
        eListaNumerica(dias[campo]) && dias[campo].length === datas.length,
    )

  return atuaisValidos && listasValidas
}

export async function buscarClima(
  municipio: Municipio,
  sinal: AbortSignal,
): Promise<Clima> {
  const parametros = new URLSearchParams({
    latitude: municipio.latitude,
    longitude: municipio.longitude,
    current: CAMPOS_ATUAIS.join(','),
    daily: CAMPOS_DIARIOS.join(','),
    timezone: 'America/Fortaleza',
    forecast_days: '7',
  })

  const resposta = await fetch(
    `https://api.open-meteo.com/v1/forecast?${parametros}`,
    { signal: sinal },
  )

  if (!resposta.ok) {
    throw new Error('Não foi possível consultar o clima deste município.')
  }
  const dados: unknown = await resposta.json()
  if (!respostaValida(dados)) {
    throw new Error('A resposta do serviço de clima está em um formato inesperado.')
  }

  const { current: atuais, daily: dias } = dados
  return {
    atual: {
      horario: atuais.time,
      temperatura: atuais.temperature_2m,
      umidade: atuais.relative_humidity_2m,
      precipitacao: atuais.precipitation,
      vento: atuais.wind_speed_10m,
      codigoTempo: atuais.weather_code,
    },
    previsao: {
      data: dias.time,
      codigoTempo: dias.weather_code,
      temperaturaMaxima: dias.temperature_2m_max,
      temperaturaMinima: dias.temperature_2m_min,
      precipitacao: dias.precipitation_sum,
      probabilidadeChuva: dias.precipitation_probability_max,
    },
  }
}
