import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPageview, updatePageview } from '@waline/client';
import { MEMES_CONFIG } from '../configs/memes.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';

const BACKGROUND_PATTERNS = [
  // 气泡/云朵
  <svg key="1" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>,
  // 星星
  <svg key="2" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  // 闪电
  <svg key="3" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>,
  // 游戏手柄
  <svg key="4" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>,
  // 火焰/热情
  <svg key="5" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 11.5c-2.5 0-2-3.5-2-3.5S14 11 10.5 11c-3.5 0-3.5-3.5-3.5-3.5C5 9.5 4 12.5 4 15c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.5-1-5.5-2.5-3.5z"/></svg>,
  // 音乐音符
  <svg key="6" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>,
  // 奖杯/奖章
  <svg key="7" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>,
  // 皇冠
  <svg key="8" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h14l-1.22-6.11L15.5 13l-3.5-7-3.5 7-2.28-3.11zM19 19c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/></svg>,
  // 骰子
  <svg key="9" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  // 笑脸/开心
  <svg key="10" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>,
  // 鬼脸/滑稽
  <svg key="11" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM8.5 8c-.83 0-1.5.67-1.5 1.5S7.67 11 8.5 11s1.5-.67 1.5-1.5S9.33 8 8.5 8zm7 0c-.83 0-1.5.67-1.5 1.5S14.67 11 15.5 11s1.5-.67 1.5-1.5S16.33 8 15.5 8zm-3.5 8c2.33 0 4.31-1.46 5.11-3.5h-10c.8 2.04 2.78 3.5 4.89 3.5z"/></svg>,
  // 播放器/视频
  <svg key="12" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zM10 16l5-4-5-4v8z"/></svg>,
  // 飞船/起飞
  <svg key="13" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M3.4 20.4l17.45-7.48c.81-.35.81-1.49 0-1.84L3.4 3.6c-.66-.29-1.39.2-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"/></svg>,
  // 爱心
  <svg key="14" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  // 太阳
  <svg key="15" className="w-full h-full" fill="currentColor" viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8 11.45h2V19h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8zM12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
];

