#!/usr/bin/env node

/**
 * Script para limpiar automáticamente variables no utilizadas
 * Uso: node scripts/clean-unused-imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para ejecutar ESLint con auto-fix
function runESLintFix() {
  try {
    logInfo('Ejecutando ESLint con auto-fix...');
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
    logSuccess('ESLint auto-fix completado');
    return true;
  } catch (error) {
    logError('Error ejecutando ESLint auto-fix');
    return false;
  }
}

// Función para ejecutar ESLint y contar warnings
function countWarnings() {
  try {
    const result = execSync('npm run lint 2>&1', { encoding: 'utf8' });
    const warningLines = result.split('\n').filter(line => 
      line.includes('Warning:') && line.includes('@typescript-eslint/no-unused-vars')
    );
    return warningLines.length;
  } catch (error) {
    return 0;
  }
}

// Función principal
function main() {
  log('🚀 INICIANDO LIMPIEZA AUTOMÁTICA DE VARIABLES NO UTILIZADAS', 'bright');
  log('=' .repeat(60), 'cyan');
  
  // Paso 1: Contar warnings iniciales
  logInfo('Contando warnings iniciales...');
  const initialWarnings = countWarnings();
  logInfo(`Warnings iniciales de variables no utilizadas: ${initialWarnings}`);
  
  // Paso 2: Ejecutar ESLint auto-fix
  const fixSuccess = runESLintFix();
  
  if (fixSuccess) {
    // Paso 3: Contar warnings después del fix
    logInfo('Contando warnings después del auto-fix...');
    const finalWarnings = countWarnings();
    const fixedWarnings = initialWarnings - finalWarnings;
    
    logSuccess(`Limpieza completada:`);
    logSuccess(`  - Warnings iniciales: ${initialWarnings}`);
    logSuccess(`  - Warnings finales: ${finalWarnings}`);
    logSuccess(`  - Warnings corregidos: ${fixedWarnings}`);
    
    if (finalWarnings > 0) {
      logWarning(`Aún quedan ${finalWarnings} warnings de variables no utilizadas`);
      logInfo('Estos warnings requieren corrección manual');
    }
  } else {
    logError('No se pudo completar la limpieza automática');
  }
  
  log('=' .repeat(60), 'cyan');
  log('🏁 LIMPIEZA AUTOMÁTICA COMPLETADA', 'bright');
}

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = { main, runESLintFix, countWarnings }; 