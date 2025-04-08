import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { BOMResponse, BOM, Adaptation, ArticleFormData, ArticleFieldsMap, Articles } from "@/app/interfaces/NewAdaptation";

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
    const [articleFields, setArticleFields] = useState<Record<string, ArticleFormData>>({});



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
        const fetchBom = async () => {
            if (!selectedClient || selectedMaestras.length === 0) return;
            const selectedMaestraObj = maestra.find(
                (m) => m.id.toString() === selectedMaestras[0]
            );
            if (!selectedMaestraObj?.requiere_bom) {
                setBoms([]); // Limpiar
                setIngredients([]);
                return;
            }
            try {
                const clientData = await getClientsId(Number(selectedClient));
                const bomData = await getArticleByClient(clientData.id);
                if (bomData?.boms?.length > 0) {
                    setBoms(bomData.boms);
                    const ingredientsJSON = bomData.boms[0].ingredients;
                    const parsedIngredients: Ingredient[] = JSON.parse(ingredientsJSON);
                    const enhancedIngredients = parsedIngredients.map((ing) => ({
                        ...ing,
                        teteorica:
                            ing.teorica === ""
                                ? (parseFloat(ing.quantity) + parseFloat(ing.quantity) * parseFloat(ing.merma)).toString()
                                : ing.teorica,
                        validar: ing.validar,
                    }));
                    setIngredients(enhancedIngredients);
                } else {
                    setBoms([]); // También vaciar si no hay BOMs
                    setIngredients([]);
                }
            } catch (error) {
                console.error("Error al obtener los BOMs", error);
                setBoms([]);
                setIngredients([]);
            }
        };
        fetchBom();
    }, [selectedClient, selectedMaestras, maestra]);

    const maestraSeleccionada = useMemo(() => {
        return maestra.find(m => m.id.toString() === selectedMaestras[0]);
    }, [selectedMaestras, maestra]);

    const maestraRequiereBOM = maestraSeleccionada?.requiere_bom ?? false;

    const handleChange = (index: number, field: keyof Ingredient, value: string): void => {
        const updated: Ingredient[] = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    };

    const handleFieldChange = (codart: string, field: keyof ArticleFormData, value: any) => {
        setArticleFields(prev => ({
            ...prev,
            [codart]: {
                ...prev[codart],
                [field]: value
            }
        }));
    };

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

    const handleSubmit = async () => {
        // Validación inicial
        if (!selectedClient) {
            showError("Por favor, selecciona un cliente.");
            return;
        }
    
        let articlesData;
    
        if (maestraRequiereBOM) {
            if (!orderNumber) {
                showError("Por favor, ingresa el número de orden.");
                return;
            }
    
            // Se arma la data sin incluir el attachment en el JSON.
            articlesData = [
                {
                    codart: selectedArticles[0]?.codart || "", // En BOM se usa solo el primer artículo
                    orderNumber,
                    deliveryDate,
                    quantityToProduce,
                    lot,
                    healthRegistration,
                    // NO incluyo attachment acá
                },
            ];
        } else {
            articlesData = selectedArticles
                .map((article) => {
                    const fields = articleFields[article.codart] || {};
                    if (!fields.orderNumber) {
                        showError("Por favor, ingresa el número de orden.");
                        return;
                    }
                    return {
                        codart: article.codart,
                        orderNumber: fields.orderNumber || "",
                        deliveryDate: fields.deliveryDate || "",
                        quantityToProduce: fields.quantityToProduce || 0,
                        lot: fields.lot || "",
                        healthRegistration: fields.healthRegistration || "",
                        // NO incluyo attachment acá
                    };
                })
                .filter(Boolean); // Evita incluir elementos undefined si falta algún dato
        }
    
        // Armamos el FormData para enviar al backend
        const formData = new FormData();
        formData.append("client_id", selectedClient.toString());
        formData.append("article_code", JSON.stringify(articlesData));
    
        // ¡IMPORTANTE! Agrega el archivo directamente al FormData,
        // ya que si lo incluyes en el JSON se pierde su contenido.
        if (attachment) {
            formData.append("attachment", attachment);
        }
    
        formData.append("master", JSON.stringify(selectedMaestras));
        formData.append("bom", JSON.stringify(selectedBom) || "");
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
            setIsEditMode(true);
            setEditAdaptationId(id);
            // Cliente
            setSelectedClient(adaptation.client_id);
            // Maestra (asegúrate de parsear)
            const masterParsed =
                typeof adaptation.master === "string"
                    ? JSON.parse(adaptation.master)
                    : adaptation.master;
            setSelectedMaestras(masterParsed ? masterParsed : []);
            // BOM: parsear si es necesario
            let bomParsed = "";
            if (typeof adaptation.bom === "string") {
                try {
                    bomParsed = JSON.parse(adaptation.bom);
                } catch (error) {
                    bomParsed = adaptation.bom;
                }
            }
            setSelectedBom(Number(bomParsed));
            // Artículos: usar el campo correcto y parsearlo
            const articles = adaptation.article_code ? JSON.parse(adaptation.article_code) : [];
            setSelectedArticles(
                articles
                    .filter((a: Article) => a && a.codart) // Filtra los nulos o sin codart
                    .map((a: Article) => ({ codart: a.codart }))
            );
            if (adaptation.bom != "") {
                const general = articles[0];
                if (general) {
                    setOrderNumber(general.orderNumber || "");
                    setDeliveryDate(general.deliveryDate || "");
                    setQuantityToProduce(general.quantityToProduce || 0);
                    setLot(general.lot || "");
                    setHealthRegistration(general.healthRegistration || "");
                    setAttachment(null);
                    setAttachmentUrl(general.attachment ? `/storage/${general.attachment}` : null);
                }
            } else {
                // Si NO requiere BOM: campos por artículo 
                const fieldsMap: ArticleFieldsMap = {};
                articles.forEach((a: Articles) => {
                    fieldsMap[a.codart] = {
                        orderNumber: a.orderNumber,
                        deliveryDate: a.deliveryDate,
                        quantityToProduce: a.quantityToProduce,
                        lot: a.lot,
                        healthRegistration: a.healthRegistration,
                        attachment: a.attachment,
                    };
                });
                setArticleFields(fieldsMap);
            }
            // Ingredientes
            if (adaptation.ingredients) {
                try {
                    const parsedIngredients = JSON.parse(adaptation.ingredients).map((ing: any) => ({
                        ...ing,
                        teorica: ing.teorica ?? (
                            parseFloat(ing.quantity || "0") * (1 + parseFloat(ing.merma || "0"))
                        ).toFixed(2),
                        validar: ing.validar ?? "",
                    }));
                    setIngredients(parsedIngredients);
                } catch (error) {
                    console.error("Error al parsear los ingredientes", error);
                    setIngredients([]);
                }
            } else {
                setIngredients([]);
            }
            // Abre el modal y refresca adaptaciones
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
                            <div
                                className={`col-span-full grid grid-cols-1 ${maestraRequiereBOM ? "sm:grid-cols-2" : "lg:grid-cols-1"
                                    } gap-4`}
                            >
                                {/* Select de Maestras */}
                                <div>
                                    <Text type="subtitle">Maestras:</Text>
                                    <select
                                        className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500  text-center"
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

                                {/* Select de BOM solo si se requiere */}
                                {maestraRequiereBOM && (
                                    <div>
                                        <Text type="subtitle">BOM:</Text>
                                        <select
                                            className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500   text-center"
                                            onChange={(e) => setSelectedBom(Number(e.target.value))}
                                            value={selectedBom || ""}
                                        >
                                            <option value="">Seleccione un BOM...</option>
                                            {Array.isArray(boms) && boms.length > 0 ? (
                                                boms.map((bom) => (
                                                    <option key={bom.id} value={bom.id}>
                                                        {JSON.parse(bom.code_details)?.codart ?? "Sin código"}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>No hay BOMs disponibles</option>
                                            )}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* MultiSelect Articulos*/}
                            <div className="col-span-full">
                                <Text type="subtitle">Artículos:</Text>
                                {maestraRequiereBOM ? (
                                    <select
                                        className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-center"
                                        value={selectedArticles[0]?.codart ?? ""}
                                        onChange={(e) => {
                                            const selected = articles.find(article => article.codart === e.target.value);
                                            if (selected) setSelectedArticles([selected]);
                                        }}
                                    >
                                        <option value="" disabled>Selecciona un artículo</option>
                                        {articles.map((article) => (
                                            <option key={article.codart} value={article.codart}>
                                                {article.codart}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <MultiSelect
                                        options={articles}
                                        selected={selectedArticles}
                                        onChange={setSelectedArticles}
                                        getLabel={(article) => article.codart}
                                        getValue={(article) => article.codart}
                                    />
                                )}
                            </div>

                            {/* Campos en grid responsivo */}
                            {maestraRequiereBOM ? (
                                <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Número de Orden */}
                                    <div>
                                        <Text type="subtitle">N° Orden:</Text>
                                        <input
                                            type="text"
                                            className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                            value={orderNumber}
                                            onChange={e => setOrderNumber(e.target.value)}
                                        />
                                    </div>

                                    {/* Fecha Entrega */}
                                    <div>
                                        <Text type="subtitle">Fecha Entrega:</Text>
                                        <input
                                            type="date"
                                            className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                            value={deliveryDate}
                                            onChange={e => setDeliveryDate(e.target.value)}
                                        />
                                    </div>

                                    {/* Cantidad a producir */}
                                    <div>
                                        <Text type="subtitle">Cantidad a Producir:</Text>
                                        <input
                                            type="number"
                                            className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                            value={quantityToProduce}
                                            onChange={e => setQuantityToProduce(Number(e.target.value))}
                                        />
                                    </div>
                                    {/* Lote */}
                                    <div>
                                        <Text type="subtitle">Lote:</Text>
                                        <input
                                            type="text"
                                            className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                            value={lot}
                                            onChange={e => setLot(e.target.value)}
                                        />
                                    </div>

                                    {/* Registro Sanitario */}
                                    <div>
                                        <Text type="subtitle">Registro Sanitario:</Text>
                                        <input
                                            type="text"
                                            className="w-full border p-3 rounded-lg text-gray-800 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
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
                            ) : (
                                <>
                                    {selectedArticles.map((article) => (
                                        <div key={article.codart} className="border border-gray-200 p-4 rounded-lg mb-6 shadow-md bg-gray-50">
                                            <Text type="title"  >Artículo: {article.codart}</Text>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="col-span-1">
                                                    <Text type="subtitle" >N° Orden:</Text>
                                                    <input
                                                        type="text"
                                                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-black"
                                                        value={articleFields[article.codart]?.orderNumber || ""}
                                                        onChange={(e) => handleFieldChange(article.codart, "orderNumber", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Text type="subtitle"  >Fecha Entrega:</Text>
                                                    <input
                                                        type="date"
                                                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-black"
                                                        value={articleFields[article.codart]?.deliveryDate || ""}
                                                        onChange={(e) => handleFieldChange(article.codart, "deliveryDate", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Text type="subtitle"  >Cantidad a Producir:</Text>
                                                    <input
                                                        type="number"
                                                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-black"
                                                        value={articleFields[article.codart]?.quantityToProduce || ""}
                                                        onChange={(e) => handleFieldChange(article.codart, "quantityToProduce", Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Text type="subtitle"  >Lote:</Text>
                                                    <input
                                                        type="text"
                                                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-black"
                                                        value={articleFields[article.codart]?.lot || ""}
                                                        onChange={(e) => handleFieldChange(article.codart, "lot", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <Text type="subtitle" >Registro Sanitario:</Text>
                                                    <input
                                                        type="text"
                                                        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-black"
                                                        value={articleFields[article.codart]?.healthRegistration || ""}
                                                        onChange={(e) => handleFieldChange(article.codart, "healthRegistration", e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1 flex flex-col">
                                                    <Text type="subtitle">Adjuntar:</Text>
                                                    <File
                                                        onChange={(file) => handleFieldChange(article.codart, "attachment", file)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Materiales */}
                            {maestraRequiereBOM ? (
                                <div className="col-span-full">
                                    <Text type="subtitle">Materiales:</Text>
                                    <div>
                                        <table className="w-full border-collapse border border-black text-black">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="border border-black p-2 text-center">Codart</th>
                                                    <th className="border border-black p-2 text-center">Desart</th>
                                                    <th className="border border-black p-2 text-center">Quantity</th>
                                                    <th className="border border-black p-2 text-center">Merma</th>
                                                    <th className="border border-black p-2 text-center">Cantidad Teorica</th>
                                                    <th className="border border-black p-2 text-center">Validar </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ingredients.map((ing, index) => (
                                                    <tr key={index}>
                                                        <td className="border border-black p-2 text-center">{ing.codart}</td>
                                                        <td className="border border-black p-2 text-center">{ing.desart}</td>
                                                        <td className="border border-black p-2 text-center">{ing.quantity}</td>
                                                        <td className="border border-black p-2 text-center">{ing.merma}</td>
                                                        <td className="border border-black p-2 text-center">
                                                            <input
                                                                type="number"
                                                                className="text-black p-1 border border-gray-300 rounded text-center"
                                                                value={ing.teorica}
                                                                onChange={(e) => handleChange(index, "teorica", e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="border border-black p-2">
                                                            <input
                                                                type="number"
                                                                className="text-black p-1 border border-gray-300 rounded text-center"
                                                                value={ing.validar}
                                                                onChange={(e) => handleChange(index, "validar", e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <br />
                                    </div>
                                </div>
                            ) : (null)}
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
