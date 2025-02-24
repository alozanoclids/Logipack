import axios from 'axios';
import { API_URL } from '../config/api'

// Se crea una instancia de axios con la configuración base de la API.
const apiClients = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface ClientsData {
    name: string;
    line_types: number[];
}


export const createClients = async (dataClientsData: ClientsData): Promise<void> => {
    try {
        const response = await apiClients.post('/newClients', dataClientsData);
        return response.data;
    } catch (error) {
        console.error('Error al crear la fábrica:', error);
        throw error;
    }
};

export const getClients = async () => {
    try {
        const response = await apiClients.get(`/getClients`);
        return response.data;
    } catch (error) {
        console.error('Error en getClients:', error);
        throw error;
    }
}

export const deleteClients = async (id: number) => {
    try {
        const response = await apiClients.delete(`/deleteClients/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en deleteClients:', error);
        throw error;
    }
}

export const getClientsId = async (id: number) => {
    try {
        const response = await apiClients.put(`/ClientsId/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en getClientsId:', error);
        throw error;
    }
}

export const updateClients = async (id: number, data: { name: string; line_types: number[] }) => {
    try {
        const response = await apiClients.put(`/updateClients/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error en updateClients:', error);
        throw error;
    }
};
