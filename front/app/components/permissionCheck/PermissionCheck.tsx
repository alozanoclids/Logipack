"use client";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getPermissionRole } from "../../services/roleServices";

type PermissionCheckProps = {
    children: React.ReactNode;
    requiredPermission: string;
};

interface PermissionRoleResponse {
    permissions: string[];
}

const PermissionCheck = ({ children, requiredPermission }: PermissionCheckProps) => {
    const { role, loading } = useAuth();
    const [hasPermission, setHasPermission] = useState(false);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (!loading && role) {
            getPermissionRole(role)
                .then((data: PermissionRoleResponse) => {
                    if (data.permissions && data.permissions.includes(requiredPermission)) {
                        setHasPermission(true);
                    }
                })
                .catch((error) => {
                    console.error("Error en getPermissionRole:", error);
                })
                .finally(() => {
                    setFetched(true);
                });
        }
    }, [loading, role, requiredPermission]);

    if (loading || !fetched) return <p>Cargando...</p>;
    if (!hasPermission) return null;

    return <>{children}</>;
};

export default PermissionCheck;
