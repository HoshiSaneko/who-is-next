import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GODDESSES_CONFIG } from '../configs/goddesses.config';
import { GAMES_CONFIG } from '../configs/games.config';

const Goddess: React.FC = () => {
  const [activeSeason, setActiveSeason] = useState<number>(6);
  const navigate = useNavigate();

  const goddessesBySeason = useMemo(() => {
    const grouped: Record<number, typeof GODDESSES_CONFIG> = {};
    GODDESSES_CONFIG.forEach(goddess => {
      if (!grouped[goddess.season]) {
        grouped[goddess.season] = [];
      }
      grouped[goddess.season].push(goddess);
    });
    return grouped;
  }, []);

  const seasons = Object.keys(goddessesBySeason).map(Number).sort((a, b) => a - b);
  const currentGoddesses = goddessesBySeason[activeSeason] || [];

  const handleGameClick = (gameName: string) => {
    const game = GAMES_CONFIG.find(g => g.levelName === gameName);
    if (game) {
      navigate('/levels', { state: { selectedGameId: game.id } });
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-12 animate-fade-in flex flex-col flex-1 h-full min-h-[calc(100vh-140px)]">
      
      {/* 顶部导航区 - 极简文字选项卡 */}
      <div className="flex justify-start md:justify-center gap-8 md:gap-16 overflow-x-auto pt-4 pb-8 mb-8 md:mb-16 no-scrollbar items-center w-full max-w-[900px] mx-auto px-4 border-b border-[#F0F0F0] shrink-0"
           onWheel={(e) => {
             // 允许通过滚轮横向滚动导航栏
             if (e.currentTarget && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
               e.currentTarget.scrollLeft += e.deltaY;
               e.preventDefault();
             }
           }}
      >
        {seasons.map(season => (
          <div
            key={season}
            onClick={() => setActiveSeason(season)}
            className={`relative cursor-pointer transition-all duration-300 pb-4 whitespace-nowrap flex items-center shrink-0 ${
              activeSeason === season 
                ? 'text-[#333333]' 
                : 'text-[#999999] hover:text-[#666666]'
            }`}
          >
            <span className="text-sm md:text-base tracking-[0.2em] font-normal">
              第{['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][season - 1] || season}季
            </span>
            {activeSeason === season && (
              <motion.div 
                layoutId="season-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#88B090]"
              />
            )}
          </div>
        ))}
      </div>

      {/* 女神列表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 flex-1 pb-12 pr-2">
        <AnimatePresence mode="wait">
          {currentGoddesses.map((goddess, index) => (
            <motion.div 
              key={goddess.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col gap-6 group"
            >
              {/* 头部：集数与名字 */}
              <div className="flex items-center gap-4 border-l-2 border-[#E5E5E5] group-hover:border-[#88B090] pl-4 transition-colors duration-300">
                <span className="text-xs text-[#999999] tracking-[0.2em] shrink-0">
                  第 {String(goddess.episode).padStart(2, '0')} 集
                </span>
                <a 
                  href={goddess.bilibiliUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xl font-normal text-[#333333] tracking-[0.1em] hover:text-[#88B090] transition-colors"
                >
                  {goddess.name}
                </a>
              </div>

              <div className="flex gap-6 items-start">
                {/* 小头像 */}
                <a 
                  href={goddess.bilibiliUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-20 h-20 shrink-0 overflow-hidden rounded-sm"
                >
                  <img 
                    src={goddess.avatar} 
                    alt={goddess.name}
                    className="w-full h-full object-cover filter grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
                  />
                </a>

                {/* 描述与关卡信息 */}
                <div className="flex flex-col gap-4 flex-1">
                  <p className="text-xs text-[#777777] leading-relaxed tracking-wider">
                    {goddess.description}
                  </p>
                  
                  <div className="pt-4 border-t border-[#F5F5F5]">
                    <span className="text-[10px] text-[#999999] tracking-[0.2em] mb-2 block">GAMES</span>
                    <div className="flex flex-wrap gap-2">
                      {goddess.games.map((game, i) => (
                        <span 
                          key={i} 
                          onClick={() => handleGameClick(game)}
                          className="text-[11px] text-[#555555] bg-[#FAFAFA] px-2 py-1 tracking-wider cursor-pointer hover:bg-[#88B090] hover:text-white transition-colors duration-300"
                        >
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* 底部留白 */}
      <div className="mt-12 md:mt-auto pt-12 md:pt-24 text-center">
        <div className="w-1 h-1 bg-[#E5E5E5] mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

export default Goddess;
