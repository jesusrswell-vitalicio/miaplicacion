
import React, { useState, useEffect } from 'react';
import { AppRoute, PercentageEntry } from './types';
import { DEFAULT_PERCENTAGES } from './constants';
import Calculator from './components/Calculator';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.CALCULATOR);
  const [percentages, setPercentages] = useState<PercentageEntry[]>([]);

  // Load percentages from localStorage or defaults
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
  }, []);

  const savePercentages = (newPercentages: PercentageEntry[]) => {
    setPercentages(newPercentages);
    localStorage.setItem('nuda_percentages', JSON.stringify(newPercentages));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <i className="fas fa-home text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Nuda<span className="text-indigo-600">Pro</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentRoute(AppRoute.CALCULATOR)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRoute === AppRoute.CALCULATOR 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <i className="fas fa-calculator mr-2"></i> Calculadora
              </button>
              <button
                onClick={() => setCurrentRoute(AppRoute.ADMIN)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentRoute === AppRoute.ADMIN 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <i className="fas fa-cog mr-2"></i> Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full">
          {currentRoute === AppRoute.CALCULATOR ? (
            <Calculator percentages={percentages} />
          ) : (
            <AdminPanel percentages={percentages} onSave={savePercentages} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} NudaPro - Herramienta Profesional de Valoración Inmobiliaria</p>
      </footer>
    </div>
  );
};

export default App;
