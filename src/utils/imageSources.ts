import { getBiliOfficialAvatar } from '@/configs/biliAvatars.config';
import { getBiliOfficialCover } from '@/configs/biliCovers.config';
import { getCDNUrl } from '@/src/config/cdn';

const preloadedImageSources = new Map<string, Promise<string>>();

export interface ImageSourceOptions {
  biliUid?: string;
  useCDN?: boolean;
}

function extractBvidFromCoverPath(path: string): string | null {
  const match = path.match(/\/covers\/(BV[a-zA-Z0-9]+)\.(jpg|jpeg|png|webp)$/i);
  return match ? match[1] : null;
}

export function getImageSourceCandidates(src: string, { biliUid, useCDN = true }: ImageSourceOptions = {}): string[] {
  const urls: string[] = [];
  const officialAvatar = getBiliOfficialAvatar(biliUid);
  const officialCover = getBiliOfficialCover(extractBvidFromCoverPath(src) || '');

  if (officialAvatar) urls.push(officialAvatar);
  if (officialCover) urls.push(officialCover);

  if (useCDN) {
    urls.push(getCDNUrl(src).replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    urls.push(getCDNUrl(src));
  }

  urls.push(src.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
  urls.push(src);
  return [...new Set(urls)];
}

export function preloadImageSource(src: string, options?: ImageSourceOptions): Promise<string> {
  const cacheKey = `${src}|${options?.biliUid || ''}|${options?.useCDN ?? true}`;
  const cachedSource = preloadedImageSources.get(cacheKey);
  if (cachedSource) return cachedSource;

  const urls = getImageSourceCandidates(src, options);
  const preloadPromise = new Promise<string>((resolve) => {
    let currentIndex = 0;

    const tryLoadImage = () => {
      const currentUrl = urls[currentIndex];
      if (!currentUrl) {
        resolve(src);
        return;
      }

      const image = new Image();
      image.onload = () => resolve(currentUrl);
      image.onerror = () => {
        currentIndex += 1;
        tryLoadImage();
      };
      image.src = currentUrl;
    };

    tryLoadImage();
  });

  preloadedImageSources.set(cacheKey, preloadPromise);
  return preloadPromise;
}
