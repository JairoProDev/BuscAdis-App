'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicationsService, QuickPublicationData } from '@/services/publications.service';
import CategorySelector from '@/components/publish/CategorySelector';
import LocationSelector from '@/components/publish/LocationSelector';
import PriceSelector from '@/components/publish/PriceSelector';
import { 
    CheckCircleIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import LoadingState from '@/components/ui/LoadingState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { PhoneInput } from 'react-international-phone';
import ImageUploader from './ImageUploader';
import AdPreview from './AdPreview';
import PublicationProgress from './PublicationProgress';

// Pasos de publicación
const STEPS = {
    CATEGORY: 1,
    DETAILS: 2,
    MEDIA: 3,
    CONTACT: 4,
    PREVIEW: 5
};

export default function PublishPage() {
    const router = useRouter();
    const [step, setStep] = useState(STEPS.CATEGORY);
    const [progress, setProgress] = useState(20);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stepsCompleted, setStepsCompleted] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const [ad, setAd] = useState<QuickPublicationData>({
        title: '',
        description: '',
        contact: {
            whatsapp: '',
            email: '',
            name: '',
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
            case STEPS.MEDIA:
                // Imágenes son opcionales, pero recomendadas
                // if (!ad.media || ad.media.length === 0) {
                //     errors.push('Debes subir al menos una imagen');
                // }
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
        
        // Celebrar el progreso si es la primera vez que el usuario completa este paso
        if (nextStep > stepsCompleted) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
            setStepsCompleted(nextStep);
        }
        
        updateProgress();
        setStep(nextStep);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validar todos los pasos antes de enviar la publicación
        for (let i = 1; i <= Object.keys(STEPS).length; i++) {
            if (!validateStep(i)) {
                setLoading(false);
                return;
            }
        }

        try {
            const response = await PublicationsService.createPublication(ad);
            setSuccess(true);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAd(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNext = () => {
        if (!validateStep(step)) {
            return;
        }

        setError('');
        setStep(prevStep => Math.min(prevStep + 1, 5));
    };

    const handlePrevious = () => {
        setStep(prevStep => Math.max(prevStep - 1, 1));
    };

    const handleImageUpload = (images: string[]) => {
        setAd(prev => ({
            ...prev,
            media: images
        }));
    };

    const removeImage = (index: number) => {
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
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">1</span>
                                    Selecciona una categoría
                                </h2>
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
                            </div>
                        </div>
                        <div className="lg:col-span-2 hidden lg:block">
                            <div className="sticky top-24">
                                <AdPreview adData={ad} />
                                <div className="mt-4 bg-white rounded-xl shadow-md p-4">
                                    <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                                    <p className="text-sm text-gray-600">
                                        Selecciona la categoría que mejor represente lo que quieres publicar. Esto hará que tu anuncio sea más visible para los interesados.
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
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">2</span>
                                    Detalles del anuncio
                                </h2>
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
                                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-500/20 transition-all"
                                            placeholder="Ej: Vendo iPhone 12 Pro Max"
                                            maxLength={70}
                                        />
                                        <div className="flex justify-end mt-1">
                                            <span className="text-xs text-gray-500">{ad.title.length}/70 caracteres</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
                                            Descripción del anuncio *
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={ad.description}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                            placeholder="Describe tu producto o servicio con detalles: características, condición, modelo, tiempo de uso, etc."
                                            maxLength={1000}
                                        />
                                        <div className="flex justify-end mt-1">
                                            <span className="text-xs text-gray-500">{ad.description.length}/1000 caracteres</span>
                                        </div>
                                    </div>

                                    <PriceSelector price={ad.price} onPriceChange={handleInputChange} />

                                    <LocationSelector 
                                        location={ad.location} 
                                        onLocationChange={handleInputChange} 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 hidden lg:block">
                            <div className="sticky top-24">
                                <AdPreview adData={ad} />
                                <div className="mt-4 bg-white rounded-xl shadow-md p-4">
                                    <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                                    <p className="text-sm text-gray-600">
                                        Un buen título y descripción aumenta las posibilidades de que tu anuncio sea visto. Incluye palabras clave relevantes.
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
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">3</span>
                                    Añade imágenes
                                </h2>
                                <ImageUploader 
                                    images={ad.media} 
                                    onUpload={handleImageUpload} 
                                    onRemove={removeImage}
                                    maxImages={8}
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    * Las imágenes destacarán tu anuncio. Puedes subir hasta 8 imágenes.
                                </p>
                            </div>
                        </div>
                        <div className="lg:col-span-2 hidden lg:block">
                            <div className="sticky top-24">
                                <AdPreview adData={ad} />
                                <div className="mt-4 bg-white rounded-xl shadow-md p-4">
                                    <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                                    <p className="text-sm text-gray-600">
                                        Los anuncios con imágenes reciben hasta 10 veces más visitas. Usa fotos bien iluminadas y claras.
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
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">4</span>
                                    Información de contacto
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-medium text-primary-700 mb-2">
                                            Nombre de contacto
                                        </label>
                                        <input
                                            id="contactName"
                                            type="text"
                                            name="contact.name"
                                            value={ad.contact.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-500/20 transition-all"
                                            placeholder="Tu nombre o nombre de la empresa"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="contactWhatsapp" className="block text-sm font-medium text-primary-700 mb-2">
                                            WhatsApp *
                                        </label>
                                        <div className="flex">
                                            <PhoneInput
                                                defaultCountry="pe"
                                                value={ad.contact.whatsapp}
                                                onChange={(value) => {
                                                    setAd({
                                                        ...ad,
                                                        contact: {
                                                            ...ad.contact,
                                                            whatsapp: value
                                                        }
                                                    });
                                                }}
                                                inputClassName="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-500/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="contactEmail" className="block text-sm font-medium text-primary-700 mb-2">
                                            Correo electrónico
                                        </label>
                                        <input
                                            id="contactEmail"
                                            type="email"
                                            name="contact.email"
                                            value={ad.contact.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-500/20 transition-all"
                                            placeholder="ejemplo@correo.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 hidden lg:block">
                            <div className="sticky top-24">
                                <AdPreview adData={ad} />
                                <div className="mt-4 bg-white rounded-xl shadow-md p-4">
                                    <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                                    <p className="text-sm text-gray-600">
                                        El WhatsApp es la forma más rápida para que los interesados se comuniquen contigo. Mantén tu teléfono disponible.
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
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    <span className="bg-primary-500 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3">5</span>
                                    Confirma y publica
                                </h2>
                                <div className="space-y-6">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                        <h3 className="font-semibold text-green-800 flex items-center mb-2">
                                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                                            ¡Tu anuncio está listo para publicarse!
                                        </h3>
                                        <p className="text-sm text-green-700">
                                            Revisa todos los detalles en la vista previa antes de publicar. Una vez publicado, tu anuncio estará visible para todos los usuarios.
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-center">
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto text-center"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <LoadingState /> Publicando...
                                                </span>
                                            ) : (
                                                "Publicar anuncio"
                                            )}
                                        </button>
                                    </div>
                                    
                                    {error && <ErrorMessage message={error} />}
                                    
                                    {success && (
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <p className="text-green-700 font-medium">
                                                ¡Tu anuncio ha sido publicado con éxito!
                                            </p>
                                            <p className="text-green-600 text-sm mt-1">
                                                Redireccionando...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 hidden lg:block">
                            <div className="sticky top-24">
                                <AdPreview adData={ad} />
                                <div className="mt-4 bg-white rounded-xl shadow-md p-4">
                                    <h3 className="font-semibold text-primary-600 mb-2">💡 Consejo</h3>
                                    <p className="text-sm text-gray-600">
                                        Puedes editar tu anuncio en cualquier momento después de publicarlo. Los anuncios se mantienen activos por 30 días.
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
            <div className="container">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Publicar anuncio</h1>
                    <p className="text-gray-600">
                        Completa los siguientes pasos para publicar tu anuncio en Buscadis.
                    </p>
                </div>
                
                <PublicationProgress step={step} progress={progress} />
                
                <div className="mt-8">
                    {renderStepContent()}
                </div>
                
                {/* Navigation buttons */}
                {step !== STEPS.CATEGORY && (
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={handlePrevious}
                            className="flex items-center px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                        >
                            <ChevronLeftIcon className="w-5 h-5 mr-2" />
                            Anterior
                        </button>
                        
                        {step !== STEPS.PREVIEW && (
                            <button
                                onClick={handleNext}
                                className="flex items-center px-5 py-2.5 bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-all"
                            >
                                Siguiente
                                <ChevronRightIcon className="w-5 h-5 ml-2" />
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            {/* Confeti cuando se completa un paso */}
            {showConfetti && (
                <div className="fixed inset-0 z-50 pointer-events-none">
                    {/* Aquí iría un componente de confeti, como react-confetti */}
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
                        🎉
                    </div>
                </div>
            )}
        </div>
    );
}