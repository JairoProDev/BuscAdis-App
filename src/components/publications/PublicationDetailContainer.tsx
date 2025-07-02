'use client';

import React, { useState, useEffect } from 'react';
import { usePublicationDetail } from '@/hooks/usePublicationDetail';
import PublicationDetailSidebar from './PublicationDetailSidebar';
import PublicationDetailModal from './PublicationDetailModal';
import PublicationCard from './PublicationCard';
import { PublicationData } from '@/types/publication';

export interface PublicationDetailContainerProps {
  publications: PublicationData[];
  className?: string;
  viewMode?: 'grid' | 'list';
  onDetailStateChange?: (isOpen: boolean) => void;
  renderSidebarInParent?: boolean;
}

export default function PublicationDetailContainer({
  publications,
  className = '',
  viewMode = 'grid',
  onDetailStateChange,
  renderSidebarInParent = false
}: PublicationDetailContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  const {
    selectedPublication,
    isDetailOpen,
    openPublicationDetail,
    closePublicationDetail,
    handleWhatsAppClick,
    handleShare,
    handleFavorite
  } = usePublicationDetail();

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Notify parent about detail state changes
  useEffect(() => {
    onDetailStateChange?.(isDetailOpen);
  }, [isDetailOpen, onDetailStateChange]);

  // Handle publication click - Simplificado
  const handlePublicationClick = (publication: PublicationData) => {
    if (isDetailOpen && selectedPublication?.id === publication.id) {
      // Si está abierto el mismo aviso, cerrarlo
      closePublicationDetail();
    } else {
      // Abrir el nuevo aviso (o cambiar al nuevo si hay uno diferente abierto)
      openPublicationDetail(publication);
    }
  };

  // Get grid classes based on view mode and detail state
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'flex flex-col gap-3';
    }
    
    // Desktop: adjust columns when detail is open
    if (!isMobile && isDetailOpen) {
      return 'grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4';
    }
    
    // Default: responsive grid
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4';
  };

  // Get container classes for the publications area
  const getPublicationsContainerClasses = () => {
    if (!isMobile && isDetailOpen) {
      return 'w-full'; // Full width in its column
    }
    return 'w-full';
  };

  // Get main container classes
  const getMainContainerClasses = () => {
    return `relative w-full ${className}`;
  };

  return (
    <>
      {/* Publications Grid/List - siempre renderizado */}
      <div className={getMainContainerClasses()}>
        <div className={getPublicationsContainerClasses()}>
          <div className={getGridClasses()}>
            {publications.map((publication, index) => (
              <PublicationCard
                key={publication.id}
                publication={publication}
                onPublicationClick={handlePublicationClick}
                viewMode={viewMode}
                className={viewMode === 'list' && !isMobile && isDetailOpen 
                  ? 'max-w-none' 
                  : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - solo en móviles */}
      {isMobile && isDetailOpen && selectedPublication && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <PublicationDetailSidebar
            publication={selectedPublication}
            isOpen={isDetailOpen}
            onClose={closePublicationDetail}
            onWhatsAppClick={handleWhatsAppClick}
            onShare={handleShare}
            onFavorite={handleFavorite}
          />
        </div>
      )}

      {/* Desktop Sidebar - solo si NO se renderiza en el padre */}
      {!renderSidebarInParent && !isMobile && isDetailOpen && selectedPublication && (
        <div className="w-full h-fit">
          <PublicationDetailSidebar
            publication={selectedPublication}
            isOpen={isDetailOpen}
            onClose={closePublicationDetail}
            onWhatsAppClick={handleWhatsAppClick}
            onShare={handleShare}
            onFavorite={handleFavorite}
          />
        </div>
      )}

      {/* Mobile Modal */}
      {isMobile && (
        <PublicationDetailModal
          publication={selectedPublication}
          isOpen={isDetailOpen}
          onClose={closePublicationDetail}
          onWhatsAppClick={handleWhatsAppClick}
          onShare={handleShare}
          onFavorite={handleFavorite}
        />
      )}
    </>
  );
} 