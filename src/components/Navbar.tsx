'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth'; // Importar useAuth
import { UserCircleIcon, BellIcon, MessageSquare } from 'lucide-react'; // Importar iconos
import LoginForm from '@/features/auth/components/LoginForm';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { user, isAuthenticated, logout } = useAuth(); // Usar useAuth

    const handleLoginClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLoginModal(true);
    };

    return (
        <>
            <nav className="sticky top-0 z-40 backdrop-blur-lg bg-glass/30 border-b border-primary-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="text-2xl font-bold text-primary-800">
                            BuscAdis
                        </Link>

                        <div className="hidden md:flex space-x-8">
                            <Link href="/buscar" className="text-primary-700 hover:text-primary-900">
                                Buscar Adisos
                            </Link>
                            <Link href="/categorias" className="text-primary-700 hover:text-primary-900">
                                Categorías
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/publicar" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                                        Publicar Adiso
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
                                    >
                                        Cerrar Sesión
                                    </button>
                                    <Link href="/perfil" className="text-primary-700 hover:text-primary-900">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </Link>
                                    <Link href="/notificaciones" className="text-primary-700 hover:text-primary-900">
                                        <BellIcon className="w-6 h-6" />
                                    </Link>
                                    <Link href="/mensajes" className="text-primary-700 hover:text-primary-900">
                                        <MessageSquare className="w-6 h-6" />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleLoginClick} className="text-primary-700 hover:text-primary-900">
                                        Iniciar Sesión
                                    </button>
                                    <button onClick={handleLoginClick} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                                        Registrarse
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            className="md:hidden"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Menú de navegación"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>

                    {isOpen && (
                        <div className="md:hidden pb-4">
                            <Link href="/buscar" className="block py-2 text-primary-700">
                                Buscar Adisos
                            </Link>
                            <Link href="/categorias" className="block py-2 text-primary-700">
                                Categorías
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/publicar" className="block py-2 text-primary-700">
                                        Publicar Adiso
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left py-2 text-primary-700"
                                    >
                                        Cerrar Sesión
                                    </button>
                                    <Link href="/perfil" className="block py-2 text-primary-700">
                                        Perfil
                                    </Link>
                                    <Link href="/notificaciones" className="block py-2 text-primary-700">
                                        Notificaciones
                                    </Link>
                                    <Link href="/mensajes" className="block py-2 text-primary-700">
                                        Mensajes
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleLoginClick} className="block w-full text-left py-2 text-primary-700">
                                        Iniciar Sesión
                                    </button>
                                    <button onClick={handleLoginClick} className="block w-full text-left py-2 text-primary-700">
                                        Registrarse
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            <LoginForm 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
            />
        </>
    );
}