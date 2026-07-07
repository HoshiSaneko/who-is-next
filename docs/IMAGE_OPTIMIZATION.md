# 图片优化指南

## 问题
部署后图片加载很慢，因为：
- 总共约 90MB 的图片资源
- 部分 PNG 图片达到 2-2.4MB
- 未使用现代图片格式（WebP）

## 解决方案

### 1. 图片格式优化
我们创建了自动化脚本将图片转换为 WebP 格式，可以节省 30-80% 的体积。

**运行优化：**
```bash
npm run optimize-images
```

这会：
- 将所有 JPG/PNG 图片转换为 WebP 格式
- 自动调整过大图片的尺寸（最大宽度 1920px）
- 保留原始格式作为后备

### 2. 使用 OptimizedImage 组件

我们创建了一个 React 组件，自动处理：
- WebP 格式优先加载
- 懒加载（图片进入视口时才加载）
- 优雅的加载动画
- 自动降级到原始格式

**使用方法：**

```tsx
import { OptimizedImage } from '@/src/components/OptimizedImage';

// 基本使用
<OptimizedImage 
  src="/covers/example.jpg" 
  alt="描述" 
  className="w-full h-auto"
/>

// 指定尺寸
<OptimizedImage 
  src="/avatars/user.png" 
  alt="用户头像" 
  width={200}
  height={200}
  className="rounded-full"
/>

// 禁用懒加载（首屏关键图片）
<OptimizedImage 
  src="/hero.jpg" 
  alt="Hero" 
  loading="eager"
  className="hero-image"
/>
```

### 3. 替换现有图片标签

查找项目中的 `<img>` 标签并替换为 `<OptimizedImage>`：

**原来：**
```tsx
<img src="/covers/video.jpg" alt="视频封面" />
```

**优化后：**
```tsx
<OptimizedImage src="/covers/video.jpg" alt="视频封面" />
```

### 4. 服务器配置

确保服务器正确配置 MIME 类型：

**Nginx 配置：**
```nginx
http {
  types {
    image/webp webp;
  }
  
  # 启用 Gzip 压缩
  gzip on;
  gzip_types image/webp image/jpeg image/png;
  
  # 设置缓存
  location ~* \.(jpg|jpeg|png|gif|webp)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

### 5. 额外优化建议

**5.1 使用 CDN**
将图片上传到 CDN 服务（如阿里云 OSS、七牛云等）：
```tsx
const CDN_BASE = 'https://cdn.yourdomain.com';
<OptimizedImage src={`${CDN_BASE}/covers/video.jpg`} alt="视频" />
```

**5.2 响应式图片**
为不同设备提供不同尺寸：
```tsx
<picture>
  <source 
    media="(max-width: 640px)" 
    srcSet="/images/small.webp" 
    type="image/webp"
  />
  <source 
    media="(max-width: 1024px)" 
    srcSet="/images/medium.webp" 
    type="image/webp"
  />
  <OptimizedImage 
    src="/images/large.jpg" 
    alt="响应式图片" 
  />
</picture>
```

**5.3 图片占位符**
为大图片添加低质量占位符（LQIP）或模糊效果。

## 优化效果

运行 `npm run optimize-images` 后，你可以看到：
```
📊 Processed 208 images
📦 Original size: 90.00 MB
📦 WebP size: ~30-40 MB
💾 Total savings: 50-60%
```

## 部署步骤

1. 运行图片优化：
   ```bash
   npm run optimize-images
   ```

2. 替换项目中的 `<img>` 标签为 `<OptimizedImage>`

3. 重新构建项目：
   ```bash
   npm run build
   ```

4. 部署 `dist/` 目录到服务器

5. 配置服务器缓存和压缩

## 验证

部署后，在浏览器开发者工具中：
1. Network 标签查看加载的图片格式（应为 webp）
2. 检查图片大小（应显著减小）
3. 验证懒加载是否工作（滚动时才加载图片）
