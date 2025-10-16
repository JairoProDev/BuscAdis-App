'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicationsService, CreatePublicationData } from '@/services/publications.service';
import { type CategoryKey } from '@/data/attributesConfig'
import CategorySelector from '@/components/publish/CategorySelector';
import LocationSelector, { type LocationInputData } from '@/components/publish/LocationSelector';
import PriceInput from '@/components/publish/PriceInput';
import ContactForm from '@/components/publish/ContactForm';
import MediaStep from '@/components/publish/MediaStep';
import AdPreview from '@/components/publish/AdPreview';
import ProgressAchievements from '@/components/publish/ProgressAchievements';
import PublicationProgress from '@/components/publish/PublicationProgress';
import StepNavigation from '@/components/publish/StepNavigation';
import SuccessMessage from '@/components/publish/SuccessMessage';
import { PublicationFormData, PublicationContact } from '@/types/publication';
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
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Para mostrar estados de carga
function LoadingDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-4 border-t-primary-600 border-primary-200 dark:border-primary-400 animate-spin mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
}

export default function PublicarPage() {
  const [step, setStep] = useState<StepValue>(STEPS.CATEGORY);
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, unknown>>({})
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

  // Función para asegurar la estructura correcta del objeto ad
  const ensureAdStructure = (adData: Partial<PublicationFormData>): PublicationFormData => {
    return {
      title: adData.title || '',
      description: adData.description || '',
      categorySlug: adData.categorySlug || '',
      subcategorySlug: adData.subcategorySlug || '',
      subSubcategorySlug: adData.subSubcategorySlug || undefined,
      transactionType: adData.transactionType || 'venta',
      amount: adData.amount || null,
      currency: adData.currency || 'PEN',
      negotiable: adData.negotiable || false,
      location: {
        province: adData.location?.province || '',
        district: adData.location?.district || '',
        address: adData.location?.address || '',
        referencePoint: adData.location?.referencePoint || '',
        coordinates: adData.location?.coordinates || undefined
      },
      contact: {
        phones: Array.isArray(adData.contact?.phones) ? adData.contact.phones : [''],
        email: adData.contact?.email || '',
        name: adData.contact?.name || '',
        website: adData.contact?.website || ''
      },
      images: Array.isArray(adData.images) ? adData.images : [],
      attributes: adData.attributes || {},
      premium: adData.premium || false,
      status: 'active'
    };
  };

  // Estado principal del adiso con estructura garantizada
  const [ad, setAd] = useState<PublicationFormData>(() => ensureAdStructure({}));

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

  // Calidad del adiso
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

  // Calcula los campos completados para el progreso visual
  const completedFields = useMemo(() => {
    const category = !!ad.categorySlug && !!ad.subcategorySlug;
    const details = !!ad.title && ad.title.length >= 10 && !!ad.description && ad.description.length >= 30;
    const images = Array.isArray(ad.images) && ad.images.length >= 2;
    const contact = !!ad.contact?.phones?.[0];
    const publish = category && details && images && contact;
    return { category, details, images, contact, publish };
  }, [ad]);

  // Definir tipos para los datos que pasan a los componentes
  type ClassificationData = {
    categorySlug: string;
    subcategorySlug: string;
    subSubcategorySlug?: string | null;
  };

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

  // Actualizar adiso y logros
  const updateAd = useCallback((newAdData: Partial<PublicationFormData> | ((prev: PublicationFormData) => PublicationFormData)) => {
    setAd(prevAd => {
      const updatedAd = typeof newAdData === 'function' ? newAdData(prevAd) : { ...prevAd, ...newAdData };
      updateAchievements(updatedAd);
      return updatedAd;
    });
  }, [updateAchievements]);

  // Handlers de cambios
  const handleSimpleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAd((prev: PublicationFormData) => ({ ...prev, [name]: value }));
  }, [updateAd]);

  const handleClassificationChange = useCallback((slugs: ClassificationData) => {
    updateAd((prev: PublicationFormData) => ({
      ...prev,
      categorySlug: slugs.categorySlug,
      subcategorySlug: slugs.subcategorySlug,
      subSubcategorySlug: slugs.subSubcategorySlug || '',
    }));
    
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
  }, [updateAd, validateStep, setStep, step]);

  interface PriceData {
    amount?: number | null;
    currency?: 'PEN' | 'USD' | null;
    negotiable?: boolean | null;
  }


  interface ContactData {
    phones?: string[];
    email?: string;
    name?: string;
    website?: string;
  }

  const handlePriceChange = useCallback((priceData: PriceData) => {
    updateAd((prev: PublicationFormData) => ({
      ...prev,
      amount: priceData.amount ?? null,
      currency: priceData.currency ?? 'PEN',
      negotiable: priceData.negotiable ?? false,
    }));
  }, [updateAd]);

  const handleLocationChange = useCallback((locationData: LocationInputData) => {
    updateAd((prev: PublicationFormData) => ({
      ...prev,
      location: {
        countryCode: locationData.countryCode || 'PE',
        // department: locationData.department || prev.location?.department || 'Cusco',
        province: locationData.province || 'Cusco',
        district: locationData.district || '',
        address: locationData.address || '',
        referencePoint: locationData.reference || '',
        coordinates: locationData.coordinates ? {
          lat: locationData.coordinates.lat,
          lng: locationData.coordinates.lng
        } : undefined,
      }
    }));
  }, [updateAd]);

  const handleContactChange = useCallback((contactData: ContactData) => {
    updateAd((prev: PublicationFormData) => ({
      ...prev,
      contact: {
        phones: contactData.phones || [],
        email: contactData.email || '',
        name: contactData.name || '',
        website: contactData.website || '',
      }
    }));
  }, [updateAd]);

  // Dynamic attributes from central config
  const selectedCategoryKey = (ad.categorySlug || 'productos') as CategoryKey
  // const attributeFields: AttributeField[] = [...(ATTRIBUTES_CONFIG[selectedCategoryKey] || [])]
  // const handleDynamicFieldChange = (key: string, value: unknown) => {
  //   setDynamicAttributes(prev => ({ ...prev, [key]: value }))
  // }

  // Submit final
  const handleSubmit = useCallback(async () => {
    if (!validateStep(STEPS.PREVIEW)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Debug: Ver qué datos se están enviando
      console.log('🚀 Datos del adiso a enviar:', ad);
      
      // Preparar datos finales para CreatePublicationData
      const finalAdData: CreatePublicationData = {
        title: ad.title || '',
        description: ad.description || '',
        category: ad.categorySlug || '',
        subcategory: ad.subcategorySlug || undefined,
        subsubcategory: ad.subSubcategorySlug || undefined,
        pricing: {
          amount: ad.amount ?? undefined,
          currency: ad.currency || 'PEN',
          type: 'fixed'
        },
        location: {
          country: 'PE',
          region: ad.location?.province || undefined,
          province: ad.location?.province || undefined,
          city: ad.location?.province || undefined,
          district: ad.location?.district || undefined,
          address: ad.location?.address,
          coordinates: ad.location?.coordinates ? {
            lat: ad.location.coordinates.lat,
            lng: ad.location.coordinates.lng
          } : undefined
        },
        contact: {
          phones: ad.contact?.phones || [],
          email: ad.contact?.email,
          name: ad.contact?.name,
          visible: true
        },
        images: ad.images || [],
        attributes: { ...(ad.attributes || {}), ...dynamicAttributes },
        status: 'active',
        premium: ad.premium || false
      };

      console.log('🚀 Datos finales procesados:', finalAdData);

      // Enviar al servicio
      const response = await PublicationsService.createPublication(finalAdData);
      console.log('✅ Respuesta completa del API:', response);
      
      // El API devuelve: { success: true, publication: {...}, message: '...' }
      // Necesitamos extraer el ID de la publicación creada
      const publicationId = response.publication?._id || response.publication?.id || response.id;
      const sequentialId = response.publication?.sequentialId;
      const slug = (response.publication?.slug || ad.title || '').toLowerCase().trim().replace(/\s+/g,'-').replace(/[^\w\-]+/g,'').replace(/\-\-+/g,'-');
      
      if (!publicationId) {
        throw new Error('No se pudo obtener el ID de la publicación creada');
      }
      
      console.log('🎉 Publicación creada con ID:', publicationId);
      
      setPublishedId(publicationId);
      setSuccess(true);
      Logger.info('Publicación creada exitosamente', { id: publicationId });
      // Redirect directly to the new adiso dedicated page after a short delay
      setTimeout(() => {
        // Use the correct dedicated page URL format: /adiso/{id}
        const dedicatedUrl = `/adiso/${publicationId}`;
        window.location.href = dedicatedUrl;
      }, 600);
    } catch (error) {
      console.error('❌ Error al publicar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Hubo un error al publicar tu adiso';
      setError(errorMessage);
      Logger.error('Error al crear publicación', { error });
    } finally {
      setLoading(false);
    }
  }, [ad, validateStep, dynamicAttributes]);

  // Renderiza tip de optimización según el paso actual
  const renderOptimizationTip = useCallback(() => {
    switch (step) {
      case STEPS.CATEGORY:
        return "Selecciona la categoría más específica para que tu adiso llegue a los compradores correctos";
      case STEPS.DETAILS:
        return "Un título descriptivo y una descripción detallada aumentan las posibilidades de venta";
      case STEPS.MEDIA:
        return "Las publicaciones con 3+ imágenes de buena calidad reciben 70% más de contactos";
      case STEPS.CONTACT:
        return "Si proporcionas más de una forma de contacto, aumentas las chances de ser contactado";
      case STEPS.PREVIEW:
        return adQuality >= 80 
          ? "¡Excelente publicación! Tiene todo lo que necesita para destacar" 
          : "Puedes volver a los pasos anteriores para mejorar la calidad de tu adiso";
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
            {/* Layout optimizado para desktop: título/descripción/precio a la izquierda, ubicación a la derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna izquierda: Título, Descripción y Precio */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={ad.title || ''}
                    onChange={handleSimpleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Escribe un título descriptivo"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={ad.description || ''}
                    onChange={handleSimpleInputChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Describe tu publicación en detalle"
                  />
                </div>

                <PriceInput
                  initialValue={{
                    amount: ad.amount || null,
                    currency: ad.currency as 'PEN' | 'USD' || 'PEN',
                    negotiable: ad.negotiable || false
                  }}
                  onChange={handlePriceChange}
                />
              </div>

              {/* Columna derecha: Solo Ubicación */}
              <div>
                <LocationSelector
                  initialValue={{
                    countryCode: 'PE',
                    department: 'Cusco',
                    province: ad.location?.province || 'Cusco',
                    district: ad.location?.district || '',
                    address: ad.location?.address || '',
                    reference: ad.location?.referencePoint || '',
                    coordinates: ad.location?.coordinates ? {
                      lat: ad.location.coordinates.lat,
                      lng: ad.location.coordinates.lng
                    } : undefined
                  }}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
          </div>
        );
      case STEPS.MEDIA:
        return (
          <MediaStep
            formData={ad}
            updateFormData={updateAd}
            onNext={handleNext}
            onBack={handlePrevious}
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
        console.log('🔍 Rendering PREVIEW step with adQuality:', adQuality);
        return (
          <div className="space-y-6">
            <AdPreview formData={ad} />
            <ProgressAchievements formData={ad} quality={adQuality} />
          </div>
        );
      default:
        return null;
    }
  };

  // Mostrar mensaje de éxito si se completó la publicación
  if (success && publishedId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <SuccessMessage 
            title="¡Publicación Exitosa!"
            message="Tu adiso ha sido publicado correctamente y ya está visible para miles de usuarios."
            publishedId={publishedId}
          />
          
          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <ProgressAchievements formData={ad} quality={adQuality} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <PublicationProgress 
            progress={progress} 
            stepNames={STEP_NAMES}
            currentStep={step}
            totalSteps={Object.keys(STEPS).length}
            onStepClick={(targetStep) => setStep(targetStep as StepValue)}
            completedFields={completedFields}
          />
          {/* Eliminada la barra duplicada para evitar dos progresos */}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Columna principal */}
          <div className="lg:w-7/12">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
              {/* Tip de optimización */}
              <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 text-blue-600 dark:text-blue-400">🔥</div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">{renderOptimizationTip()}</p>
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
                  nextText={step === STEPS.PREVIEW ? 'Publicar adiso' : 'Siguiente'}
                />
              )}
            </div>
            
            {/* Indicador de calidad */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Calidad del adiso</h3>
                <div className="flex items-center">
                  {[1,2,3,4,5].map((star) => (
                    <div 
                      key={star}
                      className={`h-5 w-5 ${star <= Math.ceil(adQuality/20) 
                        ? 'text-yellow-500 dark:text-yellow-400' 
                        : 'text-gray-300 dark:text-gray-600'}`}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-yellow-300 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${adQuality}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Básico</span>
                <span>Promedio</span>
                <span>Excelente</span>
              </div>
            </div>
          </div>
          
          {/* Columna de vista previa */}
          <div className="lg:w-5/12">
            <div className="sticky top-6">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                  <span className="flex items-center">
                    <span className="animate-pulse h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Vista previa en vivo
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Actualización automática</span>
                </h3>
                <AdPreview formData={ad} />
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
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
        
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #374151;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #6B7280;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }
        }
      `}</style>
    </div>
  );
} 