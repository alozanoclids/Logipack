"use client"

// importaciones de react y framer motion
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// importaciones de componentes
import Table from "../../table/Table";
import Button from "../../buttons/buttons";
import Text from "../../text/Text";

// importaciones de interfaces
import { StageOrdenes, DataOrdenes, DataTipos } from "@/app/interfaces/NewTipoAcondicionamiento";
import { createStage, getStage, deleteStage, updateLineaTipoAcondicionamiento } from "@/app/services/maestras/LineaTipoAcondicionamientoService";
import { getStage as getFases } from "@/app/services/maestras/stageServices";

// importaciones de servicios
import { getStage as getTipos } from "@/app/services/maestras/TipoAcondicionamientoService";
import { Stage as StageFases } from "@/app/interfaces/NewStage";

// función principal del componente
export default function NewTipoOrdenAcondicionamiento() {

    // variables de estado
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const [object, setObject] = useState<StageOrdenes>({
        id: 0,
        orden: 0,
        descripcion: "",
        tipo: "",
        fase: "",
        es_editable: false,
        control: false,
        fase_control: ""
    });
    const [list, setList] = useState<DataOrdenes[]>([]);
    const [listTipos, setListTipos] = useState<DataTipos[]>([]);
    const [listFases, setListFases] = useState<StageFases[]>([]);

    // Función para cambiar el estado de un input
    const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setObject({
            ...object,
            [e.target.name]: e.target.value
        });
    }

    // Función para cambiar el estado de un checkbox
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setObject((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    // Función para eliminar un tipo de acondicionamiento
    const handleDelete = async (id: number) => {
        console.log(id);
        await deleteStage(id);
        await fetchData();
    }

    // Función para abrir el modal de edición
    const handleOpenEdit = (id: number) => {
        const data = list.find(item => item.id === id);
        setObject({
            ...object,
            id: data?.id || 0,
            orden: data?.orden || 0,
            descripcion: data?.descripcion || "",
            tipo: data?.tipo || "",
            fase: data?.fase || "",
            es_editable: data?.es_editable || false,
            control: data?.control || false,
            fase_control: data?.fase_control || ""
        });
        setIsOpenEdit(true);
    }

    // Función para actualizar un tipo de acondicionamiento
    const handleEdit = async () => {
        await updateTipoOrdenAcondicionamiento(object.id, object);
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
            orden: 0,
            descripcion: "",
            tipo: "",
            fase: "",
            es_editable: false,
            control: false,
            fase_control: ""
        });
    }

    // Función para obtener los datos de los tipos de acondicionamiento
    const fetchData = async () => {
        const data = await getStage();
        setList(data);
    };

    // funcion para obtener lista de fases
    const fetchTipos = async () => {
        const data = await getTipos();
        setListTipos(data);
    };

    // funcion para obtener lista de fases
    const fetchFases = async () => {
        const data = await getFases();
        setListFases(data);
    };

    // Instancia del componente
    useEffect(() => {
        fetchData();
        fetchTipos();
        fetchFases();
    }, []);

    // Renderización del componente
    return (
        <>
            {/* Bloque del componente 1 */}
            <div>
                {/* Botón abrir modal de creación */}
                <Button onClick={() => setIsOpen(true)} variant="create" label="Crear" />

                {/* Tabla de tipos de acondicionamiento */}
                <Table columns={["id", "orden", "descripcion", "descripcion_tipo", 
                    "descripcion_fase", "es_editable", "control", "fase_control"]} rows={list}
                    columnLabels={{
                        id: "ID",
                        orden: "Orden",
                        descripcion: "Descripción",
                        descripcion_tipo: "Tipo",
                        descripcion_fase: "Fase",
                        es_editable: "Editable",
                        control: "Control",
                        fase_control: "Fase de Control",
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

                                {/* inpput Orden */}
                                <div>
                                    <Text type="subtitle">Orden</Text>
                                    <input
                                        type="number"
                                        value={object.orden === 0 ? "" : object.orden}
                                        onChange={(e) => inputChange(e)}
                                        name="orden"
                                        className="mt-1 w-full text-center p-2 border border-gray-300 
                                        rounded-lg focus:outline-none focus:ring-2 
                                        focus:ring-blue-400 text-black" />
                                </div>

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

                                {/* inpput Tipo de Acondicionamiento */}
                                <div className="mt-4 flex justify-center gap-4">
                                    <div className="flex items-center gap-3"
                                        style={{ marginRight: "50%" }}>
                                        <Text type="subtitle"> Seleccione Tipo</Text>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Text type="subtitle">Seleccione Fase</Text>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-center gap-4">

                                    {/* inpput Tipo de Acondicionamiento */}
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={object.tipo}
                                            onChange={(e) => {
                                                setObject({
                                                    ...object,
                                                    tipo: e.target.value
                                                });
                                            }}
                                            name="tipo"
                                            className="mt-1 w-full text-center p-2 border border-gray-300 
                                            rounded-lg focus:outline-none focus:ring-2 
                                            focus:ring-blue-400 text-black">
                                            <option value="">Seleccione un tipo de acondicionamiento</option>
                                            {listTipos.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.descripcion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* inpput Fase de con */}
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={object.fase}
                                            onChange={(e) => {
                                                setObject({
                                                    ...object,
                                                    fase: e.target.value
                                                });
                                                console.log(e.target.value); // Esto sí es el nuevo valor
                                            }}
                                            name="fase"
                                            className="mt-1 w-full text-center p-2 border border-gray-300 
                                            rounded-lg focus:outline-none focus:ring-2 
                                            focus:ring-blue-400 text-black" >
                                            <option value="">Seleccione un tipo de acondicionamiento</option>
                                            {listFases.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* inpput Es editable y Control */}
                                <div className="mt-4 flex justify-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <Text type="subtitle">Es editable</Text>
                                        <input
                                            type="checkbox"
                                            checked={object.es_editable}
                                            name="es_editable"
                                            onChange={(e) => handleCheckboxChange(e)}
                                            className="h-5 w-5 text-blue-600"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Text type="subtitle">Control</Text>
                                        <input
                                            type="checkbox"
                                            checked={object.control}
                                            name="control"
                                            onChange={(e) => handleCheckboxChange(e)}
                                            className="h-5 w-5 text-blue-600"
                                        />
                                    </div>
                                </div>

                                {/* inpput Fase de Control */}
                                {object.control && (
                                    < div >
                                        <Text type="subtitle">Fase de Control</Text>
                                        <select
                                            value={object.fase_control}
                                            onChange={(e) => {
                                                setObject({
                                                    ...object,
                                                    fase_control: e.target.value
                                                });
                                                console.log(e.target.value); // Esto sí es el nuevo valor
                                            }}
                                            name="fase_control"
                                            className="mt-1 w-full text-center p-2 border border-gray-300 
                                            rounded-lg focus:outline-none focus:ring-2 
                                            focus:ring-blue-400 text-black" >
                                            <option value="">Seleccione un tipo de acondicionamiento</option>
                                            {listFases.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
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
