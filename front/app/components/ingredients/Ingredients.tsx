"use client";
import React, { useEffect, useState } from "react";
import Table from "../table/Table";
import { useRouter } from "next/navigation"; // Importa el hook useRouter
import { getIngredients, Ingredient, deleteIngredient } from "../../services/ingredientsService";

const Ingredients: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const router = useRouter(); // Crea una instancia de useRouter

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await getIngredients();
        setIngredients(data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };
    fetchIngredients();
  }, []);

  const importantFields = ["nombre", "proveedor", "tipo", "concentracion"];

  const tableData = ingredients.map((ingredient) => {
    const filteredData: Record<string, any> = { id: ingredient.id };
    importantFields.forEach((field) => {
      filteredData[field] = ingredient.data?.[field] ?? "N/A";
    });

    // Agrega el campo "estado" con estilos condicionales
    filteredData.estado = (
      <span
        className={`px-2 py-1 rounded-full text-sm font-semibold ${
          ingredient.status ? "text-green-600" : "text-red-600"
        }`}
      >
        {ingredient.status ? "Activado" : "Desactivado"}
      </span>
    );

    return filteredData;
  });

  const columns = ["id", ...importantFields, "estado"]; // Incluye "estado"
  const columnLabels = columns.reduce((acc, column) => {
    acc[column] = column.charAt(0).toUpperCase() + column.slice(1);
    return acc;
  }, {} as Record<string, string>);

  const handleEdit = (id: string | number) => {
    router.push(`/pages/editIngredient/${id}`);
    console.log("Editar ingrediente con ID:", id);
  };

  const handleDelete = async (id: string | number) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este ingrediente? Esta acción no se puede deshacer."
    );

    if (!confirmDelete) return;

    try {
      await deleteIngredient(id);
      setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
    } catch (error) {
      console.error("Error al eliminar el ingrediente:", error);
    }
  };

  return (
    <div>
      {/* Botón superior */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <button
          onClick={() => router.push("/pages/addIngredient")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
        >
          Crear Ingrediente
        </button>
      </div>

      {/* Tabla de ingredientes */}
      <div className="overflow-x-auto">
        <Table
          rows={tableData}
          columns={columns}
          columnLabels={columnLabels}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Ingredients;