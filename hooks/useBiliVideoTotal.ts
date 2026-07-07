import { useEffect, useState } from 'react';
import { BILI_REFRESH_INTERVAL_MS } from './useBiliData';
import { BILI_API_ENDPOINTS } from '../configs/api.config';

export interface BiliVideoTotalData {
  video_count: number;
  total_play: number;
  total_like: number;
  total_coin: number;
  total_favorite: number;
  update_time: string;
}

interface BiliVideoTotalResponse {
  code: number;
  message: string;
  global_last_update_time: string;
  data: BiliVideoTotalData;
}

let cachedTotal: BiliVideoTotalResponse | null = null;
let lastTotalFetchTime = 0;

export const useBiliVideoTotal = () => {
  const [totalData, setTotalData] = useState<BiliVideoTotalResponse | null>(cachedTotal);

  useEffect(() => {
    let mounted = true;

    const fetchTotal = async (forceRefresh = false) => {
      try {
        const now = Date.now();
        if (!forceRefresh && cachedTotal && now - lastTotalFetchTime < BILI_REFRESH_INTERVAL_MS) {
          if (mounted) setTotalData(cachedTotal);
          return;
        }

        const response = await fetch(BILI_API_ENDPOINTS.videoTotal, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');

        const data = (await response.json()) as BiliVideoTotalResponse;
        cachedTotal = data;
        lastTotalFetchTime = Date.now();

        if (mounted) setTotalData(data);
      } catch (error) {
        console.error('Error fetching local bilibili total data:', error);
      }
    };

    fetchTotal();
    const intervalId = window.setInterval(() => fetchTotal(true), BILI_REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return totalData;
};
