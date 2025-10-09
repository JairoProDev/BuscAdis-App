'use client';

import React, { useState } from 'react';
import { HeartIcon, ShareIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { PublicationData } from '@/types/publication';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getDefaultImageByCategory } from '@/utils/image-helpers';
import Image from 'next/image';
import Link from 'next/link';
import PublicationAttributes from '../PublicationAttributes';
import PublicationContact from '../PublicationContact';
import { generatePublicationUrl } from '@/lib/routing';

interface DedicatedPublicationPageProps {
  publication: PublicationData;
  relatedPublications?: PublicationData[];
  onShare?: () => void;
  onFavorite?: () => void;
}

export default function DedicatedPublicationPage({
  publication,
  relatedPublications = [],
  onShare,
  onFavorite
}: DedicatedPublicationPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const images = publication.images?.length > 0 ? publication.images : [getDefaultImageByCategory(publication.categorySlug)];

  // Format price
  const formatPrice = (value: number, currency: string) => {
    if (!value || value === 0) return 'Precio a consultar';
    return `${currency === 'USD' ? '$' : 'S/'} ${value.toLocaleString()}`;
  };

  // Format location
  const formatLocation = (location: PublicationData['location']) => {
    if (!location) return 'Ubicación no especificada';
    
    const parts = [];
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.city) parts.push(location.city);
    
    return parts.length > 0 ? parts.join(', ') : 'Ubicación no especificada';
  };

  // Format date
  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'Hace algunos días';
    }
  };

  // Handle image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    onFavorite?.();
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: publication.title,
          text: publication.description,
          url: window.location.href
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
    onShare?.();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative w-full aspect-w-16 aspect-h-9">
            <Image
              src={images[currentImageIndex]}
              alt={publication.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
              priority
            />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {publication.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{formatLocation(publication.location)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(publication.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button onClick={handleFavoriteToggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  {isFavorite ? <HeartSolidIcon className="w-6 h-6 text-red-500" /> : <HeartIcon className="w-6 h-6 text-gray-500" />}
                </button>
                <button onClick={handleShareClick} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <ShareIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
              {formatPrice(publication.value, publication.currency)}
            </div>

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Descripción
              </h2>
              <p className={`text-gray-700 dark:text-gray-300 ${!showFullDescription && 'line-clamp-3'}`}>
                {publication.description}
              </p>
              {publication.description.length > 150 && (
                <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2">
                  {showFullDescription ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>

            {/* Attributes */}
            <PublicationAttributes attributes={publication.attributes} />

            {/* Contact */}
            <PublicationContact publication={publication} />
          </div>
        </div>

        {/* Related Publications */}
        {relatedPublications.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white px-4 sm:px-0 mb-4">
              Adisos similares
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPublications.map((relatedPub) => (
                <Link key={relatedPub.id} href={generatePublicationUrl(relatedPub)} passHref>
                  <a className="block bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative w-full h-40">
                      <Image
                        src={relatedPub.images?.[0] || getDefaultImageByCategory(relatedPub.categorySlug)}
                        alt={relatedPub.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{relatedPub.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatLocation(relatedPub.location)}</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">{formatPrice(relatedPub.value, relatedPub.currency)}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}