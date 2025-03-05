"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createStage, getStageId, updateStage, deleteStage, getStage } from "../../services/maestras/stageServices";
import { showError, showSuccess, showConfirm } from "../toastr/Toaster";
import Table from "../table/Table";
import Button from "../buttons/buttons";

const phases = ["Planeacion", "Conciliación", "Actividades"];
interface Stage {
    id: number;
    code: number;
    description: string;
    phase_type: "Planeacion" | "Conciliación" | "Actividades";
    repeat: boolean;
    repeat_minutes?: number;
    alert: boolean;
    can_pause: boolean;
}
interface Data {
    description: string;
    phase_type: "Planeacion" | "Conciliación" | "Actividades";
    repeat: boolean;
    repeat_minutes?: number;
    alert: boolean;
    can_pause: boolean;
}

function NewStage() {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false); // Estado para el modal de edición
    const [stage, setStage] = useState<Stage[]>([]);
    const [editingStage, setEditingStage] = useState<Stage | null>(null); // Estado para la fase en edición
    const [description, setDescription] = useState("");
    const [phaseType, setPhaseType] = useState<"Planeacion" | "Conciliación" | "Actividades">("Planeacion");
    const [repeat, setRepeat] = useState(false);
    const [repeatMinutes, setRepeatMinutes] = useState("");
    const [alert, setAlert] = useState(false);
    const [canPause, setCanPause] = useState(false);

    const columns = ["description", "phase_type"];
    const columnLabels: { [key: string]: string } = {
        description: "Descripción",
        phase_type: "Tipo de Fase",
    };

    useEffect(() => {
        const fetchStage = async () => {
            try {
                const data = await getStage();
                setStage(data);
            } catch (error) {
                console.error("Error fetching maestras:", error);
            }
        };
        fetchStage();
    }, []);

    const validateForm = () => {
        if (!description.trim()) {
            showError("La descripción es obligatoria.");
            return false;
        }
        if (!phaseType) {
            showError("El tipo de fase es obligatorio.");
            return false;
        }
        if (repeat && (!repeatMinutes || isNaN(Number(repeatMinutes)))) {
            showError("Por favor, ingresa un valor numérico válido para 'Repetir cada (min)'.");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const newStage: Data = {
            description,
            phase_type: phaseType,
            repeat,
            repeat_minutes: repeat ? Number(repeatMinutes) : undefined,
            alert,
            can_pause: canPause,
        };

        try {
            const response = await createStage(newStage);
            if (response.status === 201) {
                showSuccess("Fase creada con éxito");
                setIsOpen(false);
                resetForm();
                const data = await getStage();
                setStage(data);
            } else {
                showError("Error al crear la fase");
            }
        } catch (error) {
            console.error("Error al guardar la fase:", error);
            showError("Ocurrió un error al guardar la fase");
        }
    };

    const handleEdit = async (id: number) => {
        try {
            const data = await getStageId(id);
            setEditingStage(data);
            setIsEditOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la fase:", error);
            showError("Error obteniendo datos de la fase");
        }
    };

    const handleUpdate = async () => {
        if (!editingStage) return;

        try {
            const updatedData = {
                description: editingStage.description,
                phase_type: editingStage.phase_type,
                repeat: editingStage.repeat,
                repeat_minutes: editingStage.repeat ? editingStage.repeat_minutes : undefined,
                alert: editingStage.alert,
                can_pause: editingStage.can_pause,
            };

            await updateStage(editingStage.id, updatedData);
            showSuccess("Fase actualizada correctamente");
            setIsEditOpen(false);

            // Actualizar la lista de fases
            const data = await getStage();
            setStage(data);
        } catch (error) {
            console.error("Error al actualizar la fase:", error);
            showError("Error al actualizar la fase");
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm("¿Seguro que quieres eliminar esta maestra?", async () => {
            try {
                await deleteStage(id);
                setStage((prevStage) => prevStage.filter((stage) => stage.id !== id));
                showSuccess("Maestra eliminado con éxito");
            } catch (error) {
                console.error("Error al eliminar maestra:", error);
                showError("Error al eliminar maestra");
            }
        });
    };

    const resetForm = () => {
        setDescription("");
        setPhaseType("Planeacion");
        setRepeat(false);
        setRepeatMinutes("");
        setAlert(false);
        setCanPause(false);
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex justify-center space-x-2 mb-2">
                <Button onClick={() => setIsOpen(true)} variant="create" label="Crear Fase" />
            </div>

            <Table columns={columns} rows={stage} columnLabels={columnLabels} onDelete={handleDelete} onEdit={handleEdit} />

            {/* Modal de creación */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
                >
                    <motion.div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn z-50">
                        <h2 className="text-center text-xl font-bold text-black mb-4">
                            Crear Fase
                        </h2>

                        <div className="mb-3">
                            <label className="block text-sm font-medium text-black">Descripción</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border rounded text-black"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium text-black">Tipo de Fase</label>
                            <select
                                value={phaseType}
                                onChange={(e) => setPhaseType(e.target.value as "Planeacion" | "Conciliación" | "Actividades")}
                                className="w-full p-2 border rounded text-black"
                            >
                                {phases.map((phase) => (
                                    <option key={phase} value={phase}>
                                        {phase}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-black">
                            <input
                                type="checkbox"
                                checked={repeat}
                                onChange={(e) => setRepeat(e.target.checked)}
                            />
                            <span>Repetir</span>
                            {repeat && (
                                <input
                                    type="number"
                                    placeholder="Cada (min)"
                                    value={repeatMinutes}
                                    onChange={(e) => setRepeatMinutes(e.target.value)}
                                    className="w-20 p-2 border rounded text-black"
                                />
                            )}
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-black">
                            <input
                                type="checkbox"
                                checked={alert}
                                onChange={(e) => setAlert(e.target.checked)}
                            />
                            <span>Activar Alerta</span>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-black">
                            <input
                                type="checkbox"
                                checked={canPause}
                                onChange={(e) => setCanPause(e.target.checked)}
                            />
                            <span>Se puede pausar?</span>
                        </div>

                        <div className="flex justify-center gap-2">
                            <Button onClick={() => { setIsOpen(false); resetForm() }} variant="cancel" />
                            <Button onClick={handleSave} variant="save" />
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Modal de edición */}
            {isEditOpen && editingStage && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
                >
                    <motion.div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-fadeIn z-50">
                        <h2 className="text-center text-xl font-bold text-black mb-4">
                            Editar Fase
                        </h2>

                        <div className="mb-3">
                            <label className="block text-sm font-medium text-black">Descripción</label>
                            <input
                                type="text"
                                value={editingStage.description}
                                onChange={(e) =>
                                    setEditingStage({ ...editingStage, description: e.target.value })
                                }
                                className="w-full p-2 border rounded text-black"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium text-black">Tipo de Fase</label>
                            <select
                                value={editingStage.phase_type}
                                onChange={(e) =>
                                    setEditingStage({ ...editingStage, phase_type: e.target.value as "Planeacion" | "Conciliación" | "Actividades" })
                                }
                                className="w-full p-2 border rounded text-black"
                            >
                                {phases.map((phase) => (
                                    <option key={phase} value={phase}>
                                        {phase}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-black">
                            <input
                                type="checkbox"
                                checked={editingStage.repeat}
                                onChange={(e) =>
                                    setEditingStage({ ...editingStage, repeat: e.target.checked })
                                }
                            />
                            <span>Repetir</span>
                            {editingStage.repeat && (
                                <input
                                    type="number"
                                    placeholder="Cada (min)"
                                    value={editingStage.repeat_minutes || ""}
                                    onChange={(e) =>
                                        setEditingStage({ ...editingStage, repeat_minutes: Number(e.target.value) })
                                    }
                                    className="w-20 p-2 border rounded text-black"
                                />
                            )}
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-black">
                            <input
                                type="checkbox"
                                checked={editingStage.alert}
                                onChange={(e) =>
                                    setEditingStage({ ...editingStage, alert: e.target.checked })
                                }
                            />
                            <span>Activar Alerta</span>
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-black">
                            <input
                                type="checkbox"
                                checked={editingStage.can_pause}
                                onChange={(e) =>
                                    setEditingStage({ ...editingStage, can_pause: e.target.checked })
                                }
                            />
                            <span>Se puede pausar?</span>
                        </div>

                        <div className="flex justify-center gap-2">
                            <Button onClick={() => setIsEditOpen(false)} variant="cancel" label="Cancelar" />
                            <Button onClick={handleUpdate} variant="save" label="Guardar" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

export default NewStage;