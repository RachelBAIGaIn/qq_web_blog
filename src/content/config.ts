/**
 * 内容集合配置
 * 定义四大板块的文章数据格式
 *
 * 每个板块的文章顶部都需要包含这些字段（在两条 --- 之间）
 */
import { defineCollection, z } from 'astro:content';

// 文章集合通用 schema
const postSchema = z.object({
  title: z.string(),
  date: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  cover: z.string().optional(),
  description: z.string().optional(),
});

// 项目集合 schema（比文章多了技术栈和链接字段）
const projectSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string().optional(),
  cover: z.string().optional(),
  techStack: z.array(z.string()).optional().default([]),
  demoUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

// 定义四个内容集合
export const collections = {
  // 生活分享文章
  life: defineCollection({ schema: postSchema }),
  // AI 资讯文章
  'ai-news': defineCollection({ schema: postSchema }),
  // 技能学习文章
  skills: defineCollection({ schema: postSchema }),
  // 项目展示
  projects: defineCollection({ schema: projectSchema }),
};
