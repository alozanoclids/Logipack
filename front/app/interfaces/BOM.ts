export interface Client {
  id: string;
  code: string;
  name: string;
}

export interface Article {
  codart: string;
  desart: string;
  coddiv: string;
  numberOrder?: string;
}

export interface Ingredient {
  codart: string;
  desart: string;
  quantity: string;
  merma: string;
  theoreticalQuantity?: string; // New field
  teorica: string;
  validar?: string;
}

export interface Bom {
  id: number;
  client_id: number;
  base_quantity: string;
  details: string;
  status: boolean;
}

export interface BomView extends Bom {
  client_name: string;
  article_codart: string;
  article_desart: string;
}
