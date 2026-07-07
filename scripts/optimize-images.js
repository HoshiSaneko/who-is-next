import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';

const IMAGE_DIRS = [
  'public/covers',
  'public/avatars',
  'public/up-members',
  'public/images',
  'public/meme-images'
];

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 85;
const JPEG_QUALITY = 85;

async function getImageFiles(dir) {
  try {
    const files = await readdir(dir);
    const imageFiles = [];

    for (const file of files) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);

      if (stats.isFile()) {
        const ext = extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png'].includes(ext)) {
          imageFiles.push(filePath);
        }
      }
    }

    return imageFiles;
  } catch (err) {
    console.warn(`Warning: Cannot read directory ${dir}:`, err.message);
    return [];
  }
}

async function optimizeImage(filePath) {
  try {
    const ext = extname(filePath).toLowerCase();
    const fileName = basename(filePath, ext);
    const dir = dirname(filePath);

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const stats = await stat(filePath);
    const originalSize = stats.size;

    console.log(`\nProcessing: ${filePath}`);
    console.log(`  Original: ${(originalSize / 1024).toFixed(2)} KB (${metadata.width}x${metadata.height})`);

    // Resize if too large
    let resizedImage = image;
    if (metadata.width > MAX_WIDTH) {
      resizedImage = image.resize(MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to WebP
    const webpPath = join(dir, `${fileName}.webp`);
    await resizedImage
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    const webpStats = await stat(webpPath);
    const webpSize = webpStats.size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

    console.log(`  WebP: ${(webpSize / 1024).toFixed(2)} KB (saved ${savings}%)`);

    // Also optimize the original format
    if (ext === '.png') {
      await resizedImage
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(filePath.replace('.png', '.optimized.png'));
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await resizedImage
        .jpeg({ quality: JPEG_QUALITY, progressive: true })
        .toFile(filePath.replace(ext, '.optimized' + ext));
    }

    return { original: originalSize, webp: webpSize, savings };
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');

  let totalOriginal = 0;
  let totalWebp = 0;
  let processedCount = 0;

  for (const dir of IMAGE_DIRS) {
    console.log(`\n📁 Processing directory: ${dir}`);
    const files = await getImageFiles(dir);

    if (files.length === 0) {
      console.log(`  No images found`);
      continue;
    }

    for (const file of files) {
      const result = await optimizeImage(file);
      if (result) {
        totalOriginal += result.original;
        totalWebp += result.webp;
        processedCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Optimization complete!');
  console.log(`📊 Processed ${processedCount} images`);
  console.log(`📦 Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📦 WebP size: ${(totalWebp / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 Total savings: ${((totalOriginal - totalWebp) / totalOriginal * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
}

main().catch(console.error);
