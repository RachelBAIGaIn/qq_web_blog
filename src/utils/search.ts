/**
 * 搜索工具
 * 实现前端本地搜索，根据关键词匹配文章标题、摘要、分类和标签
 *
 * 搜索范围：
 * - 文章标题
 * - 文章摘要
 * - 文章分类
 * - 文章标签
 */
import type { CollectionEntry } from 'astro:content';

/**
 * 搜索文章
 * @param posts 所有文章数据
 * @param query 用户输入的关键词
 * @returns 匹配的文章列表
 */
export function searchPosts(
  posts: CollectionEntry<'life' | 'ai-news' | 'skills'>[],
  query: string,
): CollectionEntry<'life' | 'ai-news' | 'skills'>[] {
  if (!query || query.trim() === '') {
    return [];
  }

  const keyword = query.trim().toLowerCase();

  return posts.filter((post) => {
    const title = post.data.title?.toLowerCase() || '';
    const description = post.data.description?.toLowerCase() || '';
    const category = post.data.category?.toLowerCase() || '';
    const tags = (post.data.tags || [])
      .map((t: string) => t.toLowerCase())
      .join(' ');

    return (
      title.includes(keyword) ||
      description.includes(keyword) ||
      category.includes(keyword) ||
      tags.includes(keyword)
    );
  });
}
