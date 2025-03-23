// ImageUploader.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';

interface ImageUploaderProps {
  onImagesSelected: (images: File[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
}

export default function ImageUploader({
  onImagesSelected,
  maxImages = 10,
  maxSizeInMB = 5
}: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      Logger.warning(`Intento de subir archivo no permitido: ${file.type}`);
      return false;
    }

    // Validar tamaño
    if (file.size > maxSizeInMB * 1024 * 1024) {
      setError(`Las imágenes no deben superar los ${maxSizeInMB}MB`);
      Logger.warning(`Archivo demasiado grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return false;
    }

    return true;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');

    if (files.length + acceptedFiles.length > maxImages) {
      setError(`No puedes subir más de ${maxImages} imágenes`);
      Logger.warning('Intento de subir más imágenes de las permitidas');
      return;
    }

    const validFiles = acceptedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      onImagesSelected([...files, ...validFiles]);
      Logger.success(`${validFiles.length} imágenes subidas exitosamente`);
    }
  }, [files, maxImages, onImagesSelected]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    Logger.info('Imagen eliminada');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: maxSizeInMB * 1024 * 1024
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isDragActive ? (
            <>
              <ArrowUpTrayIcon className="w-12 h-12 text-primary-500" />
              <p className="text-primary-700">¡Suelta las imágenes aquí!</p>
            </>
          ) : (
            <>
              <PhotoIcon className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-gray-600">
                  Arrastra y suelta tus imágenes aquí, o{' '}
                  <span className="text-primary-600 font-medium">selecciónalas</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Máximo {maxImages} imágenes • Hasta {maxSizeInMB}MB por imagen
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-700 p-3 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div
              key={preview}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Eliminar imagen"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {files.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {files.length} de {maxImages} imágenes seleccionadas
        </p>
      )}
    </div>
  );
}