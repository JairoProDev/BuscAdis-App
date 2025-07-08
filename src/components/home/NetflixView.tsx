'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NetflixRow, AdRowItem } from '../../services/netflix-view.service';
import PublicationCard from '../publications/PublicationCard';
import { Publication } from '@/types/publication';
import Image from 'next/image';

interface NetflixViewProps {
  rows: NetflixRow[];
  onAdClick: (ad: Publication) => void;
  onSeeAll: (rowId: string) => void;
}

export const NetflixView: React.FC<NetflixViewProps> = ({
  rows,
  onAdClick,
  onSeeAll
}) => {
  return (
    <div className="netflix-view w-full space-y-8 pb-8">
      {rows.map((row) => (
        <AdRow
          key={row.id}
          row={row}
          onAdClick={onAdClick}
          onSeeAll={onSeeAll}
        />
      ))}
    </div>
  );
};

interface AdRowProps {
  row: NetflixRow;
  onAdClick: (ad: Publication) => void;
  onSeeAll: (rowId: string) => void;
}

const AdRow: React.FC<AdRowProps> = ({ row, onAdClick, onSeeAll }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollButtons();
  }, [row.data, checkScrollButtons]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320; // Ancho de una card + gap
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const getRowIcon = (type: string) => {
    switch (type) {
      case 'premium': return '⭐';
      case 'trending': return '🔥';
      case 'recent': return '🆕';
      case 'ending': return '⏰';
      case 'recommended': return '🎯';
      case 'location': return '📍';
      case 'price': return '💰';
      default: return '📂';
    }
  };

  // Función para convertir AdRowItem a Publication
  const convertAdRowItemToPublication = (ad: AdRowItem): Publication => ({
    id: ad.id,
    title: ad.title,
    description: ad.description,
    categorySlug: ad.category,
    subcategorySlug: ad.subcategory,
    subSubcategorySlug: undefined,
    transactionType: 'venta',
    amount: ad.price ? parseFloat(ad.price.replace(/[^\d.-]/g, '')) : null,
    currency: 'PEN',
    negotiable: false,
    location: {
      province: 'Cusco',
      district: ad.location || 'Cusco',
      address: ad.location || '',
      referencePoint: ad.location || '',
      coordinates: null
    },
    contact: {
      phones: ['900000000'],
      email: undefined,
      name: undefined,
      website: undefined
    },
    attributes: {
      views: ad.views,
      premium: ad.isPremium,
      urgent: ad.isUrgent,
      qualityScore: ad.metrics.qualityScore
    },
    images: ad.images,
    status: 'active',
    premium: ad.isPremium,
    createdAt: ad.publishedDate,
    updatedAt: ad.publishedDate
  });

  if (row.data.length === 0) return null;

  return (
    <div className="row-container">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">{getRowIcon(row.type)}</span>
            {row.title}
          </h2>
          {row.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {row.subtitle}
            </p>
          )}
        </div>
        
        <button
          onClick={() => onSeeAll(row.id)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
        >
          Ver todos
        </button>
      </div>

      {/* Scrollable Row */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {row.data.slice(0, row.maxItems).map((publication) => (
            <div 
              key={publication.id || publication.title}
              className="flex-shrink-0 w-72"
              onClick={() => onAdClick(convertAdRowItemToPublication(publication))}
            >
              <PublicationCard 
                publication={{
                  id: publication.id,
                  title: publication.title,
                  description: publication.description,
                  categorySlug: publication.category,
                  subcategorySlug: publication.subcategory,
                  subSubcategorySlug: null,
                  transactionType: 'venta',
                  value: parseFloat(publication.price?.replace(/[^\d.-]/g, '') || '0'),
                  currency: 'PEN',
                  valueType: 'fixed',
                  size: 1,
                  location: {
                    reference: publication.location || '',
                    district: publication.location || 'Cusco',
                    province: 'Cusco',
                    city: 'Cusco',
                    country: 'Perú'
                  },
                  images: publication.images,
                  whatsapp: '900000000',
                  createdAt: publication.publishedDate.toISOString(),
                  views: publication.views,
                  featured: publication.isPremium,
                  premium: publication.isPremium
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AdCardProps {
  ad: AdRowItem;
  onClick: () => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: string) => {
    if (price.includes('S/.')) return price;
    return `S/. ${price}`;
  };

  const formatDate = (date: Date) => {
    const now = Date.now();
    const diffTime = now - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-PE');
  };

  return (
    <div
      className="ad-card flex-shrink-0 w-72 cursor-pointer transform transition-all duration-300 hover:scale-105"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          {ad.images.length > 0 && !imageError ? (
            <Image
              src={ad.images[0]}
              alt={ad.title}
              width={288}
              height={192}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm">Sin imagen</div>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {ad.badges.map((badge, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs font-bold rounded ${
                  badge === 'PREMIUM' 
                    ? 'bg-yellow-500 text-white'
                    : badge === 'URGENTE'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Views */}
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Eye size={12} />
            {ad.views.toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
            {ad.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
            {ad.description}
          </p>

          {/* Price and Location */}
          <div className="flex items-center justify-between mb-3">
            {ad.price && (
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrice(ad.price)}
              </span>
            )}
            
            {ad.location && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                <MapPin size={12} className="mr-1" />
                <span className="truncate max-w-24">{ad.location}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatDate(ad.publishedDate)}</span>
            
            {/* Quality Score */}
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500" />
              <span>{(ad.metrics.qualityScore / 20).toFixed(1)}</span>
            </div>
          </div>

          {/* Expiry Warning */}
          {ad.expiresDate && (
            <div className="mt-2 flex items-center text-orange-600 dark:text-orange-400 text-xs">
              <Clock size={12} className="mr-1" />
              <span>
                Vence {formatDate(ad.expiresDate)}
              </span>
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-opacity duration-200">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Ver detalles
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading Component
export const NetflixViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 pb-8">
      {[...Array(6)].map((_, rowIndex) => (
        <div key={rowIndex} className="row-container">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
            <div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="flex gap-4 px-4 sm:px-6">
            {[...Array(5)].map((_, cardIndex) => (
              <div key={cardIndex} className="flex-shrink-0 w-72">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  {/* Image Skeleton */}
                  <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
                  
                  {/* Content Skeleton */}
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="flex justify-between">
                      <div className="h-5 bg-green-300 dark:bg-green-600 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NetflixView; 