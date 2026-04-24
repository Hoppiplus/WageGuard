
import React, { useState } from 'react';
import { Calculator, Calendar, AlertCircle, ChevronLeft, Coins, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const GratuityCalculator: React.FC = () => {
  const { t, dir } = useLanguage();
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<string>('');
  const [tenureStr, setTenureStr] = useState('');

  const calculate = () => {
    if (!basicSalary || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = diffDays / 365;

    let gratuity = 0;
    let explanation = '';

    if (years < 1) {
      gratuity = 0;
      explanation = "Less than 1 year of service: No gratuity is entitled.";
    } else if (years <= 5) {
      const dailyWage = basicSalary / 30;
      gratuity = dailyWage * 21 * years;
      explanation = `1-5 Years: 21 days of basic salary per year.\n(${years.toFixed(2)} years × 21 days × AED ${dailyWage.toFixed(2)})`;
    } else {
      const dailyWage = basicSalary / 30;
      const first5Years = dailyWage * 21 * 5;
      const excessYears = years - 5;
      const subsequentYears = dailyWage * 30 * excessYears;
      gratuity = first5Years + subsequentYears;
      explanation = `First 5 years: 21 days/year.\nSubsequent ${excessYears.toFixed(2)} years: 30 days/year.`;
    }

    const twoYearsSalary = basicSalary * 24;
    if (gratuity > twoYearsSalary) {
        gratuity = twoYearsSalary;
        explanation += "\n(Capped at 2 years total salary)";
    }

    setResult(gratuity);
    setBreakdown(explanation);
    setTenureStr(`${years.toFixed(2)} Years`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12" dir={dir}>
      <div className="flex items-center space-x-4 mb-2">
        <Link to="/" className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-royal-900 hover:bg-royal-50 transition shadow-sm">
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('tool_gratuity')}</h1>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8 relative overflow-hidden">
        
        {/* Abstract Gold Background for Wealth Feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-wage-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-60 pointer-events-none"></div>

        <div className="bg-wage-50 border border-wage-100 rounded-2xl p-4 mb-8 flex items-start relative z-10">
            <Coins className="w-5 h-5 text-wage-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-wage-900 leading-relaxed font-medium">
                Calculated based on <strong>Decree-Law No. 33</strong>. Use your <strong>Basic Salary</strong> only (do not include allowances).
            </p>
        </div>

        <div className="space-y-6 relative z-10">
            <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">{t('calc_basic_salary')}</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-wage-600 font-black text-sm">AED</span>
                    <input 
                        type="number" 
                        value={basicSalary || ''}
                        onChange={(e) => setBasicSalary(Number(e.target.value))}
                        className="w-full pl-14 p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-wage-400 focus:border-wage-400 outline-none transition font-bold text-lg text-slate-900 shadow-sm"
                        placeholder="e.g. 5000"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">{t('calc_start_date')}</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pl-12 p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-wage-400 outline-none transition font-medium text-slate-700"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">{t('calc_end_date')}</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pl-12 p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-wage-400 outline-none transition font-medium text-slate-700"
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={calculate}
                className="w-full bg-gradient-to-r from-wage-500 to-wage-600 text-white font-bold py-5 rounded-2xl shadow-lg shadow-wage-500/30 hover:shadow-xl hover:scale-[1.01] transition-all transform active:scale-95 flex items-center justify-center text-lg"
            >
                <Calculator className="w-5 h-5 mr-2" /> {t('calc_calculate')}
            </button>
        </div>

        {result !== null && (
            <div className="mt-10 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8 relative">
                    <div className="inline-block p-3 bg-wage-100 rounded-full mb-3 shadow-inner">
                        <TrendingUp className="w-6 h-6 text-wage-600" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t('calc_result')}</p>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                        <span className="text-2xl text-slate-400 font-medium mr-1">AED</span>
                        {result.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <div className="inline-block bg-slate-100 px-3 py-1 rounded-full mt-3">
                         <p className="text-slate-500 font-bold text-xs">{t('calc_tenure')}: {tenureStr}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-wage-400"></div>
                    <h4 className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-wide">Breakdown</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed font-medium">
                        {breakdown}
                    </p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default GratuityCalculator;
