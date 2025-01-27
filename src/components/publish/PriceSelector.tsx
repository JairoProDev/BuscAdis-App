'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PriceInfo, PriceSelectorProps } from '@/types/publish'
import { CurrencyDollarIcon } from '@heroicons/react/24/outline'

const priceTypes = [
  { id: 'fixed', name: 'Precio fijo' },
  { id: 'negotiable', name: 'Negociable' },
  { id: 'contact', name: 'A convenir' },
];

const currencies = [
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];

export default function PriceSelector({ value, onChange }: PriceSelectorProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currencies[0]);
  const [priceType, setPriceType] = useState(priceTypes[0]);

  useEffect(() => {
    if (value) {
      setAmount(value.amount.toString());
      const foundCurrency = currencies.find(c => c.code === value.currency);
      if (foundCurrency) setCurrency(foundCurrency);
      const foundType = priceTypes.find(t => t.id === value.type);
      if (foundType) setPriceType(foundType);
    }
  }, [value]);

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
    if (newAmount) {
      onChange({
        amount: parseFloat(newAmount),
        currency: currency.code,
        type: priceType.id
      });
    }
  };

  const handleCurrencyChange = (newCurrency: typeof currencies[0]) => {
    setCurrency(newCurrency);
    if (amount) {
      onChange({
        amount: parseFloat(amount),
        currency: newCurrency.code,
        type: priceType.id
      });
    }
  };

  const handleTypeChange = (newType: typeof priceTypes[0]) => {
    setPriceType(newType);
    if (amount) {
      onChange({
        amount: parseFloat(amount),
        currency: currency.code,
        type: newType.id
      });
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-primary-700">
        Precio
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-primary-500 sm:text-sm">
              {currency.symbol}
            </span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className="pl-8 pr-12 py-3 w-full bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-primary-500 sm:text-sm">
              {currency.code}
            </span>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="grid grid-cols-3 gap-2">
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => handleCurrencyChange(c)}
              className={`px-4 py-3 rounded-xl border-2 transition-all text-center
                ${currency.code === c.code
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-primary-100 hover:border-primary-300 text-primary-600'
                }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Price Type Selector */}
      <div className="grid grid-cols-3 gap-3">
        {priceTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-3 rounded-xl border-2 transition-all text-center
              ${priceType.id === type.id
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-primary-100 hover:border-primary-300 text-primary-600'
              }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Preview */}
      {amount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-primary-50 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 p-1.5">
              <CurrencyDollarIcon className="w-full h-full text-primary-600" />
            </div>
            <div>
              <h4 className="font-medium text-primary-900">
                {currency.symbol}{parseFloat(amount).toLocaleString()}
              </h4>
              <p className="text-sm text-primary-600">
                {priceType.name} • {currency.name}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 