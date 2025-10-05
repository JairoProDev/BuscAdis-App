'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BuscadorPage from '@/app/buscar/page'

interface CategorySearchPageClientProps {
  category: string
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CategorySearchPageClient({ category, searchParams }: CategorySearchPageClientProps) {
  const router = useRouter()

  // Sync URL parameters with search params
  useEffect(() => {
    // Build URL with category and any additional search params
    const params = new URLSearchParams()
    
    // Add all search params to the URL
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.set(key, String(value))
        }
      }
    })

    // Update URL with filter params while keeping the clean category path
    const queryString = params.toString()
    const newUrl = queryString ? `/${category}?${queryString}` : `/${category}`
    
    // Only update if the URL actually changed
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [category, searchParams, router])

  return <BuscadorPage />
}

