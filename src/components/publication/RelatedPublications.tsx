'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/utils/format';
import { generateSeoUrl } from '@/utils/url';
import { getDefaultImageByCategory } from '@/utils/image-helpers';
import { PublicationData } from '@/types';

interface RelatedPublicationsProps {
  publications: PublicationData[];
  category: string;
  isLoading?: boolean;
}

export default function RelatedPublications({ 
  publications, 
  category,
  isLoading = false
}: RelatedPublicationsProps) {
  if (isLoading) {
    return <RelatedPublicationsSkeleton />;
  }

  if (!publications || publications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Publicaciones relacionadas</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publications.slice(0, 6).map((publication) => (
          <RelatedPublicationCard 
            key={publication.id} 
            publication={publication} 
            category={category}
          />
        ))}
      </div>
    </div>
  );
}

function RelatedPublicationCard({ publication, category }: { publication: PublicationData, category: string }) {
  const [imageError, setImageError] = useState(false);
  
  const { 
    id, 
    title, 
    value, 
    valueType, 
    images, 
    location, 
    subcategorySlug,
    subSubcategorySlug 
  } = publication;
  
  const url = generateSeoUrl(
    id,
    title,
    undefined, // publicationSlug
    category,
    subcategorySlug || undefined,
    subSubcategorySlug || undefined
  );
  
  // Get thumbnail image with validation
  const getThumbnailImage = () => {
    if (imageError) {
      return getDefaultImageByCategory(category);
    }
    
    const firstImage = images?.[0];
    
    if (firstImage && 
        firstImage.trim() !== '' && 
        !firstImage.includes('undefined') && 
        !firstImage.includes('null')) {
      return firstImage;
    }
    
    return getDefaultImageByCategory(category);
  };
  
  const thumbnailImage = getThumbnailImage();
  
  const handleImageError = () => {
    console.log('[RelatedPublicationCard] Image load error, falling back to default');
    setImageError(true);
  };
    
  const locationText = typeof location === 'string' 
    ? location 
    : `${location?.city || ''}${location?.province ? `, ${location.province}` : ''}`;

  return (
    <Link href={url} className="block group">
      <div className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="relative h-36 bg-gray-100">
          <Image
            src={thumbnailImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover"
            onError={handleImageError}
          />
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          <div className="mt-2 flex items-center justify-between">
            <p className="text-blue-600 font-medium">
              {formatPrice({ amount: value, currency: 'PEN', negotiable: valueType === 'negotiable' })}
            </p>
            
            <p className="text-xs text-gray-500">
              {/* timeAgo(created_at) */}
            </p>
          </div>
          
          {locationText && (
            <p className="mt-1 text-xs text-gray-500 truncate">
              {locationText}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function RelatedPublicationsSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="h-7 w-56 bg-slate-700/50 rounded mb-6 animate-pulse"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map(() => (
          <div key={`skeleton-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className="border border-slate-700 bg-slate-800/60 rounded-lg overflow-hidden animate-pulse">
            <div className="h-36 w-full bg-slate-700/50"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 w-full bg-slate-700/50 rounded"></div>
              <div className="h-4 w-2/3 bg-slate-700/50 rounded"></div>
              <div className="mt-2 flex items-center justify-between">
                <div className="h-4 w-16 bg-slate-700/50 rounded"></div>
                <div className="h-3 w-16 bg-slate-700/50 rounded"></div>
              </div>
              <div className="h-3 w-24 bg-slate-700/50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 