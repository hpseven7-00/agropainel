import type { IndicadorPulverizacao } from '../tipos/clima'

export interface CondicoesPulverizacao {
  vento: number
  temperatura: number
  umidade: number
  precipitacao: number
  probabilidadeChuva: number
}

// Os limites e as mensagens seguem as regras A3 do enunciado.
export function avaliarPulverizacao(
  condicoes: CondicoesPulverizacao,
): IndicadorPulverizacao {
  const motivos: string[] = []

  if (condicoes.vento < 3) {
    motivos.push('Vento abaixo de 3 km/h, risco de inversão térmica')
  } else if (condicoes.vento > 10) {
    motivos.push('Vento acima de 10 km/h, risco de deriva')
  }

  if (condicoes.temperatura >= 30) {
    motivos.push('Temperatura de 30 °C ou mais')
  }
  if (condicoes.umidade < 55) {
    motivos.push('Umidade abaixo de 55%')
  }
  if (condicoes.precipitacao !== 0) {
    motivos.push('Chovendo agora')
  }
  if (condicoes.probabilidadeChuva >= 50) {
    motivos.push(`Chuva provável hoje (${condicoes.probabilidadeChuva}%)`)
  }

  const nivel =
    motivos.length === 0
      ? 'Favorável'
      : motivos.length === 1
        ? 'Atenção'
        : 'Desfavorável'

  return { nivel, motivos }
}
