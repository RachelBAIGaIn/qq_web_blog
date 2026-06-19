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

// AI 资讯专用 schema（在通用 schema 基础上增加日报字段）
const aiNewsSchema = z.object({
  title: z.string(),
  date: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  cover: z.string().optional(),
  description: z.string().optional(),
  // 日报相关字段
  sourceName: z.string().optional(),
  sourceUrl: z.string().optional(),
  publishedAt: z.string().optional(),
  isDailyBrief: z.boolean().optional().default(false),
  briefDate: z.string().optional(),
  briefType: z.enum(['morning', 'evening']).optional(),
  newsCount: z.number().optional(),
  status: z.enum(['draft', 'review', 'published']).optional().default('published'),
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
  // AI 资讯文章（使用扩展 schema，支持日报字段）
  'ai-news': defineCollection({ schema: aiNewsSchema }),
  // 技能学习文章
  skills: defineCollection({ schema: postSchema }),
  // 项目展示
  projects: defineCollection({ schema: projectSchema }),
};
