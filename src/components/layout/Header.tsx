'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { HomeIcon, NewspaperIcon, MagnifyingGlassIcon, MegaphoneIcon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/theme';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAuthenticated = false; // Cambia según tu lógica de auth
  const user = { full_name: 'Usuario' }; // Cambia según tu lógica de auth

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 select-none">
            <Image src="/favicon.ico" alt="BuscAdis Logo" width={32} height={32} className="w-8 h-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-teal-300 dark:to-cyan-400">
              BuscAdis
            </span>
          </Link>

          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/inicio" className="flex items-center gap-1 px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <HomeIcon className="w-5 h-5" /> Inicio
            </Link>
            <Link href="/revista" className="flex items-center gap-1 px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <NewspaperIcon className="w-5 h-5" /> Revista Digital
            </Link>
            <Link href="/buscar" className="flex items-center gap-1 px-4 py-2 rounded-lg border border-teal-500 text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900 font-semibold hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" /> Buscar
            </Link>
            <Link href="/publicar" className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-colors">
              <MegaphoneIcon className="w-5 h-5" /> Publicar
            </Link>
          </nav>

          {/* Acciones a la derecha */}
          <div className="flex items-center space-x-6 ml-4">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <ThemeToggle />
              </div>
            </div>
            {isAuthenticated ? (
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                  aria-label="Menú de usuario"
                >
                  <UserCircleIcon className="w-8 h-8" />
                  <span className="hidden lg:block font-medium">{user.full_name.split(' ')[0]}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg py-2 z-50 border border-slate-200 dark:border-slate-700">
                    <Link href="/perfil" className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">Mi Perfil</Link>
                    <Link href="/mis-anuncios" className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">Mis Anuncios</Link>
                    <Link href="/favoritos" className="block px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">Favoritos</Link>
                    <button onClick={() => {}} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition">Cerrar Sesión</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-4 py-2 rounded-lg border border-teal-500 text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900 font-semibold hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors">Iniciar sesión</Link>
                <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-colors">Regístrate</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 