import axios from 'axios';
import {API_URL} from '../../config/api' 

// Se crea una instancia de axios con la configuración base de la API.
const Maestras = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaz que define la estructura de los datos para crear o actualizar un Maestra.
// En este caso, solo se requiere el campo "name".
export interface Data {
    name: string;
    code: string;
    descripcion: string;
    requiere_bom: boolean;
    type_product: string[];
    status: string;
    aprobado: boolean;
}

// Función para crear un nuevo Maestra.
// Envía una solicitud POST a la ruta '/newMaestra' con los datos proporcionados.
export const createMaestra = async (data: Data): Promise<void> => {
    try {
        const response = await Maestras.post('/newMaestra', data);
        return response.data;
    } catch (error) {
        console.error('Error al crear la fábrica:', error);
        throw error;
    }
};

// Función para obtener todos los Maestras.
// Realiza una solicitud GET a la ruta '/getMaestra' y retorna los datos recibidos.
export const getMaestra = async () => {
    try {
        const response = await Maestras.get(`/getMaestra`);
        return response.data;
    } catch (error) {
        console.error('Error en getMaestra:', error);
        throw error;
    }
};

// Función para eliminar un Maestra en específico por su ID.
// Realiza una solicitud DELETE a la ruta `/deleteMaestra/${id}`.
export const deleteMaestra = async (id: number) => {
    try {
        const response = await Maestras.delete(`/deleteMaestra/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en deleteMaestra:', error);
        throw error;
    }
};

// Función para obtener un Maestra específico por su ID.
// Nota: Se utiliza el método PUT en lugar de GET, lo cual es inusual para obtener datos. 
// Es posible que se deba revisar si la ruta o el método es el correcto.
export const getMaestraId = async (id: number) => {
    try {
        const response = await Maestras.get(`/MaestraId/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error en getMaestraId:', error);
        throw error;
    }
};

// Función para obtener un Maestra específico por su ID.
// Nota: Se utiliza el método PUT en lugar de GET, lo cual es inusual para obtener datos. 
// Es posible que se deba revisar si la ruta o el método es el correcto.
export const getMaestraName = async (name: string) => {
    try {
        const response = await Maestras.get(`/MaestraName/${name}`);
        return response.data;
    } catch (error) {
        console.error('Error en getMaestraId:', error);
        throw error;
    }
};

// Función para actualizar un Maestra existente.
// Envía una solicitud PUT a la ruta `/updateMaestra/${id}` con los nuevos datos del Maestra. 
export const updateMaestra = async (id: number, data: { name: string }) => {
    try {
        const response = await Maestras.put(`/updateMaestra/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error en updateMaestra:', error);
        throw error;
    }
};
