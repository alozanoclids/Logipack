export interface Data {
  id: number;
  clientId: number;
  orderNumber: string;
  deliveryDate: string; 
  articleCode: string;
  lot: string;
  healthRegistration: string;
  quantityToProduce: number;
  attachment?: string;
  master?: string;  
  bom?: string; 
}

export interface BOM {
  id: number;
  client_id: number;
  base_quantity: string;
  details: string;  
  status: number;
  ingredients: string;  
  code_ingredients: string;
  code_details: string;
}

export interface BOMResponse {
  boms: BOM[];
}

export interface Adaptation {
    id: number;
    client_id: number;
    order_number: string;
    delivery_date: string;
    article_code: string;
    client_name?: string; // 🟢 Hacerlo opcional para evitar errores
}
