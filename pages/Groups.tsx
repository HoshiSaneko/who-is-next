import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GROUPS_CONFIG } from '../configs/groups.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';
import { SEASON_EPISODES_CONFIG } from '../configs/seasonEpisodes.config';
import { useBiliData } from '../hooks/useBiliData';

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

const Groups: React.FC = () => {
  const allSeasons = GROUPS_CONFIG.filter(season => !season.isPlaceholder);
  const [activeIndex, setActiveIndex] = useState(allSeasons.length > 0 ? allSeasons.length - 1 : 0);
  const [direction, setDirection] = useState(0);
  const biliData = useBiliData();

  const activeSeason = allSeasons[activeIndex];

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? allSeasons.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev === allSeasons.length - 1 ? 0 : prev + 1));
  };

  const getAvatarByName = (name: string) => {
    const member = UP_MEMBERS_CONFIG.find(m => m.name === name);
    return member ? member.avatar : null;
  };

  // 辅助函数：判断胜者是否是一个队伍名称，如果是，返回该队伍的所有成员
  const getWinnerMembers = (winnerName: string, teams: {name: string, members: string[]}[]): string[] => {
    const team = teams.find(t => t.name === winnerName);
    if (team) {
      return team.members;
    }
    return [winnerName]; // 如果不是队伍名，则认为是个人名字
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
    // Disable horizontal scroll takeover on mobile to prevent accidental swipes
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    
    // Only handle horizontal scrolling or if holding shift
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      e.preventDefault();
      
      // Debounce wheel events to prevent multiple rapid page turns
      if (wheelTimeoutRef.current) return;
      
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      if (delta > 20) {
        handleNext();
        wheelTimeoutRef.current = setTimeout(() => {
          wheelTimeoutRef.current = null;
        }, 500); // 500ms cooldown between page turns
      } else if (delta < -20) {
        handlePrev();
        wheelTimeoutRef.current = setTimeout(() => {
          wheelTimeoutRef.current = null;
        }, 500);
      }
    }
  };

  // 获取当前选中季度的所有集数
  const currentEpisodes = SEASON_EPISODES_CONFIG.filter(ep => ep.season === activeIndex + 1).sort((a, b) => a.episode - b.episode);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-12 animate-fade-in flex flex-col flex-1 min-h-[calc(100vh-140px)]">
      {/* 顶部导航区 - 赛季选项卡 */}
      <div 
        className="flex justify-start md:justify-center gap-8 md:gap-16 overflow-x-auto pt-4 pb-8 mb-8 md:mb-16 no-scrollbar items-center w-full max-w-[900px] mx-auto px-4 border-b border-[#F0F0F0]"
        onWheel={(e) => {
          // 允许通过滚轮横向滚动导航栏
          if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.currentTarget.scrollLeft += e.deltaY;
            e.preventDefault();
          }
        }}
      >
        {allSeasons.map((season, index) => (
          <div 
            key={season.id}
            onClick={() => handleTabClick(index)}
            className={`relative cursor-pointer transition-all duration-300 pb-4 whitespace-nowrap flex items-center shrink-0
              ${activeIndex === index ? 'text-[#333333]' : 'text-[#999999] hover:text-[#666666]'}
            `}
          >
            <span className="text-sm md:text-base tracking-[0.2em] font-normal">
              {season.season}
            </span>
            {/* 选中状态的底部指示条 */}
            {activeIndex === index && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#88B090]"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 内容展示区 - 保持网格布局但改为单卡片展示 */}
      <div 
        className="flex-1 relative flex items-center justify-center w-full max-w-[900px] mx-auto min-h-[500px] md:mb-12"
        onWheel={handleWheel}
      >
        {/* 极简左右切换按钮 - 带呼吸动画 */}
        <button 
          onClick={handlePrev}
          className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 text-3xl md:text-4xl font-light text-[#CCCCCC] hover:text-[#777777] hover:-translate-x-1 transition-all duration-300 z-30 px-2 py-8 focus:outline-none bg-transparent animate-pulse"
          aria-label="Previous season"
        >
          &lt;
        </button>

        <button 
          onClick={handleNext}
          className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 text-3xl md:text-4xl font-light text-[#CCCCCC] hover:text-[#777777] hover:translate-x-1 transition-all duration-300 z-30 px-2 py-8 focus:outline-none bg-transparent animate-pulse"
          aria-label="Next season"
        >
          &gt;
        </button>

        <div className="w-full h-full relative overflow-hidden flex items-center justify-center px-6 md:px-0">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div 
              key={activeSeason.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full relative flex flex-col"
            >
            {/* 极简装饰：赛季数字水印 */}
            <div className="absolute -top-12 -left-6 md:-left-16 text-[6rem] md:text-[8rem] font-bold text-[#F8F8F8] transition-colors duration-500 select-none z-0 pointer-events-none leading-none">
              {String(activeIndex + 1).padStart(2, '0')}
            </div>

            <div className="relative z-10 flex flex-col bg-white bg-opacity-60 backdrop-blur-sm p-6 md:p-10 border border-[#F0F0F0] transition-all duration-500">
              <div className="flex flex-col md:flex-row md:items-stretch w-full">
                {/* 左侧：赛季标题与胜者 (高亮展示) */}
                <div className="flex flex-col md:w-1/3 mb-8 md:mb-0 md:pr-8 md:border-r border-[#F0F0F0]">
                  <div className="mb-8">
                    <span className="text-xs text-[#777777] tracking-[0.3em] font-mono mb-2 block">SEASON {activeIndex + 1}</span>
                    <h3 className="text-xl md:text-2xl font-normal tracking-[0.2em] text-[#333333]">
                      {activeSeason.season}
                    </h3>
                  </div>

                  {activeSeason.winner && activeSeason.winner.length > 0 && (
                    <div className="mt-auto pt-8 border-t border-[#F0F0F0] md:border-t-0">
                    <span className="text-[10px] text-[#88B090] tracking-[0.2em] block mb-4 px-2 py-0.5 border border-[#88B090] border-opacity-30 inline-block">
                      {activeSeason.id === 's1' ? '素材王' : '通关王'}
                    </span>
                    <div className="flex flex-col gap-4">
                      {activeSeason.winner.map((winnerName, i) => {
                        const members = getWinnerMembers(winnerName, activeSeason.teams);
                        const isTeam = members.length > 1 || members[0] !== winnerName;
                        
                        return (
                          <div key={i} className="flex flex-col gap-3">
                            {/* 如果是队伍名，先显示队伍名作为小标题 */}
                            {isTeam && (
                              <div className="text-sm text-[#777777] tracking-[0.1em] font-medium border-l-2 border-[#88B090] pl-2">
                                {winnerName}
                              </div>
                            )}
                            {/* 渲染该队伍下的所有成员（或单人） */}
                            <div className={`flex flex-col gap-3 ${isTeam ? 'pl-3' : ''}`}>
                              {members.map((m, mIdx) => {
                                const avatar = getAvatarByName(m);
                                return (
                                  <div key={mIdx} className="flex items-center gap-3">
                                    {avatar && (
                                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#E5E5E5]">
                                        <img src={avatar} alt={m} className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    <div className="text-sm md:text-lg text-[#333333] tracking-[0.1em] font-medium">
                                      {m}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

                {/* 右侧：队伍阵容 (更清晰的对比布局，带头像) */}
                <div className="md:w-2/3 md:pl-10 flex flex-col justify-center">
                  {activeSeason.isPersonal ? (
                    <div className="h-full flex items-center justify-center py-16 md:py-0">
                      <span className="text-sm text-[#999999] tracking-[0.4em] font-light">
                        — 个人独立赛制 —
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 py-8 md:py-0">
                      {activeSeason.teams?.map((team, idx) => (
                        <div key={idx} className="flex flex-col gap-4 relative">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-1 bg-[#CCCCCC] rounded-full"></div>
                            <span className="text-xs text-[#777777] tracking-[0.2em] uppercase">
                              {team.name || `GROUP ${String(idx + 1).padStart(2, '0')}`}
                            </span>
                          </div>
                          <div className="flex flex-col gap-3 pl-4 border-l-2 border-[#F8F8F8]">
                            {team.members.map((member, mIdx) => {
                              const avatar = getAvatarByName(member);
                              return (
                                <div key={mIdx} className="flex items-center gap-3">
                                  {avatar && (
                                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 opacity-80">
                                      <img src={avatar} alt={member} className="w-full h-full object-cover grayscale-[30%]" />
                                    </div>
                                  )}
                                  <span className="text-sm text-[#555555] font-normal tracking-[0.1em]">
                                    {member}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* 底部剧集列表区 */}
                {currentEpisodes.length > 0 && (
                  <div className="w-full pt-10 mt-10 border-t border-[#F0F0F0] col-span-full md:col-span-2">
                    <h4 className="text-[10px] text-[#999999] tracking-[0.3em] font-mono mb-6 uppercase">
                      EPISODES
                    </h4>
                    <div className="flex flex-col gap-4 text-left">
                      {currentEpisodes.map((ep) => (
                        <a 
                          key={ep.bvid}
                          href={`https://www.bilibili.com/video/${ep.bvid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col md:flex-row md:items-start gap-6 md:gap-8 py-8 border-b border-[#F9F9F9] hover:border-[#E5E5E5] transition-colors"
                        >
                          {/* 封面图 */}
                          <div className="w-full md:w-48 aspect-video rounded overflow-hidden shrink-0 relative">
                            <img 
                              src={`/covers/${ep.bvid}.jpg`} 
                              alt={ep.title} 
                              className="w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 transform group-hover:scale-105 transition-all duration-700 ease-out"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f5f5f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23cccccc">No Cover</text></svg>';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                          </div>

                          <div className="flex flex-col flex-1 pt-2">
                            <div className="flex items-center gap-4 mb-3">
                              <span className="text-xs text-[#999999] tracking-[0.2em] border border-[#E5E5E5] px-2 py-0.5 group-hover:border-[#88B090] group-hover:text-[#88B090] transition-colors duration-500">
                                第 {String(ep.episode).padStart(2, '0')} 集
                              </span>
                            </div>
                            
                            <span className="text-base text-[#333333] group-hover:text-[#88B090] transition-colors tracking-wide line-clamp-2 font-medium" title={ep.title}>
                              {ep.title}
                            </span>
                            
                            {/* B站视频数据 */}
                            {biliData?.data.co_creation[ep.bvid] && (
                              <div className="mt-6 flex flex-wrap items-center gap-6 text-[10px] text-[#999999] font-light tracking-widest transition-colors duration-300 group-hover:text-[#88B090]">
                                <span className="flex items-center gap-1.5" title="播放量">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 4.040041666666666C7.897383333333334 4.040041666666666 6.061606666666667 4.147 4.765636666666667 4.252088333333334C3.806826666666667 4.32984 3.061106666666667 5.0637316666666665 2.9755000000000003 6.015921666666667C2.8803183333333333 7.074671666666667 2.791666666666667 8.471183333333332 2.791666666666667 9.998333333333333C2.791666666666667 11.525566666666668 2.8803183333333333 12.922083333333333 2.9755000000000003 13.9808C3.061106666666667 14.932983333333334 3.806826666666667 15.666916666666667 4.765636666666667 15.744683333333336C6.061611666666668 15.849716666666666 7.897383333333334 15.956666666666667 10 15.956666666666667C12.10285 15.956666666666667 13.93871666666667 15.849716666666666 15.234766666666667 15.74461666666667C16.193416666666668 15.66685 16.939000000000004 14.933216666666667 17.024583333333336 13.981216666666668C17.11975 12.922916666666667 17.208333333333332 11.526666666666666 17.208333333333332 9.998333333333333C17.208333333333332 8.470083333333333 17.11975 7.073818333333334 17.024583333333336 6.015513333333334C16.939000000000004 5.063538333333333 16.193416666666668 4.329865000000001 15.234766666666667 4.252118333333334C13.93871666666667 4.147016666666667 12.10285 4.040041666666666 10 4.040041666666666zM4.684808333333334 3.255365C6.001155 3.14862 7.864583333333334 3.0400416666666668 10 3.0400416666666668C12.13565 3.0400416666666668 13.999199999999998 3.148636666666667 15.315566666666667 3.2553900000000002C16.753416666666666 3.3720016666666672 17.890833333333333 4.483195 18.020583333333335 5.925965000000001C18.11766666666667 7.005906666666667 18.208333333333336 8.433 18.208333333333336 9.998333333333333C18.208333333333336 11.56375 18.11766666666667 12.990833333333335 18.020583333333335 14.0708C17.890833333333333 15.513533333333331 16.753416666666666 16.624733333333335 15.315566666666667 16.74138333333333C13.999199999999998 16.848116666666666 12.13565 16.95666666666667 10 16.95666666666667C7.864583333333334 16.95666666666667 6.001155 16.848116666666666 4.684808333333334 16.7414C3.2467266666666665 16.624750000000002 2.1092383333333338 15.513266666666667 1.9795200000000002 14.070383333333334C1.8823900000000002 12.990000000000002 1.7916666666666667 11.562683333333334 1.7916666666666667 9.998333333333333C1.7916666666666667 8.434066666666666 1.8823900000000002 7.00672 1.9795200000000002 5.926381666666667C2.1092383333333338 4.483463333333334 3.2467266666666665 3.371976666666667 4.684808333333334 3.255365z"></path>
                                    <path d="M12.23275 9.1962C12.851516666666667 9.553483333333332 12.851516666666667 10.44665 12.232683333333332 10.803866666666666L9.57975 12.335600000000001C8.960983333333335 12.692816666666667 8.1875 12.246250000000002 8.187503333333334 11.531733333333333L8.187503333333334 8.4684C8.187503333333334 7.753871666666667 8.960983333333335 7.307296666666667 9.57975 7.66456L12.23275 9.1962z"></path>
                                  </svg>
                                  {formatNumber(biliData.data.co_creation[ep.bvid].play)}
                                </span>
                                <span className="flex items-center gap-1.5" title="点赞数">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 36 36" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9.77234 30.8573V11.7471H7.54573C5.50932 11.7471 3.85742 13.3931 3.85742 15.425V27.1794C3.85742 29.2112 5.50932 30.8573 7.54573 30.8573H9.77234ZM11.9902 30.8573V11.7054C14.9897 10.627 16.6942 7.8853 17.1055 3.33591C17.2666 1.55463 18.9633 0.814421 20.5803 1.59505C22.1847 2.36964 23.243 4.32583 23.243 6.93947C23.243 8.50265 23.0478 10.1054 22.6582 11.7471H29.7324C31.7739 11.7471 33.4289 13.402 33.4289 15.4435C33.4289 15.7416 33.3928 16.0386 33.3215 16.328L30.9883 25.7957C30.2558 28.7683 27.5894 30.8573 24.528 30.8573H11.9911H11.9902Z"></path>
                                  </svg>
                                  {formatNumber(biliData.data.co_creation[ep.bvid].like)}
                                </span>
                                <span className="flex items-center gap-1.5" title="投币数">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 28 28" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M14.045 25.5454C7.69377 25.5454 2.54504 20.3967 2.54504 14.0454C2.54504 7.69413 7.69377 2.54541 14.045 2.54541C20.3963 2.54541 25.545 7.69413 25.545 14.0454C25.545 17.0954 24.3334 20.0205 22.1768 22.1771C20.0201 24.3338 17.095 25.5454 14.045 25.5454ZM9.66202 6.81624H18.2761C18.825 6.81624 19.27 7.22183 19.27 7.72216C19.27 8.22248 18.825 8.62807 18.2761 8.62807H14.95V10.2903C17.989 10.4444 20.3766 12.9487 20.3855 15.9916V17.1995C20.3854 17.6997 19.9799 18.1052 19.4796 18.1052C18.9793 18.1052 18.5738 17.6997 18.5737 17.1995V15.9916C18.5667 13.9478 16.9882 12.2535 14.95 12.1022V20.5574C14.95 21.0577 14.5444 21.4633 14.0441 21.4633C13.5437 21.4633 13.1382 21.0577 13.1382 20.5574V12.1022C11.1 12.2535 9.52148 13.9478 9.51448 15.9916V17.1995C9.5144 17.6997 9.10883 18.1052 8.60856 18.1052C8.1083 18.1052 7.70273 17.6997 7.70265 17.1995V15.9916C7.71158 12.9487 10.0992 10.4444 13.1382 10.2903V8.62807H9.66202C9.11309 8.62807 8.66809 8.22248 8.66809 7.72216C8.66809 7.22183 9.11309 6.81624 9.66202 6.81624Z"></path>
                                  </svg>
                                  {formatNumber(biliData.data.co_creation[ep.bvid].coin)}
                                </span>
                                <span className="flex items-center gap-1.5" title="收藏数">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 28 28" fill="currentColor">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M19.8071 9.26152C18.7438 9.09915 17.7624 8.36846 17.3534 7.39421L15.4723 3.4972C14.8998 2.1982 13.1004 2.1982 12.4461 3.4972L10.6468 7.39421C10.1561 8.36846 9.25639 9.09915 8.19315 9.26152L3.94016 9.91102C2.63155 10.0734 2.05904 11.6972 3.04049 12.6714L6.23023 15.9189C6.96632 16.6496 7.29348 17.705 7.1299 18.7605L6.39381 23.307C6.14844 24.6872 7.62063 25.6614 8.84745 25.0119L12.4461 23.0634C13.4276 22.4951 14.6544 22.4951 15.6359 23.0634L19.2345 25.0119C20.4614 25.6614 21.8518 24.6872 21.6882 23.307L20.8703 18.7605C20.7051 17.705 21.0339 16.6496 21.77 15.9189L24.9597 12.6714C25.9412 11.6972 25.3687 10.0734 24.06 9.91102L19.8071 9.26152Z"></path>
                                  </svg>
                                  {formatNumber(biliData.data.co_creation[ep.bvid].favorite)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="hidden md:flex items-center gap-2 text-[10px] text-[#999999] font-mono transition-opacity duration-300 shrink-0 mt-2">
                            <span className="relative">
                              WATCH
                              <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#88B090] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                            </span>
                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </div>
                          <div className="flex md:hidden items-center gap-2 text-[10px] text-[#999999] font-mono mt-4 self-end">
                            <span>WATCH</span>
                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Groups;
