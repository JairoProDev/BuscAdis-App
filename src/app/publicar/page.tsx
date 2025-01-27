'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ListingsService, QuickListingData } from '@/services/listings.service'
import CategorySelector from '@/components/publish/CategorySelector'
import MediaUploader from '@/components/publish/MediaUploader'
import LocationSelector from '@/components/publish/LocationSelector'
import PriceSelector from '@/components/publish/PriceSelector'
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhotoIcon,
  TagIcon,
  UserCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function PublishPage() {
  const router = useRouter()
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [ad, setAd] = useState<QuickListingData>({
    title: '',
    description: '',
    contact: {
      whatsapp: '',
    },
    media: [],
    location: undefined,
    price: undefined,
    category: undefined,
    type: undefined,
  });

  const updateProgress = () => {
    let points = 0;
    if (ad.category) points += 30;
    if (ad.title) points += 20;
    if (ad.description) points += 20;
    if (ad.contact.whatsapp) points += 10;
    if (ad.location) points += 10;
    if (ad.media && ad.media.length > 0) points += 10;
    setProgress(points);
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    
    switch(step) {
      case 1:
        if (!ad.category) {
          errors.push('Selecciona una categoría y subcategoría');
        }
        break;
      case 2:
        if (!ad.title) {
          errors.push('Ingresa un título para tu anuncio');
        } else if (ad.title.length < 5) {
          errors.push('El título debe tener al menos 5 caracteres');
        }
        if (!ad.description) {
          errors.push('Ingresa una descripción para tu anuncio');
        } else if (ad.description.length < 20) {
          errors.push('La descripción debe tener al menos 20 caracteres');
        }
        break;
      case 3:
        if (!ad.contact.whatsapp) {
          errors.push('Ingresa tu número de WhatsApp');
        } else if (!/^\d{9,}$/.test(ad.contact.whatsapp)) {
          errors.push('Ingresa un número de WhatsApp válido (9 dígitos)');
        }
        if (!ad.location) {
          errors.push('Selecciona la ubicación de tu anuncio');
        }
        break;
      case 4:
        if (!ad.media || ad.media.length === 0) {
          errors.push('Sube al menos una imagen');
        }
        break;
      default:
        return true;
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return false;
    }
    return true;
  };

  const handleStepComplete = (nextStep: number) => {
    if (!validateStep(step)) {
      return;
    }
    setError('');
    updateProgress();
    setStep(nextStep);
  };

  const handlePublish = async () => {
    if (!validateStep(step)) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      const response = await ListingsService.createQuick(ad);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/anuncios/${response.id}`);
      }, 1500);
    } catch (err) {
      setError('Error al publicar el anuncio. Por favor intenta de nuevo.');
      console.error('Error publishing:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-primary-200 z-50">
        <motion.div 
          className="h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 left-4 md:left-auto bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md"
          >
            {error.split('\n').map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-red-200">•</span>
                <span>{line}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white rounded-xl p-8 flex flex-col items-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">¡Publicación exitosa!</h3>
              <p className="text-gray-600">Redirigiendo a tu anuncio...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {step === 1 && "¿Qué deseas publicar?"}
              {step === 2 && "Cuéntanos más"}
              {step === 3 && "Últimos detalles"}
            </h1>
            <p className="text-xl text-primary-200 mb-12">
              {step === 1 && "Selecciona la categoría que mejor describe tu anuncio"}
              {step === 2 && "Describe tu producto o servicio para que todos lo encuentren"}
              {step === 3 && "Añade información de contacto y ubicación"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Form Section */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <CategorySelector
                        selectedCategory={ad.category}
                        onSelect={(category) => {
                          const selectedSubcategory = category.subcategories?.find(sub => sub.selected);
                          setAd({
                            ...ad,
                            category: {
                              ...category,
                              subcategories: category.subcategories
                            },
                            type: selectedSubcategory ? 
                              `${category.id}/${selectedSubcategory.id}` : 
                              `${category.id}`
                          });
                          setTimeout(() => handleStepComplete(2), 500);
                        }}
                      />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-primary-700 mb-2">
                          Título del anuncio *
                          </label>
                          <input
                            id="title"
                            type="text"
                          value={ad.title}
                            onChange={(e) => setAd({ ...ad, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                          placeholder="Ej: Vendo iPhone 12 Pro Max"
                          required
                          />
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
                          Descripción *
                          </label>
                          <textarea
                            id="description"
                          value={ad.description}
                            onChange={(e) => setAd({ ...ad, description: e.target.value })}
                          rows={4}
                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                          placeholder="Describe tu producto o servicio"
                          required
                          />
                        </div>

                      <div className="flex justify-between pt-4">
                        <button
                          onClick={() => setStep(1)}
                          className="px-6 py-3 flex items-center gap-2 text-primary-600 hover:text-primary-800"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                          Anterior
                        </button>
                        <button
                          onClick={() => handleStepComplete(3)}
                          disabled={!ad.title || !ad.description}
                          className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          Siguiente
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label htmlFor="whatsapp" className="block text-sm font-medium text-primary-700 mb-2">
                          WhatsApp *
                            </label>
                              <input
                          id="whatsapp"
                          type="tel"
                          value={ad.contact.whatsapp}
                                onChange={(e) => setAd({
                                  ...ad,
                            contact: { ...ad.contact, whatsapp: e.target.value }
                                })}
                                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                          placeholder="Ej: +51 987 654 321"
                          required
                              />
                      </div>

                      <LocationSelector
                        value={ad.location}
                        onChange={(location) => setAd({ ...ad, location })}
                      />

                      <MediaUploader
                        files={ad.media || []}
                        onFilesChange={(files) => setAd({ ...ad, media: files })}
                        maxFiles={5}
                      />

                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full px-4 py-2 text-sm text-primary-600 hover:text-primary-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <SparklesIcon className="w-5 h-5" />
                        {showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
                      </button>

                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 pt-4"
                        >
                          <PriceSelector
                            value={ad.price}
                            onChange={(price) => setAd({ ...ad, price })}
                          />
                        </motion.div>
                      )}

                      <div className="flex justify-between pt-4">
                        <button
                          onClick={() => setStep(2)}
                          className="px-6 py-3 flex items-center gap-2 text-primary-600 hover:text-primary-800"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                          Anterior
                        </button>
                        <button
                          onClick={handlePublish}
                          disabled={saving || !ad.title || !ad.description || !ad.contact.whatsapp}
                          className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                              Publicando...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-5 h-5" />
                              Publicar anuncio
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="w-full lg:w-96 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Vista previa</h3>
                  
                  <div className="aspect-w-4 aspect-h-3 bg-primary-50 rounded-xl mb-4 overflow-hidden">
                    {ad.media && ad.media.length > 0 ? (
                      <Image
                        src={URL.createObjectURL(ad.media[0])}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-primary-300" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {ad.category && (
                      <div className="flex items-center gap-2 text-sm text-primary-600">
                        <TagIcon className="w-4 h-4" />
                        {ad.category.name}
                        {ad.category.subcategories?.find(sub => sub.selected)?.name && 
                          ` - ${ad.category.subcategories.find(sub => sub.selected)?.name}`}
                      </div>
                    )}

                    <h4 className="text-xl font-semibold text-primary-900">
                      {ad.title || 'Título del anuncio'}
                    </h4>

                    <p className="text-sm text-primary-600 line-clamp-3">
                      {ad.description || 'Descripción del anuncio'}
                    </p>

                    {ad.location && (
                      <div className="flex items-center gap-2 text-sm text-primary-600">
                        <MapPinIcon className="w-4 h-4" />
                        {ad.location.city}, {ad.location.state}
                      </div>
                    )}

                    {ad.price && (
                      <div className="flex items-center gap-2 text-lg font-semibold text-primary-900">
                        <CurrencyDollarIcon className="w-5 h-5" />
                        {ad.price.amount} {ad.price.currency}
                      </div>
                    )}

                    {ad.contact.whatsapp && (
                      <div className="flex items-center gap-2 text-sm text-primary-600">
                        <UserCircleIcon className="w-4 h-4" />
                        {ad.contact.whatsapp}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-primary-100">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-primary-900 mb-1">
                          Progreso
                        </div>
                        <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
            </div>
                      <div className="text-2xl font-bold text-primary-900">
                        {progress}%
            </div>
          </div>
        </div>
              </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 