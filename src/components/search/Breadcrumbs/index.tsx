'use client'

import { useSearch } from '@/contexts/SearchContext'
import { categoriesList, getClassificationNames } from '@/data/categories-data'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface BreadcrumbsProps {
  className?: string
}

export default function Breadcrumbs({ className = '' }: BreadcrumbsProps) {
  const { searchState } = useSearch()

  // Get classification names
  const names = getClassificationNames(
    searchState.category || '',
    searchState.subcategory,
    searchState.subSubcategory
  )

  // Build breadcrumb items
  const items = []

  // Home
  items.push({
    label: 'Buscar',
    href: '/buscar',
    icon: HomeIcon
  })

  // Category
  if (names.categoryName) {
    items.push({
      label: names.categoryName,
      href: `/buscar?category=${searchState.category}`,
    })
  }

  // Subcategory
  if (names.subcategoryName && searchState.subcategory) {
    items.push({
      label: names.subcategoryName,
      href: `/buscar?category=${searchState.category}&subcategory=${searchState.subcategory}`,
    })
  }

  // Sub-subcategory
  if (names.subSubcategoryName && searchState.subSubcategory) {
    items.push({
      label: names.subSubcategoryName,
      href: `/buscar?category=${searchState.category}&subcategory=${searchState.subcategory}&subsubcategory=${searchState.subSubcategory}`,
    })
  }

  // Don't render if only home
  if (items.length <= 1) {
    return null
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const Icon = item.icon

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" />
              )}
              
              {isLast ? (
                <span className="text-gray-900 font-medium flex items-center">
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="hover:text-blue-600 transition-colors flex items-center"
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
} 