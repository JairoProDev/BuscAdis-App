# Buscadis - Marketplace App

A modern classifieds and marketplace application built with Next.js, MongoDB, and TypeScript.

## Features

- Responsive design for mobile and desktop
- Publication listings by category
- Search functionality with filters
- User authentication
- Image uploads for publications
- WhatsApp integration for contacting sellers
- Sharing publications via social media

## Prerequisites

- Node.js 16.x or later
- MongoDB (Atlas or local)
- Git

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_DB=buscadis

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: AWS S3 for image uploads
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

# Google Maps Integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/buscadis.git
cd buscadis
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Database Setup

The application requires MongoDB collections for each category. You can seed the database with sample data:

```bash
node src/scripts/seed-publications.js
```

This will create the necessary collections and populate them with sample publications.

## Deployment

The application can be deployed to Vercel:

```bash
npm run build
vercel --prod
```

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. Check your MongoDB Atlas IP whitelist settings
2. Verify your connection string in the `.env.local` file
3. Ensure your MongoDB user has the proper permissions
4. Try increasing connection timeout settings

```js
// Example of extended timeout settings
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});
```

### API Error Responses

If you see API errors in the application:

1. Check the browser console for detailed error messages
2. Verify that your MongoDB collections exist and contain data
3. Look at the server logs for any backend errors
4. Try running the seeding script to populate the database

### Build Errors

For build errors:

1. Make sure all dependencies are installed: `npm install`
2. Clear the Next.js cache: `rm -rf .next`
3. Update Node.js to the latest LTS version
4. Verify your TypeScript configuration in `tsconfig.json`

## Project Structure

