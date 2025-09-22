'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { PublicationFormData } from '@/types/publication';

// Helper: Format price
function formatPrice(amount: number | null) {
  if (amount === null || isNaN(amount)) return '';
  return `S/. ${amount.toLocaleString()}`;
}

// Helper: Get today string
function getTodayString() {
  const today = new Date();
  return today.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface AdPreviewProps {
  formData: PublicationFormData;
}

const AdPreview: React.FC<AdPreviewProps> = ({ formData }) => {
  // Defensive: Normalize ad data
  const safeAd = {
    title: formData?.title?.trim() || '',
    description: formData?.description?.trim() || '',
    categorySlug: formData?.categorySlug || '',
    subcategorySlug: formData?.subcategorySlug || '',
    amount: typeof formData?.amount === 'number' ? formData.amount : null,
    negotiable: !!formData?.negotiable,
    location: {
      district: formData?.location?.district || '',
      province: formData?.location?.province || '',
      address: formData?.location?.address || '',
    },
    contact: {
      phones: Array.isArray(formData?.contact?.phones) ? formData.contact.phones : [''],
      email: formData?.contact?.email || '',
    },
    images: Array.isArray(formData?.images) ? formData.images : [],
  };

  // Category/subcategory display
  const categoryDisplay = [safeAd.categorySlug, safeAd.subcategorySlug].filter(Boolean).join(' / ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <EyeIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
          Vista previa del adiso
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">En vivo</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      <motion.div
        layout
        className="p-0"
      >
        {/* Images */}
        {safeAd.images && safeAd.images.length > 0 ? (
          <div>
            <Image
              src={safeAd.images[0]}
              alt="Imagen principal"
              width={400}
              height={200}
              className="w-full h-48 object-cover"
              style={{ background: '#f3f4f6' }}
            />
          </div>
        ) : (
          <div>
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 animate-pulse" />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <div className="mb-2">
            {safeAd.title ? (
              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2">{safeAd.title}</h4>
            ) : (
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-2/3" />
            )}
          </div>

          {/* Price */}
          <div className="mb-3">
            {safeAd.amount !== null ? (
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(safeAd.amount)}
                {safeAd.negotiable && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(Negociable)</span>
                )}
              </div>
            ) : (
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-24 animate-pulse" />
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            {safeAd.description ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{safeAd.description}</p>
            ) : (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse" />
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
            {categoryDisplay && (
              <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <TagIcon className="w-3 h-3 mr-1" />
                {categoryDisplay}
              </span>
            )}
            {(safeAd.location?.district || safeAd.location?.province) && (
              <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <MapPinIcon className="w-3 h-3 mr-1" />
                {safeAd.location.district || safeAd.location.province}
              </span>
            )}
            <span className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {getTodayString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <PhoneIcon className="w-4 h-4" />
              Contactar
            </button>
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Compartir
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdPreview;