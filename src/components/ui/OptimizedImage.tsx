/**
 * OPTIMIZED IMAGE COMPONENT FOR BUSCADIS
 * 
 * Features:
 * - Automatic format detection (AVIF, WebP, JPEG)
 * - Responsive images with srcset
 * - Lazy loading with intersection observer
 * - Progressive loading with blur placeholders
 * - Error handling with fallbacks
 * - Performance monitoring
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  imageOptimizer, 
  OptimizedImageProps, 
  LazyImageLoader 
} from '@/lib/image-optimization';

// ============================================================================
// INTERFACES
// ============================================================================

interface AdvancedOptimizedImageProps extends OptimizedImageProps {
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  showLoader?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  currentSrc: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  placeholder = 'blur',
  blurDataURL,
  lazy = true,
  onLoad,
  onError,
  fallbackSrc,
  showLoader = false,
  aspectRatio,
  objectFit = 'cover',
  ...props
}: AdvancedOptimizedImageProps) {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [imageState, setImageState] = useState<ImageState>({
    loaded: false,
    error: false,
    currentSrc: src,
  });
  
  const [isInView, setIsInView] = useState(priority || !lazy);
  const [isLoading, setIsLoading] = useState(true);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const loaderRef = useRef<LazyImageLoader | null>(null);
  
  // ============================================================================
  // LAZY LOADING SETUP
  // ============================================================================
  
  useEffect(() => {
    if (!lazy || priority) return;
    
    loaderRef.current = new LazyImageLoader();
    
    const element = imgRef.current;
    if (!element) return;
    
    const callback = () => {
      setIsInView(true);
      setIsLoading(true);
    };
    
    loaderRef.current.observe(element, callback);
    
    return () => {
      if (loaderRef.current && element) {
        loaderRef.current.unobserve(element);
        loaderRef.current.disconnect();
      }
    };
  }, [lazy, priority]);
  
  // ============================================================================
  // IMAGE OPTIMIZATION
  // ============================================================================
  
  const getOptimizedSrc = useCallback(() => {
    if (!isInView) return fallbackSrc || src;
    
    // Generate optimized URLs based on dimensions
    const targetWidth = width || 800;
    const targetHeight = height || 600;
    
    const optimizedUrls = imageOptimizer.generateOptimizedImageUrls(
      imageState.currentSrc,
      targetWidth,
      targetHeight
    );
    
    // Get best format supported by browser
    const bestFormat = imageOptimizer.getBestImageFormat();
    return optimizedUrls[bestFormat] || optimizedUrls.jpeg;
  }, [isInView, imageState.currentSrc, width, height, fallbackSrc, src]);
  
  const generateSrcSet = useCallback(() => {
    if (!isInView) return undefined;
    
    const bestFormat = imageOptimizer.getBestImageFormat();
    return imageOptimizer.generateResponsiveSrcSet(
      imageState.currentSrc,
      bestFormat,
      [400, 800, 1200, 1600]
    );
  }, [isInView, imageState.currentSrc]);
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleLoad = useCallback(() => {
    setImageState(prev => ({ ...prev, loaded: true, error: false }));
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback(() => {
    if (imageState.currentSrc === fallbackSrc || !fallbackSrc) {
      // Already using fallback or no fallback available, show error state
      setImageState(prev => ({ ...prev, error: true }));
      setIsLoading(false);
      onError?.();
    } else {
      // Try fallback
      setImageState(prev => ({ 
        ...prev, 
        currentSrc: fallbackSrc,
        error: false 
      }));
    }
  }, [imageState.currentSrc, fallbackSrc, onError]);
  
  // ============================================================================
  // BLUR PLACEHOLDER
  // ============================================================================
  
  const getBlurDataURL = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'empty') return undefined;
    
    // Generate default blur placeholder
    if (width && height) {
      return imageOptimizer.generateBlurPlaceholder(width, height);
    }
    
    // Default blur placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }, [blurDataURL, placeholder, width, height]);
  
  // ============================================================================
  // STYLES
  // ============================================================================
  
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
    backgroundColor: '#f3f4f6',
  };
  
  const imageStyle: React.CSSProperties = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: imageState.loaded ? 1 : 0,
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (imageState.error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={containerStyle}
        ref={imgRef}
      >
        <div className="text-center text-gray-500">
          <svg 
            className="w-8 h-8 mx-auto mb-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p className="text-xs">Imagen no disponible</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`relative ${className}`}
      style={containerStyle}
      ref={imgRef}
    >
      {/* Loading Spinner */}
      {showLoader && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Optimized Image */}
      {isInView && (
        <Image
          src={getOptimizedSrc()}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={getBlurDataURL()}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          className="transition-opacity duration-300"
          {...props}
        />
      )}
      
      {/* Lazy Loading Placeholder */}
      {!isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

export function ThumbnailImage(props: AdvancedOptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      width={150}
      height={150}
      sizes="150px"
      objectFit="cover"
    />
  );
}

export function HeroImage(props: AdvancedOptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      sizes="100vw"
      objectFit="cover"
      showLoader={true}
    />
  );
}

export function CardImage(props: AdvancedOptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      width={400}
      height={300}
      sizes="(max-width: 768px) 100vw, 400px"
      objectFit="cover"
      aspectRatio="4/3"
    />
  );
}

export function AvatarImage(props: AdvancedOptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      width={40}
      height={40}
      sizes="40px"
      objectFit="cover"
      aspectRatio="1/1"
      fallbackSrc="/images/default-avatar.jpg"
    />
  );
}