import { useEffect, useState } from 'react';
import { BILI_REFRESH_INTERVAL_MS } from './useBiliData';
import { BILI_API_ENDPOINTS } from '../configs/api.config';

export interface BiliVideoStatsData {
  bvid: string;
  title?: string;
  configured_title?: string;
  play: number;
  like?: number;
  coin?: number;
  favorite?: number;
  update_time?: string;
}

interface BiliVideoStatsResponse {
  code: number;
  message: string;
  data: BiliVideoStatsData;
}

const cachedVideoStats = new Map<string, BiliVideoStatsResponse>();
const lastVideoFetchTimes = new Map<string, number>();

export const useBiliVideoStats = (bvid: string, refreshIntervalMs = BILI_REFRESH_INTERVAL_MS) => {
  const [videoStats, setVideoStats] = useState<BiliVideoStatsResponse | null>(cachedVideoStats.get(bvid) ?? null);

  useEffect(() => {
    if (!bvid) return;

    let mounted = true;

    const fetchVideoStats = async (forceRefresh = false) => {
      try {
        const now = Date.now();
        const cached = cachedVideoStats.get(bvid);
        const lastFetchTime = lastVideoFetchTimes.get(bvid) ?? 0;

        if (!forceRefresh && cached && now - lastFetchTime < refreshIntervalMs) {
          if (mounted) setVideoStats(cached);
          return;
        }

        const response = await fetch(BILI_API_ENDPOINTS.videoStats(bvid), { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');

        const data = (await response.json()) as BiliVideoStatsResponse;
        cachedVideoStats.set(bvid, data);
        lastVideoFetchTimes.set(bvid, Date.now());

        if (mounted) setVideoStats(data);
      } catch (error) {
        console.error(`Error fetching local bilibili video data for ${bvid}:`, error);
      }
    };

    fetchVideoStats();
    const intervalId = window.setInterval(() => fetchVideoStats(true), refreshIntervalMs);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [bvid, refreshIntervalMs]);

  return videoStats;
};
