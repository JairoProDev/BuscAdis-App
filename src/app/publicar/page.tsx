// src/app/publicar/page.tsx (o donde esté tu componente principal)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PublicationsService } from '@/services/publications.service'; // Asume que existe
import CategorySelector from '@/components/publish/CategorySelector'; // Ya refactorizado
import LocationSelector from '@/components/publish/LocationSelector'; // Necesita adaptación
import PriceInput from '@/components/publish/PriceInput'; // Necesita adaptación
import ContactForm from '@/components/publish/ContactForm'; // Reemplaza ContactInfo
import { ImageUploader } from '@/components/publish/ImageUploader'; // Asumiendo que existe y funciona
import AdPreview from '@/components/publish/AdPreview'; // Refactorizado
import PublicationProgress from '@/components/publish/PublicationProgress'; // Asumiendo que existe
import {
  CheckCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import LoadingState from '@/components/ui/LoadingState'; // Asumiendo que existe
import ErrorMessage from '@/components/ui/ErrorMessage'; // Asumiendo que existe
import { Publication } from '@/types/publication'; // Importa la interfaz final
// import { usePublication, publicationActions } from '@/contexts/PublicationContext'; // Alternativa con Context

// Definir los pasos
const STEPS = {
  CATEGORY: 1,
  DETAILS: 2,
  MEDIA: 3,
  CONTACT: 4,
  PREVIEW: 5
} as const; // Usar 'as const' para tipos más estrictos

type StepKey = keyof typeof STEPS;
type StepValue = typeof STEPS[StepKey];

export default function PublishPage() {
  const router = useRouter();
  const [step, setStep] = useState<StepValue>(STEPS.CATEGORY);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Estado principal del anuncio, inicializado con la estructura final
  const [ad, setAd] = useState<Partial<Publication>>({ // Usar Partial durante la creación
    title: '',
    description: '',
    categorySlug: null,
    subcategorySlug: null,
    subSubcategorySlug: null,
    transactionType: 'venta', // Valor inicial por defecto, podría venir de la categoría
    amount: null,
    currency: 'PEN',
    negotiable: false,
    location: {
      province: 'Cusco', // Fijo
      district: null,
      address: null,
      referencePoint: null,
      coordinates: null,
    },
    contact: {
      phones: [], // Array vacío inicialmente
      email: null,
      name: null,
      website: null,
    },
    attributes: {}, // Iniciar como objeto vacío o null
    images: [],
    status: 'pending', // Estado inicial podría ser 'pending'
    premium: false,
    sizeEstimation: null, // O un valor por defecto como 1
    // No incluir _id, createdAt, updatedAt, userId (a menos que el usuario esté logueado)
  });

  // Actualiza el progreso basado en el paso actual
  const progress = useMemo(() => {
    const totalSteps = Object.keys(STEPS).length;
    return (step / totalSteps) * 100;
  }, [step]);

  // ---- VALIDACIÓN ----
  const validateStep = useCallback((currentStep: StepValue): boolean => {
    const errors: string[] = [];
    setError(''); // Limpia errores anteriores

    switch (currentStep) {
      case STEPS.CATEGORY:
        if (!ad.categorySlug || !ad.subcategorySlug) { // Requiere hasta subcategoría como mínimo
          errors.push('Debes seleccionar categoría y subcategoría.');
        }
        break;
      case STEPS.DETAILS:
        if (!ad.title || ad.title.trim().length < 5) {
          errors.push('El título es obligatorio y debe tener al menos 5 caracteres.');
        }
        if (!ad.description || ad.description.trim().length < 15) {
           errors.push('La descripción es obligatoria y debe tener al menos 15 caracteres.');
        }
        // Validación de amount/currency es opcional aquí si PriceInput lo maneja
        if (!ad.location?.district) {
            errors.push('Selecciona un distrito.');
        }
        break;
      case STEPS.MEDIA:
        // Las imágenes son opcionales ahora según ImageUploader.tsx, pero podrías añadir validación si cambias de opinión
        break;
      case STEPS.CONTACT:
        if (!ad.contact?.phones || ad.contact.phones.length === 0 || !ad.contact.phones[0]?.trim()) {
          errors.push('Debes ingresar al menos un número de teléfono.');
        } else {
           // Validación simple del primer número (podría ser más robusta)
           const phoneRegex = /^[0-9\s+\-()]*\d[0-9\s+\-()]*$/; // Permite números, espacios, +, -, ()
           if (!phoneRegex.test(ad.contact.phones[0])) {
               errors.push('Ingresa un número de teléfono válido.');
           }
        }
        // Validación opcional de email
        if (ad.contact?.email && !/\S+@\S+\.\S+/.test(ad.contact.email)) {
            errors.push('Ingresa un correo electrónico válido.');
        }
        break;
      case STEPS.PREVIEW:
        // En este paso, se asume que las validaciones anteriores pasaron
        break;
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return false;
    }
    return true;
  }, [ad]); // Depende del estado 'ad'

  // ---- MANEJADORES DE CAMBIOS ----

  // Handler genérico para inputs simples (title, description)
  const handleSimpleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAd(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handler específico para actualizar la clasificación desde CategorySelector
  // Este se llama cuando CategorySelector confirma la selección final
  const handleClassificationChange = useCallback((slugs: { categorySlug: string, subcategorySlug: string, subSubcategorySlug: string | null }) => {
    setAd(prev => ({
      ...prev,
      categorySlug: slugs.categorySlug,
      subcategorySlug: slugs.subcategorySlug,
      subSubcategorySlug: slugs.subSubcategorySlug,
    }));
    // Avanza automáticamente al siguiente paso después de seleccionar la categoría
    // Esto asume que CategorySelector se muestra solo en el paso 1
    // Si CategorySelector no llama a setStep(2) internamente, hazlo aquí:
    // setStep(STEPS.DETAILS);
  }, []);

  // Handler para cambios en PriceInput (adaptado a la nueva estructura)
  const handlePriceChange = useCallback((priceData: { amount: number | null, currency: string | null, negotiable: boolean }) => {
    setAd(prev => ({
      ...prev,
      amount: priceData.amount,
      currency: priceData.currency,
      negotiable: priceData.negotiable,
    }));
  }, []);

  // Handler para cambios en LocationSelector (adaptado)
  const handleLocationChange = useCallback((locationData: { district: string | null, address: string | null, referencePoint: string | null, coordinates: GeoJsonPoint | null }) => {
    setAd(prev => ({
      ...prev,
      location: {
        ...prev.location!, // Aseguramos que location existe
        province: 'Cusco', // Mantenemos la provincia
        district: locationData.district,
        address: locationData.address,
        referencePoint: locationData.referencePoint,
        coordinates: locationData.coordinates,
      }
    }));
  }, []);

  // Handler para cambios en ContactForm (adaptado)
  const handleContactChange = useCallback((contactData: Publication['contact']) => {
     setAd(prev => ({
       ...prev,
       contact: {
         ...prev.contact!, // Aseguramos que contact existe
         phones: contactData.phones,
         email: contactData.email,
         name: contactData.name,
         website: contactData.website,
       }
     }));
  }, []);

  // Handler para cambios en ImageUploader
  const handleImagesChange = useCallback((imageUrls: string[]) => { // Asume que recibe URLs finales
    setAd(prev => ({
      ...prev,
      images: imageUrls
    }));
  }, []);


  // ---- NAVEGACIÓN ENTRE PASOS ----
  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      setError('');
      setStep(prevStep => Math.min(prevStep + 1, Object.keys(STEPS).length) as StepValue);
    }
  }, [step, validateStep]);

  const handlePrevious = useCallback(() => {
    setError(''); // Limpiar error al retroceder
    setStep(prevStep => Math.max(prevStep - 1, 1) as StepValue);
  }, []);

  // ---- SUBMIT FINAL ----
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar el último paso antes de enviar
    if (!validateStep(STEPS.PREVIEW)) {
       // O validar todos de nuevo por seguridad
       // let allValid = true;
       // for (let i = 1; i <= STEPS.PREVIEW; i++) {
       //     if (!validateStep(i as StepValue)) {
       //         setStep(i as StepValue); // Ir al paso con error
       //         allValid = false;
       //         break;
       //     }
       // }
       // if (!allValid) return;
       return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Asegurarse de enviar solo los datos necesarios y con la estructura correcta
      const finalAdData: Partial<Publication> = { ...ad };
      // Limpiar campos opcionales vacíos si es necesario antes de enviar
      if (!finalAdData.subSubcategorySlug) delete finalAdData.subSubcategorySlug;
      if (finalAdData.images?.length === 0) delete finalAdData.images;
      // ... etc

      // --- IMPORTANTE: Aquí es donde añadirías los ATRIBUTOS ---
      // Dependiendo de cómo implementes la captura de atributos en el paso DETAILS
      // finalAdData.attributes = { ... capturedAttributes };

      console.log("Enviando:", finalAdData); // Para depuración

      const response = await PublicationsService.createPublication(finalAdData as Publication); // Asegúrate que el servicio espera este tipo
      Logger.success('Anuncio publicado con éxito', response);
      setSuccess(true);
      // Redirección (ajusta la URL según tu estructura)
      // Idealmente la respuesta del API debería incluir el slug o la URL completa
      const redirectSlug = response.categorySlug || 'anuncio'; // Fallback
      setTimeout(() => {
        router.push(`/${redirectSlug}/${response._id}`); // Asume que la respuesta tiene _id y categorySlug
      }, 2000);

    } catch (err: any) {
      Logger.error('Error publicando anuncio:', err);
      setError(err.message || 'Ha ocurrido un error al publicar. Inténtalo de nuevo.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, [ad, router, validateStep]); // Incluir validateStep en dependencias

  // ---- RENDERIZADO DE PASOS ----
  const renderStepContent = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return (
           // Usa el layout de 2 columnas como en tu código original
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
             <div className="lg:col-span-3">
               <div className="bg-white rounded-xl shadow-md p-6">
                 <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                   <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">1</span>
                   Selecciona la categoría
                 </h2>
                  {/* El CategorySelector ahora maneja su lógica interna y llama a handleClassificationChange al final */}
                  {/* Ya no necesita props selectedCategory ni onSelect complejos */}
                 <CategorySelector onSelectionComplete={handleClassificationChange} />
               </div>
             </div>
             <div className="lg:col-span-2 hidden lg:block">
               <div className="sticky top-24 space-y-4">
                 <AdPreview adData={ad} />
                 {/* Consejo */}
                 <div className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                    <p className="text-sm text-gray-600">
                       Selecciona la categoría que mejor represente tu anuncio para llegar a los compradores correctos.
                    </p>
                 </div>
               </div>
             </div>
          </div>
        );
      case STEPS.DETAILS:
        return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                           <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">2</span>
                           Detalles del anuncio
                        </h2>
                        <div className="space-y-6">
                            {/* Título */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-primary-700 mb-1">Título *</label>
                                <input
                                    id="title" type="text" name="title"
                                    value={ad.title} onChange={handleSimpleInputChange}
                                    className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                    placeholder="Ej: Vendo iPhone 13 como nuevo" maxLength={70} required
                                />
                                <p className="text-xs text-gray-500 text-right mt-1">{ad.title?.length || 0}/70</p>
                            </div>
                            {/* Descripción */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-1">Descripción *</label>
                                <textarea
                                    id="description" name="description"
                                    value={ad.description} onChange={handleSimpleInputChange} rows={5}
                                    className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                    placeholder="Incluye detalles, características, estado..." maxLength={1000} required
                                />
                                <p className="text-xs text-gray-500 text-right mt-1">{ad.description?.length || 0}/1000</p>
                            </div>
                            {/* Precio */}
                            <PriceInput value={{ amount: ad.amount, currency: ad.currency, negotiable: ad.negotiable }} onChange={handlePriceChange} />
                            {/* Ubicación */}
                            <LocationSelector value={ad.location} onChange={handleLocationChange} />
                            {/* --- AQUÍ IRÍAN LOS INPUTS PARA ATRIBUTOS ESPECÍFICOS --- */}
                            {/* Renderizar inputs para ad.attributes según ad.categorySlug/subcategorySlug */}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2 hidden lg:block">
                  <div className="sticky top-24 space-y-4">
                      <AdPreview adData={ad} />
                      {/* Consejo */}
                      <div className="bg-white rounded-xl shadow-md p-4">
                          <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                          <p className="text-sm text-gray-600">
                              Un buen título y descripción clara atraen más interesados. ¡Sé específico!
                          </p>
                      </div>
                  </div>
                </div>
            </div>
        );
      case STEPS.MEDIA:
         return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                           <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">3</span>
                           Añade imágenes (Opcional)
                        </h2>
                         <ImageUploader
                             // Pasar las URLs actuales si ya se subieron, o previews si se maneja localmente
                             initialImages={ad.images || []} // Ajustar según cómo ImageUploader maneje esto
                             onImagesChange={handleImagesChange} // Debería devolver URLs o identificadores
                             maxImages={8}
                         />
                         <p className="text-xs text-gray-500 mt-2">* Las imágenes de buena calidad aumentan mucho el interés.</p>
                    </div>
                </div>
                <div className="lg:col-span-2 hidden lg:block">
                  <div className="sticky top-24 space-y-4">
                      <AdPreview adData={ad} />
                       {/* Consejo */}
                      <div className="bg-white rounded-xl shadow-md p-4">
                          <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                          <p className="text-sm text-gray-600">
                              ¡Una imagen vale más que mil palabras! Muestra tu producto o servicio desde varios ángulos.
                          </p>
                      </div>
                  </div>
                </div>
            </div>
         );
      case STEPS.CONTACT:
         return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">4</span>
                            Información de contacto
                        </h2>
                         {/* Usar un componente ContactForm dedicado */}
                        <ContactForm value={ad.contact} onChange={handleContactChange} />
                    </div>
                </div>
                <div className="lg:col-span-2 hidden lg:block">
                   <div className="sticky top-24 space-y-4">
                       <AdPreview adData={ad} />
                       {/* Consejo */}
                       <div className="bg-white rounded-xl shadow-md p-4">
                           <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                           <p className="text-sm text-gray-600">
                               Facilita que te contacten. Verifica que tu número principal esté correcto.
                           </p>
                       </div>
                   </div>
                </div>
            </div>
         );
      case STEPS.PREVIEW:
        return (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-md p-6">
                         <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">5</span>
                            Confirma y publica
                        </h2>
                         <div className="space-y-6">
                             <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                 <h3 className="font-semibold text-blue-800 flex items-center mb-2">
                                     <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                                     Revisa tu anuncio
                                 </h3>
                                 <p className="text-sm text-blue-700">
                                     Así se verá tu anuncio. Verifica que toda la información sea correcta antes de publicarlo.
                                 </p>
                             </div>
                             {/* Mostrar AdPreview aquí también o un resumen más detallado */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-medium mb-2">Resumen Rápido:</h4>
                                <p className="text-sm"><strong>Título:</strong> {ad.title}</p>
                                <p className="text-sm"><strong>Categoría:</strong> {getClassificationNames(ad.categorySlug || '', ad.subcategorySlug).categoryName} &gt; {getClassificationNames(ad.categorySlug || '', ad.subcategorySlug).subcategoryName} </p>
                                <p className="text-sm"><strong>Precio:</strong> {formatCurrency(ad.amount ?? 0, ad.currency ?? 'PEN')} {ad.negotiable ? '(Negociable)' : ''}</p>
                                <p className="text-sm"><strong>Contacto Principal:</strong> {ad.contact?.phones?.[0]}</p>
                              </div>

                             <div className="flex items-center justify-center">
                                 <button
                                     onClick={handleSubmit}
                                     className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto text-center"
                                     disabled={loading || success} // Deshabilitar si está cargando o ya tuvo éxito
                                 >
                                     {loading ? (
                                         <span className="flex items-center justify-center">
                                             <LoadingState className="w-5 h-5 mr-2" /> Publicando...
                                         </span>
                                     ) : success ? (
                                          <span className="flex items-center justify-center">
                                            <CheckCircleIcon className="w-5 h-5 mr-2" /> ¡Publicado!
                                          </span>
                                     ) : (
                                         "Confirmar y Publicar Anuncio"
                                     )}
                                 </button>
                             </div>
                             {success && (
                                 <p className="text-green-600 text-sm text-center mt-2">
                                     ¡Éxito! Redireccionando a tu anuncio...
                                 </p>
                             )}
                         </div>
                    </div>
                </div>
                 <div className="lg:col-span-2 hidden lg:block">
                   <div className="sticky top-24 space-y-4">
                       {/* La AdPreview ya está visible, se puede quitar de aquí si se prefiere */}
                       <AdPreview adData={ad} />
                       {/* Consejo */}
                       <div className="bg-white rounded-xl shadow-md p-4">
                           <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                           <p className="text-sm text-gray-600">
                               Puedes editar tu anuncio más tarde desde tu panel de usuario. ¡Mucha suerte!
                           </p>
                       </div>
                   </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4"> {/* Asegura padding en móvil */}
        <div className="mb-8 max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">Publicar anuncio</h1>
          <p className="text-gray-600 text-center">
            Completa los pasos para publicar tu anuncio en Buscadis.
          </p>
        </div>

        <PublicationProgress currentStep={step} totalSteps={Object.keys(STEPS).length} />

        <div className="mt-8">
             {error && <ErrorMessage message={error} className="mb-6 max-w-3xl mx-auto" />}
             {renderStepContent()}
        </div>

        {/* Botones de Navegación (solo si no es el paso de categoría) */}
        {step > STEPS.CATEGORY && (
          <div className="mt-8 flex justify-between max-w-3xl mx-auto lg:max-w-none lg:w-full lg:px-[10%] xl:px-[15%]"> {/* Ajusta el ancho/padding si el contenido principal está centrado */}
             <button
                onClick={handlePrevious}
                disabled={loading}
                className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Anterior
             </button>

             {step !== STEPS.PREVIEW && (
               <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex items-center px-5 py-2.5 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-all disabled:opacity-50"
               >
                  Siguiente
                  <ChevronRightIcon className="w-5 h-5 ml-1" />
               </button>
             )}
          </div>
        )}
      </div>
      {/* Confetti podría ir aquí si usas una librería */}
    </div>
  );
}