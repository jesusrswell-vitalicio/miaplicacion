
import React, { useState, useEffect } from 'react';
import { AppRoute, PercentageEntry, UserAccount } from './types';
import { DEFAULT_PERCENTAGES } from './constants';
import Calculator from './components/Calculator';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [percentages, setPercentages] = useState<PercentageEntry[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [loginInput, setLoginInput] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    // 1. Cargar porcentajes
    const savedPercentages = localStorage.getItem('nuda_percentages');
    setPercentages(savedPercentages ? JSON.parse(savedPercentages) : DEFAULT_PERCENTAGES);

    // 2. Cargar usuarios
    const savedUsers = localStorage.getItem('vitalicio_users');
    let loadedUsers: UserAccount[] = [];
    if (savedUsers) {
      loadedUsers = JSON.parse(savedUsers);
    } else {
      const defaultAdmin: UserAccount = { 
        username: 'admin', 
        password: 'Vitalicio@2025', 
        role: 'admin' 
      };
      loadedUsers = [defaultAdmin];
      localStorage.setItem('vitalicio_users', JSON.stringify(loadedUsers));
    }
    setUsers(loadedUsers);

    // 3. Restaurar sesión
    const session = localStorage.getItem('vitalicio_session');
    if (session) {
      const sessionUser = JSON.parse(session);
      // Validar que el usuario de la sesión aún existe y tiene la misma clave (seguridad básica)
      const validUser = loadedUsers.find(u => u.username === sessionUser.username && u.password === sessionUser.password);
      if (validUser) {
        setCurrentUser(validUser);
        setCurrentRoute(AppRoute.CALCULATOR);
      } else {
        localStorage.removeItem('vitalicio_session');
      }
    }
    setIsLoaded(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => 
      u.username.toLowerCase() === loginInput.user.toLowerCase() && 
      u.password === loginInput.pass
    );
    
    if (foundUser) {
      setCurrentUser(foundUser);
      localStorage.setItem('vitalicio_session', JSON.stringify(foundUser));
      setLoginError(false);
      setLoginInput({ user: '', pass: '' });
      setCurrentRoute(AppRoute.CALCULATOR);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vitalicio_session');
    setCurrentRoute(AppRoute.LOGIN);
  };

  const savePercentages = (newPercentages: PercentageEntry[]) => {
    setPercentages(newPercentages);
    localStorage.setItem('nuda_percentages', JSON.stringify(newPercentages));
  };

  const saveUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    localStorage.setItem('vitalicio_users', JSON.stringify(newUsers));
  };

  const Logo = ({ color = "#a12d34", grey = "#6b7280" }) => (
    <div className="flex flex-col items-start leading-none select-none">
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-lg sm:text-2xl tracking-tighter" style={{color: grey}}>GRUPO</span>
        <span className="font-black text-2xl sm:text-4xl tracking-tighter" style={{color: color}}>VITALICIO</span>
      </div>
      <span className="text-[9px] sm:text-[11px] font-extrabold tracking-[0.2em] mt-1 opacity-80" style={{color: color}}>VALORACIÓN ORIENTATIVA</span>
    </div>
  );

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#a12d34] border-t-transparent rounded-full animate-spin"></div></div>;

  if (currentRoute === AppRoute.LOGIN || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Montserrat']">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="flex justify-center mb-10">
            <Logo />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Acceso Privado</h2>
            <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Introduzca sus credenciales</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
              <input
                type="text"
                autoFocus
                value={loginInput.user}
                onChange={(e) => setLoginInput({...loginInput, user: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 focus:border-[#a12d34] outline-none transition-all font-bold text-slate-700"
                placeholder="Nombre de usuario"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <input
                type="password"
                value={loginInput.pass}
                onChange={(e) => setLoginInput({...loginInput, pass: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 focus:border-[#a12d34] outline-none transition-all font-bold text-slate-700"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="p-4 bg-red-50 text-[#a12d34] rounded-xl text-[10px] font-black uppercase text-center border border-red-100 animate-pulse">
                Usuario o contraseña incorrectos
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#a12d34] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-red-900/10 active:scale-[0.98] mt-4"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div className="mt-10 text-center opacity-40">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-relaxed">
              Área restringida para agentes autorizados<br/>Grupo Vitalicio &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Montserrat']">
      <nav className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentRoute(AppRoute.CALCULATOR)}>
              <Logo color="#a12d34" />
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={() => setCurrentRoute(AppRoute.CALCULATOR)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  currentRoute === AppRoute.CALCULATOR 
                  ? 'bg-[#a12d34] text-white shadow-lg shadow-red-900/20' 
                  : 'text-slate-400 hover:text-[#a12d34]'
                }`}
              >
                Calculadora
              </button>
              
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setCurrentRoute(AppRoute.ADMIN)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    currentRoute === AppRoute.ADMIN 
                    ? 'bg-[#a12d34] text-white shadow-lg shadow-red-900/20' 
                    : 'text-slate-400 hover:text-[#a12d34]'
                  }`}
                >
                  Gestión
                </button>
              )}

              <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-slate-800 uppercase tracking-tighter leading-none">{currentUser.username}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{currentUser.role === 'admin' ? 'Administrador' : 'Agente Autorizado'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-[#a12d34] transition-all flex items-center justify-center border border-slate-100"
                  title="Cerrar sesión"
                >
                  <i className="fas fa-sign-out-alt text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-10">
        <div className="max-w-7xl w-full">
          {currentRoute === AppRoute.ADMIN && currentUser.role === 'admin' ? (
            <AdminPanel 
              percentages={percentages} 
              onSavePercentages={savePercentages}
              users={users}
              onSaveUsers={saveUsers}
            />
          ) : (
            <Calculator percentages={percentages} />
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="mb-6 opacity-30 flex justify-center scale-75">
           <Logo color="currentColor" grey="currentColor" />
        </div>
        <p>&copy; {new Date().getFullYear()} Grupo Vitalicio &middot; Portal de Uso Profesional</p>
      </footer>
    </div>
  );
};

export default App;
