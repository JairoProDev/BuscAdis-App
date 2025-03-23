// PreviewStep.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  MapPinIcon, 
  PhoneIcon, 
  TagIcon, 
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';
import { ValidationService } from '@/services/validation.service';

interface PreviewStepProps {
  data: {
    title: string;
    description: string;
    category: any;
    price: {
      amount: number;
      currency: string;
    };
    location: {
      city: string;
      country: string;
    };
    contact: {
      whatsapp: string;
    };
    media: string[];
  };
  onEdit: (section: string) => void;
}

export default function PreviewStep({ data, onEdit }: PreviewStepProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Validar todos los campos
  const validateAll = () => {
    const validations = {
      title: ValidationService.validateTitle(data.title),
      description: ValidationService.validateDescription(data.description),
      price: ValidationService.validatePrice(data.price.amount),
      whatsapp: ValidationService.validateWhatsApp(data.contact.whatsapp),
      location: ValidationService.validateLocation(data.location.city, data.location.country),
      media: ValidationService.validateMedia(data.media)
    };

    const allValid = Object.values(validations).every(v => v.isValid);
    if (!allValid) {
      Logger.warning('Se encontraron campos inválidos en la vista previa');
    }
    return validations;
  };

  const validations = validateAll();

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % data.media.length);
    Logger.debug('Navegando a la siguiente imagen');
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + data.media.length) % data.media.length);
    Logger.debug('Navegando a la imagen anterior');
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return showFullDescription ? text : `${text.substring(0, maxLength)}...`;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm">
      {/* Galería de imágenes */}
      <div className="relative aspect-video rounded-t-xl overflow-hidden bg-gray-100">
        {data.media.length > 0 ? (
          <>
            <Image
              src={data.media[currentImageIndex]}
              alt={data.title}
              fill
              className="object-cover"
            />
            {data.media.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button
                  onClick={prevImage}
                  className="p-2 rounded-full bg-black/50 text-white"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="p-2 rounded-full bg-black/50 text-white"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {data.media.length}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <ExclamationCircleIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Título y Precio */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{data.title}</h1>
            <div className="flex items-center text-gray-500 text-sm gap-2">
              <TagIcon className="w-4 h-4" />
              <span>{data.category?.name || 'Sin categoría'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {formatPrice(data.price.amount, data.price.currency)}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <h2 className="font-medium text-gray-900">Descripción</h2>
          <p className="text-gray-600 whitespace-pre-line">
            {truncateDescription(data.description)}
          </p>
          {data.description.length > 150 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-primary-600 text-sm font-medium"
            >
              {showFullDescription ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>

        {/* Ubicación y Contacto */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="font-medium text-gray-900">Ubicación</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPinIcon className="w-5 h-5" />
              <span>{data.location.city}, {data.location.country}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-medium text-gray-900">Contacto</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <PhoneIcon className="w-5 h-5" />
              <span>WhatsApp: {data.contact.whatsapp}</span>
            </div>
          </div>
        </div>

        {/* Validación de campos */}
        <div className="border-t pt-6 space-y-3">
          <h2 className="font-medium text-gray-900">Verificación de campos</h2>
          <div className="grid gap-2">
            {Object.entries(validations).map(([field, validation]) => (
              <div
                key={field}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  validation.isValid ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {validation.isValid ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <span className={validation.isValid ? 'text-green-700' : 'text-red-700'}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </span>
                </div>
                {!validation.isValid && (
                  <button
                    onClick={() => onEdit(field)}
                    className="text-sm font-medium text-primary-600"
                  >
                    Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}