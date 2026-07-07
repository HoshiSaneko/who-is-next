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
    const baseSrc = useCDN ? getCDNUrl(src) : src;

    // Convert original image path to WebP if available
    const webpSrc = baseSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');

    // Check if WebP is supported and if WebP version exists
    const img = new Image();
    img.onload = () => {
      setImageSrc(webpSrc);
    };
    img.onerror = () => {
      // Fallback to original format if WebP not available
      setImageSrc(baseSrc);
    };
    img.src = webpSrc;
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
