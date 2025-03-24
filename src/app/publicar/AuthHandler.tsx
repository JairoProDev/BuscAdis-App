'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileService } from '@/services/profile.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface User {
    name?: string;
    email?: string;
    phone?: string;
}

interface Profile {
    fullName: string;
    phone: string;
    email: string;
}

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);
                const profileData = await ProfileService.getProfile();

                if (profileData) {
                    const mappedProfile: Profile = {
                        fullName: profileData.fullName || '',
                        phone: profileData.phone || '',
                        email: profileData.email || '',
                    };
                    setFormData({
                        fullName: mappedProfile.fullName,
                        phone: mappedProfile.phone,
                        email: mappedProfile.email,
                    });
                } else if (user) {
                    const mappedUser: User = {
                        phone: user.phone || '',
                    };
                    setFormData({
                        fullName: mappedUser.name || '',
                        phone: mappedUser.phone || '',
                        email: mappedUser.email || '',
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('No se pudo cargar el perfil. Inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const updatedProfile = await ProfileService.createOrUpdateProfile(formData);
            if (updatedProfile) {
                setIsEditing(false);
                setSuccess('Perfil actualizado correctamente');
            } else {
                setError('Error al actualizar el perfil.');
            }
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('No se pudo actualizar el perfil. Inténtalo de nuevo más tarde.');
        } finally {
            // No se usa isSaving, por lo que no es necesario
        }
    };

    if (loading) {
        return (
            <div className="container py-16 min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="container py-8 md:py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Mi perfil</h1>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
                        <p className="text-green-600">{success}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 md:p-8">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre completo
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        name="fullName"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={formData.fullName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={formData.phone}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        value={formData.email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-200"
                                >
                                    Guardar cambios
                                </button>
                            </form>
                        ) : (
                            <div>
                                {/* Contenido cuando no está editando */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}