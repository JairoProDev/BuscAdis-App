/**
 * SWIPE ACTIONS COMPONENT FOR BUSCADIS
 * 
 * Features:
 * - Left/right swipe actions
 * - Customizable action buttons
 * - Smooth animations
 * - Touch gesture support
 * - Accessibility support
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import {
  HeartIcon,
  TrashIcon,
  ShareIcon,
  ArchiveBoxIcon,
  FlagIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES
// ============================================================================

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
  action: () => void;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  disabled?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

// ============================================================================
// ACTION COLORS
// ============================================================================

const actionColors = {
  red: {
    bg: 'bg-red-500 hover:bg-red-600',
    text: 'text-white'
  },
  blue: {
    bg: 'bg-blue-500 hover:bg-blue-600',
    text: 'text-white'
  },
  green: {
    bg: 'bg-green-500 hover:bg-green-600',
    text: 'text-white'
  },
  yellow: {
    bg: 'bg-yellow-500 hover:bg-yellow-600',
    text: 'text-white'
  },
  purple: {
    bg: 'bg-purple-500 hover:bg-purple-600',
    text: 'text-white'
  },
  gray: {
    bg: 'bg-gray-500 hover:bg-gray-600',
    text: 'text-white'
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className = '',
  disabled = false,
  onSwipeStart,
  onSwipeEnd
}: SwipeActionsProps) {
  
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-threshold, 0, threshold], [0.3, 1, 0.3]);
  const scale = useTransform(x, [-threshold, 0, threshold], [0.95, 1, 0.95]);

  const handleDragStart = useCallback(() => {
    if (disabled) return;
    setIsDragging(true);
    onSwipeStart?.();
  }, [disabled, onSwipeStart]);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    if (disabled) return;
    
    const deltaX = info.offset.x;
    
    // Determine swipe direction and active action
    if (Math.abs(deltaX) > 20) {
      if (deltaX > 0) {
        // Swiping right (showing left actions)
        setSwipeDirection('right');
        if (leftActions.length > 0) {
          const actionIndex = Math.min(
            Math.floor(deltaX / (threshold / leftActions.length)),
            leftActions.length - 1
          );
          setActiveAction(leftActions[actionIndex]?.id || null);
        }
      } else {
        // Swiping left (showing right actions)
        setSwipeDirection('left');
        if (rightActions.length > 0) {
          const actionIndex = Math.min(
            Math.floor(Math.abs(deltaX) / (threshold / rightActions.length)),
            rightActions.length - 1
          );
          setActiveAction(rightActions[actionIndex]?.id || null);
        }
      }
    } else {
      setSwipeDirection(null);
      setActiveAction(null);
    }
  }, [disabled, leftActions, rightActions, threshold]);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(false);
    onSwipeEnd?.();
    
    const deltaX = info.offset.x;
    const velocity = info.velocity.x;
    
    // Check if swipe meets threshold or has enough velocity
    if (Math.abs(deltaX) > threshold || Math.abs(velocity) > 500) {
      if (deltaX > 0 && leftActions.length > 0) {
        // Execute left action
        const actionIndex = Math.min(
          Math.floor(deltaX / (threshold / leftActions.length)),
          leftActions.length - 1
        );
        const action = leftActions[actionIndex];
        if (action) {
          action.action();
        }
      } else if (deltaX < 0 && rightActions.length > 0) {
        // Execute right action
        const actionIndex = Math.min(
          Math.floor(Math.abs(deltaX) / (threshold / rightActions.length)),
          rightActions.length - 1
        );
        const action = rightActions[actionIndex];
        if (action) {
          action.action();
        }
      }
    }
    
    // Reset state
    setSwipeDirection(null);
    setActiveAction(null);
    x.set(0);
  }, [disabled, leftActions, rightActions, threshold, x, onSwipeEnd]);

  // Render action buttons
  const renderActions = (actions: SwipeAction[], direction: 'left' | 'right') => {
    if (actions.length === 0) return null;

    const isActive = swipeDirection === direction;
    const totalWidth = threshold;
    const actionWidth = totalWidth / actions.length;

    return (
      <div className={`absolute top-0 bottom-0 flex ${direction === 'left' ? 'left-0' : 'right-0'}`}>
        {actions.map((action) => {
          const IconComponent = action.icon;
          const colors = actionColors[action.color];
          const isActionActive = activeAction === action.id;

          return (
            <motion.button
              key={action.id}
              className={`flex flex-col items-center justify-center ${colors.bg} ${colors.text} transition-all duration-200`}
              style={{
                width: actionWidth,
                minHeight: '100%'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isActionActive ? 1.1 : 1,
                opacity: isActive ? 1 : 0
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                action.action();
                x.set(0);
                setSwipeDirection(null);
                setActiveAction(null);
              }}
            >
              <IconComponent className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Action buttons */}
      {renderActions(leftActions, 'left')}
      {renderActions(rightActions, 'right')}

      {/* Main content */}
      <motion.div
        className="relative z-10 bg-white dark:bg-gray-800"
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          x,
          opacity,
          scale
        }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.div>

      {/* Swipe hint overlay */}
      {!disabled && !isDragging && (leftActions.length > 0 || rightActions.length > 0) && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <motion.div
            className="absolute top-1/2 left-2 transform -translate-y-1/2 opacity-0"
            animate={{ opacity: leftActions.length > 0 ? 0.3 : 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div className="flex items-center space-x-1 text-gray-400">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                ←
              </motion.div>
              <span className="text-xs">Desliza</span>
            </div>
          </motion.div>
          
          <motion.div
            className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-0"
            animate={{ opacity: rightActions.length > 0 ? 0.3 : 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <div className="flex items-center space-x-1 text-gray-400">
              <span className="text-xs">Desliza</span>
              <motion.div
                animate={{ x: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMMON ACTION PRESETS
// ============================================================================

export const commonActions = {
  favorite: {
    id: 'favorite',
    label: 'Favorito',
    icon: HeartIcon,
    color: 'red' as const,
    action: () => console.log('Added to favorites')
  },
  
  share: {
    id: 'share',
    label: 'Compartir',
    icon: ShareIcon,
    color: 'blue' as const,
    action: () => console.log('Shared')
  },
  
  delete: {
    id: 'delete',
    label: 'Eliminar',
    icon: TrashIcon,
    color: 'red' as const,
    action: () => console.log('Deleted')
  },
  
  archive: {
    id: 'archive',
    label: 'Archivar',
    icon: ArchiveBoxIcon,
    color: 'gray' as const,
    action: () => console.log('Archived')
  },
  
  flag: {
    id: 'flag',
    label: 'Reportar',
    icon: FlagIcon,
    color: 'yellow' as const,
    action: () => console.log('Flagged')
  },
  
  view: {
    id: 'view',
    label: 'Ver',
    icon: EyeIcon,
    color: 'green' as const,
    action: () => console.log('Viewed')
  }
};

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

interface SwipeCardProps {
  children: React.ReactNode;
  onFavorite?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SwipeCard({ 
  children, 
  onFavorite, 
  onShare, 
  onDelete, 
  onArchive,
  className = '',
  disabled = false 
}: SwipeCardProps) {
  const leftActions = [
    ...(onFavorite ? [{ ...commonActions.favorite, action: onFavorite }] : []),
    ...(onShare ? [{ ...commonActions.share, action: onShare }] : [])
  ];

  const rightActions = [
    ...(onArchive ? [{ ...commonActions.archive, action: onArchive }] : []),
    ...(onDelete ? [{ ...commonActions.delete, action: onDelete }] : [])
  ];

  return (
    <SwipeActions
      leftActions={leftActions}
      rightActions={rightActions}
      className={className}
      disabled={disabled}
    >
      {children}
    </SwipeActions>
  );
}

export function MinimalSwipeCard({ 
  children, 
  onFavorite, 
  onShare,
  className = '',
  disabled = false 
}: Pick<SwipeCardProps, 'children' | 'onFavorite' | 'onShare' | 'className' | 'disabled'>) {
  const leftActions = [
    ...(onFavorite ? [{ ...commonActions.favorite, action: onFavorite }] : [])
  ];

  const rightActions = [
    ...(onShare ? [{ ...commonActions.share, action: onShare }] : [])
  ];

  return (
    <SwipeActions
      leftActions={leftActions}
      rightActions={rightActions}
      className={className}
      disabled={disabled}
      threshold={60}
    >
      {children}
    </SwipeActions>
  );
}
