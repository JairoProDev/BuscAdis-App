'use client';

import { useState } from 'react';
import { parsePublicationsFromText, preparePublicationForAPI } from '@/utils/publicationParser';
import { PublicationsService } from '@/services/publications.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PublicationInput } from '@/types/publication';

interface Publication {
  title: string;
  category: string;
  subcategory?: string;
  price: number;
  price_type: string;
  contact: {
    phone?: string;
    email?: string;
  };
}

interface ImportError {
  publication: string;
  error: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
}

export default function ImportPublicationsPage() {
  const [rawText, setRawText] = useState('');
  const [parsedPublications, setParsedPublications] = useState<Publication[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState(1);

  // Analizar texto para previsualizar publicaciones
  const handleParseText = () => {
    if (!rawText.trim()) {
      alert('Por favor, ingresa el texto de los anuncios');
      return;
    }

    try {
      const publicationInputs = parsePublicationsFromText(rawText);
      // Convertir PublicationInput[] a Publication[]
      const publications: Publication[] = publicationInputs.map(input => ({
        title: input.title,
        category: input.category,
        subcategory: input.subcategory || '',
        price: input.price,
        price_type: input.currency || 'PEN',
        contact: {
          phone: input.contactPhone,
          email: input.contactEmail
        }
      }));
      setParsedPublications(publications);
      setStep(2);
    } catch (error) {
      console.error('Error al analizar texto:', error);
      alert('Error al analizar el texto. Verifica el formato e intenta de nuevo.');
    }
  };

  // Importar publicaciones analizadas
  const handleImport = async () => {
    if (parsedPublications.length === 0) {
      alert('No hay publicaciones para importar');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result: ImportResult = {
        success: true,
        imported: 0,
        errors: [],
      };

      // Importar cada publicación
      for (const publication of parsedPublications) {
        try {
          // Convertir Publication a PublicationInput para preparePublicationForAPI
          const publicationInput: PublicationInput = {
            title: publication.title,
            description: publication.title, // Usar título como descripción por defecto
            category: publication.category,
            subcategory: publication.subcategory,
            price: publication.price,
            currency: publication.price_type,
            location: {
              province: 'Lima', // Valor por defecto
              district: '',
              address: '',
              referencePoint: '',
              coordinates: null
            },
            contactName: publication.contact.phone || 'No especificado',
            contactEmail: publication.contact.email,
            contactPhone: publication.contact.phone || '',
            images: []
          };
          
          // Preparar datos para la API
          const apiData = preparePublicationForAPI(publicationInput);
          
          // Enviar a la API
          await PublicationsService.createPublication(apiData);
          
          // Incrementar contador de éxito
          result.imported++;
          
          // Pequeña pausa para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('Error al importar publicación:', error);
          result.errors.push({
            publication: publication.title,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // Actualizar estado de éxito
      result.success = result.imported > 0;
      setImportResult(result);
      setStep(3);
    } catch (error) {
      console.error('Error general en la importación:', error);
      setImportResult({
        success: false,
        imported: 0,
        errors: [{ publication: 'General', error: error instanceof Error ? error.message : String(error) }]
      });
    } finally {
      setImporting(false);
    }
  };

  // Reiniciar el proceso
  const handleReset = () => {
    setRawText('');
    setParsedPublications([]);
    setImportResult(null);
    setStep(1);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Importar Publicaciones</h1>

      {/* Progreso */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className={`h-2 ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'} rounded-l-full`}></div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center -mx-3 z-10 bg-white border-2 border-blue-500 text-blue-500 font-bold text-xs">
          1
        </div>
        <div className="flex-1">
          <div className={`h-2 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center -mx-3 z-10 bg-white border-2 border-blue-500 text-blue-500 font-bold text-xs">
          2
        </div>
        <div className="flex-1">
          <div className={`h-2 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'} rounded-r-full`}></div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center -mx-3 z-10 bg-white border-2 border-blue-500 text-blue-500 font-bold text-xs">
          3
        </div>
      </div>

      {/* Paso 1: Ingresar texto */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Paso 1: Ingresar texto de anuncios</h2>
          <p className="text-gray-600 mb-4">
            Pega el texto con los anuncios que deseas importar. El sistema analizará el texto y extraerá las publicaciones automáticamente.
          </p>
          
          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Pega aquí el texto con los anuncios..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          ></textarea>
          
          <div className="flex justify-end mt-4">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleParseText}
            >
              Analizar Texto
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Previsualizar publicaciones */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Paso 2: Previsualizar publicaciones</h2>
          <p className="text-gray-600 mb-4">
            Se han encontrado {parsedPublications.length} publicaciones. Revisa la información y haz clic en &ldquo;Importar&rdquo; para continuar.
          </p>
          
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {parsedPublications.map((pub, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pub.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pub.category}{pub.subcategory ? ` / ${pub.subcategory}` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pub.price > 0 ? `S/ ${pub.price}` : pub.price_type === 'negotiable' ? 'Negociable' : 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pub.contact.phone || pub.contact.email || 'No especificado'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between mt-4">
            <button
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={handleReset}
            >
              Volver
            </button>
            
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Importando...</span>
                </span>
              ) : (
                'Importar Publicaciones'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Resultados */}
      {step === 3 && importResult && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Paso 3: Resultados de la importación</h2>
          
          <div className={`p-4 mb-6 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
            <h3 className={`font-semibold ${importResult.success ? 'text-green-800' : 'text-red-800'} mb-2`}>
              {importResult.success ? '¡Importación Completada!' : 'Error en la Importación'}
            </h3>
            <p className={importResult.success ? 'text-green-700' : 'text-red-700'}>
              {importResult.imported} de {parsedPublications.length} publicaciones importadas correctamente.
            </p>
            {importResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-red-700 font-medium">Errores ({importResult.errors.length}):</p>
                <ul className="list-disc pl-5 text-red-600 text-sm mt-1">
                  {importResult.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err.publication}: {err.error}</li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li>... y {importResult.errors.length - 5} más</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-4">
            <button
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={handleReset}
            >
              Importar Más Publicaciones
            </button>
            
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.location.href = '/'}
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 