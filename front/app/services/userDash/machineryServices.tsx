import axios from 'axios';
import { API_URL } from '../../config/api';

const Machinary = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const newMachin = async (data: FormData) => {
    try {
        const response = await Machinary.post('/newMachin', data);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error("Error al crear la Maquinaria:", error.response.data);
        } else {
            console.error("Error al crear la Maquinaria:", error);
        }
        throw error;
    }
};

export const getMachin = async () => {
    try {
        const response = await Machinary.get('/getMachin');
        return response.data;
    } catch (error: any) {
        console.error("Error en getMachin:", error);
        throw error; // Lanza otros errores para depuración
    }
}

export const getMachinById = async (id: number) => {
    try {
        const response = await Machinary.get(`/MachinId/${id}`);
        return response.data;
    } catch (error: any) {
        console.error("Error en MachinId:", error);
        throw error;
    }
}

export const updateMachin = async (id: number, data: FormData) => {
    try {
        const response = await Machinary.put(`/updateMachin/${id}`, data);
        return response.data; 
    } catch (error) {
        console.error('Error en updateMachin:', error);
        throw error;
    }
};

export const deleteMachin = async (id: number) => {
    try {
        const response = await Machinary.delete(`/deleteMachin/${id}`);
        return response.data;
    } catch (error: any) {
        console.error("Error en deleteMachin:", error);
        throw error; // Lanza otros errores para depuración
    }
}

