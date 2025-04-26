import { FiltersByCategory } from '@/types/filters'

export const filtersByCategory: FiltersByCategory = {
  inmuebles: {
    title: 'Filtros de Inmuebles',
    sections: [
      {
        title: 'Características básicas',
        filters: [
          {
            id: 'price',
            type: 'range',
            label: 'Precio',
            min: 0,
            max: 1000000,
            step: 1000,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'propertyType',
            type: 'select',
            label: 'Tipo de propiedad',
            options: [
              { value: 'house', label: 'Casa' },
              { value: 'apartment', label: 'Apartamento' },
              { value: 'land', label: 'Terreno' },
              { value: 'commercial', label: 'Local comercial' },
              { value: 'office', label: 'Oficina' }
            ]
          },
          {
            id: 'operation',
            type: 'select',
            label: 'Operación',
            options: [
              { value: 'sale', label: 'Venta' },
              { value: 'rent', label: 'Alquiler' },
              { value: 'temporary', label: 'Temporal' }
            ]
          }
        ]
      },
      {
        title: 'Detalles',
        filters: [
          {
            id: 'bedrooms',
            type: 'select',
            label: 'Habitaciones',
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4+', label: '4 o más' }
            ]
          },
          {
            id: 'bathrooms',
            type: 'select',
            label: 'Baños',
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3+', label: '3 o más' }
            ]
          },
          {
            id: 'area',
            type: 'range',
            label: 'Superficie (m²)',
            min: 0,
            max: 500,
            step: 10,
            format: (value: number) => `${value}m²`
          }
        ]
      },
      {
        title: 'Amenidades',
        filters: [
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'parking', label: 'Estacionamiento' },
              { value: 'pool', label: 'Piscina' },
              { value: 'garden', label: 'Jardín' },
              { value: 'security', label: 'Seguridad 24/7' },
              { value: 'gym', label: 'Gimnasio' },
              { value: 'furnished', label: 'Amueblado' }
            ]
          }
        ]
      }
    ]
  },
  vehiculos: {
    title: 'Filtros de Vehículos',
    sections: [
      {
        title: 'Detalles básicos',
        filters: [
          {
            id: 'price',
            type: 'range',
            label: 'Precio',
            min: 0,
            max: 100000,
            step: 500,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'brand',
            type: 'select',
            label: 'Marca',
            options: [
              { value: 'toyota', label: 'Toyota' },
              { value: 'honda', label: 'Honda' },
              { value: 'ford', label: 'Ford' },
              { value: 'chevrolet', label: 'Chevrolet' },
              { value: 'nissan', label: 'Nissan' }
            ]
          },
          {
            id: 'year',
            type: 'range',
            label: 'Año',
            min: 1990,
            max: new Date().getFullYear(),
            step: 1,
            format: (value: number) => value.toString()
          }
        ]
      },
      {
        title: 'Características',
        filters: [
          {
            id: 'transmission',
            type: 'select',
            label: 'Transmisión',
            options: [
              { value: 'automatic', label: 'Automática' },
              { value: 'manual', label: 'Manual' }
            ]
          },
          {
            id: 'fuel',
            type: 'select',
            label: 'Combustible',
            options: [
              { value: 'gasoline', label: 'Gasolina' },
              { value: 'diesel', label: 'Diesel' },
              { value: 'electric', label: 'Eléctrico' },
              { value: 'hybrid', label: 'Híbrido' }
            ]
          },
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'ac', label: 'Aire acondicionado' },
              { value: 'airbags', label: 'Airbags' },
              { value: 'abs', label: 'ABS' },
              { value: 'bluetooth', label: 'Bluetooth' },
              { value: 'camera', label: 'Cámara de retroceso' }
            ]
          }
        ]
      }
    ]
  },
  empleos: {
    title: 'Filtros de Empleos',
    sections: [
      {
        title: 'Detalles del empleo',
        filters: [
          {
            id: 'salary',
            type: 'range',
            label: 'Salario',
            min: 0,
            max: 10000,
            step: 100,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'jobType',
            type: 'select',
            label: 'Tipo de empleo',
            options: [
              { value: 'fullTime', label: 'Tiempo completo' },
              { value: 'partTime', label: 'Medio tiempo' },
              { value: 'temporary', label: 'Temporal' },
              { value: 'contract', label: 'Contrato' },
              { value: 'internship', label: 'Pasantía' }
            ]
          },
          {
            id: 'modality',
            type: 'select',
            label: 'Modalidad',
            options: [
              { value: 'onSite', label: 'Presencial' },
              { value: 'remote', label: 'Remoto' },
              { value: 'hybrid', label: 'Híbrido' }
            ]
          }
        ]
      },
      {
        title: 'Requisitos',
        filters: [
          {
            id: 'experience',
            type: 'select',
            label: 'Experiencia',
            options: [
              { value: 'noExp', label: 'Sin experiencia' },
              { value: '1-2', label: '1-2 años' },
              { value: '3-5', label: '3-5 años' },
              { value: '5+', label: 'Más de 5 años' }
            ]
          },
          {
            id: 'education',
            type: 'select',
            label: 'Educación',
            options: [
              { value: 'highSchool', label: 'Secundaria' },
              { value: 'technical', label: 'Técnico' },
              { value: 'bachelor', label: 'Universidad' },
              { value: 'master', label: 'Maestría' },
              { value: 'phd', label: 'Doctorado' }
            ]
          },
          {
            id: 'skills',
            type: 'multiselect',
            label: 'Habilidades',
            options: [
              { value: 'programming', label: 'Programación' },
              { value: 'design', label: 'Diseño' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'sales', label: 'Ventas' },
              { value: 'management', label: 'Gestión' },
              { value: 'languages', label: 'Idiomas' }
            ]
          }
        ]
      }
    ]
  },
  servicios: {
    title: 'Filtros de Servicios',
    sections: [
      {
        title: 'Categoría de servicio',
        filters: [
          {
            id: 'serviceType',
            type: 'select',
            label: 'Tipo de servicio',
            options: [
              { value: 'professional', label: 'Profesional' },
              { value: 'home', label: 'Hogar' },
              { value: 'technical', label: 'Técnico' },
              { value: 'education', label: 'Educación' },
              { value: 'health', label: 'Salud' },
              { value: 'legal', label: 'Legal' }
            ]
          },
          {
            id: 'price',
            type: 'range',
            label: 'Precio estimado',
            min: 0,
            max: 5000,
            step: 50,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'availability',
            type: 'select',
            label: 'Disponibilidad',
            options: [
              { value: 'immediate', label: 'Inmediata' },
              { value: 'scheduled', label: 'Programada' },
              { value: 'weekends', label: 'Fines de semana' },
              { value: 'flexible', label: 'Horario flexible' }
            ]
          }
        ]
      },
      {
        title: 'Detalles',
        filters: [
          {
            id: 'experience',
            type: 'select',
            label: 'Experiencia',
            options: [
              { value: '1', label: 'Menos de 1 año' },
              { value: '1-3', label: '1-3 años' },
              { value: '3-5', label: '3-5 años' },
              { value: '5+', label: 'Más de 5 años' }
            ]
          },
          {
            id: 'ratings',
            type: 'select',
            label: 'Valoraciones',
            options: [
              { value: '5', label: '5 estrellas' },
              { value: '4+', label: '4+ estrellas' },
              { value: '3+', label: '3+ estrellas' }
            ]
          },
          {
            id: 'serviceFeatures',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'certified', label: 'Profesional certificado' },
              { value: 'warranty', label: 'Con garantía' },
              { value: 'insurance', label: 'Con seguro' },
              { value: 'emergency', label: 'Servicio de emergencia' }
            ]
          }
        ]
      }
    ]
  },
  productos: {
    title: 'Filtros de Productos',
    sections: [
      {
        title: 'Características básicas',
        filters: [
          {
            id: 'price',
            type: 'range',
            label: 'Precio',
            min: 0,
            max: 10000,
            step: 50,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'condition',
            type: 'select',
            label: 'Estado',
            options: [
              { value: 'new', label: 'Nuevo' },
              { value: 'likeNew', label: 'Como nuevo' },
              { value: 'good', label: 'Buen estado' },
              { value: 'used', label: 'Usado' }
            ]
          },
          {
            id: 'warranty',
            type: 'select',
            label: 'Garantía',
            options: [
              { value: 'yes', label: 'Con garantía' },
              { value: 'no', label: 'Sin garantía' }
            ]
          }
        ]
      },
      {
        title: 'Detalles de venta',
        filters: [
          {
            id: 'delivery',
            type: 'select',
            label: 'Entrega',
            options: [
              { value: 'local', label: 'Entrega local' },
              { value: 'shipping', label: 'Envío nacional' },
              { value: 'pickup', label: 'Recogida en tienda' }
            ]
          },
          {
            id: 'paymentMethods',
            type: 'multiselect',
            label: 'Métodos de pago',
            options: [
              { value: 'cash', label: 'Efectivo' },
              { value: 'card', label: 'Tarjeta' },
              { value: 'transfer', label: 'Transferencia' },
              { value: 'crypto', label: 'Criptomonedas' }
            ]
          },
          {
            id: 'productFeatures',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'original', label: 'Original' },
              { value: 'limited', label: 'Edición limitada' },
              { value: 'handmade', label: 'Hecho a mano' },
              { value: 'eco', label: 'Ecológico' }
            ]
          }
        ]
      }
    ]
  },
  eventos: {
    title: 'Filtros de Eventos',
    sections: [
      {
        title: 'Información básica',
        filters: [
          {
            id: 'eventType',
            type: 'select',
            label: 'Tipo de evento',
            options: [
              { value: 'concert', label: 'Concierto' },
              { value: 'theater', label: 'Teatro' },
              { value: 'conference', label: 'Conferencia' },
              { value: 'workshop', label: 'Taller' },
              { value: 'festival', label: 'Festival' },
              { value: 'sport', label: 'Deportivo' }
            ]
          },
          {
            id: 'price',
            type: 'range',
            label: 'Precio de entrada',
            min: 0,
            max: 2000,
            step: 10,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'date',
            type: 'select',
            label: 'Fecha',
            options: [
              { value: 'today', label: 'Hoy' },
              { value: 'tomorrow', label: 'Mañana' },
              { value: 'weekend', label: 'Este fin de semana' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' }
            ]
          }
        ]
      },
      {
        title: 'Detalles',
        filters: [
          {
            id: 'audience',
            type: 'select',
            label: 'Audiencia',
            options: [
              { value: 'all', label: 'Todo público' },
              { value: 'adults', label: 'Adultos' },
              { value: 'family', label: 'Familiar' },
              { value: 'children', label: 'Infantil' }
            ]
          },
          {
            id: 'featuredArtists',
            type: 'toggle',
            label: 'Con artistas destacados'
          },
          {
            id: 'eventFeatures',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'parking', label: 'Estacionamiento' },
              { value: 'food', label: 'Comida y bebida' },
              { value: 'accessible', label: 'Accesible para discapacitados' },
              { value: 'vip', label: 'Experiencia VIP' }
            ]
          }
        ]
      }
    ]
  },
  comunidad: {
    title: 'Filtros de Comunidad',
    sections: [
      {
        title: 'Tipo de publicación',
        filters: [
          {
            id: 'postType',
            type: 'select',
            label: 'Tipo',
            options: [
              { value: 'meetup', label: 'Encuentro' },
              { value: 'volunteer', label: 'Voluntariado' },
              { value: 'classes', label: 'Clases' },
              { value: 'lost', label: 'Perdido y encontrado' },
              { value: 'free', label: 'Gratis o trueque' }
            ]
          },
          {
            id: 'availability',
            type: 'select',
            label: 'Disponibilidad',
            options: [
              { value: 'today', label: 'Hoy' },
              { value: 'weekdays', label: 'Entre semana' },
              { value: 'weekends', label: 'Fines de semana' },
              { value: 'evenings', label: 'Tardes/Noches' }
            ]
          }
        ]
      },
      {
        title: 'Detalles',
        filters: [
          {
            id: 'targetAudience',
            type: 'select',
            label: 'Dirigido a',
            options: [
              { value: 'all', label: 'Todos' },
              { value: 'adults', label: 'Adultos' },
              { value: 'seniors', label: 'Mayores' },
              { value: 'youth', label: 'Jóvenes' },
              { value: 'families', label: 'Familias' }
            ]
          },
          {
            id: 'language',
            type: 'select',
            label: 'Idioma',
            options: [
              { value: 'spanish', label: 'Español' },
              { value: 'english', label: 'Inglés' },
              { value: 'bilingual', label: 'Bilingüe' },
              { value: 'other', label: 'Otros' }
            ]
          },
          {
            id: 'communityFeatures',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'regular', label: 'Actividad regular' },
              { value: 'onetime', label: 'Única vez' },
              { value: 'certified', label: 'Organización certificada' },
              { value: 'accessible', label: 'Accesible' }
            ]
          }
        ]
      }
    ]
  },
  negocios: {
    title: 'Filtros de Negocios',
    sections: [
      {
        title: 'Información básica',
        filters: [
          {
            id: 'businessType',
            type: 'select',
            label: 'Tipo de negocio',
            options: [
              { value: 'sale', label: 'Venta de negocio' },
              { value: 'franchise', label: 'Franquicia' },
              { value: 'investment', label: 'Oportunidad de inversión' },
              { value: 'partnership', label: 'Búsqueda de socio' },
              { value: 'retail', label: 'Local comercial' }
            ]
          },
          {
            id: 'investment',
            type: 'range',
            label: 'Inversión requerida',
            min: 0,
            max: 1000000,
            step: 10000,
            format: (value: number) => `$${value.toLocaleString()}`
          },
          {
            id: 'sector',
            type: 'select',
            label: 'Sector',
            options: [
              { value: 'food', label: 'Alimentación' },
              { value: 'retail', label: 'Venta minorista' },
              { value: 'services', label: 'Servicios' },
              { value: 'tech', label: 'Tecnología' },
              { value: 'manufacturing', label: 'Manufactura' }
            ]
          }
        ]
      },
      {
        title: 'Detalles',
        filters: [
          {
            id: 'employees',
            type: 'select',
            label: 'Número de empleados',
            options: [
              { value: '1-5', label: '1-5 empleados' },
              { value: '6-20', label: '6-20 empleados' },
              { value: '21-50', label: '21-50 empleados' },
              { value: '50+', label: 'Más de 50 empleados' }
            ]
          },
          {
            id: 'established',
            type: 'select',
            label: 'Años de establecimiento',
            options: [
              { value: 'new', label: 'Nuevo negocio' },
              { value: '1-3', label: '1-3 años' },
              { value: '3-10', label: '3-10 años' },
              { value: '10+', label: 'Más de 10 años' }
            ]
          },
          {
            id: 'businessFeatures',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'profitable', label: 'Rentable' },
              { value: 'established', label: 'Bien establecido' },
              { value: 'growth', label: 'Con potencial de crecimiento' },
              { value: 'online', label: 'Presencia online' },
              { value: 'loyal', label: 'Clientes leales' }
            ]
          }
        ]
      }
    ]
  }
} 