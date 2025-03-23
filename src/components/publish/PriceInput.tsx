import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';
import DynamicField from './DynamicField';

interface Price {
  amount: number;
  currency: string;
  type: 'fixed' | 'negotiable' | 'free';
}

interface PriceInputProps {
  value: Price;
  onChange: (price: Price) => void;
  currencies?: Array<{
    code: string;
    symbol: string;
    name: string;
  }>;
}

const DEFAULT_CURRENCIES = [
  { code: 'PEN', symbol: 'S/', name: 'Soles' },
  { code: 'USD', symbol: '$', name: 'Dólares' }
];

const PRICE_TYPES = [
  { id: 'fixed', label: 'Precio fijo', icon: CurrencyDollarIcon },
  { id: 'negotiable', label: 'Negociable', icon: TagIcon },
  { id: 'free', label: 'Gratis', icon: TagIcon }
];

export default function PriceInput({
  value,
  onChange,
  currencies = DEFAULT_CURRENCIES
}: PriceInputProps) {
  const [focused, setFocused] = useState(false);

  const handleAmountChange = (amount: number) => {
    Logger.debug(`Precio actualizado: ${amount} ${value.currency}`);
    onChange({ ...value, amount });
  };

  const handleCurrencyChange = (currency: string) => {
    Logger.debug(`Moneda actualizada: ${currency}`);
    onChange({ ...value, currency });
  };

  const handleTypeChange = (type: 'fixed' | 'negotiable' | 'free') => {
    Logger.debug(`Tipo de precio actualizado: ${type}`);
    onChange({
      ...value,
      type,
      amount: type === 'free' ? 0 : value.amount
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Tipo de precio */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de precio
        </label>
        <div className="grid grid-cols-3 gap-3">
          {PRICE_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id as Price['type'])}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  value.type === type.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo de precio */}
      {value.type !== 'free' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div className="relative">
            <DynamicField
              type="number"
              label="Precio"
              name="price"
              value={value.amount}
              onChange={handleAmountChange}
              onBlur={() => setFocused(false)}
              placeholder="0.00"
              required={value.type === 'fixed'}
              validation={{
                min: 0,
                max: 999999999
              }}
              helperText={
                value.type === 'negotiable'
                  ? 'Establece un precio de referencia'
                  : 'Ingresa el precio exacto'
              }
            />

            {/* Selector de moneda */}
            <div className="absolute right-0 top-8">
              <select
                value={value.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="h-12 pl-3 pr-8 border-l-2 border-gray-200 rounded-r-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                aria-label="Seleccionar moneda"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista previa del precio */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl"
          >
            <span className="text-sm text-gray-600">Vista previa:</span>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">
                {currencies.find(c => c.code === value.currency)?.symbol}{' '}
                {formatAmount(value.amount)}
              </span>
              {value.type === 'negotiable' && (
                <span className="block text-sm text-gray-500">(Negociable)</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mensaje para precio gratis */}
      {value.type === 'free' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl"
        >
          <TagIcon className="w-5 h-5" />
          <span>Este artículo será publicado como gratuito</span>
        </motion.div>
      )}
    </div>
  );
} 