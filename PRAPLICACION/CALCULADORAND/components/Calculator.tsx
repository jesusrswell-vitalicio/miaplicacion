
import React, { useState, useEffect } from 'react';
import { PercentageEntry, CalculationInputs, CalculationResult } from '../types';
import { LIFE_EXPECTANCY_TABLE } from '../constants';

interface CalculatorProps {
  percentages: PercentageEntry[];
}

const Calculator: React.FC<CalculatorProps> = ({ percentages }) => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    marketValue: 250000,
    age1: 70,
    age2: null,
    isSinglePerson: true
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = () => {
    // Si son dos personas, usamos la edad de la persona más joven
    // ya que el usufructo se extingue cuando fallece el último
    const relevantAge = inputs.isSinglePerson || inputs.age2 === null
      ? inputs.age1 
      : Math.min(inputs.age1, inputs.age2);

    // Buscar porcentaje en la tabla
    const entry = percentages.find(p => p.age === relevantAge) || 
                  percentages.sort((a,b) => b.age - a.age).find(p => relevantAge >= p.age) ||
                  { percentage: 0 };

    const percentage = entry.percentage;
    const nudaPropiedadValue = (inputs.marketValue * percentage) / 100;
    const usufructValue = inputs.marketValue - nudaPropiedadValue;
    
    // Cálculo de Renta Vitalicia (estimación)
    // Usamos esperanza de vida aproximada para repartir el capital
    const lifeExpectancy = LIFE_EXPECTANCY_TABLE[relevantAge] || 15;
    const monthlyAnnuity = nudaPropiedadValue / (lifeExpectancy * 12);

    setResult({
      nudaPropiedadValue,
      usufructValue,
      oneTimePayment: nudaPropiedadValue,
      monthlyAnnuity,
      percentageUsed: percentage
    });
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    calculate();
  }, [inputs, percentages]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fadeIn">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-4">Configuración del Inmueble</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor de Mercado (€)</label>
            <div className="relative">
              <input
                type="number"
                value={inputs.marketValue}
                onChange={(e) => setInputs({ ...inputs, marketValue: Number(e.target.value) })}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="Ej: 300000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 mb-3">Beneficiarios</label>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setInputs({ ...inputs, isSinglePerson: true, age2: null })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  inputs.isSinglePerson ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                }`}
              >
                1 Persona
              </button>
              <button
                onClick={() => setInputs({ ...inputs, isSinglePerson: false, age2: inputs.age1 })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  !inputs.isSinglePerson ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
                }`}
              >
                2 Personas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Edad {inputs.isSinglePerson ? '' : 'Persona 1'}</label>
              <input
                type="number"
                min="65"
                max="100"
                value={inputs.age1}
                onChange={(e) => setInputs({ ...inputs, age1: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            {!inputs.isSinglePerson && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Edad Persona 2</label>
                <input
                  type="number"
                  min="65"
                  max="100"
                  value={inputs.age2 || 0}
                  onChange={(e) => setInputs({ ...inputs, age2: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-xl text-indigo-700 text-sm flex gap-3">
          <i className="fas fa-info-circle mt-0.5"></i>
          <p>
            El cálculo se basa en el usufructo vitalicio. En el caso de dos personas, se toma la edad del más joven para garantizar el derecho de ambos.
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-1">Valor Nuda Propiedad</p>
            <h3 className="text-4xl font-bold mb-6">
              {result ? formatCurrency(result.nudaPropiedadValue) : '€ 0,00'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-indigo-500/50">
              <div>
                <p className="text-indigo-200 text-xs mb-1">Porcentaje Aplicado</p>
                <p className="text-xl font-semibold">{result?.percentageUsed.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs mb-1">Valor Usufructo</p>
                <p className="text-xl font-semibold">{result ? formatCurrency(result.usufructValue) : '€ 0,00'}</p>
              </div>
            </div>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Opciones de Pago</h4>
          
          <div className="space-y-4">
            {/* Payment Option 1 */}
            <div className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-default group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Pago Único</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">RECOMENDADO</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {result ? formatCurrency(result.oneTimePayment) : '€ 0,00'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Capital inicial recibido de forma inmediata tras la firma.</p>
            </div>

            {/* Payment Option 2 */}
            <div className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-default">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Renta Vitalicia</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {result ? `${formatCurrency(result.monthlyAnnuity)} / mes` : '€ 0,00 / mes'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Estimado mensual basado en la esperanza de vida estadística.</p>
            </div>
          </div>

          <button className="w-full mt-6 bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
            <i className="fas fa-file-pdf"></i>
            Descargar Informe PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
