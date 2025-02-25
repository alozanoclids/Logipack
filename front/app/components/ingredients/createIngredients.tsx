import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createIngredient } from '../../services/ingredientsService';

const CreateIngredientForm = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    proveedor: '',
    tipo: '',
    concentracion: '',
    serial: '', 
  });

  const [customFields, setCustomFields] = useState<{ [key: string]: string }>({});
  const [newField, setNewField] = useState({ name: '', value: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomFieldSubmit = () => {
    if (newField.name && newField.value) {
      setCustomFields((prev) => ({
        ...prev,
        [newField.name]: newField.value,
      }));
      setNewField({ name: '', value: '' });
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ingredientData = {
        ...formData,
        ...customFields,
      };
  
      console.log("Datos enviados:", JSON.stringify(ingredientData, null, 2));
  
      await createIngredient(ingredientData); // Envía el objeto directamente
      alert("Ingrediente creado correctamente");
      router.push("/pages/ingredients"); // Redirige a la ruta deseada
    } catch (error) {
      console.error("Error al guardar el ingrediente:", error);
      alert("Error al guardar el ingrediente");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Crear Nuevo Ingrediente</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['nombre', 'proveedor', 'tipo', 'concentracion','serial'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field as keyof typeof formData]}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                required
              />
            </div>
          ))}

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Campos Adicionales</h3>
            <div className="space-y-2">
              {Object.entries(customFields).map(([name, value]) => (
                <div key={name} className="flex gap-2 items-center">
                  <label className="block text-sm font-medium text-gray-300">{name}:</label>
                  <input
                    type="text"
                    value={value}
                    readOnly
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <Plus size={16} />
              Agregar campo
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Guardar Ingrediente
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Agregar Campo Personalizado</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del campo</label>
                <input
                  type="text"
                  placeholder="Ej: Código interno"
                  value={newField.name}
                  onChange={(e) => setNewField((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Valor</label>
                <input
                  type="text"
                  placeholder="Ej: ABC123"
                  value={newField.value}
                  onChange={(e) => setNewField((prev) => ({ ...prev, value: e.target.value }))}
                  className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                />
              </div>
              <button
                onClick={handleCustomFieldSubmit}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateIngredientForm;