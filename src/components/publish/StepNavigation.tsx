'use client';

import React from 'react';
import { ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface StepNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextText?: string;
  previousText?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  nextText = 'Siguiente',
  previousText = 'Anterior'
}) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`flex items-center justify-center px-5 py-2.5 rounded-lg transition-all duration-200 ${
          isFirstStep
            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        {previousText}
      </button>

      <button
        type="button"
        onClick={onNext}
        className={`flex items-center justify-center px-8 py-2.5 rounded-lg text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${
          isLastStep
            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
        }`}
      >
        {nextText}
        {!isLastStep && <ChevronRightIcon className="w-4 h-4 ml-2" />}
      </button>
    </div>
  );
};

export default StepNavigation; 