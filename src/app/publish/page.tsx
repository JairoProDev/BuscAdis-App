'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicationsService } from '@/services/publications.service';
import CategorySelector from '@/components/publish/CategorySelector';
import LocationSelector from '@/components/publish/LocationSelector';
import PriceInput from '@/components/publish/PriceInput';
import ContactForm from '@/components/publish/ContactForm';
import MediaStep from '@/components/publish/MediaStep';
import AdPreview from '@/components/publish/AdPreview';
import LivePreview from '@/components/publish/LivePreview';
import PublicationProgress from '@/components/publish/PublicationProgress';
import StepNavigation from '@/components/publish/StepNavigation';
import SuccessMessage from '@/components/publish/SuccessMessage';
import PublishAchievements from '@/components/publish/PublishAchievements';
import { StarIcon, FireIcon, CheckIcon } from '@heroicons/react/24/solid';
import { PublicationFormData, PublicationLocation, PublicationContact } from '@/types/publication';
import { Logger } from '@/services/logging.service';
import { categoriesList } from '@/data/categories-data';

// Definir los pasos
const STEPS = {
  CATEGORY: 1,
  DETAILS: 2,
  MEDIA: 3,
  CONTACT: 4,
  PREVIEW: 5
} as const;

const STEP_NAMES = ['Clasificación', 'Detalles', 'Imágenes', 'Contacto', 'Publicar'];

type StepKey = keyof typeof STEPS;
type StepValue = typeof STEPS[StepKey];

