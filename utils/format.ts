import { getWebPUrl } from '../src/config/cdn';

export const formatCompactNumber = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return value.toLocaleString('zh-CN');
};

export const formatDate = (value?: string) => {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const getCover = (bvid: string) => getWebPUrl(`/covers/${bvid}.jpg`);

export const getBiliVideoUrl = (bvid: string) => `https://www.bilibili.com/video/${bvid}`;
