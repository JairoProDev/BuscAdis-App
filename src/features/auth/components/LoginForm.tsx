'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { AuthService } from '../services/auth.service';
import { PublicationsService } from '@/services/publications.service';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');
    const publishData = searchParams.get('data');
    const [formData, setFormData] = useState({
        phone: '',
        dni: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        console.log('LoginForm montado. Redirect URL:', redirectUrl, 'Publish Data:', publishData);
    }, [redirectUrl, publishData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        console.log('Intento de inicio de sesión con:', formData);

        try {
            const { phone, dni } = formData;
            const { data, error: loginError } = await AuthService.login({ phone, dni });

            if (loginError) {
                console.error('Error en inicio de sesión:', loginError);
                setError(loginError);
                return;
            }

            console.log('Inicio de sesión exitoso:', data);
            setSuccessMessage('Inicio de sesión exitoso.');

            if (redirectUrl) {
                if (publishData) {
                    await PublicationsService.createPublication(JSON.parse(decodeURIComponent(publishData)));
                    console.log('Publicación creada después del inicio de sesión.');
                }
                router.push(redirectUrl);
                console.log('Redirigiendo a:', redirectUrl);
            } else {
                router.push('/');
                console.log('Redirigiendo a la raíz.');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError('Error al iniciar sesión. Verifica tus datos.');
        } finally {
            setLoading(false);
            console.log('Inicio de sesión completado.');
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

            {successMessage && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
                    {successMessage}
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