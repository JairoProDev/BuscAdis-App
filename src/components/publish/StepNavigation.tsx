'use client';

import React from 'react';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface StepNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  nextText?: string;
  previousText?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  onPrevious,
  isFirstStep = false,
  isLastStep = false,
  isNextDisabled = false,
  isPreviousDisabled = false,
  nextText = 'Siguiente',
  previousText = 'Anterior',
}) => {
  return (
    <div className="flex justify-between mt-8">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || isPreviousDisabled}
        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium
          ${isFirstStep || isPreviousDisabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
      >
        <ChevronLeftIcon className="mr-2 h-5 w-5" />
        {previousText}
      </button>
      
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium
          ${isNextDisabled 
            ? 'bg-primary-300 text-white cursor-not-allowed' 
            : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
      >
        {isLastStep ? 'Publicar' : nextText}
        {!isLastStep && <ChevronRightIcon className="ml-2 h-5 w-5" />}
      </button>
    </div>
  );
};

export default StepNavigation; 