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
            max: 2000000,
            step: 5000,
            format: (value: number) => `S/ ${value.toLocaleString()}`
          },
          {
            id: 'propertyType',
            type: 'select',
            label: 'Tipo de propiedad',
            options: [
              { value: 'house', label: 'Casa' },
              { value: 'apartment', label: 'Departamento' },
              { value: 'land', label: 'Terreno' },
              { value: 'commercial', label: 'Local comercial' },
              { value: 'office', label: 'Oficina' },
              { value: 'warehouse', label: 'Almacén' },
              { value: 'room', label: 'Habitación' },
              { value: 'studio', label: 'Estudio' }
            ]
          },
          {
            id: 'operation',
            type: 'select',
            label: 'Operación',
            options: [
              { value: 'sale', label: 'Venta' },
              { value: 'rent', label: 'Alquiler' },
              { value: 'temporary', label: 'Temporal' },
              { value: 'anticresis', label: 'Anticrético' }
            ]
          },
          {
            id: 'district',
            type: 'select',
            label: 'Distrito',
            options: [
              { value: 'cusco', label: 'Cusco' },
              { value: 'wanchaq', label: 'Wanchaq' },
              { value: 'san-sebastian', label: 'San Sebastián' },
              { value: 'san-jeronimo', label: 'San Jerónimo' },
              { value: 'santiago', label: 'Santiago' },
              { value: 'saylla', label: 'Saylla' },
              { value: 'poroy', label: 'Poroy' },
              { value: 'ccorca', label: 'Ccorca' }
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
            label: 'Dormitorios',
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5+', label: '5 o más' }
            ]
          },
          {
            id: 'bathrooms',
            type: 'select',
            label: 'Baños',
            options: [
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4+', label: '4 o más' }
            ]
          },
          {
            id: 'area',
            type: 'range',
            label: 'Área (m²)',
            min: 20,
            max: 1000,
            step: 10,
            format: (value: number) => `${value}m²`
          },
          {
            id: 'floors',
            type: 'select',
            label: 'Pisos',
            options: [
              { value: '1', label: '1 piso' },
              { value: '2', label: '2 pisos' },
              { value: '3', label: '3 pisos' },
              { value: '4+', label: '4 o más pisos' }
            ]
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
              { value: 'furnished', label: 'Amueblado' },
              { value: 'elevator', label: 'Ascensor' },
              { value: 'terrace', label: 'Terraza' },
              { value: 'laundry', label: 'Lavandería' },
              { value: 'storage', label: 'Depósito' }
            ]
          },
          {
            id: 'condition',
            type: 'select',
            label: 'Estado',
            options: [
              { value: 'new', label: 'Nuevo' },
              { value: 'excellent', label: 'Excelente' },
              { value: 'good', label: 'Bueno' },
              { value: 'needs-repair', label: 'Necesita reparación' },
              { value: 'under-construction', label: 'En construcción' }
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
            min: 5000,
            max: 200000,
            step: 1000,
            format: (value: number) => `S/ ${value.toLocaleString()}`
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
              { value: 'nissan', label: 'Nissan' },
              { value: 'hyundai', label: 'Hyundai' },
              { value: 'kia', label: 'Kia' },
              { value: 'suzuki', label: 'Suzuki' },
              { value: 'volkswagen', label: 'Volkswagen' },
              { value: 'mazda', label: 'Mazda' }
            ]
          },
          {
            id: 'model',
            type: 'select',
            label: 'Modelo',
            options: [
              { value: 'corolla', label: 'Corolla' },
              { value: 'camry', label: 'Camry' },
              { value: 'civic', label: 'Civic' },
              { value: 'accord', label: 'Accord' },
              { value: 'fiesta', label: 'Fiesta' },
              { value: 'focus', label: 'Focus' },
              { value: 'aveo', label: 'Aveo' },
              { value: 'cruze', label: 'Cruze' }
            ]
          },
          {
            id: 'year',
            type: 'range',
            label: 'Año',
            min: 2000,
            max: new Date().getFullYear(),
            step: 1,
            format: (value: number) => value.toString()
          }
        ]
      },
      {
        title: 'Características técnicas',
        filters: [
          {
            id: 'transmission',
            type: 'select',
            label: 'Transmisión',
            options: [
              { value: 'automatic', label: 'Automática' },
              { value: 'manual', label: 'Manual' },
              { value: 'cvt', label: 'CVT' }
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
              { value: 'hybrid', label: 'Híbrido' },
              { value: 'glp', label: 'GLP' }
            ]
          },
          {
            id: 'mileage',
            type: 'range',
            label: 'Kilometraje',
            min: 0,
            max: 300000,
            step: 5000,
            format: (value: number) => `${value.toLocaleString()} km`
          },
          {
            id: 'engine',
            type: 'select',
            label: 'Motor',
            options: [
              { value: '1.0', label: '1.0L' },
              { value: '1.3', label: '1.3L' },
              { value: '1.5', label: '1.5L' },
              { value: '1.6', label: '1.6L' },
              { value: '1.8', label: '1.8L' },
              { value: '2.0', label: '2.0L' },
              { value: '2.5+', label: '2.5L o más' }
            ]
          }
        ]
      },
      {
        title: 'Equipamiento',
        filters: [
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'ac', label: 'Aire acondicionado' },
              { value: 'airbags', label: 'Airbags' },
              { value: 'abs', label: 'ABS' },
              { value: 'bluetooth', label: 'Bluetooth' },
              { value: 'camera', label: 'Cámara de retroceso' },
              { value: 'gps', label: 'GPS' },
              { value: 'cruise-control', label: 'Control crucero' },
              { value: 'leather', label: 'Asientos de cuero' },
              { value: 'sunroof', label: 'Techo solar' },
              { value: 'alloy-wheels', label: 'Llantas de aleación' }
            ]
          },
          {
            id: 'condition',
            type: 'select',
            label: 'Estado',
            options: [
              { value: 'new', label: 'Nuevo' },
              { value: 'excellent', label: 'Excelente' },
              { value: 'good', label: 'Bueno' },
              { value: 'fair', label: 'Regular' },
              { value: 'needs-repair', label: 'Necesita reparación' }
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
            min: 930,
            max: 15000,
            step: 100,
            format: (value: number) => `S/ ${value.toLocaleString()}`
          },
          {
            id: 'jobType',
            type: 'select',
            label: 'Tipo de empleo',
            options: [
              { value: 'fullTime', label: 'Tiempo completo' },
              { value: 'partTime', label: 'Medio tiempo' },
              { value: 'temporary', label: 'Temporal' },
              { value: 'contract', label: 'Por contrato' },
              { value: 'internship', label: 'Prácticas' },
              { value: 'freelance', label: 'Freelance' },
              { value: 'remote', label: 'Remoto' }
            ]
          },
          {
            id: 'workMode',
            type: 'select',
            label: 'Modalidad',
            options: [
              { value: 'presential', label: 'Presencial' },
              { value: 'remote', label: 'Remoto' },
              { value: 'hybrid', label: 'Híbrido' },
              { value: 'flexible', label: 'Flexible' }
            ]
          },
          {
            id: 'sector',
            type: 'select',
            label: 'Sector',
            options: [
              { value: 'technology', label: 'Tecnología' },
              { value: 'tourism', label: 'Turismo' },
              { value: 'gastronomy', label: 'Gastronomía' },
              { value: 'education', label: 'Educación' },
              { value: 'healthcare', label: 'Salud' },
              { value: 'retail', label: 'Comercio' },
              { value: 'construction', label: 'Construcción' },
              { value: 'finance', label: 'Finanzas' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'agriculture', label: 'Agricultura' }
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
              { value: 'none', label: 'Sin experiencia' },
              { value: '0-1', label: 'Menos de 1 año' },
              { value: '1-2', label: '1-2 años' },
              { value: '3-5', label: '3-5 años' },
              { value: '5-10', label: '5-10 años' },
              { value: '10+', label: 'Más de 10 años' }
            ]
          },
          {
            id: 'education',
            type: 'select',
            label: 'Educación',
            options: [
              { value: 'none', label: 'Sin requisitos' },
              { value: 'highSchool', label: 'Secundaria completa' },
              { value: 'technical', label: 'Técnico' },
              { value: 'bachelor', label: 'Universitario' },
              { value: 'master', label: 'Maestría' },
              { value: 'phd', label: 'Doctorado' }
            ]
          },
          {
            id: 'languages',
            type: 'multiselect',
            label: 'Idiomas',
            options: [
              { value: 'spanish', label: 'Español' },
              { value: 'english', label: 'Inglés' },
              { value: 'quechua', label: 'Quechua' },
              { value: 'portuguese', label: 'Portugués' },
              { value: 'french', label: 'Francés' },
              { value: 'german', label: 'Alemán' }
            ]
          },
          {
            id: 'skills',
            type: 'multiselect',
            label: 'Habilidades',
            options: [
              { value: 'programming', label: 'Programación' },
              { value: 'design', label: 'Diseño' },
              { value: 'marketing', label: 'Marketing digital' },
              { value: 'sales', label: 'Ventas' },
              { value: 'management', label: 'Gestión' },
              { value: 'customer-service', label: 'Atención al cliente' },
              { value: 'accounting', label: 'Contabilidad' },
              { value: 'teaching', label: 'Enseñanza' },
              { value: 'cooking', label: 'Cocina' },
              { value: 'driving', label: 'Conducir' }
            ]
          }
        ]
      },
      {
        title: 'Beneficios',
        filters: [
          {
            id: 'benefits',
            type: 'multiselect',
            label: 'Beneficios',
            options: [
              { value: 'health-insurance', label: 'Seguro de salud' },
              { value: 'food-allowance', label: 'Subsidio alimentario' },
              { value: 'transport', label: 'Transporte' },
              { value: 'bonus', label: 'Bonificaciones' },
              { value: 'vacation', label: 'Vacaciones extras' },
              { value: 'training', label: 'Capacitación' },
              { value: 'career-growth', label: 'Línea de carrera' },
              { value: 'flexible-hours', label: 'Horarios flexibles' }
            ]
          },
          {
            id: 'urgency',
            type: 'select',
            label: 'Urgencia',
            options: [
              { value: 'immediate', label: 'Inmediato' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' },
              { value: 'not-urgent', label: 'No urgente' }
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
              { value: 'home', label: 'Hogar y mantenimiento' },
              { value: 'technical', label: 'Técnico' },
              { value: 'education', label: 'Educación' },
              { value: 'health', label: 'Salud y bienestar' },
              { value: 'legal', label: 'Legal y administrativo' },
              { value: 'beauty', label: 'Belleza y estética' },
              { value: 'transport', label: 'Transporte' },
              { value: 'events', label: 'Eventos' },
              { value: 'consulting', label: 'Consultoría' }
            ]
          },
          {
            id: 'price',
            type: 'range',
            label: 'Precio estimado',
            min: 20,
            max: 5000,
            step: 50,
            format: (value: number) => `S/ ${value.toLocaleString()}`
          },
          {
            id: 'location',
            type: 'select',
            label: 'Ubicación del servicio',
            options: [
              { value: 'home', label: 'A domicilio' },
              { value: 'office', label: 'En local' },
              { value: 'online', label: 'Online/Virtual' },
              { value: 'flexible', label: 'Flexible' }
            ]
          }
        ]
      },
      {
        title: 'Experiencia y calidad',
        filters: [
          {
            id: 'experience',
            type: 'select',
            label: 'Experiencia',
            options: [
              { value: '0-1', label: 'Menos de 1 año' },
              { value: '1-3', label: '1-3 años' },
              { value: '3-5', label: '3-5 años' },
              { value: '5-10', label: '5-10 años' },
              { value: '10+', label: 'Más de 10 años' }
            ]
          },
          {
            id: 'certifications',
            type: 'multiselect',
            label: 'Certificaciones',
            options: [
              { value: 'certified', label: 'Profesional certificado' },
              { value: 'licensed', label: 'Con licencia' },
              { value: 'insured', label: 'Con seguro' },
              { value: 'verified', label: 'Perfil verificado' }
            ]
          },
          {
            id: 'availability',
            type: 'select',
            label: 'Disponibilidad',
            options: [
              { value: 'immediate', label: 'Inmediata' },
              { value: 'same-day', label: 'Mismo día' },
              { value: 'scheduled', label: 'Programada' },
              { value: 'weekends', label: 'Fines de semana' },
              { value: 'emergency', label: 'Emergencias 24/7' }
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
        title: 'Información básica',
        filters: [
          {
            id: 'price',
            type: 'range',
            label: 'Precio',
            min: 10,
            max: 20000,
            step: 50,
            format: (value: number) => `S/ ${value.toLocaleString()}`
          },
          {
            id: 'category',
            type: 'select',
            label: 'Categoría',
            options: [
              { value: 'electronics', label: 'Electrónicos' },
              { value: 'clothing', label: 'Ropa y accesorios' },
              { value: 'home', label: 'Hogar y jardín' },
              { value: 'sports', label: 'Deportes' },
              { value: 'books', label: 'Libros y educación' },
              { value: 'music', label: 'Música e instrumentos' },
              { value: 'toys', label: 'Juguetes' },
              { value: 'collectibles', label: 'Coleccionables' },
              { value: 'food', label: 'Alimentos y bebidas' },
              { value: 'health', label: 'Salud y belleza' }
            ]
          },
          {
            id: 'condition',
            type: 'select',
            label: 'Estado',
            options: [
              { value: 'new', label: 'Nuevo' },
              { value: 'like-new', label: 'Como nuevo' },
              { value: 'excellent', label: 'Excelente' },
              { value: 'good', label: 'Bueno' },
              { value: 'fair', label: 'Regular' },
              { value: 'for-parts', label: 'Para repuestos' }
            ]
          }
        ]
      },
      {
        title: 'Detalles de venta',
        filters: [
          {
            id: 'warranty',
            type: 'select',
            label: 'Garantía',
            options: [
              { value: 'manufacturer', label: 'Garantía del fabricante' },
              { value: 'store', label: 'Garantía de tienda' },
              { value: 'limited', label: 'Garantía limitada' },
              { value: 'none', label: 'Sin garantía' }
            ]
          },
          {
            id: 'delivery',
            type: 'multiselect',
            label: 'Opciones de entrega',
            options: [
              { value: 'pickup', label: 'Recojo en persona' },
              { value: 'local-delivery', label: 'Delivery local' },
              { value: 'shipping', label: 'Envío nacional' },
              { value: 'express', label: 'Envío express' }
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
              { value: 'yape', label: 'Yape' },
              { value: 'plin', label: 'Plin' },
              { value: 'paypal', label: 'PayPal' }
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
        title: 'Información del evento',
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
              { value: 'sport', label: 'Evento deportivo' },
              { value: 'exhibition', label: 'Exposición' },
              { value: 'party', label: 'Fiesta/Celebración' },
              { value: 'cultural', label: 'Cultural' },
              { value: 'educational', label: 'Educativo' }
            ]
          },
          {
            id: 'price',
            type: 'range',
            label: 'Precio de entrada',
            min: 0,
            max: 500,
            step: 10,
            format: (value: number) => `S/ ${value.toLocaleString()}`
          },
          {
            id: 'date',
            type: 'select',
            label: 'Cuándo',
            options: [
              { value: 'today', label: 'Hoy' },
              { value: 'tomorrow', label: 'Mañana' },
              { value: 'weekend', label: 'Este fin de semana' },
              { value: 'week', label: 'Esta semana' },
              { value: 'month', label: 'Este mes' },
              { value: 'upcoming', label: 'Próximamente' }
            ]
          },
          {
            id: 'timeOfDay',
            type: 'select',
            label: 'Horario',
            options: [
              { value: 'morning', label: 'Mañana (6am-12pm)' },
              { value: 'afternoon', label: 'Tarde (12pm-6pm)' },
              { value: 'evening', label: 'Noche (6pm-12am)' },
              { value: 'late-night', label: 'Madrugada (12am-6am)' }
            ]
          }
        ]
      },
      {
        title: 'Características',
        filters: [
          {
            id: 'audience',
            type: 'select',
            label: 'Audiencia',
            options: [
              { value: 'all-ages', label: 'Todas las edades' },
              { value: 'adults', label: 'Solo adultos (+18)' },
              { value: 'family', label: 'Familiar' },
              { value: 'children', label: 'Niños' },
              { value: 'teens', label: 'Adolescentes' }
            ]
          },
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'free', label: 'Entrada gratuita' },
              { value: 'food', label: 'Incluye comida' },
              { value: 'drinks', label: 'Incluye bebidas' },
              { value: 'parking', label: 'Estacionamiento' },
              { value: 'live-music', label: 'Música en vivo' },
              { value: 'outdoor', label: 'Al aire libre' },
              { value: 'accessible', label: 'Accesible' }
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
        title: 'Tipo de anuncio',
        filters: [
          {
            id: 'communityType',
            type: 'select',
            label: 'Categoría',
            options: [
              { value: 'lost-found', label: 'Perdidos y encontrados' },
              { value: 'exchange', label: 'Intercambio' },
              { value: 'donation', label: 'Donaciones' },
              { value: 'volunteer', label: 'Voluntariado' },
              { value: 'groups', label: 'Grupos y clubes' },
              { value: 'announcements', label: 'Anuncios generales' },
              { value: 'recommendations', label: 'Recomendaciones' },
              { value: 'rideshare', label: 'Compartir viajes' },
              { value: 'housing', label: 'Búsqueda de roommates' },
              { value: 'pets', label: 'Mascotas' }
            ]
          },
          {
            id: 'urgency',
            type: 'select',
            label: 'Urgencia',
            options: [
              { value: 'urgent', label: 'Urgente' },
              { value: 'important', label: 'Importante' },
              { value: 'normal', label: 'Normal' },
              { value: 'low', label: 'Baja prioridad' }
            ]
          },
          {
            id: 'area',
            type: 'select',
            label: 'Área de interés',
            options: [
              { value: 'centro', label: 'Centro histórico' },
              { value: 'san-blas', label: 'San Blas' },
              { value: 'wanchaq', label: 'Wanchaq' },
              { value: 'san-sebastian', label: 'San Sebastián' },
              { value: 'santiago', label: 'Santiago' },
              { value: 'all-cusco', label: 'Todo Cusco' }
            ]
          }
        ]
      },
      {
        title: 'Características',
        filters: [
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'free', label: 'Gratuito' },
              { value: 'verified', label: 'Usuario verificado' },
              { value: 'photos', label: 'Con fotos' },
              { value: 'contact-info', label: 'Información de contacto' },
              { value: 'recurring', label: 'Evento recurrente' },
              { value: 'reward', label: 'Ofrece recompensa' }
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
        title: 'Tipo de oportunidad',
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
              { value: 'retail', label: 'Local comercial' },
              { value: 'restaurant', label: 'Restaurante/Bar' },
              { value: 'online', label: 'Negocio online' },
              { value: 'service', label: 'Empresa de servicios' }
            ]
          },
          {
            id: 'investment',
            type: 'range',
            label: 'Inversión requerida',
            min: 1000,
            max: 500000,
            step: 5000,
            format: (value: number) => `S/ ${value.toLocaleString()}`
          },
          {
            id: 'sector',
            type: 'select',
            label: 'Sector',
            options: [
              { value: 'food', label: 'Gastronomía' },
              { value: 'retail', label: 'Retail/Comercio' },
              { value: 'services', label: 'Servicios' },
              { value: 'tech', label: 'Tecnología' },
              { value: 'tourism', label: 'Turismo' },
              { value: 'education', label: 'Educación' },
              { value: 'health', label: 'Salud' },
              { value: 'manufacturing', label: 'Manufactura' },
              { value: 'agriculture', label: 'Agricultura' },
              { value: 'transport', label: 'Transporte' }
            ]
          }
        ]
      },
      {
        title: 'Características del negocio',
        filters: [
          {
            id: 'employees',
            type: 'select',
            label: 'Número de empleados',
            options: [
              { value: 'solo', label: 'Solo propietario' },
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
              { value: 'new', label: 'Negocio nuevo' },
              { value: '1-3', label: '1-3 años' },
              { value: '3-5', label: '3-5 años' },
              { value: '5-10', label: '5-10 años' },
              { value: '10+', label: 'Más de 10 años' }
            ]
          },
          {
            id: 'revenue',
            type: 'range',
            label: 'Ingresos mensuales',
            min: 2000,
            max: 100000,
            step: 2000,
            format: (value: number) => `S/ ${value.toLocaleString()}`
          },
          {
            id: 'features',
            type: 'multiselect',
            label: 'Características',
            options: [
              { value: 'profitable', label: 'Rentable' },
              { value: 'established', label: 'Bien establecido' },
              { value: 'growth', label: 'Potencial de crecimiento' },
              { value: 'online', label: 'Presencia online' },
              { value: 'loyal-customers', label: 'Clientes leales' },
              { value: 'prime-location', label: 'Ubicación privilegiada' },
              { value: 'equipment-included', label: 'Incluye equipamiento' },
              { value: 'training-provided', label: 'Incluye capacitación' }
            ]
          }
        ]
      }
    ]
  }
} 