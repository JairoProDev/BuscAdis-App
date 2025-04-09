# Scripts de Administración de Datos para Buscadis

Este directorio contiene scripts para administrar y gestionar los datos de publicaciones de la plataforma Buscadis. Los scripts están diseñados para ayudarte a eliminar datos de prueba y cargar datos reales para producción.

## Configuración Previa

Antes de ejecutar cualquier script, asegúrate de tener configurado correctamente el entorno:

1. Instala las dependencias necesarias:
   ```
   npm install mongodb dotenv
   ```

2. Verifica que el archivo `.env.local` contenga las variables de entorno correctas:
   ```
   MONGODB_URI=tu_uri_de_mongodb
   MONGODB_DB=nombre_de_tu_base_de_datos
   ```

## Scripts Disponibles

### 1. Limpieza de Base de Datos (`clean-database.js`)

Este script permite eliminar todos los anuncios de la base de datos para empezar desde cero con datos reales.

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

## Plantilla para Datos JSON

El archivo `publication-template.json` incluye ejemplos de cada tipo de publicación para que puedas crear tus propios archivos de datos siguiendo la misma estructura.

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

### Recomendaciones para Crear Archivos JSON:

1. Crea archivos separados por categoría para facilitar la gestión.
2. Incluye entre 20-100 publicaciones por archivo para un manejo eficiente.
3. Asegúrate de que cada publicación tenga un ID único.
4. Verifica que las categorías y subcategorías sean válidas.
5. Utiliza imágenes reales y datos precisos para mejorar la calidad de los datos.

## Flujo de Trabajo Recomendado

Para migrar de datos de prueba a datos reales:

1. Haz una copia de seguridad de la base de datos actual (opcional).
2. Ejecuta el script de limpieza con `--dry-run` para verificar qué se eliminaría.
3. Ejecuta el script de limpieza sin `--dry-run` para eliminar los datos de prueba.
4. Prepara tus archivos JSON con datos reales usando la plantilla.
5. Valida tus archivos JSON con `--validate-only`.
6. Importa cada archivo con `--dry-run` para verificar la importación.
7. Importa definitivamente tus datos reales sin `--dry-run`.

## Notas Importantes

- **Seguridad**: Los scripts realizan operaciones destructivas. Utiliza siempre primero `--dry-run` para verificar los cambios.
- **Respaldos**: Considera hacer una copia de seguridad antes de ejecutar operaciones de limpieza.
- **Rendimiento**: Para importaciones muy grandes, considera dividir los datos en varios archivos más pequeños.
- **Ambiente**: Estos scripts están pensados para entornos de desarrollo y staging. Ten precaución al usarlos en producción. 