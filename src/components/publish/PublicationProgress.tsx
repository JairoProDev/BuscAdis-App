'use client';

import React from 'react';

interface PublicationProgressProps {
  progress: number;
  steps?: string[];
  currentStep?: number;
}

const PublicationProgress: React.FC<PublicationProgressProps> = ({ 
  progress, 
  steps = [], 
  currentStep = 0 
}) => {
  return (
    <div className="w-full mb-6">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
              Progreso
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-primary-600">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
          <div 
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-300"
          />
        </div>
        {steps.length > 0 && (
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={step} 
                className={`flex-1 text-center ${index <= currentStep ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}
              >
                {step}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationProgress; 