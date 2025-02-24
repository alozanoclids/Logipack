"use client";
import { useState, useEffect } from "react";
import { getPermissions, updateRolePermissions, createPermission } from "../../services/roleServices";
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSort } from "react-icons/fa";
import Modal from "../modal/Modal";

// 🛠️ Definición de Interfaces
interface Permission {
  id: number;
  name: string;
  description: string;
  status: number;
}

type RoleType = {
  id: number;
  name: string;
  permissions: Permission[];
};

const Roles = () => {
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


  // 🛠️ Cargar Roles y Permisos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPermissions();
        if (response && typeof response === "object") {
          setRoles(Array.isArray(response.roles) ? response.roles : []);
          setPermissions(Array.isArray(response.permissions) ? response.permissions : []);
        } else {
          setRoles([]);
          setPermissions([]);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setRoles([]);
        setPermissions([]);
      }
    };

    fetchData();
  }, []);

  // 🛠️ Manejar actualización de permisos
  const handlePermissionToggle = async (roleId: number, permissionId: number, checked: boolean) => {
    const updatedRoles = roles.map((role) => {
      if (role.id === roleId) {
        const updatedPermissions = checked
          ? [
            ...role.permissions,
            // Se agrega el permiso completo desde el state "permissions"
            permissions.find((perm) => perm.id === permissionId)!
          ]
          : role.permissions.filter((perm) => perm.id !== permissionId);
        return { ...role, permissions: updatedPermissions };
      }
      return role;
    });

    setRoles(updatedRoles);

    try {
      // Se envía el cambio al backend (aquí puedes enviar permissionId o el array completo, según lo requiera tu endpoint)
      await updateRolePermissions(roleId, permissionId);
    } catch (error) {
      console.error("Error actualizando permisos:", error);
    }
  };

  const handleSave = async (name: string, description: string, status: string) => {
    try {
      const response = await createPermission(name, description, status === 'true');
      if (response && typeof response === 'object') {
        setPermissions(Array.isArray(response.permissions) ? response.permissions : []);
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error creando permiso:', (error));
      setPermissions([]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePermission(id);
      setPermissions(permissions.filter((perm) => perm.id !== id));
    } catch (error) {
      console.error("Error eliminando permiso:", error);
    }
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsModalOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition mb-2"
      >
        Crear Permiso
      </button>

      <Modal
        isOpen={isModalOpen}
        title="Crear Permiso"
        fields={[
          { label: 'Nombre', name: 'description', type: 'text', initialValue: name },
          { label: 'Clave', name: 'name', type: 'text', initialValue: description },
          {
            label: 'Estado',
            name: 'status',
            type: 'select',
            initialValue: 'active',
            options: [
              { value: '1', label: 'Activo' },
              { value: '0', label: 'Inactivo' },
            ]
          },
        ]}
        onSave={(values) => {
          const name = values.name;
          const description = values.description;
          const status = values.status;
          handleSave(name, description, status);
        }}
        onClose={() => setIsModalOpen(false)}
      />

      <table className="w-full bg-gray-700 shadow-md rounded-lg border border-gray-200">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="p-2 text-left text-sm text-gray-300">Permiso</th>
            {roles.map((role) => (
              <th key={role.id} className="p-2 text-center text-sm capitalize">{role.name}</th>
            ))}
            <th className="p-2 text-center text-sm text-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission, index) => (
            <tr key={permission.id} className={`${index % 2 === 0 ? "bg-gray-600" : "bg-gray-800"} text-gray-300 border-b`}>
              <td className="p-2 text-sm">{permission.description}</td>
              {roles.map((role) => (
                <td key={`${role.id}-${permission.id}`} className="text-center">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500 cursor-pointer"
                    checked={role.permissions.some((p) => p.id === permission.id)}
                    onChange={(e) => handlePermissionToggle(role.id, permission.id, e.target.checked)}
                  />
                </td>
              ))}
              <td className="p-2 text-center">
                <button
                  className="text-blue-400 hover:text-red-500 mr-2"
                  onClick={() => handleEdit(permission)}
                >
                  <FaEdit size={18} />
                </button>
                <button
                  className="text-red-400 hover:text-red-500"
                  onClick={() => handleDelete(permission.id)}
                >
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;
