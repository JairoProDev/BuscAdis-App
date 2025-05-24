// ----- src/types/publication.ts (Revisado y Finalizado) -----

/**
 * Define la estructura para coordenadas geográficas usando GeoJSON Point.
 */
interface GeoJsonPoint {
  type: 'Point';
  /** Array con [longitud, latitud] */
  coordinates: [number, number];
}

/**
 * Interfaz principal y UNIFICADA para una Publicación (Anuncio Clasificado) en Buscadis.
 * Define todos los campos POTENCIALES.
 * REGLA CLAVE: En la instancia real del JSON/documento, solo incluir
 * las claves que tengan un valor. No incluir "key: null" (especialmente en attributes).
 */
export interface Publication {
  // --- Identificadores y Metadatos Esenciales ---
  _id?: string; // Opcional: ObjectId de MongoDB (Automático)
  id?: string; // Opcional: String ID, often same as _id or derived
  slug?: string | null; // Opcional: SEO-friendly slug
  premium?: boolean | null; // Opcional: Indica si es un anuncio premium
  createdAt?: Date; // Fecha de creación (Automático por DB/Backend)
  updatedAt?: Date; // Fecha de actualización (Automático por DB/Backend)
  userId?: string | null; // ID del usuario creador (si aplica)
  userSince?: Date | null; // Opcional: Fecha desde que el usuario es miembro

  // --- Contenido Principal ---
  title: string; // Título (Obligatorio)
  description: string; // Descripción (Obligatorio)
  images: string[]; // Array de URLs de imágenes (Obligatorio, puede ser [])

  // --- Clasificación Jerárquica ---
  categorySlug: string; // Slug categoría (Obligatorio, ej: 'inmuebles')
  subcategorySlug: string; // Slug subcategoría (Obligatorio, ej: 'departamentos')
  subSubcategorySlug?: string | null; // Slug sub-subcategoría (Opcional, ej: 'duplex')

  // --- Precio / Valor ---
  /** Monto principal (precio, salario). Null si no especificado/consulta. 0 si es Gratis. */
  amount?: number | null;
  /** Moneda ('PEN', 'USD'). Null si amount es null. */
  currency?: 'PEN' | 'USD' | null;
  /** Indica explícitamente si el monto es negociable. */
  negotiable?: boolean | null; // Útil para mostrar "(Negociable)"

  // --- Ubicación (Enfocado en Cusco MVP) ---
  location: {
    /** Provincia (Fijo 'Cusco' para MVP). */
    province: 'Cusco';
    /** Distrito (ej: 'Wanchaq', 'San Sebastián'). */
    district?: string | null;
    /** Dirección específica (Calle, Av, Urb.). */
    address?: string | null;
    /** Punto de referencia textual adicional (ej: 'Frente al colegio X'). */
    referencePoint?: string | null;
    /** Coordenadas geográficas [lon, lat]. Null si no se pueden determinar. */
    coordinates?: GeoJsonPoint | null;
  };

  // --- Contacto ---
  contact: {
    /** Array simple de números de teléfono/WhatsApp. Obligatorio al menos uno. */
    phones: string[];
    /** Correo electrónico de contacto (Opcional). */
    email?: string | null;
    /** Nombre de la persona o empresa de contacto (Opcional). */
    name?: string | null;
    // website?: string | null; // Eliminado por ahora
  };

  // --- Metadata del Anuncio Original (PDF) ---
  /** Costo estimado en Soles que pagó el anunciante en la revista original (incluye radio). Null si no se puede estimar. */
  sourceAdCostPEN?: number | null;

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