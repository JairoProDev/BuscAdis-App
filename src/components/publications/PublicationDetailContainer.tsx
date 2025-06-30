'use client';

import React from 'react';
import { usePublicationDetail } from '@/hooks/usePublicationDetail';
import PublicationDetailSidebar from './PublicationDetailSidebar';
import PublicationDetailModal from './PublicationDetailModal';
import PublicationCard from './PublicationCard';
import { PublicationData } from '@/types/publication';

interface PublicationDetailContainerProps {
  publications: PublicationData[];
  className?: string;
  viewMode?: 'grid' | 'list';
  onDetailStateChange?: (isOpen: boolean) => void;
}

export default function PublicationDetailContainer({
  publications,
  className = '',
  viewMode = 'grid',
  onDetailStateChange
}: PublicationDetailContainerProps) {
  const {
    selectedPublication,
    isDetailOpen,
    isMobile,
    openPublicationDetail,
    closePublicationDetail,
    handleWhatsAppClick,
    handleShare,
    handleFavorite
  } = usePublicationDetail();

  // Notify parent about detail state changes
  React.useEffect(() => {
    onDetailStateChange?.(isDetailOpen && !isMobile);
  }, [isDetailOpen, isMobile, onDetailStateChange]);

  // Handle publication click
  const handlePublicationClick = (publication: PublicationData) => {
    openPublicationDetail(publication);
  };

  // Get grid classes based on view mode and detail state
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'flex flex-col gap-3';
    }
    
    // Desktop: reduce columns when detail is open
    if (!isMobile && isDetailOpen) {
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 md:gap-4'; // 2 columnas siempre cuando sidebar abierto
    }
    
    // Default: responsive grid
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4';
  };

  // Get container classes for the publications area
  const getPublicationsContainerClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-in-out';
    
    // No need for right margin since we're reducing columns instead
    return `${baseClasses} w-full`;
  };

  // Get main container classes
  const getMainContainerClasses = () => {
    const baseClasses = 'relative w-full';
    if (!isMobile && isDetailOpen) {
      return `${baseClasses} flex flex-row items-start`;
    }
    return baseClasses;
  };

  return (
    <div className={`${getMainContainerClasses()} ${className}`}>
      {/* Publications Grid/List */}
      <div
        className={getPublicationsContainerClasses()}
        style={!isMobile && isDetailOpen ? { flex: '1 1 0%', maxWidth: 'calc(100% - 500px)' } : {}}
      >
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

      {/* Desktop Sidebar - Sticky position within content area */}
      {!isMobile && isDetailOpen && (
        <div className="sticky top-[0.5rem] right-0 min-h-[400px] z-40 ml-6" style={{ flex: '1 1 500px', maxWidth: '500px', width: '100%' }}>
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
    </div>
  );
} 