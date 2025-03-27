import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "../buttons/buttons";
import Text from "../text/Text";
import { useAuth } from "../../hooks/useAuth";
import { getUserByEmail } from "../../services/userDash/authservices";
import nookies from "nookies";
import {
    getArticleByCode,
    newArticle,
    getArticlesId,
    deleteArticle,
    updateArticle,
    getBoms
} from "@/app/services/dom/articleServices";
import { getClients, getClientsId } from "@/app/services/userDash/clientServices";
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
import Table from "../table/Table";
import { Client, Article, Ingredient, Bom, BomView } from "@/app/interfaces/BOM";

function BOMManager() {
    // Estados
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBomId, setCurrentBomId] = useState<number | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [baseQuantity, setBaseQuantity] = useState(0);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [bomStatus, setBomStatus] = useState(false); // false = inactivo, true = activo
    const [isSaving, setIsSaving] = useState(false);
    const [allArticles, setAllArticles] = useState<Article[]>([]);


    const { isAuthenticated } = useAuth();
    const [userName, setUserName] = useState("");

    // Cargar usuario
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

    // Cargar clientes
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const clientsData = await getClients();
                setClients(clientsData);
            } catch (error) {
                showError("Error al cargar los clientes.");
                console.error(error);
            }
        };
        fetchClients();
    }, []);

    // Cargar BOMs
    const [boms, setBoms] = useState<Bom[]>([]);
    // Cargar BOMs y reemplazar client_id por el nombre del cliente
    const fetchBOMs = async () => {
        try {
            const data = await getBoms();
            const bomsData: Bom[] = data.boms;
            const bomsWithExtra: BomView[] = await Promise.all(
                bomsData.map(async (bom) => {
                    // Obtenemos el nombre del cliente
                    const clientData = await getClientsId(bom.client_id);
                    // Variables por defecto en caso de que details esté vacío o mal formado
                    let article_codart = "";
                    let article_desart = "";
                    if (bom.details) {
                        try {
                            const detailsObj = JSON.parse(bom.details);
                            if (detailsObj.article) {
                                article_codart = detailsObj.article.codart || "";
                                article_desart = detailsObj.article.desart || "";
                            }
                        } catch (error) {
                            console.error("Error parseando details:", error);
                        }
                    }
                    return {
                        ...bom,
                        client_name: clientData.name,
                        article_codart,
                        article_desart,
                    };
                })
            );
            setBoms(bomsWithExtra);
        } catch (error) {
            showError("Error al cargar los BOMs.");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBOMs();
    }, []);

    // Cargar datos para edición
    useEffect(() => {
        if (currentBomId && isModalOpen) {
            (async () => {
                try {
                    const data = await getArticlesId(currentBomId);
                    const bom = data.bom;
                    const clientData = await getClientsId(bom.client_id);
                    setSelectedClient(clientData.id.toString());
                    setBaseQuantity(Number(bom.base_quantity));
                    setBomStatus(bom.status);

                    // Se asume que en details se guardó el artículo seleccionado
                    const articleData = bom.details && bom.details !== "undefined" && bom.details !== null
                        ? JSON.parse(bom.details).article
                        : null;
                    setSelectedArticle(articleData);

                    // Cargar ingredientes desde el campo ingredients
                    const ingr = bom.ingredients && bom.ingredients !== "undefined" && bom.ingredients !== null
                        ? JSON.parse(bom.ingredients)
                        : [];
                    setIngredients(ingr);
                } catch (error) {
                    showError("Error al cargar el BOM para edición.");
                    console.error("Error en getArticlesId:", error);
                }
            })();
        }
    }, [currentBomId, isModalOpen]);

    // Cargar artículos según cliente
    useEffect(() => {
        if (!selectedClient) return;
        const client = clients.find(c => c.id.toString() === selectedClient);
        if (!client) return;

        const loadData = async () => {
            setLoadingArticles(true);
            try {
                const articlesData = await getArticleByCode(client.code);
                let fetchedArticles: Article[] = articlesData?.data || [];
                // Guardamos todos los artículos para usarlos en los ingredientes
                setAllArticles(fetchedArticles);
                // Para la selección principal filtramos el artículo seleccionado, si hay
                if (selectedArticle) {
                    fetchedArticles = fetchedArticles.filter(a => a.codart !== selectedArticle.codart);
                }
                setArticles(fetchedArticles);
            } catch (error) {
                showError("Error al cargar artículos.");
                console.error(error);
            } finally {
                setLoadingArticles(false);
            }
        };

        loadData();
    }, [selectedClient, clients, selectedArticle]);


    // Reiniciar selección al cambiar cliente (modo creación)
    useEffect(() => {
        if (!currentBomId) {
            setSelectedArticle(null);
            setIngredients([]);
            setBomStatus(false);
        }
    }, [selectedClient, currentBomId]);

    // Handler para seleccionar un artículo (sólo uno, sin acumular)
    const handleSelectArticle = (article: Article) => {
        if (selectedArticle) {
            showError("Ya has seleccionado un artículo. Elimina el actual para seleccionar otro.");
            return;
        }
        setSelectedArticle(article);
        setArticles(prev => prev.filter(a => a.codart !== article.codart));
    };

    // Deseleccionar el artículo
    const handleDeselectArticle = () => {
        if (selectedArticle) {
            setArticles(prev => [...prev, selectedArticle]);
            setSelectedArticle(null);
        }
    };

    // Handlers para ingredientes
    const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    const addIngredientRow = () => {
        setIngredients(prev => [
            ...prev,
            { codart: "", desart: "", quantity: "", merma: "" }
        ]);
    };

    const removeIngredientRow = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    // Guardar/Actualizar BOM
    const handleSaveBOM = async () => {
        if (!selectedClient || !selectedArticle) {
            showError("Debes seleccionar un cliente y un artículo.");
            return;
        }

        setIsSaving(true);
        try {
            // Creamos el objeto de código para el artículo principal (code_details)
            const code_details = JSON.stringify({
                codart: selectedArticle.codart,
            });

            // Para los ingredientes, extraemos codart y desart en un arreglo (code_ingredients)
            const code_ingredients = JSON.stringify(
                ingredients.map((ing) => ({
                    codart: ing.codart,
                }))
            );

            // Armamos el payload a enviar (haciendo conversiones si es necesario)
            const bomData = {
                client_id: Number(selectedClient),
                base_quantity: baseQuantity.toString(),
                details: JSON.stringify({ article: selectedArticle }),
                code_details,
                ingredients: JSON.stringify(ingredients),
                code_ingredients,
                status: bomStatus,
            };

            if (currentBomId) {
                await updateArticle(currentBomId, bomData);
                showSuccess("BOM actualizado con éxito");
            } else {
                await newArticle(bomData);
                showSuccess("BOM creado con éxito");
            }

            resetForm();
            fetchBOMs();
        } catch (error) {
            showError("Error al guardar el BOM.");
            console.error("Error en handleSaveBOM:", error);
        } finally {
            setIsSaving(false);
            setIsModalOpen(false);
        }
    };

    const resetForm = () => {
        setSelectedClient("");
        setSelectedArticle(null);
        setIngredients([]);
        setBaseQuantity(0);
        setBomStatus(false);
        setCurrentBomId(null);
    };

    // Handlers de edición/eliminación
    const handleEdit = async (id: number) => {
        try {
            const data = await getArticlesId(id);
            const bom = data.bom;
            const clientData = await getClientsId(bom.client_id);

            setSelectedClient(clientData.id.toString());
            setCurrentBomId(bom.id);
            setBaseQuantity(Number(bom.base_quantity));
            setBomStatus(bom.status);

            const articleData = bom.details && bom.details !== "undefined" && bom.details !== null
                ? JSON.parse(bom.details).article
                : null;
            setSelectedArticle(articleData);

            const ingr = bom.ingredients && bom.ingredients !== "undefined" && bom.ingredients !== null
                ? JSON.parse(bom.ingredients)
                : [];
            setIngredients(ingr);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la BOM:", error);
            showError("Error obteniendo datos de la BOM");
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm("¿Estás seguro de eliminar este BOM?", async () => {
            try {
                await deleteArticle(id);
                showSuccess("BOM eliminado exitosamente");
                fetchBOMs();
            } catch (error) {
                console.error("Error al eliminar BOM:", error);
                showError("Error al eliminar BOM");
            }
        });
    };

    const handleIngredientSelect = (index: number, selectedCodart: string) => {
        const selectedArticleForIngredient = allArticles.find(article => article.codart === selectedCodart);
        if (selectedArticleForIngredient) {
            const newIngredients = [...ingredients];
            newIngredients[index] = {
                ...newIngredients[index],
                codart: selectedArticleForIngredient.codart,
                desart: selectedArticleForIngredient.desart,
            };
            setIngredients(newIngredients);
        }
    };


    return (
        <div>
            <div className="flex justify-center space-x-2 mb-2">
                <Button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    variant="create"
                    label="Crear BOM"
                />
            </div>

            {isModalOpen && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] max-h-[90vh] overflow-y-auto z-50"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                    >
                        <Text type="title">
                            {currentBomId ? "Editar BOM" : "Crear BOM"}
                        </Text>

                        <div className="mb-4">
                            <Text type="subtitle">Selecciona un Cliente:</Text>
                            <select
                                className="w-full border p-2 rounded text-black text-center"
                                value={selectedClient}
                                onChange={e => setSelectedClient(e.target.value)}
                            >
                                <option value="">Seleccione...</option>
                                {clients.map(client => (
                                    <option key={client.code} value={client.id.toString()}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(selectedClient || currentBomId) && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <Text type="subtitle">Artículos Disponibles:</Text>
                                    {loadingArticles ? (
                                        <p className="text-blue-500">Cargando artículos...</p>
                                    ) : articles.length > 0 ? (
                                        <ul className="border p-2 rounded bg-gray-100 h-40 overflow-y-auto">
                                            {articles.map(article => (
                                                <li
                                                    key={article.codart}
                                                    className="border-b py-1 px-2 text-black cursor-pointer hover:bg-blue-100"
                                                    onClick={() => handleSelectArticle(article)}
                                                >
                                                    {article.desart} ({article.codart})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <Text type="error">No hay artículos disponibles.</Text>
                                    )}
                                </div>

                                <div>
                                    <Text type="subtitle">Artículo Seleccionado:</Text>
                                    {selectedArticle ? (
                                        <div className="border p-2 rounded bg-gray-100 flex justify-between items-center">
                                            <span className="text-black">
                                                {selectedArticle.desart} ({selectedArticle.codart})
                                            </span>
                                            <button
                                                onClick={handleDeselectArticle}
                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ) : (
                                        <Text type="alert">No se ha seleccionado ningún artículo.</Text>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-center space-x-2">
                            <div className="mt-4">
                                <Text type="subtitle">Cantidad Base:</Text>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border p-2 rounded text-black text-center"
                                    value={baseQuantity}
                                    onChange={e => setBaseQuantity(Number(e.target.value))}
                                />
                            </div>

                            <div className="mt-4">
                                <Text type="subtitle">Estado:</Text>
                                <select
                                    className="w-full border p-2 rounded text-black text-center"
                                    value={bomStatus ? "activo" : "inactivo"}
                                    onChange={e => setBomStatus(e.target.value === "activo")}
                                >
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        {selectedArticle && (
                            <div className="mt-4">
                                <Text type="subtitle">Ingredientes:</Text>
                                <div className="border p-4 rounded bg-gray-50 space-y-4">
                                    {ingredients.length > 0 ? (
                                        ingredients.map((ing, index) => (
                                            <div key={index} className="flex flex-col space-y-2 border p-2 rounded bg-white">
                                                <div className="flex justify-center space-x-2">
                                                    <select
                                                        className="border p-1 rounded text-black"
                                                        value={ing.codart} // Mostramos el codart seleccionado
                                                        onChange={e =>
                                                            handleIngredientSelect(index, e.target.value)
                                                        }
                                                    >
                                                        <option value="">Seleccione un artículo</option>
                                                        {allArticles.map(article => (
                                                            <option key={article.codart} value={article.codart}>
                                                                {article.desart} ({article.codart})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        className="border p-1 rounded w-20 text-black"
                                                        placeholder="Cantidad"
                                                        value={ing.quantity}
                                                        onChange={e =>
                                                            handleIngredientChange(index, "quantity", e.target.value)
                                                        }
                                                    />
                                                    <input
                                                        type="number"
                                                        className="border p-1 rounded w-20 text-black"
                                                        placeholder="% Merma"
                                                        value={ing.merma}
                                                        onChange={e =>
                                                            handleIngredientChange(index, "merma", e.target.value)
                                                        }
                                                    />
                                                    <button
                                                        onClick={() => removeIngredientRow(index)}
                                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <Text type="alert">No hay ingredientes agregados.</Text>
                                    )}

                                    <Button
                                        onClick={addIngredientRow}
                                        variant="create"
                                        label="Agregar Ingrediente"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 mt-4">
                            <Button onClick={() => setIsModalOpen(false)} variant="cancel" label="Cancelar" />
                            <Button
                                onClick={handleSaveBOM}
                                variant="create"
                                label={currentBomId ? "Actualizar BOM" : "Guardar BOM"}
                                disabled={loadingArticles || isSaving}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <Table
                columns={["client_name", "article_codart", "article_desart", "status"]}
                rows={boms}
                columnLabels={{
                    client_name: "Cliente",
                    article_codart: "Código Artículo",
                    article_desart: "Descripción Artículo",
                    status: "Estado",
                }}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

        </div>
    );
}

export default BOMManager;
