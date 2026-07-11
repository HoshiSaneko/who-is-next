import { useState, useEffect, useRef } from 'react';
import { preloadImageSource } from '@/src/utils/imageSources';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  useCDN?: boolean;
  biliUid?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  useCDN = true,
  biliUid,
  style,
  title,
  ...restProps
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageSrc('');
    setIsLoaded(false);

    // 构建不同的图片 URL 尝试顺序
    let cancelled = false;

    preloadImageSource(src, { biliUid, useCDN }).then((resolvedSrc) => {
      if (!cancelled) setImageSrc(resolvedSrc);
    });

    return () => {
      cancelled = true;
    };
  }, [biliUid, src, useCDN]);

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
