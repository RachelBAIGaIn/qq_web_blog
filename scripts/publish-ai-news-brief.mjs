/**
 * AI 简报发布脚本
 *
 * 将生成的 Markdown 简报写入 src/content/ai-news/，
 * 更新 aiDailyBriefMeta.json，支持两种发布模式。
 *
 * 用法：
 *   node scripts/publish-ai-news-brief.mjs [--mode=auto|review] [--type=morning|evening]
 *
 * 模式说明：
 *   auto   — 抓取 → 生成 → 发布（全自动）
 *   review — 抓取 → 生成 → 写为 review 状态（默认，人工审核后发布）
 */
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync,
} from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = resolve(ROOT, 'src', 'content', 'ai-news');
const META_PATH = resolve(ROOT, 'src', 'data', 'aiDailyBriefMeta.json');
const CACHE_PATH = resolve(ROOT, 'data', 'ai-news-cache.json');

// ===================== 工具函数 =====================

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function saveJson(p, data) {
  const dir = dirname(p);
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
  writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

function todaySlug() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseArgs() {
  const args = { mode: 'review', type: null };
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--mode=')) { args.mode = arg.split('=')[1]; }
    if (arg.startsWith('--type=')) { args.type = arg.split('=')[1]; }
  });
  if (!args.type || !['morning', 'evening'].includes(args.type)) {
    const hour = new Date().getHours();
    args.type = hour < 14 ? 'morning' : 'evening';
  }
  return args;
}

/**
 * 检查当天对应时段的简报是否已存在
 */
function checkDuplicate(dateStr, briefType) {
  if (!existsSync(CONTENT_DIR)) { return false; }
  const files = readdirSync(CONTENT_DIR);
  const slug = `${dateStr}-ai-${briefType}-brief`;
  return files.some((f) => f.startsWith(slug));
}

/**
 * 更新日报名单缓存
 */
function updateDailyBriefsCache(dateStr, briefType) {
  const cache = existsSync(CACHE_PATH) ? loadJson(CACHE_PATH) : { processedUrls: [], dailyBriefs: {} };
  if (!cache.dailyBriefs) { cache.dailyBriefs = {}; }
  const key = `${dateStr}-${briefType}`;
  cache.dailyBriefs[key] = {
    date: dateStr,
    type: briefType,
    generatedAt: new Date().toISOString(),
  };
  saveJson(CACHE_PATH, cache);
}

/**
 * 更新最新简报元信息
 */
function updateMeta(briefType, data) {
  let meta = { morning: null, evening: null };
  if (existsSync(META_PATH)) { meta = loadJson(META_PATH); }

  meta[briefType] = {
    title: data.title,
    date: data.date,
    slug: data.slug,
    updatedAt: data.updatedAt || new Date().toISOString(),
    newsCount: data.newsCount || 0,
    status: data.status || 'review',
  };

  saveJson(META_PATH, meta);
  return meta;
}

// ===================== 主流程 =====================

async function main() {
  const args = parseArgs();
  const dateStr = todaySlug();
  const typeLabel = args.type === 'morning' ? '早报' : '晚报';

  console.log(`📰 AI行业${typeLabel} 发布流程开始`);
  console.log(`  日期: ${dateStr}`);
  console.log(`  模式: ${args.mode === 'auto' ? '自动发布' : '人工审核后发布'}`);

  // 1. 检查是否已生成
  const briefDir = resolve(ROOT, 'data', 'briefs');
  const mdPath = resolve(briefDir, `${dateStr}-ai-${args.type}-brief.md`);
  const summaryPath = resolve(briefDir, `${dateStr}-ai-${args.type}-brief-summary.json`);

  if (!existsSync(mdPath)) {
    console.log('📡 未找到已生成的简报，尝试抓取和生成...');

    // 运行抓取
    console.log('  1/3 抓取新闻...');
    try {
      execSync('node scripts/fetch-ai-news.mjs', {
        cwd: ROOT, stdio: 'inherit', encoding: 'utf-8',
      });
    } catch {
      console.error('❌ 抓取失败，终止发布');
      process.exit(1);
    }

    // 运行生成
    console.log('  2/3 生成简报...');
    try {
      execSync(`node scripts/build-ai-news-brief.mjs --type=${args.type}`, {
        cwd: ROOT, stdio: 'inherit', encoding: 'utf-8',
      });
    } catch {
      console.error('❌ 生成失败，终止发布');
      process.exit(1);
    }
  }

  // 2. 检查重复
  if (checkDuplicate(dateStr, args.type)) {
    console.log(`⚠️  ${dateStr} 的 AI行业${typeLabel} 已存在，跳过写入`);
    console.log('   如需重新生成，请先删除对应文件');
    process.exit(0);
  }

  // 3. 读取生成结果
  const mdContent = readFileSync(mdPath, 'utf-8');
  const summary = loadJson(summaryPath);

  // 4. 根据模式决定最终状态
  const finalStatus = args.mode === 'auto' ? 'published' : 'review';
  const finalContent = finalStatus === 'published'
    ? mdContent.replace('status: "review"', 'status: "published"')
    : mdContent;

  // 5. 写入 content 目录
  if (!existsSync(CONTENT_DIR)) { mkdirSync(CONTENT_DIR, { recursive: true }); }
  const destPath = resolve(CONTENT_DIR, `${dateStr}-ai-${args.type}-brief.md`);
  writeFileSync(destPath, finalContent, 'utf-8');
  console.log(`✅ 简报已写入: ${destPath}`);

  // 6. 更新元信息
  summary.status = finalStatus;
  const meta = updateMeta(args.type, summary);
  console.log('✅ 简报元信息已更新');

  // 7. 更新缓存
  updateDailyBriefsCache(dateStr, args.type);

  // 8. 输出结果
  console.log(`\n📋 发布摘要:`);
  console.log(`  标题: ${summary.title}`);
  console.log(`  状态: ${finalStatus === 'published' ? '✅ 已发布' : '🔍 待审核'}`);
  console.log(`  资讯数: ${summary.newsCount} 条`);

  if (finalStatus === 'review') {
    console.log(`\n💡 请人工审核以下文件后，将 status 改为 "published":`);
    console.log(`   ${destPath}`);
  }

  if (args.mode === 'auto') {
    console.log('\n🔄 尝试提交代码并触发部署...');
    try {
      execSync('git add src/content/ai-news/ src/data/aiDailyBriefMeta.json', {
        cwd: ROOT, encoding: 'utf-8',
      });
      execSync(
        `git commit -m "auto: AI行业${typeLabel} ${dateStr}" --allow-empty`,
        { cwd: ROOT, encoding: 'utf-8' },
      );
      execSync('git push', { cwd: ROOT, encoding: 'utf-8' });
      console.log('✅ 代码已提交并推送');
    } catch (err) {
      console.error('⚠️  Git 操作失败（可能无可提交内容）:', err.message);
    }
  }
}

main().catch((err) => {
  console.error('发布脚本异常:', err);
  process.exit(1);
});
