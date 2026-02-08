
import React, { useState } from 'react';
import { PercentageEntry } from '../types';

interface AdminPanelProps {
  percentages: PercentageEntry[];
  onSave: (newPercentages: PercentageEntry[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ percentages, onSave }) => {
  const [editingTable, setEditingTable] = useState<PercentageEntry[]>([...percentages]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  const handlePercentageChange = (age: number, value: string) => {
    const numValue = parseFloat(value);
    setEditingTable(prev => 
      prev.map(item => item.age === age ? { ...item, percentage: isNaN(numValue) ? 0 : numValue } : item)
    );
  };

  const handleSaveTable = () => {
    onSave(editingTable);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordMessage({ text: 'Mínimo 4 caracteres.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'No coinciden.', type: 'error' });
      return;
    }
    localStorage.setItem('admin_password', newPassword);
    setPasswordMessage({ text: 'Actualizada.', type: 'success' });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMessage({ text: '', type: '' }), 3000);
  };

  const resetToDefault = () => {
    if (window.confirm("¿Restablecer valores originales?")) {
      localStorage.removeItem('nuda_percentages');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">GESTIÓN COEFICIENTES</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Ajuste técnico de valores corporativos.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={resetToDefault}
            className="px-6 py-3 border-2 border-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Restablecer
          </button>
          <button 
            onClick={handleSaveTable}
            className="px-6 py-3 bg-[#a12d34] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-red-900/20"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b border-slate-100">
            <h3 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 text-xs">
              <i className="fas fa-table text-[#a12d34]"></i> Tabla de Cálculo
            </h3>
          </div>
          
          {showSuccess && (
            <div className="bg-emerald-50 text-emerald-700 px-8 py-4 border-b border-emerald-100 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Cambios guardados con éxito
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Edad</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coeficiente (%)</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gráfico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {editingTable.sort((a,b) => a.age - b.age).map((entry) => (
                  <tr key={entry.age} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-700 text-sm uppercase">
                      {entry.age} años
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative max-w-[100px]">
                        <input
                          type="number"
                          step="0.01"
                          value={entry.percentage}
                          onChange={(e) => handlePercentageChange(entry.age, e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#a12d34]/10 focus:border-[#a12d34] outline-none transition-all text-sm font-black"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-bold">%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#a12d34] h-full transition-all duration-700" 
                          style={{ width: `${entry.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
            <h3 className="font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3 text-xs">
              <i className="fas fa-key text-[#a12d34]"></i> Seguridad
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Clave Nueva</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Repetir Clave</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all text-sm font-bold"
                />
              </div>
              
              {passwordMessage.text && (
                <p className={`text-[10px] font-black uppercase tracking-tighter ${passwordMessage.type === 'error' ? 'text-[#a12d34]' : 'text-emerald-600'}`}>
                  {passwordMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                Actualizar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
