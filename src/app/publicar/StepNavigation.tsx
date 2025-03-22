// StepNavigation.tsx
'use client';

import React from 'react';

interface StepNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  showNext: boolean;
  showPrevious: boolean;
  nextText?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ onPrevious, onNext, showNext, showPrevious, nextText = 'Siguiente' }) => {
  return (
    <div className="flex justify-between pt-4">
      {showPrevious && (
        <button onClick={onPrevious} className="px-6 py-3 text-primary-600 hover:text-primary-800">
          Anterior
        </button>
      )}
      {showNext && (
        <button onClick={onNext} className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600">
          {nextText}
        </button>
      )}
    </div>
  );
};

export default StepNavigation;