/**
 * 文章数据处理工具
 * 统一提供文章排序、筛选、分类汇总等功能
 *
 * 各页面通过这些函数获取文章数据，保证处理逻辑一致
 */
import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * 获取所有文章（不包含项目），按日期从新到旧排序
 */
export async function getAllPosts() {
  const lifePosts = await getCollection('life');
  const aiNewsPosts = await getCollection('ai-news');
  const skillsPosts = await getCollection('skills');

  const allPosts = [...lifePosts, ...aiNewsPosts, ...skillsPosts];

  // 按日期从新到旧排序
  allPosts.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();

    return dateB - dateA;
  });

  return allPosts;
}

/**
 * 获取某个板块的文章
 */
export async function getPostsByCollection(
  collectionName: 'life' | 'ai-news' | 'skills',
) {
  const posts = await getCollection(collectionName);
  posts.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();

    return dateB - dateA;
  });

  return posts;
}

/**
 * 获取所有项目数据
 */
export async function getAllProjects() {
  const projects = await getCollection('projects');
  projects.sort((a, b) => {
    const dateA = new Date(a.data.date).getTime();
    const dateB = new Date(b.data.date).getTime();

    return dateB - dateA;
  });

  return projects;
}

/**
 * 获取最新几篇文章
 */
export async function getLatestPosts(count: number = 6) {
  const allPosts = await getAllPosts();

  return allPosts.slice(0, count);
}

/**
 * 获取所有分类及每个分类的文章数量
 */
export async function getCategories() {
  const allPosts = await getAllPosts();
  const categoryMap = new Map<string, number>();

  allPosts.forEach((post) => {
    const category = post.data.category || '未分类';
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));
}

/**
 * 获取所有标签
 */
export async function getAllTags() {
  const allPosts = await getAllPosts();
  const tagMap = new Map<string, number>();

  allPosts.forEach((post) => {
    const tags = post.data.tags || [];
    tags.forEach((tag: string) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 获取 AI 资讯中的日报（早报 / 晚报），按日期从新到旧排序
 */
export async function getDailyBriefs() {
  const posts = await getCollection('ai-news');
  const briefs = posts
    .filter((p) => p.data.isDailyBrief === true)
    .sort((a, b) => {
      const dateA = new Date(a.data.date).getTime();
      const dateB = new Date(b.data.date).getTime();
      return dateB - dateA;
    });

  const morningBriefs = briefs.filter((b) => b.data.briefType === 'morning');
  const eveningBriefs = briefs.filter((b) => b.data.briefType === 'evening');
  const latestMorning = morningBriefs.length > 0 ? morningBriefs[0] : null;
  const latestEvening = eveningBriefs.length > 0 ? eveningBriefs[0] : null;

  return { briefs, morningBriefs, eveningBriefs, latestMorning, latestEvening };
}

export type { CollectionEntry };
