# CDN 集成使用指南

## ✅ CDN 已配置完成

你的 CDN 域名：**http://cdn.xygss.saneko.me**

示例：`http://cdn.xygss.saneko.me/avatars/amazong.webp`

---

## 📦 已创建的文件

1. **`src/config/cdn.ts`** - CDN 配置文件
2. **`src/components/OptimizedImage.tsx`** - 优化的图片组件（已集成 CDN）
3. **`src/components/CDNTest.tsx`** - CDN 测试组件

---

## 🚀 快速开始

### 方法 1：使用 OptimizedImage 组件（推荐）

这是最简单的方法，组件会自动：
- 优先加载 WebP 格式
- 从 CDN 加载图片
- 实现懒加载
- 显示加载动画

```tsx
import { OptimizedImage } from '@/src/components/OptimizedImage';

// 基本使用（自动使用 CDN + WebP）
<OptimizedImage 
  src="/avatars/amazong.jpg" 
  alt="阿吗粽"
  className="w-32 h-32 rounded-full"
/>

// 禁用 CDN（使用本地文件）
<OptimizedImage 
  src="/avatars/amazong.jpg" 
  alt="阿吗粽"
  useCDN={false}
/>

// 首屏关键图片（禁用懒加载）
<OptimizedImage 
  src="/covers/hero.jpg" 
  alt="Hero"
  loading="eager"
/>
```

### 方法 2：直接使用 CDN URL

如果你需要在非 img 标签中使用图片（如 CSS background），可以直接使用工具函数：

```tsx
import { getCDNUrl, getWebPUrl } from '@/src/config/cdn';

// 获取 CDN URL（保留原始格式）
const imageUrl = getCDNUrl('/avatars/amazong.jpg');
// 结果: http://cdn.xygss.saneko.me/avatars/amazong.jpg

// 获取 WebP 格式的 CDN URL
const webpUrl = getWebPUrl('/avatars/amazong.jpg');
// 结果: http://cdn.xygss.saneko.me/avatars/amazong.webp

// 在 CSS 中使用
<div 
  style={{ backgroundImage: `url(${webpUrl})` }}
  className="w-full h-64 bg-cover"
/>
```

---

## 🧪 测试 CDN 是否正常工作

### 选项 1：使用测试页面

1. 在你的路由中添加测试页面：

```tsx
// 在 App.tsx 或路由配置中添加
import { CDNTest } from '@/src/components/CDNTest';

<Route path="/cdn-test" element={<CDNTest />} />
```

2. 访问 `http://localhost:3000/cdn-test` 查看测试结果

### 选项 2：手动验证

1. 打开浏览器开发者工具（F12）
2. 切换到 **Network** 标签
3. 刷新页面
4. 筛选图片请求，检查：
   - ✅ 域名是否为 `cdn.xygss.saneko.me`
   - ✅ 格式是否为 `.webp`
   - ✅ 状态码是否为 `200`
   - ✅ 加载时间是否明显减少

### 选项 3：直接访问测试

在浏览器中直接访问：
```
http://cdn.xygss.saneko.me/avatars/amazong.webp
```

如果能看到图片，说明 CDN 配置正确。

---

## 🔄 迁移现有代码

### 查找所有需要替换的 `<img>` 标签

```bash
# 搜索所有 img 标签
grep -r "<img" src/ --include="*.tsx" --include="*.jsx"
```

### 替换步骤

**原来的代码：**
```tsx
<img 
  src="/avatars/user.jpg" 
  alt="用户" 
  className="w-20 h-20"
/>
```

**替换为：**
```tsx
<OptimizedImage 
  src="/avatars/user.jpg" 
  alt="用户" 
  className="w-20 h-20"
/>
```

**不要忘记导入：**
```tsx
import { OptimizedImage } from '@/src/components/OptimizedImage';
```

---

## ⚙️ 配置选项

### 修改 CDN 域名

如果需要更换 CDN 域名，只需修改 `src/config/cdn.ts`：

```typescript
export const CDN_BASE_URL = 'https://your-new-cdn.com';
```

### 全局禁用 CDN

在开发环境中可能需要禁用 CDN：

```typescript
// src/config/cdn.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const CDN_BASE_URL = isDevelopment 
  ? '' 
  : 'http://cdn.xygss.saneko.me';
```

### 为特定目录设置不同的 CDN

```typescript
// src/config/cdn.ts
export const CDN_URLS = {
  avatars: 'http://cdn1.xygss.saneko.me',
  covers: 'http://cdn2.xygss.saneko.me',
  default: 'http://cdn.xygss.saneko.me'
};

export function getCDNUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // 根据路径选择 CDN
  if (cleanPath.startsWith('avatars/')) {
    return `${CDN_URLS.avatars}/${cleanPath}`;
  }
  if (cleanPath.startsWith('covers/')) {
    return `${CDN_URLS.covers}/${cleanPath}`;
  }
  
  return `${CDN_URLS.default}/${cleanPath}`;
}
```

