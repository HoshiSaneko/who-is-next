/**
 * 解析 LRC 歌词格式
 * 格式: [mm:ss.xx]歌词文本
 */
export interface LyricItem {
  time: number; // 秒
  text: string;
}

export function parseLrc(lrcText: string): LyricItem[] {
  const lines = lrcText.trim().split('\n');
  const items: LyricItem[] = [];

  for (const line of lines) {
    // 兼容可能带有 \r 的行，并放宽毫秒匹配 (1-3位)
    const match = line.trim().match(/^\[(\d{1,2}):(\d{2})\.(\d+)\](.*)$/);
    if (match) {
      const [, min, sec, ms, text] = match;
      const msVal = parseInt(ms.padEnd(3, '0').slice(0, 3), 10);
      const time = parseInt(min, 10) * 60 + parseInt(sec, 10) + msVal / 1000;
      const t = text.trim();
      if (t && !t.startsWith('作词') && !t.startsWith('作曲')) {
        items.push({ time, text: t });
      }
    }
  }

  items.sort((a, b) => a.time - b.time);
  return items;
}

export function getCurrentLyric(lyrics: LyricItem[], currentTime: number): string {
  let result = '';
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      result = lyrics[i].text;
      break;
    }
  }
  return result;
}
