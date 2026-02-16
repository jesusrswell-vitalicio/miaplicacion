
import React, { useState } from 'react';
import { PercentageEntry, UserAccount } from '../types';

interface AdminPanelProps {
  percentages: PercentageEntry[];
  onSavePercentages: (newPercentages: PercentageEntry[]) => void;
  users: UserAccount[];
  onSaveUsers: (newUsers: UserAccount[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ percentages, onSavePercentages, users, onSaveUsers }) => {
  const [activeTab, setActiveTab] = useState<'coefficients' | 'users'>('coefficients');
  const [editingTable, setEditingTable] = useState<PercentageEntry[]>([...percentages]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Estado para nuevo usuario
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' as const });

  const handlePercentageChange = (age: number, value: string) => {
    const numValue = parseFloat(value);
    setEditingTable(prev => 
      prev.map(item => item.age === age ? { ...item, percentage: isNaN(numValue) ? 0 : numValue } : item)
    );
  };

  const handleSaveTable = () => {
    onSavePercentages(editingTable);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = newUser.username.trim().toLowerCase();
    const cleanPassword = newUser.password.trim();

    if (!cleanUsername || !cleanPassword) return;
    
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      alert("Este nombre de usuario ya está registrado.");
      return;
    }

    const updatedUsers = [...users, { ...newUser, username: cleanUsername, password: cleanPassword }];
    onSaveUsers(updatedUsers);
    setNewUser({ username: '', password: '', role: 'user' });
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'admin') {
      alert("El administrador principal no puede ser eliminado.");
      return;
    }
    if (window.confirm(`¿Está seguro de que desea retirar el acceso al usuario "${username}"?`)) {
      const updatedUsers = users.filter(u => u.username !== username);
      onSaveUsers(updatedUsers);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles");
  };

  const resetToDefault = () => {
    if (window.confirm("Esta acción restablecerá todos los coeficientes a los valores de fábrica. ¿Desea continuar?")) {
      localStorage.removeItem('nuda_percentages');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto animate-fadeIn">
      {/* Header & Navigation */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('coefficients')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'coefficients' ? 'bg-white shadow-md text-[#a12d34]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Coeficientes
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'users' ? 'bg-white shadow-md text-[#a12d34]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Usuarios y Claves
          </button>
        </div>

        <div className="flex gap-3">
          {activeTab === 'coefficients' && (
            <>
              <button 
                onClick={resetToDefault}
                className="px-6 py-3 border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Valores Originales
              </button>
              <button 
                onClick={handleSaveTable}
                className="px-6 py-3 bg-[#a12d34] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-900/20"
              >
                Aplicar Cambios
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'coefficients' ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 text-xs">
              <i className="fas fa-chart-line text-[#a12d34]"></i> Tabla de Porcentajes de Nuda Propiedad
            </h3>
            {showSuccess && (
              <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-bounce">
                ¡Tabla Actualizada!
              </span>
            )}
          </div>
          
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Edad</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coeficiente (%)</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell text-right pr-14">Gráfico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {editingTable.sort((a,b) => a.age - b.age).map((entry) => (
                  <tr key={entry.age} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-10 py-6 font-black text-slate-700 text-sm">
                      {entry.age} Años
                    </td>
                    <td className="px-10 py-6">
                      <div className="relative max-w-[140px]">
                        <input
                          type="number"
                          step="0.01"
                          value={entry.percentage}
                          onChange={(e) => handlePercentageChange(entry.age, e.target.value)}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all text-sm font-black text-slate-700"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">%</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 hidden sm:table-cell">
                      <div className="w-full max-w-[200px] ml-auto mr-4 bg-slate-100 h-2 rounded-full overflow-hidden">
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Listado de Usuarios */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100">
              <h3 className="font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 text-xs">
                <i className="fas fa-key text-[#a12d34]"></i> Credenciales de Acceso
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/30">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agente / Usuario</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clave Acceso</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u.username} className="hover:bg-slate-50/50 group transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${u.role === 'admin' ? 'bg-[#a12d34] text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <code className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-600">{u.password}</code>
                           <button 
                            onClick={() => copyToClipboard(u.password)}
                            className="text-slate-300 hover:text-[#a12d34] transition-colors p-1"
                            title="Copiar contraseña"
                           >
                            <i className="far fa-copy"></i>
                           </button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border ${
                          u.role === 'admin' 
                          ? 'bg-amber-50 text-amber-600 border-amber-100' 
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {u.username !== 'admin' ? (
                          <button 
                            onClick={() => handleDeleteUser(u.username)}
                            className="w-10 h-10 rounded-xl bg-red-50 text-[#a12d34] opacity-0 group-hover:opacity-100 hover:bg-[#a12d34] hover:text-white transition-all flex items-center justify-center mx-auto"
                            title="Dar de baja"
                          >
                            <i className="fas fa-user-minus text-sm"></i>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold uppercase">Maestro</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulario Añadir */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-fit sticky top-28">
            <h3 className="font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3 text-xs">
              <i className="fas fa-user-plus text-[#a12d34]"></i> Generar Nuevo Acceso
            </h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nombre de Usuario</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all font-bold text-slate-700"
                  placeholder="ej: agente_madrid"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Clave de Acceso</label>
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="off"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all font-bold text-slate-700"
                    placeholder="Contraseña segura"
                  />
                  <button 
                    type="button"
                    onClick={() => setNewUser({...newUser, password: Math.random().toString(36).slice(-8).toUpperCase()})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#a12d34] transition-colors"
                    title="Generar aleatoria"
                  >
                    <i className="fas fa-random"></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Tipo de Perfil</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'admin' | 'user'})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                >
                  <option value="user">Usuario (Solo Calculadora)</option>
                  <option value="admin">Administrador (Acceso Total)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!newUser.username || !newUser.password}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Registrar Agente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
