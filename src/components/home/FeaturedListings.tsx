'use client';

import { useState, useEffect } from 'react';
import { ListingsService } from '@/services/listings.service';
import ListingCard from '@/components/listings/ListingCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function FeaturedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        setLoading(true);
        const response = await ListingsService.getListings({
          limit: 8,
          sortBy: 'featured'
        });
        setListings(response.listings);
      } catch (err) {
        console.error('Error fetching featured listings:', err);
        setError('No se pudieron cargar los anuncios destacados.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center">
        <p className="text-gray-600">No hay anuncios destacados disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
