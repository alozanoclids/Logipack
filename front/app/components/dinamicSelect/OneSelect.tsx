import React, { useMemo } from "react";
import Text from "../text/Text";

interface MaestraBase {
  id: string | number;
  descripcion: string;
}

interface MaestrasSelectProps<T extends MaestraBase> {
  maestras: T[];
  selectedMaestra: string | null;
  setSelectedMaestra: React.Dispatch<React.SetStateAction<string | null>>;
  label: string;
  noMaestraMessage?: string;
}

const MaestrasSelect = <T extends MaestraBase>({
  maestras,
  selectedMaestra,
  setSelectedMaestra,
  label,
  noMaestraMessage = "No hay maestras disponibles."
}: MaestrasSelectProps<T>) => {
  const maestraMap = useMemo(() => {
    return new Map(maestras.map(m => [m.id.toString(), m]));
  }, [maestras]);

  const handleSelect = (id: string) => {
    setSelectedMaestra(prev => prev === id ? null : id);
  };

  // Warning for invalid selection
  if (process.env.NODE_ENV !== 'production') {
    React.useEffect(() => {
      if (selectedMaestra && !maestraMap.has(selectedMaestra)) {
        console.warn(`MaestrasSelect: Selected maestra with ID ${selectedMaestra} not found`);
      }
    }, [selectedMaestra, maestraMap]);
  }

  return (
    <div className="mb-6">
      <Text type="subtitle">{label}</Text>
      
      {maestras.length === 0 ? (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
          <Text type="alert">{noMaestraMessage}</Text>
        </div>
      ) : (
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Available List */}
          <div className="flex-1">
            <Text type="subtitle">Disponibles:</Text>
            <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {maestras.map(maestra => (
                selectedMaestra !== maestra.id.toString() && (
                  <li 
                    key={maestra.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(maestra.id.toString())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSelect(maestra.id.toString())}
                    className="px-4 py-2 hover:bg-blue-50 focus:outline-none focus:bg-blue-100 transition-colors cursor-pointer"
                  >
                    {maestra.descripcion}
                  </li>
                )
              ))}
            </ul>
          </div>

          {/* Selected List */}
          <div className="flex-1 mt-4 md:mt-0">
            <Text type="subtitle">Seleccionada:</Text>
            <ul className="border border-blue-200 rounded-lg divide-y divide-blue-200 max-h-64 overflow-y-auto">
              {selectedMaestra && maestraMap.get(selectedMaestra) ? (
                <li 
                  key={selectedMaestra}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(selectedMaestra)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSelect(selectedMaestra)}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:bg-blue-300 transition-colors cursor-pointer"
                >
                  {maestraMap.get(selectedMaestra)!.descripcion}
                </li>
              ) : (
                <li className="px-4 py-2 text-gray-500 italic">Ninguna seleccionada</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(MaestrasSelect) as typeof MaestrasSelect;