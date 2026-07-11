# Bilibili 封面图片优化方案

## 概述

为了提高视频封面的加载速度，我们实现了多级回退的图片加载机制：

1. **B站官方 CDN** - 优先从 Bilibili 官方 CDN 加载封面
2. **本站 CDN** - 如果 B站 CDN 访问失败，回退到本站 CDN
3. **本地图片** - 最后回退到本地图片

## 实现原理

### 1. 配置文件

`configs/biliCovers.config.ts` 存储了 BV 号到 Bilibili 官方封面地址的映射关系：

```typescript
export const BILI_COVER_MAPPING: Record<string, string> = {
  'BV11bAUzBEqG': 'http://i1.hdslb.com/bfs/archive/fe5ffe1fdb3ac021529814058b04e47b74dd4468.jpg',
  // ... 更多映射
};
```

### 2. 图片加载顺序

`OptimizedImage` 组件会按以下顺序尝试加载图片：

1. Bilibili 官方 CDN（如果在配置中找到）
2. 本站 CDN WebP 格式
3. 本站 CDN 原始格式
4. 本地 WebP 格式
5. 本地原始格式

每个 URL 加载失败后会自动尝试下一个，直到成功或所有选项都失败。

## 使用方法

### 自动使用

如果你使用 `OptimizedImage` 组件加载 `/covers/{bvid}.jpg` 格式的封面图片，系统会自动尝试使用 Bilibili 官方 CDN：

```tsx
import { OptimizedImage } from '@/src/components/OptimizedImage';

<OptimizedImage 
  src="/covers/BV11bAUzBEqG.jpg" 
  alt="视频封面" 
  width={300}
  height={200}
/>
```

### 添加新视频封面

当添加新视频时，需要运行脚本获取封面地址：

```bash
node scripts/fetch-bili-covers.js
```

脚本会：
1. 读取 `configs/seasonEpisodes.config.ts` 中的所有 BV 号
2. 调用 Bilibili API 获取封面地址
3. 自动更新 `configs/biliCovers.config.ts`

## 手动添加单个视频封面

如果只需要添加单个视频的封面映射：

1. 访问 Bilibili API：
   ```
   https://api.bilibili.com/x/web-interface/view?bvid=BV1xx411c7mD
   ```

2. 从返回的 JSON 中获取 `data.pic` 字段的值

3. 添加到 `configs/biliCovers.config.ts`：
   ```typescript
   export const BILI_COVER_MAPPING: Record<string, string> = {
     // ... 现有配置
     'BV1xx411c7mD': 'http://i0.hdslb.com/bfs/archive/xxxxx.jpg',
   };
   ```

## 优势

1. **更快的加载速度** - Bilibili CDN 通常比自建 CDN 更快
2. **降低带宽成本** - 减少自建 CDN 的流量消耗
3. **自动回退** - 如果 B站 CDN 不可用，自动使用备选方案
4. **无侵入性** - 使用现有的 `OptimizedImage` 组件，无需修改业务代码

## 注意事项

1. Bilibili CDN 的图片可能存在跨域或防盗链限制
2. 如果大量请求失败，可以考虑禁用 B站 CDN（删除配置映射）
3. 定期运行脚本更新封面地址，以获取最新的封面
4. API 调用有频率限制，脚本中已加入1秒延迟

## 监控和调试

可以在浏览器开发者工具的 Network 面板中查看图片加载情况：

- 成功从 B站 CDN 加载：URL 包含 `hdslb.com`
- 从本站 CDN 加载：URL 包含你的 CDN 域名
- 从本地加载：URL 以 `/covers/` 开头

## 相关文件

- `configs/biliCovers.config.ts` - 封面映射配置
- `src/components/OptimizedImage.tsx` - 图片组件
- `scripts/fetch-bili-covers.js` - 批量获取封面脚本
