/**
 * 批量获取 Bilibili 视频封面地址
 *
 * 使用方法:
 * node scripts/fetch-bili-covers.js
 *
 * 该脚本会读取 seasonEpisodes.config.ts 中的所有 BV 号，
 * 调用 Bilibili API 获取封面地址，并生成配置代码
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bilibili API 基础 URL
const BILI_API_BASE = 'https://api.bilibili.com/x/web-interface/view';

// 延迟函数，避免请求过快
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取单个视频的封面
async function getVideoCover(bvid) {
  try {
    const url = `${BILI_API_BASE}?bvid=${bvid}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 0 && data.data && data.data.pic) {
      return {
        bvid,
        cover: data.data.pic,
        title: data.data.title,
        success: true
      };
    } else {
      return {
        bvid,
        error: data.message || 'Unknown error',
        success: false
      };
    }
  } catch (error) {
    return {
      bvid,
      error: error.message,
      success: false
    };
  }
}

// 从配置文件提取所有 BV 号
function extractBvidsFromConfig() {
  const bvids = [];

  // 读取正片配置
  const seasonConfigPath = path.join(__dirname, '../configs/seasonEpisodes.config.ts');
  const seasonContent = fs.readFileSync(seasonConfigPath, 'utf-8');

  // 读取番外配置
  const extrasConfigPath = path.join(__dirname, '../configs/extras.config.ts');
  const extrasContent = fs.readFileSync(extrasConfigPath, 'utf-8');

  // 匹配 bvid: 'BVxxxxxxx' 格式
  const bvidRegex = /bvid:\s*['"]([^'"]+)['"]/g;
  let match;

  // 从正片配置提取
  while ((match = bvidRegex.exec(seasonContent)) !== null) {
    bvids.push(match[1]);
  }

  // 从番外配置提取
  while ((match = bvidRegex.exec(extrasContent)) !== null) {
    bvids.push(match[1]);
  }

  // 去重
  return [...new Set(bvids)];
}

// 主函数
async function main() {
  console.log('开始获取 Bilibili 视频封面地址...\n');

  const bvids = extractBvidsFromConfig();
  console.log(`找到 ${bvids.length} 个视频 BV 号\n`);

  const results = [];
  const errors = [];

  for (let i = 0; i < bvids.length; i++) {
    const bvid = bvids[i];
    console.log(`[${i + 1}/${bvids.length}] 获取 ${bvid} 的封面...`);

    const result = await getVideoCover(bvid);

    if (result.success) {
      console.log(`  ✓ 成功: ${result.cover}`);
      results.push(result);
    } else {
      console.log(`  ✗ 失败: ${result.error}`);
      errors.push(result);
    }

    // 延迟避免请求过快
    if (i < bvids.length - 1) {
      await delay(1000); // 1秒延迟
    }
  }

  console.log('\n========== 获取完成 ==========\n');
  console.log(`成功: ${results.length} 个`);
  console.log(`失败: ${errors.length} 个\n`);

  // 生成配置代码
  if (results.length > 0) {
    console.log('生成的配置代码：\n');
    console.log('export const BILI_COVER_MAPPING: Record<string, string> = {');

    results.forEach(({ bvid, cover }) => {
      console.log(`  '${bvid}': '${cover}',`);
    });

    console.log('};\n');

    // 保存到文件
    const configContent = `/**
 * Bilibili 官方视频封面映射配置
 *
 * BV号 -> Bilibili CDN 封面图片地址映射
 * 图片地址格式: http://i0.hdslb.com/bfs/archive/{hash}.jpg
 *
 * 使用说明：
 * 1. 可以通过 Bilibili API 获取封面地址: https://api.bilibili.com/x/web-interface/view?bvid={bvid}
 * 2. API 返回的 data.pic 字段即为封面图片地址
 * 3. 添加新视频时，请通过 API 获取封面地址后添加到此配置
 *
 * 自动生成时间: ${new Date().toLocaleString('zh-CN')}
 */
export const BILI_COVER_MAPPING: Record<string, string> = {
${results.map(({ bvid, cover }) => `  '${bvid}': '${cover}',`).join('\n')}
};

/**
 * 获取 Bilibili 官方封面 URL
 * @param bvid 视频 BV 号
 * @returns Bilibili CDN 封面地址，如果未配置则返回 null
 */
export function getBiliOfficialCover(bvid: string): string | null {
  return BILI_COVER_MAPPING[bvid] || null;
}
`;

    const outputPath = path.join(__dirname, '../configs/biliCovers.config.ts');
    fs.writeFileSync(outputPath, configContent, 'utf-8');
    console.log(`配置已保存到: ${outputPath}\n`);
  }

  // 输出失败的视频
  if (errors.length > 0) {
    console.log('失败的视频：');
    errors.forEach(({ bvid, error }) => {
      console.log(`  - ${bvid}: ${error}`);
    });
    console.log();
  }
}

// 运行
main().catch(console.error);
