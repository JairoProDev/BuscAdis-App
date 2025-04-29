import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, Trash2 } from 'lucide-react';
import { getMagazineHistory, generateMagazine } from '@/features/magazine/services/magazine.service';

interface MagazineItem {
  url: string;
  lastUpdated: string;
  totalPublications: number;
  createdAt: Date;
}

export default function AdminMagazineManager() {
  const [magazines, setMagazines] = useState<MagazineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMagazines();
  }, []);

  const loadMagazines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const magazineData = await getMagazineHistory(20);
      setMagazines(magazineData);
    } catch (err) {
      console.error('Error loading magazines:', err);
      setError('No se pudieron cargar las revistas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMagazine = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const newMagazine = await generateMagazine();
      
      // Add the new magazine to the list
      setMagazines(prevMagazines => [newMagazine, ...prevMagazines]);
      
    } catch (err) {
      console.error('Error generating magazine:', err);
      setError('No se pudo generar la revista. Por favor, inténtalo más tarde.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteMagazine = async (url: string) => {
    // Implement magazine deletion if needed
    try {
      await fetch('/api/magazine/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      // Remove from the list
      setMagazines(prevMagazines => 
        prevMagazines.filter(magazine => magazine.url !== url)
      );
    } catch (error) {
      console.error('Error deleting magazine:', error);
      setError('No se pudo eliminar la revista.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Gestión de la Revista Digital</h2>
        
        <Button 
          onClick={handleGenerateMagazine}
          disabled={isGenerating}
          className="flex items-center"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generando...' : 'Generar Nueva Revista'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Creación
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anuncios
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : magazines.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No hay revistas generadas.
                </td>
              </tr>
            ) : (
              magazines.map((magazine, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{magazine.lastUpdated}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{magazine.totalPublications} anuncios</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => window.open(magazine.url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex items-center"
                        onClick={() => handleDeleteMagazine(magazine.url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 