export type ActivityType = {
    type?: string;
    placeholder?: string;
    accept?: string;
    options?: string[];
};

export interface Activities {
    id: number;
    code: number;
    description: string;
    config: string;
    binding: boolean;
}

export interface EditFormData {
    id: number;
    description: string;
    config: string;
    binding: boolean;
    options?: string[]; // Opciones dinámicas
}