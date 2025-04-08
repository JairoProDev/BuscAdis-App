/**
 * Seed Publications Database Script
 * This script seeds the MongoDB database with sample publications
 * Run with: node src/scripts/seed-publications.js
 */

// Import MongoDB
const { MongoClient, ServerApiVersion } = require("mongodb");
const { faker } = require("@faker-js/faker/locale/es");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Connection URI from environment or default
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "buscadis";

console.log("Starting database seeding script...");
console.log(`Using database: ${dbName}`);
console.log(`MongoDB URI: ${uri.substring(0, 25)}...`);

// Create MongoDB client with better error handling
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

// Generate realistic publications using faker
function generatePublications() {
  const publications = {
    empleos: generateEmpleos(25),
    inmuebles: generateInmuebles(30),
    vehiculos: generateVehiculos(20),
    servicios: generateServicios(15),
    productos: generateProductos(30),
    eventos: generateEventos(15),
    negocios: generateNegocios(10),
    comunidad: generateComunidad(15),
  };

  return publications;
}

// Helper function to create a random ID
function createRandomId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// Generate empleos publications
function generateEmpleos(count) {
  const jobTypes = [
    "Tiempo completo",
    "Medio tiempo",
    "Por proyecto",
    "Prácticas",
    "Temporal",
  ];
  const jobCategories = [
    "Tecnología",
    "Administración",
    "Salud",
    "Educación",
    "Hostelería",
    "Construcción",
    "Marketing",
    "Ventas",
  ];
  const employmentTypes = [
    "full-time",
    "part-time",
    "contract",
    "freelance",
    "internship",
  ];
  const experienceLevels = [
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Director",
    "Executive",
  ];
  const educationLevels = [
    "Secundaria",
    "Técnico",
    "Bachiller",
    "Licenciatura",
    "Maestría",
    "Doctorado",
  ];

  const empleos = [];

  for (let i = 0; i < count; i++) {
    const company = faker.company.name();
    const jobTitle = faker.person.jobTitle();
    const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const jobCategory =
      jobCategories[Math.floor(Math.random() * jobCategories.length)];

    empleos.push({
      id: createRandomId("empleo"),
      title: `${jobTitle} - ${company}`,
      description: faker.lorem.paragraphs(3),
      price: 0, // Jobs usually don't have a price
      currency: "PEN",
      category: "empleos",
      subcategory: jobCategory.toLowerCase(),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      job_type: jobType,
      salary_range: faker.helpers.arrayElement([
        "S/ 1,000 - S/ 2,000",
        "S/ 2,000 - S/ 3,500",
        "S/ 3,500 - S/ 5,000",
        "S/ 5,000 - S/ 8,000",
        "S/ 8,000+",
      ]),
      requirements: [
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      ],
      benefits: [
        faker.lorem.sentence(),
        faker.lorem.sentence(),
        faker.lorem.sentence(),
      ],
      employment_type:
        employmentTypes[Math.floor(Math.random() * employmentTypes.length)],
      experience_level:
        experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
      education_level:
        educationLevels[Math.floor(Math.random() * educationLevels.length)],
    });
  }

  return empleos;
}

