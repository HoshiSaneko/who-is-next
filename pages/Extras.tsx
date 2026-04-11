import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXTRAS_CONFIG } from '../configs/extras.config';

const Extras: React.FC = () => {
  const groupedVideos = useMemo(() => {
    const groups: Record<string, typeof EXTRAS_CONFIG> = {};
    
    // 1. 先按原顺序遍历分组，保证系列（分类）的出现顺序不变
    EXTRAS_CONFIG.forEach(video => {
      if (!groups[video.category]) {
        groups[video.category] = [];
      }
      groups[video.category].push(video);
    });

    // 2. 对每个分组内的视频按时间倒序（从最近到最远）排序
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
    });
    
    return groups;
  }, []);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-8 animate-fade-in flex flex-col flex-1 min-h-[calc(100vh-140px)]">
      
      <div className="flex flex-col flex-1 mt-4 md:mt-8">
        {Object.entries(groupedVideos).map(([category, videos], groupIndex) => (
          <div key={category} className="mb-16 md:mb-20 last:mb-0">
            {/* 分类标题 */}
            <div className="flex items-center gap-6 mb-8 md:mb-10">
              <h2 className="text-xl md:text-2xl font-normal text-[#333333] tracking-[0.2em]">{category}</h2>
              <div className="h-[1px] flex-1 bg-[#E5E5E5] max-w-[200px]"></div>
            </div>

            {/* 视频列表网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-12 md:gap-y-16">
              <AnimatePresence mode="wait">
                {videos.map((video, index) => (
                  <motion.div 
                    key={video.bvid}
                    initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col gap-6 group"
            >
              {/* 视频封面 */}
              <a 
                href={`https://www.bilibili.com/video/${video.bvid}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative w-full aspect-video overflow-hidden bg-[#FAFAFA] group-hover:shadow-md transition-shadow duration-500 block group/img"
              >
                <img 
                    src={`/covers/${video.bvid}.jpg`} 
                    alt={video.title}
                    className="w-full h-full object-cover filter grayscale-[10%] group-hover/img:grayscale-0 transform group-hover/img:scale-105 transition-all duration-700 ease-out animate-[fadeIn_0.5s_ease-out]"
                  />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </a>

              {/* 视频信息 */}
              <div className="flex flex-col gap-3 px-1">
                {/* 标题和日期 */}
                <div className="flex flex-col gap-2 border-l-2 border-[#E5E5E5] group-hover:border-[#88B090] pl-3 transition-colors duration-300">
                  {video.date && (
                    <span className="text-[10px] text-[#999999] font-mono tracking-widest uppercase">
                      {video.date}
                    </span>
                  )}
                  <a 
                    href={`https://www.bilibili.com/video/${video.bvid}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-base md:text-lg font-normal text-[#333333] tracking-[0.1em] hover:text-[#88B090] transition-colors line-clamp-2"
                  >
                    {video.title}
                  </a>
                </div>

                {/* 前往观看链接 */}
                <div className="mt-auto pt-2 flex items-center justify-start">
                  <a 
                    href={`https://www.bilibili.com/video/${video.bvid}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group/link flex items-center gap-2 py-2 text-[11px] text-[#999999] font-mono tracking-widest hover:text-[#88B090] transition-colors duration-500 relative cursor-pointer w-max"
                  >
                    <span className="relative">
                      前往 Bilibili 观看
                      <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#88B090] scale-x-0 group-hover/link:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </span>
                    <svg className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
      
      {/* 底部留白 */}
      <div className="mt-12 md:mt-auto pt-12 md:pt-24 text-center">
        <div className="w-1 h-1 bg-[#E5E5E5] mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

export default Extras;
