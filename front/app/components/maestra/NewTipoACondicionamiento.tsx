"use client"

// impotar librerías
import React, { useState, useEffect } from "react";
import { StageTipos, StageOrdenes, StageFaseControl } from "@/app/interfaces/NewTipoAcondicionamiento";
import Table from "../table/Table";
import Button from "../buttons/buttons";
import { motion } from "framer-motion";
import Text from "../text/Text";
import { Search, Clock } from "lucide-react";

// lista de tipos de acondicionamiento
const lista_tipo_ordenes = [
  {
    id: 1,
    description: "Maestro de tipo acondicionamiento",
    status: true,
  },
];

// lista de ordenes de acondicionamiento
const lista_ordenes = [
  {
    id: 1,
    orden: 1,
    description: "Lista de fase",
    fase: "Lista de fase",
    es_editable: false,
    control: false,
    fase_control: "Lista de fase | solo control",
  }
];

const lista_fase_control = [
  {
    id: 1,
    description: "Lista de fase control 1",
    status: true,
  },
  {
    id: 2,
    description: "Lista de fase control 2",
    status: true,
  }
];

const NewTipoACondicionamiento = () => {
  // variables de estado
  const [listTipoOrdenes, setListTipoOrdenes] = useState<StageTipos[]>([]);
  const [listOrdenes, setListOrdenes] = useState<StageOrdenes[]>([]);
  const [listFaseControl, setListFaseControl] = useState<StageFaseControl[]>([]);
  const [isOpenTipo, setIsOpenTipo] = useState(false);
  const [isOpenOrden, setIsOpenOrden] = useState(false);
  const [descripcionFase, setDescripcionFase] = useState("");
  const [es_editable, setEsEditable] = useState(false);
  const [control, setControl] = useState(false);
  const [faseControl, setFaseControl] = useState("");

  // variables de estado para el formulario
  const [descriptionTipo, setDescriptionTipo] = useState("");

  // Instancia del componente
  useEffect(() => {
    setListTipoOrdenes(lista_tipo_ordenes);
    setListOrdenes(lista_ordenes);
    setListFaseControl(lista_fase_control);
  }, []);

  // Funciones de manejo
  const handleDelete = (id: number) => {
    alert(`Eliminar ${id}`);
  };

  const handleEdit = (id: number) => {
    alert(`Editar ${id}`);
  };

  const handleSave = () => {

    if (isOpenTipo) {
      listTipoOrdenes.push({
        id: listTipoOrdenes.length + 1,
        description: descriptionTipo,
        status: true,
      });
    }

    if (isOpenOrden) {
      listOrdenes.push({
        id: listOrdenes.length + 1,
        orden: listOrdenes.length + 1,
        description: descriptionTipo,
        fase: descripcionFase,
        es_editable: es_editable,
        control: control,
        fase_control: faseControl,
      });
    }

    // resetear el formulario
    resetForm();
  };

  const resetForm = () => {
    setDescriptionTipo("");
    setEsEditable(false);
    setIsOpenTipo(false);
    setIsOpenOrden(false);
    setDescripcionFase("");
    setControl(false);
    setFaseControl("");
    setListOrdenes(lista_ordenes);
    setListFaseControl(lista_fase_control);
  };

  return (
    <>
      <div>
        {/* Tabla de tipos de acondicionamiento */}
        <h1>Nuevo Tipo de Acondicionamiento</h1>
        {/* Botón de crear fase */}
        <div>
          <Button onClick={() => setIsOpenTipo(true)} variant="create" label="Crear" />
        </div>
        <Table columns={["description", "phase_type", "status"]} rows={listTipoOrdenes}
          columnLabels={{
            description: "Descripción",
            phase_type: "Tipo de Fase",
            status: "Estado",
          }} onDelete={handleDelete} onEdit={handleEdit} />


        {/* Tabla de ordenes */}
        <h1 style={{ marginTop: "20px" }}>Nuevo Tipo de Ordenes de Acondicionamiento</h1>
        {/* Botón de crear fase */}
        <div >
          <Button onClick={() => setIsOpenOrden(true)} variant="create" label="Crear" />
        </div>
        <Table columns={["description", "fase", "es_editable", "control", "fase_control"]} rows={listOrdenes}
          columnLabels={{
            description: "Descripción",
            fase: "Fase",
            es_editable: "Editable",
            control: "Control",
            fase_control: "Fase de control",
          }} onDelete={handleDelete} onEdit={handleEdit} />
      </div>

      {/* Modal de creación de tipo de acondicionamiento */}
      <div>
        {(isOpenTipo) && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-[900px] max-h-[90vh] overflow-y-auto p-4 sm:p-6"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Botón de cierre */}
              <button
                onClick={() => {
                  isOpenTipo ? setIsOpenTipo(false) : setIsOpenOrden(false);
                }}
                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <Text type="title">{"Crear Tipo de Acondicionamiento"}</Text>

              <div className="space-y-4">
                {/* Descripción */}
                <div>
                  <Text type="subtitle">Descripción</Text>
                  <input
                    type="text"
                    value={descriptionTipo}
                    onChange={(e) => setDescriptionTipo(e.target.value)}
                    className="mt-1 w-full text-center p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-4 flex justify-center gap-4">
                <Button
                  onClick={() => {
                    isOpenTipo ? setIsOpenTipo(false) : setIsOpenOrden(false);
                  }}
                  variant="cancel"
                  label="Cancelar"
                />
                <Button
                  onClick={() => (handleSave())}
                  variant="create"
                  disabled={!descriptionTipo.trim()}
                  label={"Crear"}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {(isOpenOrden) && (
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
                  isOpenOrden ? setIsOpenOrden(false) : setIsOpenTipo(false);
                }}
                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Titulo */}
              <Text type="title">{"Crear Tipo de Ordenes de Acondicionamiento"}</Text>

              {/* Descripción */}
              <div className="space-y-4">

                {/* inpput Descripción */}
                <div>
                  <Text type="subtitle">Descripción</Text>
                  <input
                    type="text"
                    value={descriptionTipo}
                    onChange={(e) => setDescriptionTipo(e.target.value)}
                    className="mt-1 w-full text-center p-2 border border-gray-300 
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" />
                </div>


                {/* Seleccionar fase */}
                <div>
                  <Text type="subtitle">Fase</Text>
                  <select
                    value={descripcionFase}
                    onChange={(e) => setDescripcionFase(e.target.value)}
                    className="mt-1 w-full text-center p-2 border border-gray-300 rounded-lg 
                      ocus:outline-none focus:ring-2 focus:ring-blue-400 text-black">
                    {/* Obtene la descripcion de la lista de tipo de acondicionamiento */}
                    <option value="">Seleccionar fase</option>
                    {listTipoOrdenes.map((tipo) => (
                      <option value={tipo.description}>{tipo.description}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className="mt-4 flex justify-center gap-4">

                {/* Editable */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={es_editable}
                    onChange={() => setEsEditable(!es_editable)}
                    className="mt-2 w-4 h-4"
                  />
                  <span className="text-sm text-black">Editable</span>
                </div>

                {/* Control */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={control}
                    onChange={() => setControl(!control)}
                    className="mt-2 w-4 h-4"
                  />
                  <span className="text-sm text-black">Control</span>
                </div>

                {/* Control */}
                <div className="flex items-center gap-3">
                  {control && (
                    // <Text type="subtitle">Fase</Text>
                    <select
                      value={faseControl}
                      onChange={(e) => setFaseControl(e.target.value)}
                      className="mt-1 w-full text-center p-2 border border-gray-300 rounded-lg 
                        ocus:outline-none focus:ring-2 focus:ring-blue-400 text-black">
                      {/* Obtene la descripcion de la lista de tipo de acondicionamiento */}
                      <option value="">Seleccionar fase</option>
                      {listFaseControl.map((fase) => (
                        <option value={fase.description}>{fase.description}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-4 flex justify-center gap-4">
                <Button
                  onClick={() => {
                    isOpenOrden ? setIsOpenOrden(false) : setIsOpenTipo(false);
                  }}
                  variant="cancel"
                  label="Cancelar"
                />
                <Button
                  onClick={() => (handleSave())}
                  variant="create"
                  disabled={!descriptionTipo.trim()}
                  label={"Crear"}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>
    </>
  );
};

export default NewTipoACondicionamiento;



