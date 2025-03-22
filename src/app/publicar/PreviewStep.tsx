// PreviewStep.tsx
'use client';

import React from 'react';
import { QuickPublicationData } from '@/services/publications.service';
import LivePreview from './LivePreview';

interface PreviewStepProps {
  ad: QuickPublicationData;
  onSubmit: () => void;
  onPrevious: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ ad, onSubmit, onPrevious }) => {
  return (
    <div>
      <LivePreview ad={ad} />
      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="px-6 py-3 text-primary-600 hover:text-primary-800">
          Anterior
        </button>
        <button onClick={onSubmit} className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600">
          Publicar
        </button>
      </div>
    </div>
  );
};

export default PreviewStep;