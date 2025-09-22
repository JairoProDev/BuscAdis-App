/**
 * LIMPIAR Y CREAR ANUNCIOS REALISTAS - BUSCADIS
 * Elimina datos actuales y crea 48 adisos realistas para probar la aplicación
 */

const { MongoClient } = require('mongodb');

// Configuración
const CONFIG = {
  dbName: process.env.MONGODB_DB || 'buscadis',
  uri: process.env.MONGODB_URI,
  
  categoryCollections: {
    inmuebles: 'publications_inmuebles',
    empleos: 'publications_empleos',
    vehiculos: 'publications_vehiculos',
    servicios: 'publications_servicios',
    productos: 'publications_productos',
    eventos: 'publications_eventos',
    comunidad: 'publications_comunidad',
    negocios: 'publications_negocios'
  }
};

/**
 * Datos realistas para Cusco
 */
const REALISTIC_DATA = {
  inmuebles: [
    {
      title: "Casa Colonial en San Blas - 3 Habitaciones",
      description: "Hermosa casa colonial restaurada en el corazón de San Blas. 3 habitaciones, 2 baños, cocina equipada, patio central con jardín. Vista a las montañas. Ideal para familia o casa de huéspedes.",
      subcategorySlug: "casas",
      location: "San Blas, Cusco",
      price: 450000,
      contactPhone: "984123456",
      contactName: "María García",
      images: []
    },
    {
      title: "Departamento Amoblado Centro Histórico",
      description: "Acogedor departamento completamente amoblado en pleno centro histórico. 2 dormitorios, 1 baño, sala-comedor, cocina equipada. A 3 cuadras de la Plaza de Armas. Disponible inmediatamente.",
      subcategorySlug: "departamentos",
      location: "Centro Histórico, Cusco",
      price: 1200,
      contactPhone: "987654321",
      contactName: "Carlos Mendoza",
      images: []
    },
    {
      title: "Terreno en Urubamba - 800m2",
      description: "Terreno plano de 800m2 en zona residencial de Urubamba. Con servicios básicos, acceso vehicular. Ideal para construir casa de campo o proyecto turístico. Documentos en regla.",
      subcategorySlug: "terrenos",
      location: "Urubamba, Cusco",
      price: 120000,
      contactPhone: "951789456",
      contactName: "Jorge Quispe",
      images: []
    },
    {
      title: "Local Comercial Av. El Sol",
      description: "Local comercial de 45m2 en Av. El Sol, zona comercial más importante de Cusco. Primer piso, con vitrina amplia, baño. Ideal para tienda, oficina o restaurante pequeño.",
      subcategorySlug: "locales",
      location: "Av. El Sol, Cusco",
      price: 2500,
      contactPhone: "984567890",
      contactName: "Ana Huamán",
      images: []
    },
    {
      title: "Casa en Wanchaq con Cochera",
      description: "Casa de 2 pisos en Wanchaq. 4 habitaciones, 3 baños, cochera para 2 autos, patio amplio. Zona residencial tranquila, cerca de colegios y mercados. Precio negociable.",
      subcategorySlug: "casas",
      location: "Wanchaq, Cusco",
      price: 280000,
      contactPhone: "965432178",
      contactName: "Pedro Ccahuana",
      images: []
    },
    {
      title: "Oficina Moderna en San Blas",
      description: "Oficina moderna de 30m2 en segundo piso. Completamente equipada, internet de alta velocidad, vista panorámica. Ideal para profesionales independientes o pequeña empresa.",
      subcategorySlug: "oficinas",
      location: "San Blas, Cusco",
      price: 800,
      contactPhone: "987123654",
      contactName: "Lucía Vargas",
      images: []
    }
  ],

  empleos: [
    {
      title: "Cocinero con Experiencia - Restaurante Centro",
      description: "Restaurante en centro histórico busca cocinero con experiencia en cocina peruana e internacional. Horario partido, buen ambiente laboral. Se ofrece sueldo competitivo más propinas.",
      subcategorySlug: "gastronomia",
      location: "Centro Histórico, Cusco",
      price: 1800,
      contactPhone: "984234567",
      contactName: "Restaurant Sumaq",
      images: []
    },
    {
      title: "Guía Turístico Bilingüe",
      description: "Agencia de turismo requiere guía oficial bilingüe (español-inglés) para tours a Machu Picchu y Valle Sagrado. Licencia oficial indispensable. Excelentes ingresos por comisiones.",
      subcategorySlug: "turismo",
      location: "Cusco",
      price: 2200,
      contactPhone: "951876543",
      contactName: "Inca Travel",
      images: []
    },
    {
      title: "Vendedora para Tienda de Textiles",
      description: "Se necesita vendedora con experiencia para tienda de textiles en mercado San Pedro. Horario de lunes a domingo. Conocimiento de artesanías peruanas es un plus.",
      subcategorySlug: "ventas",
      location: "Mercado San Pedro, Cusco",
      price: 1200,
      contactPhone: "987345612",
      contactName: "Textiles Cusco",
      images: []
    },
    {
      title: "Contador Público Colegiado",
      description: "Estudio contable busca contador público colegiado para atención de clientes. Experiencia mínima 2 años. Manejo de sistemas contables. Excelente oportunidad de crecimiento profesional.",
      subcategorySlug: "profesionales",
      location: "Cusco",
      price: 2800,
      contactPhone: "984567123",
      contactName: "Estudio Contable Qosqo",
      images: []
    },
    {
      title: "Albañil con Experiencia",
      description: "Se requiere albañil con experiencia para obra en construcción. Trabajo de lunes a sábado. Pago semanal, herramientas proporcionadas. Referencias laborales indispensables.",
      subcategorySlug: "construccion",
      location: "San Sebastián, Cusco",
      price: 80,
      contactPhone: "965789123",
      contactName: "Constructora Andes",
      images: []
    },
    {
      title: "Recepcionista Hotel Boutique",
      description: "Hotel boutique en San Blas busca recepcionista con inglés intermedio. Experiencia en hotelería, manejo de sistemas de reservas. Turno rotativo, excelente ambiente laboral.",
      subcategorySlug: "turismo",
      location: "San Blas, Cusco",
      price: 1600,
      contactPhone: "987654789",
      contactName: "Hotel Qosqo",
      images: []
    }
  ],

  vehiculos: [
    {
      title: "Toyota Corolla 2018 - Excelente Estado",
      description: "Toyota Corolla 2018, motor 1.8, automático, aire acondicionado, dirección hidráulica. 45,000 km. Un solo dueño, mantenimientos al día. Papeles en regla, listo para transferir.",
      subcategorySlug: "autos",
      location: "Cusco",
      price: 65000,
      contactPhone: "984123789",
      contactName: "Roberto Silva",
      images: []
    },
    {
      title: "Motocicleta Honda CB 190R",
      description: "Honda CB 190R 2020, excelente estado. 8,000 km recorridos. Ideal para ciudad y carretera. Incluye casco y candado. Revisión técnica vigente. Precio negociable.",
      subcategorySlug: "motos",
      location: "Cusco",
      price: 8500,
      contactPhone: "951234567",
      contactName: "Miguel Condori",
      images: []
    },
    {
      title: "Camioneta Hilux 4x4 Doble Cabina",
      description: "Toyota Hilux 2016, 4x4, doble cabina, motor 2.4 turbo diesel. 85,000 km. Perfecta para trabajo y aventura. Llantas nuevas, mantenimiento reciente. Papeles al día.",
      subcategorySlug: "camionetas",
      location: "Cusco",
      price: 85000,
      contactPhone: "987456123",
      contactName: "Transport Andes",
      images: []
    },
    {
      title: "Nissan Sentra 2015 - Económico",
      description: "Nissan Sentra 2015, mecánico, motor 1.6. Muy económico en combustible. Ideal para taxi o uso personal. 120,000 km. Mantenimiento preventivo realizado. SOAT vigente.",
      subcategorySlug: "autos",
      location: "Cusco",
      price: 35000,
      contactPhone: "965123456",
      contactName: "Carlos Mamani",
      images: []
    },
    {
      title: "Bicicleta de Montaña Trek",
      description: "Bicicleta Trek de montaña, aro 26, 21 velocidades. Excelente para ciclismo en Cusco y alrededores. Incluye casco, luces y bomba. Poco uso, como nueva.",
      subcategorySlug: "bicicletas",
      location: "Cusco",
      price: 1200,
      contactPhone: "984789123",
      contactName: "Adventure Bike",
      images: []
    },
    {
      title: "Hyundai Accent 2017 - Seminuevo",
      description: "Hyundai Accent 2017, hatchback, mecánico. 55,000 km. Un solo propietario, uso particular. Aire acondicionado, radio con bluetooth. Excelente oportunidad.",
      subcategorySlug: "autos",
      location: "Cusco",
      price: 42000,
      contactPhone: "987321654",
      contactName: "Elena Quispe",
      images: []
    }
  ],

  servicios: [
    {
      title: "Clases de Inglés Personalizadas",
      description: "Profesora certificada ofrece clases de inglés personalizadas para todos los niveles. Preparación para exámenes internacionales. Clases presenciales u online. Primera clase gratis.",
      subcategorySlug: "educacion",
      location: "Cusco",
      price: 40,
      contactPhone: "984567234",
      contactName: "Sarah Johnson",
      images: []
    },
    {
      title: "Reparación de Computadoras y Laptops",
      description: "Servicio técnico especializado en reparación de computadoras y laptops. Diagnóstico gratuito, repuestos originales. Atención a domicilio disponible. 10 años de experiencia.",
      subcategorySlug: "tecnologia",
      location: "Cusco",
      price: 50,
      contactPhone: "951234789",
      contactName: "TechService Cusco",
      images: []
    },
    {
      title: "Limpieza de Casas y Oficinas",
      description: "Servicio profesional de limpieza para casas y oficinas. Personal capacitado, productos de calidad. Servicio semanal, quincenal o mensual. Referencias verificables.",
      subcategorySlug: "limpieza",
      location: "Cusco",
      price: 80,
      contactPhone: "987123456",
      contactName: "CleanService",
      images: []
    },
    {
      title: "Construcción y Remodelaciones",
      description: "Maestro de obra con 15 años de experiencia ofrece servicios de construcción y remodelación. Trabajos en drywall, pintura, electricidad, gasfitería. Presupuesto sin costo.",
      subcategorySlug: "construccion",
      location: "Cusco",
      price: 120,
      contactPhone: "965456789",
      contactName: "Construcciones Qosqo",
      images: []
    },
    {
      title: "Fotografía para Eventos",
      description: "Fotógrafo profesional para bodas, quinceañeros, eventos corporativos. Incluye sesión, edición y entrega digital. Paquetes desde 300 soles. Portfolio disponible.",
      subcategorySlug: "eventos",
      location: "Cusco",
      price: 300,
      contactPhone: "984321567",
      contactName: "Photo Memories",
      images: []
    },
    {
      title: "Jardinería y Paisajismo",
      description: "Servicio de jardinería y paisajismo. Diseño de jardines, mantenimiento de áreas verdes, poda de árboles. Trabajamos con plantas nativas. Cotización gratuita.",
      subcategorySlug: "jardineria",
      location: "Cusco",
      price: 60,
      contactPhone: "987654123",
      contactName: "Jardines Andinos",
      images: []
    }
  ],

  productos: [
    {
      title: "Laptop HP Pavilion - Como Nueva",
      description: "Laptop HP Pavilion 15', Intel Core i5, 8GB RAM, 256GB SSD. Pantalla Full HD, excelente para trabajo y estudio. 6 meses de uso, con garantía extendida. Incluye maletín.",
      subcategorySlug: "electronica",
      location: "Cusco",
      price: 2800,
      contactPhone: "984234123",
      contactName: "TechStore Cusco",
      images: []
    },
    {
      title: "Juego de Sala Moderno - 3 Piezas",
      description: "Hermoso juego de sala de 3 piezas: sofá de 3 cuerpos, 2 sillones individuales. Tapizado en tela antimanchas color beige. Excelente estado, poco uso. Se vende por viaje.",
      subcategorySlug: "muebles",
      location: "Cusco",
      price: 1500,
      contactPhone: "951567890",
      contactName: "Muebles Cusco",
      images: []
    },
    {
      title: "iPhone 12 - 128GB Azul",
      description: "iPhone 12 de 128GB color azul. Excelente estado, sin rayones. Batería al 95%. Incluye cargador original, funda y mica de vidrio. Libre de iCloud. Precio fijo.",
      subcategorySlug: "celulares",
      location: "Cusco",
      price: 2200,
      contactPhone: "987123789",
      contactName: "Mobile Center",
      images: []
    },
    {
      title: "Refrigeradora LG 350L - Seminueva",
      description: "Refrigeradora LG de 350 litros, color silver. No Frost, dispensador de agua. 1 año de uso, excelente estado. Garantía vigente. Ideal para familia mediana.",
      subcategorySlug: "electrodomesticos",
      location: "Cusco",
      price: 1800,
      contactPhone: "965234567",
      contactName: "ElectroHogar",
      images: []
    },
    {
      title: "Guitarra Acústica Yamaha",
      description: "Guitarra acústica Yamaha FG800, cuerdas de acero. Sonido profesional, ideal para principiantes y avanzados. Incluye funda acolchada, púas y afinador. Como nueva.",
      subcategorySlug: "instrumentos",
      location: "Cusco",
      price: 650,
      contactPhone: "984567123",
      contactName: "Music Store",
      images: []
    },
    {
      title: "Cocina a Gas 4 Hornillas",
      description: "Cocina a gas de 4 hornillas marca Sole. Horno amplio, encendido automático. Excelente estado, poco uso. Incluye manguera y regulador. Ideal para restaurante pequeño.",
      subcategorySlug: "electrodomesticos",
      location: "Cusco",
      price: 800,
      contactPhone: "987456234",
      contactName: "Cocinas Industriales",
      images: []
    }
  ],

  eventos: [
    {
      title: "Concierto de Música Andina - Plaza de Armas",
      description: "Gran concierto de música andina en la Plaza de Armas. Participan los mejores grupos folklóricos de Cusco. Entrada libre. Sábado 25 de enero, 7:00 PM. ¡No te lo pierdas!",
      subcategorySlug: "conciertos",
      location: "Plaza de Armas, Cusco",
      price: 0,
      contactPhone: "984123456",
      contactName: "Municipalidad del Cusco",
      images: []
    },
    {
      title: "Festival Gastronómico Cusqueño",
      description: "Festival gastronómico con los mejores platos típicos de Cusco. Más de 20 restaurantes participantes. Concursos, shows en vivo y degustaciones. Centro de Convenciones.",
      subcategorySlug: "festivales",
      location: "Centro de Convenciones, Cusco",
      price: 25,
      contactPhone: "951234567",
      contactName: "Cusco Gastronómico",
      images: []
    },
    {
      title: "Obra de Teatro: Ollantay",
      description: "Representación del clásico drama quechua 'Ollantay' en el Centro Qosqo de Arte Nativo. Funciones viernes y sábados 8:00 PM. Entradas en venta en taquilla y online.",
      subcategorySlug: "teatro",
      location: "Centro Qosqo, Cusco",
      price: 35,
      contactPhone: "984567890",
      contactName: "Centro Qosqo",
      images: []
    },
    {
      title: "Feria de Artesanías San Blas",
      description: "Feria de artesanías en el barrio de San Blas. Productos únicos hechos a mano por artesanos locales. Cerámica, textiles, platería y más. Todos los fines de semana.",
      subcategorySlug: "ferias",
      location: "San Blas, Cusco",
      price: 0,
      contactPhone: "987654321",
      contactName: "Artesanos San Blas",
      images: []
    },
    {
      title: "Conferencia de Turismo Sostenible",
      description: "Conferencia internacional sobre turismo sostenible en Machu Picchu. Expertos nacionales e internacionales. Dirigido a profesionales del turismo. Certificación incluida.",
      subcategorySlug: "conferencias",
      location: "Hotel Libertador, Cusco",
      price: 150,
      contactPhone: "965123456",
      contactName: "Tourism Cusco",
      images: []
    },
    {
      title: "Carrera Atlética Inti Raymi 10K",
      description: "Carrera atlética de 10K en conmemoración del Inti Raymi. Ruta por el centro histórico y San Blas. Inscripciones abiertas. Premios para los primeros lugares. Medalla para todos.",
      subcategorySlug: "deportes",
      location: "Cusco",
      price: 40,
      contactPhone: "984321789",
      contactName: "Running Cusco",
      images: []
    }
  ],

  comunidad: [
    {
      title: "Intercambio de Idiomas Español-Inglés",
      description: "Grupo de intercambio de idiomas se reúne todos los miércoles en café del centro. Ambiente relajado para practicar español e inglés. Todos los niveles bienvenidos. Gratis.",
      subcategorySlug: "intercambios",
      location: "Centro Histórico, Cusco",
      price: 0,
      contactPhone: "984567123",
      contactName: "Language Exchange Cusco",
      images: []
    },
    {
      title: "Busco Compañero de Viaje a Machu Picchu",
      description: "Busco compañero/a de viaje para ir a Machu Picchu el próximo fin de semana. Para compartir gastos de transporte y guía. Experiencia inolvidable garantizada. Contactar por WhatsApp.",
      subcategorySlug: "viajes",
      location: "Cusco",
      price: 200,
      contactPhone: "951789456",
      contactName: "María Adventure",
      images: []
    },
    {
      title: "Grupo de Senderismo Los Andes",
      description: "Únete a nuestro grupo de senderismo. Salidas todos los domingos a diferentes destinos cerca de Cusco. Nivel principiante a intermedio. Compañerismo y aventura. Primera salida gratis.",
      subcategorySlug: "deportes",
      location: "Cusco",
      price: 30,
      contactPhone: "987123654",
      contactName: "Hiking Cusco",
      images: []
    },
    {
      title: "Clases de Quechua Gratuitas",
      description: "Aprende quechua, el idioma de los incas. Clases gratuitas todos los sábados en la Casa de la Cultura. Profesores nativos, metodología práctica. Preservemos nuestra cultura.",
      subcategorySlug: "educacion",
      location: "Casa de la Cultura, Cusco",
      price: 0,
      contactPhone: "984234789",
      contactName: "Quechua Vivo",
      images: []
    },
    {
      title: "Donación de Libros para Biblioteca",
      description: "Biblioteca comunitaria de Pisaq necesita donación de libros en español. Especialmente libros infantiles, educativos y novelas. Cualquier aporte es valioso para los niños de la comunidad.",
      subcategorySlug: "donaciones",
      location: "Pisaq, Cusco",
      price: 0,
      contactPhone: "965456789",
      contactName: "Biblioteca Pisaq",
      images: []
    },
    {
      title: "Club de Lectura Cusco",
      description: "Club de lectura se reúne cada 15 días para discutir libros de autores peruanos y latinoamericanos. Ambiente intelectual y amigable. Próxima reunión: 'Conversación en La Catedral'.",
      subcategorySlug: "cultura",
      location: "Cusco",
      price: 0,
      contactPhone: "987654123",
      contactName: "Lectores Cusco",
      images: []
    }
  ],

  negocios: [
    {
      title: "Restaurante en Funcionamiento - Centro",
      description: "Se vende restaurante en pleno funcionamiento en centro histórico. 40 mesas, cocina completamente equipada, licencias al día. Clientela establecida. Excelente oportunidad de inversión.",
      subcategorySlug: "restaurantes",
      location: "Centro Histórico, Cusco",
      price: 180000,
      contactPhone: "984123567",
      contactName: "Business Cusco",
      images: []
    },
    {
      title: "Socio Inversionista para Agencia de Turismo",
      description: "Busco socio inversionista para expandir agencia de turismo. Empresa establecida con 5 años en el mercado. Excelente reputación y cartera de clientes. ROI proyectado 25% anual.",
      subcategorySlug: "inversiones",
      location: "Cusco",
      price: 50000,
      contactPhone: "951234890",
      contactName: "Inca Adventures",
      images: []
    },
    {
      title: "Farmacia en Venta - Zona Residencial",
      description: "Se vende farmacia en zona residencial de Wanchaq. Establecida hace 8 años, clientela fija. Incluye inventario, mobiliario y equipos. Documentos y permisos al día.",
      subcategorySlug: "farmacias",
      location: "Wanchaq, Cusco",
      price: 120000,
      contactPhone: "987456789",
      contactName: "Farmacia San José",
      images: []
    },
    {
      title: "Franquicia de Panadería - Oportunidad Única",
      description: "Franquicia de panadería reconocida busca franquiciado en Cusco. Modelo de negocio probado, capacitación incluida, soporte continuo. Inversión inicial incluye equipos y capital de trabajo.",
      subcategorySlug: "franquicias",
      location: "Cusco",
      price: 80000,
      contactPhone: "984567234",
      contactName: "Pan Dorado",
      images: []
    },
    {
      title: "Hostal en San Blas - Excelente Ubicación",
      description: "Se vende hostal de 12 habitaciones en San Blas. Excelente ubicación turística, ocupación promedio 80%. Incluye mobiliario, sistema de reservas online. Papeles en regla.",
      subcategorySlug: "hoteles",
      location: "San Blas, Cusco",
      price: 350000,
      contactPhone: "965789123",
      contactName: "Hostal Qosqo",
      images: []
    },
    {
      title: "Tienda de Artesanías - Mercado San Pedro",
      description: "Traspaso tienda de artesanías en Mercado San Pedro. Ubicación privilegiada, alto flujo de turistas. Incluye mercadería, vitrinas y contactos de proveedores. 15 años funcionando.",
      subcategorySlug: "tiendas",
      location: "Mercado San Pedro, Cusco",
      price: 45000,
      contactPhone: "987123890",
      contactName: "Artesanías Inca",
      images: []
    }
  ]
};

