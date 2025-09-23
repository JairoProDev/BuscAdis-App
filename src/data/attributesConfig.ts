// Centralized attributes catalog and controlled vocabularies for Buscadis

export type AttributeFieldType = 'select' | 'number' | 'text' | 'checkbox' | 'textarea' | 'date'

export interface AttributeOption {
  value: string
  label: string
}

export interface AttributeField {
  key: string
  label: string
  type: AttributeFieldType
  required?: boolean
  placeholder?: string
  unit?: string
  options?: AttributeOption[]
}

export type CategoryKey =
  | 'inmuebles'
  | 'vehiculos'
  | 'empleos'
  | 'productos'
  | 'servicios'
  | 'eventos'
  | 'negocios'
  | 'comunidad'

export type AttributesCatalog = Record<CategoryKey, ReadonlyArray<AttributeField>>

export const ATTRIBUTES_CONFIG: AttributesCatalog = {
  // A. Inmuebles
  inmuebles: [
    { key: 'tipoPropiedad', label: 'Tipo de Propiedad', type: 'select', required: true, options: [
      { value: 'departamento', label: 'Departamento' },
      { value: 'habitacion', label: 'Habitación' },
      { value: 'casa', label: 'Casa' },
      { value: 'terreno_lote', label: 'Terreno / Lote' },
      { value: 'local_comercial', label: 'Local Comercial' },
      { value: 'oficina', label: 'Oficina' },
      { value: 'edificio', label: 'Edificio' },
      { value: 'local_industrial', label: 'Local Industrial / Almacén' },
      { value: 'terreno_agricola', label: 'Terreno Agrícola' },
      { value: 'casa_de_campo', label: 'Casa de Campo / Playa' }
    ]},
    { key: 'tipoOperacion', label: 'Tipo de Operación', type: 'select', required: true, options: [
      { value: 'alquiler', label: 'Alquiler' },
      { value: 'venta', label: 'Venta' },
      { value: 'anticresis', label: 'Anticresis' },
      { value: 'traspaso', label: 'Traspaso' },
      { value: 'alquiler_temporal', label: 'Alquiler Temporal' }
    ]},
    // Distribución
    { key: 'habitaciones', label: 'Habitaciones', type: 'number', placeholder: 'Ej: 3' },
    { key: 'banos', label: 'Baños', type: 'number', placeholder: 'Ej: 2' },
    { key: 'mediosBanos', label: 'Medios Baños (Visita)', type: 'number', placeholder: 'Ej: 1' },
    { key: 'estacionamientos', label: 'Estacionamientos', type: 'number', placeholder: 'Ej: 2' },
    // Superficie
    { key: 'areaTotal', label: 'Área Total', type: 'number', placeholder: 'Ej: 120', unit: 'm²' },
    { key: 'areaConstruida', label: 'Área Construida', type: 'number', placeholder: 'Ej: 90', unit: 'm²' },
    // Antigüedad y estado
    { key: 'antiguedad', label: 'Antigüedad', type: 'select', options: [
      { value: 'a_estrenar', label: 'A estrenar' },
      { value: 'hasta_5_anios', label: 'Hasta 5 años' },
      { value: 'hasta_10_anios', label: 'Hasta 10 años' },
      { value: 'hasta_20_anios', label: 'Hasta 20 años' },
      { value: 'mas_de_20_anios', label: 'Más de 20 años' }
    ]},
    { key: 'estadoConservacion', label: 'Estado de Conservación', type: 'select', options: [
      { value: 'excelente', label: 'Excelente' },
      { value: 'bueno', label: 'Bueno' },
      { value: 'regular', label: 'Regular' },
      { value: 'a_remodelar', label: 'A remodelar' }
    ]},
    // Comodidades
    { key: 'amoblado', label: 'Amoblado', type: 'checkbox' },
    { key: 'closets', label: 'Closets', type: 'checkbox' },
    { key: 'ascensor', label: 'Ascensor', type: 'checkbox' },
    { key: 'terraza_balcon', label: 'Terraza / Balcón', type: 'checkbox' },
    { key: 'jardin', label: 'Jardín', type: 'checkbox' },
    { key: 'piscina', label: 'Piscina', type: 'checkbox' },
    { key: 'gimnasio', label: 'Gimnasio', type: 'checkbox' },
    { key: 'seguridad_24h', label: 'Seguridad 24h', type: 'checkbox' },
    { key: 'se_permiten_mascotas', label: 'Se permiten mascotas', type: 'checkbox' }
  ],

  // B. Vehículos
  vehiculos: [
    { key: 'tipoVehiculo', label: 'Tipo de Vehículo', type: 'select', required: true, options: [
      { value: 'auto', label: 'Auto' },
      { value: 'camioneta_suv', label: 'Camioneta SUV' },
      { value: 'camioneta_pickup', label: 'Camioneta Pick-up' },
      { value: 'moto', label: 'Moto' },
      { value: 'bicicleta', label: 'Bicicleta' },
      { value: 'camion_bus', label: 'Camión / Bus' },
      { value: 'maquinaria_pesada', label: 'Maquinaria Pesada' }
    ]},
    { key: 'condicion', label: 'Condición', type: 'select', options: [
      { value: 'nuevo', label: 'Nuevo (0 km)' },
      { value: 'usado', label: 'Usado' },
      { value: 'semi_nuevo', label: 'Semi-nuevo (Menos de 10,000 km)' }
    ]},
    // Identificación
    { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Toyota' },
    { key: 'modelo', label: 'Modelo', type: 'text', placeholder: 'Ej: Hilux' },
    { key: 'version', label: 'Versión', type: 'text', placeholder: 'Ej: SRV 4x4' },
    { key: 'anio', label: 'Año de Fabricación', type: 'number', placeholder: 'Ej: 2023' },
    { key: 'color', label: 'Color', type: 'text', placeholder: 'Ej: Rojo Metálico' },
    // Mecánica
    { key: 'kilometraje', label: 'Kilometraje', type: 'number', placeholder: 'Ej: 45000', unit: 'km' },
    { key: 'motor', label: 'Cilindrada del Motor', type: 'text', placeholder: 'Ej: 2.8L' },
    { key: 'tipoCombustible', label: 'Combustible', type: 'select', options: [
      { value: 'gasolina', label: 'Gasolina' }, { value: 'petroleo', label: 'Petróleo (Diesel)' },
      { value: 'glp', label: 'GLP' }, { value: 'gnv', label: 'GNV' },
      { value: 'electrico', label: 'Eléctrico' }, { value: 'hibrido', label: 'Híbrido' }
    ]},
    { key: 'tipoTransmision', label: 'Transmisión', type: 'select', options: [
      { value: 'mecanica', label: 'Mecánica' }, { value: 'automatica', label: 'Automática' },
      { value: 'semiautomatica', label: 'Semi-Automática / Secuencial' }
    ]},
    { key: 'traccion', label: 'Tracción', type: 'select', options: [
      { value: 'delantera', label: 'Delantera (FWD)' }, { value: 'trasera', label: 'Trasera (RWD)' },
      { value: '4x4', label: '4x4 / AWD' }
    ]},
    // Historial
    { key: 'unicoDueno', label: 'Único Dueño', type: 'checkbox' },
    { key: 'mantenimientos', label: 'Mantenimientos en concesionario', type: 'checkbox' },
    { key: 'placa', label: 'Terminación de Placa', type: 'text', placeholder: 'Ej: ...-8' }
  ],

  // C. Empleos
  empleos: [
    { key: 'area', label: 'Área', type: 'select', options: [
      { value: 'ventas', label: 'Ventas y Comercial' },
      { value: 'admin', label: 'Administración y Oficina' },
      { value: 'tecnologia', label: 'Tecnología y Sistemas' },
      { value: 'marketing', label: 'Marketing y Comunicaciones' },
      { value: 'salud', label: 'Salud y Medicina' },
      { value: 'educacion', label: 'Educación' },
      { value: 'gastronomia', label: 'Gastronomía y Turismo' },
      { value: 'produccion', label: 'Producción y Operarios' },
      { value: 'construccion', label: 'Construcción' },
      { value: 'otros', label: 'Otros' }
    ]},
    { key: 'tipoContrato', label: 'Tipo de Contrato', type: 'select', options: [
      { value: 'full_time', label: 'Tiempo Completo' },
      { value: 'part_time', label: 'Medio Tiempo' },
      { value: 'freelance', label: 'Freelance / Proyecto' },
      { value: 'internship', label: 'Prácticas' }
    ]},
    { key: 'modalidad', label: 'Modalidad de Trabajo', type: 'select', options: [
      { value: 'presencial', label: 'Presencial' },
      { value: 'remoto', label: 'Remoto' },
      { value: 'hibrido', label: 'Híbrido' }
    ]},
    // Requisitos
    { key: 'experienciaMinima', label: 'Experiencia Mínima', type: 'select', options: [
      { value: 'sin_experiencia', label: 'Sin Experiencia' },
      { value: '1_anio', label: '1 Año' },
      { value: '2_anios', label: '2 Años' },
      { value: '3_anios', label: '3+ Años' },
      { value: '5_anios', label: '5+ Años' }
    ]},
    { key: 'nivelEducativo', label: 'Nivel Educativo', type: 'select', options: [
      { value: 'secundaria', label: 'Secundaria Completa' },
      { value: 'tecnico', label: 'Técnico / Egresado' },
      { value: 'universitario', label: 'Universitario / Egresado' },
      { value: 'postgrado', label: 'Postgrado / Maestría' }
    ]},
    { key: 'idiomas', label: 'Idiomas Requeridos', type: 'text', placeholder: 'Ej: Inglés Intermedio' },
    // Compensación
    { key: 'salarioOfrecido', label: 'Salario Ofrecido', type: 'text', placeholder: 'Ej: 2500 PEN o "A tratar"' },
    { key: 'enPlanilla', label: 'En Planilla', type: 'checkbox' },
    { key: 'seguroSalud', label: 'Seguro de Salud (EPS)', type: 'checkbox' },
    { key: 'bonosProductividad', label: 'Bonos por Productividad', type: 'checkbox' },
    { key: 'capacitaciones', label: 'Capacitaciones', type: 'checkbox' }
  ],

  // D. Productos
  productos: [
    { key: 'condicion', label: 'Condición del Producto', type: 'select', options: [
      { value: 'nuevo', label: 'Nuevo' },
      { value: 'usado', label: 'Usado' },
      { value: 'reacondicionado', label: 'Reacondicionado' }
    ]},
    { key: 'marca', label: 'Marca', type: 'text', placeholder: 'Ej: Apple' },
    { key: 'modelo', label: 'Modelo', type: 'text', placeholder: 'Ej: MacBook Pro 14"' },
    { key: 'ubicacionProducto', label: 'Ubicación del Producto', type: 'text', placeholder: 'Para recojo' },
    { key: 'deliveryDisponible', label: 'Delivery Disponible', type: 'checkbox' },
    { key: 'garantia', label: 'Garantía', type: 'text', placeholder: 'Ej: 6 meses con boleta' }
  ],

  // E. Servicios
  servicios: [
    { key: 'modalidadServicio', label: 'Modalidad', type: 'select', options: [
      { value: 'a_domicilio', label: 'A Domicilio' },
      { value: 'en_local', label: 'En mi Local' },
      { value: 'online', label: 'Online / Remoto' }
    ]},
    { key: 'experiencia', label: 'Años de Experiencia', type: 'number', placeholder: 'Ej: 10', unit: 'años' },
    { key: 'certificaciones', label: 'Certificaciones', type: 'textarea', placeholder: 'Menciona tus certificaciones relevantes...' },
    { key: 'areaCobertura', label: 'Área de Cobertura', type: 'text', placeholder: 'Ej: Cusco Cercado, Wanchaq, San Sebastián' },
    { key: 'emiteFactura', label: 'Emite Factura/Boleta', type: 'checkbox' }
  ],

  // F. Eventos
  eventos: [
    { key: 'categoriaEvento', label: 'Categoría del Evento', type: 'select', options: [
      { value: 'concierto', label: 'Concierto / Música' },
      { value: 'conferencia', label: 'Conferencia / Taller' },
      { value: 'deportivo', label: 'Deportivo' },
      { value: 'teatro_cultural', label: 'Teatro / Cultural' },
      { value: 'feria_festival', label: 'Feria / Festival' },
      { value: 'social_fiesta', label: 'Social / Fiesta' }
    ]},
    { key: 'fechaInicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fechaFin', label: 'Fecha de Fin (opcional)', type: 'date' },
    { key: 'horaInicio', label: 'Hora', type: 'text', placeholder: 'Ej: 7:00 PM' },
    { key: 'lugarEvento', label: 'Lugar', type: 'text', placeholder: 'Ej: Coliseo Cerrado' },
    { key: 'organizador', label: 'Organizador', type: 'text', placeholder: 'Nombre de la empresa o persona' },
    { key: 'tipoEntrada', label: 'Entrada', type: 'select', options: [
      { value: 'gratuito', label: 'Gratuito' },
      { value: 'de_pago', label: 'De Pago' }
    ]}
  ],

  // G. Negocios
  negocios: [
    { key: 'tipoOperacion', label: 'Tipo de Operación', type: 'select', options: [
      { value: 'venta', label: 'En Venta' },
      { value: 'traspaso', label: 'En Traspaso' },
      { value: 'socio', label: 'Buscando Socio' }
    ]},
    { key: 'rubro', label: 'Rubro del Negocio', type: 'text', placeholder: 'Ej: Restaurante, Tienda de Ropa' },
    { key: 'antiguedad', label: 'Años en Operación', type: 'number', placeholder: 'Ej: 5', unit: 'años' },
    { key: 'incluyeLocal', label: 'Incluye Local', type: 'checkbox' },
    { key: 'motivoVenta', label: 'Motivo de Venta/Traspaso', type: 'textarea', placeholder: 'Ej: Viaje, Jubilación...' }
  ],

  // H. Comunidad
  comunidad: [
    { key: 'tipoAdisoComunidad', label: 'Tipo de Adiso', type: 'select', options: [
      { value: 'voluntariado', label: 'Voluntariado' },
      { value: 'grupo_actividad', label: 'Grupo / Actividad' },
      { value: 'debate_opinion', label: 'Debate / Opinión' },
      { value: 'perdido_encontrado', label: 'Perdido y Encontrado' },
      { value: 'donacion', label: 'Donación' }
    ]},
    { key: 'frecuencia', label: 'Frecuencia (si aplica)', type: 'text', placeholder: 'Ej: Todos los sábados' },
    { key: 'lugarEncuentro', label: 'Lugar de Encuentro (si aplica)', type: 'text', placeholder: 'Ej: Plaza de Armas' }
  ]
}

// Controlled vocabularies (enums)
export const STATUS_VALUES = ['active', 'pending_review', 'expired', 'rejected', 'archived'] as const
export type StatusValue = typeof STATUS_VALUES[number]

export const ADVERTISER_TYPES = ['individual', 'company'] as const
export type AdvertiserType = typeof ADVERTISER_TYPES[number]

export const CURRENCIES = ['PEN', 'USD'] as const
export type CurrencyCode = typeof CURRENCIES[number]

export const MEDIA_TYPES = ['image', 'video'] as const
export type MediaType = typeof MEDIA_TYPES[number]

export const SOURCE_TYPES = ['web_form', 'historical_import', 'sales_assisted', 'api_partner'] as const
export type SourceType = typeof SOURCE_TYPES[number]

export const DISTRIBUTION_CHANNELS = [
  'buscadis_platform',
  'facebook_page',
  'instagram_profile',
  'tiktok_profile',
  'whatsapp_groups',
  'telegram_channels',
  'digital_magazine'
] as const
export type DistributionChannel = typeof DISTRIBUTION_CHANNELS[number]

export const MODERATION_STATUSES = ['pending', 'approved', 'rejected', 'flagged'] as const
export type ModerationStatus = typeof MODERATION_STATUSES[number]

// Utility to obtain a map of key -> label across all categories
export function buildGlobalLabelMap(): Record<string, string> {
  const map: Record<string, string> = {};
  (Object.keys(ATTRIBUTES_CONFIG) as CategoryKey[]).forEach((cat: CategoryKey) => {
    ATTRIBUTES_CONFIG[cat].forEach((field: AttributeField) => {
      if (!map[field.key]) {
        map[field.key] = field.label;
      }
    });
  });
  return map;
}



