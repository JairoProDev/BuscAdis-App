// DetailsStep.tsx
'use client';

import React from 'react';
import { QuickPublicationData } from '@/services/publications.service';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface DetailsStepProps {
  ad: QuickPublicationData;
  setAd: React.Dispatch<React.SetStateAction<QuickPublicationData>>;
  onNext: () => void;
  onPrevious: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ ad, setAd, onNext, onPrevious, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-primary-700 mb-2">
          Título del anuncio *
        </label>
        <input
          id="title"
          type="text"
          name="title"
          value={ad.title}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="Ej: Vendo iPhone 12 Pro Max"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
          Descripción *
        </label>
        <textarea
          id="description"
          name="description"
          value={ad.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          placeholder="Describe tu producto o servicio"
          required
        />
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="px-6 py-3 flex items-center gap-2 text-primary-600 hover:text-primary-800">
          <ChevronLeftIcon className="w-5 h-5" />
          Anterior
        </button>
        <button
          onClick={onNext}
          disabled={!ad.title || !ad.description}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Siguiente
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DetailsStep;