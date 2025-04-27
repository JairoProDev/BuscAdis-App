# Configuración de Google Maps Platform

Esta guía te mostrará cómo configurar Google Maps Platform para tu proyecto, usando el nivel gratuito de forma eficiente.

## Paso 1: Crear una cuenta en Google Cloud Platform

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Si no tienes una cuenta, crea una con tu cuenta de Google
3. Acepta los términos y condiciones

## Paso 2: Crear un nuevo proyecto

1. En la consola de Google Cloud, haz clic en el selector de proyectos en la parte superior
2. Haz clic en "Nuevo proyecto"
3. Asigna un nombre a tu proyecto (por ejemplo: "Buscadis Maps")
4. Haz clic en "Crear"
5. Espera a que se cree el proyecto y selecciónalo

## Paso 3: Habilitar las APIs necesarias

1. En el menú lateral, navega a "APIs y servicios" > "Biblioteca"
2. Busca y habilita las siguientes APIs (una por una):
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Maps Embed API

## Paso 4: Crear una clave de API

1. En el menú lateral, navega a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. Se generará una nueva clave de API. Cópiala y guárdala en un lugar seguro

## Paso 5: Restringir la clave de API (importante para seguridad)

1. En la lista de credenciales, encuentra tu clave de API y haz clic en "Editar"
2. En "Restricciones de aplicación", selecciona "Sitios web HTTP referentes"
3. Añade los dominios donde se utilizará la API:
   - Para desarrollo local: `http://localhost:3000/*`
   - Para tu dominio de producción: `https://tudominio.com/*`
4. En "Restricciones de API", selecciona "Restringir clave"
5. Selecciona sólo las APIs que has habilitado anteriormente
6. Haz clic en "Guardar"

## Paso 6: Configurar facturación (sin cobros para el nivel gratuito)

1. En el menú lateral, navega a "Facturación"
2. Configura una cuenta de facturación (esto es necesario incluso para el nivel gratuito)
3. Proporciona una tarjeta de crédito (no se te cobrará si permaneces dentro de los límites gratuitos)
4. Puedes establecer alertas de presupuesto para evitar sorpresas:
   - Ve a "Facturación" > "Presupuestos y alertas"
   - Configura un presupuesto de $0 con alertas al 50%, 90% y 100%

## Paso 7: Añadir la clave API al proyecto

1. Crea o edita el archivo `.env.local` en la raíz del proyecto
2. Añade tu clave API:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_de_api_aquí
   ```
3. Reinicia el servidor de desarrollo

## Optimizaciones para mantener el uso dentro del nivel gratuito

Para mantenerse dentro del nivel gratuito de Google Maps Platform (10,000 cargas de mapa gratuitas al mes), hemos implementado varias optimizaciones:

1. **Carga lazy de los mapas**: Los mapas solo se cargan cuando son necesarios
2. **Caché de geocodificación**: Almacenamos resultados de geocodificación para evitar llamadas API repetidas
3. **Carga optimizada de librerías**: Solo cargamos las librerías específicas que necesitamos
4. **Limitar tamaño de respuesta**: Configuramos los parámetros para minimizar el tamaño de los datos
5. **Marcadores optimizados**: Usamos SVG ligeros en lugar de imágenes pesadas
6. **Control de rebote en búsquedas**: Implementamos debounce en los campos de búsqueda

## Cómo monitorear el uso

1. En Google Cloud Console, navega a "APIs y servicios" > "Panel"
2. Aquí puedes ver el uso de tus APIs y asegurarte de que estás dentro de los límites gratuitos
3. También puedes configurar alertas de cuota para recibir notificaciones cuando te acerques a los límites

## Límites del nivel gratuito de Google Maps Platform

- **Maps JavaScript API**: 10,000 cargas de mapa al mes
- **Geocoding API**: 10,000 solicitudes al mes
- **Places API**: 10,000 solicitudes al mes
- **Maps Embed API**: 10,000 solicitudes al mes

Si superas estos límites, comenzarán a aplicarse cargos según la [estructura de precios](https://mapsplatform.google.com/pricing/) de Google Maps Platform.

## Solución de problemas comunes

### El mapa no se carga

- Verifica que la clave API esté correctamente configurada en `.env.local`
- Asegúrate de que has habilitado las APIs correctas
- Comprueba las restricciones de dominio en la configuración de la clave API
- Revisa la consola del navegador para errores específicos

### Error de facturación

- Asegúrate de haber configurado correctamente la cuenta de facturación
- Verifica que tu tarjeta de crédito sea válida

### Alcanzando límites gratuitos rápidamente

- Implementa más técnicas de caché
- Reduce la frecuencia de las llamadas a la API
- Considera limitar algunas funcionalidades en usuarios no registrados 