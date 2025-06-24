import { useEffect, useState } from 'react';
import { PublicationsService, Publication } from '@/services/publications.service';

const PublicationsList = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const data = await PublicationsService.getPublications();
        setPublications(data.publications);
      } catch (err) {
        setError('Error al cargar los anuncios');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Anuncios Publicados</h2>
      <ul>
        {publications.map((publication) => (
          <li key={publication._id}>
            <h3>{publication.title}</h3>
            <p>{publication.description}</p>
            <p>Ubicación: {publication.location.city}, {publication.location.country}</p>
            <p>Precio: {publication.value} {publication.currency}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicationsList;
