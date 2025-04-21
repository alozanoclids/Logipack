export interface Plan {
    adaptation_id: number;
    bom: string;
    client_id: number;
    codart: string;
    created_at: string;
    deliveryDate: string;
    factory: string | null;
    healthRegistration: string;
    id: number;
    ingredients: string;
    line: string | null;
    lot: string;
    machine: string | null;
    master: string;
    orderNumber: string;
    quantityToProduce: number;
    resource: string | null;
    status_date: string;
    updated_at: string;
    client_name?: string; 
}