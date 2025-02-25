// hooks/useHasPermission.ts
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPermissionRole } from "../services/userDash/roleServices";

interface PermissionRoleResponse {
    permissions: string[];
}

export const useHasPermission = (requiredPermission: string) => {
    const { role, loading } = useAuth();
    const [hasPermission, setHasPermission] = useState(false);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (!loading && role) {
            getPermissionRole(role)
                .then((data: PermissionRoleResponse) => {
                    setHasPermission(data.permissions.includes(requiredPermission));
                })
                .catch((error) => {
                    console.error("Error en getPermissionRole:", error);
                })
                .finally(() => {
                    setFetched(true);
                });
        }
    }, [loading, role, requiredPermission]);

    return { hasPermission, loading: loading || !fetched };
};
