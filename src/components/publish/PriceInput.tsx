import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';
import DynamicField from './DynamicField';
import { PriceData } from '@/contexts/PublicationContext';

interface PriceInputProps {
  value?: PriceData;
  onChange: (price: PriceData) => void;
  currencies?: Array<{
    code: string;
    symbol: string;
    name: string;
  }>;
  className?: string;
}

const DEFAULT_CURRENCIES = [
  { code: 'PEN', symbol: 'S/', name: 'Soles' },
  { code: 'USD', symbol: '$', name: 'Dólares' },
  { code: 'EUR', symbol: '€', name: 'Euros' }
];

const PRICE_TYPES = [
  { id: 'fixed', label: 'Precio fijo', icon: CurrencyDollarIcon },
  { id: 'negotiable', label: 'Negociable', icon: TagIcon },
  { id: 'free', label: 'Gratis', icon: TagIcon },
  { id: 'exchange', label: 'Intercambio', icon: CurrencyDollarIcon }
];

const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  currencies = DEFAULT_CURRENCIES,
  className = ''
}) => {
  const [price, setPrice] = useState<PriceData>(value || {
    amount: 0,
    currency: 'PEN',
    type: 'fixed'
  });

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    const updatedPrice = { ...price, amount };
    setPrice(updatedPrice);
    onChange(updatedPrice);
    Logger.debug('Price amount changed', { amount });
  }, [price, onChange]);

  const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value;
    const updatedPrice = { ...price, currency };
    setPrice(updatedPrice);
    onChange(updatedPrice);
    Logger.debug('Currency changed', { currency });
  }, [price, onChange]);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    const updatedPrice = { ...price, type };
    setPrice(updatedPrice);
    onChange(updatedPrice);
    Logger.debug('Price type changed', { type });
  }, [price, onChange]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isPriceDisabled = price.type === 'free' || price.type === 'exchange';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tipo de precio */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de precio
        </label>
        <div className="grid grid-cols-4 gap-3">
          {PRICE_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id as PriceData['type'])}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  price.type === type.id
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
      {!isPriceDisabled && (
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
              value={price.amount}
              onChange={handleAmountChange}
              onBlur={() => setFocused(false)}
              placeholder="0.00"
              required={price.type === 'fixed'}
              validation={{
                min: 0,
                max: 999999999
              }}
              helperText={
                price.type === 'negotiable'
                  ? 'Establece un precio de referencia'
                  : 'Ingresa el precio exacto'
              }
            />

            {/* Selector de moneda */}
            <div className="absolute right-0 top-8">
              <select
                value={price.currency}
                onChange={handleCurrencyChange}
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
                {currencies.find(c => c.code === price.currency)?.symbol}{' '}
                {formatAmount(price.amount)}
              </span>
              {price.type === 'negotiable' && (
                <span className="block text-sm text-gray-500">(Negociable)</span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mensaje para precio gratis */}
      {price.type === 'free' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl"
        >
          <TagIcon className="w-5 h-5" />
          <span>Este artículo será publicado como gratuito</span>
        </motion.div>
      )}

      {price.type === 'exchange' && (
        <div className="bg-blue-50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Intercambio
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Has marcado este artículo para intercambio. Puedes especificar qué buscas en la descripción.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceInput; 