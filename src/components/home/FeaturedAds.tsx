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
      <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 px-4">
        {ads.map((ad) => (
          <InteractiveCard
            key={ad.id}
            className={`flex-none snap-start first:ml-0 last:mr-4 bg-primary-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
              featured ? 'w-80 md:w-96' : 'w-72'
            }`}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={ad.image}
                alt={ad.title}
                fill
                className="object-cover rounded-t-xl"
              />
              {ad.isPremium && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full flex items-center shadow-lg">
                  <PremiumIcon className="w-3 h-3 mr-1" />
                  Premium
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="font-bold text-white text-lg line-clamp-2 mb-2">{ad.title}</h4>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-sm">{ad.location}</span>
                  <span className="text-sm">{ad.category.name}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white">
                  ${ad.price.toLocaleString()}
                </span>
                {ad.isVerified && (
                  <div className="flex items-center text-primary-200">
                    <VerifiedIcon className="w-5 h-5 mr-1" />
                    <span className="text-sm">Verificado</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < ad.rating ? 'text-yellow-400' : 'text-primary-700'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-500 transition-colors"
                >
                  Ver más
                </motion.button>
              </div>
            </div>
          </InteractiveCard>
        ))}
      </div>
    </div>
  )
} 