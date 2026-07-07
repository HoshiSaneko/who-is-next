import React, { useEffect, useRef, useState } from 'react';
import { FiPause, FiPlay, FiSkipForward, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { parseLrc, getCurrentLyric, LyricItem } from '../utils/lrcParser';

const playlist = [
  { title: '少年', src: '/musics/少年.mp3', lrc: '/musics/少年.lrc' },
  { title: '下一个是谁', src: '/musics/下一个是谁.mp3', lrc: '/musics/下一个是谁.lrc' },
  { title: '八角笼', src: '/musics/八角笼.mp3', lrc: '/musics/八角笼.lrc' },
  { title: '下一个是谁 宣宣版', src: '/musics/下一个是谁_宣宣.mp3', lrc: '/musics/下一个是谁_宣宣.lrc' },
];

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.16);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [lyrics, setLyrics] = useState<LyricItem[]>([]);
  const [currentLyric, setCurrentLyric] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = playlist[currentSongIndex];
  const effectiveVolume = isMuted ? 0 : volume;

  useEffect(() => {
    fetch(currentSong.lrc)
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => setLyrics(text ? parseLrc(text) : []))
      .catch(() => setLyrics([]));
  }, [currentSong.lrc]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = effectiveVolume;
  }, [effectiveVolume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const handleNextSong = () => {
    setCurrentSongIndex((index) => (index + 1) % playlist.length);
    setCurrentLyric('');
    setIsPlaying(false);
    window.setTimeout(() => {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }, 80);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || lyrics.length === 0) return;
    setCurrentLyric(getCurrentLyric(lyrics, audioRef.current.currentTime));
  };

  return (
    <div className="flex w-full min-w-0 items-center justify-end gap-1.5">
      <audio ref={audioRef} src={currentSong.src} onTimeUpdate={handleTimeUpdate} onEnded={handleNextSong} />
      <button
        type="button"
        onClick={togglePlay}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.15)] transition hover:bg-slate-800"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4 translate-x-px" />}
      </button>
      <div className="hidden w-[160px] min-w-0 flex-col md:flex">
        <span className="truncate text-xs font-semibold text-slate-800">{currentSong.title}</span>
        <span className="truncate text-[11px] text-slate-600">{currentLyric || 'Ready to play'}</span>
      </div>
      <button
        type="button"
        onClick={() => setIsMuted((muted) => !muted)}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-slate-600 transition hover:bg-slate-950/[0.06] hover:text-slate-950"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FiVolumeX className="h-4 w-4" /> : <FiVolume2 className="h-4 w-4" />}
      </button>
      <input
        aria-label="Volume"
        type="range"
        min="0.01"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
        className="hidden h-1 w-16 shrink-0 cursor-pointer accent-slate-950 xl:block"
      />
      <button
        type="button"
        onClick={handleNextSong}
        className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-slate-600 transition hover:bg-slate-950/[0.06] hover:text-slate-950"
        aria-label="Next song"
      >
        <FiSkipForward className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MusicPlayer;

