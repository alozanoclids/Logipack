"use client";
import React, { useEffect, useState, cloneElement, ReactElement } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPermissionRole } from "../../services/roleServices";

type PermissionCheckProps = {
  children: ReactElement; // se espera un único elemento React
  requiredPermission: string;
};

interface PermissionRoleResponse {
  permissions: string[];
}

const PermissionInputs = ({ children, requiredPermission }: PermissionCheckProps) => {
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

  // Si tiene permiso, retorna el componente tal cual
  if (hasPermission) return children;

  // Si no tiene permiso, retorna el componente modificado a solo lectura/inhabilitado
  return cloneElement(children as ReactElement<any>, { readOnly: true, disabled: true });
};

export default PermissionInputs;
