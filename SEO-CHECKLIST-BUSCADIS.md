# Checklist SEO Profesional para BuscAdis

## 1. Meta Tags Esenciales
- [ ] `<title>` único y descriptivo en cada página.
- [ ] `<meta name="description">` relevante, única y de longitud óptima (120-160 caracteres).
- [ ] `<meta name="keywords">` (opcional, pero puede ayudar en nichos).
- [ ] `<meta name="robots">` correctamente configurado (`index, follow` o `noindex, nofollow` según corresponda).
- [ ] `<link rel="canonical">` siempre presente y correcto.

## 2. Open Graph y Social
- [ ] `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:url">`.
- [ ] `<meta property="og:type">` adecuado (`website`, `article`, `product`, etc.).
- [ ] `<meta property="og:site_name">` y `<meta property="og:locale">`.
- [ ] Meta tags de Twitter Card (`summary_large_image`).

## 3. Structured Data (Schema.org)
- [ ] Datos estructurados para cada tipo de publicación (`Product`, `JobPosting`, `Service`, `Event`, etc.).
- [ ] Breadcrumbs (`BreadcrumbList`).
- [ ] Organization y WebSite.
- [ ] FAQPage si aplica.
- [ ] Validar con [Google Rich Results Test](https://search.google.com/test/rich-results).

## 4. Sitemap y Robots.txt
- [ ] Sitemap.xml dinámico y actualizado.
- [ ] robots.txt optimizado (permitir/desautorizar rutas según estrategia).
- [ ] Sitemap referenciado en robots.txt.

## 5. Performance y Core Web Vitals
- [ ] Imágenes optimizadas (`next/image`, lazy loading, formatos modernos).
- [ ] Uso de `<link rel="preload">` y `<link rel="preconnect">` para recursos críticos.
- [ ] Tiempos de carga bajos (LCP, FID, CLS en verde).
- [ ] Lighthouse score > 90 en SEO y Performance.

## 6. Accesibilidad y UX
- [ ] Todos los `<img>` tienen `alt` descriptivo y optimizado.
- [ ] Contraste de colores adecuado.
- [ ] Navegación por teclado y etiquetas ARIA donde corresponda.
- [ ] Tamaños de fuente y botones accesibles.

## 7. Indexación y Rastreo
- [ ] No hay páginas duplicadas o thin content indexadas.
- [ ] Redirecciones 301/302 bien implementadas.
- [ ] Páginas de error (`404`, `500`, etc.) con `noindex` y mensaje claro.
- [ ] Canonicalización correcta en todas las variantes de URL.

## 8. Internacionalización (i18n)
- [ ] `<html lang="es">` o el idioma correspondiente.
- [ ] Meta tags de región y localización (`geo.region`, `geo.placename`).
- [ ] Hreflang si tienes versiones en otros idiomas.

## 9. Analytics y Search Console
- [ ] Google Analytics y/o Matomo correctamente instalado.
- [ ] Google Search Console verificado y sin errores críticos.
- [ ] Monitorizar errores de rastreo y cobertura.

## 10. Contenido y Enlaces
- [ ] Contenido original, útil y bien estructurado (H1, H2, H3...).
- [ ] Enlaces internos relevantes y sin roturas.
- [ ] Enlaces externos con `rel="noopener noreferrer"` y `nofollow` si corresponde.
- [ ] URLs limpias, amigables y con palabras clave.

---

# Plantillas de Reporte SEO

## Plantilla de Auditoría SEO Mensual

```
# Reporte de Auditoría SEO - [Mes/Año]

## 1. Resumen Ejecutivo
- Estado general del SEO
- Principales mejoras y problemas detectados

## 2. Checklist SEO
- [ ] Meta tags correctos en todas las páginas
- [ ] Structured Data válido
- [ ] Sitemap y robots.txt actualizados
- [ ] Core Web Vitals en verde
- [ ] Sin errores de indexación

## 3. Resultados de Lighthouse
- SEO: [ ]
- Performance: [ ]
- Accesibilidad: [ ]
- Mejores prácticas: [ ]

## 4. Google Search Console
- Errores de cobertura: [ ]
- Problemas de mobile: [ ]
- Datos estructurados: [ ]

## 5. Acciones y Recomendaciones
- [ ]
- [ ]

---
```

## Plantilla de Incidencias SEO

```
# Incidencia SEO

- **Fecha:**
- **Página/URL afectada:**
- **Descripción del problema:**
- **Impacto estimado:**
- **Acción correctiva:**
- **Fecha de resolución:**
```

---

# Automatización de Auditorías SEO

## 1. Lighthouse CI
- Instala Lighthouse CI: `npm install -g @lhci/cli`
- Configura un script en `package.json`:
  ```json
  "scripts": {
    "seo-audit": "lhci autorun --collect.url=https://buscadis.com --collect.url=https://buscadis.com/empleos --collect.url=https://buscadis.com/inmuebles --collect.url=https://buscadis.com/vehiculos --collect.url=https://buscadis.com/servicios --collect.url=https://buscadis.com/productos --collect.url=https://buscadis.com/eventos --collect.url=https://buscadis.com/negocios --collect.url=https://buscadis.com/comunidad"
  }
  ```
- Ejecuta: `npm run seo-audit`
- Revisa los reportes generados en `.lighthouseci/`

## 2. Validación de datos estructurados
- Usa [Google Rich Results Test](https://search.google.com/test/rich-results) manualmente o automatiza con [schemavalidator.dev](https://schemavalidator.dev/).
- Puedes usar [lighthouse-plugin-schema](https://github.com/treosh/lighthouse-plugin-schema) para validar en CI.

## 3. Monitoreo de Sitemap y robots.txt
- Programa un cron job semanal para descargar y validar `sitemap.xml` y `robots.txt`:
  ```bash
  curl -s https://buscadis.com/sitemap.xml | grep '<loc>'
  curl -s https://buscadis.com/robots.txt
  ```

## 4. Google Search Console API
- Automatiza la descarga de reportes de cobertura y errores con la [API de Search Console](https://developers.google.com/webmaster-tools/search-console-api-original/v3/).

## 5. Alertas de caídas o errores SEO
- Usa servicios como [UptimeRobot](https://uptimerobot.com/) o [StatusCake](https://www.statuscake.com/) para monitorizar la disponibilidad y cambios en el SEO.

---

**¡Mantén este documento actualizado y revisa la checklist antes de cada despliegue importante!** 

## ¿Cómo automatizar las auditorías?

### 1. Lighthouse CI
- Instala con:  
  ```bash
  npm install -g @lhci/cli
  ```
- Agrega el script sugerido en tu `package.json`.
- Ejecuta:
  ```bash
  npm run seo-audit
  ```
- Obtendrás reportes automáticos de SEO y performance.

### 2. Validación de datos estructurados
- Usa el plugin de Lighthouse o servicios online para validar automáticamente en CI/CD.

### 3. Monitoreo de sitemap y robots.txt
- Programa un cron job semanal con los comandos de ejemplo para validar que estén accesibles y correctos.

### 4. Google Search Console API
- Automatiza la descarga de reportes de cobertura y errores para tener alertas tempranas.

### 5. Alertas de caídas
- Configura UptimeRobot o StatusCake para recibir notificaciones si tu web deja de estar disponible o cambia el SEO.