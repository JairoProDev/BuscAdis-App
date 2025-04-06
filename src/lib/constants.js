/**
 * src/lib/constants.js
 * Constantes utilizadas en la aplicación de Buscadis
 */

import {
  BriefcaseIcon,
  HomeIcon,
  TruckIcon,
  WrenchIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  CalendarIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

// Categorías de la plataforma con sus datos
export const categories = [
  {
    id: 'empleos',
    name: 'Empleos',
    slug: 'empleos',
    description: 'Encuentra trabajos o publica ofertas laborales en toda la región.',
    icon: BriefcaseIcon,
    iconName: 'BriefcaseIcon',
    gradient: 'from-blue-500 to-blue-700',
    imageUrl: '/images/empleo-dev.jpg',
    count: 163
  },
  {
    id: 'inmuebles',
    name: 'Inmuebles',
    slug: 'inmuebles',
    description: 'Casas, departamentos, terrenos y locales comerciales en venta o alquiler.',
    icon: HomeIcon,
    iconName: 'HomeIcon',
    gradient: 'from-green-500 to-green-700',
    imageUrl: '/images/departamento-miraflores.jpg',
    count: 257
  },
  {
    id: 'vehiculos',
    name: 'Vehículos',
    slug: 'vehiculos',
    description: 'Autos, motos, camionetas y más vehículos nuevos y usados.',
    icon: TruckIcon,
    iconName: 'TruckIcon',
    gradient: 'from-red-500 to-red-700',
    imageUrl: '/images/vehiculo-corolla.jpg',
    count: 184
  },
  {
    id: 'servicios',
    name: 'Servicios',
    slug: 'servicios',
    description: 'Profesionales y técnicos que ofrecen servicios de calidad.',
    icon: WrenchIcon,
    iconName: 'WrenchIcon',
    gradient: 'from-purple-500 to-purple-700',
    imageUrl: '/images/servicio-clases.jpg',
    count: 209
  },
  {
    id: 'productos',
    name: 'Productos',
    slug: 'productos',
    description: 'Compra y venta de todo tipo de productos nuevos o de segunda mano.',
    icon: ShoppingBagIcon,
    iconName: 'ShoppingBagIcon',
    gradient: 'from-orange-500 to-orange-700',
    imageUrl: '/images/producto-laptop.jpg',
    count: 318
  },
  {
    id: 'turismo',
    name: 'Turismo',
    slug: 'turismo',
    description: 'Tours, hoteles, restaurantes y experiencias turísticas.',
    icon: GlobeAltIcon,
    iconName: 'GlobeAltIcon',
    gradient: 'from-cyan-500 to-cyan-700',
    imageUrl: '/images/turismo-machupicchu.jpg',
    count: 125
  },
  {
    id: 'eventos',
    name: 'Eventos',
    slug: 'eventos',
    description: 'Conciertos, talleres, conferencias y todo tipo de eventos.',
    icon: CalendarIcon,
    iconName: 'CalendarIcon',
    gradient: 'from-pink-500 to-pink-700',
    imageUrl: '/images/evento-concierto.jpg',
    count: 73
  },
  {
    id: 'educacion',
    name: 'Educación',
    slug: 'educacion',
    description: 'Cursos, talleres, clases particulares y material educativo.',
    icon: AcademicCapIcon,
    iconName: 'AcademicCapIcon',
    gradient: 'from-indigo-500 to-indigo-700',
    imageUrl: '/images/educacion-marketing.jpg',
    count: 95
  }
];

export const posts = [
    {
        id: 'empleo-1',
        title: '5 Claves para Destacar en tu Búsqueda de Empleo en Cusco',
        slug: 'claves-destacar-busqueda-empleo-cusco',
        excerpt: '¿Buscas trabajo en la hermosa ciudad de Cusco? Descubre 5 estrategias esenciales para que tu perfil resalte entre la multitud y consigas el empleo que deseas.',
        content: `
            <h2>1. Optimiza tu Currículum Vitae para el Mercado Local</h2>
            <p>Investiga qué habilidades y experiencias son más demandadas en Cusco. Adapta tu CV resaltando tus logros y competencias relevantes para las empresas de la región.</p>

            <h2>2. Utiliza Plataformas de Empleo Locales</h2>
            <p>Busca activamente en plataformas de empleo específicas de Cusco y Perú. ¡BuscAdis es un excelente lugar para comenzar! Muchas empresas locales publican sus ofertas aquí.</p>

            <h2>3. Networking: Conecta con Profesionales Cusqueños</h2>
            <p>Asiste a eventos, ferias de empleo y reuniones profesionales en Cusco. El networking puede abrirte puertas a oportunidades ocultas.</p>

            <h2>4. Prepárate para Entrevistas con Perspectiva Cultural</h2>
            <p>Infórmate sobre la cultura empresarial en Cusco. Muestra respeto por las costumbres locales y destaca tu interés en contribuir al desarrollo de la región.</p>

            <h2>5. No Subestimes el Poder de las Redes Sociales Profesionales</h2>
            <p>Mantén tu perfil de LinkedIn actualizado y conecta con reclutadores y profesionales de tu sector en Cusco. ¡Muchas ofertas de empleo se publican primero en redes sociales!</p>
            <p>Siguiendo estos consejos, aumentarás significativamente tus posibilidades de encontrar el empleo ideal en Cusco. ¡Mucha suerte en tu búsqueda!</p>
        `,
        featuredImage: '/images/blog/empleo-cusco.jpg', // Reemplaza con una imagen relevante
        author: { name: 'BuscAdis', avatar: '/images/logo-buscadis.png' }, // Reemplaza con tu información
        category: categories.find(cat => cat.slug === 'empleos'),
        tags: [],
        readingTime: 7,
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        publishedAt: new Date().toISOString(),
        seo: { title: 'Buscar Empleo en Cusco: 5 Claves para Destacar', description: 'Consejos para encontrar trabajo en Cusco, Perú.', keywords: ['empleo', 'trabajo', 'cusco', 'peru', 'buscar trabajo'] },
        status: 'published',
        featured: true,
        premium: false,
    },
    {
        id: 'empleo-2',
        title: 'Las 10 Habilidades Más Demandadas por las Empresas en Perú en 2024',
        slug: 'habilidades-demandadas-peru-2024',
        excerpt: 'Mantente a la vanguardia del mercado laboral peruano. Descubre las 10 habilidades clave que las empresas están buscando activamente en este 2024.',
        content: `
            <h2>1. Desarrollo de Software y Programación</h2>
            <p>La demanda de profesionales en desarrollo web, móvil y de software sigue en aumento.</p>

            <h2>2. Análisis de Datos e Inteligencia Artificial</h2>
            <p>Las empresas necesitan expertos para interpretar datos y tomar decisiones estratégicas.</p>

            <h2>3. Marketing Digital y SEO</h2>
            <p>Profesionales capaces de aumentar la visibilidad online y atraer clientes son cruciales.</p>

            <h2>4. Ventas y Desarrollo de Negocios</h2>
            <p>La habilidad para generar ingresos y expandir el negocio es siempre valorada.</p>

            <h2>5. Gestión de Proyectos</h2>
            <p>Organizar y liderar equipos para alcanzar objetivos es una habilidad esencial.</p>

            <h2>6. Habilidades de Comunicación</h2>
            <p>La capacidad de comunicar ideas de forma clara y efectiva es fundamental en cualquier rol.</p>

            <h2>7. Inglés (y otros idiomas)</h2>
            <p>En un mundo globalizado, el dominio de idiomas es una gran ventaja competitiva.</p>

            <h2>8. Liderazgo y Gestión de Equipos</h2>
            <p>Las empresas buscan líderes capaces de motivar y guiar a sus equipos.</p>

            <h2>9. Atención al Cliente</h2>
            <p>Brindar una excelente experiencia al cliente es clave para la fidelización.</p>

            <h2>10. Adaptabilidad y Aprendizaje Continuo</h2>
            <p>El mercado laboral cambia constantemente, por lo que la capacidad de adaptarse y aprender es vital.</p>
            <p>Desarrollar estas habilidades te abrirá muchas puertas en el mercado laboral peruano. ¡Invierte en tu futuro!</p>
        `,
        featuredImage: '/images/blog/habilidades-peru.jpg', // Reemplaza con una imagen relevante
        author: { name: 'BuscAdis', avatar: '/images/logo-buscadis.png' }, // Reemplaza con tu información
        category: categories.find(cat => cat.slug === 'empleos'),
        tags: [],
        readingTime: 9,
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        publishedAt: new Date().toISOString(),
        seo: { title: 'Top 10 Habilidades Demandadas en Perú 2024', description: 'Descubre las habilidades laborales más buscadas en Perú este año.', keywords: ['habilidades', 'empleos', 'peru', 'mercado laboral', '2024'] },
        status: 'published',
        featured: false,
        premium: false,
    },
    {
        id: 'empleo-3',
        title: 'Carta de Presentación Impactante: Consejos y Ejemplo para Perú',
        slug: 'carta-presentacion-peru',
        excerpt: 'Aprende a redactar una carta de presentación que cause una impresión duradera en los reclutadores peruanos. Incluye un ejemplo práctico que puedes adaptar.',
        content: `
            <h2>¿Por qué es Importante una Carta de Presentación?</h2>
            <p>En Perú, al igual que en otros lugares, una carta de presentación bien redactada puede ser la llave para conseguir una entrevista de trabajo. Te permite destacar tus habilidades y tu interés específico en la posición.</p>

            <h2>Consejos para Redactar una Carta de Presentación Impactante:</h2>
            <ol>
                <li><strong>Investiga a la Empresa:</strong> Demuestra que conoces la empresa y cómo tus habilidades encajan con sus necesidades.</li>
                <li><strong>Sé Específico:</strong> No envíes cartas genéricas. Adapta cada carta a la oferta de empleo específica.</li>
                <li><strong>Destaca tus Logros:</strong> En lugar de solo listar tus responsabilidades, menciona logros concretos y cuantificables.</li>
                <li><strong>Muestra tu Personalidad:</strong> La carta es una oportunidad para mostrar tu entusiasmo y tu ajuste cultural con la empresa.</li>
                <li><strong>Cuida la Ortografía y Gramática:</strong> Un error puede dar una mala impresión. ¡Revísala varias veces!</li>
            </ol>

            <h2>Ejemplo de Carta de Presentación (Adaptar):</h2>
            <p>[Tu Nombre Completo]<br/>[Tu Dirección]<br/>[Tu Número de Teléfono]<br/>[Tu Correo Electrónico]</p>
            <p>[Fecha]</p>
            <p>[Nombre del Contacto o Departamento de Recursos Humanos]<br/>[Título del Contacto]<br/>[Nombre de la Empresa]<br/>[Dirección de la Empresa]</p>
            <p><strong>Asunto: Postulación a la posición de [Nombre de la Posición]</strong></p>
            <p>Estimado/a [Sr./Sra. Apellido del Contacto],</p>
            <p>Escribo para expresar mi gran interés en la posición de [Nombre de la Posición] publicada en [Dónde viste la oferta - por ejemplo, BuscAdis]. Con mi experiencia en [Menciona tu área de experiencia] y mi pasión por [Menciona algo relevante de la empresa o el sector], estoy convencido/a de que puedo contribuir significativamente a su equipo en Cusco.</p>
            <p>En mi anterior rol en [Nombre de la Empresa Anterior], logré [Menciona un logro específico y cuantificable]. Estoy ansioso/a por aplicar estas habilidades y mi entusiasmo por el sector en [Nombre de la Empresa].</p>
            <p>Adjunto mi currículum vitae para su revisión y quedo a su disposición para una entrevista donde pueda detallar cómo mis habilidades y experiencia se alinean con los objetivos de [Nombre de la Empresa].</p>
            <p>Agradezco de antemano su tiempo y consideración.</p>
            <p>Atentamente,<br/>[Tu Nombre Completo]</p>
        `,
        featuredImage: '/images/blog/carta-presentacion.jpg', // Reemplaza con una imagen relevante
        author: { name: 'BuscAdis', avatar: '/images/logo-buscadis.png' }, // Reemplaza con tu información
        category: categories.find(cat => cat.slug === 'empleos'),
        tags: [],
        readingTime: 11,
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        publishedAt: new Date().toISOString(),
        seo: { title: 'Cómo Escribir una Carta de Presentación Impactante en Perú', description: 'Consejos y ejemplo de carta de presentación para el mercado laboral peruano.', keywords: ['carta de presentación', 'empleo', 'peru', 'buscar trabajo', 'consejos'] },
        status: 'published',
        featured: false,
        premium: false,
    },
    // ... (Aquí añadirás los 21 artículos restantes para las otras categorías) ...
];