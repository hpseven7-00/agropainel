export interface CartaoResumoProps {
  titulo: string
  valor: string
  detalhe?: string
}

export function CartaoResumo({ titulo, valor, detalhe }: CartaoResumoProps) {
  return (
    <article className="cartao-talhao">
      <h2>{titulo}</h2>
      <p className="valor-resumo">{valor}</p>
      {detalhe && <p>{detalhe}</p>}
    </article>
  )
}
