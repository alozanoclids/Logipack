import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../loader/Loader"; // Importa tu componente de carga

interface Window {
    id: number;
    title: string;
    content?: string;
    component?: React.ReactNode;
    isProtected?: boolean;
}

interface WindowManagerProps {
    windowsData?: Window[];
}

const WindowManager: React.FC<WindowManagerProps> = ({ windowsData = [] }) => {
    const [windows, setWindows] = useState<Window[]>(windowsData);
    const [activeWindow, setActiveWindow] = useState<number | null>(windowsData.length > 0 ? windowsData[0].id : null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setWindows(windowsData);
        if (windowsData.length > 0) {
            setActiveWindow(windowsData[0].id);
        }
    }, [windowsData]);

    useEffect(() => {
        if (activeWindow !== null) {
            setIsLoading(true);
            const timeout = setTimeout(() => setIsLoading(false), 1000); // Simula la carga
            return () => clearTimeout(timeout);
        }
    }, [activeWindow]);

    const currentWindow = useMemo(() => windows.find(win => win.id === activeWindow), [windows, activeWindow]);

    const closeWindow = (id: number) => {
        setWindows(prevWindows => {
            const filteredWindows = prevWindows.filter(win => win.id !== id);
            if (activeWindow === id) {
                setActiveWindow(filteredWindows.length ? filteredWindows[0].id : null);
            }
            return filteredWindows;
        });
    };

    return (
        <div className="relative max-h-[94vh] h-screen flex flex-col bg-gray-900 rounded-lg text-white overflow-hidden">
            {/* Barra de pestañas estilo navegador */}
            <div className="relative flex items-center gap-1 p-2 bg-gray-800 rounded-t-lg shadow-md border-b border-gray-700">
                {windows.map(win => (
                    <div key={win.id} className="relative">
                        <button
                            className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-all flex items-center gap-2
                            ${activeWindow === win.id ? "bg-gray-900 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                            onClick={() => setActiveWindow(win.id)}
                        >
                            {win.title}
                            {!win.isProtected && (
                                <span
                                    className="text-red-400 hover:text-red-300 transition-all cursor-pointer text-xs"
                                    onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                                    aria-label={`Cerrar ${win.title}`}
                                >
                                    ✖
                                </span>
                            )}
                        </button>
                        {/* Indicador de pestaña activa */}
                        {activeWindow === win.id && (
                            <motion.div
                                layoutId="active-tab"
                                className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-md"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Contenido de la Ventana Activa con animación y Loader */}
            <div className="flex-grow bg-gray-700 rounded-b-lg shadow-lg border border-gray-600 w-full max-h-full overflow-auto flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <Loader />
                        </motion.div>
                    ) : (
                        currentWindow && (
                            <motion.div
                                key={currentWindow.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full h-full overflow-auto p-4 md:p-6"
                            >
                                {currentWindow.content}
                                {currentWindow.component}
                            </motion.div>
                        )
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WindowManager;
