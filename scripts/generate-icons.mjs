import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 48, 128];
const inputSvg = join(__dirname, '../public/icons/icon.svg');
const outputDir = join(__dirname, '../public/icons');

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });
  
  for (const size of sizes) {
    const outputPath = join(outputDir, `icon${size}.png`);
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon${size}.png`);
  }
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
