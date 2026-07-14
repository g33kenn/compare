import React, { useState, useMemo } from 'react';
import { Scale, AlertTriangle, CheckCircle2, TrendingDown, Info, PackageOpen, Sun, Moon, RotateCcw } from 'lucide-react';

const UNIT_DICTIONARY = {
  g: { type: 'mass', multiplier: 1, displayBase: 100, displayLabel: '100g' },
  kg: { type: 'mass', multiplier: 1000, displayBase: 100, displayLabel: '100g' },
  ml: { type: 'volume', multiplier: 1, displayBase: 100, displayLabel: '100ml' },
  L: { type: 'volume', multiplier: 1000, displayBase: 100, displayLabel: '100ml' },
  unit: { type: 'discrete', multiplier: 1, displayBase: 1, displayLabel: 'unit' }
};

const formatCAD = (value) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value);
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [productA, setProductA] = useState({ name: 'Product A', price: '', qty: '', unit: 'g' });
  const [productB, setProductB] = useState({ name: 'Product B', price: '', qty: '', unit: 'g' });

  const handleReset = () => {
    setProductA({ name: 'Product A', price: '', qty: '', unit: 'g' });
    setProductB({ name: 'Product B', price: '', qty: '', unit: 'g' });
  };

  const handleInputChange = (productKey, field, value) => {
    if (field === 'price' || field === 'qty') {
      if (value !== '' && Number(value) < 0) return;
    }
    
    if (productKey === 'A') {
      setProductA(prev => ({ ...prev, [field]: value }));
    } else {
      setProductB(prev => ({ ...prev, [field]: value }));
    }
  };

  const analysis = useMemo(() => {
    const isAValid = Number(productA.price) > 0 && Number(productA.qty) > 0;
    const isBValid = Number(productB.price) > 0 && Number(productB.qty) > 0;
    
    const typeA = UNIT_DICTIONARY[productA.unit].type;
    const typeB = UNIT_DICTIONARY[productB.unit].type;
    const isComparable = typeA === typeB;

    let result = {
      isReady: isAValid && isBValid,
      isComparable,
      winner: null,
      savingsPercent: 0,
      priceA_normalized: 0,
      priceB_normalized: 0,
      displayLabel: '',
      error: null
    };

    if (result.isReady && !isComparable) {
      result.error = `Incompatible units: Cannot compare ${typeA} with ${typeB}.`;
      return result;
    }

    if (result.isReady && isComparable) {
      const defA = UNIT_DICTIONARY[productA.unit];
      const defB = UNIT_DICTIONARY[productB.unit];

      const baseQtyA = Number(productA.qty) * defA.multiplier;
      const baseQtyB = Number(productB.qty) * defB.multiplier;

      const rawPriceA = Number(productA.price) / baseQtyA;
      const rawPriceB = Number(productB.price) / baseQtyB;

      result.priceA_normalized = rawPriceA * defA.displayBase;
      result.priceB_normalized = rawPriceB * defB.displayBase;
      result.displayLabel = defA.displayLabel;

      if (result.priceA_normalized < result.priceB_normalized) {
        result.winner = 'A';
        result.savingsPercent = ((result.priceB_normalized - result.priceA_normalized) / result.priceB_normalized) * 100;
      } else if (result.priceB_normalized < result.priceA_normalized) {
        result.winner = 'B';
        result.savingsPercent = ((result.priceA_normalized - result.priceB_normalized) / result.priceA_normalized) * 100;
      } else {
        result.winner = 'tie';
      }
    }

    return result;
  }, [productA, productB]);

  const renderProductCard = (productKey, product) => {
    const isWinner = analysis.winner === productKey;
    const isLoser = analysis.winner && analysis.winner !== 'tie' && !isWinner;
    
    let borderClass = 'border-slate-200 dark:border-slate-800 shadow-sm';
    if (isWinner) borderClass = 'border-green-500 dark:border-green-500 shadow-green-100 dark:shadow-green-900/20 shadow-md ring-2 ring-green-500/20 dark:ring-green-500/40';
    if (isLoser) borderClass = 'border-red-200 dark:border-red-900/30 shadow-sm opacity-80';

    return (
      <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 ${borderClass}`}>
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            value={product.name}
            onChange={(e) => handleInputChange(productKey, 'name', e.target.value)}
            className="text-xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-colors w-2/3 dark:text-white"
          />
          {isWinner && <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> BEST VALUE</span>}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={product.price}
                onChange={(e) => handleInputChange(productKey, 'price', e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 500"
                value={product.qty}
                onChange={(e) => handleInputChange(productKey, 'qty', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Unit</label>
              <select
                value={product.unit}
                onChange={(e) => handleInputChange(productKey, 'unit', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <optgroup label="Mass" className="dark:bg-slate-800">
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                </optgroup>
                <optgroup label="Volume" className="dark:bg-slate-800">
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                </optgroup>
                <optgroup label="Discrete" className="dark:bg-slate-800">
                  <option value="unit">unit(s)</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {Number(product.price) > 0 && Number(product.qty) > 0 && (
           <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Normalized Unit Price</p>
             <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
               {formatCAD((Number(product.price) / (Number(product.qty) * UNIT_DICTIONARY[product.unit].multiplier)) * UNIT_DICTIONARY[product.unit].displayBase)}
               <span className="text-base text-slate-500 dark:text-slate-400 font-normal"> / {UNIT_DICTIONARY[product.unit].displayLabel}</span>
             </p>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen transition-colors duration-300 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          
          {/* Top Actions Bar */}
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm font-medium text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="space-y-8">
            <header className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-2xl mb-2 shadow-lg shadow-blue-500/30">
                <Scale className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Value Compare</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">Enter two products below to instantly calculate the true unit price and discover the best value.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {renderProductCard('A', productA)}
              
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 dark:bg-slate-800 text-white rounded-full items-center justify-center font-black text-lg border-4 border-slate-100 dark:border-slate-950 z-10 shadow-sm">
                VS
              </div>
              
              {renderProductCard('B', productB)}
            </div>

            {/* Results / Feedback Banner */}
            <div className="rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {!analysis.isReady && (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <PackageOpen className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
                  <p>Enter price and quantity for both products to see the comparison.</p>
                </div>
              )}

              {analysis.isReady && analysis.error && (
                <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-400 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-red-600 dark:text-red-500" />
                  <div>
                    <h3 className="font-bold text-lg text-red-900 dark:text-red-300">Comparison Error</h3>
                    <p>{analysis.error}</p>
                    <p className="text-sm mt-2 opacity-80">Please ensure both items use the same measurement type (e.g., both Mass or both Volume).</p>
                  </div>
                </div>
              )}

              {analysis.isReady && !analysis.error && analysis.winner && analysis.winner !== 'tie' && (
                <div className="p-6 md:p-8 bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/30 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30">
                    <TrendingDown className="w-8 h-8" />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-1">
                      {analysis.winner === 'A' ? productA.name : productB.name} is the better deal!
                    </h2>
                    <p className="text-green-700 dark:text-green-400 text-lg">
                      You save <span className="font-bold">{analysis.savingsPercent.toFixed(1)}%</span> by choosing this option.
                    </p>
                  </div>
                </div>
              )}

              {analysis.isReady && !analysis.error && analysis.winner === 'tie' && (
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 flex items-center gap-4 border-b border-blue-100 dark:border-blue-900/30">
                  <Info className="w-6 h-6 shrink-0 text-blue-600 dark:text-blue-400" />
                  <p className="font-medium text-lg">Both products offer the exact same value. It's a tie!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}