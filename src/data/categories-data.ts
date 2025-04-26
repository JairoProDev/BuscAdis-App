// categories-data.ts

/**
 * @fileoverview Define la estructura jerárquica de categorías, subcategorías y subsubcategorías
 * para la plataforma Buscadis. Estos datos se utilizan para poblar interfaces de usuario
 * (filtros, formularios de publicación), validar datos y organizar el contenido.
 *
 * @version 1.0.0 - Basado en análisis de clasificados de Cusco (PDFs Rueda de Negocios).
 */

// -----------------------------------------------------------------------------
// INTERFACES Y TIPOS (Puedes mover esto a un archivo types.ts si prefieres)
// -----------------------------------------------------------------------------

/**
 * Representa el tercer nivel de clasificación (el más específico).
 */
export interface SubSubcategory {
    /** Identificador único (slug) en español. */
    id: string;
    /** Nombre legible para mostrar al usuario. */
    name: string;
    /** Descripción breve opcional. */
    description?: string;
  }
  
  /**
   * Representa el segundo nivel de clasificación, agrupando SubSubcategorías.
   */
  export interface Subcategory {
    /** Identificador único (slug) en español. */
    id: string;
    /** Nombre legible para mostrar al usuario. */
    name: string;
    /** Array opcional de SubSubcategorías hijas. Puede estar vacío o no definirse si no aplica Nivel 3. */
    subSubcategories?: SubSubcategory[];
  }
  
  /**
   * Representa el primer nivel de clasificación (Categoría Principal).
   */
  export interface Category {
    /** Identificador único (slug) en español. */
    id: string;
    /** Nombre legible para mostrar al usuario. */
    name: string;
    /** Descripción breve opcional. */
    description?: string;
    /** Array de Subcategorías hijas. */
    subcategories: Subcategory[];
  }
  
  // -----------------------------------------------------------------------------
  // DATOS DE CLASIFICACIÓN (Estructura Principal)
  // -----------------------------------------------------------------------------
  
  /**
   * Lista principal que contiene toda la jerarquía de clasificación.
   * Es la exportación principal para ser usada en la aplicación.
   */
  export const categoriesList: Category[] = [
    // --- 1. EMPLEOS ---
    {
      id: 'empleos',
      name: 'Empleos',
      description: 'Ofertas y Búsqueda de Trabajo',
      subcategories: [
        {
          id: 'oficina',
          name: 'Oficina',
          subSubcategories: [
            { id: 'asistente-administrativo', name: 'Asistente Administrativo' },
            { id: 'secretario-recepcionista', name: 'Secretario/a o Recepcionista' },
            { id: 'contador-auxiliar-contable', name: 'Contador/a o Auxiliar Contable' },
            { id: 'administrador-gerente', name: 'Administrador/a o Gerente' },
            { id: 'recursos-humanos', name: 'Recursos Humanos' },
            { id: 'auditor', name: 'Auditor/a' },
          ]
        },
        {
          id: 'ventas-comercial-marketing',
          name: 'Ventas, Comercial y Marketing',
          subSubcategories: [
            { id: 'vendedor-ejecutivo-cuentas', name: 'Vendedor/a o Ejecutivo/a de Cuentas' },
            { id: 'promotor-impulsador', name: 'Promotor/a o Impulsador/a' },
            { id: 'atencion-cliente', name: 'Atención al Cliente' },
            { id: 'cajero', name: 'Cajero/a' },
            { id: 'marketing-digital-community-manager', name: 'Marketing Digital / Community Manager' },
            { id: 'telemarketing-call-center', name: 'Telemarketing / Call Center' },
          ]
        },
        {
          id: 'hosteleria-restaurantes-turismo',
          name: 'Hostelería, Restaurantes y Turismo',
          subSubcategories: [
            { id: 'cocinero-chef', name: 'Cocinero/a o Chef' },
            { id: 'ayudante-cocina', name: 'Ayudante de Cocina' },
            { id: 'mozo-azafata', name: 'Mozo/a o Azafata' },
            { id: 'barman-barista', name: 'Barman o Barista' },
            { id: 'recepcionista-hotel', name: 'Recepcionista de Hotel' },
            { id: 'botones-bellboy', name: 'Botones / Bellboy' },
            { id: 'personal-limpieza-housekeeping', name: 'Personal de Limpieza / Housekeeping (Hotel)' },
            { id: 'guia-turismo', name: 'Guía de Turismo' },
            { id: 'agente-viajes-counter', name: 'Agente de Viajes / Counter' },
            { id: 'operaciones-turisticas', name: 'Operaciones Turísticas' },
          ]
        },
        {
          id: 'construccion-mantenimiento-oficios',
          name: 'Construcción, Mantenimiento y Oficios',
          subSubcategories: [
            { id: 'albanil-operario-construccion', name: 'Albañil / Operario de Construcción' },
            { id: 'pintor', name: 'Pintor/a' },
            { id: 'gasfitero-fontanero', name: 'Gasfitero/a o Fontanero/a' },
            { id: 'electricista', name: 'Electricista' },
            { id: 'carpintero-ebanista', name: 'Carpintero/a o Ebanista' },
            { id: 'soldador', name: 'Soldador/a' },
            { id: 'jardinero', name: 'Jardinero/a' },
            { id: 'tecnico-mantenimiento-general', name: 'Técnico/a de Mantenimiento General' },
            { id: 'maestro-obra', name: 'Maestro/a de Obra' },
            { id: 'ing-arq-residente-asistente', name: 'Ing./Arq. Residente o Asistente' },
          ]
        },
        {
          id: 'salud-cuidado-personal',
          name: 'Salud y Cuidado Personal',
          subSubcategories: [
            { id: 'medico-general-especialista', name: 'Médico/a General o Especialista' },
            { id: 'enfermero-tecnico-enfermeria', name: 'Enfermero/a o Técnico/a en Enfermería' },
            { id: 'obstetra', name: 'Obstetra' },
            { id: 'odontologo-asistente-dental', name: 'Odontólogo/a o Asistente Dental' },
            { id: 'psicologo', name: 'Psicólogo/a' },
            { id: 'farmaceutico-tecnico-farmacia', name: 'Farmacéutico/a o Técnico/a en Farmacia' },
            { id: 'terapeuta-fisico-ocupacional-lenguaje', name: 'Terapeuta (Físico, Ocupacional, Lenguaje)' },
            { id: 'cuidador-ninos-ancianos-pacientes', name: 'Cuidador/a (Niños, Ancianos, Pacientes)' },
            { id: 'laboratorista-clinico', name: 'Laboratorista Clínico' },
            { id: 'visitador-medico', name: 'Visitador/a Médico/a' },
          ]
        },
        {
          id: 'educacion-docencia',
          name: 'Educación y Docencia',
          subSubcategories: [
            { id: 'docente-inicial', name: 'Docente Nivel Inicial' },
            { id: 'docente-primaria', name: 'Docente Nivel Primaria' },
            { id: 'docente-secundaria', name: 'Docente Nivel Secundaria' },
            { id: 'docente-superior-universitario', name: 'Docente Nivel Superior / Universitario' },
            { id: 'auxiliar-educacion', name: 'Auxiliar de Educación' },
            { id: 'capacitador-instructor', name: 'Capacitador/a o Instructor/a' },
            { id: 'profesor-idiomas', name: 'Profesor/a de Idiomas' },
          ]
        },
        {
          id: 'legal-notarial',
          name: 'Legal y Notarial',
          subSubcategories: [
            { id: 'abogado', name: 'Abogado/a' },
            { id: 'asistente-legal', name: 'Asistente Legal' },
            { id: 'bachiller-derecho', name: 'Bachiller en Derecho' },
            { id: 'asistente-notarial', name: 'Asistente Notarial' },
          ]
        },
        {
          id: 'belleza-estetica',
          name: 'Belleza y Estética',
          subSubcategories: [
            { id: 'estilista-peluquero', name: 'Estilista / Peluquero/a' },
            { id: 'barbero', name: 'Barbero/a' },
            { id: 'cosmetologo-cosmiatra', name: 'Cosmetólogo/a o Cosmiatra' },
            { id: 'manicurista-pedicurista', name: 'Manicurista / Pedicurista' },
            { id: 'maquillador', name: 'Maquillador/a' },
            { id: 'masajista-spa', name: 'Masajista / Personal de Spa' },
          ]
        },
        {
          id: 'tecnologia-informatica-diseno',
          name: 'Tecnología, Informática y Diseño',
          subSubcategories: [
            { id: 'desarrollador-programador-software', name: 'Desarrollador/a o Programador/a de Software' },
            { id: 'disenador-grafico-web-ux-ui', name: 'Diseñador/a (Gráfico, Web, UX/UI)' },
            { id: 'soporte-tecnico-helpdesk', name: 'Soporte Técnico / Helpdesk' },
            { id: 'administrador-redes-sistemas', name: 'Administrador/a de Redes y Sistemas' },
            { id: 'analista-datos-bi', name: 'Analista de Datos / BI' },
            { id: 'gestion-proyectos-ti', name: 'Gestión de Proyectos TI' },
          ]
        },
        {
          id: 'transporte-logistica-choferes',
          name: 'Transporte, Logística y Choferes',
          subSubcategories: [
            { id: 'chofer-a1-a2a-a2b', name: 'Chofer (A1, A2A, A2B - Auto, Van, Taxi)' },
            { id: 'chofer-a3a-a3b-a3c', name: 'Chofer (A3A, A3B, A3C - Camión, Bus)' },
            { id: 'repartidor-delivery-motorizado', name: 'Repartidor/a o Delivery (Motorizado/Auto)' },
            { id: 'operador-maquinaria-pesada', name: 'Operador/a de Maquinaria Pesada' },
          ]
        },
        {
          id: 'seguridad-vigilancia',
          name: 'Seguridad y Vigilancia',
          subSubcategories: [
            { id: 'agente-seguridad-vigilante', name: 'Agente de Seguridad / Vigilante' },
            { id: 'supervisor-seguridad', name: 'Supervisor/a de Seguridad' },
          ]
        },
        {
          id: 'trabajo-domestico',
          name: 'Trabajo Doméstico',
          subSubcategories: [
            { id: 'empleado-hogar-todo-servicio', name: 'Empleado/a del Hogar (Todo servicio)' },
            { id: 'ninera-babysitter', name: 'Niñera / Babysitter' },
            { id: 'cocinero-domestico', name: 'Cocinero/a Doméstico/a' },
            { id: 'limpieza-mantenimiento-hogar', name: 'Limpieza y Mantenimiento del Hogar' },
          ]
        },
        {
          id: 'produccion-operarios-almacen',
          name: 'Producción, Operarios y Almacén',
          subSubcategories: [
            { id: 'operario-produccion', name: 'Operario/a de Producción' },
            { id: 'costurero-textil', name: 'Costurero/a Textil' },
            { id: 'almacenero-despachador', name: 'Almacenero/a o Despachador/a' },
            { id: 'control-calidad', name: 'Control de Calidad' },
          ]
        },
        {
          id: 'practicas-pasantias',
          name: 'Prácticas y Pasantías',
          subSubcategories: [
            { id: 'practicante-profesional', name: 'Practicante Profesional' },
            { id: 'practicante-preprofesional', name: 'Practicante Preprofesional' },
          ]
        },
        { id: 'agricultura-ganaderia-afines', name: 'Agricultura, Ganadería y Afines' }, // Sin Nivel 3 por ahora
        { id: 'otros-empleos', name: 'Otros Empleos' } // Sin Nivel 3 por ahora
      ]
    },
    // --- 2. INMUEBLES ---
    {
      id: 'inmuebles',
      name: 'Inmuebles',
      description: 'Propiedades en Alquiler, Venta y Anticresis',
      subcategories: [
        {
          id: 'departamentos',
          name: 'Departamentos',
          subSubcategories: [
            { id: 'estandar', name: 'Estándar' },
            { id: 'duplex', name: 'Dúplex' },
            { id: 'triplex', name: 'Tríplex' },
            { id: 'penthouse', name: 'Penthouse' },
            { id: 'estudio-loft', name: 'Estudio / Loft' },
          ]
        },
        {
          id: 'habitaciones',
          name: 'Habitaciones',
          subSubcategories: [
            { id: 'simple-personal', name: 'Simple / Personal' },
            { id: 'doble-matrimonial', name: 'Doble / Matrimonial' },
            { id: 'compartida-estudiantes', name: 'Compartida / Estudiantes' },
            // Atributos como 'amoblada' o 'bano-privado' se manejan en 'attributes'
          ]
        },
        {
          id: 'casas',
          name: 'Casas',
          subSubcategories: [
            { id: 'casa-urbana', name: 'Casa Urbana' },
            { id: 'casa-campo-quinta', name: 'Casa de Campo / Quinta' },
            { id: 'chalet', name: 'Chalet' },
            { id: 'condominio', name: 'Casa en Condominio' },
          ]
        },
        {
          id: 'terrenos-lotes',
          name: 'Terrenos y Lotes',
          subSubcategories: [
            { id: 'terreno-urbano-residencial', name: 'Terreno Urbano / Residencial' },
            { id: 'terreno-comercial', name: 'Terreno Comercial' },
            { id: 'terreno-industrial', name: 'Terreno Industrial' },
            { id: 'terreno-agricola-rural', name: 'Terreno Agrícola / Rural' },
            { id: 'lote-condominio', name: 'Lote en Condominio' },
            { id: 'terreno-playa-campo', name: 'Terreno de Playa / Campo' },
          ]
        },
        {
          id: 'locales-comerciales',
          name: 'Locales Comerciales',
          subSubcategories: [
            { id: 'tienda-puerta-calle', name: 'Tienda Puerta a Calle' },
            { id: 'stand-galeria-cc', name: 'Stand en Galería / C.Comercial' },
            { id: 'restaurante-bar-cafe', name: 'Restaurante / Bar / Cafetería' },
            { id: 'consultorio-oficina-profesional', name: 'Consultorio / Oficina Profesional' },
            { id: 'local-industrial-taller', name: 'Local Industrial / Taller' },
            { id: 'salon-eventos', name: 'Salón de Eventos' },
            { id: 'mercado-puesto', name: 'Puesto de Mercado' },
            { id: 'otro-local-comercial', name: 'Otro Local Comercial' },
          ]
        },
        {
          id: 'oficinas',
          name: 'Oficinas',
          subSubcategories: [
            { id: 'oficina-independiente-privada', name: 'Oficina Independiente / Privada' },
            { id: 'oficina-administrativa', name: 'Oficina Administrativa' },
            { id: 'consultorio-profesional', name: 'Consultorio Profesional' },
            { id: 'oficina-compartida-coworking', name: 'Oficina Compartida / Coworking' },
          ]
        },
        {
          id: 'edificios',
          name: 'Edificios',
          subSubcategories: [
            { id: 'edificio-residencial', name: 'Edificio Residencial' },
            { id: 'edificio-comercial', name: 'Edificio Comercial' },
            { id: 'edificio-mixto', name: 'Edificio Mixto' },
            { id: 'edificio-oficinas', name: 'Edificio de Oficinas' },
          ]
        },
        {
          id: 'almacenes-depositos-industriales',
          name: 'Almacenes, Depósitos e Industriales',
          subSubcategories: [
             { id: 'almacen-deposito-simple', name: 'Almacén / Depósito Simple' },
             { id: 'nave-industrial', name: 'Nave Industrial' },
             { id: 'local-taller-industrial', name: 'Local para Taller / Industrial' }, // Repite de locales? Quizás unificar
             { id: 'centro-distribucion', name: 'Centro de Distribución' },
          ]
        },
        { id: 'cocheras-garajes', name: 'Cocheras y Garajes' }, // Sin Nivel 3 por ahora
        {
          id: 'hospedajes',
          name: 'Hospedajes',
          subSubcategories: [
              { id: 'hotel', name: 'Hotel' },
              { id: 'hostal-hospedaje', name: 'Hostal / Hospedaje' },
              { id: 'casa-huespedes-guesthouse', name: 'Casa de Huéspedes / Guesthouse' },
              { id: 'albergue-backpackers', name: 'Albergue / Backpackers' },
              { id: 'apart-hotel', name: 'Apart-hotel' },
              { id: 'alojamiento-airbnb', name: 'Alojamiento tipo Airbnb' },
          ]
         },
        {
          id: 'proyectos-inmobiliarios',
          name: 'Proyectos Inmobiliarios',
           subSubcategories: [
              { id: 'preventa-en-planos', name: 'Preventa / En Planos' },
              { id: 'en-construccion', name: 'En Construcción' },
              { id: 'listo-para-entrega', name: 'Listo para Entrega / Terminado' },
          ]
         },
        { id: 'aires-techos', name: 'Aires y Techos' } // Sin Nivel 3 por ahora
      ]
    },
    // --- 3. VEHÍCULOS ---
    {
      id: 'vehiculos',
      name: 'Vehículos',
      description: 'Compra, Venta y Alquiler de Vehículos',
      subcategories: [
        {
          id: 'autos',
          name: 'Autos',
          subSubcategories: [
            { id: 'sedan', name: 'Sedán' },
            { id: 'hatchback', name: 'Hatchback' },
            { id: 'coupe', name: 'Coupé' },
            { id: 'convertible', name: 'Convertible' },
            { id: 'station-wagon', name: 'Station Wagon' },
          ]
        },
        {
          id: 'camionetas-suv-vans',
          name: 'Camionetas, SUV y Vans',
          subSubcategories: [
            { id: 'suv', name: 'SUV' },
            { id: 'pickup', name: 'Pickup (Camioneta)' },
            { id: 'van-pasajeros', name: 'Van de Pasajeros' },
            { id: 'furgoneta-carga', name: 'Furgoneta de Carga' },
            { id: 'station-wagon-grande', name: 'Station Wagon Grande' }, // Si aplica
          ]
        },
        {
          id: 'motos-mototaxis-similares',
          name: 'Motos, Mototaxis y Similares',
           subSubcategories: [
              { id: 'moto-lineal-pistera', name: 'Moto Lineal / Pistera' },
              { id: 'scooter', name: 'Scooter' },
              { id: 'motocross-enduro-todoterreno', name: 'Motocross / Enduro / Todoterreno' },
              { id: 'mototaxi-trimoto', name: 'Mototaxi / Trimoto de Carga' },
              { id: 'cuatrimoto', name: 'Cuatrimoto' },
          ]
        },
        {
          id: 'camiones-buses',
          name: 'Camiones y Buses',
          subSubcategories: [
              { id: 'camion-ligero-mediano', name: 'Camión Ligero / Mediano (Hasta 10T)' },
              { id: 'camion-pesado-volquete-cisterna', name: 'Camión Pesado (Volquete, Cisterna, etc.)' },
              { id: 'remolcador-tracto', name: 'Remolcador / Tracto Camión' },
              { id: 'bus-interprovincial-turistico', name: 'Bus Interprovincial / Turístico' },
              { id: 'minibus-custer-combi', name: 'Minibus / Custer / Combi' },
          ]
        },
        {
          id: 'maquinaria-pesada-agricola',
          name: 'Maquinaria Pesada y Agrícola',
          subSubcategories: [
              { id: 'tractor-agricola', name: 'Tractor Agrícola' },
              { id: 'excavadora-oruga', name: 'Excavadora de Oruga' },
              { id: 'retroexcavadora', name: 'Retroexcavadora' },
              { id: 'cargador-frontal', name: 'Cargador Frontal' },
              { id: 'rodillo-compactador', name: 'Rodillo Compactador' },
              { id: 'motoniveladora', name: 'Motoniveladora' },
              { id: 'montacargas', name: 'Montacargas' },
              { id: 'grua', name: 'Grúa' },
          ]
        },
        {
          id: 'otros-vehiculos',
          name: 'Otros Vehículos (Bicicletas, Especiales, etc.)',
          subSubcategories: [
            { id: 'bicicleta', name: 'Bicicleta' },
            { id: 'scooter-electrico-patineta', name: 'Scooter / Patineta Eléctrica' },
            { id: 'vehiculo-acuatico', name: 'Vehículo Acuático (Bote, Moto)' },
            { id: 'vehiculo-aereo', name: 'Vehículo Aéreo (Drone grande, etc.)' },
            { id: 'vehiculo-especial', name: 'Vehículo Especial (Ambulancia, etc.)' },
          ]
        },
        {
          id: 'repuestos-accesorios-vehiculares',
          name: 'Repuestos y Accesorios Vehiculares',
          subSubcategories: [
            { id: 'llantas-aros', name: 'Llantas y Aros' },
            { id: 'motores-partes', name: 'Motores y Partes' },
            { id: 'baterias', name: 'Baterías' },
            { id: 'sistema-electrico', name: 'Sistema Eléctrico' },
            { id: 'frenos-suspension', name: 'Frenos y Suspensión' },
            { id: 'carroceria-autopartes', name: 'Carrocería y Autopartes' },
            { id: 'audio-video-alarmas-gps', name: 'Audio, Video, Alarmas y GPS' },
            { id: 'lubricantes-aditivos', name: 'Lubricantes y Aditivos' },
            { id: 'accesorios-tuning', name: 'Accesorios y Tuning' },
            { id: 'otros-repuestos', name: 'Otros Repuestos y Accesorios' },
          ]
        }
      ]
    },
    // --- 4. SERVICIOS ---
    {
      id: 'servicios',
      name: 'Servicios',
      description: 'Servicios Profesionales, Técnicos y Personales',
      subcategories: [
        {
          id: 'profesionales-asesoria',
          name: 'Profesionales y Asesoría',
          subSubcategories: [
            { id: 'legales-abogados', name: 'Legales / Abogados' },
            { id: 'contables-tributarios-auditoria', name: 'Contables, Tributarios y Auditoría' },
            { id: 'ingenieria-arquitectura-proyectos', name: 'Ingeniería, Arquitectura y Proyectos' },
            { id: 'consultoria-negocios', name: 'Consultoría de Negocios' },
            { id: 'diseno-publicidad-marketing', name: 'Diseño, Publicidad y Marketing' },
            { id: 'traduccion-interpretacion', name: 'Traducción e Interpretación' },
            { id: 'servicios-informaticos-ti', name: 'Servicios Informáticos / TI' },
            { id: 'topografia-geodesia', name: 'Topografía y Geodesia' },
            { id: 'otros-profesionales', name: 'Otros Profesionales y Asesorías' },
          ]
        },
        {
          id: 'reparaciones-mantenimiento-tecnicos',
          name: 'Reparaciones, Mantenimiento y Técnicos',
          subSubcategories: [
              { id: 'reparacion-electrodomesticos', name: 'Reparación de Electrodomésticos' },
              { id: 'reparacion-computadoras-laptops', name: 'Reparación de Computadoras / Laptops' },
              { id: 'reparacion-celulares-tablets', name: 'Reparación de Celulares / Tablets' },
              { id: 'mecanica-automotriz-motos', name: 'Mecánica Automotriz y de Motos' },
              { id: 'planchado-pintura-vehicular', name: 'Planchado y Pintura Vehicular' },
              { id: 'gasfiteria-plomeria', name: 'Gasfitería / Plomería' },
              { id: 'electricidad-instalaciones', name: 'Electricidad e Instalaciones' },
              { id: 'cerrajeria', name: 'Cerrajería' },
              { id: 'construccion-remodelacion-albanileria', name: 'Construcción, Remodelación y Albañilería' },
              { id: 'pintura-empastado-drywall', name: 'Pintura, Empastado y Drywall' },
              { id: 'carpinteria-melamine', name: 'Carpintería / Melamine' },
              { id: 'metalmecanica-soldadura', name: 'Metalmecánica / Soldadura' },
              { id: 'jardineria-mantenimiento-areas-verdes', name: 'Jardinería / Mantenimiento de Áreas Verdes' },
              { id: 'tapiceria-muebles-vehiculos', name: 'Tapicería (Muebles, Vehículos)' },
              { id: 'mantenimiento-general-multiservicios', name: 'Mantenimiento General / Multiservicios' },
          ]
        },
        {
          id: 'educacion-clases-talleres',
          name: 'Educación, Clases y Talleres',
          subSubcategories: [
              { id: 'clases-particulares-refuerzo-escolar', name: 'Clases Particulares / Refuerzo Escolar' },
              { id: 'preparacion-preuniversitaria-academias', name: 'Preparación Preuniversitaria / Academias' },
              { id: 'clases-idiomas', name: 'Clases de Idiomas' },
              { id: 'clases-musica-arte-danza', name: 'Clases de Música, Arte y Danza' },
              { id: 'clases-computacion-software-tecnologia', name: 'Clases de Computación, Software y Tecnología' },
              { id: 'clases-deportivas-entrenamiento-personal', name: 'Clases Deportivas / Entrenamiento Personal' },
              { id: 'clases-cocina-reposteria-gastronomia', name: 'Clases de Cocina, Repostería y Gastronomía' },
              { id: 'clases-manejo-conduccion', name: 'Clases de Manejo / Conducción' },
              { id: 'talleres-manualidades-otros', name: 'Talleres de Manualidades y Otros' },
          ]
         },
        {
          id: 'salud-bienestar',
          name: 'Salud y Bienestar',
          subSubcategories: [
              { id: 'consultas-medicas-especialidades', name: 'Consultas Médicas / Especialidades' },
              { id: 'servicios-enfermeria-domicilio', name: 'Servicios de Enfermería (A domicilio, etc.)' },
              { id: 'terapia-fisica-rehabilitacion', name: 'Terapia Física y Rehabilitación' },
              { id: 'masajes-terapeuticos-relajantes-antiestres', name: 'Masajes (Terapéuticos, Relajantes, Antiestrés)' },
              { id: 'podologia-quiropodia', name: 'Podología / Quiropodia' },
              { id: 'psicologia-psicoterapia', name: 'Psicología / Psicoterapia' },
              { id: 'servicios-odontologicos-dentales', name: 'Servicios Odontológicos / Dentales' },
              { id: 'servicios-optica-oftalmologia', name: 'Servicios de Óptica / Oftalmología' },
              { id: 'analisis-clinicos-laboratorio', name: 'Análisis Clínicos / Laboratorio' },
              { id: 'nutricion-dietetica', name: 'Nutrición y Dietética' },
              { id: 'cuidado-adulto-mayor-geriatria', name: 'Cuidado del Adulto Mayor / Geriatría' },
              { id: 'cuidado-ninos-estimulacion', name: 'Cuidado de Niños / Estimulación Temprana' },
              { id: 'terapias-alternativas-holisticas', name: 'Terapias Alternativas / Holísticas' },
          ]
        },
        {
          id: 'belleza-estetica',
          name: 'Belleza y Estética',
          subSubcategories: [
              { id: 'peluqueria-estilismo', name: 'Peluquería / Estilismo' },
              { id: 'barberia', name: 'Barbería' },
              { id: 'manicure-pedicure-unas', name: 'Manicure, Pedicure y Uñas' },
              { id: 'tratamientos-faciales-cosmiatria', name: 'Tratamientos Faciales / Cosmiatría' },
              { id: 'tratamientos-corporales-estetica', name: 'Tratamientos Corporales / Estética Corporal' },
              { id: 'maquillaje', name: 'Maquillaje Profesional / Social' },
              { id: 'depilacion', name: 'Depilación (Cera, Láser, etc.)' },
              { id: 'extensiones-pestanas-cejas', name: 'Extensiones / Lifting de Pestañas y Cejas' },
              { id: 'micropigmentacion-microblading', name: 'Micropigmentación / Microblading' },
              { id: 'spa-relajacion', name: 'Spa / Relajación' },
          ]
        },
        {
          id: 'servicios-eventos-catering',
          name: 'Servicios para Eventos y Catering',
          subSubcategories: [
              { id: 'organizacion-eventos-planning', name: 'Organización de Eventos / Planning' },
              { id: 'catering-buffet-bocaditos', name: 'Catering / Buffet / Bocaditos' },
              { id: 'tortas-pasteleria-mesas-dulces', name: 'Tortas, Pastelería y Mesas Dulces' },
              { id: 'alquiler-equipos-sonido-luces-dj', name: 'Alquiler de Equipos (Sonido, Luces, DJ)' },
              { id: 'alquiler-mobiliario-menaje-toldos', name: 'Alquiler de Mobiliario, Menaje y Toldos' },
              { id: 'fotografia-video-eventos', name: 'Fotografía y Video para Eventos' },
              { id: 'filmacion-drones', name: 'Filmación con Drones' },
              { id: 'animacion-shows-hora-loca', name: 'Animación, Shows y Hora Loca' },
              { id: 'musica-vivo-orquestas-bandas', name: 'Música en Vivo (Orquestas, Bandas, Solistas)' },
              { id: 'decoracion-arreglos-florales', name: 'Decoración y Arreglos Florales' },
              { id: 'bartender-barra-movil', name: 'Bartender / Barra Móvil' },
          ]
         },
        {
          id: 'transporte-mudanzas-mensajeria',
          name: 'Transporte, Mudanzas y Mensajería',
          subSubcategories: [
              { id: 'mudanzas-fletes-locales-nacionales', name: 'Mudanzas y Fletes (Locales, Nacionales)' },
              { id: 'taxi-remisse-transporte-aplicativo', name: 'Taxi / Remisse / Transporte por Aplicativo' },
              { id: 'transporte-carga-liviana-pesada', name: 'Transporte de Carga (Liviana, Pesada)' },
              { id: 'encomiendas-paqueteria', name: 'Encomiendas / Paquetería' },
              { id: 'mensajeria-motorizada-courier', name: 'Mensajería Motorizada / Courier' },
              { id: 'transporte-personal-escolar', name: 'Transporte de Personal / Escolar' },
              { id: 'transporte-turistico-privado', name: 'Transporte Turístico / Privado' },
              { id: 'alquiler-vehiculos-chofer', name: 'Alquiler de Vehículos con Chofer' },
          ]
         },
        {
          id: 'servicios-mascotas',
          name: 'Servicios para Mascotas',
          subSubcategories: [
            { id: 'veterinaria-consultas-domicilio', name: 'Veterinaria / Consultas (Local, Domicilio)' },
            { id: 'vacunacion-desparasitacion', name: 'Vacunación y Desparasitación' },
            { id: 'cirugias-esterilizacion-mascotas', name: 'Cirugías / Esterilización de Mascotas' },
            { id: 'emergencias-veterinarias', name: 'Emergencias Veterinarias' },
            { id: 'peluqueria-bano-grooming', name: 'Peluquería, Baño y Grooming' },
            { id: 'paseo-cuidado-guarderia-mascotas', name: 'Paseo, Cuidado Diario y Guardería' },
            { id: 'hospedaje-hotel-mascotas', name: 'Hospedaje / Hotel para Mascotas' },
            { id: 'adiestramiento-entrenamiento-canino', name: 'Adiestramiento / Entrenamiento Canino' },
          ]
        },
        {
          id: 'servicios-financieros-seguros',
          name: 'Servicios Financieros y Seguros',
          subSubcategories: [
            { id: 'prestamos-creditos', name: 'Préstamos / Créditos (Personales, Vehiculares, etc.)' },
            { id: 'cambio-moneda-divisas', name: 'Cambio de Moneda / Divisas' },
            { id: 'asesoria-financiera-contable', name: 'Asesoría Financiera / Contable' },
            { id: 'venta-seguros', name: 'Venta de Seguros (SOAT, Vida, Salud, etc.)' },
          ]
        },
        { id: 'servicios-esotericos-misticos', name: 'Servicios Esotéricos y Místicos' }, // Sin Nivel 3 por ahora
        {
          id: 'otros-servicios',
          name: 'Otros Servicios',
          subSubcategories: [
            { id: 'limpieza-desinfeccion-hogar-oficina', name: 'Limpieza y Desinfección (Hogar, Oficinas)' },
            { id: 'lavanderia-tintoreria', name: 'Lavandería / Tintorería' },
            { id: 'imprenta-diseno-grafico-gigantografias', name: 'Imprenta, Diseño Gráfico y Gigantografías' },
            { id: 'fotocopias-impresiones-escaneos', name: 'Fotocopias, Impresiones y Escaneos' },
            { id: 'servicios-seguridad-vigilancia', name: 'Servicios de Seguridad / Vigilancia' },
            { id: 'investigacion-privada', name: 'Investigación Privada' },
            { id: 'reciclaje-manejo-residuos', name: 'Reciclaje / Manejo de Residuos' },
            { id: 'reparaciones-varias-menores', name: 'Reparaciones Varias / Menores' },
          ]
        }
      ]
    },
    // --- 5. PRODUCTOS ---
    {
      id: 'productos',
      name: 'Productos',
      description: 'Compra y Venta de Productos Nuevos y Usados',
      subcategories: [
        { id: 'electronicos-computacion', name: 'Electrónicos y Computación' }, // Subsubs definidas arriba
        { id: 'celulares-accesorios', name: 'Celulares y Accesorios' }, // Subsubs definidas arriba
        { id: 'electrodomesticos', name: 'Electrodomésticos' }, // Subsubs definidas arriba
        { id: 'hogar-muebles-decoracion', name: 'Hogar, Muebles y Decoración' }, // Subsubs definidas arriba
        { id: 'ropa-calzado-accesorios', name: 'Ropa, Calzado y Accesorios' }, // Subsubs definidas arriba
        { id: 'belleza-cuidado-personal-productos', name: 'Productos de Belleza y Cuidado Personal' }, // Subsubs definidas arriba
        { id: 'salud-productos', name: 'Productos de Salud y Bienestar' }, // Subsubs definidas arriba
        { id: 'deportes-hobbies-ocio', name: 'Deportes, Hobbies y Ocio' }, // Subsubs definidas arriba
        { id: 'libros-musica-peliculas-juegos', name: 'Libros, Música, Películas y Juegos' }, // Subsubs definidas arriba
        { id: 'ninos-bebes', name: 'Niños y Bebés' }, // Subsubs definidas arriba
        { id: 'mascotas-productos-animales', name: 'Mascotas (Productos y Animales)' }, // Subsubs definidas arriba
        { id: 'alimentos-bebidas', name: 'Alimentos y Bebidas' }, // Subsubs definidas arriba
        { id: 'herramientas-materiales', name: 'Herramientas y Materiales' }, // Subsubs definidas arriba
        { id: 'industrial-comercial-equipos-insumos', name: 'Equipos e Insumos (Industrial, Comercial)' }, // Subsubs definidas arriba
        { id: 'artesanias-arte', name: 'Artesanías y Arte' }, // Subsubs definidas arriba
        { id: 'otros-productos', name: 'Otros Productos' } // Sin Nivel 3 por ahora
      ]
    },
    // --- 6. EVENTOS ---
    {
      id: 'eventos',
      name: 'Eventos',
      description: 'Actividades Culturales, Deportivas, Sociales y Educativas',
      subcategories: [
        { id: 'conciertos-musica-fiestas', name: 'Conciertos, Música y Fiestas' }, // Subsubs por género definidas arriba
        { id: 'deportivos', name: 'Deportivos' }, // Subsubs por deporte definidas arriba
        { id: 'culturales-teatro-cine-exposiciones', name: 'Culturales, Teatro, Cine y Exposiciones' }, // Subsubs por tipo definidas arriba
        { id: 'educativos-conferencias-talleres', name: 'Educativos, Conferencias y Talleres' }, // Subsubs por tipo definidas arriba
        { id: 'sociales-comunitarios-ferias', name: 'Sociales, Comunitarios y Ferias' }, // Subsubs por tipo definidas arriba
        { id: 'religiosos', name: 'Religiosos' } // Sin Nivel 3 por ahora
      ]
    },
    // --- 7. COMUNIDAD ---
    {
      id: 'comunidad',
      name: 'Comunidad',
      description: 'Avisos Personales, Objetos Perdidos y Más',
      subcategories: [
        { id: 'avisos-personales-sociales', name: 'Avisos Personales y Sociales (Saludos, etc.)' }, // Sin Nivel 3 por ahora
        { id: 'objetos-perdidos-encontrados', name: 'Objetos Perdidos y Encontrados' }, // Sin Nivel 3 por ahora
        { id: 'mascotas-comunidad', name: 'Mascotas (Perdidas, Encontradas, Adopción)' }, // Sin Nivel 3 por ahora
        { id: 'voluntariado-causas-sociales', name: 'Voluntariado y Causas Sociales' } // Sin Nivel 3 por ahora
      ]
    },
    // --- 8. NEGOCIOS ---
    {
      id: 'negocios',
      name: 'Negocios',
      description: 'Venta, Traspaso, Socios y Oportunidades Comerciales',
      subcategories: [
        {
          id: 'venta-traspaso-negocios',
          name: 'Venta y Traspaso de Negocios',
          subSubcategories: [
            { id: 'restaurante-bar-cafeteria', name: 'Restaurante / Bar / Cafetería' },
            { id: 'tienda-retail-comercio', name: 'Tienda / Retail / Comercio' },
            { id: 'hotel-hospedaje', name: 'Hotel / Hospedaje' },
            { id: 'taller-servicio-tecnico', name: 'Taller / Servicio Técnico' },
            { id: 'consultorio-centro-medico-estetico', name: 'Consultorio / Centro Médico / Estético' },
            { id: 'gimnasio-spa', name: 'Gimnasio / Spa' },
            { id: 'empresa-industrial-produccion', name: 'Empresa Industrial / Producción' },
            { id: 'negocio-online-ecommerce', name: 'Negocio Online / E-commerce' },
            { id: 'institucion-educativa-academia', name: 'Institución Educativa / Academia' },
            { id: 'agencia-viajes-turismo', name: 'Agencia de Viajes / Turismo' },
            { id: 'licencia-permiso-cupo', name: 'Licencia / Permiso / Cupo' }, // Traspaso de permisos
            { id: 'otros-negocios', name: 'Otros Negocios' },
          ]
        },
        {
          id: 'busqueda-socios-inversionistas',
          name: 'Búsqueda de Socios e Inversionistas',
          subSubcategories: [
            { id: 'socio-capitalista-inversionista', name: 'Socio Capitalista / Inversionista' },
            { id: 'socio-operativo-trabajo', name: 'Socio Operativo / de Trabajo' },
            { id: 'socio-estrategico-knowhow', name: 'Socio Estratégico / Know-How' },
          ]
        },
        {
          id: 'franquicias',
          name: 'Franquicias',
           subSubcategories: [
            { id: 'franquicia-gastronomica', name: 'Franquicia Gastronómica' },
            { id: 'franquicia-servicios', name: 'Franquicia de Servicios' },
            { id: 'franquicia-retail-moda', name: 'Franquicia Retail / Moda' },
            { id: 'franquicia-educativa', name: 'Franquicia Educativa' },
          ]
        },
        { id: 'oportunidades-negocio-representaciones', name: 'Oportunidades de Negocio y Representaciones' } // Sin Nivel 3 por ahora
      ]
    }
  ];
  
  // -----------------------------------------------------------------------------
  // HELPER FUNCTIONS (Funciones de Ayuda Opcionales)
  // -----------------------------------------------------------------------------
  
  /**
   * Mapa para búsqueda rápida de categorías por ID (slug).
   * Se genera una sola vez al importar el archivo.
   */
  export const categoriesMap: Map<string, Category> = new Map(
    categoriesList.map(cat => [cat.id, cat])
  );
  
  /**
   * Obtiene la información de una categoría por su ID (slug).
   * @param categoryId El slug de la categoría.
   * @returns El objeto Category o undefined si no se encuentra.
   */
  export const getCategoryById = (categoryId: string): Category | undefined => {
    return categoriesMap.get(categoryId);
  };
  
  /**
   * Obtiene la lista de subcategorías para una categoría dada.
   * @param categoryId El slug de la categoría padre.
   * @returns Un array de Subcategory o un array vacío si no se encuentra la categoría o no tiene subcategorías.
   */
  export const getSubcategories = (categoryId: string): Subcategory[] => {
    return categoriesMap.get(categoryId)?.subcategories || [];
  };
  
  /**
   * Obtiene la lista de sub-subcategorías para una subcategoría específica (dentro de una categoría).
   * @param categoryId El slug de la categoría padre.
   * @param subcategoryId El slug de la subcategoría padre.
   * @returns Un array de SubSubcategory o un array vacío si no se encuentran o no aplica Nivel 3.
   */
  export const getSubSubcategories = (categoryId: string, subcategoryId: string): SubSubcategory[] => {
      const category = categoriesMap.get(categoryId);
      const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
      return subcategory?.subSubcategories || [];
  };
  
  /**
   * Obtiene el nombre legible de una categoría, subcategoría o subsubcategoría a partir de sus slugs.
   * @param categoryId Slug de la categoría.
   * @param subcategoryId Slug de la subcategoría (opcional).
   * @param subSubcategoryId Slug de la sub-subcategoría (opcional).
   * @returns Un objeto con los nombres encontrados o null si no se encuentran.
   */
  export const getClassificationNames = (
      categoryId: string,
      subcategoryId?: string | null,
      subSubcategoryId?: string | null
  ): { categoryName: string | null; subcategoryName: string | null; subSubcategoryName: string | null } => {
      const result = { categoryName: null, subcategoryName: null, subSubcategoryName: null };
      const category = categoriesMap.get(categoryId);
      if (!category) return result;
  
      result.categoryName = category.name;
  
      if (subcategoryId) {
          const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
          if (subcategory) {
              result.subcategoryName = subcategory.name;
              if (subSubcategoryId && subcategory.subSubcategories) {
                  const subSub = subcategory.subSubcategories.find(ssub => ssub.id === subSubcategoryId);
                  if (subSub) {
                      result.subSubcategoryName = subSub.name;
                  }
              }
          }
      }
      return result;
  };