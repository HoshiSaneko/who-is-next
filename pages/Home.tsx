import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiExternalLink,
} from 'react-icons/fi';
import { SEASON_EPISODES_CONFIG } from '../configs/seasonEpisodes.config';
import { BILI_REFRESH_INTERVAL_MS, useBiliData } from '../hooks/useBiliData';
import { useBiliVideoTotal } from '../hooks/useBiliVideoTotal';
import { useBiliVideoStats } from '../hooks/useBiliVideoStats';
import { formatCompactNumber, getBiliVideoUrl, getCover } from '../utils/format';
import { BiliMetricIcon } from '../src/components/BiliMetricIcon';
import { OptimizedImage } from '../src/components/OptimizedImage';
import { preloadImageSource } from '../src/utils/imageSources';

const LOCAL_HERO_BACKGROUND = '/images/home-hero-next-basketball.webp';
const HERO_BACKGROUND_INTERVAL_MS = 30_000;

type HeroBackground = {
  id: string;
  alt: string;
  src: string;
};

const DEFAULT_HERO_BACKGROUND: HeroBackground = {
  id: 'local',
  alt: '下一个是谁篮球馆',
  src: LOCAL_HERO_BACKGROUND,
};
let cachedHeroBackground: HeroBackground | null = null;

const formatHeroPlayCount = (value: number) => value.toLocaleString('zh-CN');

