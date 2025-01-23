'use client'

import { motion } from 'framer-motion'
import { Category } from '@/types/marketplace'

interface CategoryRowProps {
  title: string
  categories: Category[]
}

export default function CategoryRow({ title, categories }: CategoryRowProps) {
  return (
    <div className="py-4">
      {title && (
        <h3 className="text-lg font-semibold text-white px-4 mb-3">
          {title}
        </h3>
      )}
      
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <motion.button
              key={category.id}
              className={`flex-none px-4 py-2 rounded-xl bg-gradient-to-br ${category.color} text-white`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5" />
                <span>{category.name}</span>
                <span className="text-xs opacity-75">({category.count})</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
} 