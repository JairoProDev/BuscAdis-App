#!/usr/bin/env node

/**
 * Script para subir avisos desde JSON a la base de datos
 * Uso: node scripts/upload-ads.js <archivo.json>
 * Ejemplo: node scripts/upload-ads.js mis-avisos.json
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Importar el modelo
import { UnifiedPublicationModel } from "../src/lib/models/Publication.js";

// Configuración de conexión
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/buscadis";

console.log("🚀 Iniciando script de carga de avisos...");
console.log(`📁 Base de datos: ${MONGODB_URI}`);

// Función para generar sequentialId único
async function getNextSequentialId() {
  try {
    const lastAd = await UnifiedPublicationModel.findOne({}, {}, { sort: { sequentialId: -1 } });
    return lastAd ? lastAd.sequentialId + 1 : 1;
  } catch (error) {
    console.log("⚠️  No se pudo obtener el último sequentialId, empezando desde 1");
    return 1;
  }
}

// Función para transformar el JSON al formato de la base de datos
function transformAdData(adData, sequentialId) {
  return {
    sequentialId: sequentialId,
    title: adData.title,
    slug: adData.slug,
    description: adData.description,
    status: adData.status || "active",
    publicationDate: new Date(adData.publicationDate),
    validUntil: adData.validUntil ? new Date(adData.validUntil) : undefined,
    category: adData.category,
    subcategories: adData.subcategories || [],
    location: {
      countryCode: adData.location.countryCode,
      department: adData.location.department,
      province: adData.location.province,
      district: adData.location.district,
      address: adData.location.address,
      areaPaths: adData.location.areaPaths || [],
      geo: {
        type: "Point",
        coordinates: [0, 0] // Coordenadas por defecto, se pueden actualizar después
      }
    },
    advertiserType: adData.advertiserType || "individual",
    advertiserId: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    contactInfo: {
      name: adData.contactInfo.name,
      showContactButton: adData.contactInfo.showContactButton !== false,
      phone: adData.contactInfo.phone || "",
      email: adData.contactInfo.email || ""
    },
    pricing: {
      amount: adData.pricing.amount,
      currency: adData.pricing.currency || "USD"
    },
    attributes: new Map(Object.entries(adData.attributes || {})),
    media: (adData.media || []).map(media => ({
      type: media.type || "image",
      url: media.url || "",
      isPrimary: media.isPrimary || false
    })),
    search: {
      tags: adData.search.tags || [],
      embedding: adData.search.embedding || []
    },
    metrics: {
      impressions: adData.metrics.impressions || 0,
      cardClicks: adData.metrics.cardClicks || 0,
      detailViews: adData.metrics.detailViews || 0,
      shares: adData.metrics.shares || 0,
      saves: adData.metrics.saves || 0,
      contactClicks: adData.metrics.contactClicks || 0,
      chatInteractions: adData.metrics.chatInteractions || 0
    },
    source: {
      type: adData.source.type || "web_form",
      historicalImportDetails: adData.source.historicalImportDetails || {}
    },
    distribution: adData.distribution || [],
    audit: {
      createdBy: "script_import",
      history: [{
        changedAt: new Date(),
        changedBy: "script_import",
        field: "created",
        oldValue: null
      }]
    },
    moderation: {
      status: adData.moderation.status || "approved",
      reviewedBy: "script_import",
      notes: "Importado automáticamente"
    }
  };
}

// Función principal
async function uploadAds(filePath) {
  try {
    // Conectar a MongoDB
    console.log("🔌 Conectando a MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a MongoDB exitosamente");

    // Leer archivo JSON
    console.log(`📖 Leyendo archivo: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const adsData = JSON.parse(fileContent);
    
    if (!Array.isArray(adsData)) {
      throw new Error("El archivo JSON debe contener un array de avisos");
    }

    console.log(`📊 Encontrados ${adsData.length} avisos para procesar`);

    // Obtener el siguiente sequentialId
    let currentSequentialId = await getNextSequentialId();
    console.log(`🔢 Empezando con sequentialId: ${currentSequentialId}`);

    // Procesar cada aviso
    const processedAds = [];
    for (let i = 0; i < adsData.length; i++) {
      const adData = adsData[i];
      console.log(`⚙️  Procesando aviso ${i + 1}/${adsData.length}: "${adData.title}"`);
      
      try {
        const transformedAd = transformAdData(adData, currentSequentialId);
        processedAds.push(transformedAd);
        currentSequentialId++;
      } catch (error) {
        console.error(`❌ Error procesando aviso ${i + 1}:`, error.message);
        continue;
      }
    }

    if (processedAds.length === 0) {
      console.log("⚠️  No hay avisos válidos para subir");
      return;
    }

    // Insertar en la base de datos
    console.log(`💾 Subiendo ${processedAds.length} avisos a la base de datos...`);
    const result = await UnifiedPublicationModel.insertMany(processedAds, { ordered: false });
    
    console.log(`✅ ¡Éxito! Se subieron ${result.length} avisos a la base de datos`);
    console.log(`🔗 Los avisos estarán disponibles en la app inmediatamente`);

    // Mostrar resumen
    const categories = {};
    processedAds.forEach(ad => {
      categories[ad.category] = (categories[ad.category] || 0) + 1;
    });
    
    console.log("\n📈 Resumen por categoría:");
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} avisos`);
    });

  } catch (error) {
    console.error("❌ Error durante la carga:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  } finally {
    // Cerrar conexión
    try {
      await mongoose.connection.close();
      console.log("🔌 Conexión a MongoDB cerrada");
    } catch (err) {
      console.error("Error cerrando conexión:", err);
    }
  }
}

// Verificar argumentos
const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Error: Debes especificar la ruta del archivo JSON");
  console.log("Uso: node scripts/upload-ads.js <archivo.json>");
  console.log("Ejemplo: node scripts/upload-ads.js mis-avisos.json");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ Error: El archivo ${filePath} no existe`);
  process.exit(1);
}

// Ejecutar script
uploadAds(filePath)
  .then(() => {
    console.log("🎉 Script completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  });

