'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { usePublicationDetail } from '@/hooks/usePublicationDetail';
import PublicationDetailSidebar from './PublicationDetailSidebar';
import PublicationCard from './PublicationCard';
import { PublicationData } from '@/types/publication';
import { WhatsAppIcon } from '@/components/icons';
import { ShareIcon } from '@heroicons/react/24/outline';

export interface PublicationDetailContainerProps {
  publications: PublicationData[];
  className?: string;
  viewMode?: 'grid' | 'list';
  onDetailStateChange?: (isOpen: boolean) => void;
  renderSidebarInParent?: boolean;
}

// Unified Publication Detail Overlay Component
const UnifiedPublicationDetail = ({
  publication,
  isOpen,
  onClose,
  onWhatsAppClick,
  onShare,
  onFavorite,
  isMobile
}: {
  publication: PublicationData | null;
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppClick: (publication: PublicationData) => void;
  onShare: (publication: PublicationData) => void;
  onFavorite: (publication: PublicationData) => void;
  isMobile: boolean;
}) => {
  const [dragY, setDragY] = useState(0);
  const constraintsRef = useRef(null);

  if (!publication) return null;

  // Mobile bottom sheet animations
  const mobileVariants = {
    hidden: { 
      y: '100%',
      opacity: 0
    },
    visible: { 
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: { 
      y: '100%',
      opacity: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.2
      }
    }
  };

  // Desktop sidebar animations
  const desktopVariants = {
    hidden: { 
      x: '100%',
      opacity: 0
    },
    visible: { 
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: { 
      x: '100%',
      opacity: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.2
      }
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (isMobile && info.offset.y > 100) {
      onClose();
    }
  };

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={onClose}
            />
            
            {/* Mobile Bottom Sheet */}
            <motion.div
              ref={constraintsRef}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileVariants}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              className="fixed inset-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[100vh] h-full flex flex-col overflow-hidden"
              style={{
                y: dragY
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="w-full flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
              
              {/* Content Container with Scroll */}
              <div className="flex-1 overflow-y-auto pb-safe">
                <PublicationDetailSidebar
                  publication={publication}
                  isOpen={isOpen}
                  onClose={onClose}
                  onWhatsAppClick={onWhatsAppClick}
                  onShare={onShare}
                  onFavorite={onFavorite}
                />
              </div>

            {/* Footer - Contact Actions */}
            {publication && (
              <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex gap-3">
                  {publication.whatsapp && (
                    <button
                      onClick={() => onWhatsAppClick(publication)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      <span>Contactar</span>
                    </button>
                  )}
                  <button
                    onClick={() => onShare(publication)}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop rendering - when renderSidebarInParent is false
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={desktopVariants}
          className="w-full h-fit"
        >
          <PublicationDetailSidebar
            publication={publication}
            isOpen={isOpen}
            onClose={onClose}
            onWhatsAppClick={onWhatsAppClick}
            onShare={onShare}
            onFavorite={onFavorite}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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

  // Handle publication click
  const handlePublicationClick = (publication: PublicationData) => {
    if (isDetailOpen && selectedPublication?.id === publication.id) {
      closePublicationDetail();
    } else {
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

  return (
    <>
      {/* Publications Grid/List */}
      <div className={`relative w-full ${className}`}>
        <div className="w-full">
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

      {/* Unified Publication Detail - Mobile always renders as bottom sheet */}
      {isMobile && (
        <UnifiedPublicationDetail
          publication={selectedPublication}
          isOpen={isDetailOpen}
          onClose={closePublicationDetail}
          onWhatsAppClick={handleWhatsAppClick}
          onShare={handleShare}
          onFavorite={handleFavorite}
          isMobile={true}
        />
      )}

      {/* Desktop Detail - only when NOT rendered in parent */}
      {!renderSidebarInParent && !isMobile && (
        <UnifiedPublicationDetail
          publication={selectedPublication}
          isOpen={isDetailOpen}
          onClose={closePublicationDetail}
          onWhatsAppClick={handleWhatsAppClick}
          onShare={handleShare}
          onFavorite={handleFavorite}
          isMobile={false}
        />
      )}
    </>
  );
} 