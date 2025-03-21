'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FavoritesService } from '../services/favorites.service';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface FavoriteButtonProps {
  publicationId: string;
  initialIsFavorite?: boolean;
}

export default function FavoriteButton({ publicationId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const toggleFavorite = async () => {
    if (!isAuthenticated || !user) {
      // Mostrar modal de login
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await FavoritesService.removeFromFavorites(user.id, publicationId);
      } else {
        await FavoritesService.addToFavorites(user.id, publicationId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors duration-200 ${
        isFavorite 
          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      {isFavorite ? (
        <HeartSolidIcon className="w-6 h-6" />
      ) : (
        <HeartIcon className="w-6 h-6" />
      )}
    </button>
  );
}
