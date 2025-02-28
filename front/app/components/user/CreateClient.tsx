"use client";
import { useState, useEffect } from "react";
import {
  createClients,
  getClients,
  getClientsId,
  deleteClients,
  updateClients,
} from "../../services/userDash/clientServices";
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
import Table from "../table/Table";
import Button from "../buttons/buttons";

interface Clients {
  id: number;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  job_position?: string;
  responsible_person?: { name: string; email: string }[];
}

function CreateClient() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clients, setClients] = useState<Clients[]>([]);
  const [editingClients, setEditingClients] = useState<Clients | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState<{ name: string; email: string }[]>([]);
  const [newResponsibleName, setNewResponsibleName] = useState("");
  const [newResponsibleEmail, setNewResponsibleEmail] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const handleSave = async () => {
    try {
      const payload = { name, code, email, phone, job_position: jobPosition, responsible_person: responsiblePerson };

      if (editingClients) {
        await updateClients(editingClients.id, payload);
        showSuccess("Cliente actualizado exitosamente");
      } else {
        await createClients(payload);
        showSuccess("Cliente creado exitosamente");
      }

      fetchClients();
      closeModal();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      showError("Error al guardar cliente");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const clientData = await getClientsId(id);
      // console.log("Cliente obtenido:", clientData); // Verificar qué datos se están obteniendo
      setEditingClients(clientData);
      setName(clientData.name);
      setCode(clientData.code);
      setEmail(clientData.email || "");
      setPhone(clientData.phone || "");
      setJobPosition(clientData.job_position || "");
      setResponsiblePerson(clientData.responsible_person ? JSON.parse(clientData.responsible_person) : []);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener datos del cliente:", error);
    }
  };

  const handleDelete = async (id: number) => {
    showConfirm("¿Estás seguro de eliminar este cliente?", async () => {
      try {
        await deleteClients(id);
        setClients((prevClients) => prevClients.filter((client) => client.id !== id));
        showSuccess("Cliente eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        showError("Error al eliminar cliente");
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClients(null);
    setName("");
    setCode("");
    setEmail("");
    setPhone("");
    setJobPosition("");
    setResponsiblePerson([]);
  };

  return (
    <div>
      <div className="flex justify-center mb-2">
        <Button onClick={() => setIsModalOpen(true)} variant="create" label="Crear Cliente" />
      </div>

      <Table
        columns={["name", "code", "email", "phone", "job_position"]}
        rows={clients}
        columnLabels={{
          name: "Nombre",
          code: "Código",
          email: "Correo",
          phone: "Teléfono",
          job_position: "Puesto"
        }}
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
            <input
              type="text"
              placeholder="Código"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-2 rounded mb-2 text-black"
            />
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded mb-2 text-black"
            />
            <input
              type="number"
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded mb-2 text-black"
            />
            <input
              type="text"
              placeholder="Puesto de trabajo"
              value={jobPosition}
              onChange={(e) => setJobPosition(e.target.value)}
              className="w-full border p-2 rounded mb-2 text-black"
            />

            {/* Sección de Responsable */}
            <div className="mb-2">
              <h3 className="text-sm font-semibold">Responsables:</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newResponsibleName}
                  onChange={(e) => setNewResponsibleName(e.target.value)}
                  className="border p-2 rounded w-1/2 text-black"
                />
                <input
                  type="email"
                  placeholder="Correo"
                  value={newResponsibleEmail}
                  onChange={(e) => setNewResponsibleEmail(e.target.value)}
                  className="border p-2 rounded w-1/2 text-black"
                />
                <button
                  onClick={() => {
                    if (newResponsibleName && newResponsibleEmail) {
                      setResponsiblePerson([...responsiblePerson, { name: newResponsibleName, email: newResponsibleEmail }]);
                      setNewResponsibleName("");
                      setNewResponsibleEmail("");
                    }
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Agregar
                </button>
              </div>
              <ul>
                {Array.isArray(responsiblePerson) ? responsiblePerson.map((person, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-100 p-1 rounded mb-1">
                    <p className="text-black">
                      <strong>{person.name}:</strong> {person.email}
                    </p>
                    <button
                      onClick={() => setResponsiblePerson(responsiblePerson.filter((_, i) => i !== index))}
                      className="text-red-500 text-xs"
                    >
                      Eliminar
                    </button>
                  </li>
                )) : <p className="text-gray-500">No hay responsables asignados.</p>}
              </ul>
            </div>

            <div className="flex justify-center gap-2">
              <Button onClick={closeModal} variant="cancel" />
              <Button onClick={handleSave} variant="save" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateClient;
