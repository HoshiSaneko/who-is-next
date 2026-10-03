# 视差与 Hover 卡顿性能修复文档

> 面向 AI Agent 的执行文档。按顺序执行，每步都可独立验证。
> 核心原则：**每一帧只允许 `transform` 和 `opacity` 发生变化。**

---

## 1. 问题描述

项目在以下两种交互下出现明显掉帧（鼠标移动时 FPS 骤降）：

1. **二级页背景视差**：`SecondaryPageBackdrop` 组件跟随鼠标位移时卡顿。
2. **卡片 Hover**：鼠标划过 `guest-card` 等卡片列表时卡顿。

现象具有共性：**鼠标一动就卡，鼠标不动就正常**。说明卡顿由「鼠标驱动的高频样式变化」触发，而非页面加载或静态渲染。

---

## 2. 根本原因

浏览器渲染管线：`Style → Layout → Paint → Composite`。

- 改 `transform` / `opacity` → 只走 **Composite（合成）**，GPU 处理，极廉价。
- 改 `background` / `box-shadow` / `border-color` / `filter` / `background-position` → 触发 **Paint（重绘）**，CPU 在主线程处理，昂贵。
- 改 `width` / `height` / `top` / `left` → 触发 **Layout（重排）**，最昂贵。

### 2.1 视差卡顿的具体成因

`SecondaryPageBackdrop` 的 `.secondary-page-backdrop__image` 同时存在以下问题：

| 问题 | 代码 | 后果 |
|---|---|---|
| **过渡与逐帧更新冲突** | `transition: transform 260ms` + JS 每帧改 `--image-x` | 每帧新建一个 260ms 过渡，数百个过渡排队，主线程爆炸 |
| **animation 与 transform 争抢** | `animation: secondary-backdrop-drift` 与鼠标 `transform` 在同一元素 | 每帧重新解析 transform 合成值 |
| **滤镜随位移重算** | `filter: grayscale() saturate() ...` 作用在每帧位移的元素上 | 滤镜结果无法复用，每帧全屏重算 |
| **will-change 滥用** | `will-change: transform, background-position` | 提示浏览器为 `background-position` 做准备，而它一变即重绘 |
| **位移属性选错** | 漂移动画可能改 `background-position` | 每帧全屏重绘 |

### 2.2 Hover 卡顿的具体成因

`.guest-card` 的过渡与 hover 规则：

```css
transition: transform 220ms ease, border-color 220ms ease, background 220ms ease, box-shadow 220ms ease;
```

其中只有 `transform` 可以稳定走合成；其余属性在 220ms 内持续插值，每一帧都会触发重绘。卡片数量越多、阴影和滤镜面积越大，鼠标连续扫过时累积开销越明显。

类似问题还包括：

- 图片同时过渡 `transform` 与 `filter`；
- 装饰线从 `height: 1px` 过渡到 `height: 3px`；
- 进度条通过 `width` 做动画；
- 使用 Tailwind `transition`，无意中把颜色、背景、阴影和滤镜一起纳入过渡；
- `will-change` 声明了 `background-position`、`filter` 等重绘型属性。

---

## 3. 修复方案

### 3.1 二级页背景视差

保持现有 `requestAnimationFrame` 指针更新逻辑不变，只调整图层职责：

1. `.secondary-page-backdrop__image` 作为运动层，只负责 `transform` 与 `will-change: transform`。
2. 使用 `.secondary-page-backdrop__image::before` 承载静态背景图与 `filter`，避免滤镜直接作用在每帧更新的运动元素上。
3. 删除视差层的 `transition: transform`，避免与 JS 逐帧更新冲突。
4. 删除通过 `background-position` 实现的持续漂移动画。
5. `.secondary-page-backdrop__structure` 和 `.secondary-page-backdrop__light` 同样只保留 `transform` 合成，并将 `will-change` 收敛为 `transform`。

目标结构：

