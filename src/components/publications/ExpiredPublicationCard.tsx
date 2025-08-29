'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Publication } from '@/types/publications';
import { formatPublicationDate } from '@/utils/publicationUtils';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ExpiredPublicationCardProps {
  publication: Publication;
  onAnonymousContact?: (publicationId: string) => void;
}

export default function ExpiredPublicationCard({ 
  publication, 
  onAnonymousContact 
}: ExpiredPublicationCardProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnonymousContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Aquí iría la lógica para enviar la notificación anónima
      const response = await fetch('/api/publications/anonymous-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicationId: publication._id,
          contactInfo: contactForm,
          type: 'expired_publication_interest'
        }),
      });

      if (response.ok) {
        toast.success('Notificación enviada al anunciante');
        setShowContactForm(false);
        setContactForm({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Error al enviar notificación');
      }
    } catch (error) {
      toast.error('Error al enviar notificación');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Badge de caducado */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center space-x-1 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-300 dark:border-red-700">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            Caducado
          </span>
        </div>
      </div>

      {/* Overlay de caducado */}
      <div className="absolute inset-0 bg-gray-900/5 dark:bg-gray-900/20 pointer-events-none" />

      <div className="p-6">
        {/* Información de fecha */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <CalendarIcon className="w-4 h-4" />
          <span>
            Publicado: {formatPublicationDate(publication.originalPublicationDate!)}
          </span>
          <ClockIcon className="w-4 h-4 ml-2" />
          <span>
            Caducó: {formatPublicationDate(publication.expirationDate!)}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {publication.title}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {publication.description}
        </p>

        {/* Precio */}
        {publication.amount && (
          <div className="mb-4">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              S/ {publication.amount.toLocaleString()}
            </span>
            {publication.negotiable && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                (Negociable)
              </span>
            )}
          </div>
        )}

        {/* Ubicación */}
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-4">
          <span className="text-sm">
            📍 {publication.location.district || 'Cusco'}
          </span>
        </div>

        {/* Información de contacto (OCULTA) */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Información de contacto no disponible</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Este anuncio ha caducado. El contacto del anunciante ya no está disponible.
          </p>
        </div>

        {/* Botón de contacto anónimo */}
        <div className="space-y-3">
          <button
            onClick={() => setShowContactForm(!showContactForm)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <UserIcon className="w-4 h-4" />
            <span>Contactar Anónimamente</span>
          </button>

          {showContactForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Notificar al anunciante
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Envía una notificación anónima al anunciante para que sepa que hay interés en su oferta.
              </p>
              
              <form onSubmit={handleAnonymousContact} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tu email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tu teléfono
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="+51 999 999 999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Mensaje opcional para el anunciante..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Notificación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Revista: {publication.magazineEdition}</span>
            <span>Página: {publication.originalPageNumber}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 