/**
 * Clase principal para limpiar y crear datos realistas
 */
class RealisticDataSeeder {
  constructor() {
    this.client = null;
    this.db = null;
    this.stats = {
      deleted: 0,
      created: 0,
      errors: []
    };
  }

  /**
   * Ejecutar proceso completo
   */
  async run() {
    console.log('🧹 LIMPIANDO Y CREANDO DATOS REALISTAS');
    console.log('=====================================');
    
    try {
      // Conectar a base de datos
      await this.connectToDatabase();
      
      // Limpiar datos existentes
      await this.cleanExistingData();
      
      // Crear datos realistas
      await this.createRealisticData();
      
      // Crear índices básicos
      await this.createBasicIndexes();
      
      // Mostrar resumen
      this.showSummary();
      
    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      throw error;
    } finally {
      if (this.client) {
        await this.client.close();
      }
    }
  }

  /**
   * Conectar a base de datos
   */
  async connectToDatabase() {
    console.log('\n🔌 Conectando a MongoDB Atlas...');
    
    if (!CONFIG.uri) {
      throw new Error('MONGODB_URI no está configurada en variables de entorno');
    }
    
    this.client = new MongoClient(CONFIG.uri);
    await this.client.connect();
    this.db = this.client.db(CONFIG.dbName);
    
    console.log('✅ Conectado exitosamente');
  }

