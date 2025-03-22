'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { AuthService } from '../services/auth.service';

export default function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        phone: '',
        dni: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { phone, dni } = formData;
            const { data, error } = await AuthService.login({ phone, dni });

            if (error) throw error;

            // Redirigir a la página principal tras el inicio de sesión
            router.push('/');
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono WhatsApp
                    </label>
                    <PhoneInput
                        defaultCountry="pe"
                        value={formData.phone}
                        onChange={(phone) => setFormData({ ...formData, phone })}
                        className="w-full"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                        DNI
                    </label>
                    <input
                        type="text"
                        id="dni"
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-200"
                >
                    {loading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
            </form>
        </div>
    );
}