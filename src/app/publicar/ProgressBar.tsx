// ProgressBar.tsx
'use client';

import React from 'react';

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-between">
      {steps.map((step, index) => (
        <div key={step} className={`flex-1 text-center ${index <= currentStep ? 'text-primary-600 font-semibold' : 'text-gray-400'}`}>
          {step}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;