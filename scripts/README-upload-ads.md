# Script de Carga de Avisos

Este script te permite subir múltiples avisos a la base de datos desde un archivo JSON.

## Uso

```bash
node scripts/upload-ads.js <archivo.json>
```

### Ejemplo

```bash
node scripts/upload-ads.js mis-avisos.json
```

## Formato del archivo JSON

El archivo debe contener un array de objetos con la siguiente estructura:

```json
[
  {
    "title": "Título del aviso",
    "slug": "titulo-del-aviso",
    "description": "Descripción detallada del aviso",
    "status": "active",
    "publicationDate": "2025-01-15T10:00:00.000Z",
    "validUntil": "2025-03-15T23:59:59.000Z",
    "category": "vehiculos",
    "subcategories": ["auto", "sedan"],
    "location": {
      "countryCode": "PE",
      "department": "Cusco",
      "province": "Cusco",
      "district": "Wanchaq",
      "address": "Av. de la Cultura 1234",
      "areaPaths": ["PE", "PE-CUS", "PE-CUS-CUSCO", "PE-CUS-CUSCO-WANCHAQ"]
    },
    "advertiserType": "individual",
    "contactInfo": {
      "name": "Carlos Vargas",
      "showContactButton": true
    },
    "pricing": {
      "amount": 13500.00,
      "currency": "USD"
    },
    "attributes": {
      "tipoVehiculo": "auto",
      "condicion": "usado",
      "marca": "Toyota",
      "modelo": "Yaris",
      "anio": 2018,
      "kilometraje": 45000,
      "tipoCombustible": "gasolina",
      "tipoTransmision": "mecanica",
      "unicoDueno": true,
      "color": "Plata Metálico"
    },
    "media": [],
    "search": {},
    "metrics": {
      "impressions": 0,
      "cardClicks": 0,
      "detailViews": 0,
      "shares": 0,
      "saves": 0,
      "contactClicks": 0,
      "chatInteractions": 0
    },
    "source": {
      "type": "web_form"
    },
    "distribution": [],
    "audit": {},
    "moderation": {
      "status": "approved"
    }
  }
]
```

## Características

- ✅ **Seguro**: No afecta el estado actual de la base de datos
- ✅ **Automático**: Genera sequentialId automáticamente
- ✅ **Validación**: Valida cada aviso antes de subirlo
- ✅ **Resumen**: Muestra estadísticas de la carga
- ✅ **Error handling**: Continúa aunque falle algún aviso individual

## Campos requeridos

- `title`: Título del aviso
- `description`: Descripción del aviso
- `category`: Categoría principal
- `location`: Información de ubicación
- `contactInfo.name`: Nombre del contacto
- `pricing.amount`: Precio del aviso

## Campos opcionales

Todos los demás campos son opcionales y tendrán valores por defecto si no se especifican.

## Notas importantes

- Los avisos se suben con `status: "active"` por defecto
- Se genera un `sequentialId` único automáticamente
- Los avisos aparecen inmediatamente en la app
- El script es idempotente (se puede ejecutar múltiples veces)



