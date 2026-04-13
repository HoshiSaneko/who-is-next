import { UpMember } from '../types';

export const UP_MEMBERS_CONFIG: UpMember[] = [
    {
        id: 'amazong',
        name: '啊吗粽',
        pinyin: 'A MA ZONG',
        nickname: '雨霁',
        avatar: '/avatars/amazong.jpg',
        title: '名利大王',
        honor: '占位',
        buffs: ['智力提升50%', '被力元君超越后，所有属性提升100%'],
        debuffs: ['其余属性下降50%'],
        slogans: ['你的瑞帝, 开天辟地！'],
        cheerColor: '#C89B00', // 优化后的深金/橘黄色，在浅色背景下更易读
        stats: { 力量: 1.5, 默契: 2, 技巧: 1, 智力:5, 运气: 1, 准度: 1.5},
        uid: '7552204' // 添加 uid 字段用于匹配接口数据
    },
    {
        id: 'liyuanjun',
        name: '力元君',
        pinyin: 'LI YUAN JUN',
        nickname: '青歌',
        avatar: '/avatars/liyuanjun.jpg',
        title: '暗影混子',
        honor: '占位',
        buffs: ['选择到优秀队友后，所有属性提升80%'],
        debuffs: ['单人行动时，所有属性下降50%'],
        slogans: ['暗影猎手, 准备就绪！'],
        cheerColor: '#5c346d', 
        stats: { 力量: 1.2, 默契: 5, 技巧: 2.5, 智力: 1.5, 运气: 1.1, 准度: 3 },
        uid: '19642758'
    },
    {
        id: 'daxia',
        name: '徐大虾咯',
        pinyin: 'XU DA XIA LO',
        nickname: '芸上',
        avatar: '/avatars/daxia.jpg',
        title: '电竞后羿',
        honor: '占位',
        buffs: ['准度提升80%'],
        debuffs: ['体力下降100%'],
        slogans: ['你的虾王, 无限猖狂！'],
        cheerColor: '#16914d', 
        stats: { 力量: 1, 默契: 3, 技巧: 4, 智力: 3, 运气: 3, 准度: 5 },
        uid: '13354765'
    },
    {
        id: 'yuge',
        name: '雨哥到处跑',
        pinyin: 'YU GE DAO CHU PAO',
        nickname: '秋夕',
        avatar: '/avatars/yuge.jpg',
        title: '实力雨神',
        honor: '占位',
        buffs: ['初始所有属性提升30%'],
        debuffs: ['因饥饿状态，所有属性每小时下降10%'],
        slogans: ['你的郭雨, 实力允许！'],
        cheerColor: '#ffaa02',
        stats: { 力量: 5, 默契: 1, 技巧: 2, 智力: 3, 运气: 1, 准度: 2.5 },
        uid: '147166910'
    },
    {
        id: 'zhebie',
        name: '在下哲别',
        pinyin: 'ZAI XIA ZHE BIE',
        nickname: '墨竹',
        avatar: '/avatars/zhebie.jpg',
        title: '猖狂人才',
        honor: '占位',
        buffs: ['所有属性提升30%', '与力元君组队后，所有属性提升50%'],
        debuffs: [],
        slogans: ['人才猖狂, 拥哲为王！'],
        cheerColor: '#C89B00', // 优化后的深金/橘黄色，在浅色背景下更易读
        stats: { 力量: 1.2, 默契: 1.3, 技巧: 5, 智力: 1.4, 运气: 1, 准度: 3 },
        uid: '416128940'
    },
    {
        id: 'sanmu',
        name: '自来卷三木',
        pinyin: 'ZI LAI JUAN SAN MU',
        nickname: '微澜',
        avatar: '/avatars/sanmu.jpg',
        title: '招魂仙人',
        honor: '占位',
        buffs: ['幸运值提升40%'],
        debuffs: ['其余所有属性下降40%'],
        slogans: ['钢丝球球, 世界一流！'],
        cheerColor: '#16914d', 
        stats: { 力量: 0.5, 默契: 0.5, 技巧: 0.5, 智力: 0.5, 运气: 5, 准度: 0.5 },
        uid: '474702359'
    }
];
