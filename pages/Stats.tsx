import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GAMES_CONFIG } from '../configs/games.config';
import { GROUPS_CONFIG, GroupTeam } from '../configs/groups.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';
import { SEASON_EPISODES_CONFIG } from '../configs/seasonEpisodes.config';
import { useBiliData } from '../hooks/useBiliData';
import { useBiliVideoTotal } from '../hooks/useBiliVideoTotal';
import { PageShell } from '../components/ui';
import { OptimizedImage } from '../src/components/OptimizedImage';

const splitNames = (value?: string) => (value ? value.split(/[,，、&]+/).map((item) => item.trim()).filter(Boolean) : []);

const getAvatarByName = (name: string) => UP_MEMBERS_CONFIG.find((member) => member.name === name)?.avatar;
const getTeamName = (team: GroupTeam, index: number) => team.name || `第 ${index + 1} 组`;
const teamMatchesNames = (team: GroupTeam, value?: string) => {
  const names = splitNames(value);
  return names.some((name) => name === team.name || team.members.includes(name));
};
const rankLabel = (value: number) => {
  if (value === 1) return '第一';
  if (value === 2) return '第二';
  if (value === 3) return '第三';
  if (value === 4) return '放弃';
  return '';
};

const formatFullNumber = (value?: number) => (typeof value === 'number' ? value.toLocaleString('en-US') : '-');

type Tone = 'sky' | 'teal' | 'amber' | 'rose';
type BiliMetricIconType = 'play' | 'like' | 'coin' | 'favorite';
type LeaderboardType = 'clears' | 'seasonWins' | 'giveUps';
type DifficultyBucket = {
  name: string;
  count: number;
  color: string;
  levels: { id: string; levelName: string; season: number }[];
};

const toneStyles: Record<Tone, { text: string; icon: string; border: string; glow: string }> = {
  sky: {
    text: 'text-[#ffe1b0]',
    icon: 'border-[#ffd59d]/[0.22] bg-[linear-gradient(135deg,rgba(255,213,157,0.13),rgba(255,255,255,0.045))] text-[#ffe1b0] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_24px_rgba(0,0,0,0.16)]',
    border: 'border-[#ffd59d]/[0.22]',
    glow: 'from-[#ffd59d]/[0.22]',
  },
  teal: {
    text: 'text-[#f2cf93]',
    icon: 'border-[#ffd59d]/[0.22] bg-[linear-gradient(135deg,rgba(255,213,157,0.12),rgba(255,255,255,0.04))] text-[#f2cf93] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_24px_rgba(0,0,0,0.16)]',
    border: 'border-[#ffd59d]/[0.2]',
    glow: 'from-[#ffd59d]/[0.2]',
  },
  amber: {
    text: 'text-[#e3bd7a]',
    icon: 'border-[#e3bd7a]/[0.24] bg-[linear-gradient(135deg,rgba(227,189,122,0.13),rgba(255,255,255,0.045))] text-[#e3bd7a] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_24px_rgba(0,0,0,0.16)]',
    border: 'border-[#e3bd7a]/[0.24]',
    glow: 'from-[#e3bd7a]/[0.22]',
  },
  rose: {
    text: 'text-[#e8b9a0]',
    icon: 'border-[#e8b9a0]/[0.22] bg-[linear-gradient(135deg,rgba(232,185,160,0.12),rgba(255,255,255,0.045))] text-[#e8b9a0] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_24px_rgba(0,0,0,0.16)]',
    border: 'border-[#e8b9a0]/[0.22]',
    glow: 'from-[#e8b9a0]/[0.18]',
  },
};

const Panel: React.FC<{
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, children, className = '' }) => (
  <section className={`overflow-hidden rounded-[10px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(8,11,15,0.68),rgba(8,11,15,0.36))] text-white shadow-[0_22px_62px_rgba(0,0,0,0.22)] backdrop-blur-[18px] ${className}`}>
    {(title || description) && (
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          {title && <h2 className="text-[0.82rem] font-[760] uppercase leading-none tracking-[0.12em] text-white/90">{title}</h2>}
          {description && <p className="mt-2 text-sm leading-5 text-[#ffd59d]/[0.68]">{description}</p>}
        </div>
      </div>
    )}
    <div className="p-5">{children}</div>
  </section>
);

