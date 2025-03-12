'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/features/auth/services/auth.service';
import Link from 'next/link';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Enlace inválido
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            El enlace de confirmación es inválido o ha expirado.
          </p>
          <Link 
            href="/register" 
            className="block w-full text-center bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-200"
          >
            Volver al registro
          </Link>
        </div>
      </div>
    );
  }

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      await AuthService.resendConfirmationCode(email);
      setSuccess(true);
    } catch (error) {
      setError('Error al reenviar el código. Inténtalo de nuevo.');
      console.error('Error resending code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await AuthService.confirmSignUp(email, code);
      router.push('/login?verified=true');
    } catch (error) {
      setError('Código inválido. Inténtalo de nuevo.');
      console.error('Error confirming signup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Confirma tu cuenta
        </h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Hemos enviado un código de verificación a <strong>{email}</strong>. Ingresa el código para confirmar tu cuenta.
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
            Código reenviado correctamente.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Código de verificación
            </label>
            <input
              id="code"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa el código"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-200"
          >
            {loading ? 'Verificando...' : 'Verificar cuenta'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-primary-600 text-sm hover:underline"
          >
            ¿No recibiste el código? Reenviar
          </button>
        </div>
      </div>
    </div>
  );
}
