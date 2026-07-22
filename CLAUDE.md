# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Astro 5 的纯静态个人博客，无数据库/后端。所有文章以 Markdown 文件管理。

项目实际部署到 **Gitee Pages**（`https://rachelleo.gitee.io/QQ_Web_Blog`），通过 GiteeGo CI 流水线自动构建和部署。同时兼容 Vercel/Netlify/GitHub Pages。

核心特色：**AI 资讯每日早报/晚报自动生成系统** — 通过 GiteeGo 定时触发，自动抓取 30+ AI 新闻源，按模板生成简报 Markdown 文件，经人工审核后发布。

## 常用命令

```bash
npm install          # 安装依赖（首次）
npm run dev          # 启动开发服务器 → http://localhost:4321
npm run build        # 生产构建，输出到 dist/
npm run preview      # 预览构建产物
```

没有测试框架和 lint 工具，纯前端静态项目。

### AI 简报脚本（手动运行）

```bash
# 抓取 AI 新闻（可指定时间窗口和输出路径）
node scripts/fetch-ai-news.mjs [--hours=24] [--output=data/result.json]

# 生成早报/晚报 Markdown（依赖抓取结果）
node scripts/build-ai-news-brief.mjs [--type=morning|evening] [--input=data/news.json]

# 发布简报（抓取→生成→写入 content 目录，支持 auto/review 模式）
node scripts/publish-ai-news-brief.mjs [--mode=review|auto] [--type=morning|evening]

# 审核简报列表 / 一键发布
node scripts/review-briefs.mjs              # 列出所有待审核简报
node scripts/review-briefs.mjs --publish    # 全部发布
node scripts/review-briefs.mjs --publish=2026-06-19-ai-morning-brief  # 单篇发布
```

## 架构分层

```
personal-blog/
  .workflow/           → GiteeGo CI 流水线定义（定时触发 AI 简报）
  scripts/             → AI 简报脚本（抓取/生成/发布/审核）
  data/                → 新闻源配置、抓取缓存、简报中间产物
  public/              → 静态资源（图片等）
  src/
    config/            → 站点配置（siteConfig, navItems），修改网站信息只需改这里
    content/           → Markdown 文章内容 + Zod schema 定义（astro:content 集合）
    data/              → 运行时元数据（aiDailyBriefMeta.json：最新简报状态）
    layouts/           → 页面布局框架（BaseLayout 通用页, PostLayout 文章详情页）
    pages/             → 路由页面，文件路径即 URL（Astro 文件路由）
    components/        → 可复用 UI 组件
    utils/             → 数据获取和工具函数（posts.ts, formatDate.ts, search.ts）
    styles/            → 全局样式 global.css + 文章样式 article.css
```

## AI 新闻简报自动化流水线

这是项目最复杂的子系统。每天 08:00（早报）和 20:00（晚报）由 GiteeGo CI 自动触发，或手动运行脚本。

### 数据流

```
data/news-sources.json          ← 30+ 新闻源配置（RSS/页面抓取）
        ↓
scripts/fetch-ai-news.mjs       ← 抓取新闻 → data/.fetched-news-{date}.json
        ↓
scripts/build-ai-news-brief.mjs ← 分类+生成 Markdown → data/briefs/{slug}.md
        ↓
scripts/publish-ai-news-brief.mjs ← 写入 src/content/ai-news/ + 更新元信息
        ↓                        ← 人工审核（review 模式）或自动发布（auto 模式）
src/content/ai-news/{slug}.md   ← Astro 内容集合自动识别
        ↓
npm run build                   ← 构建为静态页面
        ↓
dist/ → Gitee Pages (pages 分支) ← 部署
```

### 四个脚本的分工

| 脚本 | 职责 | 输入 | 输出 |
|------|------|------|------|
| `fetch-ai-news.mjs` | 从 RSS/页面抓取新闻，去重，按优先级排序 | `data/news-sources.json` | `data/.fetched-news-{date}.json` |
| `build-ai-news-brief.mjs` | 按 8 个栏目分类，生成 Markdown 简报 | 抓取结果 JSON | `data/briefs/{slug}.md` + summary JSON |
| `publish-ai-news-brief.mjs` | 写入 content 目录，更新元信息，可选 git 提交 | 生成的 .md | `src/content/ai-news/{slug}.md` |
| `review-briefs.mjs` | 列出/发布待审核简报 | `src/content/ai-news/` | 状态变更为 published |

### 简报的 8 个栏目（分类规则在 build-ai-news-brief.mjs）

1. 模型与产品发布、2. AI 芯片/算力硬件、3. 产业与大事件、4. 开源工具链/Agent SDK 更新、5. Skills 更新/有趣 Skills、6. 国内AI行业最新状态 + 默认归类

### 发布模式

- **review（默认）**：生成后 status 为 `review`，需人工运行 `review-briefs.mjs --publish` 审核发布
- **auto**：生成后自动 git commit & push，触发 CI 构建部署
- 通过 `.env` 的 `AI_BRIEF_PUBLISH_MODE` 或 `--mode` 参数控制

