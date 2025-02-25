import React, { useState, useEffect } from "react";
import CreateUser from "./CreateUser";
import DataUsers from "./DataUsers";
import WindowManager from "../windowManager/WindowManager";
import Roles from "../roles/Roles";
import Factory from "./CreateFactory"
import Lista from "./CreateManufacturing"
import Clients from "./CreateClient"
import { useAuth } from "../../hooks/useAuth";
import { getUserByEmail } from "../../services/authservices";
import PermissionCheck from "..//permissionCheck/PermissionCheck";
import nookies from "nookies";

function User() {
  const { isAuthenticated } = useAuth();
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const cookies = nookies.get(null);
        const email = cookies.email;
        if (email) {
          const decodedEmail = decodeURIComponent(email);
          const user = await getUserByEmail(decodedEmail);
          if (user.usuario) {
            setUserName(user.usuario.name);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("No se pudo obtener la información del usuario.");
      }
    };

    if (isAuthenticated) fetchUserData();
  }, [isAuthenticated]);

  return (
    <div>
      {/* Administrador de ventanas */}
      <WindowManager
        windowsData={[
          {
            id: 1, title: "Usuarios", component:
              <PermissionCheck requiredPermission="crear_usuarios">
                <div>
                  {/* Botón arriba y tabla abajo */}
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <CreateUser />
                  </div>

                  {/* Tabla de usuarios */}
                  <div className="overflow-x-auto">
                    <DataUsers />
                  </div>
                </div>
              </PermissionCheck>
            , isProtected: true
          },
          { id: 2, title: "Roles", component: <Roles />, isProtected: true },
          { id: 3, title: "Plantas", component: <Factory />, isProtected: true },
          { id: 4, title: "Lineas", component: <Lista />, isProtected: true },
          { id: 5, title: "Clientes", component: <Clients />, isProtected: true },
        ]}
      />
    </div>
  );
}

export default User;
