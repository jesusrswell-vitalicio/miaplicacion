
import React, { useState, useEffect } from 'react';
import { PercentageEntry, CalculationInputs, CalculationResult } from '../types';
import { LIFE_EXPECTANCY_TABLE } from '../constants';
import { jsPDF } from 'jspdf';

interface CalculatorProps {
  percentages: PercentageEntry[];
}
const Calculator: React.FC<CalculatorProps> = ({ percentages }) => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    marketValue: 250000,
    age1: 70,
    age2: null,
    isSinglePerson: true,
    initialPayment: 0
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [appliedIncrement, setAppliedIncrement] = useState(10);

  const calculate = () => {
    const relevantAge = inputs.isSinglePerson || inputs.age2 === null
      ? inputs.age1 
      : Math.min(inputs.age1, inputs.age2);

    const entry = percentages.find(p => p.age === relevantAge) || 
                  percentages.sort((a,b) => b.age - a.age).find(p => relevantAge >= p.age) ||
                  { percentage: 0 };

    const percentage = entry.percentage;
    const nudaPropiedadValue = (inputs.marketValue * percentage) / 100;
    
    // Cálculo de divisores por tramos de edad (según lógica corporativa)
    let divisorMeses = 1;
    if (relevantAge >= 65 && relevantAge <= 82) divisorMeses = (90 - relevantAge) * 12;
    else if (relevantAge >= 83 && relevantAge <= 84) divisorMeses = (91 - relevantAge) * 12;
    else if (relevantAge >= 85 && relevantAge <= 86) divisorMeses = (92 - relevantAge) * 12;
    else if (relevantAge >= 87 && relevantAge <= 88) divisorMeses = (93 - relevantAge) * 12;
    else if (relevantAge === 89) divisorMeses = (94 - relevantAge) * 12;
    else if (relevantAge === 90) divisorMeses = (95 - relevantAge) * 12;
    else if (relevantAge >= 91 && relevantAge <= 97) divisorMeses = Math.max(1, 97 - relevantAge) * 12;
    else {
      const lifeExpectancy = LIFE_EXPECTANCY_TABLE[relevantAge] || 5;
      divisorMeses = lifeExpectancy * 12;
    }

    // Renta Vitalicia Completa (sin entrada) - Siempre 10%
    const baseConIncrementoFull = nudaPropiedadValue * 1.10;
    const monthlyAnnuity = baseConIncrementoFull / divisorMeses;

    // Lógica de incremento variable para Renta Mixta según tramos de entrada
    let mixedIncrement = 0.10; // Default 10% (Hasta 1.000€)
    const payment = inputs.initialPayment;

    if (payment > 100000) mixedIncrement = 0.02; // Más de 100.000€: 2%
    else if (payment > 50000) mixedIncrement = 0.04; // 50.001€ - 100.000€: 4%
    else if (payment > 25000) mixedIncrement = 0.05; // 25.001€ - 50.000€: 5%
    else if (payment > 20000) mixedIncrement = 0.055; // 20.001€ - 25.000€: 5,5%
    else if (payment > 15000) mixedIncrement = 0.06; // 15.001€ - 20.000€: 6%
    else if (payment > 10000) mixedIncrement = 0.065; // 10.001€ - 15.000€: 6,5%
    else if (payment >= 1000) mixedIncrement = 0.07; // 1.000€ - 10.000€: 7%
    
    setAppliedIncrement(mixedIncrement * 100);

    // Cálculo Mixto: (Nuda - Entrada) * (1 + Incremento variable) / Meses
    const capitalRestante = Math.max(0, nudaPropiedadValue - inputs.initialPayment);
    const baseConIncrementoMixed = capitalRestante * (1 + mixedIncrement);
    const mixedAnnuity = baseConIncrementoMixed / divisorMeses;

    setResult({
      nudaPropiedadValue,
      usufructValue: inputs.marketValue - nudaPropiedadValue,
      oneTimePayment: nudaPropiedadValue,
      monthlyAnnuity,
      mixedAnnuity,
      percentageUsed: percentage
    });
  };

  useEffect(() => {
    calculate();
  }, [inputs, percentages]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(Math.round(val));
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const margin = 20;
    const corporateColor = '#a12d34';
    const greyColor = '#6b7280';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(greyColor);
    doc.text('GRUPO', margin, 25);
    doc.setFontSize(24);
    doc.setTextColor(corporateColor);
    doc.text('VITALICIO', margin + 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('VALORACIÓN ORIENTATIVA', margin, 32);

    doc.setDrawColor(corporateColor);
    doc.setLineWidth(1);
    doc.line(margin, 38, 190, 38);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let y = 50;

    const addLine = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 85, y); 
      y += 10;
    };

    addLine('Fecha', new Date().toLocaleDateString('es-ES'));
    addLine('Valor de Mercado', formatCurrency(inputs.marketValue));
    addLine('Beneficiarios', inputs.isSinglePerson ? '1 persona' : '2 personas');
    addLine('Edad de referencia', `${inputs.isSinglePerson ? inputs.age1 : Math.min(inputs.age1, inputs.age2 || 0)} años`);
    
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(corporateColor);
    doc.text('OPCIONES DE VALORACIÓN', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    addLine('Opción 1: Pago Único Total', formatCurrency(result.oneTimePayment));
    addLine('Opción 2: Renta Vitalicia Pura', `${formatCurrency(result.monthlyAnnuity)} / mes`);
    
    if (inputs.initialPayment > 0) {
      addLine('Opción 3: Mixta (Entrada + Renta)', `${formatCurrency(inputs.initialPayment)} + ${formatCurrency(result.mixedAnnuity)} / mes`);
      doc.setFontSize(9);
      doc.setTextColor(greyColor);
      doc.setFont('helvetica', 'italic');
      doc.text(`* Incluye bonificación de incremento reducido al ${appliedIncrement.toString().replace('.', ',')}%`, margin, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
    }

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('IMPORTANTE:', margin, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const disclaimer = "La valoración es solo orientativa. Para recibir un estudio gratuito, póngase en contacto con nosotros a través del Tlf. 663 04 04 04 o bien a través de la pagina web, grupovitalicio.es. Estudios detallados gratuitos y sin compromiso.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, margin, y);
    
    y += (splitDisclaimer.length * 6) + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(corporateColor);
    doc.text('Teléfono: 663 04 04 04', margin, y);
    y += 8;
    doc.text('Web: grupovitalicio.es', margin, y);

    doc.save(`estimacion-vitalicio-${Date.now()}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fadeIn">
      {/* Input Section */}
      <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">VALORACIÓN</h2>
          <div className="h-2 w-16 bg-[#a12d34] mt-2 rounded-full"></div>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio de Mercado</label>
            <div className="relative">
             <input
                 type="text"
                 value={inputs.marketValue ? new Intl.NumberFormat('es-ES').format(inputs.marketValue) : ''}
                 onChange={(e) => {
                                   const rawValue = e.target.value.replace(/\D/g, '');
                                   setInputs({ ...inputs, marketValue: Number(rawValue) });
                                  }}
                className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 focus:border-[#a12d34] transition-all outline-none font-bold text-xl text-slate-700"
                placeholder="Ej: 400.000"
             />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">€</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Capital Inicial (Entrada)</label>
            <div className="relative">
             <input
                 type="text"
                 value={inputs.initialPayment ? new Intl.NumberFormat('es-ES').format(inputs.initialPayment) : ''}
                 onChange={(e) => {
                                   const rawValue = e.target.value.replace(/\D/g, '');
                                   setInputs({ ...inputs, initialPayment: Number(rawValue) });
                                  }}
                className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 focus:border-[#a12d34] transition-all outline-none font-bold text-xl text-slate-700"
                placeholder="Opcional: Introduzca entrada"
             />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">€</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">
              {inputs.initialPayment > 0 ? (
                <span className="text-[#a12d34]">Bonificación aplicada: Coeficiente reducido al {appliedIncrement.toString().replace('.', ',')}%</span>
              ) : "Introduzca una entrada para reducir el coeficiente de incremento."}
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Beneficiarios</label>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setInputs({ ...inputs, isSinglePerson: true, age2: null })}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  inputs.isSinglePerson ? 'bg-white shadow-md text-[#a12d34]' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                1 Persona
              </button>
              <button
                onClick={() => setInputs({ ...inputs, isSinglePerson: false, age2: inputs.age1 })}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  !inputs.isSinglePerson ? 'bg-white shadow-md text-[#a12d34]' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                2 Personas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edad {inputs.isSinglePerson ? '' : 'Titular 1'}</label>
              <input
                type="number"
                min="65"
                max="100"
                value={inputs.age1}
                onChange={(e) => setInputs({ ...inputs, age1: Number(e.target.value) })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all font-bold text-slate-700 text-lg"
              />
            </div>
            {!inputs.isSinglePerson && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edad Titular 2</label>
                <input
                  type="number"
                  min="65"
                  max="100"
                  value={inputs.age2 || 0}
                  onChange={(e) => setInputs({ ...inputs, age2: Number(e.target.value) })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 outline-none transition-all font-bold text-slate-700 text-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-sm leading-relaxed text-center">
          <div className="flex flex-col items-center">
             <div className="text-3xl sm:text-4xl font-black tracking-tighter mb-1">
               <span className="text-[#a12d34]">663</span> <span className="text-black">04 04 04</span>
             </div>
             <div className="text-xl sm:text-2xl font-bold text-[#a12d34] tracking-wider uppercase">
               grupovitalicio.es
             </div>
             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Estudios detallados gratuitos y sin compromiso</p>
          </div>
        </div>
        
        <button 
          onClick={handleDownloadPDF}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] uppercase text-xs tracking-widest"
        >
          <i className="fas fa-file-pdf"></i>
          Descargar Resultados PDF
        </button>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-7 space-y-8">
        {/* Main Result: Nuda Propiedad Value */}
        <div className="bg-[#a12d34] text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em] mb-4">Capital Nuda Propiedad (Pago Único)</p>
            <h3 className="text-5xl sm:text-6xl font-black mb-8 tracking-tighter">
              {result ? formatCurrency(result.nudaPropiedadValue) : '€ 0,00'}
            </h3>
            <div className="h-1 w-20 bg-white/20 mb-8 rounded-full"></div>
            <p className="text-white/80 text-sm font-medium leading-relaxed max-w-md">
              Capital total estimado que el cliente recibiría en un único pago al formalizar la operación.
            </p>
          </div>
          {/* SVG Personalizado con Casa y Corazón (Mitad de tamaño anterior) */}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <svg className="w-24 h-24 lg:w-32 lg:h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              {/* Contorno de la casa */}
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              {/* Corazón más grande y central sin V */}
              <path d="M12 18.5 c -2.5 -2.5 -5 -4.5 -5 -7 c 0 -1.5 1.1 -2.5 2.5 -2.5 c 0.8 0 1.6 0.4 2 1.1 c 0.4 -0.7 1.2 -1.1 2 -1.1 c 1.4 0 2.5 1 2.5 2.5 c 0 2.5 -2.5 4.5 -5 7 z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Renta Vitalicia Pura */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-[#a12d34]/30 transition-all">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-5">Renta Mensual Pura</span>
              <div className="text-3xl font-black text-slate-800 mb-3">
                {result ? formatCurrency(result.monthlyAnnuity) : '€ 0,00'}
                <span className="text-sm font-normal text-slate-400 ml-1">/mes</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sin pago inicial. Se convierte todo el capital de la nuda propiedad en mensualidades (+10% de incremento corporativo).
              </p>
            </div>
            <a 
              href="https://grupovitalicio.es" 
              target="_blank" 
              className="mt-8 py-4 px-6 bg-slate-100 text-[#a12d34] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#a12d34] hover:text-white transition-all flex items-center justify-center gap-3"
            >
              Más info <i className="fas fa-arrow-right text-[10px]"></i>
            </a>
          </div>

          {/* Card: Renta Mixta (Entrada + Renta) */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-[#a12d34]/30 transition-all ring-4 ring-[#a12d34]/5">
            <div>
              <div className="flex justify-between items-start mb-5">
                <span className="text-[10px] font-black text-[#a12d34] uppercase tracking-[0.2em] block">Opción Mixta (Bonificada)</span>
                {inputs.initialPayment > 0 && (
                  <span className="bg-[#a12d34]/10 text-[#a12d34] text-[9px] font-bold px-2 py-1 rounded-md">
                    +{appliedIncrement.toString().replace('.', ',')}% INC.
                  </span>
                )}
              </div>
              <div className="space-y-2 mb-3">
                <div className="text-xl font-bold text-slate-500">
                  {inputs.initialPayment > 0 ? formatCurrency(inputs.initialPayment) : '--- €'} <span className="text-xs font-medium uppercase tracking-tighter">Entrada</span>
                </div>
                <div className="text-4xl font-black text-[#a12d34]">
                  {result ? formatCurrency(result.mixedAnnuity) : '€ 0,00'}
                  <span className="text-sm font-normal text-slate-400 ml-1">/mes</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Combine un pago inicial con una renta mensual. A mayor entrada, aplicamos un menor coeficiente de incremento.
              </p>
            </div>
            <a 
              href="https://grupovitalicio.es" 
              target="_blank" 
              className="mt-8 py-4 px-6 bg-[#a12d34] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-900/20"
            >
               Solicitar Estudio <i className="fas fa-paper-plane text-[10px]"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
