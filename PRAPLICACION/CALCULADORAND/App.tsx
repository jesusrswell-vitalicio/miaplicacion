
import React, { useState, useEffect } from 'react';
import { AppRoute, PercentageEntry } from './types';
import { DEFAULT_PERCENTAGES } from './constants';
import Calculator from './components/Calculator';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.CALCULATOR);
  const [percentages, setPercentages] = useState<PercentageEntry[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nuda_percentages');
    if (saved) {
      try {
        setPercentages(JSON.parse(saved));
      } catch (e) {
        setPercentages(DEFAULT_PERCENTAGES);
      }
    } else {
      setPercentages(DEFAULT_PERCENTAGES);
    }

    if (!localStorage.getItem('admin_password')) {
      localStorage.setItem('admin_password', 'Vitalicio@2025');
    }
  }, []);

  const savePercentages = (newPercentages: PercentageEntry[]) => {
    setPercentages(newPercentages);
    localStorage.setItem('nuda_percentages', JSON.stringify(newPercentages));
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem('admin_password');
    if (passwordInput === storedPassword) {
      setIsAdminAuthenticated(true);
      setAuthError(false);
      setPasswordInput('');
    } else {
      setAuthError(true);
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentRoute(AppRoute.CALCULATOR);
  };

  // New Corporate Logo Component without the heart
  const Logo = ({ color = "#a12d34", grey = "#6b7280" }) => (
    <div className="flex flex-col items-start leading-none">
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-lg sm:text-2xl tracking-tighter" style={{color: grey}}>GRUPO</span>
        <span className="font-black text-2xl sm:text-4xl tracking-tighter" style={{color: color}}>VITALICIO</span>
      </div>
      <span className="text-[9px] sm:text-[11px] font-extrabold tracking-[0.2em] mt-1 opacity-80" style={{color: color}}>VALORACIÓN ORIENTATIVA</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Montserrat']">
      <nav className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => { setCurrentRoute(AppRoute.CALCULATOR); setIsAdminAuthenticated(false); }}
            >
              <Logo color="#a12d34" />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => { setCurrentRoute(AppRoute.CALCULATOR); setIsAdminAuthenticated(false); }}
                className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  currentRoute === AppRoute.CALCULATOR 
                  ? 'bg-[#a12d34] text-white shadow-lg shadow-red-900/20' 
                  : 'text-slate-600 hover:text-[#a12d34]'
                }`}
              >
                <i className="fas fa-calculator mr-2"></i> Calculadora
              </button>
              {!isAdminAuthenticated ? (
                <button
                  onClick={() => setCurrentRoute(AppRoute.ADMIN)}
                  className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    currentRoute === AppRoute.ADMIN 
                    ? 'bg-[#a12d34] text-white shadow-lg shadow-red-900/20' 
                    : 'text-slate-600 hover:text-[#a12d34]'
                  }`}
                >
                  <i className="fas fa-lock mr-2"></i> Admin
                </button>
              ) : (
                <button
                  onClick={logoutAdmin}
                  className="px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-red-50 text-[#a12d34] hover:bg-red-100 transition-all border border-red-100"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i> Salir
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl w-full">
          {currentRoute === AppRoute.ADMIN && !isAdminAuthenticated ? (
            <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-[#a12d34]/10 text-[#a12d34] rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-shield-alt text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Panel de Control</h2>
                <p className="text-slate-500 text-sm mt-3">Acceso exclusivo administradores.</p>
              </div>
              
              <form onSubmit={handleAdminAuth} className="space-y-5">
                <div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className={`w-full px-5 py-4 bg-slate-50 border ${authError ? 'border-red-500 ring-red-100' : 'border-slate-200 focus:ring-[#a12d34]/20 focus:border-[#a12d34]'} rounded-2xl focus:ring-4 outline-none transition-all font-bold tracking-widest`}
                    autoFocus
                  />
                  {authError && <p className="text-[#a12d34] text-xs mt-3 font-bold text-center">CONTRASEÑA INCORRECTA</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#a12d34] text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-red-900/20 active:scale-[0.98] uppercase"
                >
                  Acceder
                </button>
              </form>
            </div>
          ) : currentRoute === AppRoute.CALCULATOR ? (
            <Calculator percentages={percentages} />
          ) : (
            <AdminPanel percentages={percentages} onSave={savePercentages} />
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-12 text-center text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
        <div className="mb-6 opacity-30 flex justify-center">
           <Logo color="currentColor" grey="currentColor" />
        </div>
        <p>&copy; {new Date().getFullYear()} Grupo Vitalicio &middot; Expertos en Nuda Propiedad</p>
      </footer>
    </div>
  );
};

export default App;
