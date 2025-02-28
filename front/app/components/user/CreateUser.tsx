import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { post, getRole } from "../../services/userDash/authservices";
import { getFactory } from "../../services/userDash/factoryServices";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { BiLock } from "react-icons/bi";
import PermissionInputs from "../permissionCheck/PermissionInputs";
import { showError, showSuccess } from "../toastr/Toaster";
import Button from "../buttons/buttons";

interface Role {
  id: number;
  name: string;
}

interface Factory {
  id: number;
  name: string;
}

function CreateUser() {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signature_bpm, setSignatureBPM] = useState("");
  const [selectedFactories, setSelectedFactories] = useState<number[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRole();
        setRoles(data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const fetchFactories = async () => {
      try {
        const data = await getFactory();
        setFactories(data);
      } catch (error) {
        console.error("Error fetching factories:", error);
      }
    };

    fetchRoles();
    fetchFactories();
  }, []);

  const generatePassword = () => {
    const length = 12;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
  };

  const handleFactorySelection = (factoryId: number) => {
    setSelectedFactories((prev) =>
      prev.includes(factoryId) ? prev.filter((id) => id !== factoryId) : [...prev, factoryId]
    );
  };

  const handleCreateUser = async () => {
    if (!name || !email || !password || !role) {
      showError("Todos los campos obligatorios deben estar llenos");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showError("El correo electrónico no es válido");
      return;
    }

    setLoading(true);
    try {
      await post({
        name,
        email,
        password,
        role,
        signature_bpm,
        factories: JSON.stringify(selectedFactories), // 🔥 Convertir a JSON
      });

      showSuccess("Usuario creado exitosamente");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creando usuario:", error);
      showError("Error creando usuario");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center">
      <div className="flex justify-center space-x-2 mb-2">
        <Button onClick={() => setIsModalOpen(true)} variant="create" label="Crear Usuario" />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn z-50">
            <h1 className="text-2xl font-semibold mb-4 text-black text-center">Crear Usuario</h1>
            <form className="space-y-3">
              <PermissionInputs requiredPermission="crear_usuarios">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-black border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </PermissionInputs>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-black border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-black border border-gray-300 rounded p-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-2.5 text-gray-500"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="absolute right-2 top-2.5 bg-yellow-500 text-white p-1 rounded"
                >
                  <BiLock size={16} />
                </button>
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 mb-2 w-full text-black"
              >
                <option value="">Seleccionar rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name} className="text-black">
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Firma BPM"
                value={signature_bpm}
                onChange={(e) => setSignatureBPM(e.target.value)}
                className="w-full text-black border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-black mb-2">Seleccionar Plantas:</p>
              <select
                value={selectedFactories.map(String)} // Convierte los números en strings
                onChange={(e) =>
                  setSelectedFactories(
                    Array.from(e.target.selectedOptions, (option) => Number(option.value))
                  )
                }
                multiple
                className="border p-2 mb-2 w-full text-black"
              >
                {factories.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>


              <div className="flex justify-center gap-2">
                <Button onClick={() => setIsModalOpen(false)} variant="cancel" />
                <Button onClick={handleCreateUser} variant="save" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateUser;
