'use client'

import { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PublicationData } from '@/types/publication'
import { 
  parseRoute, 
  generatePublicationUrl, 
  generateCategoryPublicationUrl,
  generateCategoryUrl,
  navigateToUrl 
} from '@/lib/routing'

// ============================================================================
// NAVIGATION HOOK
// ============================================================================

export function useNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const currentRoute = parseRoute(pathname)

  /**
   * Navega a la página dedicada de una publicación
   */
  const goToPublication = useCallback((publication: PublicationData) => {
    const url = generatePublicationUrl(publication)
    router.push(url)
  }, [router])

  /**
   * Navega a una publicación dentro del contexto de categoría actual
   */
  const goToPublicationInCategory = useCallback((
    publication: PublicationData,
    category?: string,
    subcategory?: string
  ) => {
    const targetCategory = category || currentRoute.category
    const targetSubcategory = subcategory || currentRoute.subcategory
    
    if (!targetCategory) {
      // Si no hay categoría, ir a página dedicada
      goToPublication(publication)
      return
    }
    
    const url = generateCategoryPublicationUrl(
      publication, 
      targetCategory, 
      targetSubcategory
    )
    
    navigateToUrl(url, true) // Replace para mantener historia limpia
  }, [currentRoute, goToPublication])

  /**
   * Navega a una página de categoría
   */
  const goToCategory = useCallback((category: string, subcategory?: string) => {
    const url = generateCategoryUrl(category, subcategory)
    router.push(url)
  }, [router])

  /**
   * Navega de vuelta a la categoría actual (sin publicación específica)
   */
  const goBackToCategory = useCallback(() => {
    if (currentRoute.category) {
      const url = generateCategoryUrl(currentRoute.category, currentRoute.subcategory)
      navigateToUrl(url, true)
    } else {
      router.push('/')
    }
  }, [currentRoute, router])

  /**
   * Navega a la página principal
   */
  const goHome = useCallback(() => {
    router.push('/')
  }, [router])

  return {
    currentRoute,
    goToPublication,
    goToPublicationInCategory,
    goToCategory,
    goBackToCategory,
    goHome,
    
    // Propiedades de conveniencia
    isHome: currentRoute.type === 'home',
    isCategory: currentRoute.type === 'category',
    isPublication: currentRoute.type === 'publication',
    currentCategory: currentRoute.category,
    currentSubcategory: currentRoute.subcategory,
    currentPublicationId: currentRoute.publicationId
  }
}
