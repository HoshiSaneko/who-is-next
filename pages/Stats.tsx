import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GAMES_CONFIG } from '../configs/games.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';
import { useBiliData } from '../hooks/useBiliData';
import { SEASON_EPISODES_CONFIG } from '../configs/seasonEpisodes.config';
import { GROUPS_CONFIG } from '../configs/groups.config';

// 图表队伍颜色配置
const TEAM_COLORS = ['#88B090', '#D4AF37', '#409EFF', '#E64340', '#9932CC'];

// 格式化数字函数（添加千位分隔符，保留完整数值）
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

const Stats: React.FC = () => {
  const biliData = useBiliData();

  const { totalPlay, totalLike, totalCoin, totalFav, latestUpdateTime } = useMemo(() => {
    let play = 0, like = 0, coin = 0, fav = 0;
    let latestTime = '';
    if (biliData?.data?.co_creation) {
      // 提取配置中所有的 BVID
      const configuredBvids = new Set(SEASON_EPISODES_CONFIG.map(ep => ep.bvid));

      // 遍历 biliData 的数据，并且只统计在 SEASON_EPISODES_CONFIG 中存在的视频
      Object.entries(biliData.data.co_creation).forEach(([bvid, video]: [string, any]) => {
        if (configuredBvids.has(bvid)) {
          play += video.play || 0;
          like += video.like || 0;
          coin += video.coin || 0;
          fav += video.favorite || 0;
          
          if (video.update_time && (!latestTime || video.update_time > latestTime)) {
            latestTime = video.update_time;
          }
        }
      });
    }
    return { totalPlay: play, totalLike: like, totalCoin: coin, totalFav: fav, latestUpdateTime: latestTime };
  }, [biliData]);

  const { singleClearStats, giveUpStats, seasonClearStats, groupProgressStats, levelDifficultyStats } = useMemo(() => {
    const singleClearCounts: Record<string, number> = {};
    const giveUpCounts: Record<string, number> = {};
    const seasonClearCounts: Record<string, number> = {};

    const baseMembers = UP_MEMBERS_CONFIG.map(m => m.name);
    
    // 初始化基础成员
    baseMembers.forEach(name => {
      singleClearCounts[name] = 0;
      giveUpCounts[name] = 0;
      seasonClearCounts[name] = 0;
    });

    // 统计单关和放弃
    GAMES_CONFIG.forEach(game => {
      if (game.levelChampion) {
        const champs = game.levelChampion.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean);
        champs.forEach(champ => {
          if (champ !== '无') {
            singleClearCounts[champ] = (singleClearCounts[champ] || 0) + 1;
          }
        });
      }

      if (game.giveUp) {
        const givers = game.giveUp.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean);
        givers.forEach(giver => {
          if (giver !== '无') {
            giveUpCounts[giver] = (giveUpCounts[giver] || 0) + 1;
          }
        });
      }
    });

    // 统计单季通关王（每季最后一关的通关者）
    const seasons = Array.from(new Set(GAMES_CONFIG.map(g => g.season)));
    seasons.forEach(season => {
      const seasonGames = GAMES_CONFIG.filter(g => g.season === season);
      if (seasonGames.length > 0) {
        const finalGame = seasonGames[seasonGames.length - 1];
        if (finalGame.levelChampion) {
          const champs = finalGame.levelChampion.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean);
          champs.forEach(champ => {
            if (champ !== '无') {
              seasonClearCounts[champ] = (seasonClearCounts[champ] || 0) + 1;
            }
          });
        }
      }
    });

    const formatSort = (counts: Record<string, number>) => {
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    };

    // --- 新增：统计每季每关每组的进度 ---
    // 为了优化性能，如果 targetSeasons 没有变化，尽量不要重复创建大对象
    const progressStats: Record<number, { seasonNum: number, seasonName: string, chartData: any[], teams: { name: string, avatars: string[] }[] }> = {};
    
    // 我们只关心第2季及之后，且是有组队配置的
    const targetSeasons = GROUPS_CONFIG.filter(s => parseInt(s.id.replace('s', '')) >= 2 && !s.isPersonal && !s.isPlaceholder);
    
    // 辅助函数：通过名字获取头像
    const getAvatarByName = (name: string) => {
      const member = UP_MEMBERS_CONFIG.find(m => m.name === name);
      return member ? member.avatar : null;
    };

    const levelDifficultyStats = {
      threeTeams: [] as any[],
      twoTeams: [] as any[],
      oneTeam: [] as any[]
    };

    targetSeasons.forEach(seasonConfig => {
      const seasonNum = parseInt(seasonConfig.id.replace('s', ''));
      const seasonGames = GAMES_CONFIG.filter(g => g.season === seasonNum && g.levelName);
      
      // 记录每个队伍的累积通关数
      const teamScores: Record<string, number> = {};
      seasonConfig.teams.forEach((t, i) => {
        teamScores[t.name || `GROUP ${i + 1}`] = 0;
      });

      const chartData = seasonGames.map((game, gameIndex) => {
        const dataPoint: any = {
          name: game.id, // X轴短显示直接使用真实的关卡ID（如 g-001）
          fullLabel: `${game.id} ${game.levelName}`, // Tooltip 完整显示
          isGiveUp: false,
          giveUpTeams: [] as string[]
        };

        // 检查放弃
        const giveUpMembers = game.giveUp ? game.giveUp.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean) : [];
        let teamsGivenUpCount = 0;

        // 优化：只有当队伍在前三名时，才把头像数据放进去，如果没名次，就不存头像，减少内存占用
        seasonConfig.teams.forEach((team, tIdx) => {
          const teamName = team.name || `GROUP ${tIdx + 1}`;
          
          // 如果某队的成员放弃了这关，给一个特殊标记
          const hasGivenUp = team.members.some(m => giveUpMembers.includes(m));
          if (hasGivenUp) {
            teamsGivenUpCount++;
            dataPoint.isGiveUp = true;
            dataPoint.giveUpTeams.push(teamName);
            dataPoint[teamName] = null; // 放弃不给排名数据
            
            const teamAvatars = team.members.map(m => getAvatarByName(m)).filter(Boolean);
            dataPoint[`${teamName}_avatars`] = teamAvatars;
            return;
          }

          // 寻找该队的最高名次 (1=冠军, 2=亚军, 3=季军)
          let teamRank = null;
          
          const champs = game.levelChampion ? game.levelChampion.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean) : [];
          const runners = game.levelRunnerUp ? game.levelRunnerUp.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean) : [];
          const thirds = game.levelThirdPlace ? game.levelThirdPlace.split(/[,，、&&]+/).map(s => s.trim()).filter(Boolean) : [];

          if (team.members.some(m => champs.includes(m))) {
            teamRank = 1; // 冠军
          } else if (team.members.some(m => runners.includes(m))) {
            teamRank = 2;
          } else if (team.members.some(m => thirds.includes(m))) {
            teamRank = 3;
          } else {
             // 如果没过关，或者不在前三，图表里就不连线，或者给一个空值
             teamRank = null;
          }

          dataPoint[teamName] = teamRank;
          
          // 将头像数据也存入，供 Tooltip 使用 (优化：仅当有名次或者放弃时才存头像，避免无用数据)
          if (teamRank !== null) {
            const teamAvatars = team.members.map(m => getAvatarByName(m)).filter(Boolean);
            dataPoint[`${teamName}_avatars`] = teamAvatars;
          }
        });

        // 统计关卡难度
        if (teamsGivenUpCount >= 3) {
          levelDifficultyStats.threeTeams.push(game);
        } else if (teamsGivenUpCount === 2) {
          levelDifficultyStats.twoTeams.push(game);
        } else if (teamsGivenUpCount === 1) {
          levelDifficultyStats.oneTeam.push(game);
        }

        return dataPoint;
      });

      // 起点不再需要
      // const startPoint: any = {
      //   name: '00',
      //   fullLabel: '起点',
      // };
      // seasonConfig.teams.forEach((t, i) => {
      //   const teamName = t.name || `GROUP ${i + 1}`;
      //   startPoint[teamName] = 0;
      //   
      //   // 将头像数据也存入起点，供 Tooltip 使用
      //   const teamAvatars = t.members.map(m => getAvatarByName(m)).filter(Boolean);
      //   startPoint[`${teamName}_avatars`] = teamAvatars;
      // });
      // chartData.unshift(startPoint);

      progressStats[seasonNum] = {
        seasonNum,
        seasonName: seasonConfig.season,
        chartData,
        teams: seasonConfig.teams.map((t, i) => {
          const teamName = t.name || `GROUP ${i + 1}`;
          const teamAvatars = t.members.map(m => getAvatarByName(m)).filter(Boolean);
          return { name: teamName, avatars: teamAvatars };
        })
      };
    });

    return {
      singleClearStats: formatSort(singleClearCounts),
      giveUpStats: formatSort(giveUpCounts),
      seasonClearStats: formatSort(seasonClearCounts),
      groupProgressStats: Object.values(progressStats).sort((a, b) => a.seasonNum - b.seasonNum),
      levelDifficultyStats
    };
  }, []);

  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-8 mt-4">
        {payload.map((entry: any, index: number) => {
          const teamInfo = entry.payload.teams.find((t: any) => t.name === entry.value);
          return (
            <div 
              key={`item-${index}`} 
              className="flex items-center gap-3 group cursor-pointer transition-opacity" 
              onClick={() => props.onLegendClick && props.onLegendClick(entry.value)}
              onMouseEnter={entry.onMouseEnter} 
              onMouseLeave={entry.onMouseLeave}
              style={{ opacity: entry.payload.hiddenTeams?.includes(entry.value) ? 0.3 : 1 }}
            >
              {/* 颜色标识点 */}
              <div 
                className="w-3 h-3 rounded-full shrink-0" 
                style={{ backgroundColor: entry.color }}
              ></div>
              
              {/* 队伍头像 */}
              {teamInfo && teamInfo.avatars && teamInfo.avatars.length > 0 && (
                <div className="flex -space-x-1.5 mr-1">
                  {teamInfo.avatars.map((avatar: string, aIdx: number) => (
                    <img 
                      key={aIdx}
                      src={avatar} 
                      alt="" 
                      className="w-6 h-6 rounded-full border border-white object-cover shadow-sm group-hover:scale-110 transition-transform"
                      style={{ zIndex: teamInfo.avatars.length - aIdx }}
                    />
                  ))}
                </div>
              )}
              
              <span className="text-sm font-medium text-[#555555] tracking-widest group-hover:text-[#333333] transition-colors">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const [hiddenTeamsBySeason, setHiddenTeamsBySeason] = useState<Record<number, string[]>>({});
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number | null>(null);
  
  const defaultSeasonNum = groupProgressStats.length > 0 ? groupProgressStats[groupProgressStats.length - 1].seasonNum : null;
  const activeSeasonNum = selectedSeasonNum !== null ? selectedSeasonNum : defaultSeasonNum;
  const activeSeason = groupProgressStats.find(s => s.seasonNum === activeSeasonNum);

  const toggleTeamVisibility = (seasonNum: number, teamName: string) => {
    setHiddenTeamsBySeason(prev => {
      const hiddenTeams = prev[seasonNum] || [];
      if (hiddenTeams.includes(teamName)) {
        return { ...prev, [seasonNum]: hiddenTeams.filter(t => t !== teamName) };
      } else {
        return { ...prev, [seasonNum]: [...hiddenTeams, teamName] };
      }
    });
  };

  const renderCustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      // payload[0].payload 里包含了当前数据点的所有信息，比如 fullLabel
      const dataPoint = payload[0].payload;
      
      // 我们需要从外部传入 teams 配置，由于 recharts 的限制，我们可以通过组件闭包或者直接从 payload 里找线索
      // 这里对排名进行排序：数值越小（1）排名越靠前
      const sortedPayload = [...payload].sort((a, b) => a.value - b.value);

      return (
        <div className="bg-white/95 backdrop-blur-sm border border-[#E5E5E5] rounded-xl shadow-lg p-4 min-w-[200px]">
          <p className="text-[#333333] font-medium tracking-widest mb-3 border-b border-[#F0F0F0] pb-2">
            {dataPoint.fullLabel || label}
          </p>
          <div className="flex flex-col gap-3">
            {sortedPayload.map((entry: any, index: number) => {
              // 从 entry.payload 中尝试获取这支队伍的头像
              const avatars = entry.payload[`${entry.name}_avatars`] || [];
              
              let rankText = '';
              let rankStyle = '';
              if (entry.value === 1) {
                rankText = '冠军';
                rankStyle = 'text-[#D4AF37] bg-[#D4AF37]/10'; // 金色
              } else if (entry.value === 2) {
                rankText = '亚军';
                rankStyle = 'text-[#A0B2C6] bg-[#A0B2C6]/10'; // 银灰色
              } else if (entry.value === 3) {
                rankText = '季军';
                rankStyle = 'text-[#CD7F32] bg-[#CD7F32]/10'; // 古铜色
              } else {
                rankText = `第${entry.value}名`;
                rankStyle = 'text-[#333333] bg-[#F5F5F5]'; // 默认灰色
              }
              
              return (
                <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    {avatars.length > 0 ? (
                      <div className="flex -space-x-1.5 mr-1">
                        {avatars.map((avatar: string, aIdx: number) => (
                          <img 
                            key={aIdx}
                            src={avatar} 
                            alt="" 
                            className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm"
                            style={{ zIndex: avatars.length - aIdx }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-[#555555] tracking-widest">{entry.name}</span>
                    )}
                  </div>
                  <span className={`text-sm font-mono font-medium px-2 py-0.5 rounded-md ${rankStyle}`}>
                    {rankText}
                  </span>
                </div>
              );
            })}

            {/* 如果这关有人放弃，补充显示 */}
            {dataPoint.isGiveUp && dataPoint.giveUpTeams.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#F0F0F0] flex flex-col gap-2">
                {dataPoint.giveUpTeams.map((teamName: string, idx: number) => {
                  const avatars = dataPoint[`${teamName}_avatars`] || [];
                  return (
                    <div key={`giveup-${idx}`} className="flex items-center justify-between gap-4 opacity-60">
                       <div className="flex items-center gap-2">
                         <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#CCCCCC]"></div>
                         {avatars.length > 0 ? (
                           <div className="flex -space-x-1.5 mr-1 grayscale">
                             {avatars.map((avatar: string, aIdx: number) => (
                               <img 
                                 key={aIdx}
                                 src={avatar} 
                                 alt="" 
                                 className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm"
                                 style={{ zIndex: avatars.length - aIdx }}
                               />
                             ))}
                           </div>
                         ) : (
                           <span className="text-sm text-[#555555] tracking-widest line-through">{teamName}</span>
                         )}
                       </div>
                       <span className="text-xs font-mono font-medium text-[#999999] bg-[#F5F5F5] px-2 py-0.5 rounded-md">
                         放弃
                       </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const [activeRankTab, setActiveRankTab] = useState<'clear' | 'giveup' | 'season'>('clear');

  const renderRankTabs = () => {
    return (
      <div className="flex flex-col mb-24 md:mb-32">
        {/* 标题和 极简 Tab 切换区域 */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#F5F5F5] pb-6">
          <div>
            <h2 className="text-2xl font-light tracking-[0.2em] text-[#333333] mb-3">
              {activeRankTab === 'clear' ? '单关通关王' : activeRankTab === 'giveup' ? '单关放弃王' : '单季通关王'}
            </h2>
            <p className="text-xs text-[#999999] tracking-[0.2em] font-mono uppercase">
              {activeRankTab === 'clear' ? 'LEVEL CHAMPIONS' : activeRankTab === 'giveup' ? 'GIVE UP KINGS' : 'SEASON CHAMPIONS'}
            </p>
          </div>
          
          <div className="flex gap-6 md:gap-10">
            <button 
              onClick={() => setActiveRankTab('clear')}
              className={`pb-2 text-sm tracking-widest transition-all duration-500 border-b ${activeRankTab === 'clear' ? 'border-[#333333] text-[#333333]' : 'border-transparent text-[#999999] hover:text-[#555555]'}`}
            >
              单关通关
            </button>
            <button 
              onClick={() => setActiveRankTab('giveup')}
              className={`pb-2 text-sm tracking-widest transition-all duration-500 border-b ${activeRankTab === 'giveup' ? 'border-[#333333] text-[#333333]' : 'border-transparent text-[#999999] hover:text-[#555555]'}`}
            >
              单关放弃
            </button>
            <button 
              onClick={() => setActiveRankTab('season')}
              className={`pb-2 text-sm tracking-widest transition-all duration-500 border-b ${activeRankTab === 'season' ? 'border-[#333333] text-[#333333]' : 'border-transparent text-[#999999] hover:text-[#555555]'}`}
            >
              单季通关
            </button>
          </div>
        </div>

        {/* 内容区域：极简垂直列表 */}
        <div className="flex flex-col w-full animate-fade-in">
          {(activeRankTab === 'clear' ? singleClearStats : activeRankTab === 'giveup' ? giveUpStats : seasonClearStats).map((stat, idx) => {
            const member = UP_MEMBERS_CONFIG.find(m => m.name === stat.name);
            const rankColor = idx === 0 ? 'text-[#88B090]' : 
                              idx === 1 ? 'text-[#A0B2C6]' : 
                              idx === 2 ? 'text-[#CD7F32]' : 
                              'text-[#E0E0E0]';
            
            return (
              <div key={`${activeRankTab}-${stat.name}`} className="flex items-center py-6 border-b border-[#F5F5F5] group hover:border-[#E0E0E0] transition-colors duration-500 cursor-default">
                {/* 排名数字 */}
                <div className={`w-16 md:w-24 text-2xl md:text-4xl font-light font-mono ${rankColor} opacity-40 group-hover:opacity-100 transition-opacity duration-500`}>
                  {String(idx + 1).padStart(2, '0')}.
                </div>
                
                {/* 头像 */}
                {member ? (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 mr-6 md:mr-10 opacity-90 group-hover:opacity-100 transition-all duration-500">
                    <img src={member.avatar} alt={stat.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#F5F5F5] mr-6 md:mr-10 shrink-0" />
                )}
                
                {/* 名字 */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-base md:text-lg tracking-[0.3em] font-light text-[#555555] group-hover:text-[#111111] transition-all duration-500 transform group-hover:translate-x-2 truncate">
                    {stat.name}
                  </h3>
                </div>
                
                {/* 次数 */}
                <div className="flex items-baseline gap-2 shrink-0 ml-4">
                  <span className="text-2xl md:text-3xl font-mono font-light text-[#333333] opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    {stat.count}
                  </span>
                  <span className="text-[10px] md:text-xs tracking-widest text-[#999999] uppercase font-mono">
                    {activeRankTab === 'giveup' ? 'Times' : 'Clears'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4 md:pt-8 pb-12 animate-fade-in flex flex-col flex-1 h-full min-h-0 overflow-y-auto relative">
      
      {/* 顶部数据汇总模块 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 relative">
        {/* 数据更新时间 */}
        {latestUpdateTime && (
          <div className="absolute -bottom-8 right-0 text-[10px] text-[#999999] opacity-60 font-mono flex items-center transition-opacity duration-500 hover:opacity-100 cursor-default">
            <span className="font-sans mr-1 tracking-normal">数据截止至</span>
            {latestUpdateTime}
          </div>
        )}
        
        {/* 总播放模块 */}
        <div className="bg-[#F5F5F5] rounded-xl p-8 shadow-sm border border-[#E0E0E0]/50 flex flex-col justify-between group hover:border-[#88B090] transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm tracking-widest font-medium text-[#555555]">全系列总播放量</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#88B090] shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 4.040041666666666C7.897383333333334 4.040041666666666 6.061606666666667 4.147 4.765636666666667 4.252088333333334C3.806826666666667 4.32984 3.061106666666667 5.0637316666666665 2.9755000000000003 6.015921666666667C2.8803183333333333 7.074671666666667 2.791666666666667 8.471183333333332 2.791666666666667 9.998333333333333C2.791666666666667 11.525566666666668 2.8803183333333333 12.922083333333333 2.9755000000000003 13.9808C3.061106666666667 14.932983333333334 3.806826666666667 15.666916666666667 4.765636666666667 15.744683333333336C6.061611666666668 15.849716666666666 7.897383333333334 15.956666666666667 10 15.956666666666667C12.10285 15.956666666666667 13.93871666666667 15.849716666666666 15.234766666666667 15.74461666666667C16.193416666666668 15.66685 16.939000000000004 14.933216666666667 17.024583333333336 13.981216666666668C17.11975 12.922916666666667 17.208333333333332 11.526666666666666 17.208333333333332 9.998333333333333C17.208333333333332 8.470083333333333 17.11975 7.073818333333334 17.024583333333336 6.015513333333334C16.939000000000004 5.063538333333333 16.193416666666668 4.329865000000001 15.234766666666667 4.252118333333334C13.93871666666667 4.147016666666667 12.10285 4.040041666666666 10 4.040041666666666zM4.684808333333334 3.255365C6.001155 3.14862 7.864583333333334 3.0400416666666668 10 3.0400416666666668C12.13565 3.0400416666666668 13.999199999999998 3.148636666666667 15.315566666666667 3.2553900000000002C16.753416666666666 3.3720016666666672 17.890833333333333 4.483195 18.020583333333335 5.925965000000001C18.11766666666667 7.005906666666667 18.208333333333336 8.433 18.208333333333336 9.998333333333333C18.208333333333336 11.56375 18.11766666666667 12.990833333333335 18.020583333333335 14.0708C17.890833333333333 15.513533333333331 16.753416666666666 16.624733333333335 15.315566666666667 16.74138333333333C13.999199999999998 16.848116666666666 12.13565 16.95666666666667 10 16.95666666666667C7.864583333333334 16.95666666666667 6.001155 16.848116666666666 4.684808333333334 16.7414C3.2467266666666665 16.624750000000002 2.1092383333333338 15.513266666666667 1.9795200000000002 14.070383333333334C1.8823900000000002 12.990000000000002 1.7916666666666667 11.562683333333334 1.7916666666666667 9.998333333333333C1.7916666666666667 8.434066666666666 1.8823900000000002 7.00672 1.9795200000000002 5.926381666666667C2.1092383333333338 4.483463333333334 3.2467266666666665 3.371976666666667 4.684808333333334 3.255365z"></path>
                <path d="M12.23275 9.1962C12.851516666666667 9.553483333333332 12.851516666666667 10.44665 12.232683333333332 10.803866666666666L9.57975 12.335600000000001C8.960983333333335 12.692816666666667 8.1875 12.246250000000002 8.187503333333334 11.531733333333333L8.187503333333334 8.4684C8.187503333333334 7.753871666666667 8.960983333333335 7.307296666666667 9.57975 7.66456L12.23275 9.1962z"></path>
              </svg>
            </div>
          </div>
          <span className="text-4xl md:text-5xl font-mono text-[#333333] tracking-tight">{formatNumber(totalPlay)}</span>
        </div>
        
        {/* 总点赞模块 */}
        <div className="bg-[#F5F5F5] rounded-xl p-8 shadow-sm border border-[#E0E0E0]/50 flex flex-col justify-between group hover:border-[#88B090] transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm tracking-widest font-medium text-[#555555]">全系列总点赞数</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#88B090] shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" viewBox="0 0 36 36" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.77234 30.8573V11.7471H7.54573C5.50932 11.7471 3.85742 13.3931 3.85742 15.425V27.1794C3.85742 29.2112 5.50932 30.8573 7.54573 30.8573H9.77234ZM11.9902 30.8573V11.7054C14.9897 10.627 16.6942 7.8853 17.1055 3.33591C17.2666 1.55463 18.9633 0.814421 20.5803 1.59505C22.1847 2.36964 23.243 4.32583 23.243 6.93947C23.243 8.50265 23.0478 10.1054 22.6582 11.7471H29.7324C31.7739 11.7471 33.4289 13.402 33.4289 15.4435C33.4289 15.7416 33.3928 16.0386 33.3215 16.328L30.9883 25.7957C30.2558 28.7683 27.5894 30.8573 24.528 30.8573H11.9911H11.9902Z"></path>
              </svg>
            </div>
          </div>
          <span className="text-4xl md:text-5xl font-mono text-[#333333] tracking-tight">{formatNumber(totalLike)}</span>
        </div>

        {/* 总投币模块 */}
        <div className="bg-[#F5F5F5] rounded-xl p-8 shadow-sm border border-[#E0E0E0]/50 flex flex-col justify-between group hover:border-[#88B090] transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm tracking-widest font-medium text-[#555555]">全系列总投币数</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#88B090] shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" viewBox="0 0 28 28" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M14.045 25.5454C7.69377 25.5454 2.54504 20.3967 2.54504 14.0454C2.54504 7.69413 7.69377 2.54541 14.045 2.54541C20.3963 2.54541 25.545 7.69413 25.545 14.0454C25.545 17.0954 24.3334 20.0205 22.1768 22.1771C20.0201 24.3338 17.095 25.5454 14.045 25.5454ZM9.66202 6.81624H18.2761C18.825 6.81624 19.27 7.22183 19.27 7.72216C19.27 8.22248 18.825 8.62807 18.2761 8.62807H14.95V10.2903C17.989 10.4444 20.3766 12.9487 20.3855 15.9916V17.1995C20.3854 17.6997 19.9799 18.1052 19.4796 18.1052C18.9793 18.1052 18.5738 17.6997 18.5737 17.1995V15.9916C18.5667 13.9478 16.9882 12.2535 14.95 12.1022V20.5574C14.95 21.0577 14.5444 21.4633 14.0441 21.4633C13.5437 21.4633 13.1382 21.0577 13.1382 20.5574V12.1022C11.1 12.2535 9.52148 13.9478 9.51448 15.9916V17.1995C9.5144 17.6997 9.10883 18.1052 8.60856 18.1052C8.1083 18.1052 7.70273 17.6997 7.70265 17.1995V15.9916C7.71158 12.9487 10.0992 10.4444 13.1382 10.2903V8.62807H9.66202C9.11309 8.62807 8.66809 8.22248 8.66809 7.72216C8.66809 7.22183 9.11309 6.81624 9.66202 6.81624Z"></path>
              </svg>
            </div>
          </div>
          <span className="text-4xl md:text-5xl font-mono text-[#333333] tracking-tight">{formatNumber(totalCoin)}</span>
        </div>

        {/* 总收藏模块 */}
        <div className="bg-[#F5F5F5] rounded-xl p-8 shadow-sm border border-[#E0E0E0]/50 flex flex-col justify-between group hover:border-[#88B090] transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm tracking-widest font-medium text-[#555555]">全系列总收藏数</span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#88B090] shadow-sm group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" viewBox="0 0 28 28" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M19.8071 9.26152C18.7438 9.09915 17.7624 8.36846 17.3534 7.39421L15.4723 3.4972C14.8998 2.1982 13.1004 2.1982 12.4461 3.4972L10.6468 7.39421C10.1561 8.36846 9.25639 9.09915 8.19315 9.26152L3.94016 9.91102C2.63155 10.0734 2.05904 11.6972 3.04049 12.6714L6.23023 15.9189C6.96632 16.6496 7.29348 17.705 7.1299 18.7605L6.39381 23.307C6.14844 24.6872 7.62063 25.6614 8.84745 25.0119L12.4461 23.0634C13.4276 22.4951 14.6544 22.4951 15.6359 23.0634L19.2345 25.0119C20.4614 25.6614 21.8518 24.6872 21.6882 23.307L20.8703 18.7605C20.7051 17.705 21.0339 16.6496 21.77 15.9189L24.9597 12.6714C25.9412 11.6972 25.3687 10.0734 24.06 9.91102L19.8071 9.26152Z"></path>
              </svg>
            </div>
          </div>
          <span className="text-4xl md:text-5xl font-mono text-[#333333] tracking-tight">{formatNumber(totalFav)}</span>
        </div>
      </div>

      <div className="flex flex-col mt-8 md:mt-16">
        {/* 各赛季分组闯关进度 - 移至最上方 */}
        <div className="flex flex-col mb-24 md:mb-32 items-start border-b border-[#F5F5F5] pb-24">
          <div className="mb-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-light tracking-[0.2em] text-[#333333] mb-3">各赛季闯关进度</h2>
              <p className="text-xs text-[#999999] tracking-[0.2em] font-mono uppercase">SEASON PROGRESS</p>
              <div className="w-6 h-[1px] bg-[#88B090] mt-6"></div>
            </div>
            
            {/* 赛季选择器 */}
            <div className="flex flex-wrap gap-3">
              {groupProgressStats.map(s => (
                <button
                  key={s.seasonNum}
                  onClick={() => setSelectedSeasonNum(s.seasonNum)}
                  className={`px-5 py-2 rounded-full text-sm font-medium tracking-widest transition-all duration-300 ${
                    activeSeasonNum === s.seasonNum 
                      ? 'bg-[#88B090] text-white shadow-md shadow-[#88B090]/20' 
                      : 'bg-[#F5F5F5] text-[#777777] hover:bg-[#EAEAEA]'
                  }`}
                >
                  {s.seasonName}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full flex flex-col gap-16">
            {activeSeason && (
              <div key={activeSeason.seasonNum} className="flex flex-col gap-6 animate-fade-in">
                {/* 进度图表容器 */}
                <div className="w-full h-[400px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activeSeason.chartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#999999', fontSize: 12, fontFamily: 'monospace' }}
                        dy={10}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: '#999999', fontSize: 12, fontFamily: 'monospace' }}
                        dx={-10}
                        reversed={true}
                        domain={[1, 3]}
                        ticks={[1, 2, 3]}
                        tickFormatter={(val) => {
                          if (val === 1) return '1st';
                          if (val === 2) return '2nd';
                          if (val === 3) return '3rd';
                          return '';
                        }}
                      />
                      <Tooltip content={renderCustomTooltip} />
                      <Legend 
                        content={(props) => renderCustomLegend({ 
                          ...props, 
                          payload: props.payload?.map(p => ({ 
                            ...p, 
                            payload: { 
                              teams: activeSeason.teams,
                              hiddenTeams: hiddenTeamsBySeason[activeSeason.seasonNum] || []
                            } 
                          })),
                          onLegendClick: (teamName: string) => toggleTeamVisibility(activeSeason.seasonNum, teamName)
                        })}
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      {activeSeason.teams.map((team: any, idx: number) => {
                        const isHidden = (hiddenTeamsBySeason[activeSeason.seasonNum] || []).includes(team.name);
                        return (
                          <Line
                            key={team.name}
                            type="monotone"
                            dataKey={team.name}
                            stroke={TEAM_COLORS[idx % TEAM_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 2.5, strokeWidth: 1.5, fill: '#fff' }}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            animationDuration={1500}
                            connectNulls={true}
                            hide={isHidden}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 关卡难易度统计 */}
        <div className="flex flex-col mb-24 md:mb-32 items-start border-b border-[#F5F5F5] pb-24 last:border-0 last:pb-0">
          <div className="mb-10 w-full">
            <h2 className="text-2xl font-light tracking-[0.2em] text-[#333333] mb-3">关卡难易度统计</h2>
            <p className="text-xs text-[#999999] tracking-[0.2em] font-mono uppercase">LEVEL DIFFICULTY (S2-S6)</p>
            <div className="w-6 h-[1px] bg-[#88B090] mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* 3队全放弃 */}
            <div className="flex flex-col bg-[#F5F5F5] rounded-xl p-6 border border-[#E0E0E0]/50 hover:border-[#E64340] transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#E64340]"></div>
                  <h3 className="text-lg font-medium tracking-[0.1em] text-[#333333]">噩梦级</h3>
                </div>
                <span className="text-[11px] font-sans font-medium tracking-widest text-[#E64340] bg-[#E64340]/10 px-2.5 py-1 rounded-md border border-[#E64340]/20">3队全放弃</span>
              </div>
              <div className="text-4xl font-mono text-[#333333] mb-6">{levelDifficultyStats.threeTeams.length} <span className="text-base text-[#999999] tracking-widest font-sans">关</span></div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {levelDifficultyStats.threeTeams.map((game: any) => (
                  <div key={game.id} className="flex justify-between items-center text-sm border-b border-[#E0E0E0]/50 pb-2 last:border-0">
                    <span className="text-[#555555] truncate mr-2" title={game.levelName}>{game.id} {game.levelName}</span>
                    <span className="text-[#999999] text-xs font-mono shrink-0">S{game.season}</span>
                  </div>
                ))}
                {levelDifficultyStats.threeTeams.length === 0 && <div className="text-sm text-[#999999] italic">无</div>}
              </div>
            </div>

            {/* 2队放弃 */}
            <div className="flex flex-col bg-[#F5F5F5] rounded-xl p-6 border border-[#E0E0E0]/50 hover:border-[#D4AF37] transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#D4AF37]"></div>
                  <h3 className="text-lg font-medium tracking-[0.1em] text-[#333333]">困难级</h3>
                </div>
                <span className="text-[11px] font-sans font-medium tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#D4AF37]/20">2队放弃</span>
              </div>
              <div className="text-4xl font-mono text-[#333333] mb-6">{levelDifficultyStats.twoTeams.length} <span className="text-base text-[#999999] tracking-widest font-sans">关</span></div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {levelDifficultyStats.twoTeams.map((game: any) => (
                  <div key={game.id} className="flex justify-between items-center text-sm border-b border-[#E0E0E0]/50 pb-2 last:border-0">
                    <span className="text-[#555555] truncate mr-2" title={game.levelName}>{game.id} {game.levelName}</span>
                    <span className="text-[#999999] text-xs font-mono shrink-0">S{game.season}</span>
                  </div>
                ))}
                {levelDifficultyStats.twoTeams.length === 0 && <div className="text-sm text-[#999999] italic">无</div>}
              </div>
            </div>

            {/* 1队放弃 */}
            <div className="flex flex-col bg-[#F5F5F5] rounded-xl p-6 border border-[#E0E0E0]/50 hover:border-[#88B090] transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#88B090]"></div>
                  <h3 className="text-lg font-medium tracking-[0.1em] text-[#333333]">挑战级</h3>
                </div>
                <span className="text-[11px] font-sans font-medium tracking-widest text-[#88B090] bg-[#88B090]/10 px-2.5 py-1 rounded-md border border-[#88B090]/20">1队放弃</span>
              </div>
              <div className="text-4xl font-mono text-[#333333] mb-6">{levelDifficultyStats.oneTeam.length} <span className="text-base text-[#999999] tracking-widest font-sans">关</span></div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {levelDifficultyStats.oneTeam.map((game: any) => (
                  <div key={game.id} className="flex justify-between items-center text-sm border-b border-[#E0E0E0]/50 pb-2 last:border-0">
                    <span className="text-[#555555] truncate mr-2" title={game.levelName}>{game.id} {game.levelName}</span>
                    <span className="text-[#999999] text-xs font-mono shrink-0">S{game.season}</span>
                  </div>
                ))}
                {levelDifficultyStats.oneTeam.length === 0 && <div className="text-sm text-[#999999] italic">无</div>}
              </div>
            </div>
          </div>
        </div>

        {renderRankTabs()}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleUp {
          to { transform: scaleY(1); }
        }
        @keyframes scaleIn {
          to { transform: scaleX(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E0E0E0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CCCCCC;
        }
      `}} />
    </div>
  );
};

export default Stats;
