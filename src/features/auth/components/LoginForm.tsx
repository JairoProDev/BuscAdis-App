'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { PhoneInput } from 'react-international-phone';
import { AuthService } from '../services/auth.service';

export default function LoginForm() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'input' | 'verification'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginWithEmail, loginWithPhone, sendPhoneOtp, error: authError, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { email, password, phone } = formData;
      const { data, error } = await AuthService.loginWithEmail({
        email,
        password
      });

      if (error) throw error;

      // Redirigir o mostrar mensaje de éxito
      console.log('Inicio de sesión exitoso:', data);
    } catch (error) {
      setError('Error al iniciar sesión. Verifica tus datos.');
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Iniciar sesión
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 py-2 px-4 rounded-lg transition duration-200 ${
            loginMethod === 'phone'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          WhatsApp
        </button>
        <button
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2 px-4 rounded-lg transition duration-200 ${
            loginMethod === 'email'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Correo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {loginMethod === 'phone' ? (
          step === 'input' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de WhatsApp
              </label>
              <PhoneInput
                defaultCountry="pe"
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })}
                className="w-full"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de verificación
              </label>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
          )
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-200"
        >
          {loading
            ? 'Cargando...'
            : loginMethod === 'phone' && step === 'input'
            ? 'Enviar código'
            : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
