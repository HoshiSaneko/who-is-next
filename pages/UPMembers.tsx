import React, { useState } from 'react';
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
  const biliData = useBiliData();

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

  const handleThumbnailClick = (index: number) => {
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
    // Disable horizontal scroll takeover on mobile to prevent accidental swipes
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    
    // Prevent default scroll behavior
    e.preventDefault();
    
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
              e.preventDefault();
            }
          }}
        >
          {UP_MEMBERS_CONFIG.map((member, index) => (
            <div 
              key={member.id}
              onClick={() => handleThumbnailClick(index)}
              className={`relative cursor-pointer group transition-all duration-500 flex flex-col items-center justify-center shrink-0
                ${activeIndex === index ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'}
              `}
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all duration-500 ${activeIndex === index ? 'ring-2 ring-[#88B090] ring-offset-2 ring-offset-[#F8F8F5]' : ''}`}>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${activeIndex === index ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                />
              </div>
              {/* 隐藏的序号装饰，仅当前选中显示 */}
              {activeIndex === index && (
                <div className="absolute -bottom-6 text-[10px] text-[#88B090] font-mono tracking-widest hidden md:block">
                  NO.{String(index + 1).padStart(2, '0')}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 右侧内容展示区 */}
        <div 
          className="flex-1 flex items-center justify-center min-h-[600px] md:min-h-[500px] relative overflow-hidden"
          onWheel={handleWheel}
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
              <div className="absolute -top-4 -left-2 md:-left-12 text-xs md:text-sm text-[#CCCCCC] font-mono tracking-widest z-0">
                NO.{String(activeIndex + 1).padStart(2, '0')}
              </div>
              
              <div className="flex flex-col items-center md:items-start gap-6 md:gap-8 relative z-10">
                {/* 头像区域 - 仅此处可点击 */}
                <div 
                  className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 cursor-pointer shadow-sm"
                  onClick={() => handleCardClick(activeMember.uid)}
                >
                  <img
                    src={activeMember.avatar}
                    alt={activeMember.name}
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-1000 ease-out"
                  />
                </div>

                {/* 名字与基础信息 */}
                <div className="flex flex-col items-center md:items-start">
                  {/* 称号与荣誉分散排布 */}
                  <div className="flex flex-wrap items-center gap-4 mb-3">
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
                  <div className="flex items-end gap-3 mb-4">
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
                    <div className="flex items-center gap-4 py-2 border-y border-[#F0F0F0] w-full max-w-[200px]">
                      <div className="flex flex-col">
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
            <div className={`flex flex-col w-full md:w-auto flex-1 max-w-[400px]`}>
              {/* 极简雷达图数据 */}
              <div className="w-full flex flex-col gap-6">
                <div className={`w-full h-[240px] min-h-[240px]`}>
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

                <div className="flex flex-col gap-4 text-sm tracking-wider leading-loose text-[#555555] font-normal">
                  {activeMember.buffs && activeMember.buffs.length > 0 && (
                    <p><span className="text-[#88B090] mr-4">BUFF</span> {activeMember.buffs.join(' / ')}</p>
                  )}
                  {activeMember.debuffs && activeMember.debuffs.length > 0 && (
                    <p><span className="text-[#333333] mr-4 opacity-70">DEBUFF</span> {activeMember.debuffs.join(' / ')}</p>
                  )}
                </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UPMembers;
