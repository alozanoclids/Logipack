"use client";
import { useState, useEffect } from "react";
import { createManu, getManu, getManuId, deleteManu, updateManu } from '../../services/manufacturingServices';
import Table from "../table/Table";

interface Manu {
    id: number;
    name: string;
    line_types: string[];
}

function CreateManufacturing() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [lineTypes, setLineTypes] = useState<string[]>([]);
    const [newLineType, setNewLineType] = useState<string>('');
    const [manu, setManu] = useState<Manu[]>([]);
    const [editingManu, setEditingManu] = useState<Manu | null>(null);

    const columns = ["name"];
    const columnLabels: { [key: string]: string } = {
        name: "Nombre Lista",
    };

    useEffect(() => {
        fetchManu();
    }, []);

    const fetchManu = async () => {
        try {
            const data = await getManu();
            // Convertir line_types a un array real si es un string
            const formattedData = data.map((item: any) => ({
                ...item,
                line_types: typeof item.line_types === "string" ? JSON.parse(item.line_types) : item.line_types,
            }));
            setManu(formattedData);
        } catch (error) {
            console.error("Error fetching Manu:", error);
        }
    };

    const handleSave = async () => {
        try {
            if (editingManu) {
                await handleUpdate(editingManu.id);
            } else {
                const payload = { name, line_types: lineTypes };
                await createManu(payload);
                alert("Planta creada exitosamente");
            }
            fetchManu();
            closeModal();
        } catch (error) {
            console.error('Error guardando planta:', error);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            const payload = { name, line_types: lineTypes };
            await updateManu(id, payload);
            alert("Planta actualizada con éxito");
            fetchManu();
            closeModal();
        } catch (error) {
            console.error("Error actualizando la planta:", error);
        }
    };

    const handleEdit = async (id: number) => {
        try {
            const manuData = await getManuId(id);
            console.log(manuData);
            setEditingManu(manuData);
            setName(manuData.name);
            // Convertir line_types si es un string
            setLineTypes(typeof manuData.line_types === "string" ? JSON.parse(manuData.line_types) : manuData.line_types);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la planta:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta planta?")) return;
        try {
            await deleteManu(id);
            setManu((prevManu) => prevManu.filter((manu) => manu.id !== id));
            alert("Planta eliminada con éxito");
        } catch (error) {
            console.error("Error al eliminar planta:", error);
        }
    };

    const addLineType = () => {
        if (newLineType.trim() !== '') {
            setLineTypes([...lineTypes, newLineType]);
            setNewLineType('');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingManu(null);
        setName('');
        setLineTypes([]);
        setNewLineType('');
    };

    return (
        <div>
            {/* Botón para abrir modal */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 mb-2"
            >
                Crear Lista
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
                        {/* Título */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            {editingManu ? "Editar Planta" : "Crear Planta"}
                        </h2>

                        {/* Campo de Nombre */}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre de la planta"
                            className="w-full text-gray-700 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none mb-3"
                        />

                        {/* Agregar tipo de línea */}
                        <div className="flex space-x-2 mb-3">
                            <input
                                type="text"
                                value={newLineType}
                                onChange={(e) => setNewLineType(e.target.value)}
                                placeholder="Agregar tipo de línea"
                                className="flex-1 text-gray-700 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={addLineType}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
                            >
                                Agregar
                            </button>
                        </div>

                        {/* Lista de tipos de línea */}
                        <ul className="space-y-2 mb-4">
                            {Array.isArray(lineTypes) && lineTypes.length > 0 ? (
                                lineTypes.map((line, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center bg-gray-100 p-2 rounded-lg border border-gray-300"
                                    >
                                        <input
                                            type="text"
                                            value={line}
                                            onChange={(e) => {
                                                const updatedLines = [...lineTypes];
                                                updatedLines[index] = e.target.value;
                                                setLineTypes(updatedLines);
                                            }}
                                            className="bg-transparent text-gray-800 border-none focus:outline-none flex-1"
                                        />
                                        <button
                                            onClick={() => {
                                                const updatedLines = lineTypes.filter((_, i) => i !== index);
                                                setLineTypes(updatedLines);
                                            }}
                                            className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-full text-xs transition-all duration-300"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-gray-500 text-center">No hay datos disponibles</li>
                            )}
                        </ul>

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                            >
                                {editingManu ? "Actualizar" : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <Table
                columns={columns}
                rows={manu}
                columnLabels={columnLabels}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
}

export default CreateManufacturing;
