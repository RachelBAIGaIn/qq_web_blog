/**
 * AI 新闻抓取脚本
 *
 * 从 news-sources.json 中配置的来源抓取最新 AI 资讯。
 * 优先使用 RSS，RSS 不可用时降级为页面抓取。
 *
 * 用法：node scripts/fetch-ai-news.mjs [--hours=24] [--output=data/result.json]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCES_PATH = resolve(ROOT, 'data', 'news-sources.json');
const CACHE_PATH = resolve(ROOT, 'data', 'ai-news-cache.json');

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function saveJson(p, data) {
  const dir = dirname(p);
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
  writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

function parseArgs() {
  const args = {
    hours: 24,
    output: resolve(ROOT, 'data', `.fetched-news-${todaySlug()}.json`),
  };
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--hours=')) { args.hours = parseInt(arg.split('=')[1], 10); }
    if (arg.startsWith('--output=')) { args.output = resolve(ROOT, arg.split('=')[1]); }
  });
  return args;
}

function todaySlug() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function cutoffTime(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

/**
 * 解析 RSS XML 为新闻条目数组。
 * 使用简单的正则解析，避免引入第三方依赖。
 */
function parseRSS(xml, sourceName, sourceUrl) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = extractTag(content, 'title');
    const link = extractTag(content, 'link');
    const pubDate = extractTag(content, 'pubDate');
    const description = extractTag(content, 'description');
    if (title && link) {
      items.push({
        title: unescapeXml(title),
        url: link.trim(),
        date: pubDate ? new Date(pubDate).toISOString() : null,
        summary: description ? unescapeXml(stripHtml(description)).slice(0, 200) : '',
        sourceName,
        sourceUrl,
        region: 'international',
        priority: 1,
      });
    }
  }
  return items;
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

function unescapeXml(s) {
  return s
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, '');
}

/**
 * 清理从 HTML 页面抓取的标题文本。
 * 去掉日期前缀和分类标签，如:
 * "Jun 12, 2026AnnouncementsClaude Fable 5" → "Claude Fable 5"
 */
function cleanPageTitle(raw) {
  let t = raw
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  // 循环清理前缀，处理 "AnnouncementsJun 2, 2026Title" 这类多层嵌套
  for (let i = 0; i < 3; i++) {
    const prev = t;
    // 去掉日期前缀: "Jun 12, 2026", "2026-06-12" 等
    t = t.replace(
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s*\d{4}\s*/i,
      '',
    );
    t = t.replace(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}\s*/, '');
    // 去掉分类标签（支持标签后紧跟文字）
    t = t.replace(
      /^(Announcements|Policy|Research|Product|Company|Events|Press)/i,
      '',
    );
    // 去掉数字编号前缀
    t = t.replace(/^\d+\.\s*/, '');
    if (t === prev) { break; }
  }
  // 如果标题太短，说明清理过度，回退到原始
  if (t.length < 10) { t = raw.replace(/\s+/g, ' ').trim(); }
  return t.trim();
}

/**
 * 从 HTML 页面中提取链接和标题。
 * 用于没有 RSS 的来源。
 */
function parsePageLinks(html, sourceName, sourceUrl) {
  const items = [];
  const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set();
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = stripHtml(match[2]).trim();
    if (text.length > 15 && text.length < 200
      && !seen.has(href) && !href.startsWith('#')
      && (href.includes('blog') || href.includes('news')
        || href.includes('research') || href.includes('index'))) {
      seen.add(href);
      items.push({
        title: cleanPageTitle(text),
        url: href.startsWith('http') ? href : new URL(href, sourceUrl).href,
        date: new Date().toISOString(),
        summary: '',
        sourceName,
        sourceUrl,
        region: 'international',
        priority: 1,
      });
    }
  }
  return items;
}

async function fetchWithTimeout(url, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AI-News-Fetcher/1.0 (daily-brief-bot)' },
    });
    if (!res.ok) { return null; }
    const text = await res.text();
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromSource(source) {
  const content = await fetchWithTimeout(source.url);
  if (!content) {
    console.error(`  [WARN] 无法获取内容: ${source.name} (${source.url})`);
    return [];
  }
  if (source.type === 'rss' || content.startsWith('<?xml') || content.includes('<rss')) {
    return parseRSS(content, source.name, source.url);
  }
  return parsePageLinks(content, source.name, source.url);
}

async function main() {
  const args = parseArgs();
  console.log(`📡 AI 新闻抓取开始 (窗口: ${args.hours}h)`);

  const sources = loadJson(SOURCES_PATH).filter((s) => s.enabled);
  console.log(`📋 共 ${sources.length} 个新闻源`);

  const cache = loadJson(CACHE_PATH);
  const cutoff = cutoffTime(args.hours);
  const allItems = [];
  const processedUrls = new Set(cache.processedUrls || []);

  for (const source of sources) {
    console.log(`\n🔍 正在抓取: ${source.name}...`);
    try {
      const items = await fetchFromSource(source);
      const newItems = items.filter((item) => {
        if (processedUrls.has(item.url)) { return false; }
        if (item.date && new Date(item.date) < cutoff) { return false; }
        return true;
      });
      newItems.forEach((item) => {
        item.sourceName = source.name;
        item.priority = source.priority || 1;
        item.region = source.region || 'international';
      });
      console.log(`  ✅ 获取 ${items.length} 条，其中 ${newItems.length} 条为新资讯`);
      allItems.push(...newItems);
    } catch (err) {
      console.error(`  ❌ 抓取失败: ${source.name}`, err.message);
    }
  }

  // 去重（按 URL）
  const uniqueItems = [];
  const seenUrls = new Set();
  allItems.forEach((item) => {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueItems.push(item);
    }
  });

  // 按日期和优先级排序
  uniqueItems.sort((a, b) => {
    const pa = a.priority || 1;
    const pb = b.priority || 1;
    if (pa !== pb) { return pa - pb; }
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  // 保存结果
  saveJson(args.output, uniqueItems);

  // 更新缓存
  uniqueItems.forEach((item) => processedUrls.add(item.url));
  cache.processedUrls = Array.from(processedUrls).slice(-5000);
  cache.lastFetchTime = new Date().toISOString();
  saveJson(CACHE_PATH, cache);

  console.log(`\n✨ 抓取完成: 共 ${uniqueItems.length} 条有效资讯`);
  console.log(`📁 输出: ${args.output}`);
}

main().catch((err) => {
  console.error('抓取脚本异常:', err);
  process.exit(1);
});
