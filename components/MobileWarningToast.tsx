import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MobileWarningToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 检测是否为移动端设备 (宽度 < 768 或 userAgent 包含移动端标识)
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 稍微延迟 500ms 后显示，体验更好
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      // 显示 3 秒后自动隐藏 (500 + 3000 = 3500)
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-20 left-4 z-[9999] px-4 py-3 bg-white/95 backdrop-blur-md border border-[#E5E5E5] shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-[calc(100%-32px)] max-w-[320px] rounded-sm pointer-events-none"
        >
          <div className="flex flex-row items-start justify-start gap-2.5 w-full">
            <svg className="w-4 h-4 mt-0.5 text-[#88B090] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[12px] text-[#555555] font-sans m-0 leading-snug whitespace-normal break-words flex-1 text-left tracking-normal">
              移动端显示可能不佳，建议使用 PC 浏览
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileWarningToast;
