/**
 * Seed Publications Database Script
 * This script seeds the MongoDB database with sample publications
 * Run with: node src/scripts/seed-publications.js
 */

// Import MongoDB
const { MongoClient, ServerApiVersion } = require("mongodb");

// Connection URI from environment or default
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://buscadiss:UQA8DlAqm6N7DDNx@cluster0.4qbi1hu.mongodb.net/buscadis?retryWrites=true&w=majority&connectTimeoutMS=30000&socketTimeoutMS=45000&maxPoolSize=20&maxIdleTimeMS=60000";
const dbName = process.env.MONGODB_DB || "buscadis";

console.log("Starting database seeding script...");
console.log(`Using database: ${dbName}`);

// Create MongoDB client
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

// Category collections
const CATEGORY_COLLECTIONS = {
  empleos: "publications_empleos",
  inmuebles: "publications_inmuebles",
  vehiculos: "publications_vehiculos",
  servicios: "publications_servicios",
  productos: "publications_productos",
  eventos: "publications_eventos",
  negocios: "publications_negocios",
  comunidad: "publications_comunidad",
};

// Sample publications for each category
const SAMPLE_PUBLICATIONS = {
  vehiculos: [
    {
      id: "sample_vehiculo_1",
      title: "Toyota Corolla 2022 - Excelente estado",
      description:
        "Vendo Toyota Corolla 2022 con apenas 15,000 km. Único dueño, mantenimiento al día, todos los servicios en concesionario.",
      price: 18500,
      currency: "USD",
      category: "vehiculos",
      subcategory: "autos",
      location: { city: "Lima", region: "Lima" },
      contactName: "Carlos Mendoza",
      contactPhone: "+51 987 654 321",
      status: "active",
      images: ["/images/sample/toyota-corolla.jpg"],
      created_at: new Date().toISOString(),
    },
    {
      id: "sample_vehiculo_2",
      title: "Honda CBR 250R - Impecable",
      description:
        "Vendo Honda CBR 250R con 8,000 km. Documentos en regla, mantenimiento recién hecho.",
      price: 3800,
      currency: "USD",
      category: "vehiculos",
      subcategory: "motos",
      location: { city: "Arequipa", region: "Arequipa" },
      contactName: "Laura Torres",
      contactPhone: "+51 923 456 789",
      status: "active",
      images: ["/images/sample/honda-cbr.jpg"],
      created_at: new Date().toISOString(),
    },
    {
      id: "sample_vehiculo_3",
      title: "Camioneta Hyundai Tucson 2021",
      description:
        "Se vende camioneta Hyundai Tucson del 2021, motor 2.0, transmisión automática, uso particular. 18,000 km.",
      price: 23500,
      currency: "USD",
      category: "vehiculos",
      subcategory: "camionetas",
      location: { city: "Trujillo", region: "La Libertad" },
      contactName: "Jorge Ramírez",
      contactPhone: "+51 912 345 678",
      status: "active",
      images: ["/images/sample/hyundai-tucson.jpg"],
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
  ],
  inmuebles: [
    {
      id: "sample_inmueble_1",
      title: "Departamento en Miraflores - 3 dormitorios",
      description:
        "Hermoso departamento en el corazón de Miraflores. 3 dormitorios, 2 baños, cocina equipada, sala-comedor amplia. Edificio con ascensor y seguridad 24/7.",
      price: 850,
      currency: "USD",
      category: "inmuebles",
      subcategory: "departamentos",
      location: { city: "Lima", region: "Miraflores" },
      contactName: "María Sánchez",
      contactPhone: "+51 912 345 678",
      status: "active",
      images: ["/images/sample/departamento-miraflores.jpg"],
      created_at: new Date().toISOString(),
    },
    {
      id: "sample_inmueble_2",
      title: "Casa amplia en La Molina - 5 dormitorios",
      description:
        "Amplia casa en exclusiva zona de La Molina. 5 dormitorios, 3 baños, jardín, piscina, cocina equipada, sala, comedor, sala de estar, estudio. Vigilancia permanente.",
      price: 450000,
      currency: "USD",
      category: "inmuebles",
      subcategory: "casas",
      location: { city: "Lima", region: "La Molina" },
      contactName: "Inmobiliaria Lima",
      contactPhone: "+51 999 888 777",
      status: "active",
      images: ["/images/sample/casa-molina.jpg"],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
  ],
  empleos: [
    {
      id: "sample_empleo_1",
      title: "Desarrollador Full Stack React/Node.js",
      description:
        "Importante empresa de tecnología busca desarrollador Full Stack con experiencia en React, Node.js y bases de datos NoSQL. Modalidad remota, excelente remuneración y beneficios.",
      price: 0,
      currency: "PEN",
      category: "empleos",
      subcategory: "tecnologia",
      location: { city: "Lima", region: "Remoto" },
      contactName: "Recursos Humanos",
      contactEmail: "rrhh@empresa.com",
      status: "active",
      created_at: new Date().toISOString(),
    },
    {
      id: "sample_empleo_2",
      title: "Asistente Administrativo - Tiempo completo",
      description:
        "Empresa del sector salud requiere asistente administrativo para gestión de documentos, atención al cliente y coordinación logística. Conocimientos de Excel avanzado. Horario de lunes a viernes.",
      price: 0,
      currency: "PEN",
      category: "empleos",
      subcategory: "administrativa",
      location: { city: "Lima", region: "San Isidro" },
      contactName: "Departamento de RRHH",
      contactEmail: "seleccion@empresa.com",
      status: "active",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ],
  servicios: [
    {
      id: "sample_servicio_1",
      title: "Diseño web profesional - Páginas responsivas",
      description:
        "Diseñamos tu sitio web a medida. Ofrecemos páginas responsivas optimizadas para SEO, integraciones con redes sociales y sistemas de pago. Soporte técnico incluido.",
      price: 500,
      currency: "PEN",
      category: "servicios",
      subcategory: "tecnologia",
      location: { city: "Lima", region: "Online" },
      contactName: "WebStudio Perú",
      contactPhone: "+51 987 654 321",
      contactEmail: "contacto@webstudio.pe",
      status: "active",
      created_at: new Date().toISOString(),
    },
  ],
  productos: [
    {
      id: "sample_producto_1",
      title: "MacBook Pro 2021 - M1 Pro, 16GB RAM, 512GB SSD",
      description:
        "Vendo MacBook Pro 2021 con chip M1 Pro, 16GB de RAM, 512GB SSD. En perfecto estado, incluye cargador original y caja.",
      price: 1800,
      currency: "USD",
      category: "productos",
      subcategory: "tecnologia",
      location: { city: "Lima", region: "San Borja" },
      contactName: "Daniel Vargas",
      contactPhone: "+51 955 123 456",
      status: "active",
      images: ["/images/sample/macbook-pro.jpg"],
      created_at: new Date().toISOString(),
    },
  ],
  eventos: [
    {
      id: "sample_evento_1",
      title: "Concierto de rock Latino - Bandas nacionales e internacionales",
      description:
        "Gran concierto de rock latino con la participación de bandas nacionales e internacionales. Fecha: 15 de diciembre. Lugar: Estadio Nacional. Entrada general y VIP disponibles.",
      price: 80,
      currency: "PEN",
      category: "eventos",
      subcategory: "conciertos",
      location: { city: "Lima", region: "Lima" },
      contactName: "Promotora Musical",
      contactEmail: "tickets@promotora.pe",
      status: "active",
      images: ["/images/sample/concierto.jpg"],
      created_at: new Date().toISOString(),
    },
  ],
  negocios: [
    {
      id: "sample_negocio_1",
      title: "Traspaso de restaurante - Zona comercial",
      description:
        "Se traspasa restaurante totalmente equipado y en funcionamiento. Ubicado en zona comercial con alto tránsito peatonal. Incluye mobiliario, equipos de cocina y cartera de clientes.",
      price: 25000,
      currency: "USD",
      category: "negocios",
      subcategory: "traspasos",
      location: { city: "Lima", region: "Miraflores" },
      contactName: "Inversiones Gastronómicas",
      contactPhone: "+51 999 888 777",
      status: "active",
      images: ["/images/sample/restaurante.jpg"],
      created_at: new Date().toISOString(),
    },
  ],
  comunidad: [
    {
      id: "sample_comunidad_1",
      title: "Campaña de donación de libros para bibliotecas rurales",
      description:
        "Organización sin fines de lucro busca donaciones de libros para equipar bibliotecas en zonas rurales. Los libros pueden ser nuevos o usados en buen estado. Punto de recojo en Lima Centro.",
      price: 0,
      currency: "PEN",
      category: "comunidad",
      subcategory: "donaciones",
      location: { city: "Lima", region: "Lima" },
      contactName: "Fundación Educativa",
      contactEmail: "donaciones@fundacion.org",
      contactPhone: "+51 912 345 678",
      status: "active",
      created_at: new Date().toISOString(),
    },
  ],
};

// Main function to seed data
async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Ensure collections exist
    for (const [category, collectionName] of Object.entries(
      CATEGORY_COLLECTIONS
    )) {
      console.log(`Checking collection ${collectionName}...`);

      // Check if collection exists
      const collections = await db
        .listCollections({ name: collectionName })
        .toArray();

      if (collections.length === 0) {
        console.log(`Creating collection ${collectionName}...`);
        await db.createCollection(collectionName);
      }

      // Check if collection has data
      const count = await db.collection(collectionName).countDocuments();
      console.log(`Collection ${collectionName} has ${count} documents`);

      // Seed data if collection is empty
      if (count === 0 && SAMPLE_PUBLICATIONS[category]) {
        console.log(
          `Seeding ${collectionName} with ${SAMPLE_PUBLICATIONS[category].length} sample documents...`
        );

        for (const sample of SAMPLE_PUBLICATIONS[category]) {
          await db.collection(collectionName).insertOne(sample);
        }

        console.log(`Successfully seeded ${collectionName}`);
      } else {
        console.log(
          `Skipping seeding for ${collectionName} - already has data or no samples`
        );
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log("Script execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error during script execution:", error);
    process.exit(1);
  });
