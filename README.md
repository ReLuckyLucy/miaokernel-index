# 渺核科技官网首页 · v2.0.0

**渺见未来，核聚价值。** 这是渺核科技的四场景品牌首页，以像素文字、程序化粒子、字符雨和复古终端呈现品牌理念及 GDMU-NA TokenHub 项目入口。

v2 使用原生 HTML、CSS、JavaScript 和 Canvas 2D 编写，无运行时依赖，也不需要 API 密钥。与 [v1.0.0](https://github.com/ReLuckyLucy/miaokernel-index/releases/tag/v1.0.0) 的 Vite/React 版本是两套不同实现。

## 下载与预览

从 [GitHub Release v2.0.0](https://github.com/ReLuckyLucy/miaokernel-index/releases/tag/v2.0.0) 下载静态站点 ZIP，解压后直接打开其中的 `index.html`。这个文件已内嵌样式、脚本和 SVG 视觉资源，也可以放到静态网站根目录托管。Release 同时提供 GitHub 自动生成的源码压缩包。

在源码目录本地预览时，需要 Node.js 18 或以上：

```sh
npm start
```

然后访问 `http://localhost:4173`。项目没有 npm 依赖，无需先安装软件包。这个预览服务器只监听本机。

## 页面内容

| 场景 | 内容 |
| --- | --- |
| 00 · ORIGIN | 品牌口号与像素原子视觉 |
| 01 · PHILOSOPHY | 关于渺核及品牌理念 |
| 02 · SELECTED WORK | GDMU-NA TokenHub 项目展示与外部入口 |
| 03 · WHAT'S NEXT | 品牌收束与返回顶部入口 |

页面支持顶部导航、场景指示、移动端菜单、代码雨切换和动效暂停。系统启用“减少动态效果”时，页面默认使用静态画面。项目终端及链路图标明为概念示意，不展示实时接口数据。

## 构建与检查

```sh
npm test
npm run build
```

`npm test` 运行 5 项 Node 测试，检查核心函数、场景锚点、项目配置和外链属性。`npm run build` 根据源码重新生成完全内联的 `dist/index.html`。单文件版本无需额外图片、字体或脚本文件。

主要文件：

| 路径 | 用途 |
| --- | --- |
| `index.html` | 页面文案、语义结构、导航和项目入口 |
| `styles.css` | 排版、响应式布局和视觉样式 |
| `js/core.js` | 基础函数和项目配置 |
| `js/visuals.js` | Canvas 视觉、字符雨和动效状态 |
| `js/app.js` | 菜单、场景导航、弹窗和复制反馈 |
| `assets/` | 品牌标记与点阵标题 SVG |
| `scripts/build.mjs` | 零依赖单文件构建 |
| `server.mjs` | 本地预览服务器 |
| `tests/`、`docs/` | 自动检查、设计来源与验证记录 |

修改项目网址时，请同步更新 `index.html` 和 `js/core.js` 中的地址，再运行测试与构建。点阵标题为 SVG；更换标题时也要同步检查图片的 `alt` 和 `aria-label`。

`scripts/generate-titles.py` 仅用于重新生成点阵标题，需另行准备 Python Pillow 与合适的本机字体。运行和部署网站不依赖该脚本，也不分发字体文件。

## 内容边界与验证

企业名称、口号、项目名称、定位和项目地址来自项目输入；其余延展文字是本版品牌文案。页面中的 `MIAOHE TECH` 用于视觉展示，不作为法定英文名称声明。项目外链是访问入口，页面不调用 TokenHub 接口，也不宣称其服务状态或性能。

浏览器验收记录见 [docs/verification.md](docs/verification.md)，内容来源见 [docs/sources.md](docs/sources.md)。已检查桌面与移动视口、减少动态效果，并在 Microsoft Edge 中直接打开解压后的单文件版本；这些检查不代表公开域名上的生产部署验收。仓库当前提供源码与静态站点下载包，未启用 GitHub Pages。
