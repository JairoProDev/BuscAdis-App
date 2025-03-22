'use client';

import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { XMarkIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginForm({ isOpen, onClose, onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('');
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login({
        phone: phone.startsWith('+') ? phone : `+${phone}`,
        dni
      });

      if (result.success) {
        setSuccessMessage('¡Inicio de sesión exitoso!');
        setPhone('');
        setDni('');
        
        // Esperar 1.5 segundos para mostrar el mensaje de éxito
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Cerrar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <PhoneInput
              country={'pe'}
              value={phone}
              onChange={setPhone}
              inputProps={{
                id: 'phone',
                required: true,
                className: 'w-full p-2 border border-gray-300 rounded-md',
                placeholder: '+51 937 054 328',
              }}
              containerStyle={{ position: 'relative' }}
              inputStyle={{ paddingLeft: '4rem' }}
            />
          </div>

          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              DNI
              <IdentificationIcon className="h-5 w-5 ml-2" />
            </label>
            <input
              type="text"
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Introduce tu DNI"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}