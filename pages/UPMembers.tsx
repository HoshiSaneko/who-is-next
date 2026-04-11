import React, { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';
import { useBiliData } from '../hooks/useBiliData';

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

const UPMembers: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [wheelNavEnabled, setWheelNavEnabled] = useState(() => {
    try {
      const saved = window.localStorage.getItem('upMembers:wheelNavEnabled');
      if (saved === null) return true;
      return saved === '1';
    } catch {
      return true;
    }
  });
  
  // 彩蛋状态：选中的成员索引集合
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const isEasterEggTriggered = selectedIndices.size >= 6;

  // 获取选中成员的名字集合，用于判断双人彩蛋
  const selectedNames = React.useMemo(() => {
    return Array.from(selectedIndices).map(idx => UP_MEMBERS_CONFIG[idx].name);
  }, [selectedIndices]);

  // 判断双人彩蛋关系
  let duoEasterEgg: { title: string; icon: React.ReactNode } | null = null;
  if (selectedIndices.size === 2) {
    if (selectedNames.includes('啊吗粽') && selectedNames.includes('力元君')) {
      duoEasterEgg = {
        title: '一生之敌',
        icon: (
          <svg className="w-8 h-8 md:w-12 md:h-12 text-[#C5A059] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      };
    } else if (selectedNames.includes('力元君') && selectedNames.includes('在下哲别')) {
      duoEasterEgg = {
        title: 'AA兄弟',
        icon: (
          <svg className="w-8 h-8 md:w-12 md:h-12 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      };
    } else if (selectedNames.includes('力元君') && selectedNames.includes('雨哥到处跑')) {
      duoEasterEgg = {
        title: '蹭饭兄弟',
        icon: (
          <svg className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M133.2 939.5c-6.4 0-12.8-1.5-18.9-4.6-20.5-10.5-28.6-35.6-18.2-56.1L525.3 37.7c10.5-20.5 35.6-28.6 56.1-18.2C601.8 30 610 55.1 599.5 75.6L170.4 916.8c-7.4 14.4-22 22.7-37.2 22.7zM215.1 990.9c-9.1 0-18.3-3-26-9.1-18-14.4-20.9-40.6-6.5-58.6l589.9-737.4c14.4-18 40.6-20.9 58.6-6.5 18 14.4 20.9 40.6 6.5 58.6L247.7 975.3c-8.2 10.3-20.3 15.6-32.6 15.6z" fill="#C5A059" />
          </svg>
        )
      };
    }
  }

  const biliData = useBiliData();

  useEffect(() => {
    try {
      window.localStorage.setItem('upMembers:wheelNavEnabled', wheelNavEnabled ? '1' : '0');
    } catch {
      return;
    }
  }, [wheelNavEnabled]);

  const handleCardClick = (uid?: string) => {
    if (uid) {
      window.open(`https://space.bilibili.com/${uid}`, '_blank');
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? UP_MEMBERS_CONFIG.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev === UP_MEMBERS_CONFIG.length - 1 ? 0 : prev + 1));
  };

  const pressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = React.useRef(false);
  const touchStartYRef = React.useRef<number | null>(null);

  const handlePointerDown = (index: number, e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    isLongPressRef.current = false;
    
    // 如果是触摸事件，记录初始 Y 坐标，用于后续判断是否是滚动
    if ('touches' in e) {
      touchStartYRef.current = e.touches[0].clientY;
    }

    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setSelectedIndices(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
      // 移动端长按震动反馈
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 400); // 稍微缩短触发时间，提升响应感
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 如果用户手指在屏幕上移动超过 10px，说明大概率是在滚动而不是长按，取消长按计时
    if (touchStartYRef.current !== null) {
      const touchY = e.touches[0].clientY;
      if (Math.abs(touchY - touchStartYRef.current) > 10) {
        handlePointerUpOrLeave();
      }
    }
  };

  const handlePointerUpOrLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    touchStartYRef.current = null;
  };

  const handleThumbnailClick = (index: number, e: React.MouseEvent) => {
    // 如果是长按触发的，直接忽略这次点击，并重置状态
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    // 检查是否按下了 Alt 或 Ctrl/Cmd 键进行多选彩蛋（保留 PC 端快捷键）
    if (e.altKey || e.ctrlKey || e.metaKey) {
      setSelectedIndices(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
      return;
    }

    // 正常点击逻辑
    setSelectedIndices(new Set()); // 清除多选状态
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const activeMember = UP_MEMBERS_CONFIG[activeIndex];

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
    if (!wheelNavEnabled) return;

    // Disable horizontal scroll takeover on mobile to prevent accidental swipes
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    
    // Prevent default scroll behavior only if cancelable
    if (e.cancelable) {
      e.preventDefault();
    }
    
    // Debounce wheel events to prevent multiple rapid page turns
    if (wheelTimeoutRef.current) return;
    
    // Use either deltaX or deltaY depending on scroll direction
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
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-12 animate-fade-in flex flex-col flex-1 min-h-0 h-full">
      <div className="flex flex-col gap-8 md:gap-12 flex-1 min-h-0">
        {/* 顶部导航区 - 极简水平头像列表 */}
        <div 
          className="flex justify-start md:justify-center gap-4 md:gap-6 overflow-x-auto pt-4 pb-8 no-scrollbar items-center w-full max-w-[800px] mx-auto px-2"
          onWheel={(e) => {
            // 允许通过滚轮横向滚动导航栏
            if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += e.deltaY;
              if (e.cancelable) {
                e.preventDefault();
              }
            }
          }}
        >
          {UP_MEMBERS_CONFIG.map((member, index) => {
            const isSelected = selectedIndices.has(index);
            const isActive = activeIndex === index && !isSelected;

            return (
              <div 
                key={member.id}
                onMouseDown={(e) => handlePointerDown(index, e)}
                onTouchStart={(e) => handlePointerDown(index, e)}
                onTouchMove={handleTouchMove}
                onMouseUp={handlePointerUpOrLeave}
                onMouseLeave={handlePointerUpOrLeave}
                onTouchEnd={handlePointerUpOrLeave}
                onTouchCancel={handlePointerUpOrLeave}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => handleThumbnailClick(index, e)}
                className={`relative cursor-pointer group transition-all duration-500 flex flex-col items-center justify-center shrink-0 select-none
                  ${isActive || isSelected ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'}
                `}
                style={{ 
                  WebkitTouchCallout: 'none', 
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all duration-500 
                  ${isActive ? 'ring-2 ring-[#88B090] ring-offset-2 ring-offset-[#F8F8F5]' : ''}
                  ${isSelected ? 'ring-2 ring-[#C5A059] ring-offset-2 ring-offset-[#F8F8F5] animate-pulse' : ''}
                `}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className={`w-full h-full object-cover transition-all duration-500 pointer-events-none ${isActive || isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                    draggable={false}
                  />
                </div>
                {/* 隐藏的序号装饰，仅当前选中显示 */}
                {isActive && (
                  <div className="absolute -bottom-6 text-[10px] text-[#88B090] font-mono tracking-widest hidden md:block">
                    NO.{String(index + 1).padStart(2, '0')}
                  </div>
                )}
                {/* 多选彩蛋的选中标记 */}
                {isSelected && (
                  <div className="absolute -bottom-6 text-[10px] text-[#C5A059] font-mono tracking-widest hidden md:block font-bold">
                    SELECTED
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-[800px] mx-auto -mt-6 px-2 flex justify-end">
          <label className="group flex items-center gap-2 text-[11px] text-[#999999] hover:text-[#777777] transition-colors tracking-widest select-none cursor-pointer">
            <div className="relative flex items-center justify-center w-3.5 h-3.5 border border-[#CCCCCC] group-hover:border-[#88B090] transition-colors">
              <input
                type="checkbox"
                checked={!wheelNavEnabled}
                onChange={(e) => setWheelNavEnabled(!e.target.checked)}
                className="sr-only peer"
                aria-label="Disable mouse wheel navigation"
              />
              <div className="w-2 h-2 bg-[#88B090] scale-0 peer-checked:scale-100 transition-transform duration-200 ease-out" />
            </div>
            禁用滚轮切换
          </label>
        </div>

        {/* 右侧内容展示区 */}
        <div 
          className="flex-1 flex items-center justify-center min-h-[600px] md:min-h-[500px] relative overflow-hidden"
          onWheel={handleWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* 极简左右切换按钮 - 带呼吸动画 */}
          <button 
            onClick={handlePrev}
            className="absolute left-0 md:left-4 top-[10%] md:top-1/2 -translate-y-1/2 text-3xl md:text-4xl font-light text-[#CCCCCC] hover:text-[#777777] hover:-translate-x-1 transition-all duration-300 z-30 px-2 md:px-4 py-8 focus:outline-none bg-transparent animate-pulse"
            aria-label="Previous member"
          >
            &lt;
          </button>

          <button 
            onClick={handleNext}
            className="absolute right-0 md:right-4 top-[10%] md:top-1/2 -translate-y-1/2 text-3xl md:text-4xl font-light text-[#CCCCCC] hover:text-[#777777] hover:translate-x-1 transition-all duration-300 z-30 px-2 md:px-4 py-8 focus:outline-none bg-transparent animate-pulse"
            aria-label="Next member"
          >
            &gt;
          </button>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            {duoEasterEgg ? (
                <motion.div 
                  key="duo-easter-egg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center justify-center gap-12 group w-full max-w-[800px] mx-auto relative px-8 md:px-0"
                >
                  <div className="flex gap-4 md:gap-12 items-center justify-center relative z-10">
                    {/* 左侧头像 */}
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 shadow-[0_0_30px_rgba(197,160,89,0.3)] border-2 border-[#C5A059]">
                      <img src={UP_MEMBERS_CONFIG[Array.from(selectedIndices)[0]].avatar} alt={UP_MEMBERS_CONFIG[Array.from(selectedIndices)[0]].name} className="w-full h-full object-cover" />
                    </div>

                    {/* 中间关系图标 */}
                    <div className="flex items-center justify-center shrink-0">
                      {duoEasterEgg.icon}
                    </div>

                    {/* 右侧头像 */}
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 shadow-[0_0_30px_rgba(197,160,89,0.3)] border-2 border-[#C5A059]">
                      <img src={UP_MEMBERS_CONFIG[Array.from(selectedIndices)[1]].avatar} alt={UP_MEMBERS_CONFIG[Array.from(selectedIndices)[1]].name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center max-w-[500px]">
                    <div className="relative inline-block">
                      <h3 className="text-2xl md:text-3xl font-serif text-[#333333] tracking-[0.3em] hover:text-[#C5A059] transition-colors duration-500 py-2 border-y border-[#333333]/20 px-8">
                        {duoEasterEgg.title}
                      </h3>
                      {/* 日式极简角落装饰 */}
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#C5A059]"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C5A059]"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#C5A059]"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#C5A059]"></div>
                    </div>
                  </div>
                </motion.div>
            ) : isEasterEggTriggered ? (
              <motion.div 
                key="easter-egg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 group w-full max-w-[800px] mx-auto relative px-8 md:px-0"
              >
                {/* 彩蛋：左侧六合一头像（图片） */}
                <div className="flex flex-col relative w-full md:w-auto items-center md:items-start">
                  <div className="flex flex-col items-center md:items-start gap-6 md:gap-8 relative z-10">
                      <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 shadow-[0_0_30px_rgba(197,160,89,0.3)] border-2 border-[#C5A059] animate-[spin_10s_linear_infinite]">
                        <img
                        src="/images/xygss.png"
                        alt="下一个是谁"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col items-center md:items-start">
                      <div className="flex items-end gap-3 mb-4">
                        <h3 className="text-3xl md:text-4xl font-normal text-[#333333] tracking-[0.1em] hover:text-[#C5A059] transition-colors duration-500 cursor-pointer">
                          下一个是谁
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 彩蛋：右侧六边形满级雷达图 */}
                <div className="flex flex-col w-full md:w-auto flex-1 max-w-[400px]">
                  <div className="w-full flex flex-col gap-6">
                    <div className="w-full h-[240px] min-h-[240px]">
                      <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={240}>
                        <RadarChart 
                          cx="50%" 
                          cy="50%" 
                          outerRadius="70%" 
                          data={[
                            { subject: '力量', A: 5, fullMark: 5 },
                            { subject: '默契', A: 5, fullMark: 5 },
                            { subject: '技巧', A: 5, fullMark: 5 },
                            { subject: '智力', A: 5, fullMark: 5 },
                            { subject: '运气', A: 5, fullMark: 5 },
                            { subject: '准度', A: 5, fullMark: 5 },
                          ]}
                        >
                          <PolarGrid gridType="polygon" stroke="#E5E5E5" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: '#777777', fontSize: 12, fontWeight: 300, letterSpacing: '0.1em' }} 
                          />
                          <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 5]} 
                            tick={false} 
                            axisLine={false} 
                          />
                          <Radar 
                            name="下一个是谁" 
                            dataKey="A" 
                            stroke="#C5A059" 
                            fill="#C5A059" 
                            fillOpacity={0.2} 
                            strokeWidth={1.5}
                            isAnimationActive={true}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full h-[1px] bg-[#E5E5E5] my-2"></div>

                    <div className="flex flex-col gap-3 md:gap-4 text-sm tracking-wider leading-loose text-[#555555] font-normal px-4 md:px-0">
                      <p><span className="text-[#C5A059] mr-4">BUFF</span> 默契与实力达到顶峰</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeMember.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 group w-full max-w-[800px] mx-auto relative px-8 md:px-0`}
              onAnimationComplete={() => {
                // 强制触发一次resize事件，解决 Recharts 在动画期间获取不到尺寸的警告
                window.dispatchEvent(new Event('resize'));
              }}
            >
            {/* 左侧装饰：拼音水印，作为极简设计元素 */}
            {activeMember.pinyin && (
              <div className="hidden md:block absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-[#E5E5E5] font-mono tracking-[0.4em] uppercase opacity-50 whitespace-nowrap z-0">
                {activeMember.pinyin}
              </div>
            )}

            {/* 头像与名字组合部分 */}
            <div className={`flex flex-col relative w-full md:w-auto items-center md:items-start`}>
              <div className="absolute -top-4 -left-2 md:-left-12 text-xs md:text-sm text-[#CCCCCC] font-mono tracking-widest z-0 hidden md:block">
                NO.{String(activeIndex + 1).padStart(2, '0')}
              </div>
              
              <div className="flex flex-col items-center md:items-start gap-6 md:gap-8 relative z-10 w-full">
                {/* 头像区域 - 仅此处可点击 */}
                <div 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 cursor-pointer shadow-sm mx-auto md:mx-0"
                  onClick={() => handleCardClick(activeMember.uid)}
                >
                  <img
                    src={activeMember.avatar}
                    alt={activeMember.name}
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-1000 ease-out"
                  />
                </div>

                {/* 名字与基础信息 */}
                <div className="flex flex-col items-center md:items-start w-full">
                  {/* 称号与荣誉分散排布 */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2 md:mb-3">
                    <span className="text-xs text-[#88B090] tracking-[0.2em] font-normal">
                      {activeMember.title}
                    </span>
                    {activeMember.honor && activeMember.honor !== '占位' && (
                      <span className="text-[10px] px-2 py-0.5 border border-[#E5E5E5] text-[#777777] tracking-widest">
                        {activeMember.honor}
                      </span>
                    )}
                  </div>
                  
                  {/* 名字 - 仅此处可点击 */}
                  <div className="flex items-end justify-center md:justify-start gap-3 mb-4 md:mb-4 w-full">
                    <h3 
                      className="text-3xl md:text-4xl font-normal text-[#333333] tracking-[0.1em] hover:text-[#88B090] transition-colors duration-500 cursor-pointer"
                      onClick={() => handleCardClick(activeMember.uid)}
                    >
                      {activeMember.name}
                    </h3>
                    {activeMember.nickname && (
                      <span className="text-sm text-[#777777] font-normal tracking-widest mb-1 opacity-70">
                        / {activeMember.nickname}
                      </span>
                    )}
                  </div>

                  {/* B站数据展示 - 极简排版 */}
                  {activeMember.uid && biliData?.data.up_info[activeMember.uid] && (
                    <div className="flex items-center justify-center md:justify-start gap-4 py-2 border-y border-[#F0F0F0] w-full md:max-w-[200px] mx-auto md:mx-0">
                      <div className="flex flex-col items-center md:items-start">
                        <span className="text-[10px] text-[#CCCCCC] font-mono tracking-widest mb-1">
                          BILIBILI FANS
                        </span>
                        <span className="text-lg text-[#555555] font-light tracking-wider">
                          {formatNumber(biliData.data.up_info[activeMember.uid].fans_count)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 信息部分 */}
            <div className={`flex flex-col w-full md:w-auto flex-1 max-w-[400px] mt-4 md:mt-0`}>
              {/* 极简雷达图数据 */}
              <div className="w-full flex flex-col gap-4 md:gap-6">
                <div className={`w-full h-[200px] md:h-[240px] min-h-[200px] md:min-h-[240px]`}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={240}>
                    <RadarChart 
                      cx="50%" 
                      cy="50%" 
                      outerRadius="70%" 
                      data={Object.entries(activeMember.stats).slice(0, 6).map(([key, value]) => ({
                        subject: key,
                        A: typeof value === 'string' && (value as string).includes('%') ? parseFloat(value as string) / 20 : parseFloat(String(value)),
                        fullMark: 5,
                      }))}
                    >
                      <PolarGrid gridType="polygon" stroke="#E5E5E5" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#777777', fontSize: 12, fontWeight: 300, letterSpacing: '0.1em' }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 5]} 
                        tick={false} 
                        axisLine={false} 
                      />
                      <Radar 
                        name={activeMember.name} 
                        dataKey="A" 
                        stroke="#88B090" 
                        fill="#88B090" 
                        fillOpacity={0.2} 
                        strokeWidth={1.5}
                        isAnimationActive={false}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full h-[1px] bg-[#E5E5E5] my-2"></div>

                <div className="flex flex-col gap-3 md:gap-4 text-xs md:text-sm tracking-wider leading-loose text-[#555555] font-normal px-4 md:px-0">
                  {activeMember.buffs && activeMember.buffs.length > 0 && (
                    <p><span className="text-[#88B090] mr-2 md:mr-4">BUFF</span> {activeMember.buffs.join(' / ')}</p>
                  )}
                  {activeMember.debuffs && activeMember.debuffs.length > 0 && (
                    <p><span className="text-[#333333] mr-2 md:mr-4 opacity-70">DEBUFF</span> {activeMember.debuffs.join(' / ')}</p>
                  )}
                </div>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UPMembers;
