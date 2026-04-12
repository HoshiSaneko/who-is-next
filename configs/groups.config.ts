export interface GroupTeam {
    name: string;
    members: string[];
}

export interface GroupConfig {
    id: string;
    season: string;
    teams: GroupTeam[];
    winner: string[];
    isPlaceholder?: boolean;
    isPersonal?: boolean;
}

export const GROUPS_CONFIG: GroupConfig[] = [
    {
        id: 's1',
        season: '第一季',
        teams: [],
        winner: ['力元君', '雨哥到处跑'],
        isPersonal: true
    },
    {
        id: 's2',
        season: '第二季',
        teams: [
            { name: '', members: ['雨哥到处跑', '徐大虾咯'] },
            { name: '', members: ['在下哲别', '啊吗粽'] },
            { name: '', members: ['力元君', '自来卷三木'] }
        ],
        winner: ['徐大虾咯', '雨哥到处跑']
    },
    {
        id: 's3',
        season: '第三季',
        teams: [
            { name: '粉队', members: ['力元君', '在下哲别'] },
            { name: '黄队', members: ['雨哥到处跑', '啊吗粽'] },
            { name: '怪队', members: ['徐大虾咯', '自来卷三木'] }
        ],
        winner: ['力元君', '在下哲别']
    },
    {
        id: 's4',
        season: '第四季',
        teams: [
            { name: '机械狗', members: ['力元君', '徐大虾咯'] },
            { name: '哼哈二将', members: ['雨哥到处跑', '自来卷三木'] },
            { name: '父子组', members: ['啊吗粽', '在下哲别'] }
        ],
        winner: ['力元君', '徐大虾咯']
    },
    {
        id: 's5',
        season: '第五季',
        teams: [
            { name: '老当益壮组', members: ['啊吗粽', '力元君'] },
            { name: '小鲜肉组', members: ['徐大虾咯', '在下哲别'] },
            { name: '冠军组', members: ['雨哥到处跑', '自来卷三木'] }
        ],
        winner: ['冠军组']
    },
    {
        id: 's6',
        season: '第六季',
        teams: [
            { name: '黑白双煞', members: ['雨哥到处跑', '力元君'] },
            { name: 'Double J', members: ['啊吗粽', '自来卷三木'] },
            { name: '虾哲腾', members: ['在下哲别', '徐大虾咯'] }
        ],
        winner: ['Double J']
    }
];

