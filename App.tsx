import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import UPMembers from './pages/UPMembers';
import Groups from './pages/Groups';
import Levels from './pages/Levels';
import Goddess from './pages/Goddess';
import Stats from './pages/Stats';
import Guestbook from './pages/Guestbook';
import Extras from './pages/Extras';
import Memes from './pages/Memes';
import TrafficKing from './pages/TrafficKing';
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';
import MobileWarningToast from './components/MobileWarningToast';
import { UP_MEMBERS_CONFIG } from './configs/upMembers.config';
import { preloadImageSource } from './src/utils/imageSources';

const SecondaryPageBackdrop: React.FC = () => {
  const backdropRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let animationFrame = 0;

    const updatePointer = (event: MouseEvent) => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const backdrop = backdropRef.current;
        if (!backdrop) return;

        const offsetX = event.clientX / window.innerWidth - 0.5;
        const offsetY = event.clientY / window.innerHeight - 0.5;
        backdrop.style.setProperty('--image-x', `${offsetX * -10}px`);
        backdrop.style.setProperty('--image-y', `${offsetY * -7}px`);
        backdrop.style.setProperty('--grid-x', `${offsetX * 13}px`);
        backdrop.style.setProperty('--grid-y', `${offsetY * 9}px`);
        backdrop.style.setProperty('--material-x', `${offsetX * 6}px`);
        backdrop.style.setProperty('--material-y', `${offsetY * 4}px`);
      });
    };

    window.addEventListener('mousemove', updatePointer, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('mousemove', updatePointer);
    };
  }, []);

  return (
    <div ref={backdropRef} className="secondary-page-backdrop" aria-hidden="true">
      <div className="secondary-page-backdrop__image" />
      <div className="secondary-page-backdrop__shade" />
      <div className="secondary-page-backdrop__structure" />
      <div className="secondary-page-backdrop__light" />
    </div>
  );
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`app-frame ${isHome ? 'is-home' : 'is-secondary'}`}>
      {!isHome && <SecondaryPageBackdrop />}
      <MobileWarningToast />
      <Navigation />
      <main className="relative z-[1] flex min-h-0 w-full flex-1 flex-col overflow-x-clip">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/up-members" element={<UPMembers />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/goddess" element={<Goddess />} />
          <Route path="/extras" element={<Extras />} />
          <Route path="/memes" element={<Memes />} />
          <Route path="/traffic-king" element={<TrafficKing />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/guestbook" element={<Guestbook />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  React.useEffect(() => {
    let cancelled = false;

    const preloadMemberBackgrounds = async () => {
      for (const member of UP_MEMBERS_CONFIG) {
        if (cancelled) return;
        const sources = [member.background || member.avatar, member.pageBackground].filter((source): source is string => Boolean(source));
        await Promise.all(sources.map((source) => preloadImageSource(source)));
      }
    };

    const startPreload = () => {
      void preloadMemberBackgrounds();
    };

    const idleId = window.requestIdleCallback?.(startPreload, { timeout: 2500 });
    const timeoutId = idleId === undefined ? window.setTimeout(startPreload, 1600) : undefined;

    return () => {
      cancelled = true;
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
