/**
 * AI 早报 / 晚报生成脚本
 *
 * 读取已抓取的新闻数据，按统一模板生成 Markdown 简报文件。
 *
 * 用法：
 *   node scripts/build-ai-news-brief.mjs [--type=morning|evening] [--input=data/news.json]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BEIJING_TZ = 'Asia/Shanghai';

// ===================== 工具函数 =====================

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function saveJson(p, data) {
  const dir = dirname(p);
  if (!existsSync(dir)) { mkdirSync(dir, { recursive: true }); }
  writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

function getBeijingDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BEIJING_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return parts;
}

function todaySlug() {
  const parts = getBeijingDateParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function formatDateChinese(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ===================== 新闻分类 =====================

const CATEGORY_RULES = [
  {
    id: 'modelProduct',
    title: '模型与产品发布',
    keywords: [
      'GPT', 'Claude', 'Gemini', 'Llama', 'model', '模型',
      'release', '发布', 'launch', 'product', '产品', 'chatgpt',
      'Sora', 'DALL', 'Whisper', 'API', 'endpoint',
    ],
  },
  {
    id: 'chipHardware',
    title: 'AI 芯片 / 算力硬件',
    keywords: [
      'chip', '芯片', 'GPU', 'TPU', '算力', 'compute',
      'hardware', '硬件', 'H100', 'B100', 'infrastructure', '基础设施',
      'data center', '数据中心', 'server', '服务器',
      'Vera Rubin', 'RTX Spark', 'Blackwell', 'HBM',
    ],
  },
  {
    id: 'industry',
    title: '产业与大事件',
    keywords: [
      'acquisition', '收购', 'funding', '融资', 'partnership', '合作',
      'regulation', '监管', 'policy', '政策', 'office', '办公室',
      'EU', '欧洲', 'Korea', '韩国', 'Japan', '日本',
    ],
  },
  {
    id: 'openSource',
    title: '开源工具链 / Agent SDK 更新',
    keywords: [
      'open source', '开源', 'SDK', 'tool', '工具', 'framework', '框架',
      'agent', 'library', '库', 'github', 'release', 'MCP',
      'plugin', '插件', 'extension', '扩展',
    ],
  },
  {
    id: 'skills',
    title: 'Skills 更新 / 有趣 Skills',
    keywords: [
      'skill', 'skills', 'SKILL.md', 'skills.sh', 'claude code',
      'codex', 'cursor', 'copilot', 'gemini cli',
      '技能', '技能库', '角色', 'persona',
      'prompt', 'template', 'workflow', 'automation', '自动化',
      '安全运行时', 'sandbox', 'goal mode',
      '跨工具', 'agent技能', '开源技能',
    ],
  },
  {
    id: 'domestic',
    title: '国内AI行业最新状态',
    keywords: [
      '国内', '中国', '国产', '国产算力', '国产替代',
      '百度', '文心', '阿里', '通义', '千问',
      '字节', '豆包', '腾讯', '混元', '元宝',
      '智谱', 'GLM', 'DeepSeek', 'MiniMax',
      '科创板', '陆家嘴', '工信部', '证监会',
      '大模型企业', 'A股', '回A', '上市指引',
      '七部门', '自主可控', '国产芯片',
    ],
  },
];

// 匹配优先级
const MATCH_ORDER = [
  'domestic', 'modelProduct', 'chipHardware', 'industry', 'skills', 'openSource',
];

/**
 * 将单条新闻归类到对应栏目
 */
function categorizeNews(item) {
  const text = (item.title + ' ' + (item.summary || '')).toLowerCase();
  for (const id of MATCH_ORDER) {
    const rule = CATEGORY_RULES.find((r) => r.id === id);
    if (!rule) { continue; }
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        return rule.id;
      }
    }
  }
  return 'industry'; // 默认归入产业动态
}

// ===================== Markdown 生成 =====================

function generateMarkdown(items, briefType, dateStr) {
  const categorized = {};
  CATEGORY_RULES.forEach((r) => { categorized[r.id] = []; });

  items.forEach((item) => {
    const cat = categorizeNews(item);
    if (categorized[cat]) { categorized[cat].push(item); }
  });

  const typeLabel = briefType === 'morning' ? '早报' : '晚报';
  const timeLabel = briefType === 'morning' ? '早上 08:00' : '晚上 20:00';

  const d = new Date(dateStr);
  const shortDate = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;

  let md = '';
  md += `# ${shortDate} AI${typeLabel}\n\n`;
  md += `## 一、今日总览\n\n`;
  md += `- 汇总截至北京时间 ${timeLabel} 前最近一轮可直接核实的 AI 行业动态。\n`;
  md += `- 本轮共采集 ${items.length} 条来自一手来源的资讯。\n`;

  const nonEmptyCats = CATEGORY_RULES.filter((r) => categorized[r.id].length > 0).length;
  const emptyCats = CATEGORY_RULES.filter((r) => categorized[r.id].length === 0).length;
  if (emptyCats > 0) {
    md += `- ${nonEmptyCats} 个栏目有新增内容，${emptyCats} 个栏目无新增。\n`;
  }

  md += '\n';

  // 二、今日值得关注（放在最前面，让读者快速了解重点）
  md += `## 二、今日值得关注\n\n`;
  const highlights = pickHighlights(items);
  if (highlights.length > 0) {
    highlights.forEach((h, i) => {
      md += `${i + 1}. ${h}\n`;
    });
  } else {
    md += '今日暂无特别值得关注的条目。\n';
  }
  md += '\n';

  let sectionNum = 3;
  for (const rule of CATEGORY_RULES) {
    const catItems = categorized[rule.id];
    const romanNum = ['一', '二', '三', '四', '五', '六', '七', '八'][sectionNum - 1]
      || String(sectionNum);

    md += `## ${romanNum}、${rule.title}\n\n`;

    if (catItems.length === 0) {
      md += '- 今日无可验证更新。\n\n';
    } else {
      catItems.forEach((item) => {
        const dateInfo = item.date
          ? `（${formatDateChinese(item.date)} ${formatTime(item.date)}）`
          : '';
        md += `- **${item.title}** ${dateInfo}\n`;
        if (item.summary) {
          md += `  ${item.summary}\n`;
        }
        md += `  来源：[${item.sourceName}](${item.url})\n`;
      });
      md += '\n';
    }
    sectionNum++;
  }

  // 来源透明区
  md += `---\n\n`;
  md += `## 本期来源\n\n`;
  const sourceSet = new Map();
  items.forEach((item) => {
    if (!sourceSet.has(item.sourceName)) {
      sourceSet.set(item.sourceName, { name: item.sourceName, url: item.sourceUrl, count: 0 });
    }
    sourceSet.get(item.sourceName).count++;
  });
  sourceSet.forEach((s) => {
    md += `- [${s.name}](${s.url}) — 贡献 ${s.count} 条\n`;
  });
  md += `\n> 核查日期：${formatDateChinese(dateStr)}\n`;

  return md;
}

