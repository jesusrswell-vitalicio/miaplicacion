
import React, { useState } from 'react';
import { PercentageEntry } from '../types';

interface AdminPanelProps {
  percentages: PercentageEntry[];
  onSave: (newPercentages: PercentageEntry[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ percentages, onSave }) => {
  const [editingTable, setEditingTable] = useState<PercentageEntry[]>([...percentages]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePercentageChange = (age: number, value: string) => {
    const numValue = parseFloat(value);
    setEditingTable(prev => 
      prev.map(item => item.age === age ? { ...item, percentage: isNaN(numValue) ? 0 : numValue } : item)
    );
  };

  const handleSave = () => {
    onSave(editingTable);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const resetToDefault = () => {
    if (window.confirm("¿Estás seguro de que quieres restablecer los valores originales?")) {
      // It's handled by parent usually, but we can do it here too
      // or just refresh to re-trigger original logic
      localStorage.removeItem('nuda_percentages');
      window.location.reload();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuración de Porcentajes</h2>
          <p className="text-sm text-slate-500">Ajusta los porcentajes de Nuda Propiedad por cada edad.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={resetToDefault}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Restablecer
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 text-emerald-700 px-6 py-3 border-b border-emerald-100 flex items-center gap-2 text-sm font-medium animate-bounce">
          <i className="fas fa-check-circle"></i> Configuración guardada correctamente.
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Edad del Beneficiario</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Porcentaje Nuda Propiedad (%)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {editingTable.sort((a,b) => a.age - b.age).map((entry) => (
              <tr key={entry.age} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {entry.age} años
                </td>
                <td className="px-6 py-4">
                  <div className="relative max-w-[120px]">
                    <input
                      type="number"
                      step="0.01"
                      value={entry.percentage}
                      onChange={(e) => handlePercentageChange(entry.age, e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-16 h-1 rounded-full" style={{ 
                    backgroundColor: `hsl(${entry.percentage * 1.5}, 70%, 50%)`,
                    width: `${entry.percentage}%`
                  }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Total Entradas</p>
            <p className="text-lg font-bold text-slate-700">{editingTable.length}</p>
          </div>
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Rango Edades</p>
            <p className="text-lg font-bold text-slate-700">
              {editingTable[0]?.age} - {editingTable[editingTable.length-1]?.age}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
