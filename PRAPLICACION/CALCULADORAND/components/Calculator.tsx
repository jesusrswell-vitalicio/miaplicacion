
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
    isSinglePerson: true
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = () => {
    const relevantAge = inputs.isSinglePerson || inputs.age2 === null
      ? inputs.age1 
      : Math.min(inputs.age1, inputs.age2);

    const entry = percentages.find(p => p.age === relevantAge) || 
                  percentages.sort((a,b) => b.age - a.age).find(p => relevantAge >= p.age) ||
                  { percentage: 0 };

    const percentage = entry.percentage;
    const nudaPropiedadValue = (inputs.marketValue * percentage) / 100;
    const usufructValue = inputs.marketValue - nudaPropiedadValue;
    
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

  useEffect(() => {
    calculate();
  }, [inputs, percentages]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

  const handleDownloadPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const margin = 20;
    const corporateColor = '#a12d34';
    const greyColor = '#6b7280';

    // Header Branding
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

    // Main Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let y = 50;

    const addLine = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 50, y);
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
    doc.text('RESULTADOS DE LA ESTIMACIÓN', margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    addLine('Valor Nuda Propiedad', formatCurrency(result.nudaPropiedadValue));
    addLine('Valor del Usufructo', formatCurrency(result.usufructValue));
    addLine('Renta Vitalicia Mensual', `${formatCurrency(result.monthlyAnnuity)} / mes`);

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const disclaimerTitle = 'IMPORTANTE:';
    doc.text(disclaimerTitle, margin, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const disclaimer = "La valoración es solo orientativa. Para recibir un estudio gratuito, póngase en contacto con nosotros a través del Tlf. 663 040404 o bien a través de la pagina web, grupovitalicio.es. Estudios detallados gratuitos y sin compromiso.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
    doc.text(splitDisclaimer, margin, y);
    
    y += (splitDisclaimer.length * 6) + 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(corporateColor);
    doc.text('Teléfono: 663 040404', margin, y);
    y += 8;
    doc.text('Web: grupovitalicio.es', margin, y);

    doc.save(`estimacion-vitalicio-${Date.now()}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fadeIn">
      {/* Input Section */}
      <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">VALORACIÓN</h2>
          <div className="h-2 w-16 bg-[#a12d34] mt-2 rounded-full"></div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio de Mercado</label>
            <div className="relative">
              <input
                type="number"
                value={inputs.marketValue}
                onChange={(e) => setInputs({ ...inputs, marketValue: Number(e.target.value) })}
                className="w-full pl-6 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#a12d34]/10 focus:border-[#a12d34] transition-all outline-none font-bold text-xl text-slate-700"
                placeholder="Ej: 300000"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">€</span>
            </div>
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
          <p className="font-semibold mb-2">
            La valoración es solo orientativa. Para recibir un estudio gratuito, póngase en contacto con nosotros.
          </p>
          <div className="mt-4 flex flex-col items-center">
             <div className="text-4xl sm:text-4xl font-black tracking-tighter mb-1">
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
        <div className="bg-[#a12d34] text-white p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em] mb-4">Capital Nuda Propiedad</p>
            <h3 className="text-5xl sm:text-6xl font-black mb-12 tracking-tighter">
              {result ? formatCurrency(result.nudaPropiedadValue) : '€ 0,00'}
            </h3>
            
            <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/20">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Valor Usufructo</p>
                <p className="text-2xl sm:text-3xl font-black">{result ? formatCurrency(result.usufructValue) : '€ 0,00'}</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Renta Mensual Estimada</p>
                <p className="text-2xl sm:text-3xl font-black">{result ? formatCurrency(result.monthlyAnnuity) : '€ 0,00'}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <i className="fas fa-home text-[12rem]"></i>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-[#a12d34]/30 transition-all">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-5">Pago Único</span>
              <div className="text-3xl font-black text-slate-800 mb-3">
                {result ? formatCurrency(result.oneTimePayment) : '€ 0,00'}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Cobro total del capital en la firma de la escritura pública ante notario.
              </p>
            </div>
            <a 
              href="https://grupovitalicio.es" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 py-4 px-6 bg-slate-100 text-[#a12d34] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#a12d34] hover:text-white transition-all flex items-center justify-center gap-3"
            >
              Solicitar Estudio <i className="fas fa-arrow-right text-[10px]"></i>
            </a>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col justify-between group hover:border-[#a12d34]/30 transition-all">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-5">Renta Mensual</span>
              <div className="text-3xl font-black text-[#a12d34] mb-3">
                {result ? `${formatCurrency(result.monthlyAnnuity)}` : '€ 0,00'}
                <span className="text-sm font-normal text-slate-400 ml-1">/mes</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Reciba una renta mensual garantizada de por vida sin perder el uso de su casa.
              </p>
            </div>
            <a 
              href="https://grupovitalicio.es/renta-vitalicia/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 py-4 px-6 bg-[#a12d34] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-900/10"
            >
              Ver Plan Rentas <i className="fas fa-calendar text-[10px]"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