// Para mostrar errores
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Para mostrar estados de carga
function LoadingDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-4 border-t-primary-600 border-primary-200 animate-spin mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export default function PublishPage() {
  const [step, setStep] = useState<StepValue>(STEPS.CATEGORY);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<{
    completed: string[];
    points: number;
    badges: string[];
  }>({
    completed: [],
    points: 0,
    badges: []
  });

  // Estado principal del anuncio
  const [ad, setAd] = useState<PublicationFormData>({
    title: '',
    description: '',
    categorySlug: '',
    subcategorySlug: '',
    subSubcategorySlug: '',
    transactionType: 'venta',
    amount: null,
    currency: 'PEN',
    negotiable: false,
    location: {
      province: 'Cusco',
      district: '',
      address: '',
      referencePoint: '',
      coordinates: null,
    },
    contact: {
      phones: [''],
      email: '',
      name: '',
      website: '',
    },
    attributes: {},
    images: [],
    status: 'pending',
    premium: false,
  });

  // Actualizar logros y gamificación
  const updateAchievements = useCallback((newAd: PublicationFormData) => {
    const newAchievements = { ...achievements };
    
    // Completó categoría
    if (newAd.categorySlug && newAd.subcategorySlug && 
        !achievements.completed.includes('category')) {
      newAchievements.completed.push('category');
      newAchievements.points += 10;
      Logger.info('Logro obtenido: Categoría seleccionada');
    }
    
    // Completó detalles
    if (newAd.title && newAd.title.length >= 10 && newAd.description && 
        newAd.description.length >= 30 && !achievements.completed.includes('details')) {
      newAchievements.completed.push('details');
      newAchievements.points += 15;
      Logger.info('Logro obtenido: Detalles completos');
    }
    
    // Completó ubicación
    if (newAd.location?.district && !achievements.completed.includes('location')) {
      newAchievements.completed.push('location');
      newAchievements.points += 10;
      Logger.info('Logro obtenido: Ubicación completa');
    }
    
    // Completó imágenes
    if (newAd.images && newAd.images.length >= 2 && !achievements.completed.includes('images')) {
      newAchievements.completed.push('images');
      newAchievements.points += 20;
      Logger.info('Logro obtenido: Imágenes subidas');
    }
    
    // Completó contacto
    if (newAd.contact?.phones?.[0] && !achievements.completed.includes('contact')) {
      newAchievements.completed.push('contact');
      newAchievements.points += 10;
      Logger.info('Logro obtenido: Contacto proporcionado');
    }
    
    // Asignar insignias según puntos
    if (newAchievements.points >= 50 && !newAchievements.badges.includes('bronce')) {
      newAchievements.badges.push('bronce');
    }
    
    if (newAchievements.points >= 80 && !newAchievements.badges.includes('plata')) {
      newAchievements.badges.push('plata');
    }
    
    if (newAchievements.points >= 100 && !newAchievements.badges.includes('oro')) {
      newAchievements.badges.push('oro');
    }
    
    setAchievements(newAchievements);
  }, [achievements]);

  // Actualiza el progreso basado en el paso actual y logros
  const progress = useMemo(() => {
    const baseProgress = (step / Object.keys(STEPS).length) * 80;
    const achievementBonus = Math.min(achievements.points / 5, 20);
    return baseProgress + achievementBonus;
  }, [step, achievements.points]);

  // Calidad del anuncio
  const adQuality = useMemo(() => {
    let quality = 0;
    
    // Título detallado
    if (ad.title && ad.title.length > 15) quality += 10;
    
    // Descripción detallada
    if (ad.description && ad.description.length > 50) quality += 15;
    if (ad.description && ad.description.length > 100) quality += 10;
    
    // Imágenes
    if (ad.images && ad.images.length) quality += ad.images.length * 5;
    
    // Información de contacto
    if (ad.contact?.phones && ad.contact.phones.length) quality += 10;
    if (ad.contact?.email) quality += 5;
    
    // Precio
    if (ad.amount !== null) quality += 10;
    
    // Ubicación detallada
    if (ad.location?.district && ad.location?.address) quality += 10;
    
    return Math.min(100, quality);
  }, [ad]);

  // Definir tipos para los datos que pasan a los componentes
  type ClassificationData = {
    categorySlug: string;
    subcategorySlug: string;
    subSubcategorySlug?: string | null;
  };

  type PriceData = {
    amount: number | null;
    currency: string;
    negotiable: boolean;
  };

  type LocationData = PublicationLocation;

  type ContactData = PublicationContact;

  // Validación de pasos - Definido primero para evitar el error de inicialización
  const validateStep = useCallback((currentStep: StepValue): boolean => {
    const errors: string[] = [];
    setError('');

    switch (currentStep) {
      case STEPS.CATEGORY:
        if (!ad.categorySlug) {
          errors.push('Debes seleccionar una categoría.');
        }
        // No validar subcategoría aquí, para permitir selección en un solo paso
        break;
      case STEPS.DETAILS:
        if (!ad.title || ad.title.trim().length < 5) {
          errors.push('El título es obligatorio y debe tener al menos 5 caracteres.');
        }
        if (!ad.description || ad.description.trim().length < 15) {
           errors.push('La descripción es obligatoria y debe tener al menos 15 caracteres.');
        }
        if (!ad.location?.district) {
            errors.push('Selecciona un distrito.');
        }
        break;
      case STEPS.MEDIA:
        // Las imágenes son opcionales, pero recomendadas
        break;
      case STEPS.CONTACT:
        if (!ad.contact?.phones || ad.contact.phones.length === 0 || !ad.contact.phones[0]?.trim()) {
          errors.push('Debes ingresar al menos un número de teléfono.');
        } else {
           const phoneRegex = /^[0-9\s+\-()]*\d[0-9\s+\-()]*$/;
           if (!phoneRegex.test(ad.contact.phones[0])) {
               errors.push('Ingresa un número de teléfono válido.');
           }
        }
        if (ad.contact?.email && !/\S+@\S+\.\S+/.test(ad.contact.email)) {
            errors.push('Ingresa un correo electrónico válido.');
        }
        break;
      case STEPS.PREVIEW:
        // En este paso se asume que las validaciones anteriores pasaron
        break;
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return false;
    }
    return true;
  }, [ad, setError]);

  // Navegación entre pasos - Definido después de validateStep
  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setError('');
      setStep(prevStep => Math.min(prevStep + 1, Object.keys(STEPS).length) as StepValue);
      Logger.info(`Avanzando al paso ${step + 1}`);
    }
  }, [step, validateStep, setError]);

  const handlePrevious = useCallback(() => {
    setError('');
    setStep(prevStep => Math.max(prevStep - 1, 1) as StepValue);
    Logger.info(`Retrocediendo al paso ${step - 1}`);
  }, [step]);

  // Actualizar anuncio y logros
  const updateAd = useCallback((newAdData: Partial<PublicationFormData>) => {
    setAd(prevAd => {
      const updatedAd = {...prevAd, ...newAdData};
      updateAchievements(updatedAd);
      return updatedAd;
    });
  }, [updateAchievements]);

  // Handlers de cambios
  const handleSimpleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAd({ [name]: value });
  }, [updateAd]);

  const handleClassificationChange = useCallback((slugs: ClassificationData) => {
    updateAd({
      categorySlug: slugs.categorySlug,
      subcategorySlug: slugs.subcategorySlug,
      subSubcategorySlug: slugs.subSubcategorySlug || '',
    });
    
    // Si se ha completado la selección completa (categoría, subcategoría y subSubcategoría), avanzar automáticamente
    if (slugs.categorySlug && slugs.subcategorySlug && slugs.subSubcategorySlug) {
      // Pequeño retraso para permitir que la UI se actualice
      setTimeout(() => {
        if (validateStep(STEPS.CATEGORY)) {
          setStep(prevStep => Math.min(prevStep + 1, Object.keys(STEPS).length) as StepValue);
          Logger.info(`Avanzando al paso ${step + 1} automáticamente después de seleccionar sub-subcategoría`);
        }
      }, 800);
    } 
    // También avanzar si se seleccionó subcategoría sin sub-subcategoría disponible
    else if (slugs.categorySlug && slugs.subcategorySlug) {
      // Comprobar si esta subcategoría tiene sub-subcategorías
      const category = categoriesList.find(c => c.id === slugs.categorySlug);
      const subcategory = category?.subcategories?.find(s => s.id === slugs.subcategorySlug);
      const hasSubSubcategories = subcategory?.subSubcategories && subcategory.subSubcategories.length > 0;
      
      if (!hasSubSubcategories) {
        // Pequeño retraso para permitir que la UI se actualice
        setTimeout(() => {
          if (validateStep(STEPS.CATEGORY)) {
            setStep(prevStep => Math.min(prevStep + 1, Object.keys(STEPS).length) as StepValue);
            Logger.info(`Avanzando al paso ${step + 1} automáticamente después de seleccionar subcategoría final`);
          }
        }, 800);
      }
    }
    
    Logger.info('Categoría seleccionada', slugs);
  }, [updateAd, validateStep, setStep, step, categoriesList]);

  const handlePriceChange = useCallback((priceData: any) => {
    updateAd({
      amount: priceData.amount,
      currency: priceData.currency,
      negotiable: priceData.negotiable,
    });
  }, [updateAd]);

  const handleLocationChange = useCallback((locationData: any) => {
    // Asegurarse de que los datos de ubicación tienen la estructura correcta
    updateAd({
      location: {
        province: locationData.province || 'Cusco',
        district: locationData.district || '',
        address: locationData.address || '',
        referencePoint: locationData.referencePoint || '',
        coordinates: locationData.coordinates || null,
      }
    });
  }, [updateAd]);

  const handleContactChange = useCallback((contactData: any) => {
    updateAd({
      contact: {
        phones: contactData.phones || [],
        email: contactData.email || '',
        name: contactData.name || '',
        website: contactData.website || '',
      }
    });
  }, [updateAd]);

  const handleImagesChange = useCallback((imageUrls: string[]) => {
    updateAd({
      images: imageUrls
    });
  }, [updateAd]);

  // Submit final
  const handleSubmit = useCallback(async () => {
    if (!validateStep(STEPS.PREVIEW)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Preparar datos finales
      const finalAdData = { ...ad };
      if (!finalAdData.subSubcategorySlug) delete finalAdData.subSubcategorySlug;
      if (finalAdData.images?.length === 0) delete finalAdData.images;

      // Enviar al servicio
      const response = await PublicationsService.createPublication(finalAdData);
      
      setPublishedId(response.id);
      setSuccess(true);
      Logger.info('Publicación creada exitosamente', { id: response.id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Hubo un error al publicar tu anuncio';
      setError(errorMessage);
      Logger.error('Error al crear publicación', { error });
    } finally {
      setLoading(false);
    }
  }, [ad, validateStep]);

  // Renderiza tip de optimización según el paso actual
  const renderOptimizationTip = useCallback(() => {
    switch (step) {
      case STEPS.CATEGORY:
        return "Selecciona la categoría más específica para que tu anuncio llegue a los compradores correctos";
      case STEPS.DETAILS:
        return "Un título descriptivo y una descripción detallada aumentan las posibilidades de venta";
      case STEPS.MEDIA:
        return "Las publicaciones con 3+ imágenes de buena calidad reciben 70% más de contactos";
      case STEPS.CONTACT:
        return "Si proporcionas más de una forma de contacto, aumentas las chances de ser contactado";
      case STEPS.PREVIEW:
        return adQuality >= 80 
          ? "¡Excelente publicación! Tiene todo lo que necesita para destacar" 
          : "Puedes volver a los pasos anteriores para mejorar la calidad de tu anuncio";
      default:
        return "";
    }
  }, [step, adQuality]);

  // Contenido de cada paso
  const renderStepContent = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return (
          <CategorySelector 
            selectedCategory={{
              categorySlug: ad.categorySlug || '',
              subcategorySlug: ad.subcategorySlug || '',
              subSubcategorySlug: ad.subSubcategorySlug || ''
            }}
            onCategorySelect={handleClassificationChange}
            autoAdvance={true}
          />
        );
      case STEPS.DETAILS:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                name="title"
                value={ad.title || ''}
                onChange={handleSimpleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Escribe un título descriptivo"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                value={ad.description || ''}
                onChange={handleSimpleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe tu publicación en detalle"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <PriceInput
                  initialValue={{
                    amount: ad.amount || null,
                    currency: ad.currency || 'PEN',
                    negotiable: ad.negotiable || false
                  }}
                  onChange={handlePriceChange}
                />
              </div>
              
              <div>
                <LocationSelector
                  initialValue={ad.location as PublicationLocation}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
          </div>
        );
      case STEPS.MEDIA:
        return (
          <MediaStep
            images={ad.images || []}
            onImagesChange={handleImagesChange}
            formData={ad}
          />
        );
      case STEPS.CONTACT:
        return (
          <ContactForm
            initialValue={ad.contact as PublicationContact}
            onChange={handleContactChange}
          />
        );
      case STEPS.PREVIEW:
        return (
          <div className="space-y-6">
            <AdPreview 
              adData={ad} 
              isPreview={true}
            />
            
            <PublishAchievements 
              achievements={achievements.completed}
              totalPoints={achievements.points}
              badges={achievements.badges}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Mostrar mensaje de éxito si se completó la publicación
  if (success && publishedId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <SuccessMessage 
            publicationId={publishedId} 
          />
          
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <PublishAchievements 
              achievements={achievements.completed}
              totalPoints={achievements.points}
              badges={achievements.badges}
              showConfetti={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <PublicationProgress 
            progress={progress} 
            steps={STEP_NAMES}
            currentStep={step - 1}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Columna principal */}
          <div className="lg:w-7/12">
            <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
              {/* Tip de optimización */}
              <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FireIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">{renderOptimizationTip()}</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-6 flex justify-center">
                  <LoadingDisplay message="Procesando tu publicación..." />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-h-[520px] overflow-y-auto pr-1 custom-scrollbar"
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              )}

              {error && (
                <div className="mt-4">
                  <ErrorDisplay message={error} />
                </div>
              )}

              {!loading && (
                <StepNavigation
                  onNext={step === STEPS.PREVIEW ? handleSubmit : handleNext}
                  onPrevious={handlePrevious}
                  isFirstStep={step === STEPS.CATEGORY}
                  isLastStep={step === STEPS.PREVIEW}
                  nextText={step === STEPS.PREVIEW ? 'Publicar anuncio' : 'Siguiente'}
                />
              )}
            </div>
            
            {/* Indicador de calidad */}
            <div className="bg-white shadow-lg rounded-xl p-5 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Calidad del anuncio</h3>
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <StarIcon 
                      key={star}
                      className={`h-5 w-5 ${star <= Math.ceil(adQuality/20) 
                        ? 'text-yellow-500' 
                        : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-yellow-300 to-yellow-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${adQuality}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Básico</span>
                <span>Promedio</span>
                <span>Excelente</span>
              </div>
            </div>
          </div>
          
          {/* Columna de vista previa */}
          <div className="lg:w-5/12">
            <div className="sticky top-6">
              <div className="bg-white shadow-lg rounded-xl p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="animate-pulse h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Vista previa en vivo
                  </span>
                  <span className="text-xs text-gray-500">Actualización automática</span>
                </h3>
                <LivePreview ad={ad} />
              </div>
              
              <div className="bg-white shadow-lg rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-500 mr-1.5" />
                  Logros desbloqueados
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center">
                      <span className={`h-3 w-3 rounded-full mr-1.5 ${achievements.completed.includes('category') ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                      Categoría seleccionada
                    </span>
                    {achievements.completed.includes('category') ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center">
                      <span className={`h-3 w-3 rounded-full mr-1.5 ${achievements.completed.includes('details') ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                      Título y descripción
                    </span>
                    {achievements.completed.includes('details') ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center">
                      <span className={`h-3 w-3 rounded-full mr-1.5 ${achievements.completed.includes('location') ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                      Ubicación
                    </span>
                    {achievements.completed.includes('location') ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center">
                      <span className={`h-3 w-3 rounded-full mr-1.5 ${achievements.completed.includes('images') ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                      Imágenes (min. 2)
                    </span>
                    {achievements.completed.includes('images') ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 flex items-center">
                      <span className={`h-3 w-3 rounded-full mr-1.5 ${achievements.completed.includes('contact') ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                      Contacto
                    </span>
                    {achievements.completed.includes('contact') ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <FireIcon className="h-4 w-4 text-orange-500 mr-1.5" />
                    <span className="text-xs font-medium text-gray-700">Puntos acumulados</span>
                  </div>
                  <span className="text-xs font-bold bg-gradient-to-r from-primary-500 to-primary-700 text-white px-3 py-1 rounded-full">
                    {achievements.points} pts
                  </span>
                </div>
                {achievements.badges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {achievements.badges.map((badge) => (
                      <div key={badge} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          badge === 'bronce' ? 'bg-amber-700' : 
                          badge === 'plata' ? 'bg-gray-400' : 
                          'bg-yellow-500'
                        } text-white shadow-md`}>
                          <CheckIcon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] mt-1 capitalize">{badge}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos adicionales */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
} 