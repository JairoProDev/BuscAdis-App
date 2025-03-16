import { useEffect, useState } from 'react';
import { ClassifiedadsService } from '@/services/classifiedads.service';

const ClassifiedadsList = () => {
  const [classifiedads, setClassifiedads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClassifiedads = async () => {
      try {
        const data = await ClassifiedadsService.getClassifiedads();
        setClassifiedads(data);
      } catch (err) {
        setError('Error al cargar los anuncios');
      } finally {
        setLoading(false);
      }
    };

    fetchClassifiedads();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Anuncios Publicados</h2>
      <ul>
        {classifiedads.map((classifiedad) => (
          <li key={classifiedad.id}>
            <h3>{classifiedad.title}</h3>
            <p>{classifiedad.description}</p>
            <p>Ubicación: {classifiedad.location.city}, {classifiedad.location.country}</p>
            <p>Precio: {classifiedad.price} {classifiedad.currency}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassifiedadsList;
