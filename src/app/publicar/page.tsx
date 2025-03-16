'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ClassifiedadsService, QuickClassifiedadData } from '@/services/classifiedads.service'
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
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import LoadingState from '@/components/ui/LoadingState'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { CategoriesService } from '@/services/categories.service'
import { useAuth } from '@/features/auth/hooks/useAuth'
import PublishForm from '@/components/publish/PublishForm'
import AuthPrompt from '@/features/auth/components/AuthPrompt'
import Link from 'next/link'
import { PhoneInput } from 'react-international-phone'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Pasos de publicación
const STEPS = {
  CATEGORY: 1,
  DETAILS: 2,
  MEDIA: 3,
  CONTACT: 4,
  PREVIEW: 5
};

export default function PublishPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [step, setStep] = useState(STEPS.CATEGORY);
  const [progress, setProgress] = useState(20);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [publishData, setPublishData] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [ad, setAd] = useState<QuickClassifiedadData>({
    title: '',
    description: '',
    contact: {
      whatsapp: '',
    },
    media: [],
    location: {
      city: '',
      country: 'Perú'
    },
    price: {
      amount: 0,
      currency: 'PEN',
      type: 'fixed'
    },
    category: null,
    type: '',
  });

  const updateProgress = () => {
    const progressMap = {
      [STEPS.CATEGORY]: 20,
      [STEPS.DETAILS]: 40,
      [STEPS.MEDIA]: 60,
      [STEPS.CONTACT]: 80,
      [STEPS.PREVIEW]: 100
    };
    setProgress(progressMap[step] || 0);
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    
    switch(step) {
      case STEPS.CATEGORY:
        if (!ad.category) {
          errors.push('Selecciona una categoría');
        }
        break;
      case STEPS.DETAILS:
        if (!ad.title.trim()) {
          errors.push('El título es obligatorio');
        }
        if (!ad.description.trim()) {
          errors.push('La descripción es obligatoria');
        }
        if (!ad.price || !ad.price.amount) {
          errors.push('El precio es obligatorio');
        }
        break;
      case STEPS.CONTACT:
        if (!ad.contact.whatsapp.trim()) {
          errors.push('El número de WhatsApp es obligatorio');
        } else if (!/^\d{9,}$/.test(ad.contact.whatsapp)) {
          errors.push('Ingresa un número de WhatsApp válido');
        }
        break;
      case STEPS.LOCATION:
        if (!ad.location.city.trim()) {
          errors.push('La ubicación es obligatoria');
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

  const handlePublish = async (data) => {
    if (!user) {
      setPublishData(data);
      setShowAuthPrompt(true);
      return;
    }
    
    // Proceder con la publicación
    await handlePublishWithAuth(data);
  };

  const handlePublishWithAuth = async (data) => {
    try {
      // Lógica de publicación
      const result = await ClassifiedadsService.createClassifiedad({
        ...data,
        userId: user.id
      });
      
      router.push(`/anuncios/${result.id}`);
    } catch (error) {
      console.error('Error publishing:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAd((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!ad.title || !ad.description)) {
      setError('El título y la descripción son obligatorios');
      return;
    }
    
    if (step === 2 && !ad.category) {
      setError('Debes seleccionar una categoría');
      return;
    }
    
    if (step === 3 && !ad.location.city) {
      setError('La ciudad es obligatoria');
      return;
    }

    setError('');
    setStep(prevStep => Math.min(prevStep + 1, 5));
  };

  const handlePrevious = () => {
    setStep(prevStep => Math.max(prevStep - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await ClassifiedadsService.createClassifiedad(ad);
      
      setSuccess(true);
      
      // Redirigir al detalle del anuncio después de 2 segundos
      setTimeout(() => {
        router.push(`/anuncios/${response.id}`);
      }, 2000);
    } catch (err) {
      console.error('Error publicando anuncio:', err);
      setError('Ha ocurrido un error al publicar tu anuncio. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    setUploadProgress(0);
    
    try {
      const totalFiles = files.length;
      let completedFiles = 0;
      const uploadedUrls = [];
      
      for (const file of files) {
        // Validar tamaño y tipo
        if (file.size > 5 * 1024 * 1024) { // 5MB max
          setError(`La imagen ${file.name} es demasiado grande. El tamaño máximo es 5MB.`);
          continue;
        }
        
        if (!file.type.startsWith('image/')) {
          setError(`El archivo ${file.name} no es una imagen válida.`);
          continue;
        }
        
        const { imageUrl } = await ImageService.uploadImage(file);
        uploadedUrls.push(imageUrl);
        
        completedFiles++;
        setUploadProgress(Math.round((completedFiles / totalFiles) * 100));
      }
      
      setAd(prev => ({
        ...prev,
        media: [...prev.media, ...uploadedUrls]
      }));
      
      setError('');
    } catch (err) {
      console.error('Error subiendo imágenes:', err);
      setError('Ha ocurrido un error al subir las imágenes. Por favor, inténtalo de nuevo.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setAd(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  // Renderizar componentes basados en el paso actual
  const renderStepContent = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return (
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
              setTimeout(() => handleStepComplete(STEPS.DETAILS), 500);
            }}
          />
        );
      case STEPS.DETAILS:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-primary-700 mb-2">
                Título del anuncio *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={ad.title}
                onChange={handleInputChange}
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
                name="description"
                value={ad.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                placeholder="Describe tu producto o servicio"
                required
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(STEPS.CATEGORY)}
                className="px-6 py-3 flex items-center gap-2 text-primary-600 hover:text-primary-800"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Anterior
              </button>
              <button
                onClick={() => handleStepComplete(STEPS.MEDIA)}
                disabled={!ad.title || !ad.description}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Siguiente
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      case STEPS.MEDIA:
        return (
          <MediaUploader
            files={ad.media || []}
            onFilesChange={(files) => setAd({ ...ad, media: files })}
            maxFiles={5}
          />
        );
      case STEPS.CONTACT:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-primary-700 mb-2">
                WhatsApp *
              </label>
              <PhoneInput
                defaultCountry="pe"
                value={ad.contact.whatsapp}
                onChange={(phone) => setAd({
                  ...ad,
                  contact: {
                    ...ad.contact,
                    whatsapp: phone
                  }
                })}
                className="w-full"
              />
            </div>

            <LocationSelector
              value={ad.location}
              onChange={(location) => setAd({ ...ad, location })}
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
                onClick={() => setStep(STEPS.DETAILS)}
                className="px-6 py-3 flex items-center gap-2 text-primary-600 hover:text-primary-800"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Anterior
              </button>
              <button
                onClick={() => handleStepComplete(STEPS.PREVIEW)}
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
          </div>
        );
      case STEPS.PREVIEW:
        return (
          <div className="bg-white rounded-2xl shadow-xl p-6">
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
                  {ad.location.city}, {ad.location.country}
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
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingState text="Publicando tu anuncio..." />;
  }

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
          <ErrorMessage 
            message={error}
            onDismiss={() => setError('')}
          />
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
              {step === STEPS.CATEGORY && "¿Qué deseas publicar?"}
              {step === STEPS.DETAILS && "Cuéntanos más"}
              {step === STEPS.CONTACT && "Últimos detalles"}
            </h1>
            <p className="text-xl text-primary-200 mb-12">
              {step === STEPS.CATEGORY && "Selecciona la categoría que mejor describe tu anuncio"}
              {step === STEPS.DETAILS && "Describe tu producto o servicio para que todos lo encuentren"}
              {step === STEPS.CONTACT && "Añade información de contacto y ubicación"}
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
                  <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
                        {error}
                      </div>
                    )}
                    
                    {renderStepContent()}
                    
                    {/* Navegación entre pasos */}
                    {step < 5 && (
                      <div className="flex justify-between mt-8">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className={`px-4 py-2 rounded-lg ${step === 1 ? 'invisible' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                          Anterior
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleNext}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </form>
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
                        {ad.location.city}, {ad.location.country}
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

      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Último paso</h2>
            <p className="text-gray-600 mb-6">
              Para publicar tu anuncio, necesitas una cuenta. Es gratis y solo toma un minuto.
            </p>
            <div className="space-y-4">
              <Link
                href={`/register?redirect=${encodeURIComponent('/publicar')}&data=${encodeURIComponent(JSON.stringify(publishData))}`}
                className="w-full block text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Crear cuenta
              </Link>
              <Link
                href={`/login?redirect=${encodeURIComponent('/publicar')}&data=${encodeURIComponent(JSON.stringify(publishData))}`}
                className="w-full block text-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 