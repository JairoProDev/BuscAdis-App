/**
 * src/lib/homeMockData.js
 *
 * Datos simulados para las secciones de la página de inicio de Buscadis.
 * En una aplicación real, estos datos probablemente vendrían de una API.
 */

// Importación de iconos necesarios
import {
  UserGroupIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ClockIcon,
  HandThumbUpIcon, // Icono adicional
  MagnifyingGlassIcon, // Icono adicional
  BriefcaseIcon, // Icono adicional
  AcademicCapIcon, // Icono adicional
} from "@heroicons/react/24/outline";

// Mapeo de iconos para facilitar su uso en componentes
export const iconMap = {
  UserGroupIcon: UserGroupIcon,
  CheckCircleIcon: CheckCircleIcon,
  ShieldCheckIcon: ShieldCheckIcon,
  ChatBubbleLeftRightIcon: ChatBubbleLeftRightIcon,
  CurrencyDollarIcon: CurrencyDollarIcon,
  MapPinIcon: MapPinIcon,
  ClockIcon: ClockIcon,
  HandThumbUpIcon: HandThumbUpIcon,
  MagnifyingGlassIcon: MagnifyingGlassIcon,
  BriefcaseIcon: BriefcaseIcon,
  AcademicCapIcon: AcademicCapIcon,
};

// Anuncios destacados
export const featuredListings = [
  {
    id: "fl001",
    title: "Oportunidad Única: Terreno en Urubamba",
    category: "inmuebles",
    price: 75000,
    currency: "USD",
    location: "Urubamba, Cusco",
    image: "/images/listings/terreno-urubamba.jpg",
    premium: true,
  },
  {
    id: "fl002",
    title: "Se necesita Cocinero con Experiencia (Comida Novoandina)",
    category: "empleos",
    price: 2500,
    currency: "PEN",
    location: "Centro Histórico, Cusco",
    image: "/images/listings/cocinero.jpg",
    premium: true,
  },
  {
    id: "fl003",
    title: "Camioneta Suzuki Grand Vitara 2019 - Como Nueva",
    category: "vehiculos",
    price: 18500,
    currency: "USD",
    location: "Wanchaq, Cusco",
    image: "/images/vehiculo-corolla.jpg",
  },
  {
    id: "fl004",
    title: "Clases Particulares de Quechua (Nivel Básico)",
    category: "servicios",
    price: 50,
    currency: "PEN",
    location: "Online / Cusco",
    image: "/images/servicio-clases.jpg",
  },
];

// Testimonios
export const testimonials = [
  {
    id: "t001",
    name: "Ana Sofía Quispe",
    role: "Artesana Local",
    content:
      "¡Vendí mis tejidos más rápido que nunca! Buscadis me conectó con compradores interesados de todo Cusco. La interfaz es muy fácil de usar.",
    image: "/images/testimonials/ana-sofia.jpg",
    rating: 5,
  },
  {
    id: "t002",
    name: "David Mendoza",
    role: "Guía de Turismo",
    content:
      "Encontré personal calificado para mi agencia de turismo justo a tiempo para la temporada alta. El filtro de empleos es excelente.",
    image: "/images/testimonials/david-mendoza.jpg",
    rating: 5,
  },
  {
    id: "t003",
    name: "Elena Castillo",
    role: "Estudiante Universitaria",
    content:
      "Conseguí un departamento compartido cerca de la UNSAAC gracias a Buscadis. Mucho más fácil que buscar en grupos de Facebook.",
    image: "/images/testimonials/elena-castillo.jpg",
    rating: 4,
  },
];

// Estadísticas de la plataforma
export const stats = [
  { id: "s001", name: "Anuncios Activos en Cusco", value: "+50,000" },
  { id: "s002", name: "Usuarios Registrados", value: "+120,000" },
  { id: "s003", name: "Nuevos Anuncios Hoy", value: "+1,500" },
  { id: "s004", name: "Negocios Locales", value: "+6,000" },
];

// Beneficios de usar la plataforma
export const benefits = [
  {
    id: "b001",
    title: "Encuentra lo que Buscas",
    description:
      "Explora miles de anuncios actualizados en todas las categorías: empleo, vivienda, autos y más.",
    icon: "MapPinIcon",
  },
  {
    id: "b002",
    title: "Publica Fácil y Rápido",
    description:
      "Crea tu anuncio gratis en minutos y llega a miles de compradores o empleadores potenciales.",
    icon: "CheckCircleIcon",
  },
  {
    id: "b003",
    title: "Conecta con Confianza",
    description:
      "Plataforma segura con verificación opcional y herramientas para proteger tu información.",
    icon: "ShieldCheckIcon",
  },
  {
    id: "b004",
    title: "Ahorra Tiempo y Dinero",
    description:
      "Compara precios, negocia directamente y encuentra las mejores ofertas y oportunidades locales.",
    icon: "CurrencyDollarIcon",
  },
];

// Pasos para usar la plataforma
export const howItWorksSteps = [
  {
    id: "hiw001",
    title: "Busca",
    description:
      "Usa filtros potentes para encontrar exactamente lo que necesitas.",
    icon: "MagnifyingGlassIcon",
  },
  {
    id: "hiw002",
    title: "Conecta",
    description:
      "Contacta directamente con vendedores, empleadores o proveedores.",
    icon: "ChatBubbleLeftRightIcon",
  },
  {
    id: "hiw003",
    title: "Acuerda",
    description: "Negocia los términos y cierra el trato de forma segura.",
    icon: "HandThumbUpIcon",
  },
];
