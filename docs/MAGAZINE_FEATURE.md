# Revista Digital - Funcionalidad de Revista Digital para Buscadis

Esta funcionalidad permite a los usuarios ver y descargar una revista digital que contiene todos los anuncios clasificados de Buscadis en formato PDF.

## Características

- Generación automática de revista digital en formato PDF
- Visualización y descarga desde la web
- Agrupación de anuncios por categorías
- Diseño profesional con portada, índice y contenido estructurado
- Panel de administración para generar nuevas revistas y gestionar las existentes

## Configuración Técnica

### 1. Dependencias

Las siguientes dependencias son necesarias para el funcionamiento de la revista digital:

```bash
npm install jspdf jspdf-autotable
```

### 2. Configuración de MongoDB

1. La funcionalidad utiliza MongoDB Atlas para almacenar tanto los metadatos de las revistas como los archivos PDF generados. Se crean las siguientes colecciones:

```javascript
// Colección 'magazines' para almacenar los metadatos de las revistas
{
  _id: ObjectId, // ID único generado automáticamente
  pdfUrl: String, // URL para descargar el PDF
  filename: String, // Nombre del archivo
  fileId: ObjectId, // ID del archivo en GridFS
  publicationCount: Number, // Número de publicaciones en la revista
  createdAt: Date // Fecha de creación
}

// GridFS para almacenar los archivos PDF
// MongoDB creará automáticamente dos colecciones:
// - magazines.files: metadatos de los archivos
// - magazines.chunks: contenido binario de los archivos
```

2. No se requiere configuración adicional ya que se está utilizando el mismo MongoDB Atlas que ya está configurado para las publicaciones.

### 3. APIs disponibles

#### Obtener revista(s)
- Endpoint: `/api/magazine`
- Método: GET
- Parámetros: `limit` (opcional, por defecto 1)
- Descripción: Obtiene la revista más reciente o varias revistas según el límite
- Respuesta (una revista): 
  ```json
  {
    "magazine": {
      "_id": "655e789...",
      "pdfUrl": "/api/magazine/download/655e789...",
      "filename": "buscadis-revista-20231122-123456.pdf",
      "fileId": "655e789...",
      "publicationCount": 120,
      "createdAt": "2023-11-22T12:34:56.789Z"
    }
  }
  ```
- Respuesta (múltiples revistas):
  ```json
  {
    "magazines": [
      {
        "_id": "655e789...",
        "pdfUrl": "/api/magazine/download/655e789...",
        "filename": "buscadis-revista-20231122-123456.pdf",
        "fileId": "655e789...",
        "publicationCount": 120,
        "createdAt": "2023-11-22T12:34:56.789Z"
      },
      // ...más revistas
    ]
  }
  ```

#### Generación de revista
- Endpoint: `/api/magazine/generate`
- Método: POST
- Descripción: Genera una nueva revista digital a partir de todas las publicaciones activas
- Respuesta: 
  ```json
  {
    "success": true,
    "pdfUrl": "/api/magazine/download/655e789...",
    "publicationCount": 120,
    "createdAt": "2023-11-22T12:34:56.789Z",
    "magazineId": "655e789..."
  }
  ```

#### Descarga de revista
- Endpoint: `/api/magazine/download/[fileId]`
- Método: GET
- Descripción: Descarga la revista en formato PDF
- Respuesta: Archivo PDF

#### Eliminación de revista
- Endpoint: `/api/magazine/delete`
- Método: DELETE
- Cuerpo de la solicitud: 
  ```json
  {
    "fileId": "655e789...",
    "magazineId": "655e789..."
  }
  ```
- Respuesta: 
  ```json
  {
    "success": true,
    "message": "Revista eliminada correctamente"
  }
  ```

## Uso para Administradores

1. Acceder al panel de administración: `/admin/revista`
2. En esta página se pueden realizar las siguientes acciones:
   - Ver el historial de revistas generadas
   - Generar una nueva revista con los anuncios actuales
   - Descargar cualquier revista generada anteriormente
   - Eliminar revistas que ya no sean necesarias

## Uso para Usuarios

1. Acceder a la página de revista digital: `/revista`
2. En esta página los usuarios pueden:
   - Ver la última revista generada
   - Descargar la revista en formato PDF
   - Solicitar la generación de una nueva revista (si tienen permisos)

## Personalización del Diseño

El diseño de la revista se puede personalizar modificando las funciones en el archivo `pdf-generator.service.ts`. Algunos aspectos que se pueden personalizar:

- Colores y estilos de la portada
- Formato de visualización de las publicaciones
- Organización de categorías
- Diseño del índice
- Información de contacto y pie de página

## Funcionamiento Interno

1. Cuando se solicita una generación de revista:
   - Se obtienen todas las publicaciones activas de las colecciones de MongoDB
   - Se agrupan por categoría para mejor organización
   - Se genera un PDF con portada, índice y secciones por categoría
   - El PDF se sube a MongoDB GridFS
   - Se guarda un registro de la revista en la colección `magazines`

2. La revista se actualiza bajo demanda o cuando un administrador la genera manualmente.

## Solución de Problemas

Si la generación de la revista falla, verificar:

1. Que existen publicaciones activas en la base de datos
2. Que las permisos de MongoDB estén correctamente configurados
3. Que las dependencias estén instaladas (jspdf, jspdf-autotable)
4. Revisar los logs del servidor para identificar errores específicos 