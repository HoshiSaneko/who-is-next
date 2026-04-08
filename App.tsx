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
import Footer from './components/Footer';
import MusicPlayer from './components/MusicPlayer';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen w-full bg-[#F8F8F5] text-[#333333] font-sans selection:bg-[#88B090] selection:text-white relative">
        <Navigation />
        <main className="flex-1 w-full flex flex-col relative overflow-x-clip pt-16 md:pt-20 min-h-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/up-members" element={<UPMembers />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/levels" element={<Levels />} />
            <Route path="/goddess" element={<Goddess />} />
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
