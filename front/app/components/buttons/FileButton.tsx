'use client'
import React, { ChangeEvent, useState } from "react";
import { FaFileAlt } from "react-icons/fa";

interface FileButtonProps {
  onChange: (file: File | null) => void; // Ahora recibe el archivo en vez del evento
}

const FileButton: React.FC<FileButtonProps> = ({ onChange }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0) ?? null; // Obtiene el primer archivo o null
    setFileName(file?.name || null); // Guarda el nombre o lo resetea si es null
    onChange(file); // Pasa el archivo directamente a la función externa
  };

  return (
    <div className="flex justify-center">
      <label
        htmlFor="file-upload"
        className="relative w-fit max-w-sm mx-auto px-4 py-2 rounded-lg border-2 border-blue-500 bg-gray-50 flex items-center space-x-2 cursor-pointer"
      >
        <FaFileAlt className="text-blue-500" size={20} />
        <span className="text-gray-500 font-semibold text-sm">
          {fileName || "Arrastra o selecciona archivos"}
        </span>
        <input
          id="file-upload"
          type="file"
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Subir archivo"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default FileButton;
