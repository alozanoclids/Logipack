"use client";
import { useState, useEffect } from "react";
import { createFactory, getFactory, deleteFactory, getFactoryId, updateFactory } from "../../services/userDash/factoryServices";
import Table from "../table/Table";
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
import Button from "../buttons/buttons"

interface Factory {
    id: number;
    name: string;
    location: string;
    capacity: string;
    manager: string;
    employees: number;
    status: boolean;
}

function CreateFactory() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [capacity, setCapacity] = useState<string>('');
    const [manager, setManager] = useState<string>('');
    const [employees, setEmployees] = useState<string>('');
    const [status, setStatus] = useState<boolean>(false);
    const [factories, setFactories] = useState<Factory[]>([]);
    const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
    const columns = ["name", "location", "manager", "status"];
    const columnLabels: { [key: string]: string } = {
        name: "Nombre de Planta",
        location: "Ubicación",
        manager: "Persona a Cargo", 
        status: "Estado"
    };

    const fetchFactories = async () => {
        try {
            const data: Factory[] = await getFactory();
            setFactories(data);
        } catch (error) {
            console.error("Error fetching factories:", error);
        }
    };

    useEffect(() => {
        fetchFactories();
    }, []);

    const resetForm = () => {
        setName('');
        setLocation('');
        setCapacity('');
        setManager('');
        setEmployees('');
        setStatus(false);
        setEditingFactory(null);
    };

    const handleSave = async () => {
        const factoryData = { name, location, capacity, manager, employees, status };
        
        try {
            if (editingFactory) {
                await updateFactory(editingFactory.id, factoryData);
                showSuccess("Planta actualizada exitosamente");
            } else {
                await createFactory(factoryData);
                showSuccess("Planta creada exitosamente");
            }
            fetchFactories();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            showError("Error al guardar la planta");
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm("¿Seguro que quieres eliminar esta planta?", async () => {
            try {
                await deleteFactory(id);
                setFactories((prevFactories) => prevFactories.filter((factory) => factory.id !== id));
                showSuccess("Planta eliminada con éxito");
            } catch (error) {
                showError("Error al eliminar la planta");
            }
        });
    };

    const handleEdit = async (id: number) => {
        try {
            const factoryData = await getFactoryId(id);
            setEditingFactory(factoryData);
            setName(factoryData.name);
            setLocation(factoryData.location);
            setCapacity(factoryData.capacity);
            setManager(factoryData.manager);
            setEmployees(factoryData.employees);
            setStatus(factoryData.status);
            setIsModalOpen(true);
        } catch (error) {
            showError("Error obteniendo datos de la planta");
        }
    };

    return (
        <div>
            <div className="flex justify-center mb-2">
                <Button onClick={() => {
                    setIsModalOpen(true);
                    resetForm();
                }} variant="create" label="Crear Planta" />
            </div>

            <Table columns={columns} rows={factories} columnLabels={columnLabels} onDelete={handleDelete} onEdit={handleEdit} />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h2 className="text-xl text-black font-bold mb-4">{editingFactory ? "Editar Planta" : "Crear Planta"}</h2>
                        
                        <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full text-black p-2 border mb-2" />
                        <input type="text" placeholder="Ubicación" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full text-black p-2 border mb-2" />
                        <input type="text" placeholder="Capacidad" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full text-black p-2 border mb-2" />
                        <input type="text" placeholder="Persona a Cargo" value={manager} onChange={(e) => setManager(e.target.value)} className="w-full text-black p-2 border mb-2" />
                        <input type="number" placeholder="Empleados" value={employees} onChange={(e) => setEmployees(e.target.value)} className="w-full text-black p-2 border mb-2" />

                        <div className="mb-4">
                            <label className="block text-black mb-2">Estado</label>
                            <select value={status ? 'activo' : 'inactivo'} onChange={(e) => setStatus(e.target.value === 'activo')} className="w-full p-2 border text-black">
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>

                        <div className="flex justify-center gap-2">
                            <Button onClick={() => setIsModalOpen(false)} variant="cancel" />
                            <Button onClick={handleSave} variant="save" label={editingFactory ? "Actualizar" : "Guardar"} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateFactory;
