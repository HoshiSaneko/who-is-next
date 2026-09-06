import { describe, expect, it } from 'vitest';
import { getChampionRecords, getCompetitionStats, toLeaderboard } from './competitionStats';

describe('competition statistics', () => {
  it('separates 啊吗粽’s formal and horror-special championships', () => {
    const stats = getCompetitionStats();
    expect(stats.seasonWins['啊吗粽']).toEqual({ regular: 1, special: 1 });
    expect(getChampionRecords().filter((record) => record.names.includes('啊吗粽')))
      .toEqual([
        expect.objectContaining({ source: 'regular', label: '第六季' }),
        expect.objectContaining({ source: 'special', label: '恐怖特辑' }),
      ]);
  });

  it('excludes unfinished seasons and credits each winning teammate once', () => {
    const records = getChampionRecords();
    expect(records.some((record) => record.label === '第七季')).toBe(false);
    expect(records.find((record) => record.label === '恐怖特辑')?.names)
      .toEqual(['力元君', '啊吗粽']);
    for (const record of records) expect(record.names.length).toBe(new Set(record.names).size);
  });

  it('re-ranks the selected source while retaining the complete breakdown', () => {
    const counts = { A: { regular: 3, special: 0 }, B: { regular: 1, special: 4 } };
    expect(toLeaderboard(counts, 'all').map(({ name, count }) => [name, count])).toEqual([['B', 5], ['A', 3]]);
    expect(toLeaderboard(counts, 'regular').map(({ name, count }) => [name, count])).toEqual([['A', 3], ['B', 1]]);
    expect(toLeaderboard(counts, 'special')).toEqual([
      { name: 'B', regular: 1, special: 4, count: 4 },
      { name: 'A', regular: 3, special: 0, count: 0 },
    ]);
  });
});
