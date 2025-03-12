'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Category } from '@/types/marketplace'
import { useEffect, useState } from 'react'
import { CategoriesService } from '@/services/categories.service'
import Link from 'next/link'

interface CategoryRowProps {
  title: string
}

const CategoryRow = ({ title }: CategoryRowProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await CategoriesService.getCategories()
        console.log('Categories Data in CategoryRow:', categoriesData)
        if (!Array.isArray(categoriesData)) {
          throw new Error('Categories data is not an array')
        }
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories([]) // Asegúrate de que categories sea un array vacío en caso de error
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="py-4">
      {title && (
        <h3 className="text-lg font-semibold text-white px-4 mb-3">
          {title}
        </h3>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/buscar?category=${category.id}`}
            className={`flex flex-col items-center justify-center h-32 rounded-xl ${
              category.gradient || 'bg-gradient-to-br from-gray-500 to-gray-600'
            } text-white p-4 transform hover:scale-105 transition-all duration-300 shadow-md`}
          >
            {category.icon && (
              <category.icon className="w-10 h-10 mb-2" />
            )}
            <span className="font-medium text-center">{category.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CategoryRow 