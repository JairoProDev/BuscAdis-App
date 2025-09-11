#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando imágenes...\n');

// Verificar que las imágenes placeholder existen
const placeholderImages = [
  '/images/placeholder-image.jpg',
  '/images/placeholder-buscadis.jpg'
];

const publicDir = path.join(__dirname, '..', 'public');

placeholderImages.forEach(imagePath => {
  const fullPath = path.join(publicDir, imagePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${imagePath} - Existe`);
  } else {
    console.log(`❌ ${imagePath} - NO EXISTE`);
  }
});

// Verificar imágenes en el directorio placeholder
const placeholderDir = path.join(publicDir, 'images', 'placeholder');
if (fs.existsSync(placeholderDir)) {
  const files = fs.readdirSync(placeholderDir);
  console.log(`\n📁 Imágenes en /images/placeholder/ (${files.length} archivos):`);
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('\n❌ Directorio /images/placeholder/ no existe');
}

// Verificar imágenes en listings
const listingsDir = path.join(publicDir, 'images', 'listings');
if (fs.existsSync(listingsDir)) {
  const files = fs.readdirSync(listingsDir);
  console.log(`\n📁 Imágenes en /images/listings/ (${files.length} archivos):`);
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
} else {
  console.log('\n❌ Directorio /images/listings/ no existe');
}

console.log('\n✅ Verificación completada');
