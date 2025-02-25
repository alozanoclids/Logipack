"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getIngredientById, updateIngredient, toggleIngredientStatus } from "../../services/ingredientsService";
import { Power } from "lucide-react"; // Importa el ícono Power de lucide-react

interface IngredientData {
  nombre: string;
  proveedor: string;
  tipo: string;
  concentracion: string;
  [key: string]: any;
}

const EditIngredients = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [formData, setFormData] = useState<IngredientData | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [status, setStatus] = useState<boolean>(true); // Estado para el status del ingrediente

  useEffect(() => {
    if (!id) return;

    const fetchIngredient = async () => {
      try {
        const response = await getIngredientById(Number(id));
        if (response.data) {
          // Guardar los datos originales completos
          setOriginalData(response.data);
          setStatus(response.data.status); // Inicializa el estado del status

          // Extraer los campos editables para el formulario
          const filteredData: IngredientData = Object.fromEntries(
            Object.entries(response.data).filter(([_, value]) => typeof value !== "object")
          ) as IngredientData;
          setFormData(filteredData);
        }
      } catch (error) {
        console.error("Error al obtener el ingrediente:", error);
      }
    };

    fetchIngredient();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !originalData) return;

    try {
      // Crear el objeto de actualización mezclando los datos originales con los cambios
      const updateData = {
        ...originalData,
        ...formData
      };

      await updateIngredient(Number(id), updateData);
      alert("Ingrediente actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el ingrediente:", error);
      alert("Hubo un error al actualizar el ingrediente.");
    }
  };

  const handleToggleStatus = async () => {
    const confirmToggle = window.confirm(
      `¿Estás seguro de que deseas ${status ? "desactivar" : "activar"} este ingrediente?`
    );

    if (!confirmToggle) return;

    try {
      const updatedIngredient = await toggleIngredientStatus(Number(id)); // Llama al servicio para alternar el estado
      setStatus(updatedIngredient.status); // Actualiza el estado local con la respuesta del servicio
      alert(`Ingrediente ${updatedIngredient.status ? "activado" : "desactivado"} correctamente`);
    } catch (error) {
      console.error("Error al cambiar el estado del ingrediente:", error);
      alert("Hubo un error al cambiar el estado del ingrediente.");
    }
  };

  if (!formData) return <p className="text-white">Cargando...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Editar Ingrediente</h1>
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-700 p-6 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="text-gray-300 font-semibold mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                <input
                  type="text"
                  name={key}
                  value={String(value)}
                  onChange={handleChange}
                  className="p-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Botón para activar/desactivar */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                status ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              <Power size={16} />
              {status ? "Desactivar" : "Activar"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditIngredients;