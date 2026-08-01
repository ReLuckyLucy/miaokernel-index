# 渺核科技官网首页

> 渺见未来，核聚价值

东莞市渺核科技有限公司品牌官网首页。项目采用全屏像素场景、中文像素字体与代码雨转场，将品牌 Logo、技术方向和企业价值观组织为一套可交互的数字叙事体验。

[在线访问](https://dongguan-miaohe-tech.relucy.chatgpt.site) · [GitHub 仓库](https://github.com/ReLuckyLucy/miaokernel-index)

![渺核科技官网首页](docs/homepage.png)

## 项目特色

- **全屏像素叙事**：内容被组织为 5 个占满视口的独立场景，不使用传统纵向长页面。
- **代码雨转场**：切换场景时，Canvas 绘制的字符雨与像素遮罩覆盖画面，并在中点切换内容。
- **多种操作方式**：支持鼠标滚轮、键盘、触摸滑动和右侧章节导航。
- **品牌视觉统一**：使用渺核科技官方 Logo，以及青蓝、粉色、紫色组成的信号色系统。
- **中文像素字体**：内置 Fusion Pixel Font 简体中文等宽字形，确保部署后视觉稳定。
- **响应式布局**：桌面端、窄屏和移动设备均使用专门的构图与字号规则。
- **无障碍兼容**：提供语义化章节、可访问标签、键盘导航和 `prefers-reduced-motion` 降低动画支持。

## 页面场景

| 编号 | 场景 | 内容 |
| --- | --- | --- |
| `00` | 起点 | 官方 Logo、公司名称和品牌 Slogan「渺见未来，核聚价值」 |
| `01` | 关于渺核 | 企业理念与「真正的改变始于微小」的品牌表达 |
| `02` | 技术方向 | 感知、连接、决策三项核心能力 |
| `03` | 我们的方式 | 深入本质、快速验证、彼此成就 |
| `04` | 开始连接 | 品牌收束、联系入口与企业信息 |

## 交互方式

- 向下滚动：进入下一场景
- 向上滚动：返回上一场景
- `↑` / `Page Up`：上一场景
- `↓` / `Page Down` / `Space`：下一场景
- `Home`：返回首屏
- `End`：前往最终场景
- 触摸设备：上下滑动切换
- 点击右侧编号：直接进入指定场景

切换过程中，页面先通过像素代码雨覆盖当前内容，在动画中点更新场景，再逐块揭开新画面。转场期间导航会暂时锁定，避免连续输入造成状态冲突。

## 技术栈

| 技术 | 用途 |
| --- | --- |
| React 19 | 页面组件与交互状态 |
| Next.js 16 | 应用结构、元数据和服务端能力 |
| TypeScript | 类型安全 |
| vinext | 基于 Vite 的 Next.js Cloudflare 运行时 |
| Vite 8 | 开发与构建 |
| Canvas 2D | 像素代码雨转场 |
| CSS | 像素场景、逐帧动画与响应式布局 |
| OpenAI Sites | 生产托管与发布 |

## 项目结构

```text
.
├── app/
│   ├── globals.css          # 品牌色、场景布局、像素动画与响应式规则
│   ├── layout.tsx           # 页面元数据、Open Graph 与站点图标
│   └── page.tsx             # 五个场景、导航逻辑与 Canvas 转场
├── docs/
│   └── homepage.png         # README 首页截图
├── public/
│   ├── fonts/               # 中文像素字体
│   ├── miaokernel-logo.svg  # 官方矢量 Logo
│   ├── miaokernel-logo.png  # 官方位图 Logo
│   ├── miaokernel-logo-pixel.png
│   └── og.png               # 社交平台分享封面
├── .openai/hosting.json     # Sites 项目标识及资源声明
├── package.json
├── vite.config.ts
└── tsconfig.json
```

仓库中的 `db/`、`drizzle/`、`worker/` 和 `examples/` 来自 Sites/vinext 项目基础结构，为将来增加数据存储或服务端能力预留；当前品牌首页不依赖数据库。

## 本地开发

### 环境要求

- Node.js `>= 22.13.0`
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

macOS / Linux：

```bash
npm run dev
```

Windows PowerShell：

```powershell
$env:WRANGLER_LOG_PATH = ".wrangler/wrangler.log"
npx vinext dev
```

启动后访问 `http://localhost:3000/`。

### 生产构建

macOS / Linux：

```bash
npm run build
```

Windows PowerShell：

```powershell
$env:WRANGLER_LOG_PATH = ".wrangler/wrangler.log"
npx vinext build
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发环境 |
| `npm run build` | 生成生产构建并检查兼容性 |
| `npm run start` | 启动生产构建 |
| `npm run lint` | 运行 ESLint |
| `npm test` | 构建并运行 Node 测试 |
| `npm run db:generate` | 在数据库结构变化后生成 Drizzle 迁移 |

## 设计系统

核心颜色定义在 `app/globals.css`：

```css
--black: #050507;
--white: #edf8fa;
--cyan: #90dbf2;
--pink: #ff72b6;
--purple: #9d7dff;
```

视觉系统遵循以下原则：

- 以近黑背景与 16px 网格构成数字空间。
- 使用硬边框、方形像素和逐帧动画，避免柔和圆角界面语言。
- 青蓝色表示主要信号，粉色与紫色用于状态强调和层次分离。
- 官方 Logo 始终保持原始结构与品牌配色；场景中的像素版本只改变采样方式。

## 部署

当前生产版本托管于 OpenAI Sites：

**https://dongguan-miaohe-tech.relucy.chatgpt.site**

`.openai/hosting.json` 绑定现有 Sites 项目。生产构建输出由 vinext 生成，适配 Cloudflare Workers 运行环境。

## 字体与品牌资产

- 中文像素字体来自 [Fusion Pixel Font](https://github.com/TakWolf/fusion-pixel-font)，字体文件遵循 SIL Open Font License 1.1。
- `miaokernel-logo.svg`、`miaokernel-logo.png` 及其衍生像素版本为渺核科技品牌资产。
- 未经品牌所有者许可，请勿将 Logo 用于与本项目无关的产品或宣传材料。

## 联系方式

- 企业：东莞市渺核科技有限公司
- 品牌：渺核科技 / MIAOKERNEL TECHNOLOGY
- 邮箱：`hello@miaohe.tech`
- Slogan：渺见未来，核聚价值

## 版权

© 2026 东莞市渺核科技有限公司。保留所有品牌相关权利。
