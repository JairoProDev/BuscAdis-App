'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublication, publicationActions } from '@/contexts/PublicationContext';
import CategorySelector from '@/components/publish/CategorySelector';
import LocationSelector from '@/components/publish/LocationSelector';
import PriceInput from '@/components/publish/PriceInput';
import ImageUploader from '@/components/publish/ImageUploader';
import PublishAchievements from '@/components/publish/PublishAchievements';
import { Logger } from '@/services/logging.service';

const steps = [
  { id: 1, title: 'Categoría', description: 'Selecciona la categoría de tu publicación' },
  { id: 2, title: 'Detalles', description: 'Completa los detalles de tu publicación' },
  { id: 3, title: 'Ubicación', description: 'Indica la ubicación' },
  { id: 4, title: 'Imágenes', description: 'Sube imágenes de tu publicación' },
  { id: 5, title: 'Revisar', description: 'Revisa y publica tu anuncio' },
];

export default function PublishPage() {
  const { state, dispatch } = usePublication();

  useEffect(() => {
    Logger.info('Iniciando proceso de publicación');
    return () => {
      Logger.info('Limpiando proceso de publicación');
    };
  }, []);

  const handleStepClick = (stepId: number) => {
    if (stepId <= state.currentStep) {
      dispatch(publicationActions.setStep(stepId));
      Logger.info(`Navegando al paso ${stepId}`);
    }
  };

  const handleNext = () => {
    if (state.currentStep < steps.length) {
      dispatch(publicationActions.setStep(state.currentStep + 1));
      Logger.info(`Avanzando al paso ${state.currentStep + 1}`);
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1) {
      dispatch(publicationActions.setStep(state.currentStep - 1));
      Logger.info(`Retrocediendo al paso ${state.currentStep - 1}`);
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return <CategorySelector />;
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                value={state.formData.title || ''}
                onChange={(e) =>
                  dispatch(
                    publicationActions.updateForm({ title: e.target.value })
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Escribe un título descriptivo"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={state.formData.description || ''}
                onChange={(e) =>
                  dispatch(
                    publicationActions.updateForm({
                      description: e.target.value,
                    })
                  )
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                placeholder="Describe tu publicación en detalle"
              />
            </div>

            <PriceInput
              value={state.formData.price}
              onChange={(price) =>
                dispatch(publicationActions.updateForm({ price }))
              }
            />
          </div>
        );
      case 3:
        return (
          <LocationSelector
            value={state.formData.location}
            onChange={(location) =>
              dispatch(publicationActions.updateForm({ location }))
            }
          />
        );
      case 4:
        return (
          <ImageUploader
            images={state.formData.images || []}
            onImagesChange={(images) =>
              dispatch(publicationActions.updateForm({ images }))
            }
          />
        );
      case 5:
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Resumen de tu publicación</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Título</dt>
                  <dd className="mt-1 text-sm text-gray-900">{state.formData.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                  <dd className="mt-1 text-sm text-gray-900">{state.formData.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {state.formData.price?.amount} {state.formData.price?.currency}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {state.formData.location?.city}, {state.formData.location?.country}
                  </dd>
                </div>
              </dl>
            </div>

            <PublishAchievements
              achievements={state.achievements}
              totalPoints={state.totalPoints}
            />

            <div className="flex justify-center">
              <button
                onClick={() => {
                  // Aquí iría la lógica para publicar
                  Logger.info('Publicación enviada', { formData: state.formData });
                }}
                className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Publicar anuncio
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li
                  key={step.id}
                  className={`${
                    stepIdx !== steps.length - 1 ? 'flex-1' : ''
                  } relative`}
                >
                  <button
                    className={`group flex items-center w-full ${
                      step.id <= state.currentStep
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed'
                    }`}
                    onClick={() => handleStepClick(step.id)}
                    disabled={step.id > state.currentStep}
                  >
                    <span className="px-6 py-4 flex items-center text-sm font-medium">
                      <span
                        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                          step.id < state.currentStep
                            ? 'bg-primary'
                            : step.id === state.currentStep
                            ? 'border-2 border-primary'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        <span
                          className={
                            step.id < state.currentStep
                              ? 'text-white'
                              : step.id === state.currentStep
                              ? 'text-primary'
                              : 'text-gray-500'
                          }
                        >
                          {step.id}
                        </span>
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-900">
                        {step.title}
                      </span>
                    </span>
                  </button>

                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={`hidden md:block absolute top-0 right-0 h-full w-5 ${
                        step.id < state.currentStep ? 'bg-primary' : 'bg-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Step Content */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={state.currentStep === 1}
              className={`px-4 py-2 rounded-md ${
                state.currentStep === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>
            {state.currentStep < steps.length && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 