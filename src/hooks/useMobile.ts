/**
 * MOBILE UTILITIES HOOKS FOR BUSCADIS
 * 
 * Features:
 * - Device detection
 * - Touch gesture handling
 * - Screen orientation
 * - Viewport dimensions
 * - Mobile-specific utilities
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// INTERFACES
// ============================================================================

interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  devicePixelRatio: number;
}

interface TouchGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

interface SwipeOptions {
  threshold?: number;
  velocityThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  preventDefault?: boolean;
}

// ============================================================================
// DEVICE DETECTION HOOK
// ============================================================================

export function useDeviceDetection(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  userAgent: string;
} {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    userAgent: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    
    // Mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Tablet detection
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent) || 
                    (window.innerWidth >= 768 && window.innerWidth <= 1024);
    
    // Desktop detection
    const isDesktop = !isMobile && !isTablet;
    
    // OS detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      userAgent
    });
  }, []);

  return deviceInfo;
}

// ============================================================================
// VIEWPORT HOOK
// ============================================================================

export function useViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    devicePixelRatio: 1
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width <= 1024,
        isDesktop: width > 1024,
        orientation: width > height ? 'landscape' : 'portrait',
        devicePixelRatio: window.devicePixelRatio || 1
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
}

// ============================================================================
// TOUCH GESTURE HOOK
// ============================================================================

export function useTouchGesture(elementRef: React.RefObject<HTMLElement>, options: SwipeOptions = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    preventDefault = true
  } = options;

  const [gesture, setGesture] = useState<TouchGesture>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    direction: null
  });

  const [isGestureActive, setIsGestureActive] = useState(false);
  const startTimeRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) e.preventDefault();
    
    const touch = e.touches[0];
    const startTime = Date.now();
    
    startTimeRef.current = startTime;
    
    setGesture({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null
    });
    
    setIsGestureActive(true);
  }, [preventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) e.preventDefault();
    if (!isGestureActive) return;
    
    const touch = e.touches[0];
    const currentTime = Date.now();
    const deltaTime = currentTime - startTimeRef.current;
    
    const deltaX = touch.clientX - gesture.startX;
    const deltaY = touch.clientY - gesture.startY;
    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
    
    // Determine direction
    let direction: TouchGesture['direction'] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    setGesture(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      velocity,
      direction
    }));
  }, [isGestureActive, gesture.startX, gesture.startY, preventDefault]);

  const handleTouchEnd = useCallback(() => {
    if (!isGestureActive) return;
    
    setIsGestureActive(false);
    
    // Check if gesture meets threshold
    if (Math.abs(gesture.deltaX) > threshold || Math.abs(gesture.deltaY) > threshold) {
      // Check velocity threshold
      if (gesture.velocity > velocityThreshold) {
        // Execute swipe callback
        switch (gesture.direction) {
          case 'left':
            onSwipeLeft?.();
            break;
          case 'right':
            onSwipeRight?.();
            break;
          case 'up':
            onSwipeUp?.();
            break;
          case 'down':
            onSwipeDown?.();
            break;
        }
      }
    }
    
    // Reset gesture
    setGesture({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null
    });
  }, [isGestureActive, gesture, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return {
    gesture,
    isGestureActive,
    isSwiping: isGestureActive && (Math.abs(gesture.deltaX) > 10 || Math.abs(gesture.deltaY) > 10)
  };
}

// ============================================================================
// SCROLL DETECTION HOOK
// ============================================================================

export function useScrollDirection(): {
  direction: 'up' | 'down' | null;
  isScrolling: boolean;
  scrollY: number;
} {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const lastScrollY = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsScrolling(true);
      
      // Set direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setDirection('up');
      }
      
      setScrollY(currentScrollY);
      lastScrollY.current = currentScrollY;
      
      // Set timeout to stop scrolling state
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setDirection(null);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { direction, isScrolling, scrollY };
}

// ============================================================================
// SAFE AREA HOOK
// ============================================================================

export function useSafeArea(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
  hasNotch: boolean;
} {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    hasNotch: false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      const top = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0');
      const right = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0');
      const bottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0');
      const left = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0');
      
      setSafeArea({
        top,
        right,
        bottom,
        left,
        hasNotch: top > 20 // Heuristic for notch detection
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);

    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}

// ============================================================================
// NETWORK STATUS HOOK
// ============================================================================

export function useNetworkStatus(): {
  isOnline: boolean;
  connectionType: string;
  downlink: number;
} {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    connectionType: 'unknown',
    downlink: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateNetworkStatus = () => {
      const nav = navigator as unknown as Record<string, unknown>;
      const connection = (nav.connection || nav.mozConnection || nav.webkitConnection) as Record<string, unknown> | undefined;
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        connectionType: (connection?.effectiveType as string) || 'unknown',
        downlink: (connection?.downlink as number) || 0
      });
    };

    updateNetworkStatus();
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    const nav = navigator as unknown as Record<string, unknown>;
    const connection = nav.connection as Record<string, unknown> | undefined;
    if (connection && typeof connection.addEventListener === 'function') {
      (connection.addEventListener as (event: string, handler: () => void) => void)('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (connection && typeof connection.removeEventListener === 'function') {
        (connection.removeEventListener as (event: string, handler: () => void) => void)('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}
