# 渺核科技官网

东莞市渺核科技有限公司品牌官网首页。

![首页预览](docs/homepage.png)



## 项目简介

这是一个使用 **Vite + React + TypeScript** 构建的纯前端静态站点,主打像素复古风格的设计表达。

## 环境要求

- **Node.js** `>= 22.13.0`
- **npm**(随 Node.js 一起安装)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

启动后访问 [http://localhost:3000](http://localhost:3000)。

### 3. 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录,可以直接用任意静态服务器托管。

### 4. 本地预览生产构建

```bash
npm run preview
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器(带热更新) |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run test` | 运行自动化测试 |
| `npm run lint` | 检查代码风格 |

## 目录结构

```
miaokernel-index/
├── src/                # 源代码
│   ├── main.tsx          React 应用入口
│   ├── App.tsx           首页组件
│   └── index.css         全局样式(像素字体等)
├── public/             # 静态资源(图片、字体等)
│   ├── fonts/            自定义像素字体
│   ├── miaokernel-logo.*  渺核 Logo
│   └── og.png            社交分享预览图
├── docs/               # 项目文档
│   └── homepage.png      首页截图
├── tests/              # 自动化测试
│   └── rendered-html.test.mjs
├── index.html          # HTML 入口(Vite 约定)
├── package.json        # 项目配置与依赖清单
├── vite.config.ts      # Vite 构建工具配置
├── tsconfig.json       # TypeScript 配置
├── eslint.config.mjs   # ESLint 配置
└── README.md           # 本文档
```

## 技术栈

- **Vite 6** - 构建工具,提供极速的开发体验
- **React 19** - 用户界面库
- **TypeScript 5** - 类型化的 JavaScript 超集
- **像素字体** - 复古游戏风格

## 修改内容

- **改文字 / 图片位置**:编辑 `src/App.tsx`
- **改样式 / 字体**:编辑 `src/index.css`
- **换 Logo**:替换 `public/miaokernel-logo.*` 文件
- **换字体**:替换 `public/fonts/` 下的字体文件


