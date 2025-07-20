'use client';

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export default function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <LoadingSpinner size="md" />,
  className = '',
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isVisible) {
      // Simular un pequeño delay para evitar flash
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={ref} className={className}>
      {!hasLoaded ? fallback : children}
    </div>
  );
}

// HOC para lazy loading de componentes
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(() => 
    Promise.resolve({ default: Component })
  );

  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner size="md" />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Hook para lazy loading de imágenes
export function useLazyImage(src: string, fallbackSrc?: string) {
  const [imageSrc, setImageSrc] = useState(fallbackSrc || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return { imageSrc, isLoading, error };
}

// Componente para lazy loading de imágenes
interface LazyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  fallbackSrc,
  className = '',
  width,
  height,
  priority = false,
}: LazyImageProps) {
  const { imageSrc, isLoading, error } = useLazyImage(src, fallbackSrc);

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  if (error && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-300 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Error</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
} 