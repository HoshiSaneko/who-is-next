/**
 * 图片转 WebP 格式脚本
 *
 * 使用方法:
 * node scripts/convert-to-webp.js <路径> [选项]
 *
 * 示例:
 * node scripts/convert-to-webp.js public/covers/BV1xx411c7mD.jpg
 * node scripts/convert-to-webp.js public/covers
 * node scripts/convert-to-webp.js public/covers --quality 90
 * node scripts/convert-to-webp.js public/covers --recursive
 * node scripts/convert-to-webp.js public/covers --delete-original
 */

import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { existsSync } from 'fs';

// 默认配置
const DEFAULT_QUALITY = 85;
const MAX_WIDTH = 1920;

// 支持的图片格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ 请指定要转换的文件或目录路径');
    console.log('\n使用方法:');
    console.log('  node scripts/convert-to-webp.js <路径> [选项]');
    console.log('\n选项:');
    console.log('  --quality <1-100>    WebP 质量 (默认: 85)');
    console.log('  --resize <宽度>      调整图片宽度 (保持比例)');
    console.log('  --recursive          递归处理子目录');
    console.log('  --delete-original    转换成功后删除原图');
    console.log('  --overwrite          如果 WebP 文件已存在则覆盖');
    console.log('\n示例:');
    console.log('  node scripts/convert-to-webp.js public/covers/image.jpg');
    console.log('  node scripts/convert-to-webp.js public/covers --quality 90');
    console.log('  node scripts/convert-to-webp.js public/covers --recursive --delete-original');
    process.exit(1);
  }

  const config = {
    path: args[0],
    quality: DEFAULT_QUALITY,
    maxWidth: MAX_WIDTH,
    recursive: false,
    deleteOriginal: false,
    overwrite: false
  };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--quality':
        config.quality = parseInt(args[++i], 10);
        if (config.quality < 1 || config.quality > 100) {
          console.error('❌ 质量值必须在 1-100 之间');
          process.exit(1);
        }
        break;
      case '--resize':
        config.maxWidth = parseInt(args[++i], 10);
        break;
      case '--recursive':
        config.recursive = true;
        break;
      case '--delete-original':
        config.deleteOriginal = true;
        break;
      case '--overwrite':
        config.overwrite = true;
        break;
    }
  }

  return config;
}

// 获取目录中的所有图片文件
async function getImageFiles(dir, recursive = false) {
  const imageFiles = [];

  try {
    const files = await readdir(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);

      if (stats.isDirectory() && recursive) {
        const subFiles = await getImageFiles(filePath, recursive);
        imageFiles.push(...subFiles);
      } else if (stats.isFile()) {
        const ext = extname(file).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          imageFiles.push(filePath);
        }
      }
    }
  } catch (err) {
    console.error(`❌ 无法读取目录 ${dir}:`, err.message);
  }

  return imageFiles;
}

// 转换单个图片为 WebP
async function convertToWebP(filePath, config) {
  try {
    const ext = extname(filePath).toLowerCase();
    const fileName = basename(filePath, ext);
    const dir = dirname(filePath);
    const webpPath = join(dir, `${fileName}.webp`);

    // 检查 WebP 文件是否已存在
    if (existsSync(webpPath) && !config.overwrite) {
      console.log(`⏭️  跳过 (已存在): ${filePath}`);
      return { skipped: true };
    }

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const stats = await stat(filePath);
    const originalSize = stats.size;

    console.log(`\n🖼️  转换: ${filePath}`);
    console.log(`   原始: ${(originalSize / 1024).toFixed(2)} KB (${metadata.width}x${metadata.height})`);

    // 调整尺寸（如果需要）
    let processedImage = image;
    if (metadata.width > config.maxWidth) {
      processedImage = image.resize(config.maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`   调整尺寸至: ${config.maxWidth}px 宽`);
    }

    // 转换为 WebP
    await processedImage
      .webp({ quality: config.quality })
      .toFile(webpPath);

    const webpStats = await stat(webpPath);
    const webpSize = webpStats.size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

    console.log(`   WebP: ${(webpSize / 1024).toFixed(2)} KB (节省 ${savings}%)`);
    console.log(`   ✅ 已保存: ${webpPath}`);

    // 删除原图（如果指定）
    if (config.deleteOriginal) {
      await unlink(filePath);
      console.log(`   🗑️  已删除原图`);
    }

    return {
      success: true,
      original: originalSize,
      webp: webpSize,
      savings
    };
  } catch (err) {
    console.error(`❌ 转换失败 ${filePath}:`, err.message);
    return { success: false };
  }
}

// 主函数
async function main() {
  console.log('🚀 WebP 转换工具\n');

  const config = parseArgs();

  // 检查路径是否存在
  if (!existsSync(config.path)) {
    console.error(`❌ 路径不存在: ${config.path}`);
    process.exit(1);
  }

  const stats = await stat(config.path);
  let filesToProcess = [];

  if (stats.isFile()) {
    // 单个文件
    const ext = extname(config.path).toLowerCase();
    if (!SUPPORTED_FORMATS.includes(ext)) {
      console.error(`❌ 不支持的文件格式: ${ext}`);
      console.log(`支持的格式: ${SUPPORTED_FORMATS.join(', ')}`);
      process.exit(1);
    }
    filesToProcess = [config.path];
  } else if (stats.isDirectory()) {
    // 目录
    console.log(`📁 扫描目录: ${config.path}`);
    if (config.recursive) {
      console.log('   (递归模式)\n');
    }
    filesToProcess = await getImageFiles(config.path, config.recursive);
  }

  if (filesToProcess.length === 0) {
    console.log('ℹ️  未找到需要转换的图片文件');
    return;
  }

  console.log(`📊 找到 ${filesToProcess.length} 个文件\n`);
  console.log('配置:');
  console.log(`  质量: ${config.quality}`);
  console.log(`  最大宽度: ${config.maxWidth}px`);
  console.log(`  删除原图: ${config.deleteOriginal ? '是' : '否'}`);
  console.log(`  覆盖已存在: ${config.overwrite ? '是' : '否'}`);

  let totalOriginal = 0;
  let totalWebp = 0;
  let successCount = 0;
  let skippedCount = 0;

  for (const file of filesToProcess) {
    const result = await convertToWebP(file, config);
    if (result.success) {
      totalOriginal += result.original;
      totalWebp += result.webp;
      successCount++;
    } else if (result.skipped) {
      skippedCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ 转换完成！');
  console.log(`📊 成功: ${successCount} 个, 跳过: ${skippedCount} 个`);
  if (successCount > 0) {
    console.log(`📦 原始总大小: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📦 WebP 总大小: ${(totalWebp / 1024 / 1024).toFixed(2)} MB`);
    console.log(`💾 总节省: ${((totalOriginal - totalWebp) / totalOriginal * 100).toFixed(1)}%`);
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
