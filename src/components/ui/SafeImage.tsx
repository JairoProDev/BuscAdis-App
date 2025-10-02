'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { getDefaultImageByCategory } from '@/utils/image-helpers';

interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  alt: string;
  categorySlug?: string;
  fallbackSrc?: string;
}

/**
 * SafeImage component that handles image loading errors gracefully
 * Falls back to category default image or custom fallback
 */
export default function SafeImage({
  src,
  alt,
  categorySlug,
  fallbackSrc,
  ...props
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Validate the src prop
  const isValidSrc = (url: string): boolean => {
    return (
      !!url &&
      url.trim() !== '' &&
      !url.includes('undefined') &&
      !url.includes('null')
    );
  };

  // Get the appropriate image source
  const getImageSrc = (): string => {
    // If there was an error loading the image, use fallback
    if (imageError) {
      if (fallbackSrc) return fallbackSrc;
      if (categorySlug) return getDefaultImageByCategory(categorySlug);
      return '/images/placeholder/productos.jpg';
    }

    // Validate current source
    if (isValidSrc(currentSrc)) {
      return currentSrc;
    }

    // Use fallback
    if (fallbackSrc) return fallbackSrc;
    if (categorySlug) return getDefaultImageByCategory(categorySlug);
    return '/images/placeholder/productos.jpg';
  };

  const handleError = () => {
    console.log('[SafeImage] Image load error for:', currentSrc);
    
    // Try fallback sources in order
    if (!imageError) {
      setImageError(true);
      
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      } else if (categorySlug) {
        setCurrentSrc(getDefaultImageByCategory(categorySlug));
      } else {
        setCurrentSrc('/images/placeholder/productos.jpg');
      }
    }
  };

  const imageSrc = getImageSrc();

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
}

