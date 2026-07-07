import { useState, useEffect } from 'react';
import { BiliData } from '../types';
import { BILI_API_ENDPOINTS } from '../configs/api.config';

let cachedData: BiliData | null = null;
let lastFetchTime: number = 0;

export const BILI_REFRESH_INTERVAL_MS = 30 * 1000;

export const useBiliData = (refreshIntervalMs = BILI_REFRESH_INTERVAL_MS) => {
  const [biliData, setBiliData] = useState<BiliData | null>(cachedData);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async (forceRefresh = false) => {
      try {
        const now = Date.now();
        if (!forceRefresh && cachedData && now - lastFetchTime < refreshIntervalMs) {
          if (mounted) setBiliData(cachedData);
          return;
        }

        const response = await fetch(BILI_API_ENDPOINTS.data, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        cachedData = data;
        lastFetchTime = Date.now();
        
        if (mounted) {
          setBiliData(data);
        }
      } catch (error) {
        console.error('Error fetching bilibili data:', error);
      }
    };

    fetchData();
    
    const intervalId = window.setInterval(() => fetchData(true), refreshIntervalMs);
    
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [refreshIntervalMs]);

  return biliData;
};
