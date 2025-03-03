import React from "react";

interface ProtectedInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  permiso: "edit" | "read";
  label?: string;
}

const ProtectedInput: React.FC<ProtectedInputProps> = ({ value, onChange, permiso, label }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="text-sm font-semibold mb-1">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={permiso === "read"}
        className={`border p-2 rounded ${
          permiso === "read" ? "bg-gray-200 cursor-not-allowed" : "bg-white"
        }`}
      />
      {permiso === "read" && <p className="text-xs text-gray-500 mt-1">Modo solo lectura</p>}
    </div>
  );
};

export default ProtectedInput;
