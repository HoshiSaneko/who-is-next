import React, { createContext, useContext, useState, useEffect } from 'react';
import { audioManager } from '../utils/audioManager';

const STORAGE_KEY = 'global-volume-v3';

interface VolumeContextType {
  volume: number;
  setVolume: (v: number) => void;
}

const VolumeContext = createContext<VolumeContextType>({
  volume: 0.1,
  setVolume: () => {},
});

export const useVolume = () => useContext(VolumeContext);

export const VolumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volume, setVolumeState] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v ? Math.min(1, Math.max(0, parseFloat(v))) : 0.1;
    } catch {
      return 0.1;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(volume));
    audioManager.setVolume(volume);
  }, [volume]);

  return (
    <VolumeContext.Provider value={{ volume, setVolume: setVolumeState }}>
      {children}
    </VolumeContext.Provider>
  );
};
