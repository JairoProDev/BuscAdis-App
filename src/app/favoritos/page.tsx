'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FavoritesService } from '@/features/favorites/services/favorites.service';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import ClassifiedadCard from '@/components/classifiedads/ClassifiedadCard';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const data = await FavoritesService.getFavorites(user.id);
          setFavorites(data);
        } catch (error) {
          console.error('Error loading favorites:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFavorites();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Mis Favoritos
        </h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-500">
              Guarda los anuncios que te interesen para verlos más tarde
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite: any) => (
              <ClassifiedadCard
                key={favorite.classifiedad.id}
                classifiedad={favorite.classifiedad}
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
