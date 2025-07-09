'use client';

import React from 'react';
import Head from 'next/head';
import { PublicationData } from '@/types/publication';

interface PublicationSEOProps {
  publication: PublicationData;
  canonicalUrl: string;
  relatedPublications?: PublicationData[];
}

export default function PublicationSEO({ 
  publication, 
  canonicalUrl, 
  relatedPublications = [] 
}: PublicationSEOProps) {
  
  // Helper function to get category display name
  const getCategoryDisplayName = (categorySlug: string) => {
    const categoryNames: Record<string, string> = {
      'empleos': 'Empleos',
      'inmuebles': 'Inmuebles',
      'vehiculos': 'Vehículos',
      'servicios': 'Servicios',
      'productos': 'Productos',
      'eventos': 'Eventos',
      'negocios': 'Negocios',
      'comunidad': 'Comunidad'
    };
    return categoryNames[categorySlug] || 'Categoría';
  };

  // Helper function to get schema type
  const getSchemaType = (categorySlug: string) => {
    switch (categorySlug) {
      case 'empleos': return 'JobPosting';
      case 'inmuebles': return 'Product';
      case 'vehiculos': return 'Product';
      case 'servicios': return 'Service';
      case 'productos': return 'Product';
      case 'eventos': return 'Event';
      case 'negocios': return 'Product';
      case 'comunidad': return 'Organization';
      default: return 'Product';
    }
  };

  // Generate advanced structured data for SEO
  const generateAdvancedStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": getSchemaType(publication.categorySlug),
      "name": publication.title,
      "description": publication.description,
      "image": publication.images?.[0] || 'https://buscadis.com/images/buscadis-og-image.jpg',
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "datePosted": publication.createdAt,
      "dateModified": publication.updatedAt || publication.createdAt,
      "author": {
        "@type": "Organization",
        "name": "BuscAdis",
        "url": "https://buscadis.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BuscAdis",
        "logo": {
          "@type": "ImageObject",
          "url": "https://buscadis.com/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": typeof window !== 'undefined' ? window.location.href : ''
      }
    };

    // Add category-specific structured data
    switch (publication.categorySlug) {
      case 'empleos':
        return {
          ...baseData,
          "@type": "JobPosting",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "BuscAdis",
            "sameAs": "https://buscadis.com"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": publication.location?.district || '',
              "addressRegion": publication.location?.province || '',
              "addressCountry": "PE"
            }
          },
          "employmentType": publication.attributes?.employmentType || "FULL_TIME",
          "salaryCurrency": publication.currency || "PEN",
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": publication.currency || "PEN",
            "value": publication.value || 0
          }
        };
      
      case 'inmuebles':
        return {
          ...baseData,
          "@type": "Product",
          "category": "Real Estate",
          "brand": {
            "@type": "Brand",
            "name": "BuscAdis"
          },
          "offers": {
            "@type": "Offer",
            "price": publication.value || 0,
            "priceCurrency": publication.currency || "PEN",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "BuscAdis"
            }
          },
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Habitaciones",
              "value": publication.attributes?.rooms || "N/A"
            },
            {
              "@type": "PropertyValue", 
              "name": "Baños",
              "value": publication.attributes?.bathrooms || "N/A"
            }
          ]
        };

      case 'vehiculos':
        return {
          ...baseData,
          "@type": "Product",
          "category": "Vehicle",
          "brand": {
            "@type": "Brand",
            "name": publication.attributes?.brand || "N/A"
          },
          "model": publication.attributes?.model || "N/A",
          "vehicleModelDate": publication.attributes?.year?.toString() || "N/A",
          "offers": {
            "@type": "Offer",
            "price": publication.value || 0,
            "priceCurrency": publication.currency || "PEN",
            "availability": "https://schema.org/InStock"
          }
        };

      default:
        return {
          ...baseData,
          "@type": "Product",
          "offers": {
            "@type": "Offer",
            "price": publication.value || 0,
            "priceCurrency": publication.currency || "PEN",
            "availability": "https://schema.org/InStock"
          }
        };
    }
  };

  // Generate breadcrumb structured data
  const generateBreadcrumbData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://buscadis.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": getCategoryDisplayName(publication.categorySlug),
          "item": `https://buscadis.com/${publication.categorySlug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": publication.subcategorySlug || 'General',
          "item": `https://buscadis.com/${publication.categorySlug}/${publication.subcategorySlug || 'general'}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": publication.title,
          "item": typeof window !== 'undefined' ? window.location.href : ''
        }
      ]
    };
  };

  // Generate FAQ structured data
  const generateFAQData = () => {
    const faqs = [
      {
        "@type": "Question",
        "name": "¿Cómo puedo contactar al vendedor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes contactar al vendedor directamente a través de WhatsApp usando el botón de contacto en la publicación."
        }
      },
      {
        "@type": "Question", 
        "name": "¿Los precios son negociables?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La negociabilidad depende del vendedor. Te recomendamos contactar directamente para consultar."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo puedo verificar la autenticidad de la publicación?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "BuscAdis verifica todas las publicaciones, pero siempre es recomendable hacer preguntas específicas al vendedor."
        }
      }
    ];

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs
    };
  };

  // Generate organization structured data
  const generateOrganizationData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "BuscAdis",
      "url": "https://buscadis.com",
      "logo": "https://buscadis.com/logo.png",
      "description": "Plataforma de clasificados y marketplace líder en Perú",
      "sameAs": [
        "https://facebook.com/buscadis",
        "https://twitter.com/buscadis", 
        "https://instagram.com/buscadis"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+51-1-123-4567",
        "contactType": "customer service",
        "areaServed": "PE",
        "availableLanguage": "Spanish"
      }
    };
  };

  // Generate WebSite structured data
  const generateWebSiteData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BuscAdis",
      "url": "https://buscadis.com",
      "description": "Plataforma de clasificados y marketplace líder en Perú",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://buscadis.com/buscar?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
  };

  const structuredData = generateAdvancedStructuredData();
  const breadcrumbData = generateBreadcrumbData();
  const faqData = generateFAQData();
  const organizationData = generateOrganizationData();
  const websiteData = generateWebSiteData();

  // Truncate description for meta tags
  const truncatedDescription = publication.description.length > 160 
    ? publication.description.substring(0, 157) + '...' 
    : publication.description;

  const ogDescription = publication.description.length > 200 
    ? publication.description.substring(0, 197) + '...' 
    : publication.description;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{`${publication.title} - ${getCategoryDisplayName(publication.categorySlug)} | BuscAdis`}</title>
      <meta name="title" content={`${publication.title} - ${getCategoryDisplayName(publication.categorySlug)} | BuscAdis`} />
      <meta name="description" content={truncatedDescription} />
      <meta name="keywords" content={`${publication.categorySlug}, ${publication.title}, ${publication.location?.city || 'Perú'}, ${publication.location?.district || ''}, BuscAdis, marketplace, clasificados`} />
      <meta name="author" content="BuscAdis" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://buscadis.com${canonicalUrl}`} />
      
      {/* Language and Region */}
      <meta name="language" content="es" />
      <meta name="geo.region" content="PE" />
      <meta name="geo.placename" content={publication.location?.city || 'Lima'} />
      
      {/* Open Graph - Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://buscadis.com${canonicalUrl}`} />
      <meta property="og:title" content={`${publication.title} - ${getCategoryDisplayName(publication.categorySlug)}`} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={publication.images?.[0] || 'https://buscadis.com/images/buscadis-og-image.jpg'} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={publication.title} />
      <meta property="og:site_name" content="BuscAdis" />
      <meta property="og:locale" content="es_PE" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@buscadis" />
      <meta name="twitter:title" content={`${publication.title} - ${getCategoryDisplayName(publication.categorySlug)}`} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={publication.images?.[0] || 'https://buscadis.com/images/buscadis-og-image.jpg'} />
      <meta name="twitter:image:alt" content={publication.title} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0d9488" />
      <meta name="msapplication-TileColor" content="#0d9488" />
      
      {/* Price and Availability */}
      {publication.value && (
        <>
          <meta property="product:price:amount" content={publication.value.toString()} />
          <meta property="product:price:currency" content={publication.currency || 'PEN'} />
        </>
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData)
          }}
        />
      )}
      
      {/* FAQ Structured Data */}
      {faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqData)
          }}
        />
      )}
      
      {/* Organization Structured Data */}
      {organizationData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData)
          }}
        />
      )}
      
      {/* WebSite Structured Data */}
      {websiteData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteData)
          }}
        />
      )}
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical images */}
      {publication.images?.[0] && (
        <link rel="preload" as="image" href={publication.images[0]} />
      )}
      
      {/* Additional performance optimizations */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Security headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
    </Head>
  );
} 