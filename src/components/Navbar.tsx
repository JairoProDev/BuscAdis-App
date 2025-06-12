'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth'; // Importar useAuth
import { UserCircleIcon, BellIcon, MessageSquare, BookOpenIcon } from 'lucide-react'; // Importar iconos
import LoginForm from '@/features/auth/components/LoginForm';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { isAuthenticated, logout, checkSession } = useAuth(); // Usar useAuth

    // Verificar la sesión cuando el componente se monta
    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const handleLoginClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLoginModal(true);
        setIsOpen(false); // Cerrar el menú móvil si está abierto
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        checkSession(); // Actualizar el estado de autenticación
    };

    const handleLogout = async () => {
        await logout();
        setIsOpen(false); // Cerrar el menú móvil si está abierto
    };

    return (
        <>
            <nav className="relative z-40 backdrop-blur-lg bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-8 h-8">
                                <Image 
                                    src="/logo.png" 
                                    alt="BuscAdis Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                                BuscAdis
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/buscar" className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                Buscar Adisos
                            </Link>
                            <Link href="/categorias" className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                Categorías
                            </Link>
                            <Link href="/revista" className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center">
                                <BookOpenIcon className="w-4 h-4 mr-1" />
                                Revista Digital
                            </Link>
                            
                            <ThemeToggle />
                            
                            {isAuthenticated ? (
                                <>
                                    <Link href="/publicar" className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 shadow-md shadow-teal-500/20 transition">
                                        Publicar Adiso
                                    </Link>
                                    <div className="flex items-center space-x-4">
                                        <Link href="/perfil" className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                            <UserCircleIcon className="w-6 h-6" />
                                        </Link>
                                        <Link href="/notificaciones" className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                            <BellIcon className="w-6 h-6" />
                                        </Link>
                                        <Link href="/mensajes" className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                            <MessageSquare className="w-6 h-6" />
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md shadow-red-500/20 transition"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleLoginClick} className="text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition">
                                        Iniciar Sesión
                                    </button>
                                    <button onClick={handleLoginClick} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 shadow-md shadow-teal-500/20 transition">
                                        Registrarse
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:hidden">
                            <ThemeToggle />
                            <button
                                className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Menú de navegación"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {isOpen && (
                        <div className="md:hidden py-4 px-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg mb-4">
                            <Link href="/buscar" className="block py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                                Buscar Adisos
                            </Link>
                            <Link href="/categorias" className="block py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                                Categorías
                            </Link>
                            <Link href="/revista" className="block py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition flex items-center">
                                <BookOpenIcon className="w-4 h-4 mr-2" />
                                Revista Digital
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/publicar" className="block py-2 px-3 mt-3 text-white bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg shadow-md shadow-teal-500/20 transition">
                                        Publicar Adiso
                                    </Link>
                                    <div className="border-t border-slate-200 dark:border-slate-800 my-3"></div>
                                    <Link href="/perfil" className="block py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                                        Perfil
                                    </Link>
                                    <Link href="/notificaciones" className="block py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                                        Notificaciones
                                    </Link>
                                    <Link href="/mensajes" className="block py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                                        Mensajes
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left py-2 px-3 mt-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md shadow-red-500/20 transition"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleLoginClick} className="block w-full text-left py-2 px-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                                        Iniciar Sesión
                                    </button>
                                    <button onClick={handleLoginClick} className="block w-full text-left py-2 px-3 mt-2 text-white bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg shadow-md shadow-teal-500/20 transition">
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
                onSuccess={handleLoginSuccess}
            />
        </>
    );
}