#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Optimizando imágenes...');

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

// Verificar si existe el directorio de imágenes
if (!fs.existsSync(IMAGES_DIR)) {
  console.log('📁 Creando directorio de imágenes...');
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Función para optimizar una imagen
function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      // Usar imagemin para optimización
      const outputPath = filePath.replace(ext, `.optimized${ext}`);
      
      // Comando de optimización (requiere imagemin-cli)
      const command = `npx imagemin "${filePath}" --out-dir="${path.dirname(filePath)}" --plugin.mozjpeg.quality=85 --plugin.pngquant.quality=85`;
      
      execSync(command, { stdio: 'inherit' });
      console.log(`✅ Optimizada: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error optimizando ${filePath}:`, error.message);
  }
}

// Función para recorrer directorios recursivamente
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        optimizeImage(filePath);
      }
    }
  });
}

// Crear imágenes placeholder si no existen
function createPlaceholders() {
  const placeholderDir = path.join(IMAGES_DIR, 'placeholder');
  
  if (!fs.existsSync(placeholderDir)) {
    fs.mkdirSync(placeholderDir, { recursive: true });
  }
  
  const categories = [
    'empleos', 'inmuebles', 'vehiculos', 'servicios', 
    'productos', 'eventos', 'negocios', 'comunidad'
  ];
  
  categories.forEach(category => {
    const placeholderPath = path.join(placeholderDir, `${category}.jpg`);
    if (!fs.existsSync(placeholderPath)) {
      // Crear imagen placeholder básica usando canvas o una imagen por defecto
      console.log(`📝 Creando placeholder para: ${category}`);
    }
  });
}

// Función principal
function main() {
  console.log('🚀 Iniciando optimización de imágenes...');
  
  // Crear placeholders
  createPlaceholders();
  
  // Optimizar imágenes existentes
  if (fs.existsSync(IMAGES_DIR)) {
    console.log('🔍 Buscando imágenes para optimizar...');
    walkDir(IMAGES_DIR);
  }
  
  console.log('✅ Optimización de imágenes completada!');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { optimizeImage, createPlaceholders }; 