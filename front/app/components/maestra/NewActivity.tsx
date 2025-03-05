"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
    createActivitie,
    deleteActivitie,
    getActivitie,
    getActivitieId,
    updateActivitie,
} from "../../services/maestras/activityServices";
import { showError, showSuccess, showConfirm } from "../toastr/Toaster";
import Button from "../buttons/buttons";
import Table from "../table/Table";

// Tipos
type ActivityType = {
    type?: string;
    placeholder?: string;
    accept?: string;
    options?: string[];
};

interface Activities {
    id: number;
    code: number;
    description: string;
    config: string;
    binding: boolean;
}

interface EditFormData {
    id: number;
    description: string;
    config: string;
    binding: boolean;
    options?: string[]; // Opciones dinámicas
}

const activityTypes: Record<string, ActivityType> = {
    "Texto corto": { type: "text" },
    "Texto largo": { type: "textarea" },
    Adjunto: { type: "file" },
    Foto: { type: "image" },
    "Lista desplegable": { type: "select", options: ["Opción 1", "Opción 2"] },
    "Selección única": { type: "radio", options: ["Sí"] },
    "Selección múltiple": { type: "checkbox", options: ["Opción A", "Opción B"] },
    Firma: { type: "signature" },
    Informativo: { type: "text", placeholder: "Escribe aquí..." },
};

const initialSelectedType = "Texto corto";

// Componente reutilizable para manejar opciones
function OptionsInput({
    options,
    onChange,
    onAdd,
    onRemove,
}: {
    options: string[];
    onChange: (index: number, value: string) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
}) {
    return (
        <div>
            {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                        type="text"
                        value={option}
                        onChange={(e) => onChange(index, e.target.value)}
                        className="border p-1 rounded-md text-black flex-grow"
                    />
                    <button
                        onClick={() => onRemove(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md"
                        aria-label={`Eliminar opción ${index + 1}`}
                    >
                        X
                    </button>
                </div>
            ))}
            <button
                onClick={onAdd}
                className="bg-blue-500 text-white px-2 py-1 rounded-md"
            >
                Agregar opción
            </button>
        </div>
    );
}

