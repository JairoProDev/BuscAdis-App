'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Publication {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categorySlug: string;
  location: string;
  contactName: string;
  status: string;
  createdAt: string;
}

export default function SearchPage() {
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetchPublications() {
      try {
        setLoading(true);
        // Use API route instead of direct MongoDB access in the browser
        const response = await fetch(`/api/publications?query=${query}`);
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setPublications(data.publications || []);
        setError(null);
      } catch (err) {
        setError('Error al cargar publicaciones. Por favor, intenta de nuevo.');
        console.error('Error fetching publications:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublications();
  }, [query]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Buscando publicaciones...</h1>
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 p-4 mb-4 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Búsqueda de Publicaciones</h1>
      
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar publicaciones..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      
      {publications.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <p className="text-gray-600">No se encontraron publicaciones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publications.map((publication) => (
            <div 
              key={publication.id} 
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{publication.title}</h2>
                <p className="text-gray-600 mb-2 line-clamp-2">{publication.description}</p>
                <p className="text-lg font-bold mb-2">
                  {publication.price} {publication.currency || 'PEN'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{publication.location}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(publication.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 