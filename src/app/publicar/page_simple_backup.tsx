'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicationsService } from '@/services/publications.service';
import PublicationProgress from '@/components/publish/PublicationProgress';
import StepNavigation from '@/components/publish/StepNavigation';
import SuccessMessage from '@/components/publish/SuccessMessage';
import PublishAchievements from '@/components/publish/PublishAchievements';
import AdPreview from '@/components/publish/AdPreview';
import LivePreview from '@/components/publish/LivePreview';
import { StarIcon, FireIcon, CheckIcon } from '@heroicons/react/24/solid';
import { PublicationFormData } from '@/types/publication';
import { Logger } from '@/services/logging.service';

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

export default function PublicarPage() {
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

  // Calidad del anuncio
  const adQuality = useMemo(() => {
    let quality = 0;
    
    // Título detallado
    if (ad.title && ad.title.length > 15) quality += 15;
    
    // Descripción detallada
    if (ad.description && ad.description.length > 50) quality += 20;
    if (ad.description && ad.description.length > 100) quality += 10;
    
    // Categoría
    if (ad.categorySlug) quality += 10;
    
    // Precio
    if (ad.amount !== null && ad.amount !== undefined && ad.amount > 0) quality += 15;
    
    // Ubicación detallada
    if (ad.location?.district) quality += 10;
    if (ad.location?.address) quality += 5;
    
    // Información de contacto
    if (ad.contact?.phones?.[0]) quality += 10;
    if (ad.contact?.email) quality += 5;
    
    return Math.min(100, quality);
  }, [ad]);

  // Progreso basado en paso y calidad
  const progress = useMemo(() => {
    const baseProgress = (step / Object.keys(STEPS).length) * 70;
    const qualityBonus = (adQuality / 100) * 30;
    return Math.min(100, baseProgress + qualityBonus);
  }, [step, adQuality]);

  // Navegación entre pasos
  const goToNextStep = useCallback(() => {
    if (step < Object.keys(STEPS).length) {
      setStep((step + 1) as StepValue);
    }
  }, [step]);

  const goToPrevStep = useCallback(() => {
    if (step > 1) {
      setStep((step - 1) as StepValue);
    }
  }, [step]);

  const goToStep = useCallback((targetStep: StepValue) => {
    setStep(targetStep);
  }, []);

  // Validación de paso actual
  const validateCurrentStep = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (step) {
      case STEPS.CATEGORY:
        if (!ad.categorySlug) errors.push('Selecciona una categoría');
        break;

      case STEPS.DETAILS:
        if (!ad.title || ad.title.length < 10) {
          errors.push('El título debe tener al menos 10 caracteres');
        }
        if (!ad.description || ad.description.length < 30) {
          errors.push('La descripción debe tener al menos 30 caracteres');
        }
        break;

      case STEPS.CONTACT:
        if (!ad.contact?.phones?.[0]) {
          errors.push('Proporciona al menos un número de contacto');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [step, ad]);

  // Publicar anuncio
  const handlePublish = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      Logger.info('Iniciando publicación de anuncio', { ad });

      const result = await PublicationsService.createPublication({
        title: ad.title || '',
        description: ad.description || '',
        categorySlug: ad.categorySlug || 'productos',
        transactionType: 'venta',
        value: ad.amount || 0,
        valueType: 'total',
        currency: 'PEN',
        images: ad.images || [],
        location: {
          country: 'PE',
          province: ad.location?.province || 'Cusco',
          city: ad.location?.district || 'Cusco',
          district: ad.location?.district,
          address: ad.location?.address,
          coordinates: ad.location?.coordinates ? {
            lat: ad.location.coordinates.lat,
            lng: ad.location.coordinates.lng
          } : undefined
        },
        contact: {
          name: ad.contact?.name || 'Usuario',
          phones: ad.contact?.phones || [],
          email: ad.contact?.email,
          visible: true
        },
        status: 'active'
      });

      if (result.success) {
        setPublishedId(result.publication?.id || null);
        setSuccess(true);
        
        Logger.info('Anuncio publicado exitosamente', { 
          id: result.publication?.id,
          title: ad.title 
        });

        // Logro final
        const finalAchievements = { ...achievements };
        if (!finalAchievements.completed.includes('published')) {
          finalAchievements.completed.push('published');
          finalAchievements.points += 50;
          finalAchievements.badges.push('publicado');
        }
        setAchievements(finalAchievements);

      } else {
        throw new Error(result.message || 'Error al crear la publicación');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al publicar';
      setError(errorMessage);
      Logger.error('Error al publicar anuncio', { error: errorMessage, ad });
    } finally {
      setLoading(false);
    }
  }, [ad, achievements]);

  // Renderizar contenido del paso actual
  const renderStepContent = () => {
    if (success) {
      return (
        <div className="space-y-6">
          <SuccessMessage
            title="¡Anuncio Publicado Exitosamente!"
            message="Tu anuncio ha sido publicado y ya está disponible para que otros usuarios lo vean."
            publishedId={publishedId}
            onNewPublication={() => {
              // Reiniciar formulario
              setStep(STEPS.CATEGORY);
              setSuccess(false);
              setPublishedId(null);
              setAd({
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
              setAchievements({
                completed: [],
                points: 0,
                badges: []
              });
            }}
          />
          
          <PublishAchievements
            achievements={achievements}
            quality={adQuality}
            onNewPublication={() => {
              setStep(STEPS.CATEGORY);
              setSuccess(false);
              setPublishedId(null);
              setAd({
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
              setAchievements({
                completed: [],
                points: 0,
                badges: []
              });
            }}
          />
        </div>
      );
    }

    switch (step) {
      case STEPS.CATEGORY:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona una categoría</h2>
              <p className="text-gray-600">Elige la categoría que mejor describa tu anuncio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'inmuebles', name: 'Inmuebles', desc: 'Casas, departamentos, terrenos y locales comerciales', emoji: '🏠' },
                { id: 'empleos', name: 'Empleos', desc: 'Ofertas de trabajo en diversos sectores profesionales', emoji: '💼' },
                { id: 'vehiculos', name: 'Vehículos', desc: 'Autos, motos, camiones y maquinaria', emoji: '🚗' },
                { id: 'servicios', name: 'Servicios', desc: 'Profesionales expertos en tu área', emoji: '🔧' },
                { id: 'productos', name: 'Productos', desc: 'Electrónicos, ropa, hogar y más', emoji: '📦' },
                { id: 'eventos', name: 'Eventos', desc: 'Conciertos, deportes, teatro y actividades', emoji: '🎉' },
                { id: 'comunidad', name: 'Comunidad', desc: 'Grupos, organizaciones y actividades sociales', emoji: '👥' },
                { id: 'negocios', name: 'Negocios', desc: 'Oportunidades de inversión y franquicias', emoji: '💰' }
              ].map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const newAd = { ...ad, categorySlug: category.id };
                    setAd(newAd);
                    updateAchievements(newAd);
                    setTimeout(() => goToNextStep(), 300);
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    ad.categorySlug === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{category.emoji}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.desc}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case STEPS.DETAILS:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalles del anuncio</h2>
              <p className="text-gray-600">Proporciona información clara y atractiva</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del anuncio *
              </label>
              <input
                type="text"
                value={ad.title || ''}
                onChange={(e) => {
                  const newAd = { ...ad, title: e.target.value };
                  setAd(newAd);
                  updateAchievements(newAd);
                }}
                placeholder="Ej: Casa colonial en San Blas con vista panorámica"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {(ad.title || '').length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={ad.description || ''}
                onChange={(e) => {
                  const newAd = { ...ad, description: e.target.value };
                  setAd(newAd);
                  updateAchievements(newAd);
                }}
                placeholder="Describe tu anuncio con todos los detalles importantes..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {(ad.description || '').length}/1000 caracteres
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    S/.
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ad.amount || ''}
                    onChange={(e) => {
                      const newAd = { ...ad, amount: parseFloat(e.target.value) || null };
                      setAd(newAd);
                      updateAchievements(newAd);
                    }}
                    placeholder="0.00"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ad.negotiable || false}
                    onChange={(e) => {
                      setAd({ ...ad, negotiable: e.target.checked });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Precio negociable</span>
                </label>
              </div>
            </div>
          </div>
        );

      case STEPS.MEDIA:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Imágenes del anuncio</h2>
              <p className="text-gray-600">Las imágenes ayudan a atraer más compradores</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Agrega imágenes</h3>
              <p className="text-gray-600 mb-4">Sube hasta 10 imágenes de tu anuncio</p>
              <button 
                onClick={() => {
                  const newAd = { ...ad, images: ['placeholder1.jpg', 'placeholder2.jpg'] };
                  setAd(newAd);
                  updateAchievements(newAd);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Subir Imágenes (Demo)
              </button>
              {ad.images && ad.images.length > 0 && (
                <p className="text-green-600 mt-2">✓ {ad.images.length} imagen(es) añadida(s)</p>
              )}
            </div>
          </div>
        );

      case STEPS.CONTACT:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Información de contacto</h2>
              <p className="text-gray-600">Facilita que los interesados se comuniquen contigo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={ad.contact?.name || ''}
                  onChange={(e) => {
                    const newAd = { 
                      ...ad, 
                      contact: { 
                        ...ad.contact, 
                        name: e.target.value,
                        phones: ad.contact?.phones || ['']
                      } 
                    };
                    setAd(newAd);
                    updateAchievements(newAd);
                  }}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={ad.contact?.phones?.[0] || ''}
                  onChange={(e) => {
                    const newAd = { 
                      ...ad, 
                      contact: { ...ad.contact, phones: [e.target.value] } 
                    };
                    setAd(newAd);
                    updateAchievements(newAd);
                  }}
                  placeholder="999 999 999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <input
                type="email"
                value={ad.contact?.email || ''}
                onChange={(e) => {
                  const newAd = { 
                    ...ad, 
                    contact: { 
                      ...ad.contact, 
                      email: e.target.value,
                      phones: ad.contact?.phones || ['']
                    } 
                  };
                  setAd(newAd);
                  updateAchievements(newAd);
                }}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                value={ad.location?.district || ''}
                onChange={(e) => {
                  const newAd = { 
                    ...ad, 
                    location: { 
                      ...ad.location, 
                      district: e.target.value,
                      province: ad.location?.province || ''
                    } 
                  };
                  setAd(newAd);
                  updateAchievements(newAd);
                }}
                placeholder="Ej: San Blas, Cusco"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case STEPS.PREVIEW:
        return (
          <div className="space-y-6">
            <AdPreview ad={ad} quality={adQuality} />
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Listo para publicar
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Revisa tu anuncio y confirma la publicación. Una vez publicado, 
                    aparecerá en los resultados de búsqueda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Paso no encontrado</div>;
    }
  };

  const validation = validateCurrentStep();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Publicando tu anuncio...</h2>
          <p className="text-gray-600">Esto tomará solo unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Publicar Anuncio
                </h1>
                <p className="text-gray-600 mt-1">
                  {!success ? STEP_NAMES[step - 1] : 'Completado'}
                </p>
              </div>
              
              {!success && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Calidad: {adQuality}%
                    </div>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(adQuality / 20)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {achievements.points > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {achievements.points} puntos
                      </div>
                      <div className="flex items-center mt-1">
                        <FireIcon className="h-4 w-4 text-orange-500 mr-1" />
                        <span className="text-xs text-gray-600">
                          {achievements.badges.length} insignias
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {!success && (
              <PublicationProgress
                currentStep={step}
                totalSteps={Object.keys(STEPS).length}
                stepNames={STEP_NAMES}
                progress={progress}
                onStepClick={(step: number) => goToStep(step as StepValue)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {renderStepContent()}
            </motion.div>

            {/* Navigation */}
            {!success && step < Object.keys(STEPS).length && (
              <div className="mt-6">
                <StepNavigation
                  onNext={step === STEPS.PREVIEW ? handlePublish : goToNextStep}
                  onPrevious={goToPrevStep}
                  isFirstStep={step === 1}
                  isLastStep={step === STEPS.PREVIEW}
                  nextText={step === STEPS.PREVIEW ? 'Publicar Anuncio' : 'Siguiente'}
                />
                
                {!validation.isValid && validation.errors.length > 0 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Para continuar, corrige lo siguiente:
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Live Preview */}
              {!success && (
                <LivePreview
                  formData={ad}
                />
              )}

              {/* Tips Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  💡 Consejos para un mejor anuncio
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Usa títulos descriptivos y específicos
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Sube fotos de buena calidad
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Incluye todos los detalles importantes
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Proporciona información de contacto clara
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}