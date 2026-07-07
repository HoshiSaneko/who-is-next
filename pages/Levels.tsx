import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiAward, FiExternalLink, FiFlag, FiSearch, FiTarget, FiXCircle } from 'react-icons/fi';
import { GAMES_CONFIG } from '../configs/games.config';
import { Game } from '../types';
import { PageShell } from '../components/ui';

const getLevelPageSize = (gridElement?: HTMLDivElement | null) => {
  if (typeof window === 'undefined') return 18;

  const gridWidth = gridElement?.clientWidth || window.innerWidth;
  const columns = gridWidth < 560 ? 1 : gridWidth < 820 ? 2 : 3;
  const gridTop = gridElement?.getBoundingClientRect().top ?? 230;
  const availableHeight = window.innerHeight - gridTop - 30;
  const rows = Math.max(4, Math.min(8, Math.floor(availableHeight / 98)));
  return columns * rows;
};

const renderRuleText = (rule?: string) => {
  if (!rule) return '暂无规则描述';

  return rule.split(/(%[^%]+%)/g).filter(Boolean).map((part, index) => {
    const isHighlight = part.startsWith('%') && part.endsWith('%');
    if (!isHighlight) return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;

    return (
      <strong className="levels-rule-emphasis" key={`${part}-${index}`}>
        {part.slice(1, -1)}
      </strong>
    );
  });
};

