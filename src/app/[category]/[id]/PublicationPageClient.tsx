'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BuscadorPage from '@/app/buscar/page'

interface PublicationPageClientProps {
  category: string
  publicationId: string
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function PublicationPageClient({ category, publicationId, searchParams }: PublicationPageClientProps) {
  const router = useRouter()

  useEffect(() => {
    // Build URL with category, publication ID, and any additional search params
    const params = new URLSearchParams()
    
    // Add the selected publication ID to trigger opening the detail view
    params.set('selectedId', publicationId)
    
    // Add all other search params to the URL
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'selectedId' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.set(key, String(value))
        }
      }
    })

    // Update URL with params while keeping the clean path
    const queryString = params.toString()
    const newUrl = `/${category}/${publicationId}${queryString ? `?${queryString}` : ''}`
    
    // Only update if the URL actually changed
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [category, publicationId, searchParams, router])

  return <BuscadorPage />
}

