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

// Tipos
interface Client {
    id: string;
    code: string;
    name: string;
}

interface Article {
    codart: string;
    desart: string;
    coddiv: string;
}

interface BomDetail {
    article_code: string;
    quantity: string;
    merma: string;
}

interface Bom {
    id: number;
    client_id: string;
    base_quantity: string;
    details: string;
}

function BOMManager() {
    // Estados
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBomId, setCurrentBomId] = useState<number | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [selectedArticleDetails, setSelectedArticleDetails] = useState<{ [key: string]: { quantity: string; merma: string } }>({});
    const [baseQuantity, setBaseQuantity] = useState(0);
    const [editingDetails, setEditingDetails] = useState<BomDetail[] | null>(null);
    const [boms, setBoms] = useState<Bom[]>([]);
    const [isSaving, setIsSaving] = useState(false); // Nuevo estado

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
    const fetchBOMs = async () => {
        try {
            const data = await getBoms();
            setBoms(data.boms);
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
                    setBaseQuantity(bom.base_quantity);
                    const details = bom.details && bom.details !== "undefined" && bom.details !== null
                        ? JSON.parse(bom.details)
                        : [];
                    setEditingDetails(details);
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
                let allArticles: Article[] = articlesData?.data || [];

                if (currentBomId && editingDetails) {
                    const selected = allArticles.filter(article =>
                        editingDetails.some(detail => detail.article_code === article.codart)
                    );
                    const available = allArticles.filter(article =>
                        !editingDetails.some(detail => detail.article_code === article.codart)
                    );

                    setArticles(available);
                    setSelectedArticles(selected);

                    const detailsMap = selected.reduce((acc, art) => {
                        const found = editingDetails.find(d => d.article_code === art.codart);
                        acc[art.codart] = {
                            quantity: found?.quantity || "",
                            merma: found?.merma || ""
                        };
                        return acc;
                    }, {} as { [key: string]: { quantity: string, merma: string } });

                    setSelectedArticleDetails(detailsMap);
                } else {
                    setArticles(allArticles);
                }
            } catch (error) {
                showError("Error al cargar artículos.");
                console.error(error);
            } finally {
                setLoadingArticles(false);
            }
        };

        loadData();
    }, [selectedClient, editingDetails, clients, currentBomId]);

    // Reiniciar selección al cambiar cliente (modo creación)
    useEffect(() => {
        if (!currentBomId) {
            setSelectedArticles([]);
            setSelectedArticleDetails({});
        }
    }, [selectedClient, currentBomId]);

    // Handlers para selección/deselección
    const handleSelectArticle = (article: Article) => {
        setSelectedArticles(prev => [...prev, article]);
        setSelectedArticleDetails(prev => ({
            ...prev,
            [article.codart]: { quantity: "", merma: "" },
        }));
        setArticles(prev => prev.filter(a => a.codart !== article.codart));
    };

    const handleDeselectArticle = (article: Article) => {
        setArticles(prev => [...prev, article]);
        setSelectedArticles(prev => prev.filter(a => a.codart !== article.codart));
        setSelectedArticleDetails(prev => {
            const newDetails = { ...prev };
            delete newDetails[article.codart];
            return newDetails;
        });
    };

    const handleDetailChange = (codart: string, field: "quantity" | "merma", value: string) => {
        setSelectedArticleDetails(prev => ({
            ...prev,
            [codart]: {
                ...prev[codart],
                [field]: value,
            },
        }));
    };

    // Guardar/Actualizar BOM
    const handleSaveBOM = async () => {
        if (!selectedClient || selectedArticles.length === 0) {
            showError("Debes seleccionar un cliente y al menos un artículo.");
            return;
        }

        setIsSaving(true);
        try {
            const details = selectedArticles.map(article => ({
                article_code: article.codart,
                quantity: selectedArticleDetails[article.codart]?.quantity || "0",
                merma: selectedArticleDetails[article.codart]?.merma || "0",
            }));

            const bomData = {
                client_id: selectedClient,
                base_quantity: baseQuantity.toString(),
                details: JSON.stringify(details),
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
        setSelectedArticles([]);
        setSelectedArticleDetails({});
        setBaseQuantity(0);
        setEditingDetails(null);
    };

    // Handlers de edición/eliminación
    const handleEdit = async (id: number) => {
        try {
            const data = await getArticlesId(id);
            const bom = data.bom;
            const clientData = await getClientsId(bom.client_id);
            
            setSelectedClient(clientData.id.toString());
            setCurrentBomId(bom.id);
            setBaseQuantity(bom.base_quantity);
            
            const details = bom.details && bom.details !== "undefined" && bom.details !== null
                ? JSON.parse(bom.details)
                : [];
                
            setEditingDetails(details);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error obteniendo datos de la BOM:", error);
            showError("Error obteniendo datos de la BOM");
        }
    };

    const handleDelete = async (id: number) => {
        showConfirm("¿Estás seguro de eliminar este maestra?", async () => {
            try {
                await deleteArticle(id);
                showSuccess("BOM eliminado exitosamente");
                fetchBOMs();
            } catch (error) {
                console.error("Error al eliminar maestra:", error);
                showError("Error al eliminar maestra");
            }
        });
    };

    return (
        <div>
            <div className="flex justify-center space-x-2 mb-2">
                <Button
                    onClick={() => {
                        resetForm();
                        setCurrentBomId(null);
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
                                    <Text type="subtitle">Artículos Seleccionados:</Text>
                                    {selectedArticles.length > 0 ? (
                                        <ul className="border p-2 rounded bg-gray-100 h-40 overflow-y-auto">
                                            {selectedArticles.map(article => (
                                                <li
                                                    key={article.codart}
                                                    className="border-b py-1 px-2 text-black cursor-pointer hover:bg-red-100"
                                                    onClick={() => handleDeselectArticle(article)}
                                                >
                                                    {article.desart} ({article.codart})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <Text type="alert">No hay artículos seleccionados.</Text>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <Text type="subtitle">Cantidad Base:</Text>
                            <input
                                type="number"
                                className="w-full border p-2 rounded text-black"
                                value={baseQuantity}
                                onChange={e => setBaseQuantity(Number(e.target.value))}
                            />
                        </div>

                        {selectedArticles.length > 0 && (
                            <div className="mt-4">
                                <Text type="subtitle">
                                    Detalles de Artículos Seleccionados:
                                </Text>
                                <div className="border p-4 rounded bg-gray-50">
                                    {selectedArticles.map(article => (
                                        <div
                                            key={article.codart}
                                            className="flex items-center space-x-2 mb-2"
                                        >
                                            <span className="flex-1 text-black">
                                                {article.desart} ({article.codart})
                                            </span>
                                            <input
                                                type="number"
                                                className="border p-1 rounded w-20 text-black"
                                                placeholder="Cantidad"
                                                value={selectedArticleDetails[article.codart]?.quantity || ""}
                                                onChange={e =>
                                                    handleDetailChange(article.codart, "quantity", e.target.value)
                                                }
                                            />
                                            <input
                                                type="number"
                                                className="border p-1 rounded w-20 text-black"
                                                placeholder="% Merma"
                                                value={selectedArticleDetails[article.codart]?.merma || ""}
                                                onChange={e =>
                                                    handleDetailChange(article.codart, "merma", e.target.value)
                                                }
                                            />
                                            <button
                                                onClick={() => handleDeselectArticle(article)}
                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
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
                columns={["client_id"]}
                rows={boms}
                columnLabels={{
                    client_id: "Cliente",
                }}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
}

export default BOMManager;