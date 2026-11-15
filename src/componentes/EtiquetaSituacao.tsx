import type { SituacaoTalhao } from '../tipos/talhao'

export interface EtiquetaSituacaoProps {
  situacao: SituacaoTalhao
}

const CLASSES: Record<SituacaoTalhao, string> = {
  Colhido: 'situacao-colhido',
  'Aguardando plantio': 'situacao-aguardando',
  'Em desenvolvimento': 'situacao-desenvolvimento',
  'Colheita próxima': 'situacao-proxima',
  'Ponto de colheita': 'situacao-ponto',
}

export function EtiquetaSituacao({ situacao }: EtiquetaSituacaoProps) {
  return <span className={`etiqueta-situacao ${CLASSES[situacao]}`}>{situacao}</span>
}
