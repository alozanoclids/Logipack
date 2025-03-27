import axios from 'axios';
import { API_URL } from '../../config/api';

const Maestras = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

interface Data {
    descripcion: string;
    requiere_bom: boolean;
    type_product: string; // Se envía como JSON.stringify, por eso es string
    type_stage: string; // Se envía como JSON.stringify, por eso es string
    status_type: string;
    aprobado: boolean;
}

// Crear una nueva Maestra
export const createMaestra = async (data: Data): Promise<any> => {
    try {
        const response = await Maestras.post('/newMaestra', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear la maestra:', error);
        throw error;
    }
};

// Obtener todas las Maestras
export const getMaestra = async (): Promise<any> => {
    try {
        const response = await Maestras.get('/getMaestra');
        return response.data;
    } catch (error) {
        console.error('Error en getMaestra:', error);
        throw error;
    }
};

// Eliminar una Maestra por su ID
export const deleteMaestra = async (id: number): Promise<any> => {
    try {
        const response = await Maestras.delete(`/deleteMaestra/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en deleteMaestra:', error);
        throw error;
    }
};

// Obtener una Maestra por su ID
export const getMaestraId = async (id: number): Promise<any> => {
    try {
        const response = await Maestras.get(`/MaestraId/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en getMaestraId:', error);
        throw error;
    }
};

// Obtener una Maestra por su nombre
export const getMaestraName = async (name: string): Promise<any> => {
    try {
        const response = await Maestras.get(`/MaestraName/${name}`);
        return response.data;
    } catch (error) {
        console.error('Error en getMaestraName:', error);
        throw error;
    }
};

// Actualizar una Maestra
export const updateMaestra = async (id: number, data: Data): Promise<any> => {
    try {
        const response = await Maestras.put(`/updateMaestra/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Error en updateMaestra:', error.response?.data || error.message);
        throw error;
    }
};

