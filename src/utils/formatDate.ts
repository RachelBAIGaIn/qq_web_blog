/**
 * 日期格式化工具
 * 将日期字符串格式化为中文友好的显示格式
 *
 * 示例：
 *   formatDate('2026-06-19') → '2026年6月19日'
 *   formatDateShort('2026-06-19') → '2026-06-19'
 */

/**
 * 格式化为完整中文日期
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化为短日期（YYYY-MM-DD）
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

/**
 * 估算文章阅读时间
 * 按中文阅读速度约 400 字/分钟计算
 */
export function estimateReadTime(text: string): number {
  // 去掉 Markdown 语法和空白字符后统计字数
  const cleaned = text
    .replace(/[#*`~\[\]()>_\-|]/g, '')
    .replace(/\s+/g, '');
  const charCount = cleaned.length;
  const minutes = Math.ceil(charCount / 400);

  // 至少显示 1 分钟
  return Math.max(1, minutes);
}
