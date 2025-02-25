import axios from 'axios';
import { API_URL } from '../../config/api';

// Se crea una instancia de axios configurada con la URL base de la API y los encabezados necesarios.
const apiClients = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interfaz que define la estructura de los datos de un cliente.
// Incluye el nombre y un array de números que representa los tipos de línea.
export interface ClientsData {
    name: string;
    line_types: number[];
}

// Función para crear un nuevo cliente.
// Envía una solicitud POST a la ruta '/newClients' con los datos del cliente.
export const createClients = async (dataClientsData: ClientsData): Promise<void> => {
    try {
        const response = await apiClients.post('/newClients', dataClientsData);
        // Retorna la respuesta de la API (aunque la función se define para retornar void, se devuelve response.data).
        return response.data;
    } catch (error) {
        console.error('Error al crear la fábrica:', error);
        throw error;
    }
};

// Función para obtener la lista de clientes.
// Realiza una solicitud GET a la ruta '/getClients' y retorna los datos obtenidos.
export const getClients = async () => {
    try {
        const response = await apiClients.get(`/getClients`);
        return response.data;
    } catch (error) {
        console.error('Error en getClients:', error);
        throw error;
    }
}

// Función para eliminar un cliente específico por su ID.
// Realiza una solicitud DELETE a la ruta `/deleteClients/${id}`.
export const deleteClients = async (id: number) => {
    try {
        const response = await apiClients.delete(`/deleteClients/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en deleteClients:', error);
        throw error;
    }
}

// Función para obtener los datos de un cliente por su ID.
// Nota: Se utiliza el método PUT en lugar de GET, lo cual es inusual para recuperar datos.
// Es posible que se requiera revisar si realmente debe ser un GET.
export const getClientsId = async (id: number) => {
    try {
        const response = await apiClients.put(`/ClientsId/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en getClientsId:', error);
        throw error;
    }
}

// Función para actualizar la información de un cliente existente.
// Envía una solicitud PUT a la ruta `/updateClients/${id}` con los nuevos datos del cliente.
export const updateClients = async (id: number, data: { name: string; line_types: number[] }) => {
    try {
        const response = await apiClients.put(`/updateClients/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error en updateClients:', error);
        throw error;
    }
};
