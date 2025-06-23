'use client';

import React, { useState, useCallback } from 'react';
import { Logger } from '@/services/logging.service';
import { PublicationsService } from '@/services/publications.service';

interface PublicationFormData {
  title: string;
  description: string;
  categorySlug: string;
  price: number;
  location: string;
  contactName: string;
  contactPhone: string;
}

export default function PublicarPage() {
  const [formData, setFormData] = useState<PublicationFormData>({
    title: '',
    description: '',
    categorySlug: 'inmuebles',
    price: 0,
    location: 'Cusco',
    contactName: '',
    contactPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      Logger.info('Iniciando publicación de anuncio', { formData });

      const result = await PublicationsService.createPublication({
        title: formData.title,
        description: formData.description,
        categorySlug: formData.categorySlug,
        price: formData.price,
        location: formData.location,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        status: 'active'
      });

      if (result.success) {
        setSuccess(true);
        Logger.info('Anuncio publicado exitosamente', { id: result.publication?.id });
        
        // Limpiar formulario
        setFormData({
          title: '',
          description: '',
          categorySlug: 'inmuebles',
          price: 0,
          location: 'Cusco',
          contactName: '',
          contactPhone: ''
        });
      } else {
        throw new Error(result.message || 'Error al crear la publicación');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al publicar';
      setError(errorMessage);
      Logger.error('Error al publicar anuncio', { error: errorMessage, formData });
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleChange = useCallback((field: keyof PublicationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Anuncio Publicado!</h2>
          <p className="text-gray-600 mb-6">Tu anuncio ha sido publicado exitosamente y ya está disponible.</p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Publicar Otro Anuncio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Publicar Anuncio</h1>
          <p className="text-gray-600 mt-1">Completa los datos de tu anuncio</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del anuncio *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej: Casa colonial en San Blas con vista panorámica"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe tu anuncio con todos los detalles importantes..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                maxLength={1000}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.categorySlug}
                onChange={(e) => handleChange('categorySlug', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="inmuebles">Inmuebles</option>
                <option value="empleos">Empleos</option>
                <option value="vehiculos">Vehículos</option>
                <option value="servicios">Servicios</option>
                <option value="productos">Productos</option>
                <option value="eventos">Eventos</option>
                <option value="comunidad">Comunidad</option>
                <option value="negocios">Negocios</option>
              </select>
            </div>

            {/* Precio */}
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
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ej: San Blas, Cusco"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Información de contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
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
                  required
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="999 999 999"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Botón de envío */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Publicando...' : 'Publicar Anuncio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}