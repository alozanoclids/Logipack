import axios from 'axios';
import { API_URL } from '../../config/api';

// Se crea una instancia de axios configurada con la URL base de la API y encabezados predeterminados.
const apiProducts = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interfaz que define la estructura de los datos para crear o actualizar un Product.
// En este caso, solo se requiere el campo "name".
export interface Data {
    name: string;
}

// Función para crear un nuevo Product.
// Envía una solicitud POST a la ruta '/newProduct' con los datos proporcionados.
export const createProduct = async (data: { name: string }) => { 
    const response = await apiProducts.post('/newProduct', data);
    return response.data;
  };

// Función para obtener todos los Products.
// Realiza una solicitud GET a la ruta '/getProduct' y retorna los datos recibidos.
export const getProduct = async () => {
    try {
        const response = await apiProducts.get(`/getProduct`);
        return response.data;
    } catch (error) {
        console.error('Error en getProduct:', error);
        throw error;
    }
};

// Función para eliminar un Product en específico por su ID.
// Realiza una solicitud DELETE a la ruta `/deleteProduct/${id}`.
export const deleteProduct = async (id: number) => { 
    try {
        const response = await apiProducts.delete(`/deleteProduct/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en deleteProduct:', error);
        throw error;
    }
};

// Función para obtener un Product específico por su ID.
// Nota: Se utiliza el método PUT en lugar de GET, lo cual es inusual para obtener datos. 
// Es posible que se deba revisar si la ruta o el método es el correcto.
export const getProductId = async (id: number) => {
    try {
        const response = await apiProducts.get(`/ProductId/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en getProductId:', error);
        throw error;
    }
};

// Función para obtener un Product específico por su ID.
// Nota: Se utiliza el método PUT en lugar de GET, lo cual es inusual para obtener datos. 
// Es posible que se deba revisar si la ruta o el método es el correcto.
export const getProductName = async (name: string) => {
    try {
        const response = await apiProducts.get(`/ProductName/${name}`);
        return response.data;
    } catch (error) {
        console.error('Error en getProductId:', error);
        throw error;
    }
};

// Función para actualizar un Product existente.
// Envía una solicitud PUT a la ruta `/updateProduct/${id}` con los nuevos datos del Product. 
export const updateProduct = async (id: number, data: { name: string }) => {
    try {
        const response = await apiProducts.put(`/updateProduct/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error en updateProduct:', error);
        throw error;
    }
};
