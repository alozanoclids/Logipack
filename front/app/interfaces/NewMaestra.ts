export interface Stage {
    id: number;
    description: string;
}

export interface Data {
    id: number;
    code: number;
    descripcion: string;
    requiere_bom: boolean;
    type_product: string;
    type_stage: string;
    status_type: string;
    aprobado: boolean;
}

