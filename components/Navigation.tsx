import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FiBarChart2, FiChevronDown, FiGrid, FiMenu, FiMessageSquare, FiStar, FiUser, FiX } from 'react-icons/fi';
import MusicPlayer from './MusicPlayer';

const primaryNavItems = [
  { path: '/', label: '总览', icon: FiGrid },
  { path: '/up-members', label: '主创', icon: FiUser },
  { path: '/groups', label: '赛季', icon: FiStar },
  { path: '/levels', label: '关卡', icon: FiGrid },
  { path: '/stats', label: '数据', icon: FiBarChart2 },
  { path: '/extras', label: '番外' },
  { path: '/traffic-king', label: '流量王' },
];

const secondaryNavItems = [
  { path: '/goddess', label: '正义女神' },
  { path: '/memes', label: '名场面' },
  { path: '/guestbook', label: '留言', icon: FiMessageSquare },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname]);

  const isSecondaryActive = secondaryNavItems.some((item) => item.path === location.pathname);
  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <nav className="pointer-events-none fixed left-3 top-0 z-50 py-3" style={{ width: 'calc(100vw - 1.5rem)' }}>
      <div className="pointer-events-auto relative mx-auto box-border flex h-14 w-full max-w-[1240px] items-center gap-4 rounded-[18px] border border-slate-200 bg-white px-3 shadow-[0_12px_34px_rgba(15,23,42,0.10)] sm:px-4 lg:grid lg:grid-cols-[minmax(220px,1fr)_auto_minmax(320px,1fr)] lg:px-5">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 lg:justify-self-start">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-slate-950 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(15,23,42,0.16)]">
            下
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-950">下谁图鉴</span>
            <span className="hidden text-[11px] leading-3 text-slate-600 sm:block">Who Is Next Archive</span>
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex lg:justify-self-center">
          {primaryNavItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex min-h-9 items-center rounded-[11px] px-3 text-sm font-semibold transition ${
                  active ? 'bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.15)]' : 'text-slate-700 hover:bg-slate-950/[0.06] hover:text-slate-950'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setMoreMenuOpen((open) => !open)}
              className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-[11px] px-3 text-sm font-semibold transition ${
                isSecondaryActive || moreMenuOpen ? 'bg-slate-950 text-white shadow-[0_8px_18px_rgba(15,23,42,0.15)]' : 'text-slate-700 hover:bg-slate-950/[0.06] hover:text-slate-950'
              }`}
            >
              更多
              <FiChevronDown className={`h-4 w-4 transition ${moreMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <AnimatePresence>
              {moreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-auto absolute right-0 top-full z-20 mt-3 w-44 overflow-hidden rounded-[14px] border border-slate-200 bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
                >
                  {secondaryNavItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block rounded-[10px] px-3 py-2.5 text-sm font-semibold transition ${
                          active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
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
        </div>

        <div className="hidden w-[350px] min-w-0 shrink-0 items-center justify-end border-l border-slate-900/10 pl-4 lg:flex lg:justify-self-end">
          <MusicPlayer />
        </div>

        <button
          type="button"
          className="ml-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-950 bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto absolute left-3 right-3 top-[4.35rem] z-20 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 p-3">
              {allNavItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = 'icon' in item && item.icon ? item.icon : FiGrid;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm font-medium transition ${
                      active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-slate-100 pt-3">
                <MusicPlayer />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;

