import { useState, useEffect, useRef } from 'react';
import { getCDNUrl } from '@/src/config/cdn';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  useCDN?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  useCDN = true,
  style,
  title,
  ...restProps
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // 构建不同的图片 URL 尝试顺序
    const urls: string[] = [];

    if (useCDN) {
      // 1. CDN WebP
      const cdnWebP = getCDNUrl(src).replace(/\.(jpg|jpeg|png)$/i, '.webp');
      urls.push(cdnWebP);

      // 2. CDN 原始格式
      const cdnOriginal = getCDNUrl(src);
      urls.push(cdnOriginal);
    }

    // 3. 本地 WebP
    const localWebP = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    urls.push(localWebP);

    // 4. 本地原始格式
    urls.push(src);

    // 尝试按顺序加载图片
    let currentIndex = 0;

    const tryLoadImage = () => {
      if (currentIndex >= urls.length) {
        // 所有 URL 都失败了，使用最后一个（原始 src）
        setImageSrc(src);
        return;
      }

      const img = new Image();
      const currentUrl = urls[currentIndex];

      img.onload = () => {
        setImageSrc(currentUrl);
      };

      img.onerror = () => {
        // 当前 URL 失败，尝试下一个
        currentIndex++;
        tryLoadImage();
      };

      img.src = currentUrl;
    };

    tryLoadImage();
  }, [src, useCDN]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (!imageSrc) {
    return (
      <div
        className={`${className} bg-gray-200 animate-pulse`}
        style={{ width, height, ...style }}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      width={width}
      height={height}
      loading={loading}
      onLoad={handleLoad}
      decoding="async"
      style={style}
      title={title}
      {...restProps}
    />
  );
}
