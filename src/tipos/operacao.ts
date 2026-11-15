export type TipoOperacao =
  | 'preparo'
  | 'plantio'
  | 'adubacao'
  | 'pulverizacao'
  | 'colheita'

export interface Operacao {
  id: string
  talhaoId: string
  tipo: TipoOperacao
  data: string
  descricao: string
  custoCentavos: number
  produtividadeScHa?: number
}

export interface CamposOperacao {
  tipo: TipoOperacao
  data: string
  descricao: string
  custoReais: string
  produtividadeScHa: string
}

export type ErrosOperacao = Partial<Record<keyof CamposOperacao, string>>
