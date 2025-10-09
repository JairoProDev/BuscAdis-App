'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react'
import useMediaQuery from './useMediaQuery'
import { PublicationData } from '@/types/publication'

// ============================================================================
// TYPES
// ============================================================================

interface PublicationDetailState {
  selectedPublication: PublicationData | null
  isDetailOpen: boolean
}

type PublicationDetailAction =
  | { type: 'OPEN_DETAIL'; payload: PublicationData }
  | { type: 'CLOSE_DETAIL' }

interface PublicationDetailContextValue extends PublicationDetailState {
  openPublicationDetail: (publication: PublicationData) => void
  closePublicationDetail: () => void
  goToPublicationPage: (publication: PublicationData) => void
  isMobile: boolean
  handleWhatsAppClick: (publication: PublicationData) => void
  handleShare: (publication: PublicationData) => void
  handleFavorite: (publication: PublicationData) => boolean
}

// ============================================================================
// CONTEXT & REDUCER
// ============================================================================

const PublicationDetailContext = createContext<PublicationDetailContextValue | undefined>(undefined)

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
    default:
      return state
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateWhatsAppMessage = (publication: PublicationData, url: string): string => {
  const categoryName = publication.categorySlug.charAt(0).toUpperCase() + publication.categorySlug.slice(1)
  
  const templates = {
    empleos: `🔍 Hola, vi su adiso de *${categoryName}* en BuscaDis.com:\n\n"${publication.title}"\n\n¿Podría brindarme más información sobre los requisitos?\n\n🔗 Link: ${url}`,
    inmuebles: `🏠 Hola, vi su publicación de *${categoryName}* en BuscaDis.com:\n\n"${publication.title}"\n\n¿Podría proporcionarme más detalles?\n\n🔗 Link: ${url}`,
    vehiculos: `🚗 Hola, vi su adiso de *${categoryName}* en BuscaDis.com:\n\n"${publication.title}"\n\n¿Podría brindarme más información?\n\n🔗 Link: ${url}`,
    servicios: `🛠️ Hola, vi su oferta de *${categoryName}* en BuscaDis.com:\n\n"${publication.title}"\n\n¿Podría contarme más sobre el servicio?\n\n🔗 Link: ${url}`,
    productos: `🛍️ Hola, vi su producto en BuscaDis.com:\n\n"${publication.title}"\n\n¿Podría brindarme más información?\n\n🔗 Link: ${url}`
  }
  
  return templates[publication.categorySlug as keyof typeof templates] || 
         `👋 Hola, vi su adiso en BuscaDis.com:\n\n"${publication.title}"\n\n¿Podría brindarme más información?\n\n🔗 Link: ${url}`
}

// ============================================================================
// PROVIDER
// ============================================================================

export function PublicationDetailProvider({
  children 
}: {
  children: React.ReactNode
}) {
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const [state, dispatch] = useReducer(publicationDetailReducer, initialState)

  const openPublicationDetail = useCallback((publication: PublicationData) => {
    dispatch({ type: 'OPEN_DETAIL', payload: publication })
    
    // URL navigation temporarily disabled to prevent loops
    // TODO: Re-implement URL synchronization without conflicts
  }, [])

  const closePublicationDetail = useCallback(() => {
    dispatch({ type: 'CLOSE_DETAIL' })
    
    // URL navigation temporarily disabled to prevent loops
    // TODO: Re-implement URL synchronization without conflicts
  }, [])

  const goToPublicationPage = useCallback((publication: PublicationData) => {
    // Navigate directly to the dedicated page using window.location
    const dedicatedUrl = `/adiso/${publication.id}`
    window.location.href = dedicatedUrl
  }, [])

  const handleWhatsAppClick = useCallback((publication: PublicationData) => {
    if (!publication.whatsapp) return
    
    const cleanPhone = publication.whatsapp.replace(/[^0-9]/g, '')
    const baseUrl = window.location.origin
    const adUrl = `${baseUrl}/adiso/${publication.id}`
    const message = generateWhatsAppMessage(publication, adUrl)
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }, [])

  const handleShare = useCallback((publication: PublicationData) => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/adiso/${publication.id}`
    
    if (navigator.share) {
      navigator.share({
        title: `${publication.title} - BuscaDis`,
        text: publication.description,
        url: shareUrl
      }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(shareUrl).catch(() => {})
    }
  }, [])

  const handleFavorite = useCallback((publication: PublicationData): boolean => {
    try {
      const favorites: string[] = JSON.parse(localStorage.getItem('favorites') || '[]')
      const isFavorite = favorites.includes(publication.id)
      const updatedFavorites = isFavorite
        ? favorites.filter(id => id !== publication.id)
        : [...favorites, publication.id]
      
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
      return !isFavorite
    } catch {
      return false
    }
  }, [])

  const contextValue: PublicationDetailContextValue = {
    ...state,
    openPublicationDetail,
    closePublicationDetail,
    goToPublicationPage,
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
// HOOK
// ============================================================================

export function usePublicationDetail() {
  const context = useContext(PublicationDetailContext)
  if (context === undefined) {
    throw new Error('usePublicationDetail must be used within a PublicationDetailProvider')
  }
  return context
}