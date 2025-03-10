'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserListingsService } from '@/features/listings/services/user-listings.service';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    if (!user) return;
    try {
      const data = await UserListingsService.getUserListings(user.id);
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (listingId: string, currentStatus: boolean) => {
    try {
      await UserListingsService.toggleListingStatus(listingId, !currentStatus);
      setListings(listings.map((listing: any) =>
        listing.id === listingId
          ? { ...listing, is_active: !currentStatus }
          : listing
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este anuncio?')) return;

    try {
      await UserListingsService.deleteListing(listingId);
      setListings(listings.filter((listing: any) => listing.id !== listingId));
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Mis Anuncios
          </h1>
          <button
            onClick={() => router.push('/publicar')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Publicar nuevo anuncio
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes anuncios publicados
            </h3>
            <p className="text-gray-500">
              Comienza publicando tu primer anuncio
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {listings.map((listing: any) => (
                <li key={listing.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Publicado el {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleToggleStatus(listing.id, listing.is_active)}
                          className={`p-2 rounded-full ${
                            listing.is_active
                              ? 'bg-green-50 text-green-600 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {listing.is_active ? (
                            <EyeIcon className="w-5 h-5" />
                          ) : (
                            <EyeSlashIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => router.push(`/editar/${listing.id}`)}
                          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
