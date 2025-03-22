// MediaStep.tsx
'use client';

import React from 'react';
import MediaUploader from '@/components/publish/MediaUploader';
import { QuickPublicationData } from '@/services/publications.service';

interface MediaStepProps {
  ad: QuickPublicationData;
  setAd: React.Dispatch<React.SetStateAction<QuickPublicationData>>;
  onNext: () => void;
  onPrevious: () => void;
}

const MediaStep: React.FC<MediaStepProps> = ({ ad, setAd, onNext, onPrevious }) => {
  return (
    <div>
      <MediaUploader
        files={ad.media || []}
        onFilesChange={(files) => setAd({ ...ad, media: files })}
        maxFiles={5}
      />
      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="px-6 py-3 flex items-center gap-2 text-primary-600 hover:text-primary-800">
          <ChevronLeftIcon className="w-5 h-5" />
          Anterior
        </button>
        <button onClick={onNext} className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2">
          Siguiente
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MediaStep;