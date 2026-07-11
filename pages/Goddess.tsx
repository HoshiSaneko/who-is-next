import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink, FiSearch } from 'react-icons/fi';
import { GODDESSES_CONFIG } from '../configs/goddesses.config';
import { PageShell } from '../components/ui';
import { OptimizedImage } from '../src/components/OptimizedImage';

const getBiliUid = (url: string) => url.match(/space\.bilibili\.com\/(\d+)/)?.[1];

const Goddess: React.FC = () => {
  const navigate = useNavigate();
  const seasons = useMemo(() => Array.from(new Set(GODDESSES_CONFIG.map((item) => item.season))).sort((a, b) => a - b), []);
  const [activeSeason, setActiveSeason] = useState<number | 'all'>('all');
  const filtered = activeSeason === 'all' ? GODDESSES_CONFIG : GODDESSES_CONFIG.filter((item) => item.season === activeSeason);

  return (
    <div className="guest-archive-page">
      <PageShell className="guest-archive-shell relative z-10">
        <section className="guest-archive-toolbar" aria-label="Guest filters">
          <div className="guest-season-tabs">
            {(['all', ...seasons] as Array<number | 'all'>).map((season) => {
              const active = activeSeason === season;

              return (
                <button
                  key={season}
                  type="button"
                  onClick={() => setActiveSeason(season)}
                  className={`guest-season-tab ${active ? 'is-active' : ''}`}
                >
                  <span>{season === 'all' ? 'All' : `S${season}`}</span>
                  <strong>{season === 'all' ? '全部赛季' : `第 ${season} 季`}</strong>
                </button>
              );
            })}
          </div>
        </section>

        <section className="guest-archive-panel">
          <div className="guest-archive-panel-heading">
            <div>
              <p>正义女神卡片</p>
              <span>{filtered.length} 位正义女神 · {activeSeason === 'all' ? '全部赛季' : `第 ${activeSeason} 季`}</span>
            </div>
          </div>
          {filtered.length === 0 ? (
          <div className="guest-empty">
            <FiSearch aria-hidden="true" />
            <strong>没有找到正义女神</strong>
            <span>换一个赛季筛选试试。</span>
          </div>
        ) : (
          <div className="guest-card-grid">
            {filtered.map((guest) => (
              <article key={guest.id} className="guest-card">
                <div className="guest-card-main">
                  <div className="guest-avatar-frame">
                    <OptimizedImage src={guest.avatar} alt={guest.name} biliUid={getBiliUid(guest.bilibiliUrl)} />
                  </div>
                  <div className="guest-card-copy">
                    <div className="guest-card-meta">
                      <span>S{guest.season}</span>
                      <span>EP{String(guest.episode).padStart(2, '0')}</span>
                    </div>
                    <h2>{guest.name}</h2>
                    <p>{guest.description}</p>
                  </div>
                </div>
                <div className="guest-card-bottom">
                  <div className="guest-game-list">
                    {guest.games.slice(0, 4).map((game) => (
                      <button
                        key={game}
                        type="button"
                        onClick={() => navigate('/levels', { state: { selectedGameName: game, selectedSeason: guest.season } })}
                      >
                        {game}
                      </button>
                    ))}
                    {guest.games.length > 4 && <span>+{guest.games.length - 4}</span>}
                  </div>
                  <a href={guest.bilibiliUrl} target="_blank" rel="noreferrer" className="guest-source-link">
                    Bilibili Space
                    <FiExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
        </section>
      </PageShell>
    </div>
  );
};

export default Goddess;
