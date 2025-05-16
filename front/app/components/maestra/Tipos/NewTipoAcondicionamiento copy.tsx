"use client"

// importaciones de react y framer motion
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// importaciones de componentes
import Table from "../../table/Table";
import Button from "../../buttons/buttons";
import Text from "../../text/Text";

// importaciones de interfaces
import { StageTipos, DataTipos } from "@/app/interfaces/NewTipoAcondicionamiento";
import { createStage, getStage, deleteStage, updateTipoAcondicionamiento } from "@/app/services/maestras/TipoAcondicionamientoService";

// función principal del componente
export default function NewTipoAcondicionamiento() {

    // variables de estado
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [object, setObject] = useState<StageTipos>({
        id: 0,
        descripcion: "",
        status: false
    });
    const [list, setList] = useState<DataTipos[]>([]);


    // Función para cambiar el estado de un input
    const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setObject({
            ...object,
            status: true,
            [e.target.name]: e.target.value
        });
    }

    // Función para eliminar un tipo de acondicionamiento
    const handleDelete = async (id: number) => {
        await deleteStage(id);
        await fetchData();
    }

    // Función para abrir el modal de edición
    const handleOpenEdit = (id: number) => {
        const data = list.find(item => item.id === id);
        setObject({
            ...object,
            id: data?.id || 0,
            descripcion: data?.descripcion || "",
            status: data?.status || false
        });
        setIsOpenEdit(true);
    }

    // Función para actualizar un tipo de acondicionamiento
    const handleEdit = async () => {
        await updateTipoAcondicionamiento(object.id, object);
        await fetchData();
        setIsOpenEdit(false);
        handleReset();
    }

    // Función para crear un tipo de acondicionamiento
    const handleSave = async () => {
        await createStage(object); // esperar que termine la creación
        await fetchData();         // actualizar la lista
        setIsOpen(false);          // cerrar modal/formulario
        handleReset();
    };

    // Función para limpiar el formulario
    const handleReset = () => {
        setObject({
            id: 0,
            descripcion: "",
            status: false
        });
    }

    // Función para obtener los datos de los tipos de acondicionamiento
    const fetchData = async () => {
        const data = await getStage();
        setList(data);
    };

    // Instancia del componente
    useEffect(() => {
        fetchData();
    }, []);

    // Renderización del componente
    return (
        <>
            {/* Bloque del componente 1 */}
            <div>
                {/* Botón abrir modal de creación */}
                <Button onClick={() => setIsOpen(true)} variant="create" label="Crear" />

                {/* Tabla de tipos de acondicionamiento */}
                <Table columns={["id", "descripcion", "status"]} rows={list}
                    columnLabels={{
                        id: "ID",
                        descripcion: "Descripción",
                        status: "Estado",
                    }} onDelete={handleDelete} onEdit={handleOpenEdit} />
            </div>

            {/* Bloque del componente 2 */}
            <div>
                {/* Modal de creación y edición */}
                {(isOpen || isOpenEdit) && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}>
                        <motion.div
                            className="bg-white rounded-lg shadow-xl w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-[900px] max-h-[90vh] overflow-y-auto p-4 sm:p-6"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{ duration: 0.3 }}>
                            {/* Botón de cierre */}
                            <button
                                onClick={() => {
                                    setIsOpen(false); setIsOpenEdit(false);
                                }}
                                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Titulo */}
                            <Text type="title">{isOpenEdit ? "Editar Tipo de Ordenes de Acondicionamiento" : "Crear Tipo de Ordenes de Acondicionamiento"}</Text>

                            {/* Descripción */}
                            <div className="space-y-4">

                                {/* inpput Descripción */}
                                <div>
                                    <Text type="subtitle">Descripción</Text>
                                    <input
                                        type="text"
                                        value={object.descripcion}
                                        onChange={(e) => inputChange(e)}
                                        name="descripcion"
                                        className="mt-1 w-full text-center p-2 border border-gray-300 
                                        rounded-lg focus:outline-none focus:ring-2 
                                        focus:ring-blue-400 text-black" />
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="mt-4 flex justify-center gap-4">
                                {/* Botón de acción para cancelar proceso */}
                                <Button
                                    onClick={() => {
                                        setIsOpen(false); setIsOpenEdit(false);
                                        handleReset();
                                    }}
                                    variant="cancel"
                                    label="Cancelar"
                                />
                                {/* Botón de acción para crear o editar */}
                                <Button
                                    onClick={() => (isOpenEdit ? handleEdit() : handleSave())}
                                    variant="create"
                                    disabled={!object.descripcion.trim()}
                                    label={isOpenEdit ? "Editar" : "Crear"}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </>
    )
}
