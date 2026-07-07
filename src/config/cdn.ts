export const CDN_BASE_URL = 'https://cdn.xygss.saneko.me';

/**
 * 获取 CDN URL
 * @param path 图片路径，如 "/avatars/amazong.webp" 或 "avatars/amazong.webp"
 * @returns 完整的 CDN URL
 */
export function getCDNUrl(path: string): string {
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // 移除开头的斜杠
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${CDN_BASE_URL}/${cleanPath}`;
}

/**
 * 将图片路径转换为 WebP CDN URL
 * @param path 原始图片路径，如 "/avatars/amazong.jpg"
 * @returns WebP 格式的 CDN URL
 */
export function getWebPUrl(path: string): string {
  // 将扩展名替换为 .webp
  const webpPath = path.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  return getCDNUrl(webpPath);
}
