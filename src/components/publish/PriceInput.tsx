// src/components/publish/PriceInput.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Logger } from '@/services/logging.service'; // Asumiendo que existe

// Define la estructura de datos esperada (ajustada)
interface PriceData {
  amount?: number | null;
  currency?: 'PEN' | 'USD' | null;
  negotiable?: boolean | null;
}

interface PriceInputProps {
  initialValue?: PriceData; // Cambiado de value a initialValue
  onChange: (price: PriceData) => void; // Notifica cambios al padre
  currencies?: Array<{ code: string; symbol: string; name: string }>;
  className?: string;
}

const DEFAULT_CURRENCIES = [
  { code: 'PEN', symbol: 'S/', name: 'Soles' },
  { code: 'USD', symbol: '$', name: 'Dólares' },
  // { code: 'EUR', symbol: '€', name: 'Euros' } // Puedes añadir más si es necesario
];

// Helper para formatear moneda localmente (o usar uno global)
const PriceInput: React.FC<PriceInputProps> = ({
  initialValue: value, // Renombramos internamente para no cambiar todo el código
  onChange,
  currencies = DEFAULT_CURRENCIES,
  className = ''
}) => {
  // Estado local para manejar los inputs, inicializado desde props
  const [internalAmount, setInternalAmount] = useState<string>(value?.amount?.toString() || '');
  const [internalCurrency, setInternalCurrency] = useState<'PEN' | 'USD' | null>(value?.currency || 'PEN');
  const [isNegotiable, setIsNegotiable] = useState<boolean>(value?.negotiable || false);
  const [isFree, setIsFree] = useState<boolean>(value?.amount === 0 && !value?.negotiable);

   // Sincronizar estado interno si las props cambian desde fuera
   useEffect(() => {
    setInternalAmount(value?.amount?.toString() || '');
    setInternalCurrency(value?.currency || 'PEN');
    setIsNegotiable(value?.negotiable || false);
    setIsFree(value?.amount === 0 && !value?.negotiable);
  }, [value]);


  // Notificar al padre cuando cambie cualquier parte del precio
  const notifyChange = useCallback((newAmountStr: string, newCurrency: string | null, newNegotiable: boolean, newFree: boolean) => {
      let finalAmount: number | null = null;
      if (!newFree) {
          const parsedAmount = parseFloat(newAmountStr);
          finalAmount = isNaN(parsedAmount) ? null : parsedAmount; // null si no es número válido
      } else {
          finalAmount = 0; // Si es gratis, el monto es 0
      }

      onChange({
          amount: finalAmount,
          currency: newFree ? null : (newCurrency as 'PEN' | 'USD' | null), // Sin moneda si es gratis
          negotiable: newFree ? false : newNegotiable, // No negociable si es gratis
      });
      try {
        Logger.debug('Price changed', { amount: finalAmount, currency: newCurrency, negotiable: newNegotiable, free: newFree });
      } catch (e) {
        // Silently fail if logger throws an error
        console.error('Logging error:', (e as Error).message);
      }
  }, [onChange]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const amountStr = e.target.value;
    setInternalAmount(amountStr);
    // No notificar hasta onBlur o similar para evitar updates en cada tecla
  }, []);

   const handleAmountBlur = useCallback(() => {
      // Notificar al padre al perder el foco
      notifyChange(internalAmount, internalCurrency, isNegotiable, isFree);
  }, [internalAmount, internalCurrency, isNegotiable, isFree, notifyChange]);


  const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value as 'PEN' | 'USD' | null;
    setInternalCurrency(currency);
    notifyChange(internalAmount, currency, isNegotiable, isFree);
  }, [internalAmount, isNegotiable, isFree, notifyChange]);

  const handleNegotiableToggle = useCallback(() => {
    const newNegotiable = !isNegotiable;
    setIsNegotiable(newNegotiable);
    setIsFree(false); // No puede ser negociable y gratis a la vez
    notifyChange(internalAmount, internalCurrency, newNegotiable, false);
  }, [isNegotiable, internalAmount, internalCurrency, notifyChange]);

    const handleFreeToggle = useCallback(() => {
        const newFree = !isFree;
        setIsFree(newFree);
        setIsNegotiable(false); // No puede ser gratis y negociable
        setInternalAmount(newFree ? '0' : ''); // Poner 0 si es gratis, limpiar si no
        notifyChange(newFree ? '0' : internalAmount, internalCurrency, false, newFree);
    }, [isFree, internalAmount, internalCurrency, notifyChange]);

  const currentSymbol = currencies.find(c => c.code === internalCurrency)?.symbol || '';

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Precio</label>
      <div className="grid grid-cols-1 gap-3 items-end">
         {/* Input Amount y Currency */}
         <div className="relative">
            <label htmlFor="amount" className="sr-only">Monto</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               {/* Icono dinámico basado en moneda */}
               <span className="text-gray-500 dark:text-gray-400 sm:text-sm">{currentSymbol || '$'}</span>
            </div>
            <input
                type="number"
                name="amount"
                id="amount"
                value={internalAmount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur} // Notificar cambio en blur
                className={`w-full pl-10 pr-28 py-2 bg-white dark:bg-gray-700 rounded-lg border text-gray-900 dark:text-gray-100 ${isFree ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400'} transition-all`}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isFree} // Deshabilitar si es gratis
                aria-describedby="price-currency"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
                <label htmlFor="currency" className="sr-only">Moneda</label>
                <select
                    id="currency"
                    name="currency"
                    value={internalCurrency ?? ''}
                    onChange={handleCurrencyChange}
                    className={`h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-600 dark:text-gray-300 ${isFree ? 'cursor-not-allowed' : 'focus:border-primary-500 dark:focus:border-primary-400 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400'} rounded-md`}
                    disabled={isFree}
                >
                    {currencies.map(c => (
                        <option key={c.code} value={c.code}>{`${c.symbol} ${c.code}`}</option>
                    ))}
                </select>
            </div>
         </div>

         {/* Controles compactos */}
         <div className="flex items-center justify-between">
           <div className="text-xs text-gray-500 dark:text-gray-400 italic">
             {isFree ? 'Se mostrará como Gratis' : (isNegotiable ? 'Precio base negociable' : 'Precio fijo')}
           </div>
           <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
             <span className="mx-2 text-gray-400">|</span>
             <input type="checkbox" checked={isNegotiable} onChange={handleNegotiableToggle} className="h-4 w-4" disabled={isFree} /> Negociable
           </label>
         </div>
      </div>
    </div>
  );
};

export default PriceInput;