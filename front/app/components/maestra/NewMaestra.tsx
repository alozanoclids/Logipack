"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    createMaestra,
    getMaestra,
    deleteMaestra,
    getMaestraId,
    updateMaestra,
} from "../../services/maestras/maestraServices";
import { getStage, getStageId } from "../../services/maestras/stageServices";
import Button from "../buttons/buttons";
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
import Text from "../text/Text";
import Table from "../table/Table";
import PermissionCheck from "..//permissionCheck/PermissionCheck";
import { useAuth } from '../../hooks/useAuth'
import nookies from "nookies";
import { getUserByEmail } from '../../services/userDash/authservices';

// Definiciones de interfaces
const estados = ["", "En creación", "Revisión", "Aprobada", "Obsoleta"];
const tiposProducto = ["Tipo A", "Tipo B", "Tipo C"];

interface Stage {
    id: number;
    description: string;
}

interface Data {
    id: number;
    code: number;
    descripcion: string;
    requiere_bom: boolean;
    type_product: string;
    type_stage: string;
    status: string;
    aprobado: boolean;
}

interface Maestra {
    descripcion: string;
    requiere_bom: boolean;
    type_product: string;
    type_stage: string;
    status: string;
    aprobado: boolean;
}

const Maestra = () => {
    // Estados del componente
    const [isOpen, setIsOpen] = useState(false);
    const [maestra, setMaestra] = useState<Data[]>([]);
    const [editingMaestra, setEditingMaestra] = useState<Data | null>(null);
    const [descripcion, setDescripcion] = useState("");
    const [requiereBOM, setRequiereBOM] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<number[]>([]);
    const [estado, setEstado] = useState("");
    const [aprobado, setAprobado] = useState(false);
    const [stages, setStages] = useState<Stage[]>([]);
    const [selectedStages, setSelectedStages] = useState<Stage[]>([]);


    //UseEffect para actualizacion del token
    const { isAuthenticated } = useAuth();
    const [userName, setUserName] = useState("");
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const cookies = nookies.get(null);
                const email = cookies.email;
                if (email) {
                    const decodedEmail = decodeURIComponent(email);
                    const user = await getUserByEmail(decodedEmail);
                    if (user.usuario) {
                        setUserName(user.usuario.name);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        if (isAuthenticated) fetchUserData();
    }, [isAuthenticated]);
    // Fin useEffect

    useEffect(() => {
        const fetchStages = async () => {
            try {
                const stages = await getStage(); // Cargar todas las fases
                setStages(stages);
            } catch (error) {
                console.error("Error fetching stages:", error);
            }
        };
        fetchStages();
    }, []);
    // Fetch de fases al cargar el componente
    useEffect(() => {
        const fetchStages = async () => {
            try {
                const data: Stage[] = await getStage();
                setStages(data);
            } catch (error) {
                showError("Error al cargar las fases");
            }
        };
        fetchStages();
    }, []);

    // Fetch de maestras al cargar el componente
    const fetchMaestra = useCallback(async () => {
        try {
            const datas = await getMaestra();
            setMaestra(datas);
        } catch (error) {
            console.error("Error fetching maestras:", error);
        }
    }, []);

    useEffect(() => {
        fetchMaestra();
    }, [fetchMaestra]);

    // Manejo de selección/deselección de fases
    // Funciones para seleccionar y deseleccionar
    const handleSelectStage = (stage: Stage) => {
        // Si la etapa ya está seleccionada, no hacemos nada
        if (selectedStages.some(s => s.id === stage.id)) return;
        setSelectedStages(prev => [...prev, stage]);
    };

    const handleRemoveStage = (stage: Stage) => {
        setSelectedStages(prev => prev.filter(s => s.id !== stage.id));
    };


    // Validación y envío del formulario
    const handleSubmit = async () => {
        if (!descripcion.trim()) {
            showError("La descripción es obligatoria");
            return;
        }
        if (tipoSeleccionado.length === 0) {
            showError("Debes seleccionar al menos un tipo de producto");
            return;
        }
        if (selectedStages.length === 0) {
            showError("Debes seleccionar al menos una fase");
            return;
        }

        try {
            await createMaestra({
                descripcion,
                requiere_bom: requiereBOM,
                type_product: JSON.stringify(tipoSeleccionado),
                type_stage: JSON.stringify(selectedStages.map((s) => s.id)),
                status: estado,
                aprobado,
            });
            showSuccess("Maestra creada con éxito");
            setIsOpen(false);
            resetForm();
            fetchMaestra(); // Refrescar la lista
        } catch (error) {
            showError("Error al crear la maestra");
        }
    };

    // Eliminar una maestra
    const handleDelete = async (id: number) => {
        showConfirm("¿Estás seguro de eliminar este maestra?", async () => {
            try {
                await deleteMaestra(id);
                setMaestra((prevMaestra) => prevMaestra.filter((maestra) => maestra.id !== id));
                showSuccess("Maestra eliminada exitosamente");
                fetchMaestra(); // Refrescar la lista
            } catch (error) {
                console.error("Error al eliminar maestra:", error);
                showError("Error al eliminar maestra");
            }
        });
    };

    // Abrir modal de creación
    const openCreateModal = () => {
        setEditingMaestra(null);
        resetForm();
        setIsOpen(true);
    };

    // Abrir modal de edición
    const handleEdit = async (id: number) => {
        try {
            const data = await getMaestraId(id);
            setEditingMaestra(data);
            setDescripcion(data.descripcion);
            setRequiereBOM(data.requiere_bom);

            // Convertir los IDs de los tipos de producto a números
            setTipoSeleccionado(JSON.parse(data.type_product));

            // Convertir los IDs de las fases en objetos Stage completos
            const selectedStageIds = JSON.parse(data.type_stage); // Array de IDs
            const selectedStagesData = stages.filter((stage) =>
                selectedStageIds.includes(stage.id)
            ); // Filtrar los stages por ID
            setSelectedStages(selectedStagesData);

            setEstado(data.status);
            setAprobado(data.aprobado);
            setIsOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la Maestra:", error);
            showError("Error obteniendo datos de la Maestra");
        }
    };

    // Actualizar una maestra
    const handleUpdate = async () => {
        if (!editingMaestra) return;

        if (!descripcion.trim()) {
            showError("La descripción es obligatoria");
            return;
        }
        if (tipoSeleccionado.length === 0) {
            showError("Debes seleccionar al menos un tipo de producto");
            return;
        }
        if (selectedStages.length === 0) {
            showError("Debes seleccionar al menos una fase");
            return;
        }

        try {
            await updateMaestra(editingMaestra.id, {
                descripcion,
                requiere_bom: requiereBOM,
                type_product: JSON.stringify(tipoSeleccionado),
                type_stage: JSON.stringify(selectedStages.map((s) => s.id)),
                status: estado,
                aprobado,
            });
            showSuccess("Maestra actualizada con éxito");
            setIsOpen(false);
            resetForm();
            fetchMaestra(); // Refrescar la lista
        } catch (error) {
            showError("Error al actualizar la maestra");
        }
    };


    // Resetear el formulario
    const resetForm = () => {
        setDescripcion("");
        setRequiereBOM(false);
        setTipoSeleccionado([]);
        setEstado("");
        setAprobado(false);
        setSelectedStages([]);
    };

    return (
        <div>
            {/* Botón para abrir el modal de creación */}
            <div className="flex justify-center space-x-2 mb-2">
                <PermissionCheck requiredPermission="crear_maestras">
                    <Button onClick={openCreateModal} variant="create" label="Crear Maestra" />
                </PermissionCheck>
            </div>

            {/* Modal de creación/edición */}
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[100%] md:max-w-[600px] max-h-[90vh] overflow-y-auto z-50"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                    >
                        <Text type="title">{editingMaestra ? "Editar Maestra" : "Crear Maestra"}</Text>
                        <Text type="subtitle">Descripción</Text>
                        <input
                            type="text"
                            placeholder="Descripción"
                            className="w-full p-2 border text-black mb-2 min-w-0"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                        <Text type="subtitle">Requiere BOM</Text>
                        <input
                            type="checkbox"
                            checked={requiereBOM}
                            onChange={() => setRequiereBOM(!requiereBOM)}
                        />{" "}
                        <span>Requiere BOM</span>
                        <Text type="subtitle">Seleccione Estado</Text>
                        <select
                            className="w-full p-2 border mb-2 min-w-0 text-black"
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                        >
                            {estados.map((estado) => (
                                <option key={estado} value={estado}>
                                    {estado}
                                </option>
                            ))}
                        </select>
                        <Text type="subtitle">Aprobado</Text>
                        <input
                            type="checkbox"
                            checked={aprobado}
                            onChange={() => setAprobado(!aprobado)}
                        />{" "}
                        <span>Aprobado</span>
                        <Text type="subtitle">Seleccione Tipo de Producto</Text>
                        <select
                            multiple
                            className="w-full p-2 border mb-2 min-w-0 text-black"
                            value={tipoSeleccionado.map(String)}
                            onChange={(e) => {
                                const selectedIds = Array.from(
                                    e.target.selectedOptions,
                                    (option) => Number(option.value)
                                );
                                setTipoSeleccionado(selectedIds);
                            }}
                        >
                            {tiposProducto.map((tipo, index) => (
                                <option key={index} value={index}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                        <Text type="subtitle">Seleccione las Fases</Text>
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            {/* Lista de fases disponibles */}
                            <div className="w-full md:w-1/2 border p-2 max-h-40 overflow-y-auto">
                                <Text type="subtitle">Disponibles</Text>
                                {stages.length > 0 ? (
                                    stages.map((stage) => {
                                        const isSelected = selectedStages.some(s => s.id === stage.id);
                                        return (
                                            <div key={stage.id} className="p-2 border-b">
                                                <span
                                                    className={`block w-full text-center p-2 ${isSelected
                                                        ? 'text-gray-500 cursor-not-allowed opacity-50'
                                                        : 'text-black cursor-pointer hover:bg-blue-500 hover:text-white'
                                                        }`}
                                                    onClick={() => {
                                                        if (!isSelected) handleSelectStage(stage);
                                                    }}
                                                >
                                                    {stage.description}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center">No hay fases disponibles</p>
                                )}
                            </div>


                            {/* Lista de fases seleccionadas */}
                            <div className="w-full md:w-1/2 border p-2 max-h-40 overflow-y-auto">
                                <Text type="subtitle">Seleccionadas</Text>
                                {selectedStages.length > 0 ? (
                                    selectedStages.map((stage) => (
                                        <div key={stage.id} className="p-2 border-b">
                                            <span
                                                className="block w-full text-black cursor-pointer hover:bg-red-500 hover:text-white text-center p-2"
                                                onClick={() => handleRemoveStage(stage)}
                                            >
                                                {stage.description}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center">No hay fases seleccionadas</p>
                                )}
                            </div>

                        </div>


                        <div className="flex justify-end space-x-4 mt-4">
                            <Button onClick={() => setIsOpen(false)} variant="cancel" label="Cancelar" />
                            <Button
                                onClick={editingMaestra ? handleUpdate : handleSubmit}
                                variant="create"
                                label={editingMaestra ? "Actualizar" : "Crear"}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Tabla de maestras */}
            <Table
                columns={["descripcion", "status", "aprobado"]}
                rows={maestra}
                columnLabels={{
                    descripcion: "Descripción",
                    status: "Estado",
                    aprobado: "Aprobado",
                }}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
};

export default Maestra;