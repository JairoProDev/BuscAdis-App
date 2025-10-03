/**
 * PULL TO REFRESH COMPONENT FOR BUSCADIS
 * 
 * Features:
 * - Native-like pull to refresh
 * - Customizable refresh indicator
 * - Smooth animations
 * - Touch gesture support
 * - Loading states
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES
// ============================================================================

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
  disabled?: boolean;
  refreshText?: string;
  releaseText?: string;
  refreshingText?: string;
  successText?: string;
  errorText?: string;
  showSuccessState?: boolean;
  successDuration?: number;
}

interface RefreshState {
  status: 'idle' | 'pulling' | 'ready' | 'refreshing' | 'success' | 'error';
  progress: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className = '',
  disabled = false,
  refreshText = 'Desliza hacia abajo para actualizar',
  releaseText = 'Suelta para actualizar',
  refreshingText = 'Actualizando...',
  successText = '¡Actualizado!',
  errorText = 'Error al actualizar',
  showSuccessState = true,
  successDuration = 1500
}: PullToRefreshProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [refreshState, setRefreshState] = useState<RefreshState>({
    status: 'idle',
    progress: 0
  });
  
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion values for smooth animations
  const y = useMotionValue(0);
  const rotate = useTransform(y, [0, threshold], [0, 180]);
  const scale = useTransform(y, [0, threshold], [0.8, 1]);
  const opacity = useTransform(y, [0, threshold * 0.5], [0, 1]);

  // Calculate progress based on pull distance
  const progress = Math.min(currentY / threshold, 1);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || refreshState.status === 'refreshing') return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setCurrentY(0);
    setIsDragging(true);
    
    // Only allow pull to refresh if at the top of the page
    if (window.scrollY === 0) {
      e.preventDefault();
    }
  }, [disabled, refreshState.status]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || disabled || refreshState.status === 'refreshing') return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY;
    
    // Only allow downward pull
    if (deltaY > 0 && window.scrollY === 0) {
      e.preventDefault();
      setCurrentY(deltaY);
      y.set(deltaY);
      
      // Update refresh state based on progress
      if (deltaY >= threshold) {
        setRefreshState({ status: 'ready', progress: 1 });
      } else {
        setRefreshState({ status: 'pulling', progress: deltaY / threshold });
      }
    }
  }, [isDragging, disabled, refreshState.status, startY, threshold, y]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    
    if (currentY >= threshold && refreshState.status === 'ready') {
      // Trigger refresh
      setRefreshState({ status: 'refreshing', progress: 1 });
      
      try {
        await onRefresh();
        setRefreshState({ status: 'success', progress: 1 });
        
        if (showSuccessState) {
          setTimeout(() => {
            setRefreshState({ status: 'idle', progress: 0 });
            y.set(0);
            setCurrentY(0);
          }, successDuration);
        } else {
          setRefreshState({ status: 'idle', progress: 0 });
          y.set(0);
          setCurrentY(0);
        }
      } catch (error) {
        setRefreshState({ status: 'error', progress: 1 });
        
        setTimeout(() => {
          setRefreshState({ status: 'idle', progress: 0 });
          y.set(0);
          setCurrentY(0);
        }, 2000);
      }
    } else {
      // Reset to idle state
      setRefreshState({ status: 'idle', progress: 0 });
      y.set(0);
      setCurrentY(0);
    }
  }, [isDragging, disabled, currentY, threshold, refreshState.status, onRefresh, showSuccessState, successDuration, y]);

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Get status text based on current state
  const getStatusText = () => {
    switch (refreshState.status) {
      case 'pulling':
        return refreshText;
      case 'ready':
        return releaseText;
      case 'refreshing':
        return refreshingText;
      case 'success':
        return successText;
      case 'error':
        return errorText;
      default:
        return '';
    }
  };

  // Get icon based on current state
  const getStatusIcon = () => {
    switch (refreshState.status) {
      case 'pulling':
      case 'ready':
        return <ArrowPathIcon className="w-6 h-6" />;
      case 'refreshing':
        return <ArrowPathIcon className="w-6 h-6 animate-spin" />;
      case 'success':
        return <CheckIcon className="w-6 h-6" />;
      case 'error':
        return <ArrowPathIcon className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(isDragging || refreshState.status !== 'idle') && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
            style={{
              height: Math.max(currentY, 60),
              paddingTop: Math.max(currentY - 60, 0)
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="flex flex-col items-center justify-center space-y-2"
              style={{
                opacity,
                scale,
                transform: `translateY(${Math.max(0, currentY - 60)}px)`
              }}
            >
              {/* Icon */}
              <motion.div
                className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30"
                style={{ rotate }}
              >
                {getStatusIcon()}
              </motion.div>
              
              {/* Text */}
              <motion.span
                className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center px-4"
                style={{ opacity }}
              >
                {getStatusText()}
              </motion.span>
              
              {/* Progress bar */}
              {refreshState.status === 'pulling' && (
                <motion.div
                  className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  style={{ opacity }}
                >
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${progress * 100}%`,
                      transition: 'width 0.1s ease-out'
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        style={{
          y: refreshState.status === 'refreshing' ? 60 : 0,
          transition: 'y 0.3s ease-out'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

interface CustomPullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function MinimalPullToRefresh({ 
  onRefresh, 
  children, 
  className = '',
  disabled = false 
}: CustomPullToRefreshProps) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      className={className}
      disabled={disabled}
      threshold={60}
      refreshText="Desliza para actualizar"
      releaseText="Suelta"
      refreshingText="Actualizando..."
      showSuccessState={false}
    >
      {children}
    </PullToRefresh>
  );
}

export function DetailedPullToRefresh({ 
  onRefresh, 
  children, 
  className = '',
  disabled = false 
}: CustomPullToRefreshProps) {
  return (
    <PullToRefresh
      onRefresh={onRefresh}
      className={className}
      disabled={disabled}
      threshold={100}
      refreshText="Desliza hacia abajo para actualizar el contenido"
      releaseText="Suelta para actualizar ahora"
      refreshingText="Obteniendo contenido actualizado..."
      successText="¡Contenido actualizado exitosamente!"
      errorText="Error al actualizar. Intenta nuevamente."
      showSuccessState={true}
      successDuration={2000}
    >
      {children}
    </PullToRefresh>
  );
}
