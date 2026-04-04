import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { GAMES_CONFIG } from '../configs/games.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';
import { Game } from '../types';

// 文字错乱/乱码解密动画组件
const ScrambleText: React.FC<{ text: string; activeId: string; className?: string }> = ({ text, activeId, className }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = '!<>-_\\/[]{}—=+*^?#_';
  
  useEffect(() => {
    let iteration = 0;
    let maxIterations = 10;
    let interval: NodeJS.Timeout;
    
    // 如果文字为空，直接返回
    if (!text) {
      setDisplayText('');
      return;
    }

    const scramble = () => {
      if (iteration >= maxIterations) {
        setDisplayText(text);
        clearInterval(interval);
        return;
      }
      
      const scrambled = text.split('').map((char, index) => {
        // 如果是空格或换行，保持不变
        if (char === ' ' || char === '\n') return char;
        
        // 随着迭代次数增加，逐渐恢复真实字符
        if (index < (text.length / maxIterations) * iteration) {
          return char;
        }
        
        // 否则显示随机字符
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      setDisplayText(scrambled);
      iteration++;
    };

    interval = setInterval(scramble, 30);
    
    return () => clearInterval(interval);
  }, [text, activeId]); // 当 text 或 activeId 改变时触发动画

  return <span className={className}>{displayText}</span>;
};

const Levels: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>(6);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);

  const allGames = useMemo(() => {
    let filtered = GAMES_CONFIG;
    if (selectedSeason !== 'all') {
      filtered = filtered.filter(g => g.season === selectedSeason);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.levelName.toLowerCase().includes(q) || 
        g.id.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [searchQuery, selectedSeason]);

  const availableSeasons = useMemo(() => {
    const seasons = new Set(GAMES_CONFIG.map(g => g.season));
    return Array.from(seasons).sort((a, b) => a - b);
  }, []);

  // 根据屏幕宽高动态计算每页显示的卡片数量
  useEffect(() => {
    let lastContainerHeight = 0; // 记录初始或最大高度，防止翻页时因内容减少导致容器塌陷

    const calculateItemsPerPage = () => {
      if (typeof window !== 'undefined' && gridContainerRef.current) {
        const container = gridContainerRef.current;
        const width = window.innerWidth;
        // 如果当前高度小于之前记录的高度（可能是因为翻到了最后一页，内容变少了），则使用历史最大高度来计算
        // 这样可以保证即使最后一页只有几个卡片，翻回前面的页时，itemsPerPage 依然是按最大容量计算的
        const currentHeight = container.clientHeight;
        if (currentHeight > lastContainerHeight) {
          lastContainerHeight = currentHeight;
        }
        
        const containerHeight = lastContainerHeight || currentHeight;
        
        let cols = 8;
        let cardHeight = 96; // md:h-24 = 96px
        let gap = 12; // md:gap-3 = 12px
        
        // 容器内垂直方向的内边距和间距:
        // gridContainerRef有 pb-10 (40px)
        // 内部motion.div有 pt-2 (8px), pb-4 (16px)
        let paddingY = 40 + 8 + 16;

        if (width < 640) {
          cols = 3;
          cardHeight = 72; // h-[72px]
          gap = 8; // gap-2
        } else if (width < 768) {
          cols = 4;
          cardHeight = 72;
          gap = 8;
        } else if (width < 1024) {
          cols = 6;
          cardHeight = 96;
          gap = 12;
        } else {
          cols = 8;
          cardHeight = 96;
          gap = 12;
        }

        const availableHeight = containerHeight - paddingY;
        let rows = Math.floor((availableHeight + gap) / (cardHeight + gap));
        
        if (rows < 1) rows = 1;

        setItemsPerPage(cols * rows);
      } else if (typeof window !== 'undefined') {
        // Fallback before ref is attached
        const width = window.innerWidth;
        if (width < 640) setItemsPerPage(6);
        else if (width < 768) setItemsPerPage(8);
        else if (width < 1024) setItemsPerPage(12);
        else setItemsPerPage(16);
      }
    };
    
    // 初始化
    calculateItemsPerPage();
    
    // 监听容器大小改变
    const resizeObserver = new ResizeObserver(() => {
      // 只有当窗口宽度改变，或者容器高度变大时，才重新计算
      // 避免因为最后一页卡片少导致高度塌陷而触发死循环
      calculateItemsPerPage();
    });

    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current);
    }
    
    // 监听窗口改变
    window.addEventListener('resize', calculateItemsPerPage);
    
    return () => {
      window.removeEventListener('resize', calculateItemsPerPage);
      resizeObserver.disconnect();
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(allGames.length / itemsPerPage));

  // Pre-calculate the final level for each season dynamically based on the dataset
  const finalLevelsBySeason = useMemo(() => {
    const finalLevels: Record<number, string> = {};
    const seasons = Array.from(new Set(GAMES_CONFIG.map(g => g.season)));
    
    seasons.forEach(season => {
      const seasonGames = GAMES_CONFIG.filter(g => g.season === season);
      if (seasonGames.length > 0) {
        // Assuming the games are ordered, the last game in the season is the final level
        finalLevels[season] = seasonGames[seasonGames.length - 1].id;
      }
    });
    return finalLevels;
  }, []);

  // Handle deep linking from other pages
  useEffect(() => {
    const state = location.state as { selectedGameId?: string } | null;
    if (state?.selectedGameId) {
      const targetGame = GAMES_CONFIG.find(g => g.id === state.selectedGameId);
      if (targetGame) {
        // Clear state so it doesn't re-trigger on refresh
        navigate(location.pathname, { replace: true, state: {} });
        
        // Select the game
        setActiveGame(targetGame);
        
        // Ensure the correct season filter is active
        if (selectedSeason !== 'all' && selectedSeason !== targetGame.season) {
          setSelectedSeason(targetGame.season);
        }
        
        // Calculate and set the correct page
        // Need to wait for next tick if season filter changed
        setTimeout(() => {
          let listToSearch = GAMES_CONFIG;
          if (selectedSeason !== 'all' && selectedSeason !== targetGame.season) {
             listToSearch = GAMES_CONFIG.filter(g => g.season === targetGame.season);
          } else if (selectedSeason !== 'all') {
             listToSearch = GAMES_CONFIG.filter(g => g.season === selectedSeason);
          }
          
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            listToSearch = listToSearch.filter(g => 
              g.levelName.toLowerCase().includes(q) || 
              g.id.toLowerCase().includes(q)
            );
          }
          
          const index = listToSearch.findIndex(g => g.id === targetGame.id);
          if (index >= 0 && itemsPerPage > 0) {
            setCurrentPage(Math.floor(index / itemsPerPage));
          }
          
          // Reset the skip flag after processing the deep link
          skipAutoSelectRef.current = false;
        }, 0);
      }
    }
  }, [location.state, location.pathname, navigate, selectedSeason, itemsPerPage, searchQuery]);

  // Handle deep link skipping auto-select
  const skipAutoSelectRef = React.useRef(false);
  useEffect(() => {
    if (location.state && (location.state as any).selectedGameId) {
      skipAutoSelectRef.current = true;
    }
  }, [location.state]);

  // Default select the first game
  useEffect(() => {
    if (skipAutoSelectRef.current) {
      // Don't reset skipAutoSelectRef here, let the other effect handle it
      return;
    }
    
    if (allGames.length > 0 && !allGames.find(g => g.id === activeGame?.id)) {
      setActiveGame(allGames[0]);
    } else if (allGames.length === 0) {
      setActiveGame(null);
    }
  }, [allGames, activeGame]);

  // Ensure currentPage doesn't exceed totalPages if screen resizes and pages shrink
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    } else if (totalPages === 0) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const handlePrevPage = () => {
    if (totalPages <= 1) return;
    setDirection(-1);
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextPage = () => {
    if (totalPages <= 1) return;
    setDirection(1);
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (idx: number) => {
    if (idx === currentPage) return;
    setDirection(idx > currentPage ? 1 : -1);
    setCurrentPage(idx);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  // Add mouse wheel support for page navigation
  const wheelTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleWheel = (e: React.WheelEvent) => {
    // Determine if we should handle this event based on scroll direction
    // For vertical scrolling, we want to capture it and convert to pagination
    // unless the user is specifically trying to scroll the page vertically
    
    // In mobile view (width < 768px), allow normal vertical scrolling instead of pagination
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    
    // Prevent default scroll behavior to stop the page from moving in desktop view
    e.preventDefault();
    
    // Debounce wheel events to prevent multiple rapid page turns
    if (wheelTimeoutRef.current) return;
    
    // Use either deltaX or deltaY depending on which is larger
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    
    if (delta > 20) {
      handleNextPage();
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500); // 500ms cooldown between page turns
    } else if (delta < -20) {
      handlePrevPage();
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500);
    }
  };

  // Add touch swipe support for page navigation
  const touchStartRef = React.useRef<number | null>(null);
  const touchEndRef = React.useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartRef.current === null || touchEndRef.current === null) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextPage();
    }
    if (isRightSwipe) {
      handlePrevPage();
    }
  };

  // Remove handleNavClick as we now use handlePrevPage and handleNextPage
  const renderRule = (rule: string, activeId: string) => {
    const parts = rule.split('%');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <ScrambleText key={i} text={part} activeId={activeId} className="text-[#88B090] mx-1" />;
      }
      return <ScrambleText key={i} text={part} activeId={activeId} />;
    });
  };

  const renderAvatars = (namesString: string, activeId: string) => {
    const names = namesString.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean);
    return (
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        {names.map((name, idx) => {
          const member = UP_MEMBERS_CONFIG.find(m => m.name === name);
          return (
            <div key={idx} className="flex items-center gap-1 bg-white border border-[#E5E5E5] px-1.5 py-0.5 rounded-full" title={name}>
              {member && (
                <img 
                  src={member.avatar} 
                  alt={name} 
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <ScrambleText text={name} activeId={activeId} className="text-[10px] text-[#555555] max-w-[60px] truncate block" />
            </div>
          );
        })}
      </div>
    );
  };

  const renderSpecialLevelIcon = (type?: string) => {
    switch (type) {
      case 'ball':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a15.3 15.3 0 010 20M2 12a15.3 15.3 0 0120 0" />
          </svg>
        );
      case 'coin':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <circle cx="12" cy="12" r="4" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8" />
          </svg>
        );
      case 'sandbag':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16M12 4v16" strokeDasharray="2 2" />
          </svg>
        );
      default:
        // 默认星星图标（原来的）
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-8 animate-fade-in flex flex-col min-h-[calc(100vh-140px)]">
      {/* 内容区：上方详情 + 下方水平滑动卡片列表 */}
      <div className="flex-1 relative flex flex-col gap-4 md:gap-6 mt-2">
        
        {/* 顶部控制栏：搜索和赛季筛选 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 shrink-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSeason('all')}
              className={`px-4 py-1.5 text-xs tracking-widest border transition-all duration-300 ${
                selectedSeason === 'all' 
                  ? 'bg-[#88B090] border-[#88B090] text-white' 
                  : 'border-[#E5E5E5] text-[#999999] hover:border-[#88B090] hover:text-[#88B090]'
              }`}
            >
              全部
            </button>
            {availableSeasons.map(season => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-4 py-1.5 text-xs tracking-widest border transition-all duration-300 ${
                  selectedSeason === season 
                    ? 'bg-[#88B090] border-[#88B090] text-white' 
                    : 'border-[#E5E5E5] text-[#999999] hover:border-[#88B090] hover:text-[#88B090]'
                }`}
              >
                S{season}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="搜索关卡名称或ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white bg-opacity-60 backdrop-blur-sm border border-[#E5E5E5] px-4 py-2 text-xs md:text-sm text-[#333333] placeholder-[#CCCCCC] focus:outline-none focus:border-[#88B090] transition-colors"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CCCCCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {/* 上方：固定展示的关卡详情 */}
        <div className="w-full shrink-0">
          <div className="bg-white bg-opacity-60 backdrop-blur-sm p-4 md:p-6 border border-[#F0F0F0] flex flex-col md:flex-row gap-6 md:h-[180px] overflow-y-auto md:overflow-visible max-h-[40vh] md:max-h-none">
            {activeGame ? (
              <>
                {/* 左侧：详情头部与规则 */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-4 border-b border-[#F0F0F0] pb-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg md:text-xl font-medium text-[#333333] tracking-[0.1em]">
                          <ScrambleText text={activeGame.levelName} activeId={activeGame.id} />
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#88B090] tracking-widest">
                            <ScrambleText text={activeGame.id} activeId={activeGame.id} />
                          </span>
                          <span className="text-[10px] text-[#999999] border border-[#E5E5E5] px-1.5 py-0.5 tracking-widest">
                            S{activeGame.season}
                          </span>
                          {activeGame.isSpecialLevel && (
                            <span className="text-[10px] text-[#88B090] border border-[#88B090] tracking-widest px-1.5 py-0.5">
                              SP LOOP
                            </span>
                          )}
                          {finalLevelsBySeason[activeGame.season] === activeGame.id && !activeGame.isSpecialLevel && (
                            <span className="text-[10px] text-[#88B090] border border-[#88B090] tracking-widest px-1.5 py-0.5">
                              FINAL
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {activeGame.isSpecialLevel && activeGame.specialBestScore && (
                        <div className="flex items-center gap-1.5 text-xs text-[#88B090] font-medium tracking-widest bg-white px-2 py-1 border border-[#88B090] w-fit">
                          {renderSpecialLevelIcon(activeGame.specialLevelType)}
                          <span>最高记录: <ScrambleText text={activeGame.specialBestScore} activeId={activeGame.id} /></span>
                        </div>
                      )}
                    </div>
                    
                    {activeGame.url && (
                      <a 
                        href={activeGame.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 text-[10px] md:text-xs text-[#88B090] hover:text-white border border-[#88B090] hover:bg-[#88B090] px-2.5 py-1 md:px-3 md:py-1.5 transition-all duration-300 tracking-widest"
                      >
                        <span>前往观看</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </a>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-start">
                    <h4 className="text-[10px] md:text-xs text-[#999999] tracking-[0.2em] mb-2 flex items-center gap-1.5 shrink-0">
                      <span className="w-1 h-1 bg-[#88B090] inline-block"></span>
                      规则说明
                    </h4>
                    <div className="text-xs md:text-sm text-[#555555] font-normal leading-relaxed tracking-wider text-justify line-clamp-3">
                      {renderRule(activeGame.rule, activeGame.id)}
                    </div>
                  </div>
                </div>

                {/* 右侧：结果信息 */}
                <div className="w-full md:w-[240px] lg:w-[320px] shrink-0 bg-[#FAFAFA] p-4 border border-[#F0F0F0] h-full overflow-y-auto custom-scrollbar">
                  <h4 className="text-[10px] md:text-xs text-[#999999] tracking-[0.2em] mb-2 flex items-center gap-1.5 shrink-0">
                    <span className="w-1 h-1 bg-[#88B090] inline-block"></span>
                    关卡结果
                  </h4>
                  <div className="grid grid-cols-1 gap-y-2 text-xs tracking-[0.1em] text-[#555555]">
                    {activeGame.levelChampion && (
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 gap-3">
                        <span className="text-[#999999] shrink-0 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-[#88B090]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                          </svg>
                          本关通关王
                        </span>
                        <div className="flex-1 overflow-hidden">{renderAvatars(activeGame.levelChampion, activeGame.id)}</div>
                      </div>
                    )}
                    {activeGame.giveUp && (
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 gap-3">
                        <span className="text-[#999999] shrink-0 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-[#88B090]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                          本关放弃
                        </span>
                        <div className="flex-1 overflow-hidden">{renderAvatars(activeGame.giveUp, activeGame.id)}</div>
                      </div>
                    )}
                    {activeGame.levelEliminated && (
                      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2 gap-3">
                        <span className="text-[#999999] shrink-0 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-[#88B090]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C7.58 2 4 5.58 4 10c0 3.2 1.89 5.95 4.67 7.29L8 20h2l1-3h2l1 3h2l-.67-2.71C18.11 15.95 20 13.2 20 10c0-4.42-3.58-8-8-8zm-3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9.5 16h5v-2h-5v2z" />
                          </svg>
                          本关淘汰
                        </span>
                        <div className="flex-1 overflow-hidden">{renderAvatars(activeGame.levelEliminated, activeGame.id)}</div>
                      </div>
                    )}
                    {!activeGame.levelChampion && !activeGame.giveUp && !activeGame.levelEliminated && (
                      <div className="text-[#999999] italic col-span-full py-1">暂无结果信息</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full flex flex-col items-center justify-center text-[#999999] bg-[#FAFAFA] border border-[#F0F0F0] border-dashed h-full transition-all duration-500 hover:bg-[#F5F5F5] group/empty cursor-default">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-[#88B090] rounded-full blur-xl opacity-0 group-hover/empty:opacity-20 transition-opacity duration-700"></div>
                  <svg className="w-12 h-12 text-[#E5E5E5] group-hover/empty:text-[#88B090] transition-colors duration-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
                  </svg>
                </div>
                <span className="tracking-[0.3em] font-light text-sm text-[#888888] group-hover/empty:text-[#555555] transition-colors duration-500">
                  点击下方卡片查看关卡详情
                </span>
                <div className="w-8 h-[1px] bg-[#E5E5E5] mt-4 group-hover/empty:w-16 group-hover/empty:bg-[#88B090] transition-all duration-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* 下方：分页的关卡卡片网格 */}
        <div className="flex-1 w-full relative flex items-center justify-center min-h-0 flex-col group/nav">
          {allGames.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#999999]">
              <svg className="w-16 h-16 text-[#E5E5E5] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="tracking-[0.2em] font-light text-sm text-[#888888]">未找到相关关卡，请尝试其他关键词</span>
            </div>
          ) : (
            <>
              {/* 左切换按钮 */}
          <button 
            onClick={handlePrevPage}
            className="hidden md:block absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 text-3xl md:text-4xl font-light text-[#CCCCCC] hover:text-[#777777] hover:-translate-x-1 transition-all duration-300 z-50 px-2 py-8 focus:outline-none bg-transparent opacity-0 group-hover/nav:opacity-100"
            aria-label="Previous page"
          >
            &lt;
          </button>

          <div 
            ref={gridContainerRef}
            className="w-full h-full px-2 md:px-10 relative flex items-start justify-center flex-1 pb-10"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div 
                key={currentPage}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3 content-start pt-2 pb-4"
              >
                {allGames.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((game, index) => {
                  const isActive = activeGame?.id === game.id;
                  const isFinalLevel = finalLevelsBySeason[game.season] === game.id;
                  const isValorant = ['g-186', 'g-193', 'g-212', 'g-226'].includes(game.id);
                  
                  return (
                    <div 
                        key={game.id}
                        onClick={() => {
                          setActiveGame(game);
                        }}
                        className={`cursor-pointer group relative p-2 md:p-3 border transition-all duration-300 flex flex-col items-center justify-center text-center gap-1 md:gap-2 h-[72px] md:h-24 overflow-hidden
                          ${isActive 
                            ? (isValorant ? 'bg-[#FF4655] border-[#FF4655] text-white shadow-md scale-105 z-10' : 'bg-[#88B090] border-[#88B090] text-white shadow-md scale-105 z-10')
                            : (isValorant
                                ? 'bg-white bg-opacity-80 backdrop-blur-sm border-[#E5E5E5] hover:border-[#FF4655] hover:shadow-sm text-[#333333]'
                                : (game.isSpecialLevel || isFinalLevel
                                  ? 'bg-white bg-opacity-80 backdrop-blur-sm border-[#E5E5E5] hover:border-[#88B090] hover:shadow-sm text-[#333333]'
                                  : 'bg-white bg-opacity-80 backdrop-blur-sm border-[#E5E5E5] hover:border-[#CCCCCC] hover:shadow-sm text-[#333333]'
                                )
                              )
                          }
                        `}
                      >
                      {/* Background watermark for special/final levels to make them stand out subtly */}
                      {game.isSpecialLevel && !isValorant && (
                        <div className={`absolute inset-0 pointer-events-none ${isActive ? 'opacity-20' : 'opacity-[0.03]'}`} style={{ backgroundImage: `radial-gradient(${isActive ? '#ffffff' : '#88B090'} 2px, transparent 2px)`, backgroundSize: '10px 10px' }}></div>
                      )}
                      {isValorant && (
                        <>
                          <div className={`absolute inset-0 pointer-events-none ${isActive ? 'opacity-20' : 'opacity-[0.04]'}`}
                               style={{ backgroundImage: `repeating-linear-gradient(45deg, ${isActive ? '#ffffff' : '#FF4655'} 0, ${isActive ? '#ffffff' : '#FF4655'} 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, ${isActive ? '#ffffff' : '#FF4655'} 0, ${isActive ? '#ffffff' : '#FF4655'} 1px, transparent 1px, transparent 12px)` }}>
                          </div>
                          <div className={`absolute inset-x-0 bottom-0 h-1/2 pointer-events-none ${isActive ? 'bg-gradient-to-t from-white/20 to-transparent' : 'bg-gradient-to-t from-[#FF4655]/10 to-transparent'}`}></div>
                        </>
                      )}
                      {isFinalLevel && !isValorant && (
                        <>
                          {/* 交叉斜线花纹 */}
                          <div className={`absolute inset-0 pointer-events-none ${isActive ? 'opacity-15' : 'opacity-[0.04]'}`} 
                               style={{ 
                                 backgroundImage: `
                                   repeating-linear-gradient(45deg, ${isActive ? '#ffffff' : '#88B090'} 0, ${isActive ? '#ffffff' : '#88B090'} 1px, transparent 1px, transparent 12px),
                                   repeating-linear-gradient(-45deg, ${isActive ? '#ffffff' : '#88B090'} 0, ${isActive ? '#ffffff' : '#88B090'} 1px, transparent 1px, transparent 12px)
                                 `
                               }}>
                          </div>
                          {/* 底部渐变强调 */}
                          <div className={`absolute inset-x-0 bottom-0 h-1/2 pointer-events-none ${isActive ? 'bg-gradient-to-t from-white/20 to-transparent' : 'bg-gradient-to-t from-[#88B090]/10 to-transparent'}`}></div>
                        </>
                      )}
                      
                        <span className={`text-sm font-mono tracking-widest z-10 ${isActive ? 'text-white opacity-90' : (isValorant ? 'text-[#FF4655] font-bold' : (game.isSpecialLevel || isFinalLevel ? 'text-[#88B090] font-bold' : 'text-[#888888]'))}`}>
                          {game.id}
                        </span>
                        <h3 className={`text-[10px] md:text-xs font-medium tracking-wide line-clamp-2 transition-colors duration-300 w-full px-1 z-10
                          ${isActive ? 'text-white' : (isValorant ? 'group-hover:text-[#FF4655]' : (game.isSpecialLevel || isFinalLevel ? 'group-hover:text-[#88B090] font-bold' : 'group-hover:text-[#88B090]'))}
                        `}>
                          {game.levelName}
                        </h3>

                        {/* Season Label on the top-left */}
                        <span className={`absolute top-1 left-1 text-[8px] tracking-widest border px-1 py-[1px] z-10
                          ${isActive ? 'border-white/50 text-white opacity-90' : (isValorant ? 'border-[#FF4655] text-[#FF4655]' : (game.isSpecialLevel || isFinalLevel ? 'border-[#88B090] text-[#88B090]' : 'border-[#E5E5E5] text-[#999999]'))}
                        `}>
                        S{game.season}
                      </span>
                      {/* 特殊角标 */}
                      {game.isSpecialLevel && !isValorant && (
                        <span className={`absolute top-1 right-1 text-[8px] tracking-widest border px-1 py-[1px] z-10
                          ${isActive ? 'border-white text-white opacity-90' : 'border-[#88B090] text-[#88B090] bg-white'}
                        `}>
                          SP
                        </span>
                      )}
                      {isValorant && (
                        <span className={`absolute top-1 right-1 text-[8px] tracking-widest border px-1 py-[1px] z-10
                          ${isActive ? 'border-white text-white opacity-90' : 'border-[#FF4655] text-[#FF4655] bg-white'}
                        `}>
                          VAL
                        </span>
                      )}
                      {isFinalLevel && !game.isSpecialLevel && !isValorant && (
                        <span className={`absolute top-1 right-1 text-[8px] tracking-widest border px-1 py-[1px] z-10
                          ${isActive ? 'border-white text-white opacity-90' : 'border-[#88B090] text-[#88B090] bg-white'}
                        `}>
                          FINAL
                        </span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 右切换按钮 */}
          <button 
            onClick={handleNextPage}
            className="hidden md:block absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 text-3xl md:text-4xl font-light text-[#CCCCCC] hover:text-[#777777] hover:translate-x-1 transition-all duration-300 z-50 px-2 py-8 focus:outline-none bg-transparent opacity-0 group-hover/nav:opacity-100"
            aria-label="Next page"
          >
            &gt;
          </button>

          {/* 分页指示器 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 md:mt-6 pb-2 shrink-0">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                    currentPage === index 
                      ? 'w-6 md:w-8 bg-[#88B090]' 
                      : 'w-1.5 md:w-2 bg-[#E5E5E5] hover:bg-[#CCCCCC]'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Levels;