// Generate inmuebles publications
function generateInmuebles(count) {
  const propertyTypes = [
    "Casa",
    "Departamento",
    "Terreno",
    "Local Comercial",
    "Oficina",
    "Habitación",
  ];
  const operationTypes = ["sale", "rent"];
  const amenities = [
    "Piscina",
    "Gimnasio",
    "Seguridad 24/7",
    "Estacionamiento",
    "Áreas verdes",
    "Terraza",
    "Ascensor",
    "Amoblado",
    "Aire acondicionado",
    "Calefacción",
    "Internet de alta velocidad",
    "TV por cable",
    "Lavandería",
  ];

  const inmuebles = [];

  for (let i = 0; i < count; i++) {
    const propertyType =
      propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const operationType =
      operationTypes[Math.floor(Math.random() * operationTypes.length)];
    const price =
      operationType === "sale"
        ? faker.number.int({ min: 50000, max: 1000000 })
        : faker.number.int({ min: 500, max: 5000 });
    const bedrooms = faker.number.int({ min: 1, max: 5 });
    const bathrooms = faker.number.int({ min: 1, max: 4 });
    const area = faker.number.int({ min: 50, max: 500 });

    // Select 3-5 random amenities
    const propertyAmenities = [];
    const amenitiesCount = faker.number.int({ min: 3, max: 5 });
    for (let j = 0; j < amenitiesCount; j++) {
      const amenity = amenities[Math.floor(Math.random() * amenities.length)];
      if (!propertyAmenities.includes(amenity)) {
        propertyAmenities.push(amenity);
      }
    }

    inmuebles.push({
      id: createRandomId("inmueble"),
      title: `${propertyType} ${bedrooms} dorm. ${area}m² - ${
        operationType === "sale" ? "Venta" : "Alquiler"
      }`,
      description: faker.lorem.paragraphs(3),
      price: price,
      currency: price > 10000 ? "USD" : "PEN",
      category: "inmuebles",
      subcategory: propertyType.toLowerCase().replace(" ", "_"),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      images: [
        `/images/sample/property-${faker.number.int({ min: 1, max: 5 })}.jpg`,
        `/images/sample/property-${faker.number.int({ min: 1, max: 5 })}.jpg`,
      ],
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      property_type: propertyType,
      price_range: operationType === "sale" ? "USD 50,000+" : "USD 500+",
      features: {
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        area: area,
        parking: faker.number.int({ min: 0, max: 2 }),
        amenities: propertyAmenities,
      },
      operation_type: operationType,
    });
  }

  return inmuebles;
}

// Generate vehiculos publications
function generateVehiculos(count) {
  const vehicleTypes = [
    "Auto",
    "Camioneta",
    "Moto",
    "Camión",
    "Bus",
    "Maquinaria",
  ];
  const brands = {
    Auto: [
      "Toyota",
      "Honda",
      "Nissan",
      "Hyundai",
      "Kia",
      "Mazda",
      "Chevrolet",
      "Ford",
    ],
    Camioneta: [
      "Toyota",
      "Nissan",
      "Ford",
      "Chevrolet",
      "Mitsubishi",
      "Jeep",
      "Honda",
    ],
    Moto: [
      "Honda",
      "Yamaha",
      "Suzuki",
      "Kawasaki",
      "Harley-Davidson",
      "Bajaj",
      "KTM",
    ],
    Camión: ["Volvo", "Scania", "Mercedes-Benz", "Iveco", "DAF", "MAN"],
    Bus: ["Mercedes-Benz", "Volvo", "Scania", "Marcopolo", "Modasa"],
    Maquinaria: [
      "Caterpillar",
      "John Deere",
      "Komatsu",
      "Hitachi",
      "Volvo Construction",
    ],
  };
  const fuelTypes = [
    "Gasolina",
    "Diesel",
    "GLP",
    "GNV",
    "Híbrido",
    "Eléctrico",
  ];
  const transmissions = ["Manual", "Automática", "CVT", "Secuencial"];
  const conditions = ["new", "used"];
  const features = [
    "Aire acondicionado",
    "Dirección hidráulica",
    "Vidrios eléctricos",
    "Cierre centralizado",
    "Alarma",
    "Airbags",
    "Bluetooth",
    "Cámara de retroceso",
    "Sensores de estacionamiento",
    "Sunroof",
    "Asientos de cuero",
    "Control de tracción",
    "ABS",
    "GPS",
    "Radio táctil",
  ];

  const vehiculos = [];

  for (let i = 0; i < count; i++) {
    const vehicleType =
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const brand =
      brands[vehicleType][
        Math.floor(Math.random() * brands[vehicleType].length)
      ];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const year = faker.number.int({ min: 2005, max: 2023 });
    const price =
      condition === "new"
        ? faker.number.int({ min: 15000, max: 80000 })
        : faker.number.int({ min: 5000, max: 30000 });
    const mileage =
      condition === "new"
        ? faker.number.int({ min: 0, max: 1000 })
        : faker.number.int({ min: 10000, max: 150000 });

    // Select 3-5 random features
    const vehicleFeatures = [];
    const featuresCount = faker.number.int({ min: 3, max: 5 });
    for (let j = 0; j < featuresCount; j++) {
      const feature = features[Math.floor(Math.random() * features.length)];
      if (!vehicleFeatures.includes(feature)) {
        vehicleFeatures.push(feature);
      }
    }

    vehiculos.push({
      id: createRandomId("vehiculo"),
      title: `${brand} ${faker.vehicle.model()} ${year} - ${
        condition === "new" ? "Nuevo" : "Seminuevo"
      }`,
      description: faker.lorem.paragraphs(3),
      price: price,
      currency: "USD",
      category: "vehiculos",
      subcategory: vehicleType.toLowerCase(),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      images: [
        `/images/sample/vehicle-${faker.number.int({ min: 1, max: 5 })}.jpg`,
        `/images/sample/vehicle-${faker.number.int({ min: 1, max: 5 })}.jpg`,
      ],
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      vehicle_type: vehicleType,
      year_model: year.toString(),
      brand: brand,
      model: faker.vehicle.model(),
      mileage: mileage,
      fuel_type: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      transmission:
        transmissions[Math.floor(Math.random() * transmissions.length)],
      features: vehicleFeatures,
      condition: condition,
    });
  }

  return vehiculos;
}

