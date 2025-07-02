'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { generateSeoUrl } from '@/utils/url' // Asegúrate que esta ruta es correcta
import useMediaQuery from './useMediaQuery' // Asegúrate que esta ruta es correcta
import { PublicationData } from '@/types/publication' // Asegúrate que esta ruta es correcta

// ============================================================================
// 1. TYPES AND STATE MANAGEMENT
// ============================================================================

interface PublicationDetailState {
  selectedPublication: PublicationData | null
  isDetailOpen: boolean
}

type PublicationDetailAction =
  | { type: 'OPEN_DETAIL'; payload: PublicationData }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'SET_STATE_FROM_URL'; payload: PublicationData | null }

interface PublicationDetailContextValue extends PublicationDetailState {
  openPublicationDetail: (publication: PublicationData) => void
  closePublicationDetail: () => void
  isMobile: boolean
  handleWhatsAppClick: (publication: PublicationData) => void
  handleShare: (publication: PublicationData) => void
  handleFavorite: (publication: PublicationData) => boolean
}

const PublicationDetailContext = createContext<
  PublicationDetailContextValue | undefined
>(undefined)

const initialState: PublicationDetailState = {
  selectedPublication: null,
  isDetailOpen: false
}

function publicationDetailReducer(
  state: PublicationDetailState,
  action: PublicationDetailAction
): PublicationDetailState {
  switch (action.type) {
    case 'OPEN_DETAIL':
      return {
        selectedPublication: action.payload,
        isDetailOpen: true
      }
    case 'CLOSE_DETAIL':
      return {
        selectedPublication: null,
        isDetailOpen: false
      }
    case 'SET_STATE_FROM_URL':
      return {
        selectedPublication: action.payload,
        isDetailOpen: !!action.payload
      }
    default:
      return state
  }
}

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

const whatsAppMessageTemplates: Record<string, (p: PublicationData, url: string) => string> = {
  empleos: (p, url) => `🔍 Hola, vi su anuncio de *Empleos* en BuscaDis.com y me interesó la oportunidad:\n\n"${p.title}"\n\n🔗 Link: ${url}`,
  inmuebles: (p, url) => `🏠 Hola, vi su publicación de *Inmuebles* en BuscaDis.com y me interesó:\n\n"${p.title}"\n\n🔗 Link: ${url}`,
  vehiculos: (p, url) => `🚗 Hola, vi su anuncio de *Vehículos* en BuscaDis.com y me interesó:\n\n"${p.title}"\n\n🔗 Link: ${url}`,
  default: (p, url) => `👋 Hola, vi su anuncio de *${p.categorySlug.charAt(0).toUpperCase() + p.categorySlug.slice(1)}* en BuscaDis.com:\n\n"${p.title}"\n\n🔗 Link: ${url}`
};

// ============================================================================
// 3. THE PROVIDER COMPONENT
// ============================================================================

