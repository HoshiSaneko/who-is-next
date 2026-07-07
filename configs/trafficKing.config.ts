export interface TrafficKingVideo {
  bvid?: string;
  title: string;
  url?: string;
}

export interface TrafficKingTeam {
  id: string;
  name: string;
  accent: 'gold' | 'teal' | 'red' | 'blue';
  members: string[];
  video: TrafficKingVideo;
}

export interface TrafficKingEpisode {
  id: string;
  episode: number;
  theme: string;
  status: 'draft' | 'live' | 'closed';
  publishAt: string;
  deadlineAt: string;
  teams: [TrafficKingTeam, TrafficKingTeam];
}

export const TRAFFIC_KING_RULE_SUMMARY = '6 人随机分成两组，限时 3 小时围绕同一主题拍摄并剪辑视频。联合投稿发布后，以一周窗口内播放量更高者获胜。';

export const TRAFFIC_KING_EPISODES: TrafficKingEpisode[] = [
  {
    id: 'tk-ep01',
    episode: 1,
    theme: '探店',
    status: 'live',
    publishAt: '2026-07-03 12:00:00',
    deadlineAt: '2026-07-10 12:00:00',
    teams: [
      {
        id: 'team-a',
        name: '红队',
        accent: 'red',
        members: ['徐大虾咯', '自来卷三木', '啊吗粽'],
        video: {
          title: '谁一周后的播放量高，谁就是流量王！！！【流量王01红队】',
          bvid: 'BV1zgTn6rEsh',
        },
      },
      {
        id: 'team-b',
        name: '蓝队',
        accent: 'blue',
        members: ['雨哥到处跑', '力元君', '在下哲别'],
        video: {
          title: '谁一周后的播放量高，谁就是流量王！！！【流量王01蓝队】',
          bvid: 'BV1UUTJ6dErS',
        },
      },
    ],
  },
];
