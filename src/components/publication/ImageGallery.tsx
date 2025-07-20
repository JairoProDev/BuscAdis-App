import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PublicationImage } from '@/types/publication';
import { getOptimizedImageUrl } from '@/utils/image-helpers';

// Nueva interfaz para reemplazar 'any'
interface GalleryImage {
  secureUrl?: string;
  url?: string;
}

interface ImageGalleryProps {
  images: PublicationImage[];
  className?: string;
}

export function ImageGallery({ images, className = '' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Si no hay imágenes, no renderizar nada
  if (!images || images.length === 0) {
    return null;
  }
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };
  
  // Obtener la imagen principal
  const mainImage = images[0];
  const mainImageUrl = (mainImage as GalleryImage)?.secureUrl || (mainImage as GalleryImage)?.url || '';
  
  return (
    <>
      <div className={`relative ${className}`}>
        {/* Imagen principal */}
        <div 
          className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer relative"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={getOptimizedImageUrl(mainImageUrl)}
            alt="Imagen principal"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          
          {/* Indicador de cantidad de imágenes */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs">
              {images.length} fotos
            </div>
          )}
        </div>
        
        {/* Miniaturas (si hay más de 1 imagen) */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {images.slice(0, 4).map((image, idx) => (
              <div
                key={`gallery-${idx}-${Date.now()}`}
                onClick={() => openLightbox(idx)}
                className={`
                  aspect-square rounded-md overflow-hidden cursor-pointer relative
                  ${currentIndex === idx ? 'ring-2 ring-primary-500' : ''}
                  ${idx >= 3 && images.length > 4 ? 'relative' : ''}
                `}
              >
                <Image
                  src={(image as GalleryImage).secureUrl || (image as GalleryImage).url || '/placeholder-image.jpg'}
                  alt={`Miniatura ${idx + 1}`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 25vw, 10vw"
                />
                
                {/* Mostrar "Ver más" en la última miniatura */}
                {idx === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Lightbox de imágenes */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <div className="relative h-[80vh] flex items-center justify-center">
            {/* Imagen actual - for lightbox, we'll keep using img to allow for zooming and better modal handling */}
            <Image
              src={(images[currentIndex] as GalleryImage)?.secureUrl || (images[currentIndex] as GalleryImage)?.url || '/placeholder-image.jpg'}
              alt={`Imagen ${currentIndex + 1}`}
              width={800}
              height={600}
              className="max-h-full max-w-full object-contain"
            />
            
            {/* Botones de navegación */}
            <button
              onClick={handlePrevImage}
              className="absolute left-2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50"
              aria-label="Imagen anterior"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleNextImage}
              className="absolute right-2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50"
              aria-label="Imagen siguiente"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            
            {/* Botón para cerrar */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-2 right-2 bg-black/30 p-2 rounded-full text-white hover:bg-black/50"
              aria-label="Cerrar galería"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            {/* Contador de imágenes */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 