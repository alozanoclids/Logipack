"use client";

import { ToastContainer, toast, Slide, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const Toaster = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            transition={Slide}
            toastClassName={() =>
                "bg-gray-900/90 text-white rounded-xl shadow-xl flex items-center gap-4 p-5 border border-gray-700 backdrop-blur-md"
            } 
            closeButton={false}
        />
    );
};

// Configuración base para los toasts
const baseConfig: ToastOptions = {
    className: "flex items-center gap-3",
};

// Funciones de notificación con iconos personalizados
export const showSuccess = (message: string) =>
    toast.success(message, {
        ...baseConfig,
        icon: <CheckCircle className="text-green-400 w-6 h-6" />,
    });

export const showError = (message: string) =>
    toast.error(message, {
        ...baseConfig,
        icon: <XCircle className="text-red-400 w-6 h-6" />,
    });

export const showWarning = (message: string) =>
    toast.warning(message, {
        ...baseConfig,
        icon: <AlertTriangle className="text-yellow-400 w-6 h-6" />,
    });

export const showConfirm = (message: string, onConfirm: () => void) => {
    const toastId = toast.info(
        <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-300">{message}</p>
            <div className="flex justify-end gap-2">
                <button
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm transition-all duration-200"
                    onClick={() => toast.dismiss(toastId)}
                >
                    Cancelar
                </button>
                <button
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm transition-all duration-200"
                    onClick={() => {
                        toast.dismiss(toastId);
                        onConfirm();
                    }}
                >
                    Confirmar
                </button>
            </div>
        </div>,
        {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
        }
    );
};

export default Toaster;
