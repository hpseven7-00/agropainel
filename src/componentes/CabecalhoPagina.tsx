import type { ReactNode } from 'react'

export interface CabecalhoPaginaProps {
  titulo: string
  subtitulo?: string
  children?: ReactNode
}

// Mantém o mesmo cabeçalho nas telas principais.
export function CabecalhoPagina({
  titulo,
  subtitulo = 'AgroPainel',
  children,
}: CabecalhoPaginaProps) {
  return (
    <header className="titulo-pagina">
      <div>
        <p className="sobretitulo">{subtitulo}</p>
        <h1>{titulo}</h1>
      </div>
      {children}
    </header>
  )
}
