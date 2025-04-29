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

### 2. Configuración de Supabase

1. Crear una nueva tabla `magazines` en la base de datos Supabase:

```sql
CREATE TABLE IF NOT EXISTS magazines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pdf_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  publication_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_magazines_created_at ON magazines(created_at);
```

2. Crear un nuevo bucket de almacenamiento llamado `magazines` en Supabase Storage para almacenar los archivos PDF.

3. Configurar las políticas de acceso adecuadas:

```sql
-- Permitir a usuarios autenticados crear revistas
CREATE POLICY "Allow authenticated users to create magazines" 
ON magazines FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir acceso público para leer revistas
CREATE POLICY "Allow public to read magazines" 
ON magazines FOR SELECT 
TO anon 
USING (true);

-- Permitir a los creadores actualizar sus revistas
CREATE POLICY "Allow creators to update their magazines" 
ON magazines FOR UPDATE 
TO authenticated 
USING (auth.uid() = created_by);

-- Permitir a los creadores eliminar sus revistas
CREATE POLICY "Allow creators to delete their magazines" 
ON magazines FOR DELETE 
TO authenticated 
USING (auth.uid() = created_by);
```

### 3. APIs disponibles

#### Generación de revista
- Endpoint: `/api/magazine/generate`
- Método: POST
- Descripción: Genera una nueva revista digital
- Cuerpo de la solicitud: No requiere cuerpo
- Respuesta: 
  ```json
  {
    "success": true,
    "pdfUrl": "https://[URL_TO_PDF]",
    "publicationCount": 120,
    "magazineId": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```

#### Eliminación de revista
- Endpoint: `/api/magazine/delete`
- Método: DELETE
- Descripción: Elimina una revista existente
- Cuerpo de la solicitud: 
  ```json
  {
    "url": "https://[URL_TO_PDF]"
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
   - Se obtienen todas las publicaciones activas de la base de datos
   - Se agrupan por categoría para mejor organización
   - Se genera un PDF con portada, índice y secciones por categoría
   - El PDF se sube al almacenamiento de Supabase
   - Se guarda un registro de la revista en la tabla `magazines`

2. La revista se actualiza bajo demanda o cuando un administrador la genera manualmente.

## Solución de Problemas

Si la generación de la revista falla, verificar:

1. Que existen publicaciones activas en la base de datos
2. Que las permisos de Supabase estén correctamente configurados
3. Que las dependencias estén instaladas (jspdf, jspdf-autotable)
4. Revisar los logs del servidor para identificar errores específicos 