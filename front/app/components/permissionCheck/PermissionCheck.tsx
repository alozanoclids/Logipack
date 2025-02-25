import React, { useEffect, useState, cloneElement, ReactElement } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPermissionRole } from "../../services/userDash/roleServices";
import Loader from "../loader/Loader";

type PermissionCheckProps = {
  children: ReactElement;
  requiredPermission: string;
};

interface PermissionRoleResponse {
  permissions: string[];
}

// Cache simple para permisos
const permissionCache: { [role: string]: string[] } = {};

const PermissionInputs = ({ children, requiredPermission }: PermissionCheckProps) => {
  const { role, loading } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!loading && role) {
      if (permissionCache[role]) {
        // Si ya está en cache, usa la información almacenada
        setHasPermission(permissionCache[role].includes(requiredPermission));
        setFetched(true);
      } else {
        // Si no, realiza la llamada y guarda en cache
        getPermissionRole(role)
          .then((data: PermissionRoleResponse) => {
            permissionCache[role] = data.permissions;
            setHasPermission(data.permissions.includes(requiredPermission));
          })
          .catch((error) => {
            console.error("Error en getPermissionRole:", error);
          })
          .finally(() => {
            setFetched(true);
          });
      }
    }
  }, [loading, role, requiredPermission]);

  if (loading || !fetched) return <Loader />;

  if (hasPermission) return children;

  return cloneElement(children as ReactElement<any>, { readOnly: true, disabled: true });
};

export default PermissionInputs;
