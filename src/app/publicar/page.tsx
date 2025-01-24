'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Advertisement, PublishProgress, CategoryConfig } from '@/types/publish'
import { 
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhotoIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'
import CategorySelector from '@/components/publish/CategorySelector'
const MediaUploader = dynamic(() => import('@/components/publish/MediaUploader'), { ssr: false })
const LocationSelector = dynamic(() => import('@/components/publish/LocationSelector'), { ssr: false })
const PriceSelector = dynamic(() => import('@/components/publish/PriceSelector'), { ssr: false })
const ContactInfo = dynamic(() => import('@/components/publish/ContactInfo'), { ssr: false })
const AdPreview = dynamic(() => import('@/components/publish/AdPreview'), { ssr: false })

export default function PublishPage() {
  const [progress, setProgress] = useState<PublishProgress>({
    currentStep: 1,
    steps: [
      {
        id: 'category',
        title: 'Categoría',
        description: 'Selecciona la categoría que mejor describe tu anuncio',
        isCompleted: false,
        isOptional: false,
        validationErrors: []
      },
      {
        id: 'details',
        title: 'Detalles',
        description: 'Información básica sobre tu anuncio',
        isCompleted: false,
        isOptional: false,
        validationErrors: []
      },
      {
        id: 'media',
        title: 'Multimedia',
        description: 'Añade fotos, videos o modelos 3D',
        isCompleted: false,
        isOptional: false,
        validationErrors: []
      },
      {
        id: 'location',
        title: 'Ubicación',
        description: 'Indica dónde se encuentra',
        isCompleted: false,
        isOptional: false,
        validationErrors: []
      },
      {
        id: 'price',
        title: 'Precio',
        description: 'Establece el precio y opciones de negociación',
        isCompleted: false,
        isOptional: false,
        validationErrors: []
      },
      {
        id: 'contact',
        title: 'Contacto',
        description: 'Información de contacto y disponibilidad',
        isCompleted: false,
        isOptional: false,
        validationErrors: []
      },
      {
        id: 'preview',
        title: 'Vista Previa',
        description: 'Revisa tu anuncio antes de publicar',
        isCompleted: false,
        isOptional: false,
        validationErrors: []
      }
    ],
    completedSteps: 0,
    totalSteps: 7,
    lastSaved: new Date().toISOString(),
    canPublish: false
  })

  const [ad, setAd] = useState<Partial<Advertisement>>({
    status: 'draft',
    plan: 'free',
    features: {},
    media: [],
    settings: {
      visibility: 'public',
      commentingEnabled: true,
      sharingEnabled: true,
      autoRenew: false,
      notifyOnInquiries: true,
      hideFromSearch: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    statistics: {
      views: 0,
      favorites: 0,
      shares: 0,
      inquiries: 0,
      lastViewed: new Date().toISOString(),
      averageViewDuration: 0,
      clickThroughRate: 0
    }
  })

  const [isDragging, setIsDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig | null>(null)

  // Simular autoguardado
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (Object.keys(ad).length > 0) {
        handleSave()
      }
    }, 3000)

    return () => clearTimeout(saveTimeout)
  }, [ad])

  const handleSave = async () => {
    setSaving(true)
    // Aquí implementaremos el guardado real
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setProgress(prev => ({
      ...prev,
      lastSaved: new Date().toISOString()
    }))
  }

  const handleNext = () => {
    if (progress.currentStep < progress.totalSteps) {
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        steps: prev.steps.map((step, index) => 
          index === prev.currentStep - 1 
            ? { ...step, isCompleted: true }
            : step
        ),
        completedSteps: prev.completedSteps + 1
      }))
    }
  }

  const handleBack = () => {
    if (progress.currentStep > 1) {
      setProgress(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }))
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    // Aquí implementaremos la publicación real
    await new Promise(resolve => setTimeout(resolve, 2000))
    setAd(prev => ({
      ...prev,
      status: 'published',
      publishedAt: new Date().toISOString()
    }))
    setSaving(false)
    // Redirigir al anuncio publicado
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Publica tu Anuncio
            </h1>
            <p className="text-xl text-primary-200 mb-12">
              Llega a millones de personas y vende más rápido con nuestra plataforma premium de anuncios clasificados.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-primary-200">
                    Paso {progress.currentStep} de {progress.totalSteps}
                  </span>
                  {saving ? (
                    <span className="flex items-center text-primary-300 text-sm">
                      <ArrowPathIcon className="w-4 h-4 animate-spin mr-1" />
                      Guardando...
                    </span>
                  ) : (
                    <span className="flex items-center text-primary-300 text-sm">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Guardado
                    </span>
                  )}
                </div>
                <div className="text-primary-200">
                  {Math.round((progress.completedSteps / progress.totalSteps) * 100)}% completado
                </div>
              </div>
              <div className="h-2 bg-primary-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(progress.completedSteps / progress.totalSteps) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Steps Navigation */}
            <div className="grid grid-cols-7 gap-4 mb-12">
              {progress.steps.map((step, index) => (
                <motion.button
                  key={step.id}
                  onClick={() => setProgress(prev => ({ ...prev, currentStep: index + 1 }))}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                    progress.currentStep === index + 1
                      ? 'bg-white shadow-xl scale-105'
                      : step.isCompleted
                      ? 'bg-primary-800/50 text-primary-200'
                      : 'bg-primary-800/30 text-primary-300'
                  }`}
                  whileHover={{ scale: progress.currentStep !== index + 1 ? 1.02 : 1.05 }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    progress.currentStep === index + 1
                      ? 'bg-primary-500 text-white'
                      : step.isCompleted
                      ? 'bg-primary-700 text-primary-200'
                      : 'bg-primary-800 text-primary-300'
                  }`}>
                    {step.isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    progress.currentStep === index + 1
                      ? 'text-primary-900'
                      : 'text-inherit'
                  }`}>
                    {step.title}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={progress.currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="min-h-[400px]">
                    <h2 className="text-2xl font-bold text-primary-900 mb-4">
                      {progress.steps[progress.currentStep - 1].title}
                    </h2>
                    <p className="text-primary-600 mb-8">
                      {progress.steps[progress.currentStep - 1].description}
                    </p>

                    {/* Step-specific content */}
                    {progress.currentStep === 1 && (
                      <CategorySelector
                        selectedCategory={categoryConfig}
                        onSelect={(category) => {
                          setCategoryConfig(category)
                          handleNext()
                        }}
                      />
                    )}

                    {progress.currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-primary-700 mb-2">
                            Título del anuncio
                          </label>
                          <input
                            id="title"
                            type="text"
                            value={ad.title || ''}
                            onChange={(e) => setAd({ ...ad, title: e.target.value })}
                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="Escribe un título descriptivo"
                          />
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
                            Descripción
                          </label>
                          <textarea
                            id="description"
                            value={ad.description || ''}
                            onChange={(e) => setAd({ ...ad, description: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            placeholder="Describe tu anuncio con detalle"
                          />
                        </div>

                        {categoryConfig?.features.map((feature) => (
                          <div key={feature.id}>
                            <label htmlFor={feature.id} className="block text-sm font-medium text-primary-700 mb-2">
                              {feature.name}
                            </label>
                            {feature.type === 'select' ? (
                              <select
                                id={feature.id}
                                value={ad.features[feature.id] || ''}
                                onChange={(e) => setAd({
                                  ...ad,
                                  features: {
                                    ...ad.features,
                                    [feature.id]: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                              >
                                <option value="">Selecciona una opción</option>
                                {feature.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : feature.type === 'number' ? (
                              <input
                                id={feature.id}
                                type="number"
                                value={ad.features[feature.id] || ''}
                                onChange={(e) => setAd({
                                  ...ad,
                                  features: {
                                    ...ad.features,
                                    [feature.id]: e.target.value
                                  }
                                })}
                                min={feature.validation?.min}
                                max={feature.validation?.max}
                                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                              />
                            ) : (
                              <input
                                id={feature.id}
                                type="text"
                                value={ad.features[feature.id] || ''}
                                onChange={(e) => setAd({
                                  ...ad,
                                  features: {
                                    ...ad.features,
                                    [feature.id]: e.target.value
                                  }
                                })}
                                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {progress.currentStep === 3 && categoryConfig && (
                      <MediaUploader
                        files={ad.media}
                        onFilesChange={(files) => setAd({ ...ad, media: files })}
                        categoryConfig={categoryConfig}
                      />
                    )}

                    {progress.currentStep === 4 && (
                      <LocationSelector
                        value={ad.location || {
                          address: '',
                          city: '',
                          state: '',
                          country: '',
                          postalCode: '',
                          coordinates: {
                            latitude: 0,
                            longitude: 0
                          }
                        }}
                        onChange={(location) => setAd({ ...ad, location })}
                      />
                    )}

                    {progress.currentStep === 5 && categoryConfig && (
                      <PriceSelector
                        value={ad.price || {
                          amount: 0,
                          currency: 'COP',
                          negotiable: false,
                          type: 'fixed'
                        }}
                        onChange={(price) => setAd({ ...ad, price })}
                        categoryConfig={categoryConfig}
                      />
                    )}

                    {progress.currentStep === 6 && (
                      <ContactInfo
                        value={ad.contact || {
                          name: '',
                          email: '',
                          showEmail: true,
                          showPhone: true,
                          showWhatsapp: true,
                          preferredContact: 'email'
                        }}
                        onChange={(contact) => setAd({ ...ad, contact })}
                      />
                    )}

                    {progress.currentStep === 7 && (
                      <AdPreview ad={ad as Advertisement} />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={progress.currentStep === 1}
                className="px-6 py-3 rounded-xl bg-primary-800 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {progress.currentStep === progress.totalSteps ? (
                <button
                  onClick={handlePublish}
                  disabled={saving || !progress.canPublish}
                  className="px-6 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Publicando...' : 'Publicar anuncio'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={progress.currentStep === progress.totalSteps}
                  className="px-6 py-3 rounded-xl bg-primary-500 text-white hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-primary-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Características Premium
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
              >
                <PhotoIcon className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Multimedia Avanzada
                </h3>
                <p className="text-primary-300">
                  Sube hasta 50 fotos en alta resolución, videos y modelos 3D.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
              >
                <TagIcon className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Posicionamiento SEO
                </h3>
                <p className="text-primary-300">
                  Optimización automática para mejor visibilidad en buscadores.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
              >
                <ChevronRightIcon className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Publicación Instantánea
                </h3>
                <p className="text-primary-300">
                  Tu anuncio estará visible inmediatamente después de publicar.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6"
              >
                <CurrencyDollarIcon className="w-12 h-12 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Planes Flexibles
                </h3>
                <p className="text-primary-300">
                  Elige entre planes gratuitos y premium según tus necesidades.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 