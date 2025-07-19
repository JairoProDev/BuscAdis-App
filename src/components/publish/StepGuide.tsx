import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  LightBulbIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Logger } from '@/services/logging.service';

interface Step {
  id: number;
  title: string;
  description: string;
  tips: string[];
  completed: boolean;
  current: boolean;
}

interface StepGuideProps {
  steps: Step[];
  onStepClick?: (stepId: number) => void;
}

export default function StepGuide({ steps, onStepClick }: StepGuideProps) {
  const handleStepClick = (step: Step) => {
    if (step.completed && onStepClick) {
      Logger.info(`Navegando al paso: ${step.title}`);
      onStepClick(step.id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progreso general */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">
            Progreso general
          </span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round((steps.filter(s => s.completed).length / steps.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500"
            initial={{ width: '0%' }}
            animate={{
              width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%`
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Lista de pasos */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative ${
              step.completed || step.current ? 'cursor-pointer' : 'opacity-50'
            }`}
            onClick={() => handleStepClick(step)}
          >
            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-4 top-14 w-0.5 h-full -z-10 ${
                  step.completed ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}

            <div
              className={`relative flex items-start gap-4 p-4 rounded-xl transition-colors ${
                step.current ? 'bg-primary-50 border-2 border-primary-200' : ''
              }`}
            >
              {/* Indicador de estado */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-primary-500 text-white'
                    : step.current
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>

              {/* Contenido del paso */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${
                    step.current ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>
                  {step.completed && !step.current && (
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{step.description}</p>

                {/* Tips */}
                <AnimatePresence>
                  {step.current && step.tips.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2"
                    >
                      {step.tips.map((tip, tipIndex) => (
                        <div
                          key={tipIndex}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <LightBulbIcon className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ayuda contextual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 p-4 bg-blue-50 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">¿Necesitas ayuda?</p>
            <p>
              Puedes hacer clic en cualquier paso completado para volver y editarlo.
              Asegúrate de completar cada paso correctamente antes de continuar.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 