const Levels: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cardGridRef = React.useRef<HTMLDivElement | null>(null);
  const seasons = useMemo(() => Array.from(new Set(GAMES_CONFIG.map((game) => game.season))).sort((a, b) => a - b), []);
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>(seasons[seasons.length - 1] || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => getLevelPageSize());
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return GAMES_CONFIG.filter((game) => {
      const seasonMatch = selectedSeason === 'all' || game.season === selectedSeason;
      const queryMatch = !query || game.levelName.toLowerCase().includes(query) || game.id.toLowerCase().includes(query);
      return seasonMatch && queryMatch;
    });
  }, [searchQuery, selectedSeason]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / pageSize));
  const pageGames = useMemo(
    () => filteredGames.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
    [currentPage, filteredGames, pageSize],
  );

  const updatePageSize = React.useCallback(() => {
    setPageSize(getLevelPageSize(cardGridRef.current));
  }, []);

  useEffect(() => {
    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, [updatePageSize]);

  useEffect(() => {
    updatePageSize();
  }, [searchQuery, selectedSeason, updatePageSize]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedSeason]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (pageGames.length === 0) {
      setActiveGame(null);
      return;
    }

    if (!activeGame || !pageGames.some((game) => game.id === activeGame.id)) {
      setActiveGame(pageGames[0]);
    }
  }, [activeGame, pageGames]);

  useEffect(() => {
    const state = location.state as { selectedGameId?: string; selectedGameName?: string; selectedSeason?: number } | null;
    if (!state?.selectedGameId && !state?.selectedGameName) return;
    const target = GAMES_CONFIG.find((game) => {
      if (state.selectedGameId && game.id === state.selectedGameId) return true;
      if (!state.selectedGameName || game.levelName !== state.selectedGameName) return false;
      return !state.selectedSeason || game.season === state.selectedSeason;
    });
    if (!target) return;
    const targetGames = GAMES_CONFIG.filter((game) => game.season === target.season);
    const targetIndex = Math.max(0, targetGames.findIndex((game) => game.id === target.id));
    setSelectedSeason(target.season);
    setCurrentPage(Math.floor(targetIndex / pageSize));
    setActiveGame(target);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, pageSize]);

  return (
    <div className="levels-page">
      <PageShell className="levels-shell relative z-10">
        <section className="levels-toolbar" aria-label="Level filters">
          <div className="levels-season-tabs">
            {(['all', ...seasons] as Array<number | 'all'>).map((season) => {
              const active = selectedSeason === season;
              return (
                <button
                  key={season}
                  type="button"
                  className={`levels-season-tab ${active ? 'is-active' : ''}`}
                  onClick={() => setSelectedSeason(season)}
                >
                  <span>{season === 'all' ? 'All' : String(season).padStart(2, '0')}</span>
                  <strong>{season === 'all' ? '全部赛季' : `第 ${season} 季`}</strong>
                </button>
              );
            })}
          </div>

          <label className="levels-search">
            <FiSearch aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索关卡名称或 ID"
            />
          </label>
        </section>

        <div className="levels-layout">
          <section className="levels-panel levels-grid-panel">
            <div className="levels-panel-heading">
              <div>
                <p>关卡列表</p>
                <span>{filteredGames.length} 条记录 · 第 {currentPage + 1} / {totalPages} 页</span>
              </div>
              <div className="levels-page-controls">
                <button type="button" disabled={currentPage === 0} onClick={() => setCurrentPage((page) => Math.max(0, page - 1))} aria-label="Previous page">
                  <FiArrowLeft aria-hidden="true" />
                </button>
                <button type="button" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))} aria-label="Next page">
                  <FiArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>

            {pageGames.length === 0 ? (
              <div className="levels-empty">
                <FiSearch aria-hidden="true" />
                <strong>没有找到关卡</strong>
                <span>换一个赛季或关键词试试。</span>
              </div>
            ) : (
              <div className="levels-card-grid" ref={cardGridRef}>
                {pageGames.map((game) => {
                  const active = activeGame?.id === game.id;
                  return (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => setActiveGame(game)}
                      className={`levels-card ${active ? 'is-active' : ''}`}
                    >
                      <span className="levels-card-content">
                        <span className="levels-card-kicker">
                          <span className="levels-card-id">{game.id}</span>
                          <span className="levels-card-season">S{game.season}</span>
                          {game.isSpecialLevel && <span className="levels-card-season">特殊关卡</span>}
                        </span>
                        <strong>{game.levelName}</strong>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="levels-panel levels-detail-panel">
            <div className="levels-panel-heading">
              <div>
                <p>当前关卡</p>
              </div>
            </div>

            {activeGame ? (
              <div className="levels-detail">
                <div className="levels-detail-head">
                  <div className="levels-detail-title-row">
                    <h2>{activeGame.levelName}</h2>
                    <div className="levels-detail-tags">
                      <span>{activeGame.id}</span>
                      <span>第 {activeGame.season} 季</span>
                      {activeGame.isSpecialLevel && <span>特殊关卡</span>}
                    </div>
                  </div>
                  <p>{renderRuleText(activeGame.rule)}</p>
                </div>

                <div className="levels-result-list">
                  <article>
                    <span>冠军</span>
                    <strong>{activeGame.levelChampion || '-'}</strong>
                    <small>首次通关</small>
                    <FiAward aria-hidden="true" />
                  </article>
                  <article>
                    <span>第二名</span>
                    <strong>{activeGame.levelRunnerUp || '-'}</strong>
                    <small>第二位通关</small>
                    <FiFlag aria-hidden="true" />
                  </article>
                  <article>
                    <span>放弃</span>
                    <strong>{activeGame.giveUp || '-'}</strong>
                    <small>记录放弃</small>
                    <FiXCircle aria-hidden="true" />
                  </article>
                </div>

                {activeGame.url && (
                  <a className="levels-source-link" href={activeGame.url} target="_blank" rel="noreferrer">
                    Open in Bilibili
                    <FiExternalLink aria-hidden="true" />
                  </a>
                )}
              </div>
            ) : (
              <div className="levels-empty">
                <FiTarget aria-hidden="true" />
                <strong>选择一个关卡</strong>
                <span>点击左侧卡片查看详细结果。</span>
              </div>
            )}
          </aside>
        </div>
      </PageShell>
    </div>
  );
};

export default Levels;
