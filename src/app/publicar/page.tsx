'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PublicationsService, QuickPublicationData } from '@/services/publications.service';
import CategorySelector from '@/components/publish/CategorySelector';
import MediaUploader from '@/components/publish/MediaUploader';
import LocationSelector from '@/components/publish/LocationSelector';
import PriceSelector from '@/components/publish/PriceSelector';
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
} from '@heroicons/react/24/outline';
import LoadingState from '@/components/ui/LoadingState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Link from 'next/link';
import { PhoneInput } from 'react-international-phone';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ImageService } from '@/services/image.service';
import ImageUploader from './ImageUploader';
import AdPreview from './AdPreview';
import PublicationProgress from './PublicationProgress';
import StepNavigation from './StepNavigation';

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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const [ad, setAd] = useState<QuickPublicationData>({
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAd(prev => ({
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

    const handleImageUpload = (images: string) => {
        setAd(prev => ({
            ...prev,
            media: images
        }));
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
                                    `<span class="math-inline">\{category\.id\}/</span>{selectedSubcategory.id}` : 
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
                                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-500/20 transition-all"
                                placeholder="Ej: Vendo iPhone 12 Pro Max"
                            />
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
                                rows={4}
                                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="Describe tu producto o servicio"
                            />
                        </div>

                        <PriceSelector price={ad.price} onPriceChange={handleInputChange} />

                        <LocationSelector 
                            location={ad.location} 
                            onLocationChange={handleInputChange} 
                        />
                    </div>
                );
            case STEPS.MEDIA:
                return (
                    <ImageUploader 
                        images={ad.media} 
                        onUpload={handleImageUpload} 
                        onRemove={removeImage}
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
                                value={ad.contact.whatsapp}
                                onChange={(phone) => setAd({...ad, contact: { ...ad.contact, whatsapp: phone }})}
                                defaultCountry="pe"
                                className="w-full px-4 py-3 bg-white rounded-xl border-2 border-primary-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="Número de WhatsApp"
                            />
                        </div>
                    </div>
                );
            case STEPS.PREVIEW:
                return (
                    <div>
                        <AdPreview ad={ad} />
                        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg w-full mt-6">
                            Publicar anuncio
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-3xl font-semibold mb-6">Publicar anuncio</h1>

            <PublicationProgress progress={progress} step={step} totalSteps={Object.keys(STEPS).length} />

            <div className="bg-white rounded-xl shadow-md p-6">
                {error && <ErrorMessage message={error} />}
                {success && (
                    <div className="flex items-center justify-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <CheckCircleIcon className="h-6 w-6 mr-2" />
                        <strong className="font-bold">¡Anuncio publicado!</strong>
                        <span className="block sm:inline">Redirigiendo...</span>
                    </div>
                )}

                {loading ? (
                    <LoadingState message="Publicando anuncio..." />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {renderStepContent()}

                        <div className="flex justify-between">
                            {step > 1 && (
                                <button type="button" onClick={handlePrevious} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                                    <ChevronLeftIcon className="w-5 h-5 inline-block mr-2" />
                                    Anterior
                                </button>
                            )}
                            {step < Object.keys(STEPS).length && step !== STEPS.PREVIEW && (
                                <button type="button" onClick={handleNext} className="bg-primary-600 text-white px-4 py-2 rounded-lg">
                                    Siguiente
                                    <ChevronRightIcon className="w-5 h-5 inline-block ml-2" />
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}