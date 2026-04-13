# 下谁图鉴 (Who is Next Gallery)

![B站自制闯关竞技综艺《下一个是谁》非官方图鉴](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

**B站自制闯关竞技综艺《下一个是谁》非官方图鉴与数据统计站。**

> 本项目致力于整理和记录节目中的相关数据内容。

![Screenshot 1](./screenshots/screenshot.png)
![Screenshot 2](./screenshots/screenshot2.png)
![Screenshot 5](./screenshots/screenshot7.png)

## Tech Stack

- **框架**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite 6](https://vitejs.dev/)
- **路由**: [React Router 7](https://reactrouter.com/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/) 
- **图表**: [ECharts](https://echarts.apache.org/) / [Recharts](https://recharts.org/) 
- **互动**: [@waline/client](https://waline.js.org/)

## Design Language

- **主色调**: `#88B090` 
- **背景色**: `#F8F8F5` 
- **文字色**: `#333333` (主标题), `#555555` (正文), `#999999` (辅助信息)
- **排版原则**: 宽字间距 (`tracking-[0.15em]` / `tracking-[0.2em]`)
- **交互原则**: 扁平化，去除厚重阴影，悬停时仅使用微透明度或极轻的颜色反馈。

## Local Development

请确保您的本地环境已安装 [Node.js](https://nodejs.org/) (建议 v18+)。

1. **克隆项目**
   ```bash
   git clone https://github.com/HoshiSaneko/who-is-next.git
   cd who-is-next
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   *应用将在 `http://localhost:3000` (或其它可用端口) 运行。*

4. **构建生产版本**
   ```bash
   npm run build
   ```

## Project Structure

```text
who-is-next/
├── components/      # 复用的 UI 组件 (Navigation, Footer, MusicPlayer 等)
├── configs/         # 静态数据配置 (UP主数据, 关卡数据, 赛季数据等)
├── contexts/        # React Context (全局状态管理，如音量控制)
├── hooks/           # 自定义 React Hooks
├── pages/           # 页面级组件 (Home, UPMembers, Stats, Guestbook 等)
├── utils/           # 工具函数 (音频管理, LRC 解析等)
├── App.tsx          # 根组件与路由配置
├── index.tsx        # React 挂载入口
├── types.ts         # 全局 TypeScript 类型定义
└── tailwind.config.ts # (或通过 Vite 插件配置) Tailwind 设置
```

## Waline

留言板页面 (`pages/Guestbook.tsx`) 使用了 Waline。如果您想部署自己的留言板：

1. 请前往 [Waline 官方文档](https://waline.js.org/) 部署您的服务端。
2. 将 `Guestbook.tsx` 中的 `serverURL` 替换为您自己的 Vercel 或其他服务地址：
   ```typescript
   serverURL: 'https://您的-waline-域名.vercel.app/',
   ```

## Disclaimer

本项目为粉丝自制的非官方数据统计与展示站点。项目内涉及的节目名称、人员信息、相关图片及音频素材版权均归原节目组及相关权利人所有。

---

