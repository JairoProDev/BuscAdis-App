#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🔍 Probando carga de imágenes...\n');

// Lista de imágenes a verificar
const imagesToTest = [
  '/images/placeholder-image.jpg',
  '/images/placeholder-buscadis.jpg',
  '/images/placeholder/empleos.jpg',
  '/images/placeholder/inmuebles.jpg',
  '/images/placeholder/vehiculos.jpg',
  '/images/placeholder/servicios.jpg',
  '/images/placeholder/productos.jpg',
  '/images/placeholder/negocios.jpg',
  '/images/placeholder/eventos.jpg',
  '/images/placeholder/comunidad.jpg'
];

const baseUrl = 'http://localhost:3000';

function testImage(imagePath) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${imagePath}`;
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${imagePath} - OK (${res.statusCode})`);
        resolve(true);
      } else {
        console.log(`❌ ${imagePath} - Error (${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${imagePath} - Error: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${imagePath} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function testAllImages() {
  console.log('⚠️  Asegúrate de que el servidor esté corriendo en localhost:3000\n');
  
  let successCount = 0;
  let totalCount = imagesToTest.length;
  
  for (const image of imagesToTest) {
    const success = await testImage(image);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Resultados: ${successCount}/${totalCount} imágenes cargan correctamente`);
  
  if (successCount === totalCount) {
    console.log('✅ Todas las imágenes están funcionando correctamente');
    process.exit(0);
  } else {
    console.log('❌ Algunas imágenes tienen problemas');
    process.exit(1);
  }
}

testAllImages();