const BiliMetricIcon: React.FC<{ type: BiliMetricIconType }> = ({ type }) => {
  if (type === 'play') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10 4.04c-2.1 0-3.94.11-5.23.21-.96.08-1.7.81-1.79 1.76A44.7 44.7 0 0 0 2.79 10c0 1.53.09 2.92.19 3.98.08.95.83 1.69 1.79 1.77 1.3.1 3.13.21 5.23.21 2.1 0 3.94-.11 5.23-.21.96-.08 1.7-.81 1.79-1.76.1-1.06.19-2.45.19-3.99 0-1.53-.09-2.92-.19-3.98-.08-.95-.83-1.69-1.79-1.77A65.8 65.8 0 0 0 10 4.04Zm2.23 5.16c.62.36.62 1.25 0 1.6l-2.65 1.54c-.62.35-1.39-.1-1.39-.81V8.47c0-.72.77-1.16 1.39-.81l2.65 1.54Z" />
      </svg>
    );
  }

  if (type === 'like') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true">
        <path d="M9.77 30.86V11.75H7.55a3.68 3.68 0 0 0-3.69 3.68v11.75a3.68 3.68 0 0 0 3.69 3.68h2.22Zm2.22 0V11.7c3-1.07 4.7-3.81 5.12-8.36.16-1.78 1.85-2.52 3.47-1.74 1.6.77 2.66 2.73 2.66 5.34 0 1.56-.19 3.17-.58 4.8h7.07a3.7 3.7 0 0 1 3.59 4.58l-2.33 9.48a6.65 6.65 0 0 1-6.46 5.06H11.99Z" />
      </svg>
    );
  }

  if (type === 'coin') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.045 25.5454C7.69377 25.5454 2.54504 20.3967 2.54504 14.0454C2.54504 7.69413 7.69377 2.54541 14.045 2.54541C20.3963 2.54541 25.545 7.69413 25.545 14.0454C25.545 17.0954 24.3334 20.0205 22.1768 22.1771C20.0201 24.3338 17.095 25.5454 14.045 25.5454ZM9.66202 6.81624H18.2761C18.825 6.81624 19.27 7.22183 19.27 7.72216C19.27 8.22248 18.825 8.62807 18.2761 8.62807H14.95V10.2903C17.989 10.4444 20.3766 12.9487 20.3855 15.9916V17.1995C20.3854 17.6997 19.9799 18.1052 19.4796 18.1052C18.9793 18.1052 18.5738 17.6997 18.5737 17.1995V15.9916C18.5667 13.9478 16.9882 12.2535 14.95 12.1022V20.5574C14.95 21.0577 14.5444 21.4633 14.0441 21.4633C13.5437 21.4633 13.1382 21.0577 13.1382 20.5574V12.1022C11.1 12.2535 9.52148 13.9478 9.51448 15.9916V17.1995C9.5144 17.6997 9.10883 18.1052 8.60856 18.1052C8.1083 18.1052 7.70273 17.6997 7.70265 17.1995V15.9916C7.71158 12.9487 10.0992 10.4444 13.1382 10.2903V8.62807H9.66202C9.11309 8.62807 8.66809 8.22248 8.66809 7.72216C8.66809 7.22183 9.11309 6.81624 9.66202 6.81624Z"
        />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 28 28" fill="currentColor" aria-hidden="true">
      <path d="M19.81 9.26a3.45 3.45 0 0 1-2.46-1.87l-1.88-3.9a1.62 1.62 0 0 0-3.03 0l-1.79 3.9a3.4 3.4 0 0 1-2.46 1.87l-4.25.65a1.6 1.6 0 0 0-.9 2.76l3.19 3.25c.74.73 1.06 1.78.9 2.84l-.74 4.55c-.24 1.38 1.23 2.35 2.46 1.7l3.6-1.95a3.32 3.32 0 0 1 3.19 0l3.6 1.95c1.22.65 2.61-.32 2.45-1.7l-.82-4.55c-.16-1.06.16-2.11.9-2.84l3.19-3.25c.98-.97.41-2.6-.9-2.76l-4.25-.65Z" />
    </svg>
  );
};

const StatsMetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  icon: BiliMetricIconType;
  tone: Tone;
  featured?: boolean;
}> = ({ label, value, icon, tone, featured = false }) => (
  <article className={`group relative cursor-default overflow-hidden rounded-[12px] border border-white/[0.13] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_48%,rgba(255,213,157,0.075))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-[18px] transition duration-300 hover:-translate-y-1 hover:border-[#ffd59d]/[0.42] hover:bg-[linear-gradient(135deg,rgba(255,213,157,0.13),rgba(255,255,255,0.055)_52%,rgba(255,213,157,0.1))] hover:shadow-[0_30px_76px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.1)] ${featured ? 'min-h-[12rem] p-6 sm:p-7 lg:min-h-[14rem] lg:p-8' : 'min-h-[9rem] p-5 sm:p-6 lg:min-h-[10rem]'}`}>
    <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#ffd59d]/[0.075] blur-3xl transition duration-300 group-hover:bg-[#ffd59d]/[0.11]" />
    <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,237,210,0.15),transparent)] opacity-0 transition duration-700 group-hover:translate-x-[340%] group-hover:opacity-100" />
    <div className={`pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r ${toneStyles[tone].glow} via-[#ffe1b0]/[0.42] to-transparent opacity-80 transition duration-300 group-hover:h-[3px] group-hover:opacity-100`} />
    <div className="relative flex min-h-full items-start justify-between gap-5">
      <div className="min-w-0 flex-1">
        <p className={`${featured ? 'text-[0.74rem] sm:text-[0.82rem]' : 'text-[0.68rem] sm:text-[0.74rem]'} cursor-default font-bold uppercase leading-none tracking-[0.18em] text-[#ffd59d]/[0.72] transition duration-300 group-hover:text-[#ffe1b0]/95`}>{label}</p>
        <div className={`${featured ? 'mt-5 text-[clamp(2.8rem,7vw,5.25rem)]' : 'mt-4 text-[clamp(2rem,3.8vw,2.85rem)]'} flex cursor-default items-end justify-between gap-4 font-[780] leading-[0.95] tracking-normal text-white tabular-nums drop-shadow-[0_14px_34px_rgba(0,0,0,0.3)] transition duration-300 group-hover:text-[#fff7e8] group-hover:drop-shadow-[0_18px_42px_rgba(255,213,157,0.17)]`}>
          <span className="min-w-0 whitespace-nowrap">{value}</span>
          <span className={`stats-metric-icon ${featured ? 'mb-2 h-10 w-10 sm:h-12 sm:w-12 [&_svg]:h-10 [&_svg]:w-10 sm:[&_svg]:h-12 sm:[&_svg]:w-12' : 'mb-1 h-8 w-8 [&_svg]:h-8 [&_svg]:w-8'} shrink-0 ${toneStyles[tone].text}`}>
            <BiliMetricIcon type={icon} />
          </span>
        </div>
      </div>
    </div>
  </article>
);

