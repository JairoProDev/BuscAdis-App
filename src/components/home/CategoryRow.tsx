'use client'

import { motion } from 'framer-motion'
import { IconType } from '@/components/icons'
import InteractiveCard from '@/components/ui/InteractiveCard'

interface Category {
  id: string
  name: string
  icon: IconType
  count: number
  color: string
}

interface CategoryRowProps {
  title: string
  categories: Category[]
}

export default function CategoryRow({ title, categories }: CategoryRowProps) {
  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold text-primary-800 px-4 mb-3 flex items-center">
        {title}
        <motion.button
          whileHover={{ x: 5 }}
          className="ml-auto text-sm text-primary-600 flex items-center"
        >
          Ver más
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </h3>
      
      <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 px-4">
        {categories.map((category) => (
          <InteractiveCard
            key={category.id}
            className="flex-none w-40 snap-start first:ml-0 last:mr-4"
            hover3D={false}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-xl ${category.color} aspect-square flex flex-col justify-between`}
            >
              <category.icon className="w-8 h-8 text-white" />
              <div>
                <h4 className="text-sm font-medium text-white">{category.name}</h4>
                <p className="text-xs text-white/80">{category.count} anuncios</p>
              </div>
            </motion.div>
          </InteractiveCard>
        ))}
      </div>
    </div>
  )
} 