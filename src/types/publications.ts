// ----- src/types/publication.ts -----

/**
 * Define la estructura para coordenadas geográficas usando GeoJSON Point.
 */
interface GeoJsonPoint {
  type: 'Point';
  /** Array con [longitud, latitud] */
  coordinates: [number, number];
}

/**
 * Interfaz principal para una Publicación (Anuncio Clasificado) en Buscadis.
 * Define todos los campos POTENCIALES. En la práctica (DB, JSON),
 * solo se incluirán los campos con valor, especialmente dentro de 'attributes'.
 */
export interface Publication {
  // --- Identificadores y Metadatos ---
  _id?: string; // Opcional: ObjectId de MongoDB
  publicationId?: string; // Opcional: ID legible/secuencial
  createdAt?: Date; // Fecha de creación (Automático por DB/Backend)
  updatedAt?: Date; // Fecha de actualización (Automático por DB/Backend)
  userId?: string | null; // ID del usuario creador (si aplica)
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'sold' | 'rented'; // Estado actual
  premium: boolean; // ¿Anuncio destacado?
  publicationDate?: Date | null; // Fecha de la publicación original (ej: fecha revista)
  expiryDate?: Date | null; // Fecha de expiración del anuncio (opcional)
  source?: string | null; // Origen ('pdf_import', 'web_user', 'app_user', 'admin_panel')
  viewCount?: number; // Contador de vistas (opcional)

  // --- Contenido Principal ---
  title: string; // Título (Obligatorio)
  description: string; // Descripción (Obligatorio)
  images: string[]; // Array de URLs de imágenes (Obligatorio, puede ser [])
  coverImage?: string | null; // URL imagen principal (opcional, podría ser images[0])

  // --- Clasificación ---
  categorySlug: string; // Slug categoría (Obligatorio)
  subcategorySlug: string; // Slug subcategoría (Obligatorio)
  subSubcategorySlug?: string | null; // Slug sub-subcategoría (Opcional)

  // --- Transacción y Precio ---
  transactionType: string; // 'venta', 'alquiler', 'oferta_empleo', etc. (Obligatorio)
  amount?: number | null; // Monto principal. Null si no aplica/consulta. 0 si es Gratis.
  currency?: 'PEN' | 'USD' | null; // Moneda. Null si amount es null.
  negotiable?: boolean | null; // ¿Precio es negociable?

  // --- Ubicación (Enfocado en Cusco MVP) ---
  location: {
    province: 'Cusco'; // Fijo por ahora
    district?: string | null; // Distrito ('Wanchaq', 'Santiago', etc.)
    address?: string | null; // Dirección específica
    referencePoint?: string | null; // Referencia adicional ("Frente a...")
    coordinates?: GeoJsonPoint | null; // Coordenadas [lon, lat] (Ideal para futuro)
  };

  // --- Contacto ---
  contact: {
    phones: string[]; // Array simple de números (Obligatorio al menos uno)
    email?: string | null; // Correo (Opcional)
    name?: string | null; // Nombre de contacto (Opcional)
    website?: string | null; // Web/Red social (Opcional)
  };

  // --- Tamaño Estimado y Precio Original (Metadata del PDF) ---
  /** Estimación del tamaño del anuncio en la fuente original (0-4, baja fiabilidad). */
  sizeEstimation?: number | null;
  /** Información del precio/formato del anuncio en la revista original. */
  sourceAdInfo?: {
      sizeName: 'Miniatura' | 'Pequeño' | 'Largo Horizontal' | 'Normal' | 'Grande' | 'Otro' | 'Desconocido';
      pricePEN?: number | null; // Precio base en Soles según la lista de precios
      includesRadio?: boolean; // Si el precio incluye la mención en radio
  } | null;

  // --- Atributos Específicos (Objeto Flexible) ---
  /**
   * Contiene detalles específicos de la categoría/subcategoría.
   * IMPORTANTE: Solo incluir keys con valor real. No añadir "key: null".
   * Esta definición lista POSIBILIDADES como guía.
   */
  attributes?: {
    // --- Comunes ---
    condicion?: 'nuevo' | 'usado' | 'reacondicionado' | 'para_repuestos' | string;
    marca?: string;
    modelo?: string;

    // --- Inmuebles ---
    area_m2?: number;
    area_terreno_m2?: number;
    dormitorios?: number;
    banos?: number;
    medios_banos?: number;
    amoblado?: 'si' | 'no' | 'parcial' | string;
    permite_mascotas?: boolean;
    cocheras?: number;
    piso_ubicacion?: number | string;
    cantidad_pisos?: number;
    antiguedad_anos?: number;
    caracteristicas_inmueble?: string[]; // ['ascensor', 'terraza', 'piscina', ...]
    servicios_basicos_disponibles?: boolean;
    documentacion_inmueble?: string[]; // ['titulo_propiedad', 'inscrito_rrpp', ...]

    // --- Vehículos ---
    ano?: number;
    kilometraje?: number;
    tipo_combustible?: 'gasolina' | 'diesel' | 'glp' | 'gnv' | 'electrico' | 'hibrido' | string;
    transmision?: 'manual' | 'automatica' | 'semiautomatica' | string;
    color?: string;
    numero_puertas?: number;
    traccion?: 'delantera' | 'trasera' | '4x4' | 'awd' | string;
    cilindrada_cc?: number;
    uso_vehiculo?: 'personal' | 'taxi' | 'turismo' | 'carga' | string;
    caracteristicas_vehiculo?: string[]; // ['aire_acondicionado', 'sunroof', ...]

    // --- Empleos ---
    tipo_contrato?: 'tiempo_completo' | 'medio_tiempo' | 'temporal' | 'practicas' | 'indefinido' | 'por_proyecto' | 'freelance' | string;
    modalidad_trabajo?: 'presencial' | 'remoto' | 'hibrido' | string;
    nivel_experiencia?: 'sin_experiencia' | 'practicante' | 'junior' | 'semi_senior' | 'senior' | 'experto' | 'gerencial' | string;
    nivel_educacion?: 'primaria' | 'secundaria' | 'tecnico' | 'universitario_incompleto' | 'universitario_completo' | 'maestria' | 'doctorado' | string;
    area_estudio?: string;
    salario_ofrecido?: number; // Puede ser el mismo que 'amount'
    salario_tipo?: 'bruto' | 'neto';
    salario_periodicidad?: 'mensual' | 'quincenal' | 'semanal' | 'por_hora' | string;
    beneficios_laborales?: string[]; // ['planilla', 'comisiones', 'bonos', ...]
    idiomas_requeridos?: { idioma: string; nivel: 'basico' | 'intermedio' | 'avanzado' | 'nativo' }[];
    habilidades_requeridas?: string[]; // ['excel', 'photoshop', ...]
    disponibilidad_viaje?: boolean;
    disponibilidad_horaria?: string; // 'inmediata', 'rotativo', 'L-V', etc.
    cantidad_vacantes?: number;

    // --- Añadir más atributos específicos según sea necesario ---
  } | null;
}