const Stats: React.FC = () => {
  const navigate = useNavigate();
  const biliData = useBiliData();
  const totalData = useBiliVideoTotal();
  const [activeLeaderboard, setActiveLeaderboard] = useState<LeaderboardType>('clears');
  const [activeProgressSeason, setActiveProgressSeason] = useState(2);
  const [hiddenProgressTeams, setHiddenProgressTeams] = useState<string[]>([]);

  const detailTotals = useMemo(() => {
    const configuredBvids = new Set(SEASON_EPISODES_CONFIG.map((episode) => episode.bvid));
    return Object.entries(biliData?.data.co_creation || {}).reduce(
      (acc, [bvid, video]) => {
        if (!configuredBvids.has(bvid)) return acc;
        acc.play += video.play || 0;
        acc.like += video.like || 0;
        acc.coin += video.coin || 0;
        acc.favorite += video.favorite || 0;
        if (video.update_time && video.update_time > acc.latestUpdate) acc.latestUpdate = video.update_time;
        return acc;
      },
      { play: 0, like: 0, coin: 0, favorite: 0, latestUpdate: '' },
    );
  }, [biliData]);

  const totals = useMemo(
    () => ({
      play: totalData?.data.total_play ?? detailTotals.play,
      like: totalData?.data.total_like ?? detailTotals.like,
      coin: totalData?.data.total_coin ?? detailTotals.coin,
      favorite: totalData?.data.total_favorite ?? detailTotals.favorite,
      latestUpdate: totalData?.data.update_time ?? detailTotals.latestUpdate,
    }),
    [detailTotals, totalData],
  );

  const stats = useMemo(() => {
    const clearCounts: Record<string, number> = {};
    const giveUpCounts: Record<string, number> = {};
    const seasonWins: Record<string, number> = {};
    UP_MEMBERS_CONFIG.forEach((member) => {
      clearCounts[member.name] = 0;
      giveUpCounts[member.name] = 0;
      seasonWins[member.name] = 0;
    });

    GAMES_CONFIG.forEach((game) => {
      splitNames(game.levelChampion).forEach((name) => {
        if (name !== '无') clearCounts[name] = (clearCounts[name] || 0) + 1;
      });
      splitNames(game.giveUp).forEach((name) => {
        if (name !== '无') giveUpCounts[name] = (giveUpCounts[name] || 0) + 1;
      });
    });

    Array.from(new Set(GAMES_CONFIG.map((game) => game.season))).forEach((season) => {
      const seasonGames = GAMES_CONFIG.filter((game) => game.season === season);
      const finalGame = seasonGames[seasonGames.length - 1];
      splitNames(finalGame?.levelChampion).forEach((name) => {
        if (name !== '无') seasonWins[name] = (seasonWins[name] || 0) + 1;
      });
    });

    const toChart = (record: Record<string, number>) => Object.entries(record).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    const difficulty: DifficultyBucket[] = [
      { name: '3 队放弃', count: 0, color: '#c96f56', levels: [] },
      { name: '2 队放弃', count: 0, color: '#d9a85f', levels: [] },
      { name: '1 队放弃', count: 0, color: '#b7a27a', levels: [] },
    ];

    GAMES_CONFIG.forEach((game) => {
      const seasonConfig = GROUPS_CONFIG.find((season) => Number(season.id.replace('s', '')) === game.season);
      if (!seasonConfig?.teams.length) return;

      const gaveUpTeams = seasonConfig.teams.filter((team) => teamMatchesNames(team, game.giveUp));
      const bucket = gaveUpTeams.length >= 3 ? difficulty[0] : gaveUpTeams.length === 2 ? difficulty[1] : gaveUpTeams.length === 1 ? difficulty[2] : null;
      if (!bucket) return;
      bucket.count += 1;
      bucket.levels.push({ id: game.id, levelName: game.levelName, season: game.season });
    });

    const progressSeasons = GROUPS_CONFIG
      .filter((season) => !season.isPlaceholder && season.teams.length > 0 && Number(season.id.replace('s', '')) >= 2)
      .map((seasonConfig) => {
        const seasonNum = Number(seasonConfig.id.replace('s', ''));
        const teams = seasonConfig.teams.map((team, index) => ({
          ...team,
          chartName: getTeamName(team, index),
          color: ['#f5d9a7', '#d9a85f', '#c96f56', '#b7a27a'][index % 4],
        }));
        const seasonGames = GAMES_CONFIG.filter((game) => game.season === seasonNum);
        const chartData = seasonGames.map((game) => {
          const point: Record<string, string | number | null> = {
            id: game.id,
            levelName: game.levelName,
          };

          teams.forEach((team) => {
            let value: number | null = null;
            if (teamMatchesNames(team, game.giveUp)) value = 4;
            else if (teamMatchesNames(team, game.levelChampion)) value = 1;
            else if (teamMatchesNames(team, game.levelRunnerUp)) value = 2;
            else if (teamMatchesNames(team, game.levelThirdPlace)) value = 3;
            point[team.chartName] = value;
          });

          return point;
        });

        return {
          seasonNum,
          seasonName: seasonConfig.season,
          teams,
          chartData,
        };
    });

    return {
      clears: toChart(clearCounts),
      giveUps: toChart(giveUpCounts),
      seasonWins: toChart(seasonWins),
      difficulty,
      progressSeasons,
    };
  }, []);

  const topClears = stats.clears.slice(0, 6);
  const topGiveUps = stats.giveUps.slice(0, 6);
  const topSeasonWins = stats.seasonWins.slice(0, 6);
  const activeProgress = stats.progressSeasons.find((season) => season.seasonNum === activeProgressSeason) || stats.progressSeasons[0];
  const leaderboardTabs: Array<{
    type: LeaderboardType;
    label: string;
    title: string;
    description: string;
    data: { name: string; count: number }[];
  }> = [
    { type: 'clears', label: '单关通关王', title: '单关通关王', description: '按单关通关次数排序。', data: topClears },
    { type: 'seasonWins', label: '赛季通关王', title: '赛季通关王', description: '按赛季最终胜场排序。', data: topSeasonWins },
    { type: 'giveUps', label: '放弃王', title: '放弃王', description: '按放弃次数排序。', data: topGiveUps },
  ];
  const activeLeaderboardConfig = leaderboardTabs.find((item) => item.type === activeLeaderboard) || leaderboardTabs[0];
  const visibleProgressTeams = activeProgress?.teams.filter((team) => !hiddenProgressTeams.includes(team.chartName)) || [];
  const toggleProgressTeam = (chartName: string) => {
    setHiddenProgressTeams((current) => (current.includes(chartName) ? current.filter((name) => name !== chartName) : [...current, chartName]));
  };
  const renderMemberTick = ({ x, y, payload }: any) => {
    const name = String(payload?.value || '');
    const avatar = getAvatarByName(name);

    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={-164} y={-17} width={150} height={34}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              width: '150px',
              height: '34px',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            {avatar ? (
              <OptimizedImage
                src={avatar}
                alt=""
                style={{
                  width: '24px',
                  height: '24px',
                  flex: '0 0 auto',
                  borderRadius: '999px',
                  objectFit: 'cover',
                  boxShadow: '0 0 0 1px rgba(255,213,157,0.34), 0 8px 18px rgba(0,0,0,0.24)',
                }}
              />
            ) : (
              <span
                style={{
                  display: 'grid',
                  width: '24px',
                  height: '24px',
                  flex: '0 0 auto',
                  placeItems: 'center',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,213,157,0.28)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,225,176,0.82)',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {name.slice(0, 1)}
              </span>
            )}
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                color: 'rgba(255,255,255,0.78)',
                fontSize: '13px',
                fontWeight: 700,
                lineHeight: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  const LeaderboardChart = () => (
    <section className="overflow-hidden rounded-[10px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(8,11,15,0.68),rgba(8,11,15,0.36))] text-white shadow-[0_22px_62px_rgba(0,0,0,0.22)] backdrop-blur-[18px]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[0.82rem] font-[760] uppercase leading-none tracking-[0.12em] text-white/90">{activeLeaderboardConfig.title}</h2>
          <p className="mt-2 text-sm leading-5 text-[#ffd59d]/[0.68]">{activeLeaderboardConfig.description}</p>
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-[8px] border border-white/10 bg-white/[0.055] p-1">
          {leaderboardTabs.map((tab) => {
            const active = tab.type === activeLeaderboard;
            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => setActiveLeaderboard(tab.type)}
                className={`shrink-0 rounded-[7px] px-3 py-2 text-xs font-bold transition duration-200 ${
                  active
                    ? 'bg-[#ffd59d]/[0.16] text-[#ffe1b0] shadow-[inset_0_0_0_1px_rgba(255,213,157,0.2)]'
                    : 'text-white/[0.56] hover:bg-white/[0.07] hover:text-white/[0.86]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-5">
        <div className="h-[440px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart key={activeLeaderboard} data={activeLeaderboardConfig.data} layout="vertical" margin={{ left: 24, right: 34, top: 10, bottom: 12 }} barSize={38}>
            <defs>
              <linearGradient id="stats-active-leaderboard-bar" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#d7a861" />
                <stop offset="56%" stopColor="#efc983" />
                <stop offset="100%" stopColor="#f5d9a7" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.11)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.52)', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={164} tick={renderMemberTick} axisLine={{ stroke: 'rgba(255,255,255,0.18)' }} tickLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,213,157,0.08)' }}
              contentStyle={{ background: 'rgba(8,11,15,0.92)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: '#fff', boxShadow: '0 18px 45px rgba(0,0,0,0.3)' }}
              labelStyle={{ color: 'rgba(255,213,157,0.86)' }}
            />
            <Bar dataKey="count" fill="url(#stats-active-leaderboard-bar)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </section>
  );

  const ProgressTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const levelName = payload[0]?.payload?.levelName;

    return (
      <div className="min-w-[14rem] rounded-[8px] border border-white/15 bg-[#080b0f]/95 px-3 py-2 text-xs shadow-[0_18px_45px_rgba(0,0,0,0.32)]">
        <p className="font-bold text-[#ffe1b0]">{label} · {levelName}</p>
        <div className="mt-2 grid gap-1.5">
          {payload
            .filter((item: any) => typeof item.value === 'number')
            .sort((a: any, b: any) => a.value - b.value)
            .map((item: any) => {
              const team = activeProgress?.teams.find((team) => team.chartName === item.dataKey);

              return (
                <div key={item.dataKey} className="flex items-center justify-between gap-5 text-white/72">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="flex shrink-0 -space-x-1.5">
                      {team?.members.map((member) => {
                        const avatar = getAvatarByName(member);
                        return avatar ? (
                          <OptimizedImage
                            key={member}
                            src={avatar}
                            alt={member}
                            title={member}
                            className="h-5 w-5 rounded-full border border-[#ffd59d]/35 object-cover shadow-[0_5px_12px_rgba(0,0,0,0.24)]"
                          />
                        ) : (
                          <span
                            key={member}
                            title={member}
                            className="grid h-5 w-5 place-items-center rounded-full border border-[#ffd59d]/35 bg-[#6d5b49] text-[10px] font-bold text-[#ffe1b0]"
                          >
                            {member.slice(0, 1)}
                          </span>
                        );
                      })}
                    </span>
                    <span className="truncate">{item.dataKey}</span>
                  </span>
                  <strong className="shrink-0 text-white/90">{rankLabel(item.value)}</strong>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const ProgressLegend = () => (
    <div className="mt-3 flex flex-wrap justify-center gap-3">
      {activeProgress?.teams.map((team) => {
        const hidden = hiddenProgressTeams.includes(team.chartName);

        return (
          <button
            key={team.chartName}
            type="button"
            aria-pressed={!hidden}
            onClick={() => toggleProgressTeam(team.chartName)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition duration-200 ${
              hidden
                ? 'border-white/[0.07] bg-white/[0.025] opacity-45 hover:opacity-75'
                : 'border-white/10 bg-white/[0.055] hover:border-[#ffd59d]/25 hover:bg-[#ffd59d]/[0.08]'
            }`}
          >
            <span className="h-[2px] w-5 rounded-full" style={{ backgroundColor: team.color }} />
            <span className="text-xs font-bold text-white/[0.78]">{team.chartName}</span>
            <span className="flex -space-x-1.5">
              {team.members.map((member) => {
                const avatar = getAvatarByName(member);
                return avatar ? (
                  <OptimizedImage
                    key={member}
                    src={avatar}
                    alt={member}
                    title={member}
                    className="h-5 w-5 rounded-full border border-[#ffd59d]/35 object-cover shadow-[0_5px_12px_rgba(0,0,0,0.24)]"
                  />
                ) : (
                  <span
                    key={member}
                    title={member}
                    className="grid h-5 w-5 place-items-center rounded-full border border-[#ffd59d]/25 bg-white/[0.08] text-[10px] font-bold text-[#ffe1b0]"
                  >
                    {member.slice(0, 1)}
                  </span>
                );
              })}
            </span>
          </button>
        );
      })}
    </div>
  );

  const SeasonProgressChart = () => (
    <section className="overflow-hidden rounded-[10px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(8,11,15,0.68),rgba(8,11,15,0.36))] text-white shadow-[0_22px_62px_rgba(0,0,0,0.22)] backdrop-blur-[18px]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[0.82rem] font-[760] uppercase leading-none tracking-[0.12em] text-white/90">各赛季闯关进度</h2>
          <p className="mt-2 text-sm leading-5 text-[#ffd59d]/[0.68]">横轴为关卡，纵轴为第一、第二、第三和放弃。</p>
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-[8px] border border-white/10 bg-white/[0.055] p-1">
          {stats.progressSeasons.map((season) => {
            const active = season.seasonNum === activeProgress?.seasonNum;
            return (
              <button
                key={season.seasonNum}
                type="button"
                onClick={() => setActiveProgressSeason(season.seasonNum)}
                className={`shrink-0 rounded-[7px] px-3 py-2 text-xs font-bold transition duration-200 ${
                  active
                    ? 'bg-[#ffd59d]/[0.16] text-[#ffe1b0] shadow-[inset_0_0_0_1px_rgba(255,213,157,0.2)]'
                    : 'text-white/[0.56] hover:bg-white/[0.07] hover:text-white/[0.86]'
                }`}
              >
                {season.seasonName}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-5">
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeProgress?.chartData || []} margin={{ left: 8, right: 30, top: 12, bottom: 16 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.11)" strokeDasharray="3 3" />
              <XAxis dataKey="id" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.18)' }} tickLine={false} interval="preserveStartEnd" />
              <YAxis
                type="number"
                domain={[1, 4]}
                ticks={[1, 2, 3, 4]}
                reversed
                tickFormatter={(value) => rankLabel(Number(value))}
                tick={{ fill: 'rgba(255,255,255,0.64)', fontSize: 12, fontWeight: 700 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.18)' }}
                tickLine={false}
                width={46}
              />
              <Tooltip content={<ProgressTooltip />} />
              {visibleProgressTeams.map((team) => (
                <Line
                  key={team.chartName}
                  type="monotone"
                  dataKey={team.chartName}
                  stroke={team.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ProgressLegend />
      </div>
    </section>
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#15110f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_4%,rgba(255,229,188,0.24),transparent_24rem),radial-gradient(circle_at_86%_2%,rgba(42,119,105,0.18),transparent_30rem),linear-gradient(180deg,#15110f_0%,#2a1d18_38%,#755034_72%,#c99a66_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0_9%,rgba(255,255,255,0.08)_9.06%,transparent_9.18%_50%,rgba(255,255,255,0.07)_50.06%,transparent_50.18%_91%,rgba(255,255,255,0.07)_91.06%,transparent_91.18%),repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_30px),repeating-linear-gradient(90deg,rgba(54,29,18,0.13)_0_1px,transparent_1px_128px)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.62)_0%,rgba(5,7,10,0.2)_32%,rgba(255,255,255,0.08)_72%,rgba(255,255,255,0.2)_100%),radial-gradient(ellipse_at_center,transparent_42%,rgba(5,7,10,0.25)_100%)]" />

      <PageShell className="relative z-10 max-w-[1280px] gap-5 pt-24">
        <div className="grid gap-4">
          <StatsMetricCard label="总播放量" value={formatFullNumber(totals.play)} icon="play" tone="sky" featured />
          <div className="grid gap-4 lg:grid-cols-3">
            <StatsMetricCard label="点赞数" value={formatFullNumber(totals.like)} icon="like" tone="teal" />
            <StatsMetricCard label="投币数" value={formatFullNumber(totals.coin)} icon="coin" tone="amber" />
            <StatsMetricCard label="收藏数" value={formatFullNumber(totals.favorite)} icon="favorite" tone="rose" />
          </div>
        </div>

        <LeaderboardChart />

        <SeasonProgressChart />

        <div className="grid gap-5">
          <Panel title="关卡难度" description="按放弃队伍数量统计。">
            <div className="grid gap-3 lg:grid-cols-3">
              {stats.difficulty.map((item) => (
                <div key={item.name} className="rounded-[8px] border border-white/10 bg-white/[0.065] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-white/[0.76]">{item.name}</span>
                    <span className="text-3xl font-[760] text-white tabular-nums">{item.count}</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f4d6a3]/[0.09]">
                    <div className="h-full rounded-full shadow-[0_0_18px_rgba(255,213,157,0.18)]" style={{ width: `${Math.min(100, item.count * 8)}%`, background: `linear-gradient(90deg, ${item.color}, rgba(245, 217, 167, 0.78))` }} />
                  </div>
                  <div className="mt-4 max-h-60 overflow-y-auto pr-1">
                    {item.levels.length > 0 ? (
                      <div className="grid gap-2">
                        {item.levels.map((level) => (
                          <button
                            key={`${item.name}-${level.id}`}
                            type="button"
                            onClick={() => navigate('/levels', { state: { selectedGameId: level.id } })}
                            className="group flex w-full items-center justify-between gap-3 rounded-[7px] border border-white/10 bg-white/[0.055] px-3 py-2 text-left text-xs transition duration-200 hover:border-[#ffd59d]/35 hover:bg-[#ffd59d]/[0.09] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd59d]/70"
                          >
                            <span className="min-w-0 truncate font-semibold text-white/[0.78]" title={level.levelName}>{level.levelName}</span>
                            <span className="shrink-0 text-[#ffd59d]/70 transition group-hover:text-[#ffe1b0]">S{level.season} · {level.id}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[7px] border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-semibold text-white/42">暂无对应关卡</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </PageShell>
    </div>
  );
};

export default Stats;
