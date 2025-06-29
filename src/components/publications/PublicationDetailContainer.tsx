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
}

export default function PublicationDetailContainer({
  publications,
  className = '',
  viewMode = 'grid'
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

  // Handle publication click
  const handlePublicationClick = (publication: PublicationData) => {
    openPublicationDetail(publication);
  };

  // Get grid classes based on view mode and detail state
  const getGridClasses = () => {
    if (viewMode === 'list') {
      return 'flex flex-col gap-3';
    }
    
    // Default: responsive grid (sidebar is now fixed, so no need to reduce columns)
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4';
  };

  // Get container classes for the publications area
  const getPublicationsContainerClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-in-out';
    
    if (!isMobile && isDetailOpen) {
      // When detail is open on desktop, add right margin for fixed sidebar
      return `${baseClasses} w-full pr-[calc(33.333333%+2rem)] xl:pr-[calc(25%+2rem)]`;
    }
    
    return `${baseClasses} w-full`;
  };

  // Get main container classes
  const getMainContainerClasses = () => {
    const baseClasses = 'flex gap-0';
    
    if (!isMobile && isDetailOpen) {
      return `${baseClasses} h-full`;
    }
    
    return baseClasses;
  };

  return (
    <div className={`${getMainContainerClasses()} ${className} relative`}>
      {/* Publications Grid/List */}
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

      {/* Desktop Sidebar - Fixed position within content area */}
      {!isMobile && isDetailOpen && (
        <div className="fixed top-[14rem] right-4 bottom-8 w-1/3 xl:w-1/4 z-40">
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