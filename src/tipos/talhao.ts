export type Cultura = 'soja' | 'milho' | 'algodao' | 'arroz' | 'feijao'

export type SituacaoTalhao =
  | 'Colhido'
  | 'Aguardando plantio'
  | 'Em desenvolvimento'
  | 'Colheita próxima'
  | 'Ponto de colheita'

export interface Talhao {
  id: string
  nome: string
  cultura: Cultura
  areaHa: number
  municipioId: string
  dataPlantio: string | null
}

export type CamposTalhao = Pick<
  Talhao,
  'nome' | 'cultura' | 'municipioId' | 'dataPlantio'
> & {
  areaHa: string
}

export type ErrosTalhao = Partial<Record<keyof CamposTalhao, string>>
