'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getDefaultImageByCategory } from '@/utils/image-helpers';

interface CarouselProps {
  images: string[];
  category?: string;
}

export function Carousel({ images, category }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Obtener la imagen predeterminada según la categoría si no hay imágenes
  const processedImages = useMemo(() => {
    if (images && images.length > 0) return images;
    const defaultImage = getDefaultImageByCategory(category);
    return [defaultImage];
  }, [images, category]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? processedImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === processedImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-[400px] md:h-[500px] group">
      <div className="h-full w-full relative">
        <Image
          src={processedImages[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          fill
          className="object-contain bg-gray-100"
        />
      </div>

      {/* Botones de navegación */}
      {processedImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 text-gray-800 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 text-gray-800 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicadores */}
      {processedImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {processedImages.map((_, index) => (
            <button
              key={`indicator-${index}-${Date.now()}`}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary-600 w-6' : 'bg-white bg-opacity-60'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Contador de imágenes */}
      {processedImages.length > 1 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white text-sm py-1 px-2 rounded">
          {currentIndex + 1} / {processedImages.length}
        </div>
      )}
    </div>
  );
}
