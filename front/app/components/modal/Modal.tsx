'use client';
import React, { useState, useEffect } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface FieldConfig {
    label: string;
    name: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'password' | 'date' | 'time' | 'boolean' | 'select' | 'json';
    initialValue: string;
    options?: SelectOption[];
}

interface ModalProps {
    isOpen: boolean;
    title?: string;
    fields: FieldConfig[];
    onSave: (values: Record<string, string>) => void;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, fields, onSave, onClose }) => {
    const [values, setValues] = useState<Record<string, string>>({});

    // Inicializa el estado al abrir el modal o al cambiar los campos
    useEffect(() => {
        if (isOpen) {
            const initialValues: Record<string, string> = {};
            fields.forEach(field => {
                initialValues[field.name] = field.initialValue;
            });
            setValues(initialValues);
        }
    }, [isOpen, fields]);

    const handleChange = (name: string, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(values);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl transition-transform transform scale-95 sm:scale-100">
                {/* Título del modal */}
                {title && <h2 className="text-2xl font-bold mb-4 text-black text-center">{title}</h2>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(field => (
                            <div key={field.name}>
                                <label className="block text-black font-medium mb-1">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        value={values[field.name] || ''}
                                        onChange={e => handleChange(field.name, e.target.value)}
                                        required
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        value={values[field.name] || ''}
                                        onChange={e => handleChange(field.name, e.target.value)}
                                        required
                                    >
                                        {field.options?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.type === 'boolean' ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 text-blue-500 focus:ring-blue-500"
                                            checked={values[field.name] === 'true'}
                                            onChange={e =>
                                                handleChange(field.name, e.target.checked ? 'true' : 'false')
                                            }
                                        />
                                        <span className="text-black">{field.label}</span>
                                    </div>
                                ) : field.type === 'json' ? (
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        value={values[field.name] || ''}
                                        onChange={e => {
                                            try {
                                                // Intenta parsear para asegurarse de que el JSON sea válido
                                                JSON.parse(e.target.value);
                                                handleChange(field.name, e.target.value);
                                            } catch {
                                                console.error('JSON inválido');
                                            }
                                        }}
                                        required
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        value={values[field.name] || ''}
                                        onChange={e => handleChange(field.name, e.target.value)}
                                        required
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition active:scale-95"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
