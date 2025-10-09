/**
 * MOBILE BOTTOM NAVIGATION COMPONENT FOR BUSCADIS
 * 
 * Features:
 * - TikTok-style bottom navigation
 * - Active state indicators
 * - Smooth animations
 * - Touch-optimized
 * - Accessibility support
 */

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  HeartIcon,
  UserIcon,
  MapPinIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  MagnifyingGlassIcon as SearchSolidIcon,
  HeartIcon as HeartSolidIcon,
  UserIcon as UserSolidIcon,
  MapPinIcon as MapSolidIcon,
  ChartBarIcon as ChartSolidIcon
} from '@heroicons/react/24/solid';

// ============================================================================
// INTERFACES
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeIcon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  isNew?: boolean;
}

interface MobileBottomNavigationProps {
  className?: string;
  variant?: 'default' | 'compact' | 'extended';
  showLabels?: boolean;
}

// ============================================================================
// NAVIGATION ITEMS CONFIGURATION
// ============================================================================

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: HomeIcon,
    activeIcon: HomeSolidIcon,
    href: '/'
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: MagnifyingGlassIcon,
    activeIcon: SearchSolidIcon,
    href: '/buscar'
  },
  {
    id: 'create',
    label: 'Publicar',
    icon: PlusIcon,
    activeIcon: PlusIcon,
    href: '/publicar',
    isNew: true
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: HeartIcon,
    activeIcon: HeartSolidIcon,
    href: '/favoritos',
    badge: 3
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: UserIcon,
    activeIcon: UserSolidIcon,
    href: '/perfil'
  }
];

// ============================================================================
// COMPACT NAVIGATION (3 items)
// ============================================================================

const COMPACT_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: HomeIcon,
    activeIcon: HomeSolidIcon,
    href: '/'
  },
  {
    id: 'create',
    label: 'Publicar',
    icon: PlusIcon,
    activeIcon: PlusIcon,
    href: '/publicar'
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: UserIcon,
    activeIcon: UserSolidIcon,
    href: '/perfil'
  }
];

// ============================================================================
// EXTENDED NAVIGATION (6 items)
// ============================================================================

const EXTENDED_NAV_ITEMS: NavItem[] = [
  ...NAV_ITEMS,
  {
    id: 'nearby',
    label: 'Cerca',
    icon: MapPinIcon,
    activeIcon: MapSolidIcon,
    href: '/cerca'
  },
  {
    id: 'analytics',
    label: 'Estadísticas',
    icon: ChartBarIcon,
    activeIcon: ChartSolidIcon,
    href: '/analytics'
  }
];

// ============================================================================
// NAVIGATION ITEM COMPONENT
// ============================================================================

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  showLabels: boolean;
  onClick: () => void;
}

function NavItemComponent({ item, isActive, showLabels, onClick }: NavItemComponentProps) {
  const IconComponent = isActive ? item.activeIcon : item.icon;

  const itemVariants = {
    inactive: {
      scale: 1,
      y: 0,
      transition: { duration: 0.2 }
    },
    active: {
      scale: 1.1,
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  const iconVariants = {
    inactive: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.2 }
    },
    active: {
      scale: 1.2,
      rotate: 360,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.button
      className="relative flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200"
      variants={itemVariants}
      animate={isActive ? 'active' : 'inactive'}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background for active state */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <div className="relative z-10">
        <motion.div variants={iconVariants} animate={isActive ? 'active' : 'inactive'}>
          <IconComponent className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
        </motion.div>

        {/* Badge */}
        {item.badge && item.badge > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            {item.badge > 99 ? '99+' : item.badge}
          </motion.div>
        )}

        {/* New indicator */}
        {item.isNew && (
          <motion.div
            className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-3 h-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          />
        )}
      </div>

      {/* Label */}
      {showLabels && (
        <motion.span
          className={`text-xs font-medium mt-1 relative z-10 ${
            isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'
          }`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {item.label}
        </motion.span>
      )}
    </motion.button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MobileBottomNavigation({
  className = '',
  variant = 'default',
  showLabels = true
}: MobileBottomNavigationProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get navigation items based on variant
  const getNavItems = (): NavItem[] => {
    switch (variant) {
      case 'compact':
        return COMPACT_NAV_ITEMS;
      case 'extended':
        return EXTENDED_NAV_ITEMS;
      default:
        return NAV_ITEMS;
    }
  };

  const navItems = getNavItems();

  // Handle scroll to hide/show navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navigation when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Check if current path matches nav item
  const isActivePath = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const containerVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    },
    hidden: {
      y: 100,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.55, 0.06, 0.68, 0.19] as [number, number, number, number]
      }
    }
  };

  return (
    <motion.div
      className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      variants={containerVariants}
      animate={isVisible ? 'visible' : 'hidden'}
      initial="visible"
    >
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700" />
      
      {/* Safe area for devices with home indicator */}
      <div className="pb-safe-area-inset-bottom">
        <div className="px-4 py-2">
          <div className={`flex items-center justify-around max-w-md mx-auto ${
            variant === 'compact' ? 'space-x-8' : 
            variant === 'extended' ? 'space-x-2' : 'space-x-4'
          }`}>
            {navItems.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={isActivePath(item.href)}
                showLabels={showLabels}
                onClick={() => {
                  // Handle navigation
                  window.location.href = item.href;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

export function CompactBottomNavigation({ className = '' }: { className?: string }) {
  return (
    <MobileBottomNavigation
      variant="compact"
      showLabels={false}
      className={className}
    />
  );
}

export function ExtendedBottomNavigation({ className = '' }: { className?: string }) {
  return (
    <MobileBottomNavigation
      variant="extended"
      showLabels={true}
      className={className}
    />
  );
}

export function TikTokStyleBottomNavigation({ className = '' }: { className?: string }) {
  return (
    <MobileBottomNavigation
      variant="default"
      showLabels={false}
      className={className}
    />
  );
}
