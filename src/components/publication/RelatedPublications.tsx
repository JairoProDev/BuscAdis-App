'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/utils/format';
import { formatDate } from '@/utils/date';
import { generateSeoUrl } from '@/utils/url';
import { Skeleton } from '@/components/ui/Skeleton';

interface PublicationData {
  id: string;
  title: string;
  price: number;
  price_type: string;
  images: string[];
  location: {
    city: string;
    region?: string;
  };
  created_at: string;
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
}

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
  const { 
    id, 
    title, 
    price, 
    price_type, 
    images, 
    location, 
    created_at,
    subcategory,
    subsubcategory 
  } = publication;
  
  const url = generateSeoUrl({
    category,
    subcategory: subcategory || '',
    subsubcategory: subsubcategory || '',
    id,
    title
  });
  
  const thumbnailImage = images && images.length > 0 
    ? images[0] 
    : `/images/placeholder/${category}.jpg`;
    
  const locationText = typeof location === 'string' 
    ? location 
    : `${location?.city || ''}${location?.region ? `, ${location.region}` : ''}`;

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
          />
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          <div className="mt-2 flex items-center justify-between">
            <p className="text-blue-600 font-medium">
              {formatPrice(price, price_type)}
            </p>
            
            <p className="text-xs text-gray-500">
              {formatDate(created_at, 'short')}
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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <Skeleton className="h-7 w-48 mb-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <Skeleton className="h-36 w-full" />
            <div className="p-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-2" />
              <div className="mt-2 flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 