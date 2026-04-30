
export interface UpMember {
  id: string;
  name: string;
  pinyin?: string;    // 名字拼音
  nickname?: string;  // 绰号/代号 (如 "雨霁")
  avatar: string;
  title: string;      // 称号 (如 "实力雨神")
  honor: string;      // 荣誉 (如 "2025百大UP主、2020百大UP主")
  tags?: string[];     // 经典名场面标签（已废弃，使用 buffs 和 debuffs）
  buffs?: string[];    // 正面效果（Buff）
  debuffs?: string[];  // 负面效果（Debuff）
  slogans?: string[];  // 应援口号
  cheerColor?: string; // 应援色
  stats: Record<string, number>; // 能力值，支持不同的能力项
  uid?: string;      // B站UID，用于跳转到空间
}

export interface Game {
  id: string;
  season: number;
  levelName: string;
  rule: string;
  levelChampion?: string;
  /** 第二个通关的成员（亚军） */
  levelRunnerUp?: string;
  /** 第三个通关的成员（季军） */
  levelThirdPlace?: string;
  url?: string;
  giveUp?: string;
  /** 本关淘汰，有内容时代替通关王和放弃显示 */
  levelEliminated?: string;
  /** 特殊关卡（如黄力元投篮、连续投币），在列表中显示专属样式 */
  isSpecialLevel?: boolean;
  /** 特殊关卡子类型：投球计分 | 连续投币（字面连击）| 沙包计分。未填且 isSpecialLevel 时视为投球关 */
  specialLevelType?: 'ball' | 'coin' | 'sandbag' | 'other';
  /** 特殊关卡成绩展示文案（如 24分、10连、60分） */
  specialBestScore?: string;
  /** sp- 系列关卡维度（如准度、默契），显示在关卡列表卡片右上角 */
  spTag?: string;
}

export interface BiliData {
  code: number;
  message: string;
  global_last_update_time: string;
  data: {
    up_info: Record<string, {
      uid: string;
      fans_count: number;
      update_time: string;
    }>;
    co_creation: Record<string, {
      bvid: string;
      title: string;
      play: number;
      like: number;
      coin: number;
      favorite: number;
      update_time: string;
    }>;
  };
}

export interface Goddess {
  id: string;
  season: number;
  episode: number;
  name: string;
  avatar: string;
  /** 描述词，如「bilibili 2020百大UP主 舞蹈区、生活区」 */
  description?: string;
  games: string[];
  bilibiliUrl: string;
}

export interface ExtraVideo {
  title: string;
  bvid: string;
  date?: string;
  duration?: string;
  category: string; // 新增：视频分类（如前传、生活篇等）
}

export interface MemeSource {
  title?: string; // 视频标题或出处名称 (可选，如果没有则自动显示 出处1, 出处2 等)
  url: string;   // 对应的B站链接或其他链接
}

export interface Meme {
  id: string;
  name: string;
  image?: string; // 梗的图片地址
  sources: MemeSource[]; // 出处列表 (可能有多个)
  relatedUp?: string[]; // 相关的UP主id列表
}