export default function NewActivity() {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false); // Estado para el modal de edición
    const [selectedType, setSelectedType] = useState("Texto corto");
    const [formData, setFormData] = useState({
        description: "",
        config: JSON.stringify(activityTypes["Texto corto"], null, 2),
        binding: false,
    });
    const [activities, setActivities] = useState<Activities[]>([]);
    const [options, setOptions] = useState<string[]>([]);
    const [parsedConfig, setParsedConfig] = useState<ActivityType | null>(null);
    const [editingActivity, setEditingActivity] = useState<EditFormData | null>(null); // Movido aquí

    const columns = ["code", "description", "binding"];
    const columnLabels: { [key: string]: string } = {
        code: "Código",
        description: "Descripción",
        binding: "Obligatorio",
    };

    // Parsear el JSON de formData.config cuando cambia
    useEffect(() => {
        try {
            const parsed = JSON.parse(formData.config);
            setParsedConfig(parsed);
        } catch (error) {
            console.error("Error al parsear config:", error);
            setParsedConfig(null);
        }
    }, [formData.config]);

    // Función para obtener las actividades
    const fetchActivities = async () => {
        try {
            const data = await getActivitie();
            setActivities(data);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (selectedType: string) => {
        setSelectedType(selectedType);
        const selectedConfig =
            activityTypes[selectedType] || activityTypes["Texto corto"];
        const newConfig = JSON.stringify(selectedConfig, null, 2);
        setFormData({ ...formData, config: newConfig });

        if (["select", "radio", "checkbox"].includes(selectedConfig.type || "")) {
            setOptions(selectedConfig.options || []);
        } else {
            setOptions([]);
        }
    };

    const addOption = () => {
        if (parsedConfig?.type === "radio" && options.length >= 1) {
            showError("Solo se permite una opción para selección única");
            return;
        }
        setOptions([...options, "Nueva opción"]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        if (!formData.description.trim()) {
            showError("La descripción es obligatoria");
            return false;
        }
        if (
            ["select", "radio", "checkbox"].includes(parsedConfig?.type || "") &&
            options.length === 0
        ) {
            showError("Debes agregar al menos una opción");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            const payload = {
                description: formData.description,
                config: JSON.stringify(parsedConfig),
                binding: formData.binding,
            };

            console.log("Datos enviados al crear actividad:", payload); // 🚀 LOG DE DATOS ENVIADOS

    
            await createActivitie(payload);
            showSuccess("Actividad creada exitosamente");
            setIsOpen(false);
            fetchActivities();
            resetModalData();
        } catch (error) {
            console.error("Error al crear la actividad:", error);
            showError("Error al crear la actividad");
        }
    };

    const resetModalData = () => {
        setFormData({
            description: "",
            config: JSON.stringify(activityTypes["Texto corto"], null, 2),
            binding: false,
        });
        setSelectedType(initialSelectedType);
        setOptions([]);
    };

    const handleEdit = async (id: number) => {
        try {
            const data = await getActivitieId(id);
    
            // Parsear el config
            let parsedConfig;
            try {
                parsedConfig = typeof data.config === 'string' 
                    ? JSON.parse(data.config) 
                    : data.config;
            } catch (error) {
                console.error("Error parsing config:", error);
                parsedConfig = {};
            }
    
            // Convertir binding a booleano
            const binding = data.binding === 1 ? true : false;
    
            // Preparar datos para edición
            setEditingActivity({
                id: data.id,
                description: data.description,
                config: JSON.stringify(parsedConfig, null, 2), // Convertir a cadena JSON para el formulario
                binding: binding, // Asegúrate de que esto sea un booleano
                options: parsedConfig.options || [], // Cargar opciones si existen
            });
    
            // Abrir modal de edición
            setIsEditOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la actividad:", error);
            showError("Error obteniendo datos de la actividad");
        }
    };
    const handleUpdate = async () => {
        if (!editingActivity) return;
    
        try {
            const config = JSON.stringify({
                type: parsedConfig?.type || "",
                options: editingActivity.options || []
            });
    
            // Enviar binding como booleano (true o false)
            const updatedData = {
                description: editingActivity.description,
                config: config,
                binding: editingActivity.binding, // Enviar como booleano
            };
    
            console.log("Datos enviados al actualizar actividad:", updatedData);
    
            await updateActivitie(editingActivity.id, updatedData);
            await fetchActivities();
            setIsEditOpen(false);
            showSuccess("Actividad actualizada correctamente");
        } catch (error) {
            console.error("Error al actualizar actividad:", error);
            showError("Error al actualizar actividad");
        }
    };
    
    const handleTypeChangeEdit = (selectedType: string) => {
        if (!editingActivity) return;
    
        // Obtener la configuración del tipo seleccionado
        const selectedConfig = activityTypes[selectedType] || activityTypes["Texto corto"];
        const newConfig = JSON.stringify(selectedConfig, null, 2);
    
        // Actualizar el estado editingActivity
        setEditingActivity({
            ...editingActivity,
            config: newConfig,
            options: selectedConfig.options || [], // Reiniciar opciones si el tipo cambia
        });
    };
    


    const handleDelete = async (id: number) => {
        showConfirm("¿Seguro que quieres eliminar esta Actividad?", async () => {
            try {
                await deleteActivitie(id);
                setActivities((prevActivities) =>
                    prevActivities.filter((activitie) => activitie.id !== id)
                );
                showSuccess("Actividad eliminada con éxito");
            } catch (error) {
                console.error("Error al eliminar Actividad:", error);
                showError("Error al eliminar Actividad");
            }
        });
    };

    return (
        <div>
            {/* Botón para abrir el modal de creación */}
            <div className="flex justify-center space-x-2 mb-2">
                <Button onClick={() => setIsOpen(true)} variant="create" label="Crear Actividad" />
            </div>

            {/* Modal de creación */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Overlay del modal */}
                        <motion.div
                            className="absolute inset-0 bg-black bg-opacity-50"
                            onClick={() => setIsOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Contenido del modal de creación */}
                        <motion.div
                            className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-black text-center">Crear Actividad</h2>

                            {/* Campo de descripción */}
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Descripción"
                                className="w-full border p-2 rounded-md text-black mb-4"
                            />

                            {/* Selector de tipo de actividad */}
                            <select
                                value={selectedType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                className="w-full border p-2 rounded-md text-black mb-4"
                            >
                                {Object.keys(activityTypes).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            {/* Checkbox para "Requerido" */}
                            <label className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    checked={formData.binding}
                                    onChange={(e) =>
                                        setFormData({ ...formData, binding: e.target.checked })
                                    }
                                    className="h-5 w-5 text-blue-500 rounded-md"
                                />
                                <span className="text-black">Requerido</span>
                            </label>

                            {/* Opciones dinámicas */}
                            {parsedConfig &&
                                ["select", "radio", "checkbox"].includes(parsedConfig.type || "") && (
                                    <div className="mb-4">
                                        <h3 className="font-medium mb-2">Opciones:</h3>
                                        <OptionsInput
                                            options={options}
                                            onChange={(index, value) => {
                                                const newOptions = [...options];
                                                newOptions[index] = value;
                                                setOptions(newOptions);
                                            }}
                                            onAdd={addOption}
                                            onRemove={removeOption}
                                        />
                                    </div>
                                )}

                            {/* Botones */}
                            <div className="flex justify-end space-x-4">
                                <Button onClick={() => setIsOpen(false)} variant="cancel" label="Cancelar" />
                                <Button onClick={handleSubmit} variant="create" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de edición */}
            <AnimatePresence>
    {isEditOpen && editingActivity && (
        <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Overlay del modal */}
            <motion.div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setIsEditOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            />

            {/* Contenido del modal de edición */}
            <motion.div
                className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-xl font-semibold mb-4 text-black text-center">Editar Actividad</h2>

                {/* Campo de descripción */}
                <input
                    type="text"
                    name="description"
                    value={editingActivity.description}
                    onChange={(e) =>
                        setEditingActivity({ ...editingActivity, description: e.target.value })
                    }
                    placeholder="Descripción"
                    className="w-full border p-2 rounded-md text-black mb-4"
                />

                {/* Selector de tipo de actividad */}
                <select
                    value={editingActivity ? JSON.parse(editingActivity.config).type : ""}
                    onChange={(e) => handleTypeChangeEdit(e.target.value)}
                    className="w-full border p-2 rounded-md text-black mb-4"
                >
                    {Object.keys(activityTypes).map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>

                {/* Checkbox para "Requerido" */}
                <label className="flex items-center space-x-2 mb-4">
                    <input
                        type="checkbox"
                        checked={editingActivity.binding}
                        onChange={(e) =>
                            setEditingActivity({ ...editingActivity, binding: e.target.checked })
                        }
                        className="h-5 w-5 text-blue-500 rounded-md"
                    />
                    <span className="text-black">Requerido</span>
                </label>

                {/* Opciones dinámicas */}
                {editingActivity && ["select", "radio", "checkbox"].includes(JSON.parse(editingActivity.config).type) && (
                    <div className="mb-4">
                        <h3 className="font-medium mb-2">Opciones:</h3>
                        <OptionsInput
                            options={editingActivity.options || []}
                            onChange={(index, value) => {
                                const newOptions = [...editingActivity.options!];
                                newOptions[index] = value;
                                setEditingActivity({ ...editingActivity, options: newOptions });
                            }}
                            onAdd={() => setEditingActivity({ ...editingActivity, options: [...editingActivity.options!, "Nueva opción"] })}
                            onRemove={(index) => setEditingActivity({ ...editingActivity, options: editingActivity.options!.filter((_, i) => i !== index) })}
                        />
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-4">
                    <Button onClick={() => setIsEditOpen(false)} variant="cancel" label="Cancelar" />
                    <Button onClick={handleUpdate} variant="create" label="Guardar" />
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>

            {/* Tabla de actividades */}
            <Table columns={columns} rows={activities} columnLabels={columnLabels} onDelete={handleDelete} onEdit={handleEdit} />
        </div>
    );
}