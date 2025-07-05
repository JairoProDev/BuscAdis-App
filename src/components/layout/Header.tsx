'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Importar useRouter
import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon, // Para Logout
  BookmarkIcon, // Para Guardados
  ChatBubbleOvalLeftEllipsisIcon, // Para Mensajes
  BellIcon, // Para Notificaciones
  Cog6ToothIcon, // Un ícono genérico para "Mi Perfil" o "Configuración" si UserCircle se usa en el botón
  ChevronDownIcon, // Para indicar que es un desplegable
  MapPinIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  GlobeAltIcon,
  HeartIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';

import { ThemeToggle } from '@/components/theme';
import BuscadisLogo from '@/components/icons/BuscadisLogo';
import LocationSelector from '@/components/search/LocationSelector';
import LanguageSelectorMenuItem from '@/components/ui/LanguageSelectorMenuItem';
import NavigationMenu from './NavigationMenu';
import AdisChat from './AdisChat';

interface User {
  id: string;
  full_name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string; // Mantengo esto por si lo usas después
}

interface LocationData {
  country?: {
    name: string;
  };
  continent?: {
    name: string;
  };
  department?: {
    name: string;
  };
  province?: {
    name: string;
  };
  district?: {
    name: string;
  };
}

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdisChat, setShowAdisChat] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({});
  const pathname = usePathname();
  const router = useRouter(); // Inicializar useRouter

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);


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
      // localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    syncAuth();
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, [syncAuth]);

  useEffect(() => {
    if (!showUserMenu) return;

    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          setShowUserMenu(false);
          userMenuButtonRef.current?.focus();
        }
      }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    firstMenuItemRef.current?.focus();

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

  useEffect(() => {
    if (isAuthenticated && isMounted && user) {
      const existingToast = document.querySelector('.login-toast');
      if (existingToast) return;

      const toast = document.createElement('div');
      toast.textContent = `¡Bienvenido, ${user?.firstName || user?.full_name || user?.email || 'Usuario'}!`;
      toast.className = 'login-toast fixed top-5 right-5 z-[10000] bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-in-from-right';
      document.body.appendChild(toast);

      let visibilityTimeoutId: NodeJS.Timeout;
      let removalTimeoutId: NodeJS.Timeout;

      visibilityTimeoutId = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        removalTimeoutId = setTimeout(() => toast.remove(), 300);
      }, 2700);

      return () => {
        clearTimeout(visibilityTimeoutId);
        clearTimeout(removalTimeoutId);
        if (document.body.contains(toast)) { // Verificar si el toast sigue en el DOM
            toast.remove();
        }
      }
    }
  }, [isAuthenticated, user, isMounted]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowUserMenu(false);
    userMenuButtonRef.current?.focus();
    router.push('/'); // Usar Next Router
  };

  const toggleUserMenu = () => {
    setShowUserMenu(prev => !prev);
  };
  const UserAvatar = () => (
    <div className="flex items-center gap-2">
      {user?.avatarUrl ? (
        <img 
          src={user.avatarUrl} 
          alt={`Avatar de ${user.firstName || user.full_name || 'Usuario'}`}
          className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
        />
      ) : (
        <UserCircleIcon className="w-8 h-8 text-slate-600 dark:text-slate-300" />
      )}
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden lg:block">
        {user?.firstName || user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'}
      </span>
    </div>
  );

  const AuthDropdown = () => {
    const [showAuthMenu, setShowAuthMenu] = useState(false);

    return (
      <div className="relative">
        <button
          onClick={() => setShowAuthMenu(!showAuthMenu)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium hover:from-teal-600 hover:to-cyan-600 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1"
          aria-label="Opciones de autenticación"
          aria-expanded={showAuthMenu ? "true" : "false"}
        >
          <UserIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Cuenta</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAuthMenu ? 'rotate-180' : ''}`} />
        </button>

        {showAuthMenu && (
          <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
            <div className="py-1">
              <Link
                href="/login"
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setShowAuthMenu(false)}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-t border-slate-100 dark:border-slate-700"
                onClick={() => setShowAuthMenu(false)}
              >
                <UserPlusIcon className="w-4 h-4" />
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };



  // Estilos para los items del menú desplegable (CORREGIDO)
  const menuItemClasses = "flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-md transition-colors duration-150 focus:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-700/80 focus-visible:ring-1 focus-visible:ring-teal-500";
  const menuItemIconClasses = "w-5 h-5 flex-shrink-0 text-slate-500 dark:text-slate-400"; // flex-shrink-0 para evitar que el icono se encoja

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setShowLocationSelector(false);
  };

  const getLocationDisplayName = () => {
    if (!selectedLocation || Object.keys(selectedLocation).length === 0) {
      return 'Perú'; // Default
    }
    
    // Mostrar el nivel más específico disponible
    if (selectedLocation.district?.name) return selectedLocation.district.name;
    if (selectedLocation.province?.name) return selectedLocation.province.name;
    if (selectedLocation.department?.name) return selectedLocation.department.name;
    if (selectedLocation.country?.name) return selectedLocation.country.name;
    if (selectedLocation.continent?.name) return selectedLocation.continent.name;
    
    return 'Perú';
  };


  const userAuthSection = !isMounted ? (
    <div className="flex items-center space-x-2 h-10"> {/* Placeholder para evitar CLS */}
      <div className="w-20 h-9 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
      <div className="w-24 h-9 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
    </div>
  ) : isAuthenticated && user ? (
    <div className="relative" ref={userMenuRef}>
      <button
        ref={userMenuButtonRef}
        onClick={toggleUserMenu}
        className="group flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
        aria-label="Menú de usuario"
        aria-expanded={showUserMenu ? "true" : "false"}
        aria-controls="user-menu-dropdown"
        title="Abrir menú de usuario"
      >
        <UserAvatar />
        <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 group-hover:text-teal-500 dark:group-hover:text-teal-400 ${showUserMenu ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {showUserMenu && (
        <div
          id="user-menu-dropdown"
          className="absolute right-0 mt-2 w-60 origin-top-right bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
        >
          <div className="px-1.5 py-1.5" role="none">
            <div className="px-3.5 py-2.5 mb-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" role="presentation">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.full_name || user.email || 'Usuario'}
              </p>
              {user.email && (user.firstName || user.lastName || user.full_name) && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate" role="presentation">{user.email}</p>
              )}
            </div>

            {/* ÍTEMS DEL MENÚ CORREGIDOS */}
            <Link ref={firstMenuItemRef} href="/perfil" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
              <Cog6ToothIcon className={menuItemIconClasses} />
              <span>Mi Perfil</span>
            </Link>
            <Link href="/mis-anuncios" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
              <SpeakerWaveIcon className={menuItemIconClasses} />
              <span>Mis Publicaciones</span>
            </Link>
            <Link href="/guardados" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
              <HeartIcon className={menuItemIconClasses} />
              <span>Guardados</span>
            </Link>
            <Link href="/mensajes" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
              <ChatBubbleOvalLeftEllipsisIcon className={menuItemIconClasses} />
              <span>Mensajes</span>
            </Link>
            <Link href="/notificaciones" role="menuitem" className={menuItemClasses} onClick={() => setShowUserMenu(false)}>
              <BellIcon className={menuItemIconClasses} />
              <span>Notificaciones</span>
            </Link>

            {/* Selector de Idioma */}
            <LanguageSelectorMenuItem 
              menuItemClasses={menuItemClasses}
              menuItemIconClasses={menuItemIconClasses}
              onClose={() => setShowUserMenu(false)}
            />

            <div className="border-t border-slate-200 dark:border-slate-700/50 my-1.5 mx-1.5" role="separator"></div>

            <button
              onClick={handleLogout}
              role="menuitem"
              className={`${menuItemClasses} w-full text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 hover:!bg-red-100/50 dark:hover:!bg-red-500/10`} // Añadido ! para hover bg
            >
              <ArrowLeftOnRectangleIcon className={`${menuItemIconClasses} !text-red-600 dark:!text-red-500`} /> {/* Forzar color rojo del ícono */}
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <AuthDropdown />
  );

  return (
    <header className="relative z-[1000] w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link 
            href="/" 
            className="flex items-center gap-2 flex-shrink-0 group" 
            aria-label="Ir al inicio de BuscAdis"
          >
            <BuscadisLogo 
              width={32} 
              height={32} 
              variant="gradient" 
              className="group-hover:scale-105 transition-transform duration-200" 
            />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              BuscAdis
            </span>
          </Link>

          {/* NAVEGACIÓN PRINCIPAL */}
          <NavigationMenu 
            variant="desktop" 
            onAdisClick={() => setShowAdisChat(!showAdisChat)}
            showAdisChat={showAdisChat}
          />

          <div className="flex items-center space-x-1.5 md:space-x-2">
            {/* Selector de Ubicación */}
            <button
              onClick={() => setShowLocationSelector(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 border border-slate-200 dark:border-slate-700"
              aria-label="Seleccionar ubicación"
              title="Cambiar ubicación"
            >
              <MapPinIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span className="text-sm text-slate-700 dark:text-slate-200 font-medium hidden sm:block">
                {getLocationDisplayName()}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            
            {/* Toggle de Tema */}
            <ThemeToggle />
            
            {/* Autenticación/Usuario */}
            {userAuthSection}
          </div>
        </div>
      </div>

    {/* Aquí iría tu barra de navegación inferior para móviles si la defines en este componente */}
    {/* Ejemplo de cómo se podría ver si no es un componente separado:
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[900] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/50 flex justify-around items-center h-16">
        // Items de la barra inferior
      </nav>
    */}

      <AdisChat 
        isOpen={showAdisChat} 
        onClose={() => setShowAdisChat(false)} 
      />

      {showLocationSelector && (
        <LocationSelector
          onClose={() => setShowLocationSelector(false)}
          onLocationSelect={handleLocationSelect}
          initialSelection={selectedLocation}
        />
      )}
    </header>
  );
}