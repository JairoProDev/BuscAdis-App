import { useEffect, useState } from 'react';
import { ListingsService } from '@/services/listings.service';

const ListingsList = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await ListingsService.getListings();
        setListings(data);
      } catch (err) {
        setError('Error al cargar los anuncios');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Anuncios Publicados</h2>
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            <h3>{listing.title}</h3>
            <p>{listing.description}</p>
            <p>Ubicación: {listing.location.city}, {listing.location.country}</p>
            <p>Precio: {listing.price} {listing.currency}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListingsList;
