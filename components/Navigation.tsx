import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MusicPlayer from './MusicPlayer';
import { AnimatePresence, motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭“更多”菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.addEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const mainNavItems = [
    { path: '/up-members', label: '主创' },
    { path: '/groups', label: '赛季回顾' },
    { path: '/levels', label: '关卡统计' },
    { path: '/stats', label: '数据统计' },
  ];

  const moreNavItems = [
    { path: '/goddess', label: '正义女神' },
    { path: '/extras', label: '番外' },
    { path: '/memes', label: '名场面' },
    { path: '/guestbook', label: '留言' }
  ];

  // 移动端保持扁平化展示所有菜单
  const allNavItems = [...mainNavItems, ...moreNavItems];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F8F5]/90 backdrop-blur-md border-b border-[#E5E5E5] transition-all duration-300">
      <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="text-xl font-bold tracking-[0.2em] text-[#333333] hover:text-[#88B090] transition-colors"
        >
          下谁图鉴
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {mainNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm tracking-[0.1em] transition-all duration-300 relative py-1 ${
                  isActive 
                    ? 'text-[#333333] font-bold' 
                    : 'text-[#555555] font-normal hover:text-[#88B090]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#88B090] rounded-full"></span>
                )}
              </Link>
            );
          })}
          
          {/* 更多选项下拉菜单 */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex items-center gap-1 text-sm tracking-[0.1em] transition-all duration-300 py-1 font-normal ${
                moreMenuOpen || moreNavItems.some(item => location.pathname === item.path)
                  ? 'text-[#88B090]'
                  : 'text-[#555555] hover:text-[#88B090]'
              }`}
            >
              更多
              <svg 
                className={`w-3.5 h-3.5 transition-transform duration-300 ${moreMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {moreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-4 w-32 bg-white border border-[#E5E5E5] shadow-lg rounded-sm py-2 flex flex-col z-[100]"
                >
                  {moreNavItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`px-4 py-2.5 text-xs tracking-widest transition-colors duration-300 ${
                          isActive 
                            ? 'text-[#88B090] bg-[#FAFAFA] font-medium' 
                            : 'text-[#555555] hover:bg-[#FAFAFA] hover:text-[#88B090]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* 音乐播放器，放回导航项最右侧 */}
          <div className="ml-4 pl-4 border-l border-[#E5E5E5] flex items-center h-6">
            <MusicPlayer />
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] focus:outline-none z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-[1.5px] bg-[#333333] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`}></span>
          <span className={`block w-6 h-[1.5px] bg-[#333333] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-[1.5px] bg-[#333333] transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Nav */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 bg-[#F8F8F5]/95 backdrop-blur-md shadow-sm ${
          mobileMenuOpen ? 'max-h-[600px] border-b border-[#E5E5E5]' : 'max-h-0 border-transparent opacity-0'
        }`}
      >
        <div className="flex flex-col items-center py-4">
          {allNavItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-center py-3.5 text-[15px] tracking-[0.2em] transition-colors duration-300 active:bg-[#E5E5E5]/50 ${
                  isActive 
                    ? 'text-[#88B090] font-bold bg-white/50' 
                    : 'text-[#555555] font-medium hover:text-[#88B090]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* 移动端音乐播放器 */}
          <div className="mt-4 pt-4 pb-2 border-t border-[#E5E5E5] w-full flex justify-center">
            <MusicPlayer />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
