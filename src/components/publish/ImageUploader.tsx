import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageService, ProcessedImage } from '@/services/image.service';
import { Logger } from '@/services/logging.service';
import { PhotoIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface ImageUploaderProps {
  onImagesChange: (images: ProcessedImage[]) => void;
  maxImages?: number;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  maxImages = 10,
  className = ''
}) => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    setErrors([]);
    const newErrors: string[] = [];
    const processedImages: ProcessedImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        if (images.length + processedImages.length >= maxImages) {
          newErrors.push(`No se pueden subir más de ${maxImages} imágenes`);
          break;
        }

        const file = files[i];
        const validation = await ImageService.validateImage(file);

        if (!validation.isValid) {
          newErrors.push(...validation.errors);
          continue;
        }

        try {
          // Optimizar la imagen antes de procesarla
          const optimizedFile = await ImageService.optimizeImage(file);

          const processed = await ImageService.processImage(optimizedFile);
          processedImages.push(processed);
          Logger.info(`Imagen ${i + 1} procesada exitosamente`);
        } catch (error) {
          Logger.error(`Error al procesar la imagen ${i + 1}:`, { error: error instanceof Error ? error.message : String(error) });
          newErrors.push(`Error al procesar la imagen ${file.name}`);
        }
      }

      if (processedImages.length > 0) {
        const updatedImages = [...images, ...processedImages];
        setImages(updatedImages);
        onImagesChange(updatedImages);
      }
    } catch (error) {
      Logger.error('Error al procesar las imágenes:', { error: error instanceof Error ? error.message : String(error) });
      newErrors.push('Error al procesar las imágenes');
    } finally {
      setErrors(newErrors);
      setIsProcessing(false);
    }
  }, [images, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      if (removed.preview) {
        ImageService.revokeObjectURL(removed.preview);
      }
      onImagesChange(newImages);
      Logger.debug(`Imagen ${index + 1} eliminada`);
      return newImages;
    });
  }, [onImagesChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#3B82F6' : '#D1D5DB'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Seleccionar imágenes"
        />

        <div className="space-y-2">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Selecciona archivos
            </button>
            {' o arrastra y suelta'}
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG o WebP (máx. {maxImages} imágenes)
          </p>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        )}
      </motion.div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 p-4 rounded-md"
        >
          <ul className="list-disc list-inside text-sm text-red-600">
            {errors.map((error) => (
              <li key={`error-${error.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}`}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={image.preview}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <Image
                  src={image.preview}
                  alt={`Vista previa ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Eliminar imagen"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-xs text-white">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{(image.size / 1024).toFixed(0)}KB</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 