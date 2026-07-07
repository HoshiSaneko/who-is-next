import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex min-h-screen w-full flex-col bg-white text-slate-950 selection:bg-slate-950 selection:text-white relative font-sans">
        <MobileWarningToast />
        <Navigation />
        <main className="flex-1 w-full flex flex-col relative overflow-x-clip min-h-0">
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
        
        {/* 全局底部栏 */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
