import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import { motion } from "framer-motion";
import nookies from "nookies";
// 🔹 Hooks
import { useAuth } from "../../hooks/useAuth";
// 🔹 Servicios
import { getClients, getClientsId } from "@/app/services/userDash/clientServices";
import { getArticleByCode, getArticleByClient } from "@/app/services/bom/articleServices";
import { newAdaptation, getAdaptations, deleteAdaptation, updateAdaptation, getAdaptationsId } from "@/app/services/adaptation/adaptationServices";
import { getUserByEmail } from "../../services/userDash/authservices";
import { getMaestra } from "../../services/maestras/maestraServices";
// 🔹 Componentes
import Button from "../buttons/buttons";
import File from "../buttons/FileButton";
import MultiSelect from "../dinamicSelect/MultiSelect";
import Table from "../table/Table";
import Text from "../text/Text";
// 🔹 Toastr
import { showSuccess, showError, showConfirm } from "../toastr/Toaster";
// 🔹 Interfaces
import { Client, Article, Ingredient } from "@/app/interfaces/BOM";
import { Data } from "@/app/interfaces/NewMaestra";
import { BOMResponse, BOM, Adaptation } from "@/app/interfaces/NewAdaptation";

function NewAdaptation() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [deliveryDate, setDeliveryDate] = useState<string>("");
    const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
    const [lot, setLot] = useState<string>("");
    const [healthRegistration, setHealthRegistration] = useState<string>("");
    const [quantityToProduce, setQuantityToProduce] = useState<number | "">("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [maestra, setMaestra] = useState<Data[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [bomData, setBomData] = useState<BOMResponse | null>(null);
    const [adaptation, setAdaptation] = useState<Adaptation[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editAdaptationId, setEditAdaptationId] = useState<number | null>(null);
    const { isAuthenticated } = useAuth();
    const [selectedMaestras, setSelectedMaestras] = useState<string[]>([]);
    const [boms, setBoms] = useState<BOM[]>([]);
    const [selectedBom, setSelectedBom] = useState<number | "">("");
    const [isLoading, setIsLoading] = useState(false);

    // UseEffect para actualización del token
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

    // Cargar clientes
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setIsLoading(true);
                const clientsData = await getClients();
                setClients(clientsData);
            } catch (error) {
                showError("Error al cargar los clientes.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClients();
    }, []);

    // Cargar Maestras
    useEffect(() => {
        const fetchMaestras = async () => {
            try {
                setIsLoading(true);
                const maestrasData = await getMaestra();
                setMaestra(maestrasData);
            } catch (error) {
                showError("Error al cargar las maestras.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaestras();
    }, []);

    // Cargar artículos disponibles basado en el cliente seleccionado
    useEffect(() => {
        if (!selectedClient) return;

        const fetchArticles = async () => {
            try {
                setIsLoading(true);
                // 1. Obtener cliente por ID
                const clientData = await getClientsId(Number(selectedClient));
                if (!clientData || !clientData.code) {
                    showError("Código de cliente no disponible.");
                    console.error("Error: clientData o clientData.code es inválido", clientData);
                    return;
                }
                // 2. Obtener artículos usando el código del cliente
                const articlesData = await getArticleByCode(clientData.code);
                setArticles(articlesData.data);
            } catch (error) {
                showError("Error al cargar los artículos.");
                console.error("Error en fetchArticles:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, [selectedClient]);

    // Nuevo useEffect para asignar los artículos seleccionados cuando `articles` esté listo
    useEffect(() => {
        if (articles.length > 0 && selectedArticles.length > 0) {
            const selectedArticlesFormatted = articles.filter(article =>
                selectedArticles.some(selected => selected.codart === article.codart)
            );
            setSelectedArticles(prev =>
                JSON.stringify(prev) !== JSON.stringify(selectedArticlesFormatted)
                    ? selectedArticlesFormatted
                    : prev
            );
        }
    }, [articles]); // 👈 Elimina `selectedArticles` de las dependencias

    //Cargar Bom
    useEffect(() => {
        if (!selectedClient || selectedMaestras.length === 0) return;

        const fetchBom = async () => {
            try {
                const clientData = await getClientsId(Number(selectedClient));
                const selectedMaestraObj = maestra.find(m => m.id.toString() === selectedMaestras[0]);

                if (selectedMaestraObj?.requiere_bom) {
                    const bomData = await getArticleByClient(clientData.id);

                    if (bomData?.boms?.length > 0) {
                        setBoms(bomData.boms);
                    }
                }
            } catch (error) {
                console.error("Error al obtener los BOMs", error);
            }
        };

        fetchBom();
    }, [selectedClient, selectedMaestras]);

    // Nuevo useEffect para actualizar los ingredientes cuando `boms` cambie
    useEffect(() => {
        if (boms.length > 0) {
            try {
                const firstBom = boms[0]; // Tomamos el primer BOM
                const parsedIngredients = JSON.parse(firstBom.ingredients || "[]");

                // Establecemos los ingredientes solo si los datos no están vacíos
                setIngredients(parsedIngredients.map((ing: any) => ({
                    codart: ing.codart || "",
                    desart: ing.desart || "",
                    quantity: ing.quantity || "",
                    merma: ing.merma || "",
                    teoria: ing.teoria || "",
                    validar: ing.validar || "",
                })));
            } catch (error) {
                console.error("Error al parsear los ingredientes del BOM", error);
            }
        }
    }, [boms]); // Solo se ejecuta cuando `boms` cambia


    // Función para cargar adaptaciones
    const fetchAdaptations = async () => {
        try {
            const { adaptations }: { adaptations: Adaptation[] } = await getAdaptations();
            const adapData: Adaptation[] = await Promise.all(
                adaptations.map(async (adaptation) => {
                    const clientData = await getClientsId(adaptation.client_id);
                    return {
                        ...adaptation,
                        client_name: clientData.name, // Se agrega el nombre del cliente
                    };
                })
            );
            setAdaptation(adapData);
        } catch (error) {
            showError("Error al cargar adaptaciones.");
            console.error(error);
        }
    };

    // Ejecutar al montar el componente
    useEffect(() => {
        fetchAdaptations();
    }, []);

    // Handler de envío
    const handleSubmit = async () => {
        if (!selectedClient) {
            showError("Por favor, selecciona un cliente.");
            return;
        }
        if (!orderNumber) {
            showError("Por favor, ingresa el número de orden.");
            return;
        }
        if (!deliveryDate) {
            showError("Por favor, ingresa la fecha de entrega.");
            return;
        }
        if (quantityToProduce === "") {
            showError("Por favor, ingresa la cantidad a producir.");
            return;
        }

        // Crear un FormData para enviar correctamente los datos y archivos
        const formData = new FormData();
        formData.append("client_id", selectedClient.toString());
        formData.append("order_number", orderNumber);
        formData.append("delivery_date", deliveryDate);
        formData.append("article_code", JSON.stringify(selectedArticles));
        formData.append("lot", lot);
        formData.append("health_registration", healthRegistration);
        formData.append("quantity_to_produce", quantityToProduce.toString());

        // Adjuntar el archivo solo si existe
        if (attachment) {
            formData.append("attachment", attachment);
        }

        formData.append("master", JSON.stringify(selectedMaestras));
        formData.append("bom", JSON.stringify(selectedBom) || "");

        // 📌 Guardar los ingredientes en el FormData
        formData.append("ingredients", JSON.stringify(ingredients));

        try {
            setIsLoading(true);
            if (isEditMode) {
                await updateAdaptation(editAdaptationId!, formData);
                showSuccess("Acondicionamiento actualizado.");
            } else {
                await newAdaptation(formData);
                showSuccess("Acondicionamiento creado.");
            }
            resetForm();
            setIsOpen(false);
            const { adaptations } = await getAdaptations();
            setAdaptation(adaptations);
            fetchAdaptations();
        } catch (error) {
            showError("Error al guardar.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler de edicion
    const handleEdit = async (id: number) => {
        try {
            const response = await getAdaptationsId(id);
            const adaptation = response.adaptation;
            if (!adaptation) {
                showError("La adaptación no existe");
                return;
            }

            setSelectedClient(adaptation.client_id.toString());
            setOrderNumber(adaptation.order_number);
            setDeliveryDate(adaptation.delivery_date);
            setLot(adaptation.lot);
            setHealthRegistration(adaptation.health_registration);
            setQuantityToProduce(adaptation.quantity_to_produce);
            setSelectedMaestras(JSON.parse(adaptation.master));
            setSelectedBom(JSON.parse(adaptation.bom));
            setSelectedArticles(JSON.parse(adaptation.article_code));

            if (adaptation.ingredients) {
                try {
                    const parsedIngredients = JSON.parse(adaptation.ingredients).map((ing: any) => ({
                        ...ing,
                        teorica: ing.teorica ?? (parseFloat(ing.quantity || "0") * (1 + parseFloat(ing.merma || "0"))).toFixed(2),
                        validar: ing.validar ?? "" // Asegurar que siempre tenga un valor
                    }));
                    setIngredients(parsedIngredients);
                } catch (error) {
                    console.error("Error al parsear los ingredientes", error);
                    setIngredients([]);
                }
            } else {
                setIngredients([]);
            }

            if (adaptation.attachment) {
                setAttachmentUrl(`/storage/${adaptation.attachment}`);
            } else {
                setAttachmentUrl(null);
            }

            setIsEditMode(true);
            setEditAdaptationId(id);
            setIsOpen(true);
            fetchAdaptations();
        } catch (error) {
            showError("Error al cargar los datos");
            console.error(error);
        }
    };

    //Handle de eliminacion
    const handleDelete = async (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta adaptación?")) {
            try {
                await deleteAdaptation(id);
                showSuccess("Adaptación eliminada exitosamente.");
                setAdaptation(prev => prev.filter(adap => adap.id !== id));
            } catch (error) {
                showError("Error al eliminar la adaptación.");
                console.error(error);
            }
        }
    }

    // Resetear el formulario
    const resetForm = useCallback(() => {
        setSelectedClient("");
        setOrderNumber("");
        setDeliveryDate("");
        setLot("");
        setHealthRegistration("");
        setQuantityToProduce("");
        setSelectedMaestras([]);
        setSelectedArticles([]);
        setBomData(null);
        setSelectedBom("");
        setAttachment(null);
        setIngredients([]);
        setIsEditMode(false);
        setEditAdaptationId(null);
    }, []);

    return (
        <div>
            <div className="flex justify-center space-x-2 mb-2">
                <Button onClick={() => {
                    resetForm();
                    setIsOpen(true);
                }} variant="create" label="Crear Acondicionamiento" />
            </div>

            {isOpen && (
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
                        <Text type="title">
                            {isEditMode ? "Editar" : "Crear"} Acondicionamiento
                        </Text>

                        {/* Loading spinner */}
                        {isLoading && (
                            <div className="flex justify-center py-4">
                                <div className="w-12 h-12 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Contenido responsivo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Cliente */}
                            <div className="col-span-full">
                                <Text type="subtitle">Cliente:</Text>
                                <select
                                    className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                    value={selectedClient}
                                    onChange={e => {
                                        setSelectedClient(e.target.value);
                                        setIngredients([]);
                                    }}
                                >
                                    <option value="">Seleccione...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Maestras y BOM*/}
                            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                                <div>
                                    <Text type="subtitle">Maestras:</Text>
                                    <select
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                        value={selectedMaestras.length > 0 ? selectedMaestras[0] : ""}
                                        onChange={(e) => setSelectedMaestras([e.target.value])}
                                    >
                                        <option value="">Seleccione...</option>
                                        {maestra.map((master) => (
                                            <option
                                                key={master.id}
                                                value={master.id.toString()}
                                                disabled={Number(master.aprobado) === 0}
                                            >
                                                {master.descripcion}
                                            </option>
                                        ))}
                                    </select>


                                </div>
                                <div>
                                    <Text type="subtitle">BOM:</Text>
                                    <select
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                        onChange={(e) => setSelectedBom(Number(e.target.value))}  // Convertir a número
                                        value={selectedBom || ""} // Maneja valores nulos/vacíos 
                                    >
                                        <option value="">Seleccione un BOM...</option>
                                        {Array.isArray(boms) && boms.length > 0 ? (
                                            boms.map(bom => (
                                                <option key={bom.id} value={bom.id}>
                                                    {JSON.parse(bom.code_details)?.codart ?? "Sin código"}  {/* Extraer codart correctamente */}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No hay BOMs disponibles</option>
                                        )}
                                    </select>

                                </div>
                            </div>
                            {/* MultiSelect Articulos*/}
                            <div className="col-span-full">
                                <Text type="subtitle">Artículos:</Text>
                                <MultiSelect
                                    options={articles}
                                    selected={selectedArticles}
                                    onChange={setSelectedArticles}
                                    getLabel={article => article.codart}
                                    getValue={article => article.codart}
                                />
                            </div>
                            {/* Campos en grid responsivo */}
                            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Número de Orden */}
                                <div>
                                    <Text type="subtitle">N° Orden:</Text>
                                    <input
                                        type="text"
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={orderNumber}
                                        onChange={e => setOrderNumber(e.target.value)}
                                    />
                                </div>

                                {/* Fecha Entrega */}
                                <div>
                                    <Text type="subtitle">Fecha Entrega:</Text>
                                    <input
                                        type="date"
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={deliveryDate}
                                        onChange={e => setDeliveryDate(e.target.value)}
                                    />
                                </div>

                                {/* Cantidad a producir */}
                                <div>
                                    <Text type="subtitle">Cantidad a Producir:</Text>
                                    <input
                                        type="number"
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={quantityToProduce}
                                        onChange={e => setQuantityToProduce(Number(e.target.value))}
                                    />
                                </div>
                                {/* Lote */}
                                <div>
                                    <Text type="subtitle">Lote:</Text>
                                    <input
                                        type="text"
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={lot}
                                        onChange={e => setLot(e.target.value)}
                                    />
                                </div>

                                {/* Registro Sanitario */}
                                <div>
                                    <Text type="subtitle">Registro Sanitario:</Text>
                                    <input
                                        type="text"
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={healthRegistration}
                                        onChange={e => setHealthRegistration(e.target.value)}
                                    />
                                </div>

                                {/* Adjunto */}
                                <div className="flex flex-col">
                                    <Text type="subtitle">Adjuntar:</Text>
                                    <File onChange={setAttachment} />;
                                </div>
                            </div>

                            <div className="col-span-full">
                                <Text type="subtitle">Materiales:</Text>
                                <div className="p-4 rounded space-y-4">
                                    {ingredients.length > 0 ? (
                                        ingredients.map((ing, index) => (
                                            <div key={index} className="flex items-center space-x-2 w-full">
                                                <input
                                                    type="text"
                                                    className="border p-1 rounded text-black w-[40%] text-center"
                                                    placeholder="Codeart"
                                                    value={ing.desart}
                                                    disabled // No editable
                                                />
                                                <input
                                                    type="number"
                                                    className="border p-1 rounded text-black w-[12%] text-center"
                                                    placeholder="Cantidad"
                                                    value={ing.quantity ?? ""}
                                                    disabled // No editable
                                                />
                                                <input
                                                    type="number"
                                                    className="border p-1 rounded text-black w-[12%] text-center"
                                                    placeholder="% Merma"
                                                    value={ing.merma ?? ""}
                                                    disabled // No editable
                                                />
                                                <input
                                                    type="number"
                                                    className="border p-1 rounded text-black w-[20%] text-center"
                                                    placeholder="Cant. Teórica"
                                                    value={ing.teorica || ""}
                                                    disabled // No editable
                                                />
                                                <input
                                                    type="number"
                                                    className="border p-1 rounded text-black w-[20%] text-center"
                                                    placeholder="Validar"
                                                    value={ing.validar || ""}
                                                    disabled // No editable
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <Text type="alert">No hay ingredientes agregados.</Text>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end space-x-4 mt-4">
                            <Button onClick={() => {
                                resetForm();
                                setIsOpen(false);
                            }} variant="cancel" label="Cancelar" />
                            <Button onClick={handleSubmit} variant="save" label="Guardar" />
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <Table
                columns={["client_name",]}
                rows={adaptation}
                columnLabels={{
                    client_name: "Cliente",
                }}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />
        </div>
    );
}

export default NewAdaptation;
