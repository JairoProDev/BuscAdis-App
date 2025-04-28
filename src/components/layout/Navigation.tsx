'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { HomeIcon, NewspaperIcon, MagnifyingGlassIcon, PlusCircleIcon, MegaphoneIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon, BellIcon } from '@heroicons/react/24/solid'; // Iconos adicionales
import { motion, useScroll } from 'framer-motion';
// import { useAuth } from '@/features/auth/hooks/useAuth'; // Comenta o elimina la importación por ahora

export default function Navigation() {
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path: string) => pathname === path

    // Define tus colores personalizados basados en tu diseño
    const backgroundColor = isScrolled ? 'bg-slate-900/90' : 'bg-slate-900';
    const textColor = 'text-gray-300';
    const primaryColor = 'text-teal-400';
    const primaryButtonBg = 'bg-teal-400';
    const primaryButtonHoverBg = 'bg-teal-500';
    const primaryButtonTextColor = 'text-white';
    const hoverTextColor = 'text-white';
    const activeLinkBg = 'bg-teal-900';
    const activeLinkTextColor = 'text-white';
    const linkHoverBg = 'bg-teal-800/50';
    const logoTextColor = 'text-white';
    const searchBg = 'bg-slate-800';
    const searchTextColor = 'text-gray-400';
    const searchFocusBg = 'bg-slate-700';
    const mobileMenuBg = 'bg-slate-800';
    const mobileMenuHoverBg = 'bg-slate-700';

    // Simula un estado de autenticación para desarrollo
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Cambia a true/false para probar
    const [user, setUser] = useState<{ full_name?: string }>({}); // Simula el usuario
    const logout = () => setIsAuthenticated(false); // Simula la función de logout

    // Si vas a usar el hook useAuth más adelante, descomenta esto y elimina la simulación
    // const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className={`${backgroundColor} inherit top-0 left-0 right-0 h-16 z-50 transition-all duration-300`}>
            <div className="container mx-2 px-0 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Logo y Navegación Izquierda (Desktop y Mobile) */}
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <Link href="/" className={`text-2xl font-bold ${logoTextColor} flex items-center gap-2`}>
                            <Image 
                                src="/favicon.ico" 
                                alt="BuscAdis Logo" 
                                width={32} 
                                height={32}
                                className="w-8 h-8"
                            />
                            BuscAdis
                        </Link>
                        {/* Botón del menú móvil */}
                        <div className="md:hidden">
                            <button 
                                onClick={() => setShowMobileMenu(!showMobileMenu)} 
                                className={`${textColor} hover:${hoverTextColor} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                aria-label="Toggle menu"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {showMobileMenu ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Barra de Búsqueda Central (Solo en Desktop) 
                    <div className="hidden md:block flex-grow max-w-md">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar anuncios..."
                                className={`w-full py-2 pl-10 pr-4 rounded-md ${searchBg} ${searchTextColor} focus:${searchFocusBg} focus:outline-none focus:ring-1 focus:ring-teal-500`}
                            />
                        </div>
                    </div>
*/}
                    {/* Navegación y Acciones a la Derecha (Desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        <nav className="flex items-center space-x-4">
                            <Link
                                href="/inicio"
                                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                                    isActive('/inicio')
                                        ? `${activeLinkTextColor} ${activeLinkBg}`
                                        : `${textColor} hover:${hoverTextColor} hover:${linkHoverBg}`
                                }`}
                            >
                                <HomeIcon className="w-5 h-5 mr-1 inline-block" /> Inicio
                            </Link>
                            <Link
                                href="/revista"
                                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                                    isActive('/revista')
                                        ? `${activeLinkTextColor} ${activeLinkBg}`
                                        : `${textColor} hover:${hoverTextColor} hover:${linkHoverBg}`
                                }`}
                            >
                                <NewspaperIcon className="w-5 h-5 mr-1 inline-block" /> Revista Digital {/* Cambiado a Revista Digital */}
                            </Link>
                            <Link
                                href="/"
                                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                                    isActive('/')
                                        ? `${activeLinkTextColor} ${activeLinkBg}`
                                        : `${textColor} hover:${hoverTextColor} hover:${linkHoverBg}`
                                }`}
                            >
                                <MagnifyingGlassIcon className="w-5 h-5 mr-1 inline-block" /> Buscar
                            </Link>
                            <Link
                                href="/publicar"
                                className={`${primaryButtonBg} ${primaryButtonTextColor} px-4 py-2 rounded-md font-semibold hover:${primaryButtonHoverBg} transition-colors`}
                            >
                                <MegaphoneIcon className="w-5 h-5 mr-1 inline-block" /> Publicar {/* Usando MegaphoneIcon */}
                            </Link>
                        </nav>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className={`flex items-center space-x-2 ${textColor} hover:${hoverTextColor} focus:outline-none`}
                                    aria-label="User menu"
                                >
                                    <UserCircleIcon className="w-8 h-8" />
                                    <span className="hidden lg:block">{user?.full_name?.split(' ')[0] || 'Usuario'}</span>
                                </button>

                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-10"
                                    >
                                        <Link
                                            href="/perfil"
                                            className={`block px-4 py-2 text-sm ${textColor} hover:${hoverTextColor} hover:bg-slate-700`}
                                        >
                                            Mi Perfil
                                        </Link>
                                        <Link
                                            href="/mis-anuncios"
                                            className={`block px-4 py-2 text-sm ${textColor} hover:${hoverTextColor} hover:bg-slate-700`}
                                        >
                                            Mis Anuncios
                                        </Link>
                                        <Link
                                            href="/favoritos"
                                            className={`block px-4 py-2 text-sm ${textColor} hover:${hoverTextColor} hover:bg-slate-700`}
                                        >
                                            Favoritos
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className={`block w-full text-left px-4 py-2 text-sm text-red-600 hover:${mobileMenuHoverBg}`}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/login"
                                    className={`${textColor} hover:${hoverTextColor} transition-colors`}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className={`${primaryButtonBg} ${primaryButtonTextColor} px-3 py-2 rounded-md text-sm hover:${primaryButtonHoverBg} transition-colors`}
                                >
                                    Regístrate
                                </Link>
                            </div>
                        )}

                    {/* Icono de Notificaciones (Opcional) */}
                    {isAuthenticated && (
                        <button 
                            className={`${textColor} hover:${hoverTextColor} relative focus:outline-none focus:ring-2 focus:ring-teal-500`}
                            aria-label="Notifications"
                        >
                            <BellIcon className="w-6 h-6" />
                            {/* Contador de notificaciones */}
                            {/* <span className="absolute top-0 right-0 rounded-full bg-red-600 w-2 h-2 transform translate-x-1/2 -translate-y-1/2"></span> */}
                        </button>
                    )}
                </div>
            </div>
        </div>

            {/* Menú Móvil */}
            {showMobileMenu && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`md:hidden fixed top-16 left-0 right-0 ${mobileMenuBg} shadow-md z-40`}
                >
                    <div className="px-4 py-2 space-y-2">
                        <Link href="/inicio" className={`block px-4 py-2 rounded-md font-medium ${textColor} hover:${hoverTextColor} hover:${mobileMenuHoverBg}`}>
                            <HomeIcon className="w-5 h-5 mr-1 inline-block" /> Inicio
                        </Link>
                        <Link href="/revista" className={`block px-4 py-2 rounded-md font-medium ${textColor} hover:${hoverTextColor} hover:${mobileMenuHoverBg}`}>
                            <NewspaperIcon className="w-5 h-5 mr-1 inline-block" /> Revista
                        </Link>
                        <Link href="/" className={`block px-4 py-2 rounded-md font-medium ${textColor} hover:${hoverTextColor} hover:${mobileMenuHoverBg}`}>
                            <MagnifyingGlassIcon className="w-5 h-5 mr-1 inline-block" /> Buscar
                        </Link>
                        <Link href="/publicar" className={`block px-4 py-2 rounded-md font-medium ${primaryButtonBg} ${primaryButtonTextColor} hover:${primaryButtonHoverBg}`}>
                            <PlusCircleIcon className="w-5 h-5 mr-1 inline-block" /> Publicar
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <Link href="/perfil" className={`block px-4 py-2 rounded-md font-medium ${textColor} hover:${hoverTextColor} hover:${mobileMenuHoverBg}`}>
                                    Mi Perfil
                                </Link>
                                <Link href="/mis-anuncios" className={`block px-4 py-2 rounded-md font-medium ${textColor} hover:${hoverTextColor} hover:${mobileMenuHoverBg}`}>
                                    Mis Anuncios
                                </Link>
                                <Link href="/favoritos" className={`block px-4 py-2 rounded-md font-medium ${textColor} hover:${hoverTextColor} hover:${mobileMenuHoverBg}`}>
                                    Favoritos
                                </Link>
                                <button onClick={logout} className={`block w-full text-left px-4 py-2 rounded-md font-medium text-red-600 hover:${mobileMenuHoverBg}`}>
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className={`block px-4 py-2 rounded-md font-medium ${textColor} hover:${hoverTextColor} hover:${mobileMenuHoverBg}`}>
                                    Iniciar sesión
                                </Link>
                                <Link href="/register" className={`block px-4 py-2 rounded-md font-medium ${primaryButtonBg} ${primaryButtonTextColor} hover:${primaryButtonHoverBg}`}>
                                    Regístrate
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </header>
    )
}