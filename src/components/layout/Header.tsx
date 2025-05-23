'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // useRouter importado
import {
  HomeIcon,
  NewspaperIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon, // Para Logout
  BookmarkIcon, // Para Guardados
  ChatBubbleOvalLeftEllipsisIcon, // Para Mensajes
  BellIcon, // Para Notificaciones
  Cog6ToothIcon, // Un ícono genérico para "Mi Perfil" o "Configuración" si UserCircle se usa en el botón
  ChevronDownIcon, // Para indicar que es un desplegable
  SparklesIcon, // Para el botón de ADIS
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/theme';

interface User {
  id: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string; // para usar avatares reales
}

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdisChat, setShowAdisChat] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false); // Para evitar hydration mismatch con localStorage
  const pathname = usePathname();
  const router = useRouter(); // Hook de router

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null); // Ref para el botón que abre el menú
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null); // Ref para el primer item del menú

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
      // localStorage.removeItem('user'); // Opcional: limpiar si está corrupto
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

  // Estilo base para los botones de navegación
  const navButtonBaseClasses = "flex flex-col items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-150";
  const navButtonActiveClasses = "text-teal-500 border-b-2 border-teal-500";
  const navButtonInactiveClasses = "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-teal-500";
  
  // Función para determinar si un botón está activo
  const isActiveRoute = (path: string) => {
    return pathname === path ? navButtonActiveClasses : navButtonInactiveClasses;
  };

  // Estilos para los items del menú desplegable
  const menuItemClasses = "flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-md transition-colors duration-150";
  const menuItemIconClasses = "w-5 h-5 text-slate-500 dark:text-slate-400";

  return (
    <header className="sticky top-0 z-[1000] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/favicon.ico" alt="BuscAdis Logo" width={32} height={32} className="w-8 h-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              BuscAdis
            </span>
          </Link>

          {/* Navegación principal */}
          <nav className="flex-1 flex justify-center space-x-1" role="navigation">
            <Link
              href="/inicio"
              className={`${navButtonBaseClasses} ${isActiveRoute('/inicio')}`}
              aria-current={pathname === '/inicio' ? 'page' : undefined}
            >
              <HomeIcon className="w-6 h-6 mb-1" aria-hidden="true" />
              <span className="text-xs">Inicio</span>
            </Link>
            
            <Link
              href="/revista"
              className={`${navButtonBaseClasses} ${isActiveRoute('/revista')}`}
              aria-current={pathname === '/revista' ? 'page' : undefined}
            >
              <NewspaperIcon className="w-6 h-6 mb-1" aria-hidden="true" />
              <span className="text-xs">Revista</span>
            </Link>

            <button
              onClick={() => setShowAdisChat(!showAdisChat)}
              className={`${navButtonBaseClasses} ${showAdisChat ? navButtonActiveClasses : navButtonInactiveClasses}`}
              aria-label="Abrir chat con ADIS"
              aria-expanded={!!showAdisChat}
              title="Chat con ADIS"
            >
              <SparklesIcon className="w-6 h-6 mb-1" aria-hidden="true" />
              <span className="text-xs">ADIS</span>
            </button>
            <Link
              href="/buscar"
              className={`${navButtonBaseClasses} ${isActiveRoute('/buscar')}`}
              aria-current={pathname === '/buscar' ? 'page' : undefined}
            >
              <MagnifyingGlassIcon className="w-6 h-6 mb-1" aria-hidden="true" />
              <span className="text-xs">Buscar</span>
            </Link>
            
            <Link
              href="/publicar"
              className={`${navButtonBaseClasses} ${isActiveRoute('/publicar')}`}
              aria-current={pathname === '/publicar' ? 'page' : undefined}
            >
              <PlusCircleIcon className="w-6 h-6 mb-1" aria-hidden="true" />
              <span className="text-xs">Publicar</span>
            </Link>

          </nav>

          {/* Acciones a la derecha */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {isMounted && isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-button"
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  aria-label="Menú de usuario"
                  aria-expanded={!!showUserMenu}
                  aria-controls="user-menu-dropdown"
                  title="Abrir menú de usuario"
                >
                  <UserCircleIcon className="w-8 h-8 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                  <ChevronDownIcon className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div 
                    id="user-menu-dropdown"
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
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

                      <Link href="/perfil" role="menuitem" className={navButtonInactiveClasses} onClick={() => setShowUserMenu(false)}>
                        <Cog6ToothIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Mi Perfil
                      </Link>
                      <Link href="/mis-anuncios" role="menuitem" className={navButtonInactiveClasses} onClick={() => setShowUserMenu(false)}>
                        <PlusCircleIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Mis Anuncios
                      </Link>
                      <Link href="/guardados" role="menuitem" className={navButtonInactiveClasses} onClick={() => setShowUserMenu(false)}>
                        <BookmarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Guardados
                      </Link>
                      <Link href="/mensajes" role="menuitem" className={navButtonInactiveClasses} onClick={() => setShowUserMenu(false)}>
                        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Mensajes
                      </Link>
                      <Link href="/notificaciones" role="menuitem" className={navButtonInactiveClasses} onClick={() => setShowUserMenu(false)}>
                        <BellIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Notificaciones
                      </Link>
                      
                      <div className="border-t border-slate-200 dark:border-slate-700/50 my-1.5 mx-1.5" role="separator"></div>
                      
                      <button
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
                        role="menuitem"
                        className={`${navButtonInactiveClasses} w-full text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-700/20 dark:hover:text-red-400`}
                      >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 text-red-500 dark:text-red-500" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-500 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium hover:from-teal-600 hover:to-cyan-600 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel lateral del chat con ADIS */}
      {showAdisChat && (
        <div 
          className="fixed top-16 right-0 w-[400px] h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl transition-all transform"
          role="complementary"
          aria-label="Chat con ADIS"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-teal-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Chat con ADIS</h2>
            </div>
            <button
              onClick={() => setShowAdisChat(false)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar chat"
              title="Cerrar chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <p className="text-slate-600 dark:text-slate-400">
              ¡Hola! Soy ADIS, tu asistente virtual. ¿En qué puedo ayudarte hoy?
            </p>
          </div>
        </div>
      )}
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