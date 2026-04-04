import { useState, useEffect } from 'react';
import { BiliData } from '../types';

let cachedData: BiliData | null = null;
let lastFetchTime: number = 0;

export const useBiliData = () => {
  const [biliData, setBiliData] = useState<BiliData | null>(cachedData);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        const now = Date.now();
        // Return cache if it's less than 5 minutes old
        if (cachedData && now - lastFetchTime < 5 * 60 * 1000) {
          if (mounted) setBiliData(cachedData);
          return;
        }

        const response = await fetch('https://bili.saneko.me/api/data');
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

    fetchData(); // Initial fetch
    
    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return biliData;
};
