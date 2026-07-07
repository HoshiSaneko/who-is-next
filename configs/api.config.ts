import { SITE_CONFIG } from './site.config';

export const BILI_API_BASE_URL = SITE_CONFIG.biliApiBaseUrl.replace(/\/$/, '');

export const BILI_API_ENDPOINTS = {
  data: `${BILI_API_BASE_URL}/api/data`,
  videoTotal: `${BILI_API_BASE_URL}/api/videos/total`,
  videoStats: (bvid: string) => `${BILI_API_BASE_URL}/api/videos/${encodeURIComponent(bvid)}`,
  upInfo: (uid: string) => `${BILI_API_BASE_URL}/api/up-info/${encodeURIComponent(uid)}`,
};
