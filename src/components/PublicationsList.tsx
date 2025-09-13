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
      } catch {
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
            {typeof publication.location === 'object' ? (
              <p>Ubicación: {publication.location.city || publication.location.district}, {publication.location.country || publication.location.province}</p>
            ) : (
              <p>Ubicación: {publication.location}</p>
            )}
            <p>Precio: {(publication as any).value ?? (publication as any).amount ?? 0} {publication.currency || (publication as any).pricing?.currency || 'PEN'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicationsList;