const FlipNumber: React.FC<{ value: number }> = ({ value }) => {
  const formattedValue = formatHeroPlayCount(value);

  return (
    <span className="relative inline-grid overflow-hidden py-[0.08em] align-baseline [perspective:1200px]" aria-label={formattedValue}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '42%', opacity: 0, filter: 'blur(10px) brightness(1.42)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px) brightness(1)' }}
          exit={{ y: '-34%', opacity: 0, filter: 'blur(8px) brightness(0.78)' }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="relative col-start-1 row-start-1 inline-block whitespace-nowrap will-change-transform"
        >
          {formattedValue}
          <motion.span
            aria-hidden="true"
            initial={{ x: '-115%', opacity: 0 }}
            animate={{ x: '115%', opacity: [0, 0.42, 0] }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
            className="pointer-events-none absolute inset-y-[0.08em] left-0 w-[36%] skew-x-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)] mix-blend-screen"
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const Home: React.FC = () => {
  const biliData = useBiliData();
  const totalData = useBiliVideoTotal();
  const [heroMetric, setHeroMetric] = useState<'total' | 'latest'>('total');
  const latestEpisode = SEASON_EPISODES_CONFIG[SEASON_EPISODES_CONFIG.length - 1];
  const latestVideoStats = useBiliVideoStats(latestEpisode?.bvid || '');
  const latestStats = latestEpisode ? biliData?.data.co_creation[latestEpisode.bvid] : null;
  const [activeBackground, setActiveBackground] = useState<HeroBackground>(() => cachedHeroBackground || DEFAULT_HERO_BACKGROUND);
  const activeBackgroundRef = useRef(activeBackground);
  const heroBackgrounds = useMemo<HeroBackground[]>(
    () => [
      DEFAULT_HERO_BACKGROUND,
      ...(latestEpisode ? [{ id: latestEpisode.bvid, alt: `下一个是谁第 ${latestEpisode.season} 季第 ${latestEpisode.episode} 集封面`, src: getCover(latestEpisode.bvid) }] : []),
    ],
    [latestEpisode],
  );

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;

    const activateBackground = (background: HeroBackground) => {
      cachedHeroBackground = background;
      activeBackgroundRef.current = background;
      setActiveBackground(background);
    };

    const startRotation = async () => {
      const videoBackground = heroBackgrounds.find((background) => background.id !== DEFAULT_HERO_BACKGROUND.id);
      if (!videoBackground) return;

      const loadedVideoBackground = {
        ...videoBackground,
        src: await preloadImageSource(videoBackground.src),
      };

      if (cancelled) return;

      const loadedBackgrounds = [DEFAULT_HERO_BACKGROUND, loadedVideoBackground];

      const showNextBackground = () => {
        const nextBackground = loadedBackgrounds.find((background) => background.id !== activeBackgroundRef.current.id) || DEFAULT_HERO_BACKGROUND;
        activateBackground(nextBackground);
      };

      intervalId = window.setInterval(showNextBackground, HERO_BACKGROUND_INTERVAL_MS);
    };

    startRotation();

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [heroBackgrounds]);

  const detailTotals = useMemo(() => {
    const configuredBvids = new Set(SEASON_EPISODES_CONFIG.map((episode) => episode.bvid));
    return Object.entries(biliData?.data.co_creation || {}).reduce(
      (acc, [bvid, video]) => {
        if (!configuredBvids.has(bvid)) return acc;
        acc.play += video.play || 0;
        return acc;
      },
      { play: 0 },
    );
  }, [biliData]);

  const totals = useMemo(
    () => ({
      play: totalData?.data.total_play ?? detailTotals.play,
    }),
    [detailTotals, totalData],
  );

  const latestPlay = latestVideoStats?.data.play ?? latestStats?.play ?? 0;
  const isLatestMetric = heroMetric === 'latest';
  const heroPlayValue = isLatestMetric ? latestPlay : totals.play;
  const heroMetricOptions = [
    { value: 'total' as const, label: '总播放量', disabled: false },
    { value: 'latest' as const, label: latestEpisode?.title || '最新一集', disabled: !latestPlay },
  ];

  return (
    <div className="w-full bg-[#080c16]">
      <section className="relative isolate flex min-h-[100svh] w-full overflow-hidden bg-[#080c16] text-white">
        <AnimatePresence initial={false}>
          <motion.img
            key={activeBackground.id}
            src={activeBackground.src}
            alt={activeBackground.alt}
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.85, ease: [0.22, 0.8, 0.2, 1] }}
            className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center"
            fetchPriority="high"
          />
        </AnimatePresence>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,12,22,0.18)_0%,rgba(8,12,22,0.10)_24%,rgba(8,12,22,0.36)_64%,rgba(5,8,15,0.84)_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgba(244,247,251,0.18)_1px,transparent_1px)] [background-size:100%_9px]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-56 bg-gradient-to-b from-[#080c16]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-[#05080f]/90 to-transparent" />

        <div className="mx-auto flex w-full max-w-[1280px] flex-col justify-between px-4 pb-5 pt-10 sm:px-6 sm:pb-8 lg:px-8">
          <div className="mx-auto flex max-w-[1180px] flex-1 flex-col items-center justify-start pt-[clamp(9.5rem,24vh,14rem)] text-center">
            <div className="relative inline-flex max-w-full flex-col items-center">
              <h1 className="hero-total-title flex max-w-[24rem] flex-col items-center text-[clamp(2.75rem,10vw,3.35rem)] font-medium leading-[0.86] tracking-[-0.025em] text-[#f4f7fb] drop-shadow-[0_22px_70px_rgba(2,6,23,0.58)] sm:max-w-none sm:text-[clamp(5.5rem,8.2vw,10.75rem)]">
                <FlipNumber value={heroPlayValue} />
              </h1>
              <div className="hero-status-label metric-mode-switch">
                <div className="metric-mode-track" style={{ '--refresh-duration': `${BILI_REFRESH_INTERVAL_MS}ms` } as React.CSSProperties}>
                {heroMetricOptions.map((option) => {
                  const active = heroMetric === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      aria-pressed={active}
                      onClick={() => setHeroMetric(option.value)}
                      className={`metric-mode-option ${active ? 'is-active' : ''}`}
                    >
                      <span className="metric-mode-node" aria-hidden="true">
                        <span className="metric-mode-diamond" />
                      </span>
                      <span className="metric-mode-label">{option.label}</span>
                    </button>
                  );
                })}
                </div>
              </div>
              <Link to="/traffic-king" className="hero-traffic-king-cta">
                <span className="hero-traffic-king-node" aria-hidden="true">
                  <span className="hero-traffic-king-diamond" />
                </span>
                <span className="hero-traffic-king-text">谁是流量王</span>
              </Link>
            </div>
          </div>

          {latestEpisode && (
            <a
              href={getBiliVideoUrl(latestEpisode.bvid)}
              target="_blank"
              rel="noreferrer"
              className="latest-episode-link group"
            >
              <div className="latest-episode-rail" aria-hidden="true">
                <span>EP</span>
                <strong>{String(latestEpisode.episode).padStart(2, '0')}</strong>
              </div>
              <div className="latest-episode-copy">
                <div className="latest-episode-kicker">
                  <FiBookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Latest Episode</span>
                </div>
                <p className="latest-episode-meta">
                  Season {latestEpisode.season} / Episode {String(latestEpisode.episode).padStart(2, '0')}
                </p>
                <h2 className="latest-episode-title">{latestEpisode.title}</h2>
                <div className="latest-episode-stats">
                  <span className="inline-flex items-center gap-1.5">
                    <BiliMetricIcon type="play" />
                    {formatCompactNumber(latestStats?.play)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BiliMetricIcon type="like" />
                    {formatCompactNumber(latestStats?.like)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BiliMetricIcon type="coin" />
                    {formatCompactNumber(latestStats?.coin)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BiliMetricIcon type="favorite" />
                    {formatCompactNumber(latestStats?.favorite)}
                  </span>
                </div>
              </div>
              <div className="latest-episode-cover">
                <OptimizedImage src={getCover(latestEpisode.bvid)} alt={latestEpisode.title} />
              </div>
              <div className="latest-episode-action">
                <FiExternalLink className="h-4 w-4" aria-hidden="true" />
              </div>
            </a>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
