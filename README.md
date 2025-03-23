# Sistema de Publicaciones - Frontend

Este es el frontend del sistema de publicaciones, construido con Next.js, TypeScript, y Tailwind CSS.

## Características

- Sistema de publicación paso a paso
- Selección de categorías y subcategorías
- Carga y optimización de imágenes
- Selección de ubicación con Google Maps
- Sistema de precios con múltiples monedas
- Sistema de logros y gamificación
- Diseño responsive y moderno
- Logging detallado para debugging

## Requisitos

- Node.js 18.x o superior
- npm 8.x o superior
- Una clave de API de Google Maps para la funcionalidad de ubicación

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env.local` en la raíz del proyecto y agrega las siguientes variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu-clave-de-api
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Páginas de la aplicación
│   │   └── publish/           # Sistema de publicación
│   ├── components/            # Componentes reutilizables
│   │   └── publish/          # Componentes específicos para publicación
│   ├── contexts/             # Contextos de React
│   ├── services/             # Servicios y utilidades
│   └── types/                # Definiciones de tipos TypeScript
├── public/                   # Archivos estáticos
└── package.json             # Dependencias y scripts
```

## Componentes Principales

### PublishPage
El componente principal que maneja el flujo de publicación paso a paso.

### CategorySelector
Permite seleccionar categorías y subcategorías para la publicación.

### LocationSelector
Integración con Google Maps para seleccionar la ubicación.

### PriceInput
Componente para ingresar precios con soporte para múltiples monedas.

### ImageUploader
Maneja la carga y optimización de imágenes.

### PublishAchievements
Sistema de logros y gamificación.

## Servicios

### API Service
Maneja todas las llamadas a la API del backend.

### Logging Service
Sistema de logging para debugging y monitoreo.

### Image Service
Maneja la optimización y validación de imágenes.

## Desarrollo

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Inicia la aplicación en modo producción
- `npm run lint`: Ejecuta el linter
- `npm run test`: Ejecuta las pruebas

### Convenciones de Código

- Usa TypeScript para todo el código
- Sigue las convenciones de ESLint
- Usa Prettier para formateo de código
- Documenta las funciones y componentes principales
- Usa el sistema de logging para debugging

### Flujo de Trabajo

1. El usuario comienza en la página de publicación
2. Selecciona una categoría y subcategoría
3. Completa los detalles de la publicación
4. Agrega la ubicación
5. Sube imágenes
6. Revisa y publica

## Contribución

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
