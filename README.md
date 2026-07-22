# 个人博客网站

一个新手友好的个人博客网站，基于 **Astro** + **Markdown** 构建。无需数据库和后台系统，所有文章以文件形式管理，易于维护和部署。

## ✨ 特性

- 🏠 **首页**：个人介绍、四大板块入口、最新文章、精选项目
- 🌿 **生活分享**：记录日常生活、感悟随笔
- 🤖 **AI 资讯**：AI 新闻动态、工具更新、行业观察
- 📚 **技能学习**：技术笔记、知识总结、踩坑记录
- 🚀 **项目展示**：个人项目作品集，卡片式展示
- 🔍 **搜索功能**：支持按标题、摘要、分类、标签搜索
- 📱 **响应式设计**：完美适配电脑、平板、手机
- 🎨 **简约主题**：干净、清爽、阅读舒适

## 🚀 本地运行

### 环境要求

- Node.js 18 或以上版本（推荐 LTS 长期稳定版）

### 步骤

```bash
# 1. 进入项目目录
cd personal-blog

# 2. 安装依赖
npm install

# 3. 启动本地预览
npm run dev

# 4. 浏览器打开 http://localhost:4321
```

### 其他命令

```bash
# 打包正式网站
npm run build

# 预览打包后的网站
npm run preview
```

## 📁 目录结构

```
personal-blog/
  public/                     # 静态资源（图片等）
    images/
      avatar/                 # 头像和个人照片
      posts/                  # 文章封面图和配图
      projects/               # 项目截图
  src/
    components/               # 可复用组件
      Header.astro            # 顶部导航栏
      Footer.astro            # 底部页脚
      PostCard.astro          # 文章卡片
      ProjectCard.astro       # 项目卡片
      SearchBox.astro         # 搜索框
      TagList.astro           # 标签列表
    config/                   # 网站配置
      site.ts                 # 网站名称、作者、头像、社交链接
      nav.ts                  # 导航菜单
    content/                  # 文章内容（Markdown 文件）
      life/                   # 生活分享文章
      ai-news/                # AI 资讯文章
      skills/                 # 技能学习文章
      projects/               # 项目展示内容
      config.ts               # 内容集合配置
    layouts/                  # 页面布局
      BaseLayout.astro        # 普通页面布局
      PostLayout.astro        # 文章详情页布局
    pages/                    # 网站页面
      index.astro             # 首页
      life/                   # 生活板块
      ai-news/                # AI 资讯板块
      skills/                 # 技能学习板块
      projects/               # 项目展示板块
      search.astro            # 搜索页
      about.astro             # 关于我页面
      404.astro               # 404 页面
    styles/                   # 样式文件
      global.css              # 全局样式
      article.css             # 文章排版样式
    utils/                    # 工具函数
      posts.ts                # 文章数据处理
      formatDate.ts           # 日期格式化
      search.ts               # 搜索功能
  astro.config.mjs            # Astro 项目配置
  package.json                # 项目信息
  tsconfig.json               # TypeScript 配置
```

## 📝 新增文章

以新增生活文章为例：

1. 打开 `src/content/life/` 文件夹
2. 新建一个 `.md` 文件，例如 `my-weekend.md`
3. 复制以下模板：

```md
---
title: "文章标题"
date: "2026-06-19"
category: "生活随笔"
tags: ["日常", "感悟"]
cover: "/images/posts/life/my-cover.jpg"
description: "简短的文章摘要。"
---

# 文章标题

正文内容写在这里...
```

4. 修改标题、日期、分类、标签和正文
5. 如果需要封面图，把图片放到 `public/images/posts/life/`
6. 保存文件，浏览器刷新即可看到新文章

## 🎨 修改网站信息

打开 `src/config/site.ts`，修改以下内容：

- `title`：网站名称
- `author`：作者名称
- `description`：网站简介
- `avatar`：头像图片路径
- `bio`：个人介绍
- `socialLinks`：社交链接

## 🚢 部署上线

### Vercel（推荐新手使用）

1. 把项目上传到 Gitee
2. 打开 [Vercel](https://vercel.com)，用 Gitee 账号登录
3. 选择博客项目仓库
4. 保持默认设置，点击部署
5. 等待部署完成，访问 Vercel 提供的网址

### 其他平台

也支持部署到 Netlify、Gitee Pages 等平台。详细教程见 `个人博客方案执行文档.md`。

## 🛠️ 技术栈

- [Astro](https://astro.build) - 静态网站框架
- [Markdown](https://www.markdownguide.org) - 文章格式
- CSS - 页面样式
- JavaScript/TypeScript - 交互逻辑

## 📄 相关文档

- `个人博客系统方案文档.md` - 项目整体设计方案
- `个人博客方案执行文档.md` - 详细执行和操作指南