---

## 🎯 最佳实践

### 1. 优先使用 OptimizedImage 组件

```tsx
// ✅ 推荐
<OptimizedImage src="/avatars/user.jpg" alt="用户" />

// ❌ 避免
<img src="http://cdn.xygss.saneko.me/avatars/user.webp" alt="用户" />
```

### 2. 为首屏关键图片禁用懒加载

```tsx
<OptimizedImage 
  src="/hero-image.jpg" 
  alt="Hero"
  loading="eager"  // 首屏立即加载
/>
```

### 3. 指定图片尺寸以避免布局抖动

```tsx
<OptimizedImage 
  src="/avatars/user.jpg" 
  alt="用户"
  width={200}
  height={200}
/>
```

### 4. 使用有意义的 alt 文本

```tsx
// ✅ 好
<OptimizedImage src="/avatars/amazong.jpg" alt="UP主阿吗粽的头像" />

// ❌ 差
<OptimizedImage src="/avatars/amazong.jpg" alt="图片" />
```

---

## 🐛 常见问题

### Q1: 图片无法加载，显示 404

**可能原因：**
- CDN 上的文件路径不正确
- 文件未上传到 CDN

**解决方法：**
1. 检查 CDN 上是否存在该文件
2. 验证路径是否正确：`http://cdn.xygss.saneko.me/avatars/amazong.webp`
3. 确保文件名大小写一致

### Q2: 图片加载很慢

**可能原因：**
- CDN 缓存未预热
- CDN 节点选择不当

**解决方法：**
1. 首次访问会较慢（CDN 回源），后续访问会快
2. 配置 CDN 预热策略
3. 检查 CDN 节点配置

### Q3: 开发环境想使用本地文件

**解决方法：**

方法 1 - 单个组件禁用：
```tsx
<OptimizedImage src="/avatars/user.jpg" alt="用户" useCDN={false} />
```

方法 2 - 全局配置：
```typescript
// src/config/cdn.ts
export const CDN_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '' 
  : 'http://cdn.xygss.saneko.me';
```

### Q4: 某些图片不想使用 WebP

**解决方法：**

直接使用 getCDNUrl 而不是 OptimizedImage：
```tsx
import { getCDNUrl } from '@/src/config/cdn';

<img src={getCDNUrl('/images/logo.png')} alt="Logo" />
```

### Q5: 如何监控 CDN 使用情况？

**建议：**
1. 在 CDN 服务商控制台查看流量统计
2. 配置 CDN 访问日志
3. 使用性能监控工具（如 Google Analytics）

---

## 📊 性能优化建议

### 1. CDN 缓存配置

在 CDN 控制台设置：
```
Cache-Control: public, max-age=31536000  # 1年
```

### 2. 启用 HTTP/2

确保 CDN 支持 HTTP/2，可以并行加载多个图片。

### 3. 图片压缩

所有图片已通过脚本转换为 WebP 格式，节省 **64.8%** 空间。

### 4. 响应式图片

为不同设备提供不同尺寸：
```tsx
<picture>
  <source 
    media="(max-width: 640px)" 
    srcSet={getCDNUrl('/images/small.webp')} 
  />
  <source 
    media="(max-width: 1024px)" 
    srcSet={getCDNUrl('/images/medium.webp')} 
  />
  <OptimizedImage 
    src="/images/large.jpg" 
    alt="响应式图片" 
  />
</picture>
```

---

## 📈 预期效果

使用 CDN 后的改善：
- ⚡ 图片加载速度：**提升 3-5 倍**
- 💾 带宽节省：**64.8%**（WebP 压缩）
- 🌍 全球访问：**CDN 节点加速**
- 💰 服务器成本：**降低 60-80%**

---

## ✅ 部署检查清单

部署前确认：
- [ ] `src/config/cdn.ts` 中的 CDN_BASE_URL 配置正确
- [ ] 所有图片已上传到 CDN
- [ ] CDN 域名可以正常访问
- [ ] 在开发环境测试 OptimizedImage 组件
- [ ] 替换项目中的 `<img>` 标签为 `<OptimizedImage>`
- [ ] 验证首屏关键图片设置了 `loading="eager"`
- [ ] 测试页面在生产环境正常工作
- [ ] 配置 CDN 缓存策略
- [ ] 监控 CDN 流量和费用

---

## 🔗 相关文档

- [图片优化指南](./IMAGE_OPTIMIZATION.md)
- [CDN 上传清单](./CDN_UPLOAD_LIST.md)

---

**祝你部署顺利！** 🎉

如有问题，请检查：
1. CDN 域名是否正确配置
2. 图片路径是否正确
3. 浏览器控制台是否有错误
4. CDN 是否正常工作