const Memes: React.FC = () => {
  const serverURL = 'https://xygss-waline.saneko.me';
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('liked_memes');
      if (saved) {
        setLikedMemes(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      // ignore
    }

    const fetchLikes = async () => {
      const paths = MEMES_CONFIG.map(meme => `/memes/${meme.id}`);
      try {
        const results = await getPageview({
          serverURL,
          paths,
        });
        
        const newLikes: Record<string, number> = {};
        MEMES_CONFIG.forEach((meme, index) => {
          const item = results[index];
          newLikes[meme.id] = typeof item === 'number' ? item : (item?.time || 0);
        });
        setLikes(newLikes);
      } catch (err) {
        console.error('Failed to fetch meme likes:', err);
      }
    };
    fetchLikes();
  }, []);

  const handleLike = async (memeId: string) => {
    // 采用只增不减策略（点赞功能通常不需要取消，为了防止 Waline 报错 500）
    // 一旦点过赞（本地有记录），就不允许再点击了。
    const isLiked = likedMemes.has(memeId);
    if (isLiked) return; // 已经点赞过，直接忽略点击

    // 走到这里说明是进行点赞操作，乐观更新 UI
    setLikes(prev => ({ 
      ...prev, 
      [memeId]: (prev[memeId] || 0) + 1 
    }));
    
    const newLiked = new Set(likedMemes);
    newLiked.add(memeId);
    setLikedMemes(newLiked);
    try {
      localStorage.setItem('liked_memes', JSON.stringify(Array.from(newLiked)));
    } catch (e) {}

    try {
      // 使用 Waline 官方 SDK 的 updatePageview 来作为点赞（利用其不会报 500 的特点）
      const results = await updatePageview({
        serverURL,
        path: `/memes/${memeId}`,
      });
      
      if (Array.isArray(results) && results.length > 0) {
        const item = results[0];
        if (item && typeof item.time === 'number') {
          setLikes(prev => ({ ...prev, [memeId]: item.time }));
        }
      }
    } catch (err) {
      console.error('Failed to update like:', err);
      // 如果请求失败（比如报错 500），撤销刚才的点赞操作
      setLikes(prev => ({ 
        ...prev, 
        [memeId]: Math.max(0, (prev[memeId] || 0) - 1) 
      }));
      const revertedLiked = new Set(newLiked);
      revertedLiked.delete(memeId);
      setLikedMemes(revertedLiked);
      try {
        localStorage.setItem('liked_memes', JSON.stringify(Array.from(revertedLiked)));
      } catch (e) {}
    }
  };

  const filteredMemes = React.useMemo(() => {
    if (!searchQuery.trim()) return MEMES_CONFIG;
    const lowerQuery = searchQuery.toLowerCase();
    return MEMES_CONFIG.filter(meme => {
      // 匹配名场面名字
      if (meme.name.toLowerCase().includes(lowerQuery)) return true;
      // 匹配 ID
      if (meme.id.toLowerCase().includes(lowerQuery)) return true;
      // 匹配相关 UP 主名字
      if (meme.relatedUp && meme.relatedUp.some(up => up.toLowerCase().includes(lowerQuery))) return true;
      // 匹配出处标题（如果有的话）
      if (meme.sources && meme.sources.some(source => source.title && source.title.toLowerCase().includes(lowerQuery))) return true;
      
      return false;
    });
  }, [searchQuery]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-8 animate-fade-in flex flex-col flex-1 min-h-[calc(100vh-140px)]">
      <div className="flex flex-col flex-1 mt-4 md:mt-8">
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* 标题 */}
          <div className="flex items-center gap-6">
            <h2 className="text-xl md:text-2xl font-normal text-[#333333] tracking-[0.2em] whitespace-nowrap">名场面</h2>
            <div className="flex-1 h-[1px] bg-[#E5E5E5] min-w-[20px] md:min-w-[150px]"></div>
          </div>

          {/* 搜索框 */}
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full bg-[#FAFAFA] border border-[#E5E5E5] text-[#333333] text-sm rounded-none focus:border-[#88B090] block pl-10 pr-10 py-2.5 transition-colors outline-none focus:ring-0"
              placeholder="搜索名场面、相关UP主..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#999999] hover:text-[#555555] transition-colors"
                onClick={() => setSearchQuery('')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 提示信息 */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12 bg-[#FAFAFA] border-l-4 border-[#88B090] p-4 text-sm text-[#666666] tracking-wide"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#88B090] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="leading-relaxed">
              个人精力有限，目前仅收录了部分经典的名场面。如有更多好玩的场面或者发现有遗漏/错误的信息，非常欢迎在<a href="/guestbook" className="text-[#88B090] hover:underline mx-1">留言板</a>中向我反馈，我会及时补充和更新，非常感谢大家的谅解与支持！
            </p>
          </div>
        </motion.div>

        {/* 列表网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="wait">
            {filteredMemes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full py-20 flex flex-col items-center justify-center text-[#999999] gap-4"
              >
                <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="tracking-widest">没有找到相关的名场面...</p>
              </motion.div>
            ) : (
              filteredMemes.map((meme, index) => (
                <motion.div
                  key={meme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index % 10) * 0.1 }} // 优化搜索时的动画延迟，最多延迟1秒
                  className="flex flex-col overflow-hidden bg-white border border-[#F0F0F0] rounded-none hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-transparent transition-all duration-500 group hover:-translate-y-1.5"
                >
                  {/* 图片展示区 */}
                  <div className="w-full aspect-video overflow-hidden relative bg-[#FAFAFA]">
                    <img 
                      src={
                        meme.image 
                          ? (meme.image.startsWith('http') || meme.image.startsWith('/') ? meme.image : `/meme-images/${meme.image}`)
                          : `/meme-images/${meme.id}.png`
                      } 
                      alt={meme.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      onError={(e) => {
                        // 如果图片加载失败（比如对应的 png 文件不存在），显示一个带有图标的占位灰色区域
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // 防止无限循环
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-[#CCCCCC]">
                              <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                    {/* 图片底部渐变融合层，增加呼吸感 */}
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
                  </div>

                  {/* 信息展示区 */}
                  <div className="flex flex-col flex-1 relative bg-white overflow-hidden group/content">
                    {/* 右侧背景水印文字装饰 - 重新设计 */}
                    <div className="absolute right-0 bottom-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden flex items-end justify-end">
                      <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] text-[#FAFAFA] opacity-60 group-hover/content:text-[#88B090] group-hover/content:opacity-5 transition-all duration-700 ease-out transform group-hover/content:scale-125 group-hover/content:-translate-x-2 group-hover/content:-translate-y-2 -mr-6 -mb-6 md:-mr-8 md:-mb-8">
                        {BACKGROUND_PATTERNS[index % BACKGROUND_PATTERNS.length]}
                      </div>
                      {/* 添加一个细微的渐变遮罩，让水印更柔和地融入背景 */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent"></div>
                    </div>

                    {/* 标题区域 */}
                    <div className="p-5 md:p-6 pb-0 flex items-start justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-5 bg-gradient-to-b from-[#88B090] to-[#88B090]/50 rounded-full group-hover:scale-y-125 transition-transform duration-300"></div>
                        <h3 className="text-lg md:text-xl font-bold text-[#222222] tracking-wider group-hover:text-[#88B090] transition-colors duration-300 cursor-default">
                          {meme.name}
                        </h3>
                      </div>
                      
                      {/* 右上角点赞/小电视 */}
                      <button
                        onClick={() => handleLike(meme.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 group/like border ${
                          likedMemes.has(meme.id)
                            ? 'border-[#88B090]/30 bg-[#88B090]/5 text-[#88B090]'
                            : 'border-[#E5E5E5] hover:border-[#88B090]/50 hover:bg-[#88B090]/5 text-[#999999] hover:text-[#88B090]'
                        }`}
                        title={likedMemes.has(meme.id) ? '已赞' : '点赞'}
                      >
                        <svg
                          className={`w-4 h-4 md:w-4.5 md:h-4.5 ${
                            likedMemes.has(meme.id) ? 'fill-[#88B090]' : 'fill-[#CCCCCC] group-hover/like:fill-[#88B090]'
                          } transition-all duration-300 group-hover/like:scale-110 active:scale-95`}
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z"></path>
                        </svg>
                        <span className="text-[11px] md:text-xs font-mono font-bold">
                          {likes[meme.id] || 0}
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-col flex-1 p-5 md:p-6 pt-4 relative z-10">
                      {/* 出处区域 */}
                      {meme.sources && meme.sources.length > 0 && (
                        <div className="flex flex-col gap-3 mb-4 flex-1">
                          <span className="text-[#999999] tracking-widest text-[11px] font-medium flex items-center gap-1.5 uppercase">
                            SOURCES
                            <div className="flex-1 h-[1px] bg-[#F0F0F0] ml-2"></div>
                          </span>
                          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                            {meme.sources.map((source, i) => {
                              const bvidMatch = source.url.match(/BV[a-zA-Z0-9]+/);
                              const timeMatch = source.url.match(/[?&]t=([0-9.]+)/);
                              
                              let displayLabel = source.title;
                              let timeLabel = '';
                              
                              if (!displayLabel) {
                                if (bvidMatch) {
                                  displayLabel = bvidMatch[0];
                                  if (timeMatch) {
                                    const totalSeconds = Math.floor(parseFloat(timeMatch[1]));
                                    const minutes = Math.floor(totalSeconds / 60);
                                    const seconds = totalSeconds % 60;
                                    timeLabel = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                                  }
                                } else {
                                  displayLabel = `出处 ${i + 1}`;
                                }
                              }
                              
                              return (
                                <a
                                  key={i}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/link flex items-center justify-between p-2.5 rounded-md bg-[#FAFAFA] hover:bg-[#88B090]/5 border border-transparent hover:border-[#88B090]/20 transition-all duration-300"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-6 h-6 rounded bg-white flex items-center justify-center shadow-sm shrink-0 group-hover/link:bg-[#88B090] transition-colors">
                                      <svg className="w-3 h-3 text-[#CCCCCC] group-hover/link:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                    <span className="text-[#666666] group-hover/link:text-[#88B090] text-xs font-medium tracking-wide truncate transition-colors">
                                      {displayLabel}
                                    </span>
                                  </div>
                                  {timeLabel && (
                                    <span className="text-[10px] font-mono text-[#999999] bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#E5E5E5] group-hover/link:border-[#88B090]/30 group-hover/link:text-[#88B090] transition-colors shrink-0">
                                      {timeLabel}
                                    </span>
                                  )}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* 关联主创区域 */}
                      {meme.relatedUp && meme.relatedUp.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-dashed border-[#E5E5E5] flex items-center justify-between gap-4">
                          <span className="text-[#999999] tracking-widest text-[10px] font-medium shrink-0 uppercase">
                            STARRING
                          </span>
                          <div className="flex items-center justify-end flex-wrap gap-1.5">
                            {meme.relatedUp.map((upName, idx) => {
                              const upInfo = UP_MEMBERS_CONFIG.find(up => up.name === upName || up.id === upName);
                              if (!upInfo) return null;
                              return (
                                <div 
                                  key={upInfo.id} 
                                  className="relative group/up cursor-default"
                                  style={{ zIndex: 10 - idx }}
                                >
                                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover/up:-translate-y-1 transition-transform duration-300">
                                    <img src={upInfo.avatar} alt={upInfo.name} className="w-full h-full object-cover" />
                                  </div>
                                  {/* Tooltip */}
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#333333] text-white text-[10px] px-2 py-1 rounded opacity-0 invisible group-hover/up:opacity-100 group-hover/up:visible transition-all duration-200 whitespace-nowrap">
                                    {upInfo.name}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-2 border-transparent border-t-[#333333]"></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 底部留白 */}
      <div className="mt-12 md:mt-auto pt-12 md:pt-24 text-center">
        <div className="w-1 h-1 bg-[#E5E5E5] mx-auto rounded-full"></div>
      </div>
    </div>
  );
};

export default Memes;