  /**
   * Limpiar datos existentes
   */
  async cleanExistingData() {
    console.log('\n🧹 Limpiando datos existentes...');
    
    let totalDeleted = 0;
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        const result = await collection.deleteMany({});
        totalDeleted += result.deletedCount;
        
        if (result.deletedCount > 0) {
          console.log(`   🗑️  ${category}: ${result.deletedCount} documentos eliminados`);
        }
      } catch (error) {
        console.warn(`   ⚠️  Error limpiando ${category}:`, error.message);
        this.stats.errors.push({ category, action: 'delete', error: error.message });
      }
    }
    
    this.stats.deleted = totalDeleted;
    console.log(`✅ Total eliminados: ${totalDeleted} documentos`);
  }

  /**
   * Crear datos realistas
   */
  async createRealisticData() {
    console.log('\n📝 Creando adisos realistas...');
    
    let totalCreated = 0;
    
    for (const [category, categoryData] of Object.entries(REALISTIC_DATA)) {
      try {
        const collectionName = CONFIG.categoryCollections[category];
        const collection = this.db.collection(collectionName);
        
        console.log(`\n📁 Procesando ${category}...`);
        
        const documentsToInsert = categoryData.map((item, index) => 
          this.prepareDocument(item, category, index + 1)
        );
        
        const result = await collection.insertMany(documentsToInsert);
        totalCreated += result.insertedCount;
        
        console.log(`   ✅ ${result.insertedCount} adisos creados`);
        
        // Mostrar algunos títulos como ejemplo
        documentsToInsert.slice(0, 2).forEach(doc => {
          console.log(`      • ${doc.title}`);
        });
        
      } catch (error) {
        console.error(`   ❌ Error en ${category}:`, error.message);
        this.stats.errors.push({ category, action: 'create', error: error.message });
      }
    }
    
    this.stats.created = totalCreated;
    console.log(`\n✅ Total creados: ${totalCreated} adisos realistas`);
  }

  /**
   * Preparar documento para inserción
   */
  prepareDocument(item, category, index) {
    const now = new Date();
    const publishDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Últimos 30 días
    
    return {
      // IDs únicos
      _id: this.generateObjectId(),
      id: `${category}_${index}_${Date.now()}`,
      slug: this.generateSlug(item.title),
      
      // Contenido principal
      title: item.title,
      description: item.description,
      
      // Categorización
      categorySlug: category,
      subcategorySlug: item.subcategorySlug || 'general',
      subSubcategorySlug: null,
      
      // Ubicación
      location: item.location,
      
      // Contacto
      contactPhone: item.contactPhone,
      contactName: item.contactName,
      
      // Precio
      price: item.price,
      currency: 'PEN',
      
      // Imágenes
      images: item.images || [],
      
      // Estado
      status: 'active',
      
      // Fechas
      createdAt: publishDate,
      updatedAt: now,
      
      // Metadatos
      metadata: {
        source: 'realistic_seed',
        isExample: true,
        createdBy: 'system'
      },
      
      // Campos adicionales para compatibilidad
      premium: false,
      views: Math.floor(Math.random() * 100) + 10,
      
      // Engagement simulado
      engagement: {
        views: Math.floor(Math.random() * 100) + 10,
        likes: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 5),
        saves: Math.floor(Math.random() * 10)
      }
    };
  }

  /**
   * Generar ObjectId único
   */
  generateObjectId() {
    return new Date().getTime().toString(16) + Math.random().toString(16).substring(2, 14);
  }

  /**
   * Generar slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .trim('-') // Remover guiones al inicio/final
      .substring(0, 100); // Limitar longitud
  }

  /**
   * Crear índices básicos
   */
  async createBasicIndexes() {
    console.log('\n🔍 Creando índices básicos...');
    
    const basicIndexes = [
      { status: 1 },
      { createdAt: -1 },
      { categorySlug: 1 },
      { price: 1 },
      { location: 1 }
    ];
    
    for (const [category, collectionName] of Object.entries(CONFIG.categoryCollections)) {
      try {
        const collection = this.db.collection(collectionName);
        
        for (const index of basicIndexes) {
          await collection.createIndex(index);
        }
        
        console.log(`   ✅ ${category}: índices creados`);
      } catch (error) {
        console.warn(`   ⚠️  Error creando índices para ${category}:`, error.message);
      }
    }
  }

  /**
   * Mostrar resumen final
   */
  showSummary() {
    console.log('\n🎉 PROCESO COMPLETADO');
    console.log('====================');
    console.log(`🗑️  Documentos eliminados: ${this.stats.deleted}`);
    console.log(`📝 Adisos creados: ${this.stats.created}`);
    console.log(`❌ Errores: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      this.stats.errors.forEach(error => {
        console.log(`   - ${error.category} (${error.action}): ${error.error}`);
      });
    }
    
    console.log('\n📊 DISTRIBUCIÓN POR CATEGORÍA:');
    Object.keys(REALISTIC_DATA).forEach(category => {
      console.log(`   ${category}: 6 adisos`);
    });
    
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('   1. Abrir la aplicación web');
    console.log('   2. Verificar que se muestren los adisos');
    console.log('   3. Probar búsquedas y filtros');
    console.log('   4. Intentar publicar un nuevo adiso');
    console.log('   5. Verificar que aparezca en la lista');
    
    console.log('\n✅ Base de datos lista para pruebas reales!');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const seeder = new RealisticDataSeeder();
  
  seeder.run()
    .then(() => {
      console.log('\n🎉 Datos realistas creados exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error creando datos realistas:', error);
      process.exit(1);
    });
}

module.exports = RealisticDataSeeder; 