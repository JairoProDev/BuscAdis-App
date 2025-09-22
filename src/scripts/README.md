# Scripts de Administración de Datos para Buscadis

Este directorio contiene scripts para administrar y gestionar los datos de publicaciones de la plataforma Buscadis. Los scripts están diseñados para ayudarte a eliminar datos de prueba y cargar datos reales para producción.

## Configuración Previa

Antes de ejecutar cualquier script, asegúrate de tener configurado correctamente el entorno:

1. Instala las dependencias necesarias:
   ```
   npm install mongodb dotenv cloudinary
   ```

2. Verifica que el archivo `.env.local` contenga las variables de entorno correctas:
   ```
   MONGODB_URI=tu_uri_de_mongodb
   MONGODB_DB=nombre_de_tu_base_de_datos
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

3. Para obtener las credenciales de Cloudinary:
   - Crea una cuenta en [Cloudinary](https://cloudinary.com/)
   - En el Dashboard de Cloudinary, encontrarás tu Cloud Name, API Key y API Secret
   - Copia estos valores a tu archivo `.env.local`

## Scripts Disponibles

### 1. Limpieza de Base de Datos (`clean-database.js`)

Este script permite eliminar todos los adisos de la base de datos para empezar desde cero con datos reales.

#### Uso Básico:
```
node src/scripts/clean-database.js
```

#### Opciones:
- `--dry-run`: Simula la eliminación sin eliminar realmente los datos
- `--force`: Ejecuta sin pedir confirmación (¡usar con precaución!)
- `--category=nombre`: Limpia solo una categoría específica (ej: `--category=inmuebles`)

#### Ejemplos:
```
# Simular limpieza para ver qué se eliminaría
node src/scripts/clean-database.js --dry-run

# Limpiar solo la categoría de vehículos
node src/scripts/clean-database.js --category=vehiculos

# Forzar limpieza de todas las categorías sin pedir confirmación
node src/scripts/clean-database.js --force
```

### 2. Importación de Publicaciones (`import-publications.js`)

Este script permite importar publicaciones desde archivos JSON a la base de datos.

#### Uso Básico:
```
node src/scripts/import-publications.js ruta/al/archivo.json
```

#### Opciones:
- `--dry-run`: Simula la importación sin insertar realmente los datos
- `--force`: Ejecuta sin pedir confirmación
- `--validate-only`: Solo valida el formato del archivo sin importar

#### Ejemplos:
```
# Validar un archivo sin importarlo
node src/scripts/import-publications.js datos/empleos.json --validate-only

# Simular importación para ver qué se importaría
node src/scripts/import-publications.js datos/inmuebles.json --dry-run

# Importar datos forzando sin confirmación
node src/scripts/import-publications.js datos/productos.json --force
```

### 3. Carga de Publicaciones con Imágenes (`upload-publication-with-images.js`)

Este script permite subir publicaciones completas incluyendo imágenes a Cloudinary y guardarlas en la base de datos MongoDB.

#### Uso Básico:
```
node src/scripts/upload-publication-with-images.js ruta/al/datos.json ruta/directorio/imagenes
```

#### Estructura del Directorio de Imágenes:
El script busca imágenes cuyo nombre de archivo comience con el ID de la publicación. Por ejemplo:
- Para una publicación con ID `inmueble_001`, las imágenes deben nombrarse:
  - `inmueble_001_1.jpg`
  - `inmueble_001_2.jpg`
  - `inmueble_001_principal.jpg`
  - etc.

#### Funcionamiento:
1. Lee los datos de las publicaciones desde el archivo JSON
2. Para cada publicación, busca imágenes relacionadas en el directorio especificado
3. Sube las imágenes a Cloudinary, organizadas en carpetas según la categoría
4. Guarda la publicación en MongoDB con las URL de las imágenes

#### Ejemplos:
```
# Subir publicaciones de ejemplo con sus imágenes
node src/scripts/upload-publication-with-images.js src/scripts/sample-publication-data.json data/images/

# Subir publicaciones de una categoría específica
node src/scripts/upload-publication-with-images.js datos/inmuebles.json imagenes/inmuebles/
```

## Plantilla para Datos JSON

El archivo `publication-template.json` incluye ejemplos de cada tipo de publicación para que puedas crear tus propios archivos de datos siguiendo la misma estructura. Adicionalmente, `sample-publication-data.json` proporciona ejemplos más específicos para probar con el script de carga de imágenes.

### Estructura básica de una publicación:

```json
{
  "id": "identificador_unico",
  "title": "Título de la publicación",
  "description": "Descripción detallada",
  "category": "categoria",
  "subcategory": "subcategoria",
  "price": 1000,
  "currency": "PEN",
  "location": {
    "city": "Ciudad",
    "region": "Región",
    "district": "Distrito",
    "address": "Dirección opcional",
    "latitude": -12.123456,
    "longitude": -77.123456
  },
  "contactName": "Nombre de contacto",
  "contactEmail": "email@ejemplo.com",
  "contactPhone": "+51999888777",
  "images": ["url1.jpg", "url2.jpg"],
  "features": {
    // Campos específicos según la categoría
  },
  "status": "active"
}
```

## Integración con Cloudinary

Los scripts utilizan Cloudinary para gestionar imágenes con las siguientes características:

1. **Organización en Carpetas**: Las imágenes se organizan automáticamente en carpetas según la categoría de la publicación (`buscadis/inmuebles`, `buscadis/vehiculos`, etc.).

2. **Transformaciones de Imágenes**: Puedes obtener versiones optimizadas de las imágenes usando los helpers de `src/utils/image-helpers.ts`.

3. **URLs Seguras**: Todas las URLs generadas son HTTPS para mayor seguridad.

4. **Optimización Automática**: Cloudinary optimiza automáticamente las imágenes para mejorar el rendimiento.

## Flujo de Trabajo Recomendado

Para migrar de datos de prueba a datos reales con imágenes:

1. Haz una copia de seguridad de la base de datos actual (opcional).
2. Ejecuta el script de limpieza para eliminar los datos de prueba.
3. Prepara tus archivos JSON con datos reales usando la plantilla.
4. Organiza las imágenes en un directorio, nombrándolas con el ID de la publicación.
5. Ejecuta el script de carga de publicaciones con imágenes.

## Notas Importantes

- **Seguridad**: Los scripts realizan operaciones destructivas. Utiliza siempre primero `--dry-run` para verificar los cambios.
- **Respaldos**: Considera hacer una copia de seguridad antes de ejecutar operaciones de limpieza.
- **Límites de Cloudinary**: El plan gratuito de Cloudinary tiene límites (25GB de almacenamiento y 25K transformaciones/mes).
- **Rendimiento**: Para importaciones muy grandes, considera dividir los datos en varios archivos más pequeños. 