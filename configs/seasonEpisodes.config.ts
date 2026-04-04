export interface SeasonEpisode {
    season: number;
    episode: number;
    title: string;
    bvid: string;
}

export const SEASON_EPISODES_CONFIG: SeasonEpisode[] = [
    // S1
    { season: 1, episode: 1, title: '很对不起大家！我将会退出节目！《下一个是谁1》01', bvid: 'BV1CQ4y1f7dA' },
    { season: 1, episode: 2, title: '没得选，我们之中必须走一个！ 《下一个是谁1》02', bvid: 'BV1Hq4y1Q7r2' },
    { season: 1, episode: 3, title: '今天晚上，淘汰两个！！《下一个是谁1》03', bvid: 'BV1Y64y1s7X8' },
    { season: 1, episode: 4, title: '对不起，我们作弊了。《下一个是谁1》04', bvid: 'BV1Rf4y1V7tC' },

    // S2
    { season: 2, episode: 1, title: '没办法，这一季真的要拼命了！！！《下一个是谁2》01', bvid: 'BV1eL4y1z7ZY' },
    { season: 2, episode: 2, title: '我 们 今 年 最 牛 的 节 目《下一个是谁2》02', bvid: 'BV1yq4y1V7vh' },
    { season: 2, episode: 3, title: '对不起，这个节目拍不下去了...《下一个是谁2》03', bvid: 'BV1jh411n7f8' },
    { season: 2, episode: 4, title: '终于结束了，这些丧心病狂的挑战！ 《下一个是谁2》04', bvid: 'BV1AT4y1d7bC' },

    // S3
    { season: 3, episode: 1, title: '这一季，关乎男人的尊严！！！《下一个是谁3》01', bvid: 'BV1QT4y1e79k' },
    { season: 3, episode: 2, title: '彻底疯狂！谁都别拦着我们！！！《下一个是谁3》02', bvid: 'BV1mY4y1H7wp' },
    { season: 3, episode: 3, title: '别眨眼，这期全程究极高能！！！《下一个是谁3》03', bvid: 'BV1XZ4y1y7du' },
    { season: 3, episode: 4, title: '我的天，这期男人的尊严都没了！ 《下一个是谁3》04', bvid: 'BV1eY411P7kW' },
    { season: 3, episode: 5, title: '太恐怖了！我们经历了无限循环！！！《下一个是谁3》05', bvid: 'BV1HF411T7oV' },
    { season: 3, episode: 6, title: '你这一辈子，有没有为别人拼过命！！！《下一个是谁3》06', bvid: 'BV1AT4y167mt' },

    // S4
    { season: 4, episode: 1, title: '经费爆炸！这一季真的豁出去了！！！《下一个是谁4》01', bvid: 'BV128411G7by' },
    { season: 4, episode: 2, title: '爆炸了！这期真的爆炸了！！！《下一个是谁4》02', bvid: 'BV1gG4y1g7f7' },
    { season: 4, episode: 3, title: '反超！这个游戏的看点是反超！！！《下一个是谁4》03', bvid: 'BV1mK411i7xh' },
    { season: 4, episode: 4, title: '翻盘！竟然是谁都想不到的结果！！！《下一个是谁4》04', bvid: 'BV1NG4y1j78a' },
    { season: 4, episode: 5, title: '无敌了！这一期直接超神！ 《下一个是谁4》05', bvid: 'BV1WG4y1C7mT' },
    { season: 4, episode: 6, title: '再见了，下一个是谁！！！！《下一个是谁4》06', bvid: 'BV1TT41117DK' },

    // S5
    { season: 5, episode: 1, title: '我们回来了！！！《下一个是谁5》01', bvid: 'BV1QfgNzCEcm' },
    { season: 5, episode: 2, title: '放弃？！史上最难的游戏终于出现了？？《下一个是谁5》02', bvid: 'BV1D2bUzjEoo' },
    { season: 5, episode: 3, title: '别笑，你也过不了第二关《下一个是谁5》03', bvid: 'BV1Je8mz8EX6' },
    { season: 5, episode: 4, title: '史上最大领先！根本追不上啊！！！《下一个是谁5》04', bvid: 'BV18CtBz1E6t' },
    { season: 5, episode: 5, title: '再这样没有下一季了！！！《下一个是谁5》05', bvid: 'BV1z9bLzYEiC' },
    { season: 5, episode: 6, title: '这场战斗，终究还是来了！！！《下一个是谁5》06', bvid: 'BV1S4YQzaEkj' },

    // S6
    { season: 6, episode: 1, title: '为了这个节目我们拼了！！！《下一个是谁6》01', bvid: 'BV12zmGBcEtT' },
    { season: 6, episode: 2, title: '所有人都疯了！！！《下一个是谁6》02', bvid: 'BV1nKBXBCEoP' },
    { season: 6, episode: 3, title: '史上最燃的一场比赛！！！《下一个是谁6》03', bvid: 'BV1nDi9ByELu' },
    { season: 6, episode: 4, title: '真的笑不动了！！！《下一个是谁6》04', bvid: 'BV1tKzcB1ECE' },
    { season: 6, episode: 5, title: '99%的人过不了第一关！！《下一个是谁6》05', bvid: 'BV1QfcVzVEwJ' },
    { season: 6, episode: 6, title: '决战！我要夺冠！！！《下一个是谁6》06', bvid: 'BV11bAUzBEqG' },
];
