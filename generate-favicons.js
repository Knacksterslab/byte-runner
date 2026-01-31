/**
 * Favicon Generator Script
 * Generates multiple favicon sizes from logo.png
 * 
 * Usage: node generate-favicons.js
 * 
 * This script requires 'sharp' package. Install it with:
 * npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

// Try to require sharp, provide helpful error if not installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('\n❌ Error: sharp package is not installed.');
  console.error('Please install it by running:');
  console.error('  npm install --save-dev sharp\n');
  process.exit(1);
}

const LOGO_PATH = path.join(__dirname, 'public', 'logo.png');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Favicon sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'logo-192.png', size: 192 },
  { name: 'logo-512.png', size: 512 },
];

async function generateFavicons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(LOGO_PATH)) {
      console.error(`❌ Error: logo.png not found at ${LOGO_PATH}`);
      process.exit(1);
    }

    console.log('🎨 Starting favicon generation...\n');

    // Generate each size
    for (const { name, size } of sizes) {
      const outputPath = path.join(PUBLIC_DIR, name);
      
      await sharp(LOGO_PATH)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (16x16 and 32x32 combined)
    console.log('\n🔨 Generating favicon.ico...');
    const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
    
    // For .ico file, we'll just use the 32x32 as a fallback
    // (True multi-size .ico requires additional libraries)
    await sharp(LOGO_PATH)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '-temp.png'));
    
    // Rename temp file to .ico (browsers will accept PNG as .ico)
    fs.renameSync(icoPath.replace('.ico', '-temp.png'), icoPath);
    
    console.log(`✅ Generated: favicon.ico (32x32)`);
    
    console.log('\n✨ All favicons generated successfully!\n');
    console.log('Generated files:');
    sizes.forEach(({ name }) => console.log(`  - ${name}`));
    console.log('  - favicon.ico\n');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateFavicons();
