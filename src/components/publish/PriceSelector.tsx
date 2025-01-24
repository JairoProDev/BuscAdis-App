'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PriceInfo, CategoryConfig } from '@/types/publish'
import { 
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'

interface PriceSelectorProps {
  value: PriceInfo
  onChange: (price: PriceInfo) => void
  categoryConfig: CategoryConfig
  className?: string
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'COP', symbol: '$', name: 'Peso colombiano' }
]

const periods = [
  { value: 'hour', label: 'Por hora' },
  { value: 'day', label: 'Por día' },
  { value: 'week', label: 'Por semana' },
  { value: 'month', label: 'Por mes' },
  { value: 'year', label: 'Por año' }
]

export default function PriceSelector({
  value,
  onChange,
  categoryConfig,
  className = ''
}: PriceSelectorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleAmountChange = (amount: number) => {
    onChange({
      ...value,
      amount: Math.max(0, amount)
    })
  }

  const handleMaxAmountChange = (maxAmount: number) => {
    onChange({
      ...value,
      maxAmount: Math.max(value.amount, maxAmount)
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className={className}>
      {/* Price Type Selector */}
      {categoryConfig.pricingOptions.allowRange && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Tipo de precio
          </label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => onChange({ ...value, type: 'fixed' })}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                value.type === 'fixed'
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              Fijo
            </button>
            <button
              onClick={() => onChange({ ...value, type: 'starting_at' })}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                value.type === 'starting_at'
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              Desde
            </button>
            <button
              onClick={() => onChange({ ...value, type: 'range' })}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                value.type === 'range'
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              Rango
            </button>
          </div>
        </div>
      )}

      {/* Main Price Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary-700 mb-2">
          {value.type === 'starting_at' ? 'Precio inicial' : 'Precio'}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CurrencyDollarIcon className="w-5 h-5 text-primary-500" />
          </div>
          <input
            type="number"
            value={value.amount}
            onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
            min={categoryConfig.pricingOptions.minPrice}
            max={categoryConfig.pricingOptions.maxPrice}
            className="w-full pl-10 pr-20 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            placeholder="0"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <select
              value={value.currency}
              onChange={(e) => onChange({ ...value, currency: e.target.value })}
              className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-primary-700 sm:text-sm rounded-r-xl focus:ring-0 focus:border-transparent"
            >
              {categoryConfig.pricingOptions.supportedCurrencies.map((code) => {
                const currency = currencies.find(c => c.code === code)
                return (
                  <option key={code} value={code}>
                    {currency?.code}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Range Max Price */}
      {value.type === 'range' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Precio máximo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyDollarIcon className="w-5 h-5 text-primary-500" />
            </div>
            <input
              type="number"
              value={value.maxAmount}
              onChange={(e) => handleMaxAmountChange(parseFloat(e.target.value))}
              min={value.amount}
              max={categoryConfig.pricingOptions.maxPrice}
              className="w-full pl-10 pr-20 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-primary-700">{value.currency}</span>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div className="space-y-4">
        {/* Negotiable Toggle */}
        {categoryConfig.pricingOptions.allowNegotiation && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowsRightLeftIcon className="w-5 h-5 text-primary-500 mr-2" />
              <span className="text-primary-700">Precio negociable</span>
            </div>
            <button
              onClick={() => onChange({ ...value, negotiable: !value.negotiable })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value.negotiable ? 'bg-primary-500' : 'bg-primary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value.negotiable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Price Per Unit Toggle */}
        {categoryConfig.pricingOptions.allowPricePerUnit && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ScaleIcon className="w-5 h-5 text-primary-500 mr-2" />
              <span className="text-primary-700">Precio por unidad</span>
            </div>
            <button
              onClick={() => onChange({ ...value, pricePerUnit: !value.pricePerUnit })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value.pricePerUnit ? 'bg-primary-500' : 'bg-primary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value.pricePerUnit ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Unit Input */}
        {value.pricePerUnit && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Unidad de medida
            </label>
            <input
              type="text"
              value={value.unit || ''}
              onChange={(e) => onChange({ ...value, unit: e.target.value })}
              className="w-full px-4 py-2 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="ej: m², kg, unidad"
            />
          </div>
        )}

        {/* Period Selector */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Periodicidad (opcional)
          </label>
          <select
            value={value.period || ''}
            onChange={(e) => onChange({ ...value, period: e.target.value as any })}
            className="w-full px-4 py-2 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            <option value="">Sin periodicidad</option>
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-4 bg-primary-50 rounded-xl"
      >
        <h4 className="text-sm font-medium text-primary-700 mb-2">
          Vista previa del precio
        </h4>
        <div className="text-2xl font-bold text-primary-900">
          {value.type === 'starting_at' && 'Desde '}
          {formatCurrency(value.amount, value.currency)}
          {value.type === 'range' && ` - ${formatCurrency(value.maxAmount || 0, value.currency)}`}
          {value.period && ` ${periods.find(p => p.value === value.period)?.label.toLowerCase()}`}
          {value.pricePerUnit && value.unit && ` por ${value.unit}`}
        </div>
        {value.negotiable && (
          <div className="text-sm text-primary-600 mt-1">
            Precio negociable
          </div>
        )}
      </motion.div>
    </div>
  )
} 