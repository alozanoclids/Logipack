import axios from "axios";

import {API_URL} from '../config/api' 

// 🔹 Interfaz para un ingrediente
export interface Ingredient {
  id: string | number;
  data: {
    nombre: string;
    proveedor: string;
    tipo: string;
    concentracion: string;
    [key: string]: any; // Para otros campos dinámicos

  };
  status: boolean; // Agrega la propiedad `status`

}


// 🔹 Configuración de Axios
const ingredientService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Obtener la lista de ingredientes
export const getIngredients = async (): Promise<Ingredient[]> => {
  try {
    const response = await ingredientService.get<Ingredient[]>("/ingredients/list");
    return response.data;
  } catch (error) {
    console.error("Error en getIngredients:", error);
    throw error;
  }
};

// Eliminar un ingrediente
export const deleteIngredient = async (id: string | number): Promise<void> => {
  try {
    await ingredientService.delete(`/ingredients/${id}/delete`);
  } catch (error) {
    console.error("Error en deleteIngredient:", error);
    throw error;
  }
};

export const getIngredientById = async (id: string | number): Promise<Record<string, any>> => {
  try {
    const response = await ingredientService.get(`/ingredients/${id}`); // ✅ Usar axios correctamente
    console.log("Datos obtenidos en getIngredientById:", response.data); 
    return response.data; // ✅ Retornar la data correctamente
  } catch (error) {
    console.error("Error en getIngredientById:", error);
    throw error;
  }
};



export const createIngredient = async (data: Record<string, any>) => {
  try {
    const payload = { data }; // Envuelve el JSON dentro de "data"
    console.log("Enviando datos:", JSON.stringify(payload, null, 2));

    const response = await ingredientService.post("/ingredients/create", payload);

    console.log("Respuesta del servidor:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error del servidor:", error.response.data);
    } else if (error.request) {
      console.error("Error en la solicitud:", error.request);
    } else {
      console.error("Error desconocido:", error.message);
    }
    throw error;
  }
};





// 🔹 Actualizar un ingrediente
export const updateIngredient = async (id: string | number, data: Partial<Ingredient>): Promise<Ingredient> => {
  try {
    const response = await ingredientService.put<Ingredient>(`/ingredients/${id}/update`, data);
    return response.data;
  } catch (error) {
    console.error("Error en updateIngredient:", error);
    throw error;
  }
};

// 🔹 Desactivar un ingrediente
export const toggleIngredientStatus = async (id: string | number): Promise<Ingredient> => {
  try {
    const response = await ingredientService.put<Ingredient>(`/ingredients/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error("Error en toggleIngredientStatus:", error);
    throw error;
  }
};
