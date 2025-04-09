# Importación de Anuncios de Revista

Este documento explica cómo importar anuncios escaneados de revistas físicas a la base de datos de Buscadis utilizando nuestro script especializado.

## Estructura JSON para Anuncios

Los anuncios deben prepararse en un archivo JSON con la siguiente estructura:

```json
[
  {
    "id": "inmueble_001",                              // Opcional, se genera automáticamente si no existe
    "title": "Casa en venta en Distrito X",            // Obligatorio: título del anuncio
    "description": "Amplia casa de 3 dormitorios...",  // Obligatorio: descripción del anuncio
    "category": "inmuebles",                           // Obligatorio: categoría del anuncio
    "subcategory": "casas",                            // Opcional: subcategoría del anuncio
    "price": 250000,                                   // Precio (numérico)
    "currency": "PEN",                                 // Moneda (PEN o USD generalmente)
    "location": {                                      // Obligatorio: ubicación con al menos ciudad o distrito
      "city": "Lima",
      "region": "Lima",
      "district": "Distrito X",
      "address": "Calle Los Olivos 123",
      "latitude": -12.123456,                          // Opcional
      "longitude": -77.123456                          // Opcional
    },
    "contactName": "Juan Pérez",                       // Nombre del contacto
    "contactEmail": "correo@ejemplo.com",              // Email (obligatorio tener email o teléfono)
    "contactPhone": "+51987654321",                    // Teléfono (obligatorio tener email o teléfono)
    "images": [                                        // Array de URLs de imágenes (opcional)
      "https://example.com/imagen1.jpg",
      "https://example.com/imagen2.jpg"
    ],
    "features": {                                      // Características específicas según categoría
      // Campos específicos para cada categoría (ver ejemplos abajo)
    },
    "status": "active"                                 // Estado del anuncio (por defecto "active")
  },
  // Más anuncios...
]
```

## Campos específicos por categoría

### Inmuebles (`category: "inmuebles"`)

```json
"features": {
  "property_type": "casa",                             // Tipo de propiedad
  "operation_type": "sale",                            // Operación: "sale" o "rent"
  "area": 150,                                         // Área en m²
  "bedrooms": 3,                                       // Número de dormitorios
  "bathrooms": 2,                                      // Número de baños
  "parking": 1,                                        // Plazas de garaje
  "amenities": ["Jardín", "Patio trasero"]             // Comodidades
}
```

### Vehículos (`category: "vehiculos"`)

```json
"features": {
  "vehicle_type": "Sedan",                             // Tipo de vehículo
  "year_model": "2019",                                // Año del modelo
  "brand": "Toyota",                                   // Marca
  "model": "Corolla",                                  // Modelo
  "mileage": 45000,                                    // Kilometraje
  "fuel_type": "Gasolina",                             // Tipo de combustible
  "transmission": "Automática",                        // Transmisión
  "condition": "used"                                  // Estado: "new" o "used"
}
```

### Productos (`category: "productos"`)

```json
"features": {
  "product_type": "Electrodomésticos",                 // Tipo de producto
  "brand": "Samsung",                                  // Marca
  "model": "RT38K5530S8",                              // Modelo
  "condition": "new",                                  // Estado: "new", "used", "refurbished"
  "specifications": {                                  // Especificaciones (formato libre)
    "capacidad": "400 litros",
    "eficiencia": "A+"
  },
  "warranty": "12 meses oficial"                       // Garantía
}
```

### Servicios (`category: "servicios"`)

```json
"features": {
  "service_type": "Informática",                       // Tipo de servicio
  "price_type": "quote",                               // Tipo de precio: "fixed", "hourly", "quote"
  "availability": ["Lunes a Sábados", "9:00 - 19:00"], // Disponibilidad
  "service_area": ["Lima Metropolitana"],              // Áreas de servicio
  "experience_years": 5                                // Años de experiencia
}
```

### Empleos (`category: "empleos"`)

```json
"features": {
  "job_type": "Administrativo",                        // Tipo de trabajo
  "salary_range": "S/ 1,500 - S/ 2,000",               // Rango salarial
  "employment_type": "full-time",                      // Tipo de empleo: "full-time", "part-time", "contract"
  "experience_level": "Junior",                        // Nivel de experiencia
  "education_level": "Técnico",                        // Nivel educativo
  "requirements": [                                    // Requisitos
    "Experiencia mínima 1 año",
    "Conocimientos de Office"
  ],
  "benefits": [                                        // Beneficios
    "Planilla completa",
    "Seguro EPS"
  ]
}
```

## Uso del Script de Importación

Para importar anuncios desde un archivo JSON:

1. Asegúrate de tener Node.js instalado en tu sistema.
2. Preparar un archivo JSON con la estructura indicada (puedes basarte en el archivo `anuncios-revista.json` de ejemplo).
3. Ejecutar el script desde la raíz del proyecto:

```bash
# Importación normal
node src/scripts/import-anuncios-revista.js ruta/a/tu-archivo.json

# Validación sin importar
node src/scripts/import-anuncios-revista.js ruta/a/tu-archivo.json --validate-only

# Simulación (dry-run)
node src/scripts/import-anuncios-revista.js ruta/a/tu-archivo.json --dry-run

# Importación sin confirmación
node src/scripts/import-anuncios-revista.js ruta/a/tu-archivo.json --force
```

## Recomendaciones

1. **Imágenes**: Sube las imágenes a Cloudinary antes de incluir sus URLs en el JSON. Puedes usar el panel de Cloudinary para hacerlo manualmente.

2. **Validación**: Usa siempre la opción `--validate-only` primero para verificar que todos los anuncios son válidos.

3. **Datos mínimos**: Asegúrate de incluir al menos título, descripción, categoría, ubicación y un método de contacto para cada anuncio.

4. **MongoDB**: Asegúrate de que la base de datos MongoDB esté funcionando y accesible antes de ejecutar el script.

5. **Categorías disponibles**:
   - `empleos`
   - `inmuebles`
   - `vehiculos`
   - `servicios`
   - `productos` 
   - `eventos`
   - `negocios`
   - `comunidad` 