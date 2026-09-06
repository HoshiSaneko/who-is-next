import { GAMES_CONFIG, SPECIAL_GAMES_CONFIG } from '../configs/games.config';
import { GROUPS_CONFIG, SPECIAL_GROUPS_CONFIG } from '../configs/groups.config';
import { getSpecialCategoryConfig } from '../configs/specialCategories.config';
import { UP_MEMBERS_CONFIG } from '../configs/upMembers.config';

export type CompetitionScope = 'all' | 'regular' | 'special';
export type CompetitionMetric = 'clears' | 'seasonWins' | 'giveUps';
export type SourceCounts = { regular: number; special: number };
export type ChampionRecord = { source: 'regular' | 'special'; label: string; names: string[] };

const splitNames = (value?: string) => [...new Set(
  (value || '').split(/[,，、&]+/).map((name) => name.trim()).filter((name) => name && name !== '无'),
)];

export const getChampionRecords = (): ChampionRecord[] => [
  ...GROUPS_CONFIG.filter((season) => !season.isPlaceholder && season.winner.length > 0).map((season) => {
    const games = GAMES_CONFIG.filter((game) => game.season === Number(season.id.replace('s', '')));
    return { source: 'regular' as const, label: season.season, names: splitNames(games.at(-1)?.levelChampion) };
  }),
  ...SPECIAL_GROUPS_CONFIG.map((special) => ({
    source: 'special' as const,
    label: getSpecialCategoryConfig(special.specialCategory).label,
    names: [...new Set(special.winner.flatMap((winner) =>
      special.teams.find((team) => team.name === winner)?.members || splitNames(winner),
    ))],
  })),
];

export const getCompetitionStats = () => {
  const stats: Record<CompetitionMetric, Record<string, SourceCounts>> = { clears: {}, seasonWins: {}, giveUps: {} };
  for (const metric of Object.values(stats)) {
    for (const member of UP_MEMBERS_CONFIG) metric[member.name] = { regular: 0, special: 0 };
  }
  const increment = (metric: CompetitionMetric, name: string, source: 'regular' | 'special') => {
    const counts = stats[metric][name] ??= { regular: 0, special: 0 };
    counts[source] += 1;
  };
  for (const source of ['regular', 'special'] as const) {
    for (const game of source === 'regular' ? GAMES_CONFIG : SPECIAL_GAMES_CONFIG) {
      for (const name of splitNames(game.levelChampion)) increment('clears', name, source);
      for (const name of splitNames(game.giveUp)) increment('giveUps', name, source);
    }
  }
  for (const record of getChampionRecords()) {
    for (const name of record.names) increment('seasonWins', name, record.source);
  }
  return stats;
};

export const toLeaderboard = (counts: Record<string, SourceCounts>, scope: CompetitionScope) =>
  Object.entries(counts).map(([name, sources]) => ({
    name,
    ...sources,
    count: scope === 'all' ? sources.regular + sources.special : sources[scope],
  })).sort((a, b) => b.count - a.count);
