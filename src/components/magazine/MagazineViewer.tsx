"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Calendar, Download, RefreshCw } from 'lucide-react';

export default function MagazineViewer() {
  const [magazine, setMagazine] = useState<{
    pdfUrl: string;
    createdAt: Date;
    publicationCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMagazine() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the fetch API to call our server API endpoint
        const response = await fetch('/api/magazine/get-latest');
        const data = await response.json();
        
        if (data.magazine) {
          setMagazine({
            pdfUrl: data.magazine.pdfUrl,
            createdAt: new Date(data.magazine.createdAt),
            publicationCount: data.magazine.publicationCount
          });
        } else {
          setMagazine(null);
        }
      } catch (err) {
        console.error('Error loading magazine:', err);
        setError('No se pudo cargar la revista. Intenta generar una nueva.');
      } finally {
        setIsLoading(false);
      }
    }

    loadMagazine();
  }, []);

  const handleGenerateMagazine = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Call the generate API endpoint
      const response = await fetch('/api/magazine/generate-magazine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate magazine');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMagazine({
          pdfUrl: data.pdfUrl,
          createdAt: new Date(data.createdAt),
          publicationCount: data.publicationCount
        });
      } else {
        setError('No se pudo generar la revista. Por favor, inténtalo más tarde.');
      }
    } catch (err) {
      console.error('Error generating magazine:', err);
      setError('No se pudo generar la revista. Por favor, inténtalo más tarde.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format date to display
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Magazine Preview */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Vista Previa</h2>
          
          {isLoading ? (
            <div className="w-full aspect-[3/4] relative">
              <Skeleton className="w-full h-full rounded-md" />
            </div>
          ) : error ? (
            <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center rounded-md">
              <p className="text-gray-500 text-center p-4">{error}</p>
            </div>
          ) : magazine ? (
            <div className="w-full aspect-[3/4] relative shadow-lg rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-100 flex flex-col items-center justify-center p-8 text-center">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Revista Digital Buscadis</h3>
                <p className="text-blue-600 text-sm mb-2">Edición: {formatDate(magazine.createdAt)}</p>
                <p className="text-blue-700">Contiene {magazine.publicationCount} anuncios clasificados</p>
                <div className="mt-8">
                  <Download className="h-10 w-10 mx-auto text-blue-500" />
                  <p className="text-sm mt-2 text-blue-600">Haz clic en el botón descargar para ver la revista completa</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center rounded-md">
              <p className="text-gray-500 text-center p-4">No hay ninguna revista disponible</p>
            </div>
          )}
        </div>

        {/* Magazine Info & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">Revista Digital de Clasificados</h2>
            
            {magazine && !isLoading && !error && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Última actualización: {formatDate(magazine.createdAt)}</span>
                </div>
                <p>
                  Contiene <strong>{magazine.publicationCount}</strong> anuncios clasificados actualizados.
                </p>
                <p className="text-gray-700 mt-4">
                  Nuestra revista digital se actualiza automáticamente con cada nueva publicación.
                  Descarga la última versión para ver todos los anuncios clasificados.
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            <div className="space-y-4 mt-8">
              <Button 
                className="w-full" 
                size="lg"
                disabled={isLoading || isGenerating || (!magazine && !error)}
                onClick={() => magazine && window.open(magazine.pdfUrl, '_blank')}
              >
                <Download className="mr-2 h-5 w-5" />
                Descargar Revista (PDF)
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                disabled={isGenerating}
                onClick={handleGenerateMagazine}
              >
                <RefreshCw className={`mr-2 h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generando...' : 'Generar Nueva Revista'}
              </Button>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>La revista se genera en formato PDF optimizado para su lectura en dispositivos electrónicos.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 