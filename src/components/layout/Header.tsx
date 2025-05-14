'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import Link from 'next/link';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Importa el icono de búsqueda si lo necesitas

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Define tus colores personalizados basados en tu diseño
    const backgroundColor = 'bg-slate-900'; // Un tono oscuro similar al de tu app
    const textColor = 'text-gray-300'; // Texto general en un tono claro
    const primaryColor = 'text-teal-400'; // Tu color primario (turquesa/cian) para acentos
    const primaryButtonBg = 'bg-teal-400';
    const primaryButtonHoverBg = 'bg-teal-500';
    const primaryButtonTextColor = 'text-white';
    const hoverTextColor = 'text-white';
    const menuBackgroundColor = 'bg-slate-800';
    const menuHoverBackgroundColor = 'bg-slate-700';
    const menuTextColor = 'text-gray-300';
    const menuHoverTextColor = 'text-white';
    const logoTextColor = 'text-white';

    return (
        <header className={`${backgroundColor} sticky top-0 z-50 w-full overflow-x-hidden`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-teal-300 dark:to-cyan-400">
                            BuscAdis
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className={`flex items-center space-x-2 ${textColor} hover:${hoverTextColor}`}
                                >
                                    <div className={`w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center`}>
                                        <span className={`${primaryColor} font-medium`}>
                                            {user?.full_name?.[0] || 'U'}
                                        </span>
                                    </div>
                                    <span className="hidden md:block">{user?.full_name || 'Usuario'}</span>
                                </button>

                                {showUserMenu && (
                                    <div className={`absolute right-0 mt-2 w-48 ${menuBackgroundColor} rounded-md shadow-lg py-1 z-10`}>
                                        <Link
                                            href="/perfil"
                                            className={`block px-4 py-2 text-sm ${menuTextColor} hover:${menuHoverTextColor} hover:${menuHoverBackgroundColor}`}
                                        >
                                            Mi Perfil
                                        </Link>
                                        <Link
                                            href="/mis-anuncios"
                                            className={`block px-4 py-2 text-sm ${menuTextColor} hover:${menuHoverTextColor} hover:${menuHoverBackgroundColor}`}
                                        >
                                            Mis Anuncios
                                        </Link>
                                        <Link
                                            href="/favoritos"
                                            className={`block px-4 py-2 text-sm ${menuTextColor} hover:${menuHoverTextColor} hover:${menuHoverBackgroundColor}`}
                                        >
                                            Favoritos
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className={`block w-full text-left px-4 py-2 text-sm text-red-600 hover:${menuHoverBackgroundColor}`}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={`${textColor} hover:${hoverTextColor}`}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className={`${primaryButtonBg} ${primaryButtonTextColor} px-4 py-2 rounded-lg hover:${primaryButtonHoverBg}`}
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}