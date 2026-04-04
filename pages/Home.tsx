import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SEASON_EPISODES_CONFIG } from '../configs/seasonEpisodes.config';
import { useBiliData } from '../hooks/useBiliData';

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

const Home: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(SEASON_EPISODES_CONFIG.length - 1);
  const [direction, setDirection] = useState(0);
  const biliData = useBiliData();

  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      
      if (newCount === 6) {
        setShowEasterEgg(true);
        return 0; // Reset after triggering
      }
      
      return newCount;
    });

    // Reset click count if they stop clicking for 2 seconds
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync volume with global audio player when video shows
  useEffect(() => {
    if (showEasterEgg && videoRef.current) {
      const audioElement = document.querySelector('audio');
      if (audioElement) {
        videoRef.current.volume = audioElement.volume;
      } else {
        videoRef.current.volume = 0.5;
      }
      
      // Attempt to auto play
      videoRef.current.play().catch(e => console.error("Video autoplay failed:", e));
    }
  }, [showEasterEgg]);

  const navItems = [
    { path: '/up-members', label: 'UP主介绍' },
    { path: '/groups', label: '分组' },
    { path: '/levels', label: '关卡介绍' },
    { path: '/goddess', label: '正义女神' },
    { path: '/stats', label: '数据统计' }
  ];

  // Handle previous episode
  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? SEASON_EPISODES_CONFIG.length - 1 : prev - 1));
  };

  // Handle next episode
  const handleNext = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev === SEASON_EPISODES_CONFIG.length - 1 ? 0 : prev + 1));
  };

  // Mouse wheel support for episode navigation
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleWheel = (e: React.WheelEvent) => {
    // Disable on mobile so user can scroll normally
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }
    
    e.preventDefault();
    
    if (wheelTimeoutRef.current) return;
    
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    
    if (delta > 20) {
      handleNext();
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500);
    } else if (delta < -20) {
      handlePrev();
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500);
    }
  };

  const currentEpisode = SEASON_EPISODES_CONFIG[currentIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 pt-4 md:pt-8 pb-12 w-full max-w-[1200px] mx-auto min-h-0 relative overflow-hidden">
      <div className="text-center space-y-12 animate-fade-in w-full flex flex-col items-center mt-4 md:mt-8 mb-12 md:mb-16">
        {/* Main Title Image & Video Container */}
        <div className="relative w-full max-w-[400px] md:max-w-[600px] mx-auto flex flex-col items-center justify-center">
          <div 
            className="w-full relative drop-shadow-sm cursor-default"
            onClick={handleTitleClick}
          >
            {/* Image */}
            <img 
              src="/images/xygss.png" 
              alt="下一个是谁" 
              className={`w-full h-auto object-contain transition-opacity duration-1000 ${showEasterEgg ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            />
            
            {/* Video */}
            <video 
              ref={videoRef}
              src="https://cdn.jsdelivr.net/gh/HoshiSaneko/who-is-next/public/videos/doubleJ.mp4" 
              playsInline 
              disablePictureInPicture
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${showEasterEgg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onEnded={() => setShowEasterEgg(false)}
            />
          </div>
          
          {/* Minimalist Click Feedback Indicator */}
          <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 transition-opacity duration-500 pointer-events-none mix-blend-multiply ${(clickCount > 0 && !showEasterEgg) ? 'opacity-100' : 'opacity-0'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i < clickCount ? 'bg-[#88B090] scale-100 opacity-100' : 'bg-[#999999] scale-75 opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-[#555555] font-mono tracking-[0.3em] ml-[0.3em] uppercase">
          Who Is The Next
        </p>

        {/* Divider */}
        <div className="w-16 h-[1px] bg-[#E5E5E5] my-4"></div>
        
        {/* Latest Episode Section */}
        <div 
          className="w-full max-w-[800px] mt-12 md:mt-16 pt-12 md:pt-16 border-t border-[#F5F5F5] opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards] relative px-2 md:px-0"
          onWheel={handleWheel}
        >
          <div className="flex flex-col items-center gap-6 md:gap-8 relative z-10">
            <h3 className="text-[10px] text-[#999999] tracking-[0.4em] font-mono uppercase relative inline-block">
              <span className="relative z-10 bg-[#F8F8F5] px-4">EPISODE SHOWCASE</span>
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#E5E5E5] -z-0"></div>
            </h3>

            {/* 左右切换按钮 */}
            <button 
              onClick={(e) => { e.preventDefault(); handlePrev(); }}
              className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 text-2xl md:text-3xl font-light text-[#CCCCCC] hover:text-[#777777] hover:-translate-x-1 transition-all duration-300 z-30 px-2 py-8 focus:outline-none bg-transparent"
              aria-label="Previous episode"
            >
              &lt;
            </button>

            <button 
              onClick={(e) => { e.preventDefault(); handleNext(); }}
              className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 text-2xl md:text-3xl font-light text-[#CCCCCC] hover:text-[#777777] hover:translate-x-1 transition-all duration-300 z-30 px-2 py-8 focus:outline-none bg-transparent"
              aria-label="Next episode"
            >
              &gt;
            </button>

            {currentEpisode && (
              <a 
                href={`https://www.bilibili.com/video/${currentEpisode.bvid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col md:flex-row items-center md:items-stretch gap-4 md:gap-8 w-full max-w-[280px] md:max-w-none mx-auto hover:bg-white hover:shadow-sm p-4 md:p-6 transition-all duration-500 rounded-sm border border-transparent hover:border-[#E5E5E5]"
              >
                {/* 封面图 */}
                <div className="w-full md:w-[320px] aspect-video overflow-hidden shrink-0 relative shadow-sm">
                  <img 
                    key={currentEpisode.bvid}
                    src={`/covers/${currentEpisode.bvid}.jpg`} 
                    alt={currentEpisode.title} 
                    className="w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 transform group-hover:scale-105 transition-all duration-700 ease-out animate-[fadeIn_0.5s_ease-out]"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('data:image')) {
                        img.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f5f5f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23cccccc">No Cover</text></svg>`;
                      }
                    }}
                  />
                  {/* 微弱的渐变遮罩，让图片看起来更有质感 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                </div>

                {/* 视频信息 */}
                <div className="flex flex-col justify-center flex-1 w-full text-center md:text-left py-2">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <span className="text-[10px] text-[#999999] tracking-[0.2em] border border-[#E5E5E5] px-2 py-0.5 group-hover:border-[#88B090] group-hover:text-[#88B090] transition-colors duration-500">
                      第 {currentEpisode.season} 季
                    </span>
                    <span className="text-[10px] text-[#999999] tracking-[0.2em] group-hover:text-[#555555] transition-colors duration-500">
                      第 {String(currentEpisode.episode).padStart(2, '0')} 集
                    </span>
                  </div>
                  
                  <h4 key={currentEpisode.bvid + "-title"} className="text-base md:text-lg text-[#333333] font-medium tracking-wider leading-relaxed group-hover:text-[#88B090] transition-colors duration-500 line-clamp-2 animate-[fadeIn_0.5s_ease-out]">
                    {currentEpisode.title}
                  </h4>

                  {/* B站视频数据 */}
                  {biliData?.data.co_creation[currentEpisode.bvid] && (
                    <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-[13px] text-[#666666] font-medium tracking-wide animate-[fadeIn_0.5s_ease-out] relative">
                      <span className="flex items-center gap-1" title="播放量">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 4.040041666666666C7.897383333333334 4.040041666666666 6.061606666666667 4.147 4.765636666666667 4.252088333333334C3.806826666666667 4.32984 3.061106666666667 5.0637316666666665 2.9755000000000003 6.015921666666667C2.8803183333333333 7.074671666666667 2.791666666666667 8.471183333333332 2.791666666666667 9.998333333333333C2.791666666666667 11.525566666666668 2.8803183333333333 12.922083333333333 2.9755000000000003 13.9808C3.061106666666667 14.932983333333334 3.806826666666667 15.666916666666667 4.765636666666667 15.744683333333336C6.061611666666668 15.849716666666666 7.897383333333334 15.956666666666667 10 15.956666666666667C12.10285 15.956666666666667 13.93871666666667 15.849716666666666 15.234766666666667 15.74461666666667C16.193416666666668 15.66685 16.939000000000004 14.933216666666667 17.024583333333336 13.981216666666668C17.11975 12.922916666666667 17.208333333333332 11.526666666666666 17.208333333333332 9.998333333333333C17.208333333333332 8.470083333333333 17.11975 7.073818333333334 17.024583333333336 6.015513333333334C16.939000000000004 5.063538333333333 16.193416666666668 4.329865000000001 15.234766666666667 4.252118333333334C13.93871666666667 4.147016666666667 12.10285 4.040041666666666 10 4.040041666666666zM4.684808333333334 3.255365C6.001155 3.14862 7.864583333333334 3.0400416666666668 10 3.0400416666666668C12.13565 3.0400416666666668 13.999199999999998 3.148636666666667 15.315566666666667 3.2553900000000002C16.753416666666666 3.3720016666666672 17.890833333333333 4.483195 18.020583333333335 5.925965000000001C18.11766666666667 7.005906666666667 18.208333333333336 8.433 18.208333333333336 9.998333333333333C18.208333333333336 11.56375 18.11766666666667 12.990833333333335 18.020583333333335 14.0708C17.890833333333333 15.513533333333331 16.753416666666666 16.624733333333335 15.315566666666667 16.74138333333333C13.999199999999998 16.848116666666666 12.13565 16.95666666666667 10 16.95666666666667C7.864583333333334 16.95666666666667 6.001155 16.848116666666666 4.684808333333334 16.7414C3.2467266666666665 16.624750000000002 2.1092383333333338 15.513266666666667 1.9795200000000002 14.070383333333334C1.8823900000000002 12.990000000000002 1.7916666666666667 11.562683333333334 1.7916666666666667 9.998333333333333C1.7916666666666667 8.434066666666666 1.8823900000000002 7.00672 1.9795200000000002 5.926381666666667C2.1092383333333338 4.483463333333334 3.2467266666666665 3.371976666666667 4.684808333333334 3.255365z"></path>
                          <path d="M12.23275 9.1962C12.851516666666667 9.553483333333332 12.851516666666667 10.44665 12.232683333333332 10.803866666666666L9.57975 12.335600000000001C8.960983333333335 12.692816666666667 8.1875 12.246250000000002 8.187503333333334 11.531733333333333L8.187503333333334 8.4684C8.187503333333334 7.753871666666667 8.960983333333335 7.307296666666667 9.57975 7.66456L12.23275 9.1962z"></path>
                        </svg>
                        {formatNumber(biliData.data.co_creation[currentEpisode.bvid].play)}
                      </span>
                      <span className="flex items-center gap-1" title="点赞数">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 36 36" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M9.77234 30.8573V11.7471H7.54573C5.50932 11.7471 3.85742 13.3931 3.85742 15.425V27.1794C3.85742 29.2112 5.50932 30.8573 7.54573 30.8573H9.77234ZM11.9902 30.8573V11.7054C14.9897 10.627 16.6942 7.8853 17.1055 3.33591C17.2666 1.55463 18.9633 0.814421 20.5803 1.59505C22.1847 2.36964 23.243 4.32583 23.243 6.93947C23.243 8.50265 23.0478 10.1054 22.6582 11.7471H29.7324C31.7739 11.7471 33.4289 13.402 33.4289 15.4435C33.4289 15.7416 33.3928 16.0386 33.3215 16.328L30.9883 25.7957C30.2558 28.7683 27.5894 30.8573 24.528 30.8573H11.9911H11.9902Z"></path>
                        </svg>
                        {formatNumber(biliData.data.co_creation[currentEpisode.bvid].like)}
                      </span>
                      <span className="flex items-center gap-1" title="投币数">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 28 28" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M14.045 25.5454C7.69377 25.5454 2.54504 20.3967 2.54504 14.0454C2.54504 7.69413 7.69377 2.54541 14.045 2.54541C20.3963 2.54541 25.545 7.69413 25.545 14.0454C25.545 17.0954 24.3334 20.0205 22.1768 22.1771C20.0201 24.3338 17.095 25.5454 14.045 25.5454ZM9.66202 6.81624H18.2761C18.825 6.81624 19.27 7.22183 19.27 7.72216C19.27 8.22248 18.825 8.62807 18.2761 8.62807H14.95V10.2903C17.989 10.4444 20.3766 12.9487 20.3855 15.9916V17.1995C20.3854 17.6997 19.9799 18.1052 19.4796 18.1052C18.9793 18.1052 18.5738 17.6997 18.5737 17.1995V15.9916C18.5667 13.9478 16.9882 12.2535 14.95 12.1022V20.5574C14.95 21.0577 14.5444 21.4633 14.0441 21.4633C13.5437 21.4633 13.1382 21.0577 13.1382 20.5574V12.1022C11.1 12.2535 9.52148 13.9478 9.51448 15.9916V17.1995C9.5144 17.6997 9.10883 18.1052 8.60856 18.1052C8.1083 18.1052 7.70273 17.6997 7.70265 17.1995V15.9916C7.71158 12.9487 10.0992 10.4444 13.1382 10.2903V8.62807H9.66202C9.11309 8.62807 8.66809 8.22248 8.66809 7.72216C8.66809 7.22183 9.11309 6.81624 9.66202 6.81624Z"></path>
                        </svg>
                        {formatNumber(biliData.data.co_creation[currentEpisode.bvid].coin)}
                      </span>
                      <span className="flex items-center gap-1" title="收藏数">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 28 28" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M19.8071 9.26152C18.7438 9.09915 17.7624 8.36846 17.3534 7.39421L15.4723 3.4972C14.8998 2.1982 13.1004 2.1982 12.4461 3.4972L10.6468 7.39421C10.1561 8.36846 9.25639 9.09915 8.19315 9.26152L3.94016 9.91102C2.63155 10.0734 2.05904 11.6972 3.04049 12.6714L6.23023 15.9189C6.96632 16.6496 7.29348 17.705 7.1299 18.7605L6.39381 23.307C6.14844 24.6872 7.62063 25.6614 8.84745 25.0119L12.4461 23.0634C13.4276 22.4951 14.6544 22.4951 15.6359 23.0634L19.2345 25.0119C20.4614 25.6614 21.8518 24.6872 21.6882 23.307L20.8703 18.7605C20.7051 17.705 21.0339 16.6496 21.77 15.9189L24.9597 12.6714C25.9412 11.6972 25.3687 10.0734 24.06 9.91102L19.8071 9.26152Z"></path>
                        </svg>
                        {formatNumber(biliData.data.co_creation[currentEpisode.bvid].favorite)}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-auto pt-6 flex items-center justify-center md:justify-start gap-2 text-[11px] text-[#999999] font-mono tracking-widest group-hover:text-[#88B090] transition-colors duration-500 relative">
                    <span className="relative">
                      前往 Bilibili 观看
                      <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#88B090] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>

                    {biliData?.data.co_creation[currentEpisode.bvid] && (
                      <span className="absolute right-0 bottom-0 text-[10px] text-[#999999] opacity-60 font-mono flex items-center group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <span className="font-sans mr-1 tracking-normal">数据截止至</span>
                        {biliData.data.co_creation[currentEpisode.bvid].update_time}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
        
      </div>


      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default Home;
