export interface EstadoVazioProps {
  mensagem: string
}

export function EstadoVazio({ mensagem }: EstadoVazioProps) {
  return <p className="lista-vazia" role="status">{mensagem}</p>
}
