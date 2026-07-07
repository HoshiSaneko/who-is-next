import React, { useMemo, useState } from 'react';
import { FiAward, FiExternalLink } from 'react-icons/fi';
import { GROUPS_CONFIG } from '../configs/groups.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';
import { SEASON_EPISODES_CONFIG } from '../configs/seasonEpisodes.config';
import { PageShell } from '../components/ui';
import { useBiliData } from '../hooks/useBiliData';
import { formatCompactNumber, getBiliVideoUrl, getCover } from '../utils/format';

const getAvatarByName = (name: string) => UP_MEMBERS_CONFIG.find((member) => member.name === name)?.avatar;

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

const Groups: React.FC = () => {
  const biliData = useBiliData();
  const seasons = GROUPS_CONFIG.filter((season) => !season.isPlaceholder);
  const [activeId, setActiveId] = useState(seasons[seasons.length - 1]?.id || 's1');
  const activeSeason = seasons.find((season) => season.id === activeId) || seasons[0];
  const activeIndex = seasons.findIndex((season) => season.id === activeId);
  const seasonNum = Number(activeSeason.id.replace('s', '')) || activeIndex + 1;

  const episodes = useMemo(
    () => SEASON_EPISODES_CONFIG.filter((episode) => episode.season === seasonNum).sort((a, b) => a.episode - b.episode),
    [seasonNum],
  );

  return (
    <div className="season-page">
      <PageShell className="season-shell relative z-10">
        <div className="season-selector-strip">
          {seasons.map((season, index) => {
            const active = season.id === activeId;
            return (
              <button
                key={season.id}
                type="button"
                className={`season-selector-item ${active ? 'is-active' : ''}`}
                onClick={() => setActiveId(season.id)}
              >
                <span>0{index + 1}</span>
                <strong>{season.season}</strong>
              </button>
            );
          })}
        </div>

        <div className="season-content-stack">
          <section className="season-section season-team-section">
            <div className="season-section-heading">
              <p>Team composition</p>
            </div>

            {activeSeason.teams.length === 0 ? (
              <div className="season-solo-panel is-champion">
                <FiAward className="h-5 w-5" aria-hidden="true" />
                <strong>个人赛冠军</strong>
                <span>本季为个人赛制</span>
                <div className="season-solo-winners">
                  {activeSeason.winner.map((winner) => {
                    const avatar = getAvatarByName(winner);
                    return (
                      <div key={winner} className="season-solo-winner-chip">
                        {avatar ? (
                          <img src={avatar} alt={winner} />
                        ) : (
                          <span aria-hidden="true">{winner.slice(0, 1)}</span>
                        )}
                        <strong>{winner}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="season-team-grid">
                {activeSeason.teams.map((team, index) => {
                  const isChampion =
                    activeSeason.winner.includes(team.name) ||
                    team.members.some((member) => activeSeason.winner.includes(member));

                  return (
                    <article key={`${team.name}-${index}`} className={`season-team-card ${isChampion ? 'is-champion' : ''}`}>
                      <div className="season-team-card-head">
                        <span>Team {String(index + 1).padStart(2, '0')}</span>
                        {isChampion && (
                          <span className="season-team-champion-badge">
                            <FiAward className="h-3.5 w-3.5" aria-hidden="true" />
                            Champion
                          </span>
                        )}
                        <strong>{team.name || `Team ${index + 1}`}</strong>
                      </div>
                      <div className="season-member-list">
                        {team.members.map((member) => {
                          const avatar = getAvatarByName(member);
                          return (
                            <div key={member} className="season-member-chip">
                              {avatar ? (
                                <img src={avatar} alt={member} />
                              ) : (
                                <span aria-hidden="true">{member.slice(0, 1)}</span>
                              )}
                              <strong>{member}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="season-section season-episode-section">
            <div className="season-section-heading">
              <p>Episode coverage</p>
              <span>{episodes.length} entries</span>
            </div>

            <div className="season-episode-grid">
              {episodes.map((episode) => {
                const episodeStats = biliData?.data.co_creation[episode.bvid];
                const episodeMetrics = [
                  { label: '播放', value: episodeStats?.play, type: 'play' as const },
                  { label: '点赞', value: episodeStats?.like, type: 'like' as const },
                  { label: '投币', value: episodeStats?.coin, type: 'coin' as const },
                  { label: '收藏', value: episodeStats?.favorite, type: 'favorite' as const },
                ];

                return (
                  <a
                    key={episode.bvid}
                    href={getBiliVideoUrl(episode.bvid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="season-episode-card"
                  >
                    <span className="season-episode-cover" style={{ backgroundImage: `url(${getCover(episode.bvid)})` }} />
                    <span className="season-episode-copy">
                      <span className="season-episode-meta">Episode {String(episode.episode).padStart(2, '0')}</span>
                      <strong>{episode.title}</strong>
                      <span className="season-episode-stats" aria-label={`第 ${episode.episode} 集数据`}>
                        {episodeMetrics.map(({ label, value, type }) => (
                          <span key={label} className="season-episode-stat" title={label}>
                            <BiliMetricIcon type={type} />
                            <span>{formatCompactNumber(value)}</span>
                          </span>
                        ))}
                      </span>
                    </span>
                    <FiExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </PageShell>
    </div>
  );
};

export default Groups;
