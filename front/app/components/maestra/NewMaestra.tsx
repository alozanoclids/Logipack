"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createMaestra, getMaestra, deleteMaestra, getMaestraId, updateMaestra } from "../../services/maestras/maestraServices";
import Button from "../buttons/buttons";
import Table from "../table/Table";
import { showError, showSuccess, showConfirm } from "../toastr/Toaster";

const estados = ["En creación", "Revisión", "Aprobada", "Obsoleta"];
const tiposProducto = ["Tipo A", "Tipo B", "Tipo C"];

interface Maestra {
    id: number;
    code: string;
    descripcion: string;
    requiere_bom: boolean;
    type_product: any[];
    status: string;
    aprobado: boolean;
}

interface TypeProduct {
    id: number;
    name: string;
}

function NewMaestra() {
    const [maestra, setMaestra] = useState<Maestra[]>([]);
    const [editingMaestra, setEditingMaestra] = useState<Maestra | null>(null);
    const [editForm, setEditForm] = useState({
        code: "",
        descripcion: "",
        requiere_bom: false,
        type_product: [],
        status: "",
        aprobado: false
    });
    const [codigo, setCodigo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [requiereBOM, setRequiereBOM] = useState(false);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<string[]>([]);
    const [estado, setEstado] = useState("En creación");
    const [aprobado, setAprobado] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenFases, setIsOpenFases] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const columns = ["code", "requiere_bom", "status"];
    const columnLabels: { [key: string]: string } = {
        code: "Código",
        requiere_bom: "BOM",
        status: "Estado",
    };

    useEffect(() => {
        const fetchMaestra = async () => {
            try {
                const data = await getMaestra();
                setMaestra(data);
            } catch (error) {
                console.error("Error fetching maestras:", error);
            }
        };
        fetchMaestra();
    }, []);

    useEffect(() => {
        if (editForm) {
            setCodigo(editForm.code);
            setDescripcion(editForm.descripcion);
            setRequiereBOM(editForm.requiere_bom);
            setTipoSeleccionado(editForm.type_product.map((tp: TypeProduct) => tp.name));
            setEstado(editForm.status);
            setAprobado(editForm.aprobado);
        }
    }, [editForm]);


    const generarCodigoAutomatico = () => {
        setCodigo(`MA-${Date.now()}`);
    };

    const toggleAprobado = () => {
        setAprobado(!aprobado);
    };

    const cerrarModal = () => {
        setCodigo("");
        setDescripcion("");
        setRequiereBOM(false);
        setTipoSeleccionado([]);
        setEstado("En creación");
        setAprobado(false);
        setIsOpen(false);
        setError("");
        setSuccess("");
    };

    const cerrarModalFases = () => { 
        setIsOpenFases(false); 
    };

    const handleSave = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const newMaestra = {
                code: codigo,
                descripcion,
                requiere_bom: requiereBOM,
                type_product: tipoSeleccionado,
                status: estado,
                aprobado,
            };

            await createMaestra(newMaestra);
            setSuccess("Maestra creada exitosamente");
            cerrarModal();
            const updatedData = await getMaestra();
            setMaestra(updatedData);
        } catch (err) {
            setError("Error al crear la Maestra");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id: number) => {
        try {
            const maestraData = await getMaestraId(id);

            setEditingMaestra(maestraData);
            setEditForm({
                code: maestraData.code,
                descripcion: maestraData.descripcion,
                requiere_bom: Boolean(maestraData.requiere_bom),
                type_product: typeof maestraData.type_product === "string"
                    ? JSON.parse(maestraData.type_product)
                    : maestraData.type_product,
                status: maestraData.status,
                aprobado: Boolean(maestraData.aprobado),
            });

            setIsOpen(true); // Asegurar que el modal se abra después de cargar los datos
        } catch (error) {
            console.error("Error obteniendo datos de la maestra:", error);
            showError("Error obteniendo datos de la maestra");
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm("¿Seguro que quieres eliminar esta maestra?", async () => {
            try {
                await deleteMaestra(id);
                setMaestra((prevMaestra) => prevMaestra.filter((maestra) => maestra.id !== id));
                showSuccess("Maestra eliminado con éxito");
            } catch (error) {
                console.error("Error al eliminar maestra:", error);
                showError("Error al eliminar maestra");
            }
        });
    };

    const handleSubmit = async (id: number) => {
        try {
            await updateMaestra(id, {
                code: editForm.code,
                descripcion: editForm.descripcion,
                requiere_bom: editForm.requiere_bom,
                type_product: JSON.stringify(editForm.type_product), // Si es un array de objetos, se convierte a string
                status: editForm.status,
                aprobado: editForm.aprobado,
            });

            showSuccess("Maestra actualizada correctamente");
            cerrarModal(); // Si tienes una función para cerrar el modal
        } catch (error) {
            console.error("Error actualizando la maestra:", error);
            showError("Error al actualizar la maestra");
        }
    };


    return (
        <div>
            <div className="flex justify-center space-x-2 mb-2">
                <Button onClick={() => setIsOpen(true)} variant="create" label="Crear Maestra" />
                <Button onClick={() => setIsOpenFases(true)} variant="create" label="Agregar Fase" />
            </div>

            <Table columns={columns} rows={maestra} columnLabels={columnLabels} onDelete={handleDelete} onEdit={handleEdit} />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full text-black"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                        >
                            <h1 className="text-2xl font-bold text-center mb-4">Crear Maestra</h1>

                            {error && <p className="text-red-500">{error}</p>}
                            {success && <p className="text-green-500">{success}</p>}

                            <label className="block font-medium">Código:</label>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    placeholder="Ingrese código..."
                                    className="border p-2 rounded w-full"
                                />
                                <button onClick={generarCodigoAutomatico} className="bg-blue-500 text-white px-4 py-2 rounded">
                                    Generar
                                </button>
                            </div>

                            <label className="block font-medium">Descripción:</label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Ingrese descripción..."
                                className="border p-2 rounded w-full mb-4"
                            />

                            <label className="block font-medium">Requiere BOM:</label>
                            <input
                                type="checkbox"
                                checked={requiereBOM}
                                onChange={(e) => setRequiereBOM(e.target.checked)}
                                className="mb-4"
                            />

                            <label className="block font-medium">Tipo de Producto:</label>
                            <select
                                multiple
                                value={tipoSeleccionado}
                                onChange={(e) =>
                                    setTipoSeleccionado(Array.from(e.target.selectedOptions, (option) => option.value))
                                }
                                className="border p-2 rounded w-full mb-4"
                            >
                                {tiposProducto.map((tipo) => (
                                    <option key={tipo} value={tipo}>
                                        {tipo}
                                    </option>
                                ))}
                            </select>

                            <label className="block font-medium">Estado:</label>
                            <select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                className="border p-2 rounded w-full mb-4"
                            >
                                {estados.map((estado) => (
                                    <option key={estado} value={estado}>
                                        {estado}
                                    </option>
                                ))}
                            </select>

                            <label className="block font-medium">Aprobado:</label>
                            <input type="checkbox" checked={aprobado} onChange={toggleAprobado} className="mb-4" />

                            <div className="flex justify-end space-x-2">
                                <Button onClick={cerrarModal} variant="cancel" label="Cancelar" />
                                <Button onClick={handleSave} variant="create" label={loading ? "Guardando..." : "Guardar"} disabled={loading} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpenFases && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full text-black"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                        >
                            <div className="flex justify-end space-x-2">
                                <Button onClick={cerrarModalFases} variant="cancel" label="Cancelar" />
                                <Button onClick={handleSave} variant="create" label={loading ? "Guardando..." : "Guardar"} disabled={loading} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NewMaestra;
