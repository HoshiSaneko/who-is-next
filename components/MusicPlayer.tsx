import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { parseLrc, LyricItem, getCurrentLyric } from '../utils/lrcParser';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [previousVolume, setPreviousVolume] = useState(0.15); // 用于记录静音前的音量
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [lyrics, setLyrics] = useState<LyricItem[]>([]);
  const [currentLyricText, setCurrentLyricText] = useState('');
  
  // 新增播放列表状态
  const playlist = [
    { title: '下一个是谁', src: 'https://cdn.jsdelivr.net/gh/HoshiSaneko/who-is-next/public/musics/%E4%B8%8B%E4%B8%80%E4%B8%AA%E6%98%AF%E8%B0%81.mp3', lrc: 'https://cdn.jsdelivr.net/gh/HoshiSaneko/who-is-next/public/musics/%E4%B8%8B%E4%B8%80%E4%B8%AA%E6%98%AF%E8%B0%81.lrc' },
    { title: '八角笼', src: 'https://cdn.jsdelivr.net/gh/HoshiSaneko/who-is-next/public/musics/%E5%85%AB%E8%A7%92%E7%AC%BC.mp3', lrc: 'https://cdn.jsdelivr.net/gh/HoshiSaneko/who-is-next/public/musics/%E5%85%AB%E8%A7%92%E7%AC%BC.lrc' },
    { title: '下一个是谁 (宣宣版)', src: 'https://cdn.jsdelivr.net/gh/HoshiSaneko/who-is-next/public/musics/%E4%B8%8B%E4%B8%80%E4%B8%AA%E6%98%AF%E8%B0%81_%E5%AE%A3%E5%宣.mp3', lrc: 'https://cdn.jsdelivr.net/gh/HoshiSaneko/who-is-next/public/musics/%E4%B8%8B%E4%B8%80%E4%B8%AA%E6%98%AF%E8%B0%81_%E5%AE%A3%E5%宣.lrc' }
  ];
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // 获取当前歌曲的歌词
    const currentSong = playlist[currentSongIndex];
    fetch(currentSong.lrc)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then(text => {
        const parsed = parseLrc(text);
        setLyrics(parsed);
        // 切换歌曲时重置状态
        setCurrentLyricText('');
      })
      .catch(err => console.error('Failed to load lyrics for', currentSong.title, err));
  }, [currentSongIndex]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    // 切换歌曲后自动播放（如果是播放状态）
    if (isPlaying && audioRef.current) {
      // setTimeout is needed to allow React to update the audio src first
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        }
      }, 50);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 兼容可能遗留的直接调用，但主要由 onClick 和 onDrag 处理
    const val = parseFloat(e.target.value);
    const newVolume = Math.max(0.01, Math.min(1, val));
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const updateVolumeFromEvent = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const y = clientY - rect.top;
    // 限制在 1% 到 100% 之间
    const newVolume = Math.max(0.01, Math.min(1, 1 - (y / rect.height)));
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        // 取消静音，恢复之前的音量
        const restoreVol = previousVolume > 0 ? previousVolume : 0.15;
        setVolume(restoreVol);
        audioRef.current.volume = restoreVol;
        setIsMuted(false);
      } else {
        // 静音
        setPreviousVolume(volume);
        setVolume(0);
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const now = audioRef.current.currentTime;
      
      if (lyrics.length > 0) {
        // Find current lyric index
        let currentIndex = lyrics.findIndex((l, i) => {
          const nextL = lyrics[i + 1];
          return now >= l.time && (!nextL || now < nextL.time);
        });

        if (currentIndex !== -1) {
          const currentL = lyrics[currentIndex];
          
          // 如果当前时间超过这句歌词的“最大容忍显示时间”（比如已经唱完很久了），就清空歌词
          const nextL = lyrics[currentIndex + 1];
          const timePassedInLine = now - currentL.time;
          
          const maxDisplayTime = nextL ? Math.min(nextL.time - currentL.time, 5.0) : 5.0;
          
          if (timePassedInLine > maxDisplayTime + 1.0) { // 留1秒的缓冲余量
             setCurrentLyricText('');
          } else {
             setCurrentLyricText(currentL.text);
          }
        } else {
          // 如果还没有到第一句歌词的时间
          if (now < lyrics[0].time) {
            setCurrentLyricText(`正在播放: ${playlist[currentSongIndex].title}`);
          } else {
            setCurrentLyricText('');
          }
        }
      } else {
         setCurrentLyricText(`正在播放: ${playlist[currentSongIndex].title}`);
      }
    }
  };

  return (
    <>
      <div className={`flex items-center gap-2 bg-[#F5F5F5] md:bg-transparent px-2 py-1 rounded-full group transition-all duration-300 w-[110px] md:w-[130px]`}>
        <audio 
          ref={audioRef} 
          src={playlist[currentSongIndex].src} 
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleNextSong}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.volume = volume;
            }
          }}
        />
        
        {/* 控制按钮组 (导航栏内) */}
        <div className="flex items-center justify-end gap-2 relative shrink-0 ml-auto w-full">
          <button 
            onClick={togglePlay}
            className="w-7 h-7 rounded-full bg-[#E5E5E5] md:bg-[#F5F5F5] hover:bg-[#88B090] hover:text-white text-[#555555] flex items-center justify-center transition-colors duration-300 focus:outline-none"
            title={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? (
              <svg className="w-3 h-3" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M426.666667 138.666667v746.666666a53.393333 53.393333 0 0 1-53.333334 53.333334H266.666667a53.393333 53.393333 0 0 1-53.333334-53.333334V138.666667a53.393333 53.393333 0 0 1 53.333334-53.333334h106.666666a53.393333 53.393333 0 0 1 53.333334 53.333334z m330.666666-53.333334H650.666667a53.393333 53.393333 0 0 0-53.333334 53.333334v746.666666a53.393333 53.393333 0 0 0 53.333334 53.333334h106.666666a53.393333 53.393333 0 0 0 53.333334-53.333334V138.666667a53.393333 53.393333 0 0 0-53.333334-53.333334z"></path>
              </svg>
            ) : (
              <svg className="w-3 h-3 translate-x-[1px]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                <path d="M870.2 466.333333l-618.666667-373.28a53.333333 53.333333 0 0 0-80.866666 45.666667v746.56a53.206667 53.206667 0 0 0 80.886666 45.666667l618.666667-373.28a53.333333 53.333333 0 0 0 0-91.333334z"></path>
              </svg>
            )}
          </button>

          <div 
            className="relative flex items-center h-full group/volume"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            {/* 扩大悬浮感应区 (向下) */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-12 h-6 -mt-2 z-10" />

            <button 
              onClick={toggleMute}
              className="w-7 h-7 rounded-full text-[#555555] hover:text-[#88B090] flex items-center justify-center transition-colors duration-300 focus:outline-none relative z-20" 
              title={isMuted ? "取消静音" : "静音"}
            >
              {isMuted || volume === 0 ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586l3.707 3.707A1 1 0 0015 19V5a1 1 0 00-1.707-.707L9.586 8H7a2 2 0 00-2 2z" />
                </svg>
              )}
            </button>

            {/* 音量滑块垂直弹出层 (向下展开) */}
            <div 
              className={`absolute top-full mt-1 right-0 md:left-1/2 md:-translate-x-1/2 bg-white border border-[#E5E5E5] rounded-lg shadow-lg py-4 px-3 transition-all duration-200 origin-top flex flex-col items-center gap-3 z-[100] ${showVolume ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-0 pointer-events-none'}`}
            >
              <span className="text-[10px] text-[#999999] font-mono leading-none">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
              <div 
                className="h-20 w-1.5 bg-[#E5E5E5] rounded-full relative cursor-pointer" 
                onClick={updateVolumeFromEvent}
                onMouseMove={(e) => {
                  if (e.buttons === 1) updateVolumeFromEvent(e);
                }}
                onTouchMove={(e) => {
                  updateVolumeFromEvent(e);
                }}
              >
                <div 
                  className={`absolute bottom-0 left-0 w-full rounded-full pointer-events-none transition-all duration-75 ${isMuted ? 'bg-[#CCCCCC]' : 'bg-[#88B090]'}`}
                  style={{ height: `${(isMuted ? 0 : volume) * 100}%` }}
                ></div>
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 rounded-full pointer-events-none shadow-sm transition-all duration-75 ${isMuted ? 'border-[#CCCCCC]' : 'border-[#88B090]'}`}
                  style={{ bottom: `calc(${(isMuted ? 0 : volume) * 100}% - 7px)` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 切换歌曲按钮 */}
          <button 
            onClick={handleNextSong}
            className="w-7 h-7 rounded-full text-[#555555] hover:text-[#88B090] flex items-center justify-center transition-colors duration-300 focus:outline-none"
            title="下一首"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M161.651544 428.885088h700.765879c18.316315 0 27.289084-27.659859 14.089473-43.4549L676.658849 148.282116C663.755858 132.932007 642.250873 144.203585 642.250873 166.450121V302.89554c0 13.867007-9.046925 25.21274-20.318503 25.21274H161.651544c-11.271578 0-20.318503 11.271578-20.318503 25.212741v50.425481c0 13.867007 9.046925 25.21274 20.318503 25.21274z m700.765879 166.181622H161.651544c-18.316315 0-27.363239 27.659859-14.089473 43.4549L347.410119 875.743838c12.828836 15.275955 34.333821 3.930221 34.33382-18.242159V721.130414c0-13.867007 9.12108-25.21274 20.392658-25.212741h460.354981c11.271578 0 20.318503-11.271578 20.318503-25.21274v-50.425481c-0.074155-13.867007-9.195235-25.21274-20.392658-25.212741z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* 底部悬浮歌词 (播放时显示) */}
        {createPortal(
          <div 
            className={`fixed bottom-[72px] md:bottom-[60px] left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center transition-all duration-700 ease-in-out pointer-events-none ${
              isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ width: 'min(90vw, 600px)' }}
          >
            {/* 歌词显示 (日式极简效果) */}
            <div className="relative w-full text-center truncate text-base md:text-lg font-medium tracking-[0.2em] min-h-[28px] md:min-h-[32px]">
              {/* 纯白描边，确保在任何背景下都能看清 */}
              <style>{`
                .lyric-stroke {
                  text-shadow: 
                    -1px -1px 0 #FFF,
                     1px -1px 0 #FFF,
                    -1px  1px 0 #FFF,
                     1px  1px 0 #FFF,
                     0px  2px 4px rgba(0,0,0,0.1);
                }
              `}</style>
              {/* 纯文本歌词，不再有填充动画 */}
              <span className="text-[#6B8E73] lyric-stroke">
                {currentLyricText || `正在播放: ${playlist[currentSongIndex].title}`}
              </span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default MusicPlayer;
