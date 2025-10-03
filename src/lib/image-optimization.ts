/**
 * IMAGE OPTIMIZATION SYSTEM FOR BUSCADIS
 * 
 * This system provides:
 * 1. Automatic image format conversion (WebP, AVIF)
 * 2. Responsive image generation
 * 3. Lazy loading with intersection observer
 * 4. Progressive loading with blur placeholders
 * 5. CDN optimization
 */

import { CacheKeys, cache } from './cache';

// ============================================================================
// CONFIGURATION
// ============================================================================

interface ImageOptimizationConfig {
  formats: string[];
  qualities: {
    webp: number;
    avif: number;
    jpeg: number;
    png: number;
  };
  sizes: {
    thumbnail: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  cdnUrl: string;
  enableLazyLoading: boolean;
  enableProgressiveLoading: boolean;
}

const IMAGE_CONFIG: ImageOptimizationConfig = {
  formats: ['avif', 'webp', 'jpeg'],
  qualities: {
    webp: 85,
    avif: 80,
    jpeg: 90,
    png: 95,
  },
  sizes: {
    thumbnail: 150,
    medium: 400,
    large: 800,
    xlarge: 1200,
  },
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  enableLazyLoading: true,
  enableProgressiveLoading: true,
};

// ============================================================================
// IMAGE UTILITIES
// ============================================================================

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  url: string;
  optimizedUrls: {
    avif?: string;
    webp?: string;
    jpeg: string;
  };
}

// ============================================================================
// IMAGE OPTIMIZATION FUNCTIONS
// ============================================================================

/**
 * Generate optimized image URLs for different formats and sizes
 */
export function generateOptimizedImageUrls(
  originalUrl: string,
  width: number,
  height?: number
): ImageMetadata['optimizedUrls'] {
  const baseUrl = IMAGE_CONFIG.cdnUrl || originalUrl;
  const aspectRatio = height ? `/${width}x${height}` : `/${width}`;
  
  return {
    avif: `${baseUrl}${aspectRatio}/avif`,
    webp: `${baseUrl}${aspectRatio}/webp`,
    jpeg: `${baseUrl}${aspectRatio}/jpeg`,
  };
}

/**
 * Generate responsive image sizes string for srcset
 */
export function generateSrcSet(
  originalUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
): string {
  return sizes
    .map(size => {
      const urls = generateOptimizedImageUrls(originalUrl, size);
      return `${urls.jpeg} ${size}w`;
    })
    .join(', ');
}

/**
 * Generate responsive image sizes string for srcset with multiple formats
 */
export function generateResponsiveSrcSet(
  originalUrl: string,
  format: 'avif' | 'webp' | 'jpeg' = 'jpeg',
  sizes: number[] = [400, 800, 1200, 1600]
): string {
  return sizes
    .map(size => {
      const urls = generateOptimizedImageUrls(originalUrl, size);
      return `${urls[format]} ${size}w`;
    })
    .join(', ');
}

/**
 * Generate blur placeholder for progressive loading
 */
export function generateBlurPlaceholder(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient blur
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Get the best image format supported by the browser
 */
export function getBestImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg';
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }
  
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }
  
  return 'jpeg';
}

// ============================================================================
// CACHED IMAGE METADATA
// ============================================================================

/**
 * Get cached image metadata or generate new
 */
export async function getImageMetadata(url: string): Promise<ImageMetadata | null> {
  const cacheKey = `image:metadata:${btoa(url)}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Generate metadata (this would typically call an API)
  const metadata: ImageMetadata = {
    width: 800,
    height: 600,
    format: 'jpeg',
    size: 0,
    url,
    optimizedUrls: generateOptimizedImageUrls(url, 800),
  };
  
  // Cache for 24 hours
  await cache.set(cacheKey, metadata, 86400);
  
  return metadata;
}

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

/**
 * Intersection Observer for lazy loading
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private elements: Map<Element, () => void> = new Map();

  constructor() {
    if (typeof window === 'undefined') return;
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.elements.get(entry.target);
            if (callback) {
              callback();
              this.elements.delete(entry.target);
              this.observer?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }

  observe(element: Element, callback: () => void): void {
    if (!this.observer) return;
    
    this.elements.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    if (!this.observer) return;
    
    this.elements.delete(element);
    this.observer.unobserve(element);
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.elements.clear();
    }
  }
}

// ============================================================================
// IMAGE PRELOADING
// ============================================================================

/**
 * Preload critical images
 */
export function preloadImage(src: string, format?: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = format ? generateOptimizedImageUrls(src, 800)[format as keyof ImageMetadata['optimizedUrls']] || src : src;
  
  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(images: Array<{ src: string; format?: string }>): void {
  images.forEach(({ src, format }) => preloadImage(src, format));
}

// ============================================================================
// IMAGE COMPRESSION
// ============================================================================

/**
 * Compress image on client side
 */
export function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export const imageOptimizer = {
  generateOptimizedImageUrls,
  generateSrcSet,
  generateResponsiveSrcSet,
  generateBlurPlaceholder,
  getBestImageFormat,
  getImageMetadata,
  preloadImage,
  preloadImages,
  compressImage,
  LazyImageLoader,
};

export default imageOptimizer;
