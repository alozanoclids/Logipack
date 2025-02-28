import axios from 'axios';
import { API_URL } from '../../config/api';

// Se crea una instancia de axios configurada con la URL base de la API y los encabezados necesarios.
const apiClients = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Función para crear un nuevo cliente.
export const createClients = async (dataClientsData: Record<string, any>): Promise<any> => {
    try {
        const response = await apiClients.post('/newClients', dataClientsData);
        return response.data;
    } catch (error: any) {
        console.error('Error al crear el cliente:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al crear el cliente');
    }
};

// Función para obtener la lista de clientes.
export const getClients = async (): Promise<any[]> => {
    try {
        const response = await apiClients.get('/getClients');
        return response.data;
    } catch (error: any) {
        console.error('Error en getClients:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener clientes');
    }
};

// Función para eliminar un cliente por su ID.
export const deleteClients = async (id: number): Promise<any> => {
    try {
        const response = await apiClients.delete(`/deleteClients/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('Error en deleteClients:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al eliminar cliente');
    }
};

// Función para obtener los datos de un cliente por su ID.
export const getClientsId = async (id: number): Promise<any> => {
    try {
        const response = await apiClients.get(`/ClientsId/${id}`);
        return response.data;
    } catch (error: any) {
        console.error('Error en getClientsId:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener cliente por ID');
    }
};

// Función para actualizar la información de un cliente existente.
export const updateClients = async (id: number, data: Record<string, any>): Promise<any> => {
    try {
        const payload = {
            ...data,
            responsible_person: data.responsible_person ?? [],
        };

        const response = await apiClients.put(`/updateClients/${id}`, payload);
        return response.data;
    } catch (error: any) {
        console.error('Error en updateClients:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al actualizar cliente');
    }
};
