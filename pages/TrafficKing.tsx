import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowUpRight, FiAward, FiClock, FiFilm, FiRadio, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { TRAFFIC_KING_EPISODES, TRAFFIC_KING_RULE_SUMMARY, TrafficKingTeam } from '../configs/trafficKing.config';
import { BILI_REFRESH_INTERVAL_MS } from '../hooks/useBiliData';
import { BiliVideoStatsData } from '../hooks/useBiliVideoStats';
import { PageShell } from '../components/ui';
import { BILI_API_ENDPOINTS } from '../configs/api.config';
import { OptimizedImage } from '../src/components/OptimizedImage';
import { BiliMetricIcon } from '../src/components/BiliMetricIcon';
import { getCover } from '../utils/format';

type VideoStatsMap = Record<string, BiliVideoStatsData | null>;

const formatNumber = (value?: number) => (typeof value === 'number' ? value.toLocaleString('zh-CN') : '-');
const getBiliUrl = (bvid?: string, fallback?: string) => fallback || (bvid ? `https://www.bilibili.com/video/${bvid}` : undefined);

const getTeamStats = (team: TrafficKingTeam, statsMap: VideoStatsMap) => {
  const bvid = team.video.bvid?.trim();
  return bvid ? statsMap[bvid] || null : null;
};

const secondaryMetrics = [
  { key: 'like', label: '点赞' },
  { key: 'coin', label: '投币' },
  { key: 'favorite', label: '收藏' },
] as const;

