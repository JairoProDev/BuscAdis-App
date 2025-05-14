'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { AuthService } from '../services/auth.service';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function RegisterForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dni: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito

    const validateDNI = (dni: string) => /^\d{8,9}$/.test(dni);
    const validatePhone = (phone: string) => /^\+?\d{9,15}$/.test(phone);

    const isFormValid =
        formData.firstName.trim() &&
        formData.lastName.trim() &&
        validatePhone(formData.phone) &&
        validateDNI(formData.dni);

    const getFieldError = (field: string) => {
        if (field === 'dni' && formData.dni && !validateDNI(formData.dni)) return 'DNI inválido (8 o 9 dígitos)';
        if (field === 'phone' && formData.phone && !validatePhone(formData.phone)) return 'Teléfono inválido (mínimo 9 dígitos)';
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { phone, firstName, lastName, dni } = formData;
            const { data, error } = await AuthService.register({ phone, firstName, lastName, dni });

            if (error) throw error;

            setSuccessMessage('Cuenta creada con éxito.'); // Mensaje de éxito
            setTimeout(() => {
                router.push('/login'); // Redirigir a la página de inicio de sesión
            }, 2000); // Redirigir después de 2 segundos
        } catch (error) {
            setError('Error al registrarse. Verifica tus datos.');
            console.error('Error en registro:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crear cuenta</h2>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}
            {successMessage && (
                <div className="flex flex-col items-center justify-center text-green-600 text-center my-4 animate-fade-in">
                    <CheckCircleIcon className="w-12 h-12 mb-2 animate-bounce" />
                    <div className="font-bold text-lg mb-1">¡Cuenta creada con éxito!</div>
                    <div className="text-green-700 text-sm mb-2">¡Bienvenido a la comunidad BuscAdis! 🎉<br/>Ya puedes iniciar sesión y empezar a publicar o descubrir anuncios.<br/>Serás redirigido automáticamente...</div>
                    <button
                        className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-colors"
                        onClick={() => router.push('/login')}
                    >
                        Ir a Iniciar sesión ahora
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input id="firstName" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input id="lastName" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono WhatsApp</label>
                    <PhoneInput defaultCountry="pe" value={formData.phone} onChange={(phone) => setFormData({ ...formData, phone })} className="w-full" required />
                    {getFieldError('phone') && <div className="text-red-500 text-xs mt-1">{getFieldError('phone')}</div>}
                </div>

                <div>
                    <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                    <input type="text" id="dni" value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                    {getFieldError('dni') && <div className="text-red-500 text-xs mt-1">{getFieldError('dni')}</div>}
                </div>

                <button type="submit" disabled={loading || !isFormValid} className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-200">
                    {loading ? 'Enviando...' : 'Crear cuenta'}
                </button>
            </form>
        </div>
    );
}