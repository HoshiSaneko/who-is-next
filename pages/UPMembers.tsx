import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useEffect } from 'react';
import { FiAward, FiChevronLeft, FiChevronRight, FiExternalLink, FiFilm, FiUsers } from 'react-icons/fi';
import { GAMES_CONFIG } from '../configs/games.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';
import { useBiliData } from '../hooks/useBiliData';
import { PageShell } from '../components/ui';
import { formatCompactNumber } from '../utils/format';
import { BiliData } from '../types';
import { BILI_API_ENDPOINTS } from '../configs/api.config';
import { getWebPUrl } from '../src/config/cdn';

const splitNames = (value?: string) => (value ? value.split(/[,，、&]+/).map((item) => item.trim()).filter(Boolean) : []);
type UpLiveInfo = BiliData['data']['up_info'][string];

const UPMembers: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [profileCollapsed, setProfileCollapsed] = useState(false);
  const [upInfoByUid, setUpInfoByUid] = useState<Record<string, UpLiveInfo>>({});
  const biliData = useBiliData();
  const activeMember = UP_MEMBERS_CONFIG[activeIndex];
  const liveInfo = activeMember.uid ? (upInfoByUid[activeMember.uid] ?? biliData?.data.up_info[activeMember.uid]) : null;

  useEffect(() => {
    if (!activeMember.uid || upInfoByUid[activeMember.uid]) return;

    const controller = new AbortController();

    const fetchUpInfo = async () => {
      try {
        const response = await fetch(BILI_API_ENDPOINTS.upInfo(activeMember.uid!), {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Network response was not ok');

        const payload = await response.json();
        if (payload?.code !== 200 || !payload?.data?.uid) return;

        setUpInfoByUid((current) => ({
          ...current,
          [payload.data.uid]: payload.data,
        }));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching bilibili up info:', error);
        }
      }
    };

    fetchUpInfo();

    return () => controller.abort();
  }, [activeMember.uid, upInfoByUid]);

  const radarData = useMemo(
    () => Object.entries(activeMember.stats || {}).map(([subject, value]) => ({ subject, value, fullMark: 5 })),
    [activeMember],
  );

  const championCount = useMemo(
    () => Array.from(new Set(GAMES_CONFIG.map((game) => game.season))).reduce((count, season) => {
      const seasonGames = GAMES_CONFIG.filter((game) => game.season === season);
      const finalGame = seasonGames[seasonGames.length - 1];
      const champions = splitNames(finalGame?.levelChampion).filter((name) => name !== '无');
      return count + (champions.includes(activeMember.name) ? 1 : 0);
    }, 0),
    [activeMember],
  );

  const visualBackground = activeMember.background || '/images/home-hero-basketball-clarity-2400.webp';
  const pageBackground = activeMember.pageBackground;
  const profileMetrics = [
    { label: 'Fans', value: formatCompactNumber(liveInfo?.fans_count), icon: FiUsers },
    { label: 'Videos', value: formatCompactNumber(liveInfo?.video_count), icon: FiFilm },
    { label: 'Champions', value: championCount, icon: FiAward },
  ];
  const profileNotes = [
    { label: 'Buffs', items: activeMember.buffs || [] },
    { label: 'Debuffs', items: activeMember.debuffs || [] },
  ].filter(({ items }) => items.length > 0);
  const profileMeta = [activeMember.title, activeMember.nickname, activeMember.honor].filter((value): value is string => {
    if (!value) return false;
    const normalizedValue = value.trim().toLowerCase();
    return normalizedValue !== '' && normalizedValue !== '占位' && normalizedValue !== 'placeholder' && normalizedValue !== '-';
  });

  return (
    <div
      className="up-members-page"
      style={pageBackground ? {
        backgroundImage: `url(${getWebPUrl(pageBackground)})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      } : undefined}
    >
      <PageShell className="up-members-shell relative z-10">
        <div className="grid gap-4">
          <div className="up-member-selector-strip">
            {UP_MEMBERS_CONFIG.map((member, index) => {
              const active = index === activeIndex;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`up-member-selector-item ${active ? 'is-active' : ''}`}
                >
                  <span className="up-member-selector-visual" style={{ backgroundImage: `url(${getWebPUrl(member.background || member.avatar)})` }}>
                  </span>
                  <span className="min-w-0">
                    <span className="up-member-selector-name block truncate text-sm font-semibold">{member.name}</span>
                    <span className="up-member-selector-title mt-1 block truncate text-xs">{member.title}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <section className={`up-member-profile-scene ${profileCollapsed ? 'is-profile-collapsed' : ''}`} style={{ backgroundImage: `url(${getWebPUrl(visualBackground)})` }}>
            <button
              type="button"
              className="up-member-profile-toggle"
              onClick={() => setProfileCollapsed((collapsed) => !collapsed)}
              aria-pressed={profileCollapsed}
              aria-label={profileCollapsed ? '展开右侧内容' : '收起右侧内容'}
            >
              {profileCollapsed ? (
                <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
              ) : (
                <FiChevronRight className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <div key={activeMember.id} className="up-member-profile-panel">
              <div className="up-member-profile-header">
                <p className="up-member-profile-kicker">{activeMember.pinyin || activeMember.id}</p>
                <h2 className="up-member-profile-name">{activeMember.name}</h2>
                <div className="up-member-profile-subgrid">
                  <div className="up-member-profile-identity">
                    {profileMeta.length > 0 && (
                      <div className="up-member-profile-meta">
                        {profileMeta.map((item) => <span key={item}>{item}</span>)}
                      </div>
                    )}
                    <p className="up-member-profile-line">
                      {activeMember.slogans?.join(' / ') || 'Profile data is maintained from the local creator configuration.'}
                    </p>
                    {activeMember.uid && (
                      <a
                        href={`https://space.bilibili.com/${activeMember.uid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="up-member-profile-link"
                      >
                        Bilibili Space
                        <FiExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="up-member-profile-metrics">
                {profileMetrics.map(({ label, value, icon: Icon }, index) => (
                  <div
                    key={label}
                    className="up-member-profile-metric"
                    style={{ '--flip-index': index } as React.CSSProperties}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span>{label}</span>
                    <strong className="up-member-flip-value" key={`${activeMember.id}-${label}-${value}`}>
                      <span>{value}</span>
                    </strong>
                  </div>
                ))}
              </div>
              <div className="up-member-profile-insights">
                <div className="up-member-profile-radar">
                  <h3>Ability Radar</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius={activeMember.id === 'amazong' ? '56%' : '68%'}>
                        <PolarGrid stroke="rgba(255,255,255,0.22)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.72)', fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 5]} allowDataOverflow tick={false} axisLine={false} />
                        <Radar name={activeMember.name} dataKey="value" stroke="rgba(255,213,157,0.96)" fill="rgba(255,213,157,0.42)" fillOpacity={0.72} strokeWidth={2.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="up-member-profile-notes">
                  <h3>Profile Notes</h3>
                  {profileNotes.map(({ label, items }) => (
                    <div key={label} className="up-member-note-group">
                      <p>{label}</p>
                      <div>
                        {items.map((item) => <span key={item}>{item}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    </div>
  );
};

export default UPMembers;