```css
.secondary-page-backdrop__image {
  transform: translate3d(var(--image-x), var(--image-y), 0) scale(1.1);
  will-change: transform;
}

.secondary-page-backdrop__image::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url('/images/home-hero-next-basketball.webp') 50% 54% / cover;
  filter: grayscale(0.28) saturate(0.72) contrast(1.05) brightness(0.82);
  transform: translateZ(0);
}
```

### 3.2 卡片与列表 Hover

保留原来的视觉状态和位移幅度，但限制参与动画的属性：

```css
.guest-card {
  transition: transform 220ms ease;
}

.guest-card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 213, 157, 0.38);
  background: var(--hover-background);
  box-shadow: var(--hover-shadow);
}
```

`border-color`、`background`、`box-shadow` 仍可在 Hover 状态改变，但不做逐帧插值，只在状态切换时产生一次重绘。

全局处理规则：

| 原实现 | 调整方式 |
|---|---|
| `transition: transform, background, border-color, box-shadow` | 只保留 `transform` |
| `transition: transform, opacity, filter` | 只保留 `transform, opacity` |
| `transition: all` | 删除或改为明确的合成属性 |
| `height: 1px → 3px` | 固定高度，通过 `scaleY()` 动画 |
| `width` 动画 | 删除，或改为 `scaleX()` 且设置正确的 `transform-origin` |
| Tailwind `transition` | 改为 `transition-transform` 或 `transition-[transform,opacity]` |

### 3.3 当前覆盖范围

本次已覆盖：

- 二级页全局背景视差；
- Levels、Season、UP Members、Extras、Guest、Traffic King 等页面的卡片与列表项；
- 通用 `MediaCard`；
- Memes 和 Stats 的指标卡、内容卡及装饰线；
- 卡片图片的缩放与滤镜 Hover；
- 自定义 CSS 中其他同类重绘型 transition。

不修改数据逻辑、交互事件、布局结构和 Hover 最终视觉状态。

---

## 4. 执行检查

### 4.1 静态扫描

检查自定义 CSS 中是否仍有重绘或重排属性参与 transition：

```powershell
rg -n "transition:.*(background|border|box-shadow|filter|color|all|width)|will-change:.*(background-position|filter)" index.css
```

预期：无匹配结果。若新增匹配，先判断该属性是否会在鼠标移动或批量 Hover 时高频触发。

检查 JSX 中的通用 Tailwind 过渡：

```powershell
rg -n --glob "*.tsx" "\btransition\b|transition-all|group-hover:h-|group-hover:w-" components pages
```

对卡片、列表和大面积视觉层逐项确认；小面积、低频控件可以按实际成本保留。

### 4.2 自动验证

```powershell
npx vitest run
npm run build
git diff --check
```

当前验证结果：

- Vitest：1 个测试文件、3 个测试通过；
- Vite production build：通过；
- `git diff --check`：通过；
- 构建仅保留既有的大 chunk 警告，与本次修复无关。

### 4.3 可选性能验证

仅在需要最终浏览器证据时执行一次：

1. 打开任意二级页，在 DevTools Performance 中录制连续移动鼠标 5～10 秒。
2. 确认视差过程中主要发生 Composite，不再持续出现全屏 Paint。
3. 快速扫过 Guest、Extras、Stats 或 Memes 卡片列表，确认 FPS 不再明显下跌。
4. 检查 Hover 最终视觉状态与修改前一致。

---

## 5. 验收标准

- 鼠标移动时，视差层不再叠加 CSS transform transition。
- 视差层不再通过 `background-position` 做持续动画。
- 滤镜与逐帧位移分离到不同图层职责。
- 高频 Hover 动画只使用 `transform` 和 `opacity`。
- 不通过 `width`、`height`、背景、边框、阴影或滤镜做逐帧动画。
- 构建、测试和差异检查通过。
- 不以静态检查或构建结果冒充浏览器 FPS、Paint 或截图验证。
