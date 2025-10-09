const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeHeroImage() {
  const inputPath = 'public/images/hero-cusco-background.webp';
  const outputPath = 'public/images/hero-cusco-background-optimized.webp';
  const backupPath = 'public/images/hero-cusco-background-backup.webp';

  try {
    console.log('🖼️  Optimizing hero image...');
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Input image not found:', inputPath);
      return;
    }

    // Get original file size
    const originalStats = fs.statSync(inputPath);
    const originalSizeKB = Math.round(originalStats.size / 1024);
    console.log(`📊 Original size: ${originalSizeKB} KB`);

    // Create backup
    fs.copyFileSync(inputPath, backupPath);
    console.log('💾 Backup created:', backupPath);

    // Optimize image with Sharp
    await sharp(inputPath)
      .webp({ 
        quality: 70,
        effort: 6,
        smartSubsample: true,
        reductionEffort: 6
      })
      .toFile(outputPath);

    // Get optimized file size
    const optimizedStats = fs.statSync(outputPath);
    const optimizedSizeKB = Math.round(optimizedStats.size / 1024);
    const savingsKB = originalSizeKB - optimizedSizeKB;
    const savingsPercent = Math.round((savingsKB / originalSizeKB) * 100);

    console.log(`✅ Optimization complete!`);
    console.log(`📊 Optimized size: ${optimizedSizeKB} KB`);
    console.log(`💰 Savings: ${savingsKB} KB (${savingsPercent}%)`);

    // Replace original with optimized version
    fs.renameSync(outputPath, inputPath);
    console.log('🔄 Original image replaced with optimized version');

    console.log('🎉 Hero image optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error optimizing hero image:', error);
    
    // Restore backup if optimization failed
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, inputPath);
      console.log('🔄 Restored original image from backup');
    }
  }
}

// Run optimization
optimizeHeroImage();
