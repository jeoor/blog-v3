# 敖苛记

[![框架](https://img.shields.io/badge/框架-Nuxt-00DC82?logo=Nuxt.js)](https://nuxt.com/)
[![CMS](https://img.shields.io/badge/CMS-Nuxt%20Content-00DC82?logo=Nuxt.js)](https://content.nuxt.com/)
[![部署平台](https://img.shields.io/badge/部署平台-EdgeOne-00A4FF)](https://edgeone.ai/)
[![访问统计](https://img.shields.io/badge/访问统计-Umami-000000?logo=Umami)](https://github.com/umami-software/umami)
[![代码风格](https://img.shields.io/badge/代码风格-ESLint-4B32C3?logo=ESLint)](https://eslint.org/)
[![代码风格](https://img.shields.io/badge/代码风格-Stylelint-263238?logo=Stylelint)](https://stylelint.io/)

我的个人博客，于 2026 年 2 月 13 日上线，主要记录技术实践、开源探索与日常生活。

[访问敖苛记](https://blog.kayro.cn/) · [Atom 订阅](https://blog.kayro.cn/atom.xml) · [OPML 订阅集合](https://blog.kayro.cn/feeds.opml)

本项目基于 [Clarity / blog-v3](https://github.com/L33Z22L11/blog-v3) 持续定制。

添加的功能：关于页、相册、即刻（说说）、标签、友圈等独立页面。

## 耻辱柱 / Hall of Shame

> 本节保留上游项目对授权和内容转载的说明。

> [!CAUTION]
> - 部署前必须完成项目个性化配置与内容修改，不得将我的信息用于你的网站图标/名称，严禁将项目内我的文章以你的名义重新发布至公开环境。
> - 部署前必须完成项目个性化配置与内容修改，不得将我的信息用于你的网站图标/名称，严禁将项目内我的文章以你的名义重新发布至公开环境。
> - 部署前必须完成项目个性化配置与内容修改，不得将我的信息用于你的网站图标/名称，严禁将项目内我的文章以你的名义重新发布至公开环境。

近期 Fork 项目后将我的文章部署在互联网且不遵守 CC 协议的行为增加，追查耗费了我巨大精力，因此我将直接将侵权网站列在下方，希望能减少此类现象的发生。

<!-- 1. 2025-12-05 [钟神秀](https://github.com/zsxcoder/Nuxt-blog-v3)：blog.zsxcoder.top《我们的设备被拿来做了什么：软件的背景行为》 -->
<!-- 2. 2025-12-28 [Axel Beta](https://github.com/ErenAxel/blog-v3)：sc.axel.xin《我们的设备被拿来做了什么：软件的背景行为》《深色模式开发的最佳实践》《寻不回手工油糕》 -->

## 特性

[主题特性](https://blog.zhilu.site/theme) · [组件示例](https://blog.zhilu.site/previews/example)

## 目录结构

项目使用 [Nuxt 4 项目目录结构](https://nuxt.com/docs/4.x/guide/directory-structure/app/app)。

```text
.
├── app # 前端应用
│   ├── assets # SCSS 与图标资源
│   ├── components # Vue 组件
│   │   ├── about # 关于页组件
│   │   ├── blog # 博客布局组件
│   │   ├── content # MDC 组件
│   │   ├── partial # 基础交互组件
│   │   ├── popover # 搜索与灯箱弹层
│   │   ├── post # 文章组件
│   │   ├── util # 通用功能组件
│   │   └── widget # 侧栏小组件
│   ├── composables # Vue 组合式函数
│   ├── pages # 页面路由
│   │   ├── [...slug].vue # 正文与 404 页面
│   │   ├── about.vue # 关于
│   │   ├── archive.vue # 归档
│   │   ├── essay.vue # 即刻
│   │   ├── fcircle.vue # 友圈
│   │   ├── gallery.vue # 相册
│   │   ├── index.vue # 首页
│   │   ├── link.vue # 友链
│   │   ├── preview.vue # 文章预览
│   │   └── tags.vue # 标签
│   ├── plugins # Nuxt / Vue 插件
│   ├── stores # Pinia 状态管理
│   ├── types # 类型定义
│   ├── utils # 前端工具函数
│   ├── app.config.ts # 前端展示配置★
│   ├── app.vue # 应用布局
│   ├── error.vue # 全局错误页
│   └── feeds.ts # 友链订阅源配置★
├── cloud-functions # EdgeOne 云函数
│   └── api/umami.ts # Umami 统计代理
├── content # Nuxt Content 内容
│   ├── posts # 博客文章
│   ├── about.md # 关于页内容
│   └── link.md # 友链说明
├── modules # 本地 Nuxt 模块
│   └── anti-mirror # 恶意反代跳转
├── patches # pnpm 第三方依赖补丁
├── public # 站点根目录静态资源
│   ├── assets # Atom 订阅源样式
│   ├── banners # 页面横幅
│   ├── fonts # 本地字体
│   └── icons # 平台图标
├── remark-plugins # Remark / Rehype 内容插件
├── scripts # 内容与维护脚本
│   └── framework # 订阅源检测工具
├── server # Nitro 服务端
│   ├── api # API 接口
│   │   ├── stats.get.ts # 博客静态统计
│   │   └── umami.get.ts # Umami 统计接口
│   └── routes # 根路由
│       ├── atom.xml.get.ts # Atom 订阅源
│       └── feeds.opml.get.ts # OPML 订阅源集合
├── shared # 前后端共享工具
│   └── utils
├── blog.config.ts # 博客核心配置★
├── content.config.ts # Nuxt Content 配置
├── edgeone.json # EdgeOne Makers 配置
├── nuxt.config.ts # Nuxt 配置
├── package.json # 项目脚本与依赖
├── pnpm-workspace.yaml # pnpm catalog 与安装策略
└── redirects.json # 历史路径重定向
```

## 快速开始

### 安装依赖

```sh
pnpm i
```

如果你擅长前端并且需要安装 npm 包，推荐通过 `@antfu/nip` 包提供的 `nip` 命令安装 npm 包到合适的 catalog 下。

### 初始配置

```sh
pnpm init-project # 初始化项目配置
```

- 在启动或部署项目时，你需要移除我的文章、我的个人信息、我的统计/评论配置。
  - `blog.config.ts` 中的站点信息、Umami 站点统计、Cloudflare Insights 统计、Twikoo 评论服务源。
  - `app.config.ts` 中的页脚导航、出生年份等。

- 为保证开发体验，需要安装 ESLint、Stylelint 等 VS Code 扩展。如果你不喜欢此项目的格式化风格，可以在 `./eslint.config.mjs` 和 `./.vscode/settings.json` 中调整或者不安装 VS Code 扩展。

- 如果文章 URL 和先前的不相同，可以通过编辑 `redirects.json` 来添加重定向。

### 创建文章

- 启用 `blog.config.ts` 中的 `article.useRandomPremalink`，即可在创建文章时随机生成 URL。

```sh
pnpm new
```

### 运行开发环境

```sh
pnpm dev
```

### 构建生产环境

```sh
pnpm generate
pnpm preview
```

### 部署指南

支持 Vercel、Netlify、Cloudflare Pages、EdgeOne Makers 等平台部署。建议采用静态（SSG）部署方式：

- 构建命令: `pnpm generate`
- 输出目录: `dist`
- 安装命令: `pnpm i`

如果直接使用平台提供的“Nuxt”预设部署，则会变成 SSR 模式，此模式每次访问都会等待服务端重新渲染。请参阅 [Nuxt 文档](https://nuxt.com/docs/getting-started/deployment) 和 [Nuxt Content 文档](https://content.nuxt.com/docs/deploy/static) 的“部署”一节。

#### 疑难解答

- 当你发现文章页面 404 问题时，请注意文章 URL 不应尾随 `/`。
- 如果修改了 API 路径，使用 EdgeOne Makers 部署需要同步修改 `edgeone.json`。
- 运行、部署项目时 Node.js 版本需要遵照 `package.json` 限制，推荐使用 Node LTS 最新版。

### 检测友链状态

```sh
pnpm check:feed # 检测某友链 / 任意 URL 的托管商及可访问性
pnpm check:feed/all # 检测所有友链可访问性并生成报告
```

## 贡献

欢迎参与项目：如果有具体问题或功能建议，可以发起 Issue；如果愿意在已确定的方向上增加功能或修复问题，可以提交 Pull Request。

## 许可证

- 项目本体：[MIT](LICENSE)
- 博客文章：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans)
- 希望你在页脚保留此项目链接，助力开源传播。
