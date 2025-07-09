'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface PublicationProgressProps {
  progress: number;
  stepNames: string[];
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  completedFields?: { [key: string]: boolean }; // Nuevo prop opcional
}

const PublicationProgress: React.FC<PublicationProgressProps> = ({ 
  progress, 
  stepNames, 
  currentStep, 
  totalSteps,
  onStepClick,
  completedFields
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Publicar Anuncio</h1>
        <div className="text-sm font-medium text-primary-700 dark:text-primary-300">
          {Math.round(progress)}% completado
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pasos (versión dispositivos medianos y grandes) */}
      <div className="hidden md:flex justify-between">
        {stepNames.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedFields
            ? Object.values(completedFields)[index]
            : stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div 
              key={index} 
              className={`flex flex-col items-center ${onStepClick ? 'cursor-pointer' : ''}`}
              onClick={() => onStepClick && onStepClick(stepNumber)}
            >
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full mb-1 transition-all ${
                  isCompleted 
                    ? 'bg-primary-600 dark:bg-primary-500 text-white' 
                    : isCurrent 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-600 dark:border-primary-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>
              <span className={`text-xs ${
                isCurrent ? 'font-semibold text-primary-700 dark:text-primary-300' : 
                isCompleted ? 'font-medium text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pasos (versión móvil) */}
      <div className="md:hidden flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
        <div className="flex items-center">
          <div 
            className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
              currentStep > 1 
                ? 'bg-primary-600 dark:bg-primary-500 text-white' 
                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-600 dark:border-primary-400'
            }`}
          >
            {currentStep > 1 ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <span className="text-xs font-medium">{currentStep}</span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {stepNames[currentStep - 1]}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Paso {currentStep} de {totalSteps}
        </span>
      </div>
    </div>
  );
};

export default PublicationProgress; 