function pickHighlights(items) {
  const important = items.filter(
    (i) => (i.priority || 1) === 1 && i.summary && i.summary.length > 20,
  );
  if (important.length === 0) { return items.slice(0, 3).map((i) => i.title); }
  return important.slice(0, 5).map((i) => i.title);
}

// ===================== 主流程 =====================

function parseArgs() {
  const args = { type: null, input: null };
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--type=')) { args.type = arg.split('=')[1]; }
    if (arg.startsWith('--input=')) {
      args.input = resolve(ROOT, arg.split('=')[1]);
    }
  });
  // 根据当前时间自动判断早报还是晚报
  if (!args.type || !['morning', 'evening'].includes(args.type)) {
    const { hour } = getBeijingDateParts();
    args.type = Number(hour) < 14 ? 'morning' : 'evening';
  }
  if (!args.input) {
    args.input = resolve(ROOT, 'data', `.fetched-news-${todaySlug()}.json`);
  }
  return args;
}

function buildFrontmatter(items, briefType, dateStr) {
  const typeLabel = briefType === 'morning' ? '早报' : '晚报';
  const typeLabelCN = briefType === 'morning' ? 'AI 行业早报' : 'AI 行业晚报';

  const tags = ['AI行业' + typeLabel];
  const sourceNames = new Set(items.map((i) => i.sourceName));
  sourceNames.forEach((n) => {
    const short = n.replace(/ (Newsroom|News|Blog|Research|AI)/gi, '').trim();
    if (short) { tags.push(short); }
  });

  // 日期格式: 2026.6.19（无前导零）
  const d = new Date(dateStr);
  const shortDate = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;

  return {
    title: `${shortDate} AI行业${typeLabel}`,
    date: dateStr,
    category: typeLabelCN,
    tags,
    cover: '',
    description: `汇总截至北京时间${briefType === 'morning' ? '早上 08:00' : '晚上 20:00'}前最近一轮可直接核实的 AI 行业动态。`,
    isDailyBrief: true,
    briefDate: dateStr,
    briefType: briefType,
    newsCount: items.length,
    status: 'review',
  };
}

function main() {
  const args = parseArgs();
  const typeLabel = args.type === 'morning' ? '早报' : '晚报';

  console.log(`📝 正在生成 AI行业${typeLabel}...`);

  if (!existsSync(args.input)) {
    console.error(`❌ 新闻数据文件不存在: ${args.input}`);
    console.error('   请先运行 fetch-ai-news.mjs 抓取新闻');
    process.exit(1);
  }

  const items = loadJson(args.input);
  if (items.length === 0) {
    console.log('⚠️  无新闻数据，生成空简报');
  }

  const dateStr = todaySlug();
  const frontmatter = buildFrontmatter(items, args.type, dateStr);
  const markdownBody = generateMarkdown(items, args.type, dateStr);

  // 拼接完整 Markdown
  const frontmatterYaml = Object.entries(frontmatter)
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return `${k}: [${v.map((x) => `"${x}"`).join(', ')}]`;
      }
      if (typeof v === 'boolean') { return `${k}: ${v}`; }
      if (typeof v === 'number') { return `${k}: ${v}`; }
      return `${k}: "${v}"`;
    })
    .join('\n');

  const fullMd = `---\n${frontmatterYaml}\n---\n\n${markdownBody}`;

  const outputDir = resolve(ROOT, 'data', 'briefs');
  const outputPath = resolve(
    outputDir,
    `${dateStr}-ai-${args.type}-brief.md`,
  );
  saveJson(outputPath, null);
  writeFileSync(outputPath, fullMd, 'utf-8');

  // 输出摘要信息
  const summary = {
    title: frontmatter.title,
    date: dateStr,
    slug: `${dateStr}-ai-${args.type}-brief`,
    updatedAt: new Date().toISOString(),
    newsCount: items.length,
    status: 'review',
    briefType: args.type,
  };

  const summaryPath = resolve(
    outputDir,
    `${dateStr}-ai-${args.type}-brief-summary.json`,
  );
  saveJson(summaryPath, summary);

  console.log(`\n✨ AI行业${typeLabel} 生成完成:`);
  console.log(`  📄 Markdown: ${outputPath}`);
  console.log(`  📊 共 ${items.length} 条资讯`);
  console.log(`  📝 状态: review (待审核)`);

  return { markdownPath: outputPath, summary };
}

const result = main();
export { result };
