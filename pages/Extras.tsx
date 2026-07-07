import React, { useMemo } from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { EXTRAS_CONFIG } from '../configs/extras.config';
import { PageShell } from '../components/ui';
import { formatDate, getBiliVideoUrl, getCover } from '../utils/format';

const Extras: React.FC = () => {
  const groupedVideos = useMemo(() => {
    const groups: Record<string, typeof EXTRAS_CONFIG> = {};
    EXTRAS_CONFIG.forEach((video) => {
      if (!groups[video.category]) groups[video.category] = [];
      groups[video.category].push(video);
    });
    Object.values(groups).forEach((items) => items.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()));
    return groups;
  }, []);

  const categories = Object.keys(groupedVideos);
  const featuredVideos = useMemo(
    () => [...EXTRAS_CONFIG].sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()).slice(0, 3),
    [],
  );

  return (
    <div className="extras-page">
      <PageShell className="extras-shell relative z-10">
        <section className="extras-overview" aria-label="Extras overview">
          <div className="extras-feature-strip">
            {featuredVideos.map((video, index) => (
              <a
                key={video.bvid}
                href={getBiliVideoUrl(video.bvid)}
                target="_blank"
                rel="noreferrer"
                className="extras-feature-card"
                style={{ '--feature-index': index } as React.CSSProperties}
              >
                <img src={getCover(video.bvid)} alt={video.title} />
                <span>
                  <small>{formatDate(video.date)}</small>
                  <strong>{video.title}</strong>
                </span>
              </a>
            ))}
          </div>
        </section>

        <div className="extras-category-stack">
          {categories.map((category, categoryIndex) => (
            <section className="extras-panel" key={category}>
              <div className="extras-panel-heading">
                <div>
                  <p>{category}</p>
                  <span>{groupedVideos[category].length} videos</span>
                </div>
                <strong>{String(categoryIndex + 1).padStart(2, '0')}</strong>
              </div>

              <div className="extras-card-grid">
                {groupedVideos[category].map((video) => (
                  <a
                    key={video.bvid}
                    href={getBiliVideoUrl(video.bvid)}
                    target="_blank"
                    rel="noreferrer"
                    className="extras-card"
                  >
                    <span className="extras-card-cover">
                      <img src={getCover(video.bvid)} alt={video.title} />
                    </span>
                    <span className="extras-card-body">
                      <span className="extras-card-meta">
                        <span>{formatDate(video.date)}</span>
                        {video.duration && <span>{video.duration}</span>}
                      </span>
                      <strong>{video.title}</strong>
                      <span className="extras-card-foot">
                        <span>{video.bvid}</span>
                        <FiArrowUpRight aria-hidden="true" />
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageShell>
    </div>
  );
};

export default Extras;
