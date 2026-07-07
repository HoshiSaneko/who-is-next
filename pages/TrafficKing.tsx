import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowUpRight, FiClock, FiFilm, FiRadio, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { TRAFFIC_KING_EPISODES, TRAFFIC_KING_RULE_SUMMARY, TrafficKingTeam } from '../configs/trafficKing.config';
import { BILI_REFRESH_INTERVAL_MS } from '../hooks/useBiliData';
import { BiliVideoStatsData } from '../hooks/useBiliVideoStats';
import { PageShell } from '../components/ui';
import { BILI_API_ENDPOINTS } from '../configs/api.config';

type VideoStatsMap = Record<string, BiliVideoStatsData | null>;

const formatNumber = (value?: number) => (typeof value === 'number' ? value.toLocaleString('zh-CN') : '-');

const getBiliUrl = (bvid?: string, fallback?: string) => fallback || (bvid ? `https://www.bilibili.com/video/${bvid}` : undefined);

const getTeamStats = (team: TrafficKingTeam, statsMap: VideoStatsMap) => {
  const bvid = team.video.bvid?.trim();
  return bvid ? statsMap[bvid] || null : null;
};

const metricRows = [
  { key: 'play', label: '播放量' },
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
  const configuredCount = bvids.length;
  const winnerIndex = teamStats.every(Boolean)
    ? teamStats[0]!.play === teamStats[1]!.play
      ? -1
      : teamStats[0]!.play > teamStats[1]!.play
        ? 0
        : 1
    : -1;
  const playDiff = teamStats.every(Boolean) ? Math.abs(teamStats[0]!.play - teamStats[1]!.play) : 0;
  const maxPlay = Math.max(...teamStats.map((item) => item?.play || 0), 1);

  return (
    <div className="traffic-king-page">
      <PageShell className="traffic-king-shell relative z-10">
        <section className="traffic-king-hero">
          <div className="traffic-king-hero-copy">
            <p className="traffic-king-kicker">New Series</p>
            <h1>谁是流量王</h1>
            <p>{TRAFFIC_KING_RULE_SUMMARY}</p>
          </div>
          <div className="traffic-king-brief">
            <div>
              <FiFilm aria-hidden="true" />
              <span>EP{String(episode.episode).padStart(2, '0')}</span>
              <strong>{episode.theme}</strong>
            </div>
            <div>
              <FiClock aria-hidden="true" />
              <span>统计窗口</span>
              <strong>{episode.publishAt} - {episode.deadlineAt}</strong>
            </div>
            <div>
              <FiRadio aria-hidden="true" />
              <span>数据状态</span>
              <strong>{configuredCount === 2 ? '实时追踪' : '等待 BV 号'}</strong>
            </div>
          </div>
        </section>

        <section className="traffic-scoreboard">
          <div className="traffic-scoreboard-head">
            <div>
              <p>Battle Board</p>
              <span>{winnerIndex >= 0 ? `${episode.teams[winnerIndex].name} 暂时领先 ${formatNumber(playDiff)} 播放` : '填入两队 BV 号后自动判定领先方'}</span>
            </div>
            <span className="traffic-live-pill"><FiTrendingUp aria-hidden="true" /> Play wins</span>
          </div>

          <div className="traffic-team-grid">
            {episode.teams.map((team, index) => {
              const stats = teamStats[index];
              const isWinner = winnerIndex === index;
              const url = getBiliUrl(team.video.bvid, team.video.url);

              return (
                <article key={team.id} className={`traffic-team-card traffic-team-card-${team.accent} ${isWinner ? 'is-leading' : ''}`}>
                  <div className="traffic-team-top">
                    <div>
                      <span>{team.name}</span>
                      <h2>{stats?.title || team.video.title}</h2>
                    </div>
                    {isWinner && <strong>Leading</strong>}
                  </div>

                  <div className="traffic-play-row">
                    <span>播放量</span>
                    <strong>{formatNumber(stats?.play)}</strong>
                  </div>

                  <div className="traffic-play-track" aria-label={`${team.name} 播放量占比`}>
                    <span style={{ width: `${stats ? Math.max(6, (stats.play / maxPlay) * 100) : 6}%` }} />
                  </div>

                  <div className="traffic-member-list">
                    <FiUsers aria-hidden="true" />
                    {team.members.map((member, memberIndex) => (
                      <span key={`${team.id}-${member}-${memberIndex}`}>{member}</span>
                    ))}
                  </div>

                  <div className="traffic-mini-metrics">
                    {metricRows.slice(1).map((metric) => (
                      <div key={metric.key}>
                        <span>{metric.label}</span>
                        <strong>{formatNumber(stats?.[metric.key])}</strong>
                      </div>
                    ))}
                  </div>

                  {url ? (
                    <a className="traffic-video-link" href={url} target="_blank" rel="noreferrer">
                      Open in Bilibili
                      <FiArrowUpRight aria-hidden="true" />
                    </a>
                  ) : (
                    <div className="traffic-video-link is-disabled">待填入 BV 号</div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="traffic-compare-panel">
          <div className="traffic-compare-heading">
            <p>Data Compare</p>
            <span>以播放量决定胜负，其余指标辅助观察传播质量。</span>
          </div>
          <div className="traffic-compare-list">
            {metricRows.map((metric) => {
              const values = teamStats.map((item) => item?.[metric.key] || 0);
              const maxValue = Math.max(...values, 1);

              return (
                <div className="traffic-compare-row" key={metric.key}>
                  <span>{metric.label}</span>
                  <div>
                    {episode.teams.map((team, index) => (
                      <div className={`traffic-compare-bar traffic-compare-bar-${team.accent}`} key={`${metric.key}-${team.id}`}>
                        <strong>{team.name}</strong>
                        <i style={{ width: `${values[index] ? Math.max(5, (values[index] / maxValue) * 100) : 5}%` }} />
                        <em>{formatNumber(values[index] || undefined)}</em>
                      </div>
                    ))}
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
