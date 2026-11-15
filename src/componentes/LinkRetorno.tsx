import { Link } from 'react-router-dom'

export interface LinkRetornoProps {
  destino: string
  texto: string
}

export function LinkRetorno({ destino, texto }: LinkRetornoProps) {
  return <p className="link-retorno"><Link to={destino}>← {texto}</Link></p>
}
