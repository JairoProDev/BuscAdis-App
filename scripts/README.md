# Scripts de Importación de Datos

Este directorio contiene las herramientas para importar datos de publicaciones a la base de datos MongoDB (`buscadis`).

## Estructura

```
/scripts
├── data-to-upload/          # Carpeta para tus archivos JSON con lotes de anuncios
│   └── lote1.json
│   └── lote2.json
│   └── ...
├── importData.js            # El único script que ejecutarás para importar
└── README.md                # Este archivo
```

## Proceso de Importación

1.  **Prepara tus Datos:**
    *   Crea archivos `.json` dentro de la carpeta `data-to-upload/`.
    *   Cada archivo JSON debe contener un **array** de objetos de publicación.
    *   Cada objeto de publicación debe seguir la siguiente estructura:

        ```json
        {
          "title": "String (Requerido)",
          "description": "String (Requerido)",
          "categorySlug": "String (Requerido - ej: 'inmuebles', 'empleos')",
          "subcategorySlug": "String (Requerido - ej: 'alquiler', 'tecnologia')",
          "subSubcategorySlug": "String | null (Opcional - ej: 'departamentos', 'desarrollador-frontend')",
          "value": Number (Requerido - Precio, salario, etc.),
          "currency": "String (Requerido - ej: 'PEN', 'USD')",
          "valueType": "String | null (Opcional - ej: 'Negociable', 'Fijo', 'Por Hora')",
          "size": Number (Requerido - Tamaño del anuncio 0-4),
          "location": {
            "country": "String (Requerido - ej: 'Peru')",
            "province": "String (Requerido - ej: 'Cusco')",
            "city": "String (Requerido - ej: 'Cusco')",
            "district": "String | null (Opcional)",
            "address": "String | null (Opcional - Calle, Av, Urb)"
          },
          "contact": {
            "phones": ["String"] (Requerido, puede ser [] si no hay - Todos los números aquí),
            "email": "String | null (Opcional)",
            "name": "String | null (Opcional - Nombre de contacto)"
          },
          "images": ["String"] (Requerido, puede ser [] - URLs/paths de imágenes),
          "status": "String (Requerido - ej: 'active', 'inactive')",
          "premium": Boolean (Requerido - true/false)
        }
        ```
    *   **IMPORTANTE:** No incluyas los campos `publicationId`, `createdAt`, o `updatedAt` en tus archivos JSON. El script los generará automáticamente.

2.  **Configura el Entorno:**
    *   Asegúrate de tener Node.js instalado.
    *   Instala las dependencias (si no lo has hecho): `npm install mongodb` (o `yarn add mongodb`) en la raíz de tu proyecto o globalmente.
    *   Define las variables de entorno necesarias. La más importante es `MONGODB_URI` con tu cadena de conexión a MongoDB Atlas. Puedes usar un archivo `.env` y la librería `dotenv` (necesitarías añadir `require('dotenv').config();` al inicio del script y `npm install dotenv`) o definirlas directamente en tu terminal:
        *   **Bash/Zsh:** `export MONGODB_URI="mongodb+srv://user:pass@cluster..."`
        *   **Windows (cmd):** `set MONGODB_URI="mongodb+srv://user:pass@cluster..."`
        *   **Windows (PowerShell):** `$env:MONGODB_URI="mongodb+srv://user:pass@cluster..."`
    *   Opcionalmente puedes definir `DB_NAME` si tu base de datos no se llama `buscadis`.

3.  **Prepara la Colección `counters` en MongoDB:**
    *   El script necesita una colección llamada `counters` para generar los IDs secuenciales.
    *   Dentro de `counters`, debe existir (o será creado por el script la primera vez) un documento como este:
        ```json
        { "_id": "publicationCounter", "sequence_value": 0 }
        ```
    *   El script incrementará `sequence_value` por cada publicación importada. El primer ID será 1.

4.  **Ejecuta el Script:**
    *   Navega a la carpeta `scripts/` en tu terminal.
    *   Ejecuta el comando: `node importData.js`
    *   El script procesará todos los archivos `.json` en la carpeta `data-to-upload/`, asignará IDs, añadirá timestamps, y los insertará en la colección correspondiente (ej: `publications_inmuebles` basado en `categorySlug`).
    *   Revisa la salida de la consola para ver el progreso y posibles errores.

## Notas Importantes

*   **IDs Secuenciales:** La generación de IDs secuenciales se maneja a través de la colección `counters`. Asegúrate de que esta colección exista y esté configurada como se describe.
*   **Mapeo de Colecciones:** El script usa el `categorySlug` para determinar en qué colección (`publications_inmuebles`, `publications_empleos`, etc.) insertar el documento. Revisa el objeto `categoryCollectionMap` dentro de `importData.js` y asegúrate de que todas tus categorías principales estén mapeadas a la colección correcta. Las publicaciones con un `categorySlug` no mapeado irán a `publications_otros` (puedes cambiar este comportamiento).
*   **Timestamps:** `createdAt` y `updatedAt` se establecen automáticamente a la fecha y hora de la importación.
*   **Errores:** El script intentará continuar si falla procesando una publicación individual o un archivo, pero mostrará mensajes de error. Revisa la salida cuidadosamente.
*   **Backup:** Siempre es buena idea tener un backup de tu base de datos antes de realizar importaciones masivas. 