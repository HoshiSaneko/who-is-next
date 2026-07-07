import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiBookOpen,
  FiExternalLink,
} from 'react-icons/fi';
import { HOME_FEATURED_VIDEO_CONFIG, SEASON_EPISODES_CONFIG } from '../configs/seasonEpisodes.config';
import { BILI_REFRESH_INTERVAL_MS, useBiliData } from '../hooks/useBiliData';
import { useBiliVideoTotal } from '../hooks/useBiliVideoTotal';
import { useBiliVideoStats } from '../hooks/useBiliVideoStats';
import { formatCompactNumber, getBiliVideoUrl, getCover } from '../utils/format';

const heroImage = '/images/home-hero-next-basketball.png';

const formatHeroPlayCount = (value: number) => value.toLocaleString('zh-CN');

type BiliMetricIconType = 'play' | 'like' | 'coin' | 'favorite';

const BiliMetricIcon: React.FC<{ type: BiliMetricIconType }> = ({ type }) => {
  if (type === 'play') {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 4.04c-2.1 0-3.94.11-5.23.21-.96.08-1.7.81-1.79 1.76A44.7 44.7 0 0 0 2.79 10c0 1.53.09 2.92.19 3.98.08.95.83 1.69 1.79 1.77 1.3.1 3.13.21 5.23.21 2.1 0 3.94-.11 5.23-.21.96-.08 1.7-.81 1.79-1.76.1-1.06.19-2.45.19-3.99 0-1.53-.09-2.92-.19-3.98-.08-.95-.83-1.69-1.79-1.77A65.8 65.8 0 0 0 10 4.04Zm2.23 5.16c.62.36.62 1.25 0 1.6l-2.65 1.54c-.62.35-1.39-.1-1.39-.81V8.47c0-.72.77-1.16 1.39-.81l2.65 1.54Z" />
      </svg>
    );
  }

  if (type === 'like') {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true">
        <path d="M9.77 30.86V11.75H7.55a3.68 3.68 0 0 0-3.69 3.68v11.75a3.68 3.68 0 0 0 3.69 3.68h2.22Zm2.22 0V11.7c3-1.07 4.7-3.81 5.12-8.36.16-1.78 1.85-2.52 3.47-1.74 1.6.77 2.66 2.73 2.66 5.34 0 1.56-.19 3.17-.58 4.8h7.07a3.7 3.7 0 0 1 3.59 4.58l-2.33 9.48a6.65 6.65 0 0 1-6.46 5.06H11.99Z" />
      </svg>
    );
  }

  if (type === 'coin') {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.045 25.5454C7.69377 25.5454 2.54504 20.3967 2.54504 14.0454C2.54504 7.69413 7.69377 2.54541 14.045 2.54541C20.3963 2.54541 25.545 7.69413 25.545 14.0454C25.545 17.0954 24.3334 20.0205 22.1768 22.1771C20.0201 24.3338 17.095 25.5454 14.045 25.5454ZM9.66202 6.81624H18.2761C18.825 6.81624 19.27 7.22183 19.27 7.72216C19.27 8.22248 18.825 8.62807 18.2761 8.62807H14.95V10.2903C17.989 10.4444 20.3766 12.9487 20.3855 15.9916V17.1995C20.3854 17.6997 19.9799 18.1052 19.4796 18.1052C18.9793 18.1052 18.5738 17.6997 18.5737 17.1995V15.9916C18.5667 13.9478 16.9882 12.2535 14.95 12.1022V20.5574C14.95 21.0577 14.5444 21.4633 14.0441 21.4633C13.5437 21.4633 13.1382 21.0577 13.1382 20.5574V12.1022C11.1 12.2535 9.52148 13.9478 9.51448 15.9916V17.1995C9.5144 17.6997 9.10883 18.1052 8.60856 18.1052C8.1083 18.1052 7.70273 17.6997 7.70265 17.1995V15.9916C7.71158 12.9487 10.0992 10.4444 13.1382 10.2903V8.62807H9.66202C9.11309 8.62807 8.66809 8.22248 8.66809 7.72216C8.66809 7.22183 9.11309 6.81624 9.66202 6.81624Z"
        />
      </svg>
    );
  }

  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
      <path d="M19.81 9.26a3.45 3.45 0 0 1-2.46-1.87l-1.88-3.9a1.62 1.62 0 0 0-3.03 0l-1.79 3.9a3.4 3.4 0 0 1-2.46 1.87l-4.25.65a1.6 1.6 0 0 0-.9 2.76l3.19 3.25c.74.73 1.06 1.78.9 2.84l-.74 4.55c-.24 1.38 1.23 2.35 2.46 1.7l3.6-1.95a3.32 3.32 0 0 1 3.19 0l3.6 1.95c1.22.65 2.61-.32 2.45-1.7l-.82-4.55c-.16-1.06.16-2.11.9-2.84l3.19-3.25c.98-.97.41-2.6-.9-2.76l-4.25-.65Z" />
    </svg>
  );
};

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
  const featuredVideoStats = useBiliVideoStats(HOME_FEATURED_VIDEO_CONFIG.bvid);
  const [heroMetric, setHeroMetric] = useState<'total' | 'latest'>('total');
  const latestEpisode = SEASON_EPISODES_CONFIG[SEASON_EPISODES_CONFIG.length - 1];
  const latestStats = latestEpisode ? biliData?.data.co_creation[latestEpisode.bvid] : null;

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

  const featuredPlay = featuredVideoStats?.data.play ?? latestStats?.play ?? 0;
  const isLatestMetric = heroMetric === 'latest';
  const heroPlayValue = isLatestMetric ? featuredPlay : totals.play;
  const heroMetricOptions = [
    { value: 'total' as const, label: '总播放量', disabled: false },
    { value: 'latest' as const, label: HOME_FEATURED_VIDEO_CONFIG.title, disabled: !featuredPlay },
  ];

  return (
    <div className="w-full bg-[#080c16]">
      <section className="relative isolate flex min-h-[100svh] w-full overflow-hidden bg-[#080c16] text-white">
        <img
          src={heroImage}
          alt="下一个是谁篮球馆合影"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
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
                <img src={getCover(latestEpisode.bvid)} alt={latestEpisode.title} />
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