```
.
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages and layouts
│   ├── components/     # React components
│   ├── lib/            # Utility functions and configurations
│   │   ├── mongodb.ts  # MongoDB client configuration
│   │   └── ...
│   ├── scripts/        # Database scripts and tools
│   └── ...
├── .env.local          # Environment variables (create this)
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## License

MIT

## Modelo de Datos para Publicaciones

A continuación se detalla la estructura estándar para el modelo de datos de publicaciones:

```javascript
{
  // Identificación básica
  "id": "string", // ID único de la publicación (generado por el sistema)
  "title": "string", // Título descriptivo de la publicación
  "description": "string", // Descripción detallada de la publicación
  
  // Detalles de precio
  "price": "number", // Monto del precio (0 si no aplica)
  "currency": "string", // Moneda (PEN, USD, etc.)
  "price_type": "string", // Tipo de precio: "fixed", "negotiable", "free", "exchange"
  
  // Categorización
  "category": "string", // Categoría principal (empleos, inmuebles, vehiculos, servicios, etc.)
  "categorySlug": "string", // Slug de la categoría para URLs
  "subcategory": "string", // Subcategoría (opcional)
  "subsubcategory": "string", // Sub-subcategoría (opcional)
  
  // Ubicación
  "location": {
    "city": "string", // Ciudad
    "region": "string", // Región/Departamento
    "district": "string", // Distrito (opcional)
    "address": "string", // Dirección (opcional)
    "latitude": "number", // Coordenada latitud (opcional)
    "longitude": "number", // Coordenada longitud (opcional)
    "reference": "string" // Referencia de ubicación (opcional)
  },
  
  // Información de contacto
  "contact": {
    "name": "string", // Nombre del contacto
    "phone": "string", // Teléfono (opcional)
    "whatsapp": "string", // WhatsApp (opcional)
    "email": "string", // Email (opcional)
    "preferredMethod": "string" // Método preferido de contacto: "phone", "whatsapp", "email"
  },
  
  // Multimedia
  "images": [
    {
      "url": "string", // URL de la imagen
      "thumbnailUrl": "string", // URL de la miniatura (opcional)
      "description": "string", // Descripción de la imagen (opcional)
      "order": "number" // Orden de visualización
    }
  ],
  
  // Atributos específicos según categoría
  "attributes": {
    // Para empleos
    "tipo_trabajo": "string", // Tiempo completo, medio tiempo, etc.
    "salario": "string", // Descripción del salario
    "requisitos": ["string"], // Lista de requisitos
    "beneficios": ["string"], // Lista de beneficios
    
    // Para inmuebles
    "area": "number", // Área en metros cuadrados
    "dormitorios": "number", // Número de dormitorios
    "baños": "number", // Número de baños
    "antigüedad": "number", // Antigüedad en años
    "estacionamientos": "number", // Número de estacionamientos
    
    // Para vehículos
    "marca": "string", // Marca del vehículo
    "modelo": "string", // Modelo del vehículo
    "año": "number", // Año del vehículo
    "kilometraje": "number", // Kilometraje
    "combustible": "string", // Tipo de combustible
    "transmision": "string", // Tipo de transmisión
    
    // Otros atributos específicos según sea necesario
  },
  
  // Estado y fechas
  "status": "string", // Estado: "active", "paused", "sold", "expired", "deleted"
  "created_at": "string", // Fecha de creación (ISO format)
}
```

## Google Maps Integration

This application uses Google Maps Platform for displaying locations of publications. To set up the map functionality:

1. Create a Google Cloud Platform account at https://console.cloud.google.com/
2. Create a new project
3. Enable the following APIs in your project:
   - Maps JavaScript API
   - Geocoding API
   - Places API

4. Create an API key:
   - Go to "Credentials" in the Google Cloud Console
   - Click "Create credentials" > "API key"
   - Restrict the API key to the above APIs and your domain for security
   
5. Add your API key to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

6. Restart your development server

Note: The free tier of Google Maps Platform includes:
- 10,000 free map loads per month
- 10,000 free calls for other Essentials SKUs

For more information, see [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/).

## 🔧 Mejoras de Responsive Implementadas

### 📱 Mobile First Design
- **Header optimizado**: Muestra solo el primer nombre en mobile para ahorrar espacio
- **Buscador mejorado**: Botón de búsqueda es solo una lupa en mobile, texto completo en desktop
- **Selector de categorías**: Icono SVG apropiado en lugar de emoji, más compacto
- **Layout de resultados**: "Todas las oportunidades" aparece encima de los controles en mobile

### 🎨 Cards de Publicaciones Optimizados
- **Altura adaptativa**: Cards más compactos en mobile (240px min) vs desktop (320px min)
- **Imágenes responsive**: 120px en mobile, 160px tablet, 180px desktop
- **Tipografía escalable**: Textos más pequeños en mobile que se agrandan en pantallas mayores
- **Grid inteligente**: 2 columnas mobile, 3 tablet, 4 desktop con gaps apropiados
- **Mejor aprovechamiento del espacio**: Padding y margins reducidos en mobile

### 🔍 Buscador Avanzado
- **Selector de categorías mejorado**: Con iconos SVG y dropdown responsive
- **Botones de acción optimizados**: Búsqueda por voz solo en desktop
- **Colores actualizados**: Cambio de azul a teal para mejor consistencia
- **Layout flexible**: Se adapta automáticamente al tamaño de pantalla

### 📊 Layout de Resultados
- **Controles reorganizados**: Vista y ordenamiento debajo del título en mobile
- **Responsive breakpoints**: lg:flex-row para desktop, flex-col para mobile
- **Botones optimizados**: Textos largos ocultos en mobile, solo íconos visibles
- **Mejor usabilidad**: Dropdown de ordenamiento con texto "Ordenar" en mobile

### 🎯 Mejoras de UX
- **Navegación simplificada**: Información del usuario más concisa
- **Interacciones táctiles**: Botones y elementos con tamaño mínimo para touch
- **Legibilidad mejorada**: Mejor contraste y tamaños de fuente escalables
- **Velocidad de carga**: CSS optimizado para renderizado más rápido

---
