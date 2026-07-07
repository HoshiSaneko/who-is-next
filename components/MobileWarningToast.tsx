import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSmartphone } from 'react-icons/fi';

const MobileWarningToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (!isMobile) return;

    const showTimer = window.setTimeout(() => setIsVisible(true), 800);
    const hideTimer = window.setTimeout(() => setIsVisible(false), 5200);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
          className="fixed left-4 right-4 top-20 z-[9999] rounded-[8px] border border-sky-100 bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-[8px] bg-sky-50 p-2 text-sky-700">
              <FiSmartphone className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="min-w-0 text-xs leading-5 text-slate-600">
              移动端适合快速浏览，桌面端会展示更完整的数据面板。
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileWarningToast;
