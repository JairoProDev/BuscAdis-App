import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
  isMain?: boolean
}

export function useNavigation(navItems: NavItem[]) {
  const pathname = usePathname()

  const isActiveRoute = (path: string) => {
    // Página principal (buscar) puede estar en / o /buscar
    if (path === '/buscar') {
      return pathname === '/' || pathname === '/buscar'
    }
    
    // Página de inicio
    if (path === '/inicio') {
      return pathname === '/inicio'
    }
    
    // ADIS no tiene ruta activa
    if (path === '#adis') {
      return false
    }
    
    // Para otras rutas, verificar si la ruta actual empieza con el path
    return pathname?.startsWith(path)
  }

  const activeItem = useMemo(() => {
    return navItems.find(item => isActiveRoute(item.path)) || null;
  }, [navItems, isActiveRoute]);

  const getRouteTitle = () => {
    if (activeItem) {
      return activeItem.label
    }
    
    // Títulos especiales para rutas específicas
    switch (pathname) {
      case '/':
        return 'Buscar'
      case '/perfil':
        return 'Mi Perfil'
      case '/mis-anuncios':
        return 'Mis Anuncios'
      case '/guardados':
        return 'Guardados'
      case '/mensajes':
        return 'Mensajes'
      case '/notificaciones':
        return 'Notificaciones'
      default:
        return 'BuscAdis'
    }
  }

  const shouldShowSearch = () => {
    // Mostrar búsqueda en la página principal y páginas de categorías
    return pathname === '/' || 
           pathname === '/buscar' || 
           pathname?.startsWith('/empleos') ||
           pathname?.startsWith('/inmuebles') ||
           pathname?.startsWith('/vehiculos') ||
           pathname?.startsWith('/anuncios')
  }

  return {
    isActiveRoute,
    activeItem,
    getRouteTitle,
    shouldShowSearch,
    currentPath: pathname
  }
} 