### CI 流水线（.workflow/ai-news-daily.yml）

GiteeGo 定时触发（cron: `0 8,20 * * *`），三个阶段：
1. `publish-ai-news-brief.mjs --mode=review` → 生成待审核简报
2. `npm run build` → 构建 Astro 站点
3. 将 `dist/` 推送到 `pages` 分支 → Gitee Pages 自动更新

### 关键数据文件

| 文件 | 用途 |
|------|------|
| `data/news-sources.json` | 新闻源配置（name, type, url, enabled, priority, region） |
| `data/ai-news-cache.json` | 已抓取 URL 缓存（防重复）+ 日报记录 |
| `data/.fetched-news-{date}.json` | 当天抓取的原始新闻数据 |
| `data/briefs/{date}-ai-{morning\|evening}-brief.md` | 生成的简报 Markdown |
| `data/briefs/{date}-ai-{morning\|evening}-brief-summary.json` | 简报摘要元信息 |
| `src/data/aiDailyBriefMeta.json` | 最新早报/晚报的元信息（供前端读取） |

## 核心机制

### 内容集合（Content Collections）

`src/content/config.ts` 定义了四个集合，均使用 Zod 校验 frontmatter：

| 集合 | 目录 | Schema 特点 |
|------|------|------------|
| `life` | `src/content/life/` | 标准文章（title, date, category, tags, cover, description） |
| `ai-news` | `src/content/ai-news/` | 标准文章 + 日报扩展字段（isDailyBrief, briefDate, briefType, newsCount, status, sourceName, sourceUrl, publishedAt） |
| `skills` | `src/content/skills/` | 标准文章 |
| `projects` | `src/content/projects/` | 额外字段：techStack[], demoUrl, repoUrl |

**ai-news 日报特有字段说明**：`isDailyBrief` 标记是否为自动生成的日报；`briefType` 为 `morning`/`evening`；`status` 为 `draft`/`review`/`published` 控制是否在前端展示。

### 数据流

1. `src/utils/posts.ts` 封装了所有 `getCollection()` 调用，提供 `getAllPosts()`, `getPostsByCollection()`, `getLatestPosts()`, `getAllProjects()`, `getCategories()`, `getAllTags()`, `getDailyBriefs()`（返回最新早晚报及分类列表）
2. 各 `.astro` 页面在 frontmatter 中调用这些函数获取数据
3. 文章按日期降序排列
4. `src/data/aiDailyBriefMeta.json` 由发布脚本自动维护，存储最新早晚报元信息

### 路由约定

- **列表页**：`src/pages/<collection>/index.astro` → `/<collection>/`
- **详情页**：`src/pages/<collection>/[...slug].astro` → 通过 `getStaticPaths()` 生成静态路由，使用 `PostLayout` 渲染
- **特殊页**：`index.astro`（首页）、`search.astro`（搜索）、`about.astro`（关于）、`404.astro`

### Astro 配置要点

`astro.config.mjs` 中的关键设置：

- **base 路径切换**：开发时 `/`，生产构建时 `/QQ_Web_Blog/`（Gitee Pages 仓库名）。所有内部链接和资源路径需使用 `Astro.url` 或相对路径，否则生产环境会 404
- **devToolbar**：已关闭（`enabled: false`），保持页面干净
- **site**：开发 `http://localhost:4321`，生产 `https://rachelleo.gitee.io`

### 路径别名

在 `astro.config.mjs` 和 `tsconfig.json` 中定义：
- `@components/` → `src/components/`
- `@layouts/` → `src/layouts/`
- `@utils/` → `src/utils/`
- `@config/` → `src/config/`
- `@styles/` → `src/styles/`

### 部署

- **主要部署目标**：Gitee Pages（通过 GiteeGo CI 自动部署到 `pages` 分支）
- **CI 触发**：每日 08:00/20:00 定时触发 + 代码推送触发
- **环境变量**（GiteeGo 中配置）：`PAGES_USER`、`PAGES_TOKEN`（Gitee 账号凭据，用于 git push）
- 也兼容 Vercel/Netlify/GitHub Pages，只需修改 `astro.config.mjs` 中的 `site` 和 `base`

### 样式方案

纯 CSS，无框架。`global.css` 定义 CSS 自定义属性（颜色、间距、阴影等），组件内使用 `<style>` 标签写局部样式。文章详情页额外加载 `article.css`。

### 搜索

前端本地搜索，匹配标题/摘要/分类/标签。用户在搜索页输入关键词，`searchPosts()` 函数过滤 `getAllPosts()` 结果。

## 新增文章流程

1. 在对应 `src/content/<collection>/` 下新建 `.md` 文件
2. 填写 frontmatter（参考已有文章的格式）
3. 如需封面图，放入 `public/images/posts/<collection>/`
4. 保存后开发服务器自动热更新
