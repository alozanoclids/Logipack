"use client";
import { useState, useEffect } from "react";
import {
  createClients,
  getClients,
  getClientsId,
  deleteClients,
  updateClients,
} from "../../services/userDash/clientServices";
import { getManu } from "../../services/userDash/manufacturingServices";
import Table from "../table/Table";

interface Clients {
  id: number;
  name: string;
  line_types: number; // Ahora guarda IDs en lugar de nombres
  details: { key: string; value: string }[];
}

interface Manufacturing {
  id: number;
  name: string;
}

function CreateClient() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [lineTypes, setLineTypes] = useState<number[]>([]);
  const [clients, setClients] = useState<Clients[]>([]);
  const [manufacturingOptions, setManufacturingOptions] = useState<Manufacturing[]>([]);
  const [editingClients, setEditingClients] = useState<Clients | null>(null);
  const [details, setDetails] = useState<{ key: string; value: string }[]>([]);
  const [newDetailKey, setNewDetailKey] = useState<string>("");
  const [newDetailValue, setNewDetailValue] = useState<string>("");

  useEffect(() => {
    fetchClients();
    fetchManufacturingOptions();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const fetchManufacturingOptions = async () => {
    try {
      const data = await getManu();
      setManufacturingOptions(data);
    } catch (error) {
      console.error("Error al obtener opciones de manufactura:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingClients) {
        await handleUpdate(editingClients.id);
      } else {
        const payload = { name, line_types: lineTypes, details };
        await createClients(payload);
        alert("Cliente creado exitosamente");
      }
      fetchClients();
      closeModal();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const payload = { name, line_types: lineTypes, details };
      await updateClients(id, payload);
      alert("Cliente actualizado exitosamente");
      fetchClients();
      closeModal();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const clientData = await getClientsId(id);
      setEditingClients(clientData);
      setName(clientData.name);
      setLineTypes(clientData.line_types || []);
      setDetails(clientData.details || []);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener datos del cliente:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      await deleteClients(id);
      setClients((prevClients) => prevClients.filter((client) => client.id !== id));
      alert("Cliente eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClients(null);
    setName("");
    setLineTypes([]);
    setDetails([]);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 mb-2"
      >
        Crear Cliente
      </button>
      <Table
        columns={["name"]}
        rows={clients}
        columnLabels={{ name: "Nombre del Cliente" }}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">{editingClients ? "Editar Cliente" : "Crear Cliente"}</h2>
            <input
              type="text"
              placeholder="Nombre del Cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded mb-2 text-black"
            />

            {/* Select de Tipos de Línea */}
            <div className="mb-2">
              <h3 className="text-sm font-semibold">Tipos de Línea:</h3>
              <select
                className="w-full border p-2 rounded text-black"
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  if (!lineTypes.includes(selectedId)) {
                    setLineTypes([...lineTypes, selectedId]);
                  }
                }}
              >
                <option value="">Seleccionar tipo de línea</option>
                {manufacturingOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <ul>
                {lineTypes.map((id, index) => {
                  const lineType = manufacturingOptions.find((opt) => opt.id === id);
                  return (
                    <li key={index} className="flex justify-between items-center bg-gray-100 p-1 rounded mb-1">
                      {lineType?.name || "Desconocido"}
                      <button
                        onClick={() => setLineTypes(lineTypes.filter((_, i) => i !== index))}
                        className="text-red-500 text-xs"
                      >
                        Eliminar
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Sección de Variables Dinámicas */}
            <div className="mb-2">
              <h3 className="text-sm font-semibold">Detalles del Cliente:</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nombre de la Variable"
                  value={newDetailKey}
                  onChange={(e) => setNewDetailKey(e.target.value)}
                  className="border p-2 rounded w-1/2 text-black"
                />
                <input
                  type="text"
                  placeholder="Valor"
                  value={newDetailValue}
                  onChange={(e) => setNewDetailValue(e.target.value)}
                  className="border p-2 rounded w-1/2 text-black"
                />
                <button
                  onClick={() => {
                    if (newDetailKey && newDetailValue) {
                      setDetails([...details, { key: newDetailKey, value: newDetailValue }]);
                      setNewDetailKey("");
                      setNewDetailValue("");
                    }
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Agregar
                </button>
              </div>
              <ul>
                {details.map((detail, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-100 p-1 rounded mb-1">
                    <p className="text-black">
                      <strong>{detail.key}:</strong> {detail.value}
                    </p>
                    <button
                      onClick={() => setDetails(details.filter((_, i) => i !== index))}
                      className="text-red-500 text-xs"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancelar
              </button>
              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
                {editingClients ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateClient;
