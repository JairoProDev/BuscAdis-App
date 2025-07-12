'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PublicationsService, UserPublication } from '@/services/publications.service';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import { DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function MyPublicationsPage() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<UserPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        if (user) {
          const data = await PublicationsService.getPublicationsByUser(user.id);
          setPublications(data);
        }
      } catch (err) {
        console.error('Error fetching publications:', err);
        setError('No se pudieron cargar tus anuncios. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [user]);

  const handleDeletePublication = async (id: string) => {
    try {
      await PublicationsService.deletePublication(id);
      setPublications(publications.filter(publication => publication._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting publication:', err);
      setError('No se pudo eliminar el anuncio. Inténtalo de nuevo más tarde.');
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
      locale: es
    });
  };

  if (loading) {
    return (
      <div className="container py-16 min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mis anuncios</h1>
        <Link 
          href="/publicar" 
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg inline-flex items-center transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Publicar nuevo
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {publications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No tienes anuncios publicados</h2>
          <p className="text-gray-500 mb-6">Comienza a publicar tus anuncios para que aparezcan aquí.</p>
          <Link
            href="/publicar"
            className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-6 rounded-lg inline-block transition-colors"
          >
            Publicar un anuncio
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anuncio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Publicado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitas
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {publications.map((publication) => (
                  <tr key={publication._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {publication.images && publication.images.length > 0 ? (
                            <Image 
                              src={publication.images[0]} 
                              alt={publication.title}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-md object-cover" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <PhotoIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {publication.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {publication.categorySlug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        publication.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {publication.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(publication.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {publication.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <Link
                          href={`/anuncios/${publication._id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver anuncio"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          href={`/mis-anuncios/editar/${publication._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar anuncio"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(publication._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar anuncio"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Eliminar anuncio?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este anuncio?
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePublication(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

