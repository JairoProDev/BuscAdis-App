'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Publication } from '@/components/search/SearchResults';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Logger } from '@/services/logging.service';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Simple version that doesn't directly import MongoDB
const SavedPage = () => {
  const [savedItems, setSavedItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadSaved = async () => {
      try {
        setLoading(true);
        
        // Get favorite IDs from localStorage
        const saved = localStorage.getItem('savedItems');
        let savedIds: string[] = [];
        
        if (saved) {
          savedIds = JSON.parse(saved);
        }
        
        if (savedIds.length === 0) {
          setSavedItems([]);
          setLoading(false);
          return;
        }
        
        // Simulación de datos guardados
        const mockSaved: Publication[] = savedIds.map(id => ({
          id,
          title: `Anuncio guardado ${id}`,
          description: 'Este es un anuncio que guardaste para ver después',
          price: 100,
          currency: 'PEN',
          categorySlug: 'inmuebles',
          location: 'Cusco, Perú',
          contactName: 'Contacto',
          status: 'active',
          createdAt: new Date().toISOString(),
          images: ['/images/placeholder-buscadis.jpg']
        }));
        
        setSavedItems(mockSaved);
        Logger.debug('Loaded saved items', { count: mockSaved.length });
      } catch (err) {
        Logger.error('Error loading saved items', { error: err });
        setError('No se pudieron cargar los guardados. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSaved();
  }, []);


  const removeSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
    
    // Update localStorage
    const saved = localStorage.getItem('savedItems');
    if (saved) {
      const savedIds = JSON.parse(saved);
      const updatedSaved = savedIds.filter((savedId: string) => savedId !== id);
      localStorage.setItem('savedItems', JSON.stringify(updatedSaved));
    }
  };
  
  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 border border-red-100 p-4 rounded-md text-red-600">
          {error}
        </div>
      </div>
    );
  }
  
  if (savedItems.length === 0) {
    return (
      <div className="container py-12">
        <div className="text-center py-16 bg-gray-50 rounded-lg animate-fade-in">
          <h2 className="text-2xl font-bold mb-2 text-teal-600">¡Aún no tienes anuncios guardados!</h2>
          <p className="text-gray-600 mb-6">Guarda tus anuncios favoritos para verlos aquí y no perderte nada. ¡Empieza a crear tu colección personalizada!</p>
          <div className="flex justify-center mb-4">
            <span className="inline-block animate-bounce text-4xl">💾</span>
          </div>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold shadow hover:from-teal-600 hover:to-cyan-600 transition-colors">Explorar anuncios</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Guardados</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden animate-fade-in-up">
            <div className="relative h-48">
              <Image
                src={item.images?.[0] || '/images/placeholder-buscadis.jpg'}
                alt={item.title}
                width={400}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-600">
                  {Intl.NumberFormat('es-PE', { style: 'currency', currency: item.currency }).format(item.price)}
                </span>
                <button
                  onClick={() => removeSaved(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Quitar de guardados
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RedirectToGuardados = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/guardados');
  }, [router]);
  return <div className="p-8 text-center text-gray-500">Redirigiendo a Guardados...</div>;
};

export default RedirectToGuardados;
