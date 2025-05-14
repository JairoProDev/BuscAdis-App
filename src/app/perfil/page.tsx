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

export default function PerfilPage() {
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
        <div className="container py-12 max-w-2xl mx-auto animate-fade-in">
            <div className="flex flex-col items-center mb-8">
                <div className="text-6xl mb-2 animate-bounce">👤</div>
                <h1 className="text-3xl font-bold mb-2 text-teal-600">Mi Perfil</h1>
                <p className="text-gray-600 text-center">Gestiona tu información personal, intereses y seguridad para personalizar tu experiencia en BuscAdis.</p>
            </div>
            {success && (
                <div className="bg-green-100 text-green-700 rounded-lg p-3 mb-4 text-center animate-fade-in-up">¡Perfil actualizado con éxito!</div>
            )}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Nombres</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={!isEditing} className="w-full rounded border px-3 py-2" placeholder="Nombres" title="Nombres" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} className="w-full rounded border px-3 py-2" placeholder="Teléfono" title="Teléfono" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!isEditing} className="w-full rounded border px-3 py-2" placeholder="Correo electrónico" title="Correo electrónico" />
                </div>
                <div className="flex justify-end gap-2">
                    {!isEditing ? (
                        <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-colors">Editar Perfil</button>
                    ) : (
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition-colors">Guardar Cambios</button>
                    )}
                </div>
            </form>
        </div>
    );
}