export function PublicationDetailProvider({
  children,
  publications
}: {
  children: React.ReactNode
  publications: PublicationData[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const [state, dispatch] = useReducer(publicationDetailReducer, initialState)

  const generatePublicationUrl = useCallback((publication: PublicationData) => {
    const seoUrl = generateSeoUrl(
      publication.id, 
      publication.title,
      undefined, // publicationSlug
      publication.categorySlug,
      publication.subcategorySlug || undefined,
      publication.subSubcategorySlug || undefined
    )
    console.log('🔗 Generated SEO URL:', seoUrl, 'for publication:', publication.title)
    return seoUrl
  }, [])

  // Páginas donde permitimos manipulación de URLs
  const allowedPages = ['/buscar', '/empleos', '/inmuebles', '/vehiculos', '/servicios', '/productos']
  const isOnAllowedPage = pathname ? allowedPages.some(page => pathname === page || pathname.startsWith(page)) : false

  // Sincronizar con query parameter al cargar la página
  useEffect(() => {
    if (!searchParams || !isOnAllowedPage) return
    
    const publicationId = searchParams.get('p')
    console.log('🔗 URL Sync - pathname:', pathname, 'publicationId:', publicationId)
    
    if (publicationId && publications.length > 0) {
      const publication = publications.find(p => p.id === publicationId)
      console.log('🔗 Found publication:', publication?.title)
      if (publication && !state.selectedPublication) {
        dispatch({ type: 'SET_STATE_FROM_URL', payload: publication })
      }
    } else if (!publicationId && state.selectedPublication) {
      dispatch({ type: 'SET_STATE_FROM_URL', payload: null })
    }
  }, [searchParams, publications, state.selectedPublication, pathname, isOnAllowedPage])

  const openPublicationDetail = useCallback((publication: PublicationData) => {
    console.log('📖 Opening publication detail:', publication.title, 'on page:', pathname)
    dispatch({ type: 'OPEN_DETAIL', payload: publication })
    
    // Actualizar URL en páginas permitidas
    if (isOnAllowedPage) {
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('p', publication.id)
      console.log('🔗 Updating URL to:', currentUrl.toString())
      window.history.replaceState(null, '', currentUrl.toString())
    }
  }, [pathname, isOnAllowedPage])

  const closePublicationDetail = useCallback(() => {
    console.log('❌ Closing publication detail on page:', pathname)
    dispatch({ type: 'CLOSE_DETAIL' })
    
    // Actualizar URL en páginas permitidas
    if (isOnAllowedPage) {
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.delete('p')
      console.log('🔗 Removing URL param, new URL:', currentUrl.toString())
      window.history.replaceState(null, '', currentUrl.toString())
    }
  }, [pathname, isOnAllowedPage])

  const handleWhatsAppClick = useCallback((publication: PublicationData) => {
    if (!publication.whatsapp) return
    const cleanPhone = publication.whatsapp.replace(/[^0-9]/g, '')
    const adUrl = `${window.location.origin}${generatePublicationUrl(publication)}`
    console.log('📱 WhatsApp click - generated URL:', adUrl)
    const template = whatsAppMessageTemplates[publication.categorySlug] || whatsAppMessageTemplates.default
    const message = template(publication, adUrl)
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }, [generatePublicationUrl])

  const handleShare = useCallback((publication: PublicationData) => {
    const shareUrl = `${window.location.origin}${generatePublicationUrl(publication)}`
    console.log('🔗 Share click - generated URL:', shareUrl)
    if (navigator.share) {
      navigator.share({
        title: `${publication.title} - BuscaDis`,
        text: `${publication.description}\n\nEncuentra más en BuscaDis.com`,
        url: shareUrl
      }).catch(err => console.log('Sharing failed:', err))
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard?.writeText(shareUrl).then(() => {
        console.log('🔗 URL copied to clipboard')
      }).catch(err => console.log('Copy failed:', err))
    }
  }, [generatePublicationUrl])

  const handleFavorite = useCallback((publication: PublicationData) => {
    try {
      const favorites: string[] = JSON.parse(localStorage.getItem('favorites') || '[]')
      const isFavorite = favorites.includes(publication.id)
      const updatedFavorites = isFavorite
        ? favorites.filter(id => id !== publication.id)
        : [...favorites, publication.id]
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
      return !isFavorite
    } catch (error) {
      console.error('Error updating favorites:', error)
      return false
    }
  }, [])

  const contextValue: PublicationDetailContextValue = {
    ...state,
    openPublicationDetail,
    closePublicationDetail,
    isMobile,
    handleWhatsAppClick,
    handleShare,
    handleFavorite
  }

  return (
    <PublicationDetailContext.Provider value={contextValue}>
      {children}
    </PublicationDetailContext.Provider>
  )
}

// ============================================================================
// 4. THE CUSTOM HOOK
// ============================================================================

export function usePublicationDetail() {
  const context = useContext(PublicationDetailContext)
  if (context === undefined) {
    throw new Error(
      'usePublicationDetail must be used within a PublicationDetailProvider'
    )
  }
  return context
}