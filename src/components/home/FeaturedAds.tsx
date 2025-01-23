'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import InteractiveCard from '@/components/ui/InteractiveCard'
import { VerifiedIcon, PremiumIcon } from '@/components/icons'
import { Adiso } from '@/types/marketplace'

interface FeaturedAdsProps {
  ads: Adiso[]
  featured?: boolean
}

export default function FeaturedAds({ ads, featured = false }: FeaturedAdsProps) {
  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold text-primary-800 px-4 mb-3 flex items-center">
        <PremiumIcon className="w-5 h-5 text-yellow-500 mr-2" />
        Anuncios Destacados
      </h3>

      <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 px-4">
        {ads.map((ad) => (
          <InteractiveCard
            key={ad.id}
            className="flex-none w-72 snap-start first:ml-0 last:mr-4 bg-white rounded-xl shadow-lg"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={ad.image}
                alt={ad.title}
                fill
                className="object-cover rounded-t-xl"
              />
              {ad.isPremium && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                  <PremiumIcon className="w-3 h-3 mr-1" />
                  Premium
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-primary-800 line-clamp-2">{ad.title}</h4>
                {ad.isVerified && (
                  <VerifiedIcon className="w-5 h-5 text-primary-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center text-sm text-primary-600 mb-3">
                <span>{ad.location}</span>
                <span className="mx-2">•</span>
                <span>{ad.category.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-800">
                  ${ad.price.toLocaleString()}
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < ad.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </InteractiveCard>
        ))}
      </div>
    </div>
  )
} 