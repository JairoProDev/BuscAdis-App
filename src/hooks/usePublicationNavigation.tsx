'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { PublicationData } from '@/types/publication';
import { generateSeoUrl } from '@/utils/url';

export interface UsePublicationNavigationReturn {
  openPublicationDetail: (publication: PublicationData) => void;
  openDedicatedPage: (publication: PublicationData) => void;
  isDetailView: boolean;
  isDedicatedPage: boolean;
  shouldShowDetailContainer: boolean;
  shouldShowDedicatedPage: boolean;
}

/**
 * Hook for managing navigation between the 3 levels of publication viewing:
 * 1. PublicationCard (preview in grid/list)
 * 2. DetailContainer (sidebar/modal with details) 
 * 3. DedicatedPage (full page view)
 */
export function usePublicationNavigation(): UsePublicationNavigationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine current view context
  const isOnSearchPage = pathname === '/buscar' || pathname?.startsWith('/buscar');
  const isOnCategoryPage = pathname?.match(/^\/(empleos|inmuebles|vehiculos|servicios|productos|eventos|negocios|comunidad)/);
  const isDedicatedPage = isOnCategoryPage && !searchParams.get('p');
  const isDetailView = searchParams.get('p') !== null;

  // Determine which view should be shown
  const shouldShowDetailContainer = isOnSearchPage || (isOnCategoryPage && isDetailView);
  const shouldShowDedicatedPage = isDedicatedPage;

  /**
   * Open publication in detail container (sidebar/modal)
   * Used for internal navigation within search/category pages
   */
  const openPublicationDetail = useCallback((publication: PublicationData) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('p', publication.id);
    
    // Use replace to avoid cluttering browser history for internal navigation
    router.replace(currentUrl.pathname + currentUrl.search, { scroll: false });
  }, [router]);

  /**
   * Open publication in dedicated page (full page view)
   * Used for sharing, direct links, and when user wants full experience
   */
  const openDedicatedPage = useCallback((publication: PublicationData) => {
    const dedicatedUrl = generateSeoUrl(
      publication.id,
      publication.title,
      undefined,
      publication.categorySlug,
      publication.subcategorySlug || undefined,
      publication.subSubcategorySlug || undefined,
      true // Include title for SEO
    );
    
    // Use push for dedicated pages to create proper browser history
    router.push(dedicatedUrl);
  }, [router]);

  return {
    openPublicationDetail,
    openDedicatedPage,
    isDetailView,
    isDedicatedPage,
    shouldShowDetailContainer,
    shouldShowDedicatedPage
  };
} 