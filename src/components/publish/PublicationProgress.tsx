'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface PublicationProgressProps {
  progress: number;
  steps: string[];
  currentStep: number;
}

const PublicationProgress: React.FC<PublicationProgressProps> = ({ progress, steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Publicar Anuncio</h1>
        <div className="text-sm font-medium text-primary-700">
          {Math.round(progress)}% completado
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pasos (versión dispositivos medianos y grandes) */}
      <div className="hidden md:flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-all ${
                  isCompleted 
                    ? 'bg-primary-600 text-white' 
                    : isCurrent 
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-600' 
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`text-xs ${
                isCurrent ? 'font-semibold text-primary-700' : 
                isCompleted ? 'font-medium text-gray-700' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pasos (versión móvil) */}
      <div className="md:hidden flex items-center justify-between bg-gray-50 p-2 rounded-lg">
        <div className="flex items-center">
          <div 
            className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
              currentStep > 0 ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700 border-2 border-primary-600'
            }`}
          >
            {currentStep > 0 ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <span className="text-xs font-medium">1</span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-800">
            {steps[currentStep]}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Paso {currentStep + 1} de {steps.length}
        </span>
      </div>
    </div>
  );
};

export default PublicationProgress; 