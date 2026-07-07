import React, { useEffect, useMemo, useState } from 'react';
import { getPageview, updatePageview } from '@waline/client';
import { FiExternalLink, FiHeart, FiImage, FiSearch, FiX } from 'react-icons/fi';
import { MEMES_CONFIG } from '../configs/memes.config';
import { PageShell } from '../components/ui';
import { OptimizedImage } from '../src/components/OptimizedImage';

const getMemeImage = (id: string, image?: string) => image || `/meme-images/${id}.png`;
const serverURL = 'https://xygss-waline.saneko.me';

const metricCards = [
  { label: '收录名场面', icon: FiImage, tone: 'from-[#ffd59d]/[0.18]' },
  { label: '来源链接', icon: FiExternalLink, tone: 'from-[#2a7769]/[0.22]' },
  { label: '已喜欢', icon: FiHeart, tone: 'from-[#e8b9a0]/[0.2]' },
];

const getSourceLabel = (source: { title?: string }, index: number) => source.title || `Source ${index + 1}`;

const Memes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [selectedMeme, setSelectedMeme] = useState<(typeof MEMES_CONFIG)[number] | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('liked_memes');
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        setLiked(Object.fromEntries(ids.map((id) => [id, true])));
      }
    } catch {
      // Ignore broken local like cache.
    }

    const fetchLikes = async () => {
      try {
        const results = await getPageview({
          serverURL,
          paths: MEMES_CONFIG.map((meme) => `/memes/${meme.id}`),
        });

        setLikes(Object.fromEntries(MEMES_CONFIG.map((meme, index) => {
          const item = results[index];
          const count = typeof item === 'number' ? item : item?.time || 0;
          return [meme.id, count];
        })));
      } catch (error) {
        console.error('Failed to fetch meme likes:', error);
      }
    };

    fetchLikes();
  }, []);

  const handleLike = async (memeId: string) => {
    if (liked[memeId]) return;

    const nextLiked = { ...liked, [memeId]: true };
    setLiked(nextLiked);
    setLikes((state) => ({ ...state, [memeId]: (state[memeId] || 0) + 1 }));

    try {
      localStorage.setItem('liked_memes', JSON.stringify(Object.keys(nextLiked).filter((id) => nextLiked[id])));
    } catch {
      // Local storage is a convenience only.
    }

    try {
      const results = await updatePageview({
        serverURL,
        path: `/memes/${memeId}`,
      });
      const item = Array.isArray(results) ? results[0] : undefined;
      if (item && typeof item.time === 'number') {
        setLikes((state) => ({ ...state, [memeId]: item.time }));
      }
    } catch (error) {
      console.error('Failed to update meme like:', error);
      setLiked((state) => {
        const next = { ...state };
        delete next[memeId];
        return next;
      });
      setLikes((state) => ({ ...state, [memeId]: Math.max(0, (state[memeId] || 1) - 1) }));
      try {
        localStorage.setItem('liked_memes', JSON.stringify(Object.keys(nextLiked).filter((id) => id !== memeId)));
      } catch {
        // Local storage is a convenience only.
      }
    }
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return MEMES_CONFIG
      .map((meme, index) => ({ meme, index }))
      .filter(({ meme }) =>
        !query ||
        meme.name.toLowerCase().includes(query) ||
        meme.sources.some((source) => source.title?.toLowerCase().includes(query) || source.url.toLowerCase().includes(query)) ||
        meme.relatedUp?.some((name) => name.toLowerCase().includes(query)),
      )
      .sort((a, b) => {
        const likesDiff = (likes[b.meme.id] || 0) - (likes[a.meme.id] || 0);
        return likesDiff || a.index - b.index;
      })
      .map(({ meme }) => meme);
  }, [likes, searchQuery]);
  const totalSources = useMemo(() => MEMES_CONFIG.reduce((sum, meme) => sum + meme.sources.length, 0), []);
  const likedCount = useMemo(() => MEMES_CONFIG.reduce((sum, meme) => sum + (likes[meme.id] || 0), 0), [likes]);
  const metricValues = [MEMES_CONFIG.length, totalSources, likedCount];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#15110f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_4%,rgba(255,229,188,0.24),transparent_24rem),radial-gradient(circle_at_86%_2%,rgba(42,119,105,0.18),transparent_30rem),linear-gradient(180deg,#15110f_0%,#2a1d18_38%,#755034_72%,#c99a66_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0_9%,rgba(255,255,255,0.08)_9.06%,transparent_9.18%_50%,rgba(255,255,255,0.07)_50.06%,transparent_50.18%_91%,rgba(255,255,255,0.07)_91.06%,transparent_91.18%),repeating-linear-gradient(0deg,rgba(255,255,255,0.04)_0_1px,transparent_1px_30px),repeating-linear-gradient(90deg,rgba(54,29,18,0.13)_0_1px,transparent_1px_128px)] opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.62)_0%,rgba(5,7,10,0.2)_32%,rgba(255,255,255,0.08)_72%,rgba(255,255,255,0.2)_100%),radial-gradient(ellipse_at_center,transparent_42%,rgba(5,7,10,0.25)_100%)]" />

      <PageShell className="relative z-10 max-w-[1280px] gap-5 pt-24">
        <section className="grid gap-3 sm:grid-cols-3" aria-label="Meme metrics">
          {metricCards.map(({ label, icon: Icon, tone }, index) => (
            <article
              key={label}
              className="group relative min-h-[8.4rem] overflow-hidden rounded-[12px] border border-white/[0.13] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_48%,rgba(255,213,157,0.075))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-[18px] transition duration-300 hover:-translate-y-1 hover:border-[#ffd59d]/[0.42] hover:bg-[linear-gradient(135deg,rgba(255,213,157,0.13),rgba(255,255,255,0.055)_52%,rgba(255,213,157,0.1))]"
            >
              <div className={`pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-gradient-to-br ${tone} to-transparent blur-3xl`} />
              <div className="relative flex h-full items-start justify-between gap-5">
                <div>
                  <p className="text-[0.72rem] font-bold uppercase leading-none tracking-[0.18em] text-[#ffd59d]/[0.72]">{label}</p>
                  <strong className="mt-4 block text-[clamp(2.35rem,4.4vw,3.5rem)] font-[780] leading-none tracking-normal text-white tabular-nums drop-shadow-[0_14px_34px_rgba(0,0,0,0.3)]">
                    {metricValues[index].toLocaleString('en-US')}
                  </strong>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-[#ffd59d]/[0.22] bg-[linear-gradient(135deg,rgba(255,213,157,0.13),rgba(255,255,255,0.045))] text-[#ffe1b0] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_24px_rgba(0,0,0,0.16)] transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04] group-hover:border-[#ffd59d]/[0.42]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-[#ffd59d]/[0.22] via-[#ffe1b0]/[0.42] to-transparent opacity-80 transition duration-300 group-hover:h-[3px] group-hover:opacity-100" />
            </article>
          ))}
        </section>

        <section className="grid gap-3 rounded-[10px] border border-white/[0.13] bg-[linear-gradient(135deg,rgba(8,11,15,0.6),rgba(8,11,15,0.34))] p-3 shadow-[0_22px_62px_rgba(0,0,0,0.18)] backdrop-blur-[18px] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <label className="grid h-12 min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] items-center rounded-[8px] border border-white/10 bg-white/[0.075] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-within:border-[#ffd59d]/40 focus-within:bg-white/[0.1] focus-within:ring-4 focus-within:ring-[#ffd59d]/[0.08]">
            <FiSearch className="pointer-events-none h-4 w-4 justify-self-center text-[#ffd59d]/[0.58]" aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索名场面、来源或相关主创"
              className="h-full w-full min-w-0 border-0 bg-transparent pr-4 text-sm font-semibold text-white placeholder:text-white/40 focus:ring-0"
            />
          </label>
          <div className="flex items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.055] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white/62 md:justify-start">
            <span>{filtered.length} visible</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffd59d]/70" aria-hidden="true" />
            <span>{likedCount} liked</span>
          </div>
        </section>

        <section className="overflow-hidden rounded-[10px] border border-white/[0.12] bg-[linear-gradient(135deg,rgba(8,11,15,0.68),rgba(8,11,15,0.36))] text-white shadow-[0_22px_62px_rgba(0,0,0,0.22)] backdrop-blur-[18px]">
        {filtered.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <FiSearch className="mx-auto h-8 w-8 text-[#ffd59d]/[0.62]" aria-hidden="true" />
              <strong className="mt-4 block text-base font-bold text-white/90">没有找到名场面</strong>
              <span className="mt-2 block text-sm text-white/52">换一个关键词试试。</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((meme) => (
              <article key={meme.id} className="group relative flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-white/[0.11] bg-[linear-gradient(135deg,rgba(255,255,255,0.095),rgba(255,255,255,0.045)),rgba(18,16,15,0.72)] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025),0_10px_24px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#ffd59d]/[0.38] hover:bg-[linear-gradient(135deg,rgba(255,213,157,0.12),rgba(255,255,255,0.065)),rgba(34,27,22,0.78)] hover:shadow-[0_18px_42px_rgba(255,178,92,0.08)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.08]">
                  <OptimizedImage src={getMemeImage(meme.id, meme.image)} alt={meme.name} className="h-full w-full object-cover brightness-[0.86] contrast-[0.98] saturate-[0.9] transition duration-500 group-hover:scale-[1.035] group-hover:brightness-100 group-hover:saturate-100" loading="lazy" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(8,11,15,0.52)_100%)]" />
                </div>
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-[0.96rem] font-[760] leading-6 text-white/95">{meme.name}</h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#ffd59d]/[0.68]">{likes[meme.id] || 0} Links</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLike(meme.id)}
                      className={`inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[8px] border transition duration-200 ${
                        liked[meme.id]
                          ? 'border-[#e8b9a0]/40 bg-[#e8b9a0]/[0.14] text-[#ffd8c4] shadow-[0_0_18px_rgba(232,185,160,0.12)]'
                          : 'border-white/10 bg-white/[0.07] text-white/60 hover:border-[#ffd59d]/30 hover:bg-[#ffd59d]/[0.1] hover:text-white'
                      }`}
                      aria-label={liked[meme.id] ? '已喜欢' : '喜欢名场面'}
                      title={liked[meme.id] ? '已喜欢' : '喜欢'}
                    >
                      <FiHeart className="h-4 w-4" />
                    </button>
                  </div>

                  {meme.relatedUp && meme.relatedUp.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {meme.relatedUp.map((name) => (
                        <span key={name} className="inline-flex items-center rounded-full border border-[#ffd59d]/[0.18] bg-[#ffd59d]/[0.09] px-2.5 py-1 text-xs font-bold leading-none text-[#ffe1b0]/90">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-2">
                    {meme.sources.slice(0, 3).map((source, index) => (
                      <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-2 rounded-[7px] border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/[0.68] transition duration-200 hover:border-[#ffd59d]/30 hover:bg-[#ffd59d]/[0.1] hover:text-[#fff6e8]">
                        <span className="truncate">{getSourceLabel(source, index)}</span>
                        <FiExternalLink className="h-3.5 w-3.5 shrink-0 text-[#ffd59d]/70" />
                      </a>
                    ))}
                    {meme.sources.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMeme(meme)}
                        className="inline-flex w-max items-center gap-1.5 text-xs font-bold text-[#ffd59d]/70 transition hover:text-[#fff6e8]"
                      >
                        +{meme.sources.length - 3} more sources
                        <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-x-5 bottom-2 h-px origin-left scale-x-0 bg-[#ffd59d]/95 shadow-[0_0_14px_rgba(255,213,157,0.42)] transition duration-300 group-hover:scale-x-100" />
              </article>
            ))}
          </div>
        )}
        </section>

        {selectedMeme && (
          <div
            className="fixed inset-0 z-[70] grid place-items-center bg-[#05070a]/80 px-4 py-6 backdrop-blur-[10px]"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedMeme.name} sources`}
            onClick={() => setSelectedMeme(null)}
          >
            <div
              className="relative grid max-h-[min(760px,calc(100vh-3rem))] w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[12px] border border-white/[0.14] bg-[linear-gradient(135deg,rgba(15,17,20,0.96),rgba(34,27,22,0.94))] text-white shadow-[0_32px_90px_rgba(0,0,0,0.46)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#ffd59d]/[0.09] blur-3xl" />
              <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-bold uppercase leading-none tracking-[0.18em] text-[#ffd59d]/70">All sources</p>
                  <h2 className="mt-2 truncate text-lg font-[780] leading-6 text-white/95">{selectedMeme.name}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-white/42">{selectedMeme.sources.length} source links</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMeme(null)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-white/[0.07] text-white/62 transition hover:border-[#ffd59d]/30 hover:bg-[#ffd59d]/[0.1] hover:text-white"
                  aria-label="Close sources"
                  title="Close"
                >
                  <FiX className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="relative min-h-0 overflow-y-auto p-4 [scrollbar-color:rgba(255,213,157,0.45)_rgba(255,255,255,0.06)] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#ffd59d]/40 [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar]:w-2">
                <div className="grid gap-2">
                  {selectedMeme.sources.map((source, index) => (
                    <a
                      key={`${source.url}-${index}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="grid min-h-11 grid-cols-[2.4rem_minmax(0,1fr)_1rem] items-center gap-3 rounded-[8px] border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/[0.74] transition hover:border-[#ffd59d]/30 hover:bg-[#ffd59d]/[0.1] hover:text-[#fff6e8]"
                    >
                      <span className="text-xs font-bold tabular-nums text-[#ffd59d]/60">{String(index + 1).padStart(2, '0')}</span>
                      <span className="min-w-0 truncate">{getSourceLabel(source, index)}</span>
                      <FiExternalLink className="h-4 w-4 text-[#ffd59d]/70" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
};

export default Memes;
