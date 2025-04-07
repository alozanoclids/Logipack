import React, { useState } from "react";

interface MultiSelectProps<T> {
    options: T[];
    selected: T[];
    onChange: (selected: T[]) => void;
    getLabel: (item: T) => string;
    getValue: (item: T) => string;
}

function MultiSelect<T>({ options, selected, onChange, getLabel, getValue }: MultiSelectProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOptions = options.filter(item =>
        getLabel(item).toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selected.some(sel => getValue(sel) === getValue(item))
    );

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const selectedItem = options.find(item => getValue(item) === selectedValue);

        if (selectedItem && !selected.some(item => getValue(item) === selectedValue)) {
            onChange([...selected, selectedItem]);
        }
    };

    const handleRemove = (value: string) => {
        onChange(selected.filter(item => getValue(item) !== value));
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Options */}
                <div className="space-y-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <select
                        multiple
                        size={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto max-h-64"
                        onChange={handleSelect}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(item => (
                                <option
                                    key={getValue(item)}
                                    value={getValue(item)}
                                    className="hover:bg-gray-100 cursor-pointer text-black"
                                >
                                    {getLabel(item)}
                                </option>
                            ))
                        ) : (
                            <option disabled className="text-center">No hay resultados</option>
                        )}
                    </select>
                </div>

                {/* Selected Options */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-700 ml-6">Seleccionados</h3>
                        <button
                            className="
                                text-sm text-blue-500 hover:text-white 
                                hover:bg-blue-600 focus:outline-none 
                                focus:ring-2 focus:ring-blue-300 
                                rounded-lg px-3 py-1 transition-all 
                                duration-200 border border-blue-500 
                                hover:border-blue-700 shadow-sm 
                                hover:shadow-md font-medium
                            "
                            onClick={() => onChange([])}
                        >
                            Limpiar todos
                        </button>
                    </div>

                    <div className="border border-gray-300 rounded-lg p-2 max-h-64 overflow-y-auto">
                        {selected.length > 0 ? (
                            selected.map(item => (
                                <div
                                    key={getValue(item)}
                                    className="flex justify-between items-center p-2 rounded hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-gray-700">{getLabel(item)}</span>
                                    <button
                                        className="
                                                text-red-500 hover:text-white hover:bg-red-600 
                                                ml-4 focus:outline-none focus:ring-2 focus:ring-red-300
                                                rounded-full p-1 transition-all duration-200
                                                shadow-sm hover:shadow-md
                                                border border-transparent hover:border-red-700
                                            "
                                        onClick={() => handleRemove(getValue(item))}
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">No hay selecciones</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MultiSelect;