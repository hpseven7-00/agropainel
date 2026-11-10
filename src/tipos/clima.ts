export interface ClimaAtual {
  horario: string
  temperatura: number
  umidade: number
  precipitacao: number
  vento: number
  codigoTempo: number
}

export interface PrevisaoDiaria {
  data: string[]
  codigoTempo: number[]
  temperaturaMaxima: number[]
  temperaturaMinima: number[]
  precipitacao: number[]
  probabilidadeChuva: number[]
}

export interface Clima {
  atual: ClimaAtual
  previsao: PrevisaoDiaria
}

export type NivelPulverizacao = 'Favorável' | 'Atenção' | 'Desfavorável'

export interface IndicadorPulverizacao {
  nivel: NivelPulverizacao
  motivos: string[]
}
