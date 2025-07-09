import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/temp/',
          '/draft/',
          '/preview/',
          '*.json',
          '*.xml',
          '/search?*',
          '/buscar?*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/temp/',
          '/draft/',
          '/preview/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/temp/',
          '/draft/',
          '/preview/',
        ],
      },
    ],
    sitemap: 'https://buscadis.com/sitemap.xml',
    host: 'https://buscadis.com',
  };
} 