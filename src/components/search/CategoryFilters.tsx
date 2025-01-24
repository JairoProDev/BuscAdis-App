'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CategoryId } from '@/types/marketplace'
import { categories } from '@/data/mockCategories'

interface CategoryFiltersProps {
  selectedCategory: CategoryId | null
  selectedType: string | null
  onSelectCategory: (category: CategoryId | null) => void
  onSelectType: (type: string | null) => void
}

export default function CategoryFilters({
  selectedCategory,
  selectedType,
  onSelectCategory,
  onSelectType
}: CategoryFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Categorías principales con scroll horizontal */}
      <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4">
        <div className="flex gap-4 min-w-max pb-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <motion.button
                key={category.id}
                onClick={() => {
                  if (selectedCategory === category.id) {
                    onSelectCategory(null)
                    onSelectType(null)
                  } else {
                    onSelectCategory(category.id)
                    onSelectType(null)
                  }
                }}
                className={`flex flex-col items-center p-4 rounded-xl transition-all min-w-[120px] ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-br ${category.color} shadow-lg scale-105`
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-8 h-8 mb-3" />
                <span className="text-sm font-medium text-white text-center">{category.name}</span>
                <span className="text-xs text-primary-200 mt-1">{category.count}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Subtipos con scroll horizontal */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex overflow-x-auto hide-scrollbar -mx-4 px-4"
          >
            <div className="flex gap-2 min-w-max pb-2">
              <motion.button
                onClick={() => onSelectType(null)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedType === null
                    ? 'bg-white text-primary-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🌟</span>
                <span>Todos</span>
              </motion.button>

              {categories
                .find(c => c.id === selectedCategory)
                ?.types.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => onSelectType(type.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap ${
                      selectedType === type.id
                        ? 'bg-white text-primary-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{type.emoji}</span>
                    <span>{type.name}</span>
                    <span className="text-xs opacity-60">({type.count})</span>
                  </motion.button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 