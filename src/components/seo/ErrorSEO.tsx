'use client';

import React from 'react';
import Head from 'next/head';

interface ErrorSEOProps {
  title?: string;
  description?: string;
  errorCode?: string;
}

export default function ErrorSEO({ 
  title = "Página no encontrada", 
  description = "La página que buscas no existe o ha sido movida.",
  errorCode = "404"
}: ErrorSEOProps) {
  
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{`${title} | BuscAdis`}</title>
      <meta name="title" content={`${title} | BuscAdis`} />
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="googlebot" content="noindex, nofollow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://buscadis.com/404" />
      
      {/* Open Graph - Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://buscadis.com/404" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://buscadis.com/images/buscadis-og-image.jpg" />
      <meta property="og:site_name" content="BuscAdis" />
      <meta property="og:locale" content="es_PE" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@buscadis" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://buscadis.com/images/buscadis-og-image.jpg" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0d9488" />
      
      {/* Security headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
    </Head>
  );
} 