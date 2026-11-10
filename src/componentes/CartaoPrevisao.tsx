import { descreverTempo } from '../dominio/descricaoTempo'

export interface CartaoPrevisaoProps {
  data: string
  temperaturaMinima: number
  temperaturaMaxima: number
  probabilidadeChuva: number
  codigoTempo: number
}

// Mostra a previsão de um único dia no painel.
export function CartaoPrevisao({
  data,
  temperaturaMinima,
  temperaturaMaxima,
  probabilidadeChuva,
  codigoTempo,
}: CartaoPrevisaoProps) {
  const dia = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(`${data}T12:00:00`))

  return (
    <article className="cartao dia">
      <h3>{dia}</h3>
      <p>{descreverTempo(codigoTempo)}</p>
      <p>
        {temperaturaMinima}° / {temperaturaMaxima}°C
      </p>
      <p>Chuva: {probabilidadeChuva}%</p>
    </article>
  )
}
