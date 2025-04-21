"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createStage, getStageId, updateStage, deleteStage, getStage } from "../../services/maestras/stageServices";
import { getActivitie } from "../../services/maestras/activityServices";
import { showError, showSuccess, showConfirm } from "../toastr/Toaster";
import Table from "../table/Table";
import Button from "../buttons/buttons";
import { Stage, Data } from "../../interfaces/NewStage";
const phases = ["Planeacion", "Conciliación", "Actividades"];
import Text from "../text/Text";

function NewStage() {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [stage, setStage] = useState<Stage[]>([]);
    const [editingStage, setEditingStage] = useState<Stage | null>(null);
    const [description, setDescription] = useState("");
    const [phaseType, setPhaseType] = useState<"Planeacion" | "Conciliación" | "Actividades">("Planeacion");
    const [repeat, setRepeat] = useState(false);
    const [repeatMinutes, setRepeatMinutes] = useState("");
    const [alert, setAlert] = useState(false);
    const [status, setStatus] = useState(false);
    const [canPause, setCanPause] = useState(false);
    const [availableActivities, setAvailableActivities] = useState<{ id: number; description: string; binding: number }[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<{ id: number; description: string }[]>([]);

    // Función para obtener las fases
    const fetchStage = async () => {
        try {
            const data = await getStage();
            // console.log("Datos obtenidos de las fases:", data); // 🚀 LOG
            setStage(data);
        } catch (error) {
            console.error("Error fetching stages:", error);
        }
    };

    useEffect(() => {
        fetchStage();
    }, []);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const activities = await getActivitie();
                setAvailableActivities(activities);
            } catch (error) {
                showError("Error al cargar las actividades");
            }
        };

        if (phaseType === "Actividades") {
            fetchActivities();
        } else {
            setAvailableActivities([]);
            setSelectedActivities([]);
        }
    }, [phaseType]);

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
        if (phaseType === "Actividades" && selectedActivities.length === 0) {
            showError("Debes seleccionar al menos una actividad.");
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
            status,
            activities: "[]", // Inicializamos como una cadena vacía
        };

        // Si el tipo de fase es "Actividades", agregamos las actividades seleccionadas
        if (phaseType === "Actividades") {
            const activityIds = selectedActivities.map((activity) => activity.id);
            newStage.activities = JSON.stringify(activityIds);
        }
        try {
            const response = await createStage(newStage);
            if (response.status === 201) {
                showSuccess("Fase creada con éxito");
                setIsOpen(false);
                fetchStage();
                resetForm();
            } else {
                showError("Error al crear la fase");
            }
        } catch (error) {
            console.error("Error al guardar la fase:", error);
            showError("Ocurrió un error al guardar la fase");
        }
    };

    useEffect(() => {
        if (editingStage && phaseType === "Actividades" && availableActivities.length > 0) {
            const activityIds = JSON.parse(editingStage.activities);
            const selected = availableActivities.filter(activity =>
                activityIds.includes(activity.id)
            );
            setSelectedActivities(selected);

        }
    }, [availableActivities, editingStage, phaseType]);

    const handleEdit = async (id: number) => {
        try {
            const data = await getStageId(id);
            console.log("Datos obtenidos para editar la fase:", data); // 🚀 LOG

            setEditingStage(data);
            setDescription(data.description);
            setPhaseType(data.phase_type);
            setRepeat(data.repeat);
            setRepeatMinutes(data.repeat_minutes?.toString() || "");
            setAlert(data.alert);
            setStatus(data.status);
            setCanPause(data.can_pause);


            setIsEditOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la fase:", error);
            showError("Error obteniendo datos de la fase");
        }
    };

    const handleUpdate = async () => {
        if (!editingStage) return;

        const updatedStage: Data = {
            description,
            phase_type: phaseType,
            repeat,
            repeat_minutes: repeat ? Number(repeatMinutes) : undefined,
            alert,
            can_pause: canPause,
            status,
            activities: "[]",
        };

        if (phaseType === "Actividades") {
            const activityIds = selectedActivities.map((activity) => activity.id);
            updatedStage.activities = JSON.stringify(activityIds);
        }

        console.log("Datos a enviar al actualizar la fase:", updatedStage); // 🚀 LOG

        try {
            const response = await updateStage(editingStage.id, updatedStage);
            console.log("Respuesta del servidor al actualizar la fase:", response); // 🚀 LOG

            showSuccess("Fase actualizada con éxito");
            setIsEditOpen(false);
            fetchStage();
            resetForm();
        } catch (error) {
            console.error("Error al actualizar la fase:", error);
            showError("Ocurrió un error al actualizar la fase");
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm("¿Seguro que quieres eliminar esta fase?", async () => {
            try {
                await deleteStage(id);
                setStage((prevStage) => prevStage.filter((stage) => stage.id !== id));
                showSuccess("Fase eliminada con éxito");
            } catch (error) {
                console.error("Error al eliminar fase:", error);
                showError("Error al eliminar fase");
            }
        });
    };

    const resetForm = () => {
        setDescription("");
        setPhaseType("Planeacion");
        setRepeat(false);
        setRepeatMinutes("");
        setAlert(false);
        setStatus(false);
        setCanPause(false);
        setSelectedActivities([]);
    };

    return (
        <div>
            {/* Botón de crear fase */}
            <div className="flex justify-center space-x-2 mb-2">
                <Button onClick={() => setIsOpen(true)} variant="create" label="Crear Fase" />
            </div>

            {(isOpen || isEditOpen && editingStage) && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
                >
                    <motion.div className="relative bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl max-h-screen overflow-y-auto">
                        {/* Botón de cierre */}
                        <button
                            onClick={() => {
                                editingStage ? setIsEditOpen(false) : setIsOpen(false);
                                resetForm();
                            }}
                            className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <Text type="title">{editingStage ? "Editar Fase" : "Crear Fase"}</Text>

                        <div className="space-y-4">
                            {/* Descripción */}
                            <div>
                                <Text type="subtitle">Descripción</Text>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 w-full text-center p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                                />
                            </div>

                            {/* Tipo de Fase */}
                            <div>
                                <Text type="subtitle">Tipo de Fase</Text>
                                <select
                                    value={phaseType}
                                    onChange={(e) =>
                                        setPhaseType(e.target.value as "Planeacion" | "Conciliación" | "Actividades")
                                    }
                                    className="mt-1 w-full text-center p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                                >
                                    {phases.map((phase) => (
                                        <option key={phase} value={phase}>
                                            {phase}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Actividades (solo si Tipo de Fase es Actividades) */}
                            {phaseType === "Actividades" && (
                                <div className="space-y-4">
                                    <Text type="subtitle">Actividades</Text>
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Lista de actividades disponibles */}
                                        <div className="w-full md:w-1/2">
                                            <Text type="subtitle">Disponibles</Text>
                                            <ul className="mt-1 border border-gray-300 p-2 rounded-lg max-h-48 overflow-y-auto">
                                                {availableActivities.map((activity) => {
                                                    const isAdded = selectedActivities.some(
                                                        (item) => item.id === activity.id
                                                    );
                                                    const isBindingDisabled = activity.binding === 0;
                                                    const isDisabled = isAdded || isBindingDisabled;
                                                    return (
                                                        <li
                                                            key={activity.id}
                                                            className="py-1 border-b border-gray-200 last:border-0"
                                                        >
                                                            <button
                                                                disabled={isDisabled}
                                                                onClick={() =>
                                                                    setSelectedActivities((prev) => [...prev, activity])
                                                                }
                                                                className={`w-full text-sm transition text-center ${isBindingDisabled
                                                                    ? "text-red-500 cursor-not-allowed"
                                                                    : isAdded
                                                                        ? "text-gray-400 cursor-not-allowed"
                                                                        : "text-blue-500 hover:text-blue-700"
                                                                    }`}
                                                            >
                                                                {activity.description}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>

                                        {/* Lista de actividades seleccionadas */}
                                        <div className="w-full md:w-1/2">
                                            <Text type="subtitle">Seleccionadas</Text>
                                            <ul className="mt-1 border border-gray-300 p-2 rounded-lg max-h-48 overflow-y-auto">
                                                {selectedActivities.map((activity) => (
                                                    <li
                                                        key={activity.id}
                                                        className="flex items-center justify-between py-1 border-b border-gray-200 last:border-0"
                                                    >
                                                        <span className="text-sm text-black">
                                                            {activity.description}
                                                        </span>
                                                        <button
                                                            className="text-red-500 hover:text-red-700 text-sm text-center"
                                                            onClick={() =>
                                                                setSelectedActivities((prev) =>
                                                                    prev.filter((item) => item.id !== activity.id)
                                                                )
                                                            }
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Opciones adicionales */}
                            <div className="mt-4 flex justify-center gap-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={repeat}
                                        onChange={(e) => setRepeat(e.target.checked)}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <span className="text-sm text-black">Repetir</span>
                                    {repeat && (
                                        <input
                                            type="number"
                                            placeholder="Cada (min)"
                                            value={repeatMinutes}
                                            onChange={(e) => setRepeatMinutes(e.target.value)}
                                            className="min-w-[120px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black text-sm"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={alert}
                                        onChange={(e) => setAlert(e.target.checked)}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <span className="text-sm text-black">Activar Alerta</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={status}
                                        onChange={(e) => setStatus(e.target.checked)}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <span className="text-sm text-black">Activar Estado</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={canPause}
                                        onChange={(e) => setCanPause(e.target.checked)}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <span className="text-sm text-black">¿Se puede pausar?</span>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="mt-4 flex justify-center gap-4">
                            <Button
                                onClick={() => {
                                    editingStage ? setIsEditOpen(false) : setIsOpen(false);
                                    resetForm();
                                }}
                                variant="cancel"
                                label="Cancelar"
                            />
                            <Button
                                onClick={() => (editingStage ? handleUpdate() : handleSave())}
                                variant="create"
                                disabled={!description.trim() || (phaseType === "Actividades" && selectedActivities.length === 0)}
                                label={editingStage ? "Actualizar" : "Crear"}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Tabla de fases */}
            <Table columns={["description", "phase_type", "status"]} rows={stage} columnLabels={{
                description: "Descripción",
                phase_type: "Tipo de Fase",
                status: "Estado",
            }} onDelete={handleDelete} onEdit={handleEdit} />
        </div>
    );
}

export default NewStage;