// Generate servicios publications
function generateServicios(count) {
  const serviceTypes = [
    "Profesionales",
    "Hogar",
    "Técnicos",
    "Belleza",
    "Educación",
    "Transporte",
    "Eventos",
    "Informática",
    "Legales",
    "Salud",
  ];
  const priceTypes = ["fixed", "hourly", "quote"];

  const servicios = [];

  for (let i = 0; i < count; i++) {
    const serviceType =
      serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const priceType = priceTypes[Math.floor(Math.random() * priceTypes.length)];
    const price =
      priceType === "quote" ? 0 : faker.number.int({ min: 50, max: 500 });
    const experienceYears = faker.number.int({ min: 1, max: 20 });

    servicios.push({
      id: createRandomId("servicio"),
      title: `${faker.person.jobTitle()} profesional - ${serviceType}`,
      description: faker.lorem.paragraphs(3),
      price: price,
      currency: "PEN",
      category: "servicios",
      subcategory: serviceType.toLowerCase(),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      images: [
        `/images/sample/service-${faker.number.int({ min: 1, max: 5 })}.jpg`,
      ],
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      service_type: serviceType,
      price_type: priceType,
      price: priceType !== "quote" ? price : undefined,
      availability: [
        "Lunes a Viernes",
        "Fines de semana",
        "Horarios flexibles",
      ],
      service_area: [`${faker.location.city()}`, `${faker.location.city()}`],
      experience_years: experienceYears,
    });
  }

  return servicios;
}

