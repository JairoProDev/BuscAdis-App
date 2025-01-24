import { Post, Author, Category, Tag } from '@/types/blog'

// Autores de ejemplo
export const authors: Author[] = [
  {
    id: '1',
    name: 'María González',
    avatar: '/authors/maria.jpg',
    bio: 'Experta en marketing digital y estrategias de contenido. Con más de 10 años de experiencia en el sector inmobiliario.',
    role: 'Content Strategist',
    social: {
      twitter: 'https://twitter.com/mariagonzalez',
      linkedin: 'https://linkedin.com/in/mariagonzalez'
    }
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    avatar: '/authors/carlos.jpg',
    bio: 'Especialista en tecnología y desarrollo web. Apasionado por la innovación y las últimas tendencias digitales.',
    role: 'Tech Lead',
    social: {
      twitter: 'https://twitter.com/carlosrodriguez',
      github: 'https://github.com/carlosrodriguez'
    }
  }
]

// Categorías de ejemplo
export const categories: Category[] = [
  {
    id: '1',
    name: 'Marketing Digital',
    slug: 'marketing-digital',
    description: 'Estrategias y consejos para mejorar tu presencia online',
    featuredImage: '/categories/marketing.jpg'
  },
  {
    id: '2',
    name: 'Tecnología',
    slug: 'tecnologia',
    description: 'Las últimas novedades en el mundo tech',
    featuredImage: '/categories/tech.jpg'
  },
  {
    id: '3',
    name: 'Negocios',
    slug: 'negocios',
    description: 'Tips y estrategias para hacer crecer tu negocio',
    featuredImage: '/categories/business.jpg'
  }
]

// Tags de ejemplo
export const tags: Tag[] = [
  {
    id: '1',
    name: 'SEO',
    slug: 'seo'
  },
  {
    id: '2',
    name: 'Redes Sociales',
    slug: 'redes-sociales'
  },
  {
    id: '3',
    name: 'E-commerce',
    slug: 'ecommerce'
  },
  {
    id: '4',
    name: 'Productividad',
    slug: 'productividad'
  }
]

// Posts de ejemplo
export const posts: Post[] = [
  {
    id: '1',
    title: 'Cómo optimizar tus anuncios para mejor visibilidad',
    slug: 'como-optimizar-anuncios-mejor-visibilidad',
    excerpt: 'Descubre las mejores prácticas para que tus anuncios destaquen y alcancen a más compradores potenciales.',
    content: `
      <h2>La importancia de un buen título</h2>
      <p>El título es lo primero que ven los usuarios...</p>
      
      <h2>Imágenes de calidad</h2>
      <p>Las imágenes son fundamentales para captar la atención...</p>
      
      <h2>Descripción detallada</h2>
      <p>Una descripción completa ayuda a los compradores...</p>
    `,
    featuredImage: '/posts/optimizar-anuncios.jpg',
    author: authors[0],
    category: categories[0],
    tags: [tags[0], tags[1]],
    readingTime: 8,
    views: 1250,
    likes: 45,
    shares: 12,
    comments: 8,
    publishedAt: '2024-01-15T10:00:00Z',
    seo: {
      title: 'Optimización de Anuncios: Guía Completa 2024',
      description: 'Aprende a optimizar tus anuncios para conseguir más visibilidad y ventas.',
      keywords: ['optimización', 'anuncios', 'marketing', 'ventas'],
      ogImage: '/posts/optimizar-anuncios-og.jpg'
    },
    status: 'published',
    featured: true,
    premium: false
  },
  {
    id: '2',
    title: 'Las tendencias de e-commerce que dominarán 2024',
    slug: 'tendencias-ecommerce-2024',
    excerpt: 'Análisis de las principales tendencias que transformarán el comercio electrónico este año.',
    content: `
      <h2>Inteligencia Artificial en E-commerce</h2>
      <p>La IA está revolucionando la forma en que compramos...</p>
      
      <h2>Comercio Social</h2>
      <p>Las redes sociales se están convirtiendo en...</p>
      
      <h2>Sostenibilidad</h2>
      <p>Los consumidores buscan cada vez más...</p>
    `,
    featuredImage: '/posts/ecommerce-trends.jpg',
    author: authors[1],
    category: categories[2],
    tags: [tags[2], tags[1]],
    readingTime: 12,
    views: 2300,
    likes: 89,
    shares: 34,
    comments: 15,
    publishedAt: '2024-01-20T14:30:00Z',
    seo: {
      title: 'Tendencias E-commerce 2024: Lo que viene',
      description: 'Descubre las tendencias que transformarán el e-commerce en 2024.',
      keywords: ['ecommerce', 'tendencias', '2024', 'comercio electrónico'],
      ogImage: '/posts/ecommerce-trends-og.jpg'
    },
    status: 'published',
    featured: true,
    premium: true
  }
] 