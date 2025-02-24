import axios from 'axios';

import { API_URL } from '../config/api' 

// Se crea una instancia de axios con la configuración base de la API.
const apiRole = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getPermissions = async () => {
    try {
        const response = await apiRole.get('/permissions');
        return response.data;
    } catch (error) {
        console.error('Error en getPermissions:', error);
        throw error;
    }
};

export const updateRolePermissions = async (roleId: number, permissionIds: number) => {
    try {
        await apiRole.post(`/permissionsUpdate/`, { roleId, permissionIds });
    } catch (error) {
        console.error("Error actualizando permisos:", error);
        throw error;
    }
};

export const getPermissionRole = async (role: string) => {
    try {
        const response = await apiRole.get(`/role-permissions/${role}`);
        return response.data;
    } catch (error) {
        console.error("Error en getPermissionRole:", error);
        throw error;
    }
}

export const createPermission = async (name: string, description: string, status: boolean) => {
    try {
        const response = await apiRole.post('/newPermission', { name, description, status });
        return response.data;
    } catch (error: any) {
        console.error('Error en createPermission:', error.response?.data || error.message);
        throw error;
    }
}
