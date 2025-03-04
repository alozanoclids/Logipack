"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createStage, getStageId, updateStage, deleteStage, getStage } from "../../services/maestras/stageServices";
import { showError, showSuccess, showConfirm } from "../toastr/Toaster";
import Table from "../table/Table";

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
    const [stage, setStage] = useState<Stage[]>([]);
    const [editingStage, setEditingStage] = useState<Data | null>(null);
    const [editForm, setEditForm] = useState({
        descripcion: "",
        phase_type: false,
        repeat_minutes: "",
        repeat: false,
        can_pause: false,
    });
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
            const newFormData = {
                descripcion: data.description,
                phase_type: data.phase_type,
                repeat_minutes: data.repeat_minutes?.toString(),
                alert: Boolean(data.alert),
                repeat: Boolean(data.repeat),
                can_pause: Boolean(data.can_pause),
            };

            setEditingStage(data);
            setEditForm(newFormData);
            setDescription(data.description);
            setPhaseType(data.phase_type);
            setRepeat(data.repeat);
            setRepeatMinutes(data.repeat_minutes?.toString() || "");
            setAlert(data.alert);
            setCanPause(data.can);
            setIsOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la fase:", error);
            showError("Error obteniendo datos de la fase");
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
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
                Crear Fase
            </button>


            <Table columns={columns} rows={stage} columnLabels={columnLabels} onDelete={handleDelete} onEdit={handleEdit} />

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                >
                    <motion.div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
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

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => { setIsOpen(false); resetForm() }}
                                className="px-4 py-2 border rounded-md text-black"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    if (editingStage) {
                                        // Lógica para actualizar la fase existente
                                        const updatedStage: Stage = {
                                            id,
                                            description,
                                            phase_type: phaseType,
                                            repeat,
                                            repeat_minutes: repeat ? Number(repeatMinutes) : undefined,
                                            alert,
                                            can_pause: canPause,
                                        };
                                        try {
                                            await updateStage(editingStage.id, updatedStage);
                                            showSuccess("Fase actualizada con éxito");
                                            setIsOpen(false);
                                            resetForm();
                                        } catch (error) {
                                            console.error("Error al actualizar la fase:", error);
                                            showError("Ocurrió un error al actualizar la fase");
                                        }
                                    } else {
                                        await handleSave();
                                    }
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded-md"
                            ></button>
                            <button
                                disabled={phaseType !== "Actividades"}
                                className={`px-4 py-2 rounded-md ${phaseType === "Actividades"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                Asociar Actividad
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

export default NewStage;