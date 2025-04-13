'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Publication } from '@/components/search/SearchResults';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Logger } from '@/services/logging.service';

// Simple version that doesn't directly import MongoDB
const FavoritesPage = () => {
  const [favoriteItems, setFavoriteItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        
        // Get favorite IDs from localStorage
        const savedFavorites = localStorage.getItem('savedItems');
        let favoriteIds: string[] = [];
        
        if (savedFavorites) {
          favoriteIds = JSON.parse(savedFavorites);
        }
        
        if (favoriteIds.length === 0) {
          setFavoriteItems([]);
          setLoading(false);
          return;
        }
        
        // In a real implementation, we would fetch the actual publication data for these IDs
        // For now, we'll use mock data
        const mockFavorites: Publication[] = favoriteIds.map(id => ({
          id,
          title: `Favorite Item ${id}`,
          description: 'This is a placeholder for a favorited item',
          price: 100,
          currency: 'PEN',
          categorySlug: 'inmuebles',
          location: 'Lima, Perú',
          contactName: 'Contact',
          status: 'active',
          createdAt: new Date().toISOString(),
          images: ['/images/placeholder-buscadis.jpg']
        }));
        
        setFavoriteItems(mockFavorites);
        Logger.debug('Loaded favorites', { count: mockFavorites.length });
      } catch (err) {
        Logger.error('Error loading favorites', { error: err });
        setError('No se pudieron cargar los favoritos. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, []);

  const removeFavorite = (id: string) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== id));
    
    // Update localStorage
    const savedFavorites = localStorage.getItem('savedItems');
    if (savedFavorites) {
      const favoriteIds = JSON.parse(savedFavorites);
      const updatedFavorites = favoriteIds.filter((favId: string) => favId !== id);
      localStorage.setItem('savedItems', JSON.stringify(updatedFavorites));
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
  
  if (favoriteItems.length === 0) {
    return (
      <div className="container py-12">
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No tienes favoritos guardados</h2>
          <p className="text-gray-600 mb-6">
            Cuando guardes anuncios como favoritos, aparecerán aquí
          </p>
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            Explorar anuncios
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Favoritos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48">
              <img
                src={item.images?.[0] || '/images/placeholder-buscadis.jpg'}
                alt={item.title}
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
                  onClick={() => removeFavorite(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
