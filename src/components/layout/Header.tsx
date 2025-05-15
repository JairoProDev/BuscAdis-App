'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HomeIcon,
  NewspaperIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon, // Para Logout
  BookmarkIcon, // Para Guardados
  ChatBubbleOvalLeftEllipsisIcon, // Para Mensajes
  BellIcon, // Para Notificaciones
  Cog6ToothIcon, // Un ícono genérico para "Mi Perfil" o "Configuración" si UserCircle se usa en el botón
  ChevronDownIcon, // Para indicar que es un desplegable
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/theme'; // Asumo que este componente ya gestiona sus íconos

// Define una interfaz más específica para el usuario si es posible
interface User {
  id: string; // O el tipo que sea tu user.id
  full_name?: string;
  firstName?: string;
  lastName?: string;
  email?: string; // Añadido para corregir el error
  // avatarUrl?: string; // Por ejemplo, para mostrar una imagen de perfil real
}

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Para evitar hydration mismatch con localStorage

  const userMenuRef = useRef<HTMLDivElement>(null); // Ref para el contenedor del botón y el menú

  // Sincronización con localStorage y listener de storage
  const syncAuth = useCallback(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const parsedUser = JSON.parse(userString) as User;
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setUser(null);
      setIsAuthenticated(false);
      // Opcional: limpiar localStorage si está corrupto
      // localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    setIsMounted(true); // Indica que el componente se ha montado en el cliente
    syncAuth(); // Sincronización inicial
    window.addEventListener('storage', syncAuth); // Escucha cambios en otras pestañas/ventanas
    return () => window.removeEventListener('storage', syncAuth);
  }, [syncAuth]);

  // Manejo del clic fuera del menú para cerrarlo
  useEffect(() => {
    if (!showUserMenu) return;

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Feedback visual tras login (Toast)
  useEffect(() => {
    // Solo mostrar el toast si la autenticación acaba de cambiar a true
    // y no en la carga inicial si el usuario ya estaba logueado.
    // Para esto, necesitaríamos un estado previo o una lógica más específica
    // que determine si es un "nuevo" login. Por ahora, lo mantenemos simple.
    if (isAuthenticated && isMounted) { // isMounted asegura que esto solo ocurra en el cliente
      // Simple debounce para evitar múltiples toasts si el estado cambia rápidamente
      const existingToast = document.querySelector('.login-toast');
      if (existingToast) return;

      const toast = document.createElement('div');
      toast.textContent = `¡Bienvenido, ${user?.firstName || user?.full_name || 'Usuario'}!`;
      toast.className = 'login-toast fixed top-5 right-5 z-[10000] bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-in-from-right';
      // Estilos para la animación (puedes ponerlos en tu CSS global)
      // @keyframes slide-in-from-right { 0% { transform: translateX(100%); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
      // .animate-slide-in-from-right { animation: slide-in-from-right 0.3s ease-out forwards; }
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300); // Espera a que termine la transición de salida
      }, 2700); // Duración del toast visible
    }
  }, [isAuthenticated, user, isMounted]); // Dependencias

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowUserMenu(false); // Cierra el menú
    // Considera redirigir a la página de inicio o login en lugar de solo recargar
    // router.push('/login'); // Si usas Next.js App Router
    window.location.href = '/'; // Redirección simple, o usa Next Router
  };

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };
  
  // Solo renderizar contenido dependiente de localStorage después del montaje
  if (!isMounted) {
    // Puedes mostrar un esqueleto o un header simplificado para SSR y evitar mismatch
    // Por ahora, para simplificar, no renderizamos nada o un loader mínimo hasta montar.
    // Esto es crucial si el estado de `isAuthenticated` afecta significativamente el layout.
    // Para un header, usualmente es mejor mostrar una versión base.
    // Aquí optamos por mostrar una versión no autenticada o un loader para el botón de usuario.
    // O, simplemente, dejar que renderice con isAuthenticated = false inicialmente y se actualice.
    // La estrategia de `isMounted` es para asegurar que no haya mismatch con lo que `localStorage` diría.
  }

  const UserAvatar = () => (
    // Aquí podrías poner una lógica más avanzada para mostrar un avatar real si `user.avatarUrl` existe
    // <Image src={user.avatarUrl} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full" />
    // Por ahora, usamos UserCircleIcon.
    <UserCircleIcon className="w-8 h-8 text-slate-600 dark:text-slate-300 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
  );


  // Clases base para los items del menú desplegable
  const menuItemClasses = "flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-md transition-colors duration-150";
  const menuItemIconClasses = "w-5 h-5 text-slate-500 dark:text-slate-400";


  return (
    <header className="sticky top-0 z-[1000] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Ajustado max-w y padding */}
        <div className="flex items-center justify-between h-16 md:h-20"> {/* Altura adaptable */}
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 select-none group" aria-label="Página de inicio de BuscAdis">
            <Image src="/favicon.ico" alt="BuscAdis Logo" width={32} height={32} className="w-8 h-8 md:w-9 md:h-9 group-hover:opacity-80 transition-opacity" />
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-teal-400 dark:to-cyan-400 transition-all">
              BuscAdis
            </span>
          </Link>

          {/* Navegación principal (Desktop) */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {[
              { href: "/inicio", label: "Inicio", icon: HomeIcon },
              { href: "/revista", label: "Revista Digital", icon: NewspaperIcon },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-150"
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </Link>
            ))}
            <Link href="/buscar" className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border-2 border-teal-500 dark:border-teal-600 text-teal-600 dark:text-teal-400 font-semibold hover:bg-teal-500/10 dark:hover:bg-teal-600/20 transition-colors duration-150">
              <MagnifyingGlassIcon className="w-5 h-5" /> Buscar
            </Link>
            <Link href="/publicar" className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-150">
              <MegaphoneIcon className="w-5 h-5" /> Publicar
            </Link>
          </nav>

          {/* Acciones a la derecha */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
              <ThemeToggle />
            </div>

            {isMounted && isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="group flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 transition-colors"
                  aria-expanded="true"
                  aria-haspopup="true"
                  aria-controls="user-menu"
                  aria-label="Abrir menú de usuario"
                >
                  <UserAvatar />
                  <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-500 transition-colors">
                    {user.firstName || user.full_name?.split(' ')[0] || 'Usuario'}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-teal-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú Desplegable */}
                <div
                  id="user-menu"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button" // Debería ser el ID del botón, pero el botón no tiene ID aquí.
                  className={`absolute right-0 top-full mt-2.5 w-64 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none transition-all duration-200 ease-out
                    ${showUserMenu ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}` // Transición mejorada
                  }
                >
                  <div className="px-1.5 py-1.5" role="none">
                    <div className="px-3.5 py-2.5 mb-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" role="presentation">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.full_name || 'Nombre de Usuario'}
                      </p>
                      {user.email && ( // Asumiendo que podrías tener email
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate" role="presentation">{user.email}</p>
                      )}
                    </div>

                    <Link href="/perfil" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
                      <Cog6ToothIcon className={menuItemIconClasses} /> Mi Perfil
                    </Link>
                    <Link href="/mis-anuncios" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
                      <MegaphoneIcon className={menuItemIconClasses} /> Mis Anuncios
                    </Link>
                    <Link href="/favoritos" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
                      <BookmarkIcon className={menuItemIconClasses} /> Guardados
                    </Link>
                    <Link href="/mensajes" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
                      <ChatBubbleOvalLeftEllipsisIcon className={menuItemIconClasses} /> Mensajes
                    </Link>
                    <Link href="/notificaciones" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
                      <BellIcon className={menuItemIconClasses} /> Notificaciones
                    </Link>
                    
                    <div className="border-t border-slate-200 dark:border-slate-700/50 my-1.5 mx-1.5" role="separator"></div>
                    
                    <button
                      onClick={() => { handleLogout(); setShowUserMenu(false); }}
                      role="menuitem"
                      className={`${menuItemClasses} w-full text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-700/20 dark:hover:text-red-400`}
                    >
                      <ArrowLeftOnRectangleIcon className={`${menuItemIconClasses} text-red-500 dark:text-red-500`} /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : isMounted ? ( // Solo mostrar si está montado y no autenticado
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-3.5 py-2 rounded-lg border-2 border-teal-500 dark:border-teal-600 text-teal-600 dark:text-teal-400 font-semibold hover:bg-teal-500/10 dark:hover:bg-teal-600/20 transition-colors duration-150 text-sm">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow hover:shadow-md hover:from-teal-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-150 text-sm">
                  Regístrate
                </Link>
              </div>
            ) : (
              // Espacio reservado o un loader simple mientras se determina el estado de autenticación
              <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Navegación Móvil (Opcional, si quieres añadirla aquí o en un componente separado) */}
      {/* <MobileNav /> */}
    </header>
  );
}

// CSS Adicional (si no puedes usar plugins de Tailwind para animaciones como animate-tailwindcss)
// Puedes poner esto en tu archivo global de CSS.
/*
@keyframes slide-in-from-right {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in-from-right {
  animation: slide-in-from-right 0.3s ease-out forwards;
}
*/