// Generate productos publications
function generateProductos(count) {
  const productTypes = [
    "Tecnología",
    "Muebles",
    "Electrodomésticos",
    "Ropa y Accesorios",
    "Deportes",
    "Hogar",
    "Juguetes",
    "Instrumentos Musicales",
  ];
  const conditions = ["new", "used", "refurbished"];

  const productos = [];

  for (let i = 0; i < count; i++) {
    const productType =
      productTypes[Math.floor(Math.random() * productTypes.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const price =
      condition === "new"
        ? faker.number.int({ min: 100, max: 5000 })
        : faker.number.int({ min: 50, max: 2000 });

    const brand = faker.company.name();
    const model = `${faker.commerce.productName()}`;

    productos.push({
      id: createRandomId("producto"),
      title: `${faker.commerce.productName()} - ${
        condition === "new"
          ? "Nuevo"
          : condition === "used"
          ? "Usado"
          : "Reacondicionado"
      }`,
      description: faker.lorem.paragraphs(2),
      price: price,
      currency: price > 1000 ? "USD" : "PEN",
      category: "productos",
      subcategory: productType
        .toLowerCase()
        .replace(" y ", "_")
        .replace(" ", "_"),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      images: [
        `/images/sample/product-${faker.number.int({ min: 1, max: 5 })}.jpg`,
        `/images/sample/product-${faker.number.int({ min: 1, max: 5 })}.jpg`,
      ],
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      product_type: productType,
      price_range: price > 1000 ? "USD 1,000+" : "PEN 50+",
      condition: condition,
      brand: brand,
      model: model,
      specifications: {
        color: faker.color.human(),
        weight: `${faker.number.float({
          min: 0.5,
          max: 20,
          precision: 0.1,
        })} kg`,
        dimensions: `${faker.number.int({
          min: 10,
          max: 100,
        })}x${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({
          min: 10,
          max: 100,
        })} cm`,
      },
      warranty:
        condition === "new"
          ? `${faker.number.int({ min: 6, max: 24 })} meses`
          : undefined,
    });
  }

  return productos;
}

// Generate eventos publications
function generateEventos(count) {
  const eventTypes = [
    "Conciertos",
    "Teatro",
    "Conferencias",
    "Festivales",
    "Talleres",
    "Exposiciones",
    "Networking",
  ];
  const venues = [
    "Teatro Municipal",
    "Centro de Convenciones",
    "Estadio Nacional",
    "Hotel Sheraton",
    "Parque de la Exposición",
    "Galería de Arte",
  ];

  const eventos = [];

  for (let i = 0; i < count; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const capacity = faker.number.int({ min: 50, max: 10000 });
    const price = faker.number.int({ min: 0, max: 300 });
    const requiresRegistration = faker.datatype.boolean();

    // Generate a future date (within next 60 days)
    const futureDate = faker.date.future({ years: 0.2 });
    const formattedDate = futureDate.toISOString().split("T")[0];

    eventos.push({
      id: createRandomId("evento"),
      title: `${eventType}: ${faker.lorem.words(3)} - ${faker.date.month()}`,
      description: faker.lorem.paragraphs(3),
      price: price,
      currency: "PEN",
      category: "eventos",
      subcategory: eventType.toLowerCase(),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      images: [
        `/images/sample/event-${faker.number.int({ min: 1, max: 5 })}.jpg`,
      ],
      created_at: faker.date.recent({ days: 15 }).toISOString(),
      event_type: eventType,
      event_date: formattedDate,
      start_time: `${faker.number.int({
        min: 10,
        max: 20,
      })}:${faker.helpers.arrayElement(["00", "30"])}`,
      end_time: `${faker.number.int({
        min: 21,
        max: 23,
      })}:${faker.helpers.arrayElement(["00", "30"])}`,
      venue: venue,
      capacity: capacity,
      organizer: faker.company.name(),
      registration_required: requiresRegistration,
    });
  }

  return eventos;
}

// Generate negocios publications
function generateNegocios(count) {
  const businessTypes = [
    "Franquicias",
    "Traspasos",
    "Inversiones",
    "Locales Comerciales",
    "Startups",
    "Distribuciones",
  ];

  const negocios = [];

  for (let i = 0; i < count; i++) {
    const businessType =
      businessTypes[Math.floor(Math.random() * businessTypes.length)];
    const price = faker.number.int({ min: 10000, max: 500000 });
    const employees = faker.number.int({ min: 1, max: 50 });
    const yearOperating = faker.number.int({ min: 1, max: 20 });

    negocios.push({
      id: createRandomId("negocio"),
      title: `${businessType}: ${faker.company.name()} - Oportunidad de negocio`,
      description: faker.lorem.paragraphs(3),
      price: price,
      currency: "USD",
      category: "negocios",
      subcategory: businessType.toLowerCase(),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      images: [
        `/images/sample/business-${faker.number.int({ min: 1, max: 5 })}.jpg`,
      ],
      created_at: faker.date.recent({ days: 45 }).toISOString(),
      business_type: businessType,
      investment_range:
        price > 100000 ? "USD 100,000+" : "USD 10,000 - 100,000",
      revenue: faker.number.int({ min: 5000, max: 100000 }),
      employees: employees,
      years_operating: yearOperating,
      included_assets: [
        "Mobiliario",
        "Equipos",
        "Cartera de clientes",
        "Contratos vigentes",
        "Stock",
      ],
      reason_for_selling: faker.helpers.arrayElement([
        "Jubilación",
        "Cambio de residencia",
        "Enfermedad",
        "Cambio de giro",
        "Falta de tiempo",
      ]),
      financial_summary: {
        monthly_revenue: faker.number.int({ min: 5000, max: 50000 }),
        monthly_expenses: faker.number.int({ min: 2000, max: 30000 }),
        net_profit: faker.number.int({ min: 1000, max: 20000 }),
      },
    });
  }

  return negocios;
}

// Generate comunidad publications
function generateComunidad(count) {
  const communityTypes = [
    "Voluntariado",
    "Donaciones",
    "Eventos Comunitarios",
    "Talleres Gratuitos",
    "Intercambios",
    "Apoyos",
  ];
  const targetAudiences = [
    "Niños",
    "Jóvenes",
    "Adultos",
    "Adultos mayores",
    "Familias",
    "Personas con discapacidad",
    "Todos",
  ];
  const participationTypes = ["free", "paid"];

  const comunidad = [];

  for (let i = 0; i < count; i++) {
    const communityType =
      communityTypes[Math.floor(Math.random() * communityTypes.length)];
    const participationType =
      participationTypes[Math.floor(Math.random() * participationTypes.length)];
    const price =
      participationType === "paid"
        ? faker.number.int({ min: 10, max: 100 })
        : 0;

    // Select 1-3 random target audiences
    const audiences = [];
    const audiencesCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < audiencesCount; j++) {
      const audience =
        targetAudiences[Math.floor(Math.random() * targetAudiences.length)];
      if (!audiences.includes(audience)) {
        audiences.push(audience);
      }
    }

    comunidad.push({
      id: createRandomId("comunidad"),
      title: `${communityType}: ${faker.lorem.words(4)}`,
      description: faker.lorem.paragraphs(3),
      price: price,
      currency: "PEN",
      category: "comunidad",
      subcategory: communityType.toLowerCase().replace(" ", "_"),
      location: {
        city: faker.location.city(),
        region: faker.location.state(),
        address: faker.location.streetAddress(),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
      },
      contactName: faker.person.fullName(),
      contactEmail: faker.internet.email(),
      contactPhone: faker.phone.number(),
      status: "active",
      images: [
        `/images/sample/community-${faker.number.int({ min: 1, max: 5 })}.jpg`,
      ],
      created_at: faker.date.recent({ days: 30 }).toISOString(),
      community_type: communityType,
      target_audience: audiences,
      schedule: `${faker.date.weekday()}, ${faker.number.int({
        min: 10,
        max: 19,
      })}:00 - ${faker.number.int({ min: 20, max: 22 })}:00`,
      requirements: [faker.lorem.sentence(), faker.lorem.sentence()],
      participation_type: participationType,
    });
  }

  return comunidad;
}

// Main function to seed data
async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB successfully");

    const db = client.db(dbName);

    // Generate publications
    const publications = generatePublications();
    console.log("Generated publications:", {
      empleos: publications.empleos.length,
      inmuebles: publications.inmuebles.length,
      vehiculos: publications.vehiculos.length,
      servicios: publications.servicios.length,
      productos: publications.productos.length,
      eventos: publications.eventos.length,
      negocios: publications.negocios.length,
      comunidad: publications.comunidad.length,
    });

    // Ensure collections exist and seed them
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

      if (count === 0 && publications[category]) {
        console.log(
          `Seeding ${collectionName} with ${publications[category].length} publications...`
        );

        if (publications[category].length > 0) {
          const result = await db
            .collection(collectionName)
            .insertMany(publications[category]);
          console.log(
            `Successfully inserted ${result.insertedCount} documents into ${collectionName}`
          );
        }
      } else {
        console.log(
          `Collection ${collectionName} already has data. Do you want to add more? (y/n)`
        );
        // Skip for now, allow manually confirming through argument if needed
        if (process.argv.includes("--force")) {
          console.log(
            `Force flag detected, inserting additional publications into ${collectionName}`
          );
          if (publications[category] && publications[category].length > 0) {
            const result = await db
              .collection(collectionName)
              .insertMany(publications[category]);
            console.log(
              `Successfully inserted ${result.insertedCount} additional documents into ${collectionName}`
            );
          }
        } else {
          console.log(
            `Skipping seeding for ${collectionName}. Use --force flag to add more documents.`
          );
        }
      }
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  } finally {
    try {
      await client.close();
      console.log("Database connection closed");
    } catch (err) {
      console.error("Error closing database connection:", err);
    }
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log("Script execution completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error during script execution:", error);
    process.exit(1);
  });
