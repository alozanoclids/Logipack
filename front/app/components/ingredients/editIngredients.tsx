"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getIngredientById, updateIngredient } from "../../services/ingredientsService";

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

  useEffect(() => {
    if (!id) return;

    const fetchIngredient = async () => {
      try {
        const response = await getIngredientById(Number(id));
        if (response.data) {
          // Guardar los datos originales completos
          setOriginalData(response.data);
          
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

  if (!formData) return <p>Cargando...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Ingrediente</h1>
          <button 
            onClick={() => router.back()} 
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="text-gray-700 font-semibold">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                <input
                  type="text"
                  name={key}
                  value={String(value)}
                  onChange={handleChange}
                  className="p-2 border rounded-md"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditIngredients;