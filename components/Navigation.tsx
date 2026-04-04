import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MusicPlayer from './MusicPlayer';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/up-members', label: '主创' },
    { path: '/groups', label: '赛季回顾' },
    { path: '/levels', label: '关卡统计' },
    { path: '/goddess', label: '正义女神' },
    { path: '/stats', label: '数据统计' }
  ];

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
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => {
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
        className={`md:hidden overflow-hidden transition-all duration-500 bg-[#F8F8F5] ${
          mobileMenuOpen ? 'max-h-[500px] border-b border-[#E5E5E5]' : 'max-h-0 border-transparent'
        }`}
      >
        <div className="flex flex-col items-center py-4 gap-6">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base tracking-[0.15em] transition-colors duration-300 ${
                  isActive 
                    ? 'text-[#333333] font-bold' 
                    : 'text-[#555555] font-normal hover:text-[#88B090]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* 移动端音乐播放器 */}
          <div className="mt-2 pt-6 border-t border-[#E5E5E5] w-full flex justify-center">
            <MusicPlayer />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