const TrafficKing: React.FC = () => {
  const episode = TRAFFIC_KING_EPISODES[0];
  const [statsMap, setStatsMap] = useState<VideoStatsMap>({});
  const bvids = useMemo(
    () => episode.teams.map((team) => team.video.bvid?.trim()).filter((bvid): bvid is string => Boolean(bvid)),
    [episode.teams],
  );

  useEffect(() => {
    if (bvids.length === 0) return;
    let mounted = true;

    const fetchStats = async () => {
      const entries = await Promise.all(
        bvids.map(async (bvid) => {
          try {
            const response = await fetch(BILI_API_ENDPOINTS.videoStats(bvid), { cache: 'no-store' });
            if (!response.ok) throw new Error('Network response was not ok');
            const payload = await response.json();
            return [bvid, payload.data as BiliVideoStatsData] as const;
          } catch (error) {
            console.error(`Error fetching traffic king stats for ${bvid}:`, error);
            return [bvid, null] as const;
          }
        }),
      );

      if (mounted) setStatsMap(Object.fromEntries(entries));
    };

    fetchStats();
    const intervalId = window.setInterval(fetchStats, BILI_REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [bvids]);

  const teamStats = episode.teams.map((team) => getTeamStats(team, statsMap));
  const hasCompleteStats = teamStats.every(Boolean);
  const winnerIndex = hasCompleteStats
    ? teamStats[0]!.play === teamStats[1]!.play
      ? -1
      : teamStats[0]!.play > teamStats[1]!.play
        ? 0
        : 1
    : -1;
  const playDiff = hasCompleteStats ? Math.abs(teamStats[0]!.play - teamStats[1]!.play) : 0;
  const totalPlay = teamStats.reduce((total, stats) => total + (stats?.play || 0), 0);
  const playShares = teamStats.map((stats) => (totalPlay > 0 ? ((stats?.play || 0) / totalPlay) * 100 : 50));
  const trailingPlay = winnerIndex >= 0 ? teamStats[winnerIndex === 0 ? 1 : 0]?.play || 0 : 0;
  const leadPercent = trailingPlay > 0 ? (playDiff / trailingPlay) * 100 : 0;

  return (
    <div className="traffic-king-page">
      <PageShell className="traffic-king-shell relative z-10">
        <section className="traffic-arena-head">
          <div className="traffic-arena-title">
            <p>Traffic King · EP{String(episode.episode).padStart(2, '0')}</p>
            <h1>谁是流量王</h1>
            <span>{TRAFFIC_KING_RULE_SUMMARY}</span>
          </div>
          <div className="traffic-arena-meta">
            <div><FiFilm aria-hidden="true" /><span>本期主题</span><strong>{episode.theme}</strong></div>
            <div><FiClock aria-hidden="true" /><span>统计截止</span><strong>{episode.deadlineAt}</strong></div>
            <div><FiRadio aria-hidden="true" /><span>数据状态</span><strong>{bvids.length === 2 ? '实时追踪' : '等待配置'}</strong></div>
          </div>
        </section>

        <section className="traffic-duel-stage">
          <header className="traffic-duel-head">
            <div>
              <span>当前战况</span>
              <strong>
                {winnerIndex >= 0 ? `${episode.teams[winnerIndex].name} 暂时领先` : hasCompleteStats ? '当前战平' : '正在获取双方数据'}
              </strong>
            </div>
            <div className="traffic-lead-summary">
              <FiTrendingUp aria-hidden="true" />
              <span>领先差值</span>
              <strong>{winnerIndex >= 0 ? formatNumber(playDiff) : '-'}</strong>
              {winnerIndex >= 0 && <small>领先 {leadPercent.toFixed(1)}%</small>}
            </div>
          </header>

          <div className="traffic-duel-grid">
            {episode.teams.map((team, index) => {
              const stats = teamStats[index];
              const isWinner = winnerIndex === index;
              const url = getBiliUrl(team.video.bvid, team.video.url);

              return (
                <React.Fragment key={team.id}>
                  {index === 1 && <div className="traffic-versus" aria-hidden="true"><span><b>VS</b></span></div>}
                  <article className={`traffic-video-card traffic-video-card-${team.accent} ${isWinner ? 'is-leading' : ''}`}>
                    {url && team.video.bvid ? (
                      <a className="traffic-video-cover" href={url} target="_blank" rel="noreferrer" aria-label={`打开${team.name}视频`}>
                        <OptimizedImage src={getCover(team.video.bvid)} alt={stats?.title || team.video.title} loading="eager" />
                        <span className="traffic-team-label">{team.name}</span>
                        {isWinner && <strong className="traffic-leading-label"><FiAward aria-hidden="true" /> 暂时领先</strong>}
                        <span className="traffic-cover-action"><FiArrowUpRight aria-hidden="true" /></span>
                      </a>
                    ) : (
                      <div className="traffic-video-cover is-empty"><FiFilm aria-hidden="true" /></div>
                    )}

                    <div className="traffic-video-body">
                      <h2>{stats?.title || team.video.title}</h2>
                      <div className="traffic-team-members">
                        <FiUsers aria-hidden="true" />
                        {team.members.map((member) => <span key={`${team.id}-${member}`}>{member}</span>)}
                      </div>
                      <div className="traffic-primary-metric">
                        <span>播放量</span>
                        <strong>{formatNumber(stats?.play)}</strong>
                        <small>占双方总播放 {playShares[index].toFixed(1)}%</small>
                      </div>
                    </div>
                  </article>
                </React.Fragment>
              );
            })}
          </div>

          <div className="traffic-share-compare" aria-label="双方播放量占比">
            <div><span>{episode.teams[0].name}</span><strong>{totalPlay > 0 ? `${playShares[0].toFixed(1)}%` : '-'}</strong></div>
            <div className="traffic-share-track">
              <span className="is-red" style={{ width: `${playShares[0]}%` }} />
              <span className="is-blue" style={{ width: `${playShares[1]}%` }} />
            </div>
            <div><strong>{totalPlay > 0 ? `${playShares[1].toFixed(1)}%` : '-'}</strong><span>{episode.teams[1].name}</span></div>
          </div>
        </section>

        <section className="traffic-signal-panel">
          <div className="traffic-signal-heading">
            <div>
              <p>数据对比</p>
              <span>点赞、投币和收藏作为辅助信号，胜负仍以播放量为准。</span>
            </div>
          </div>

          <div className="traffic-signal-list">
            {secondaryMetrics.map((metric) => {
              const values = teamStats.map((stats) => stats?.[metric.key] || 0);
              const maxValue = Math.max(...values, 1);

              return (
                <div className="traffic-signal-row" key={metric.key}>
                  <div className={`traffic-signal-side is-red ${values[0] >= values[1] ? 'is-stronger' : ''}`}>
                    <strong>{formatNumber(values[0] || undefined)}</strong>
                    <span><i style={{ width: `${(values[0] / maxValue) * 100}%` }} /></span>
                  </div>
                  <p><BiliMetricIcon type={metric.key} />{metric.label}</p>
                  <div className={`traffic-signal-side is-blue ${values[1] >= values[0] ? 'is-stronger' : ''}`}>
                    <span><i style={{ width: `${(values[1] / maxValue) * 100}%` }} /></span>
                    <strong>{formatNumber(values[1] || undefined)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </PageShell>
    </div>
  );
};

export default TrafficKing;
