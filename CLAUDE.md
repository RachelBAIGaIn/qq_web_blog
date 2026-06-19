# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Astro 5 的纯静态个人博客，无数据库/后端。所有文章以 Markdown 文件管理，部署到 Vercel/Netlify/GitHub Pages。

## 常用命令

```bash
npm install          # 安装依赖（首次）
npm run dev          # 启动开发服务器 → http://localhost:4321
npm run build        # 生产构建，输出到 dist/
npm run preview      # 预览构建产物
```

没有测试框架和 lint 工具，纯前端静态项目。

## 架构分层

```
src/
  config/      → 站点配置（siteConfig, navItems），修改网站信息只需改这里
  content/     → Markdown 文章内容 + Zod schema 定义（astro:content 集合）
  layouts/     → 页面布局框架（BaseLayout 通用页, PostLayout 文章详情页）
  pages/       → 路由页面，文件路径即 URL（Astro 文件路由）
  components/  → 可复用 UI 组件（Header, Footer, PostCard, ProjectCard, SearchBox, TagList）
  utils/       → 数据获取和工具函数（posts.ts, formatDate.ts, search.ts）
  styles/      → 全局样式 global.css + 文章样式 article.css
```

## 核心机制

### 内容集合（Content Collections）

`src/content/config.ts` 定义了四个集合，均使用 Zod 校验 frontmatter：

| 集合 | 目录 | Schema 特点 |
|------|------|------------|
| `life` | `src/content/life/` | 标准文章（title, date, category, tags, cover, description） |
| `ai-news` | `src/content/ai-news/` | 同上 |
| `skills` | `src/content/skills/` | 同上 |
| `projects` | `src/content/projects/` | 额外字段：techStack[], demoUrl, repoUrl |

### 数据流

1. `src/utils/posts.ts` 封装了所有 `getCollection()` 调用，提供 `getAllPosts()`, `getPostsByCollection()`, `getLatestPosts()`, `getAllProjects()`, `getCategories()`, `getAllTags()`
2. 各 `.astro` 页面在 frontmatter 中调用这些函数获取数据
3. 文章按日期降序排列

### 路由约定

- **列表页**：`src/pages/<collection>/index.astro` → `/<collection>/`
- **详情页**：`src/pages/<collection>/[...slug].astro` → 通过 `getStaticPaths()` 生成静态路由，使用 `PostLayout` 渲染
- **特殊页**：`index.astro`（首页）、`search.astro`（搜索）、`about.astro`（关于）、`404.astro`

### 路径别名

在 `astro.config.mjs` 和 `tsconfig.json` 中定义：
- `@components/` → `src/components/`
- `@layouts/` → `src/layouts/`
- `@utils/` → `src/utils/`
- `@config/` → `src/config/`
- `@styles/` → `src/styles/`

### 样式方案

纯 CSS，无框架。`global.css` 定义 CSS 自定义属性（颜色、间距、阴影等），组件内使用 `<style>` 标签写局部样式。文章详情页额外加载 `article.css`。

### 搜索

前端本地搜索，匹配标题/摘要/分类/标签。用户在搜索页输入关键词，`searchPosts()` 函数过滤 `getAllPosts()` 结果。

## 新增文章流程

1. 在对应 `src/content/<collection>/` 下新建 `.md` 文件
2. 填写 frontmatter（参考已有文章的格式）
3. 如需封面图，放入 `public/images/posts/<collection>/`
4. 保存后开发服务器自动热更新
