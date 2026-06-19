/**
 * AI 简报审核发布工具
 *
 * 列出所有待审核的简报，支持一键发布。
 *
 * 用法：
 *   node scripts/review-briefs.mjs              # 列出所有待审核简报
 *   node scripts/review-briefs.mjs --publish    # 一键发布所有待审核简报
 *   node scripts/review-briefs.mjs --publish=2026-06-19-ai-morning-brief  # 发布指定简报
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT_DIR = resolve(ROOT, 'src', 'content', 'ai-news');
const META_PATH = resolve(ROOT, 'src', 'data', 'aiDailyBriefMeta.json');

function parseArgs() {
  const args = { publish: null };
  process.argv.slice(2).forEach((arg) => {
    if (arg === '--publish') { args.publish = 'all'; }
    if (arg.startsWith('--publish=')) {
      args.publish = arg.split('=')[1];
    }
  });
  return args;
}

function getReviewBriefs() {
  if (!existsSync(CONTENT_DIR)) { return []; }
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  const briefs = [];

  files.forEach((file) => {
    const content = readFileSync(resolve(CONTENT_DIR, file), 'utf-8');
    const statusMatch = content.match(/^status:\s*"(\w+)"/m);
    const status = statusMatch ? statusMatch[1] : 'published';
    const titleMatch = content.match(/^title:\s*"([^"]+)"/m);
    const title = titleMatch ? titleMatch[1] : file;
    const typeMatch = content.match(/^briefType:\s*"(\w+)"/m);
    const briefType = typeMatch ? typeMatch[1] : '';

    briefs.push({ file, title, status, briefType, path: resolve(CONTENT_DIR, file) });
  });

  return briefs;
}

function publishBrief(brief) {
  let content = readFileSync(brief.path, 'utf-8');
  content = content.replace(/^status:\s*"review"/m, 'status: "published"');
  content = content.replace(/^status:\s*"draft"/m, 'status: "published"');
  writeFileSync(brief.path, content, 'utf-8');

  // 更新元信息
  if (existsSync(META_PATH)) {
    const meta = JSON.parse(readFileSync(META_PATH, 'utf-8'));
    const key = brief.briefType;
    if (meta[key]) { meta[key].status = 'published'; }
    writeFileSync(META_PATH, JSON.stringify(meta, null, 2), 'utf-8');
  }
}

// ===================== 主流程 =====================

const args = parseArgs();
const briefs = getReviewBriefs();
const reviewBriefs = briefs.filter((b) => b.status === 'review' || b.status === 'draft');
const publishedBriefs = briefs.filter((b) => b.status === 'published');

if (!args.publish) {
  // 列表模式
  console.log('📋 AI 行业简报审核状态\n');
  console.log('─'.repeat(60));

  if (reviewBriefs.length === 0) {
    console.log('\n✅ 所有简报均已发布，无需审核。\n');
  } else {
    console.log(`\n🔍 待审核（${reviewBriefs.length} 篇）：\n`);
    reviewBriefs.forEach((b) => {
      const icon = b.briefType === 'morning' ? '🌅' : '🌇';
      const typeLabel = b.briefType === 'morning' ? '早报' : '晚报';
      const statusIcon = b.status === 'draft' ? '📝草稿' : '🔍待审';
      console.log(`  ${icon} ${statusIcon}  ${b.title}`);
      console.log(`     文件: src/content/ai-news/${b.file}`);
    });
  }

  if (publishedBriefs.length > 0) {
    console.log(`\n✅ 已发布（${publishedBriefs.length} 篇）：\n`);
    publishedBriefs.forEach((b) => {
      const icon = b.briefType === 'morning' ? '🌅' : '🌇';
      console.log(`  ${icon} ✅  ${b.title}`);
    });
  }

  console.log('\n─'.repeat(60));
  console.log('\n💡 操作提示：');
  console.log('  审核通过 → node scripts/review-briefs.mjs --publish');
  console.log('  发布单篇 → node scripts/review-briefs.mjs --publish=文件名');
  console.log('  手动修改 → 编辑 .md 文件，将 status: "review" 改为 status: "published"');
  console.log();
} else {
  // 发布模式
  if (args.publish === 'all') {
    if (reviewBriefs.length === 0) {
      console.log('✅ 没有待审核的简报。');
      process.exit(0);
    }
    console.log(`📰 正在发布 ${reviewBriefs.length} 篇简报...\n`);
    reviewBriefs.forEach((b) => {
      publishBrief(b);
      const icon = b.briefType === 'morning' ? '🌅' : '🌇';
      console.log(`  ${icon} ✅ 已发布: ${b.title}`);
    });
    console.log(`\n🎉 全部发布完成！重新构建站点即可生效。`);
  } else {
    // 发布指定文件
    const target = briefs.find((b) => b.file === args.publish);
    if (!target) {
      console.error(`❌ 未找到简报: ${args.publish}`);
      console.log('可用的简报文件：');
      briefs.forEach((b) => console.log(`  - ${b.file}`));
      process.exit(1);
    }
    if (target.status === 'published') {
      console.log(`⚠️  ${target.title} 已经是"已发布"状态。`);
      process.exit(0);
    }
    publishBrief(target);
    console.log(`✅ 已发布: ${target.title}`);
  }
}
