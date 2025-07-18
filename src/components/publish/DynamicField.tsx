import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';

interface DynamicFieldProps {
  type: 'text' | 'textarea' | 'number' | 'tel' | 'select';
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    customValidation?: (value: string | number) => boolean;
  };
}

export default function DynamicField({
  type,
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  helperText,
  error,
  required,
  disabled,
  options,
  validation
}: DynamicFieldProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  const validateField = () => {
    if (!validation) return true;

    if (required && (!value || (typeof value === 'string' && !value.trim()))) {
      setLocalError('Este campo es obligatorio');
      setIsValid(false);
      Logger.warn(`Campo obligatorio vacío: ${name}`);
      return false;
    }

    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        setLocalError(`Mínimo ${validation.minLength} caracteres`);
        setIsValid(false);
        Logger.warn(`Longitud mínima no alcanzada en ${name}`);
        return false;
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        setLocalError(`Máximo ${validation.maxLength} caracteres`);
        setIsValid(false);
        Logger.warn(`Longitud máxima excedida en ${name}`);
        return false;
      }

      if (validation.pattern && !validation.pattern.test(value)) {
        setLocalError('Formato inválido');
        setIsValid(false);
        Logger.warn(`Formato inválido en ${name}`);
        return false;
      }
    }

    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        setLocalError(`El valor mínimo es ${validation.min}`);
        setIsValid(false);
        Logger.warn(`Valor mínimo no alcanzado en ${name}`);
        return false;
      }

      if (validation.max !== undefined && value > validation.max) {
        setLocalError(`El valor máximo es ${validation.max}`);
        setIsValid(false);
        Logger.warn(`Valor máximo excedido en ${name}`);
        return false;
      }
    }

    if (validation.customValidation && !validation.customValidation(value)) {
      setLocalError('Valor inválido');
      setIsValid(false);
      Logger.warn(`Validación personalizada fallida en ${name}`);
      return false;
    }

    setLocalError('');
    setIsValid(true);
    Logger.debug(`Campo ${name} validado correctamente`);
    return true;
  };

  useEffect(() => {
    if (isDirty) {
      validateField();
    }
  }, [value, isDirty, validateField]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
    setIsDirty(true);
  };

  const handleBlur = () => {
    setIsDirty(true);
    validateField();
    onBlur?.();
  };

  const handleFocus = () => {
    Logger.debug(`Campo ${name} enfocado`);
  };

  const fieldClasses = `
    w-full px-4 py-3 rounded-xl transition-all
    ${disabled ? 'bg-gray-100' : 'bg-white'}
    ${error || localError
      ? 'border-2 border-red-300 focus:border-red-500 focus:ring-red-200'
      : isValid && isDirty
      ? 'border-2 border-green-300 focus:border-green-500 focus:ring-green-200'
      : 'border-2 border-gray-200 focus:border-primary-500 focus:ring-primary-200'
    }
  `;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`${fieldClasses} min-h-[120px]`}
          />
        );

      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={fieldClasses}
            aria-label={label}
          >
            <option value="">Selecciona una opción</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={fieldClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>

      <div className="relative">
        {renderField()}
        
        <AnimatePresence>
          {(isValid && isDirty && !error) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(error || localError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 text-sm text-red-600"
          >
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error || localError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {helperText && !error && !localError && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
} 