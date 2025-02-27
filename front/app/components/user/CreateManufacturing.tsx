"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    createManu,
    getManu,
    getManuId,
    updateManu,
    deleteManu
} from "../../services/userDash/manufacturingServices";
import { getProduct, getProductName } from "../../services/userDash/productServices";
import Table from "../table/Table";
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
import Button from "../buttons/buttons"

interface Manu {
    id?: number;
    name: string;
    line_types: string[];
}

function CreateManufacturing() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Manu>({ name: "", line_types: [] });
    const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
    const [manu, setManu] = useState<Manu[]>([]);
    const columnLabels = { name: "Nombre" };
    const columns = ["name"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsResponse, manuResponse] = await Promise.all([
                    getProduct(),
                    getManu()
                ]);
                setProducts(productsResponse);
                setManu(manuResponse);
            } catch (error) {
                console.error("Error al obtener datos:", error);
                showError("No se pudieron cargar los datos");
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string) => {
        setFormData(prev => ({
            ...prev,
            line_types: prev.line_types.includes(name)
                ? prev.line_types.filter(item => item !== name)
                : [...prev.line_types, name]
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            formData.id ? await updateManu(formData.id, formData) : await createManu(formData);
            showSuccess(`Manufactura ${formData.id ? "actualizada" : "creada"} correctamente`);
            closeModal();
        } catch (error) {
            console.error("Error al guardar manufactura", error);
            showError("No se pudo guardar la manufactura");
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm("¿Estás seguro de eliminar esta manufactura?", async () => {
            try {
                await deleteManu(id);
                setManu(prev => prev.filter(m => m.id !== id));
                showSuccess("Manufactura eliminada correctamente");
            } catch (error) {
                console.error("Error al eliminar manufactura", error);
                showError("No se pudo eliminar la manufactura");
            }
        });
    };

    const openModal = () => {
        setIsModalOpen(true);
        setFormData({ name: "", line_types: [] });
    };

    const openEditModal = async (id: number) => {
        try {
            const data = await getManuId(id);
            if (!data) return showError("No se encontraron datos para esta manufactura.");
            setFormData({ ...data, line_types: Array.isArray(data.line_types) ? data.line_types : JSON.parse(data.line_types) });
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error al obtener los datos de la manufactura:", error);
            showError("No se pudieron cargar los datos de la manufactura.");
        }
    };

    const closeModal = () => setIsModalOpen(false);

    return (
        <div>
            <div className="flex justify-center mb-2">
                <Button onClick={openModal} variant="create" label="Crear Linea" />
            </div>
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="bg-white p-8 rounded shadow-md w-4/5 max-w-4xl z-50">
                            <h2 className="text-lg font-bold text-black mb-4 text-center">
                                {formData.id ? "Editar" : "Crear"} Manufactura
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nombre"
                                    className="w-full text-black border p-2 mb-3"
                                />

                                <div className="flex gap-4">
                                    <div className="w-1/2 border p-2 h-80 overflow-y-auto">
                                        <h3 className="font-bold text-black text-center">Productos Disponibles</h3>
                                        {products.map(product => (
                                            <div
                                                key={product.id}
                                                className="cursor-pointer text-black p-1 hover:bg-gray-200"
                                                onClick={() => handleSelectChange(product.name)}
                                            >
                                                {product.name}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-1/2 border p-2 h-80 overflow-y-auto">
                                        <h3 className="font-bold text-black text-center">Seleccionados</h3>
                                        {formData.line_types.map((item, index) => (
                                            <div
                                                key={index}
                                                className="cursor-pointer p-1 text-black bg-blue-200 hover:bg-red-200"
                                                onClick={() => handleSelectChange(item)}
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-center gap-2 mt-2">
                                    <Button onClick={closeModal} variant="cancel" />
                                    <Button type="submit" variant="save" />
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Table columns={columns} rows={manu} columnLabels={columnLabels} onDelete={handleDelete} onEdit={openEditModal} />
        </div>
    );
}

export default CreateManufacturing;
