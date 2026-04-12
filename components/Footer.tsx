import React from 'react';
import MusicPlayer from './MusicPlayer';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#F5F5F5] border-t border-[#E5E5E5] mt-auto shrink-0 relative z-[99999]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        
        {/* 左侧信息区 (现居中显示) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 w-full">
          {/* Logo 或 标题 */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-[#333333] tracking-[0.2em] whitespace-nowrap">下一个是谁</h3>
            <span className="w-[1px] h-3 bg-[#D9D9D9] hidden md:block"></span>
            <p className="text-[10px] text-[#999999] tracking-widest font-mono uppercase hidden md:block mt-0.5">WHO IS THE NEXT</p>
          </div>

          {/* 链接组与信息 */}
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px] text-[#777777] font-medium tracking-wider">
            <a 
              href="https://github.com/HoshiSaneko/who-is-next" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-[#88B090] transition-colors duration-300 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
              </svg>
              GitHub
            </a>
            <span className="w-1 h-1 rounded-full bg-[#D9D9D9] hidden md:block"></span>
            <span className="text-[#AAAAAA]">Crafted with Gemini 3.1 Pro</span>
            <span className="w-1 h-1 rounded-full bg-[#D9D9D9] hidden md:block"></span>
            <a 
              href="https://saneko.me" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#AAAAAA] hover:text-[#88B090] transition-colors duration-300"
            >
              © {currentYear} Saneko
            </a>
            <span className="w-1 h-1 rounded-full bg-[#D9D9D9] hidden md:block"></span>
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#AAAAAA] hover:text-[#88B090] transition-colors duration-300"
            >
              浙ICP备2024096834号-4
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
