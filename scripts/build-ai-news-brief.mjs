/**
 * AI 早报 / 晚报生成脚本
 *
 * 读取已抓取的新闻数据，按统一模板生成 Markdown 简报文件。
 * 每条新闻生成中文摘要，参考 aibase.com 日报格式。
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

// ===================== 中文摘要生成 =====================

// 完整句子/短语匹配表（模块级常量，避免每次调用重新创建）
const PHRASE_MAP = [
    // --- Anthropic 新闻 ---
    [/Introducing Claude Sonnet 5\s*Sonnet 5 delivers/i,
      'Claude Sonnet 5 正式发布，在编程、Agent 和专业工作任务上提供前沿性能。'],
    [/Introducing Claude for Teachers/i,
      'Anthropic 推出 Claude for Teachers，为教育工作者提供专属 AI 助手。'],
    [/Introducing Claude Corps/i,
      'Anthropic 推出 Claude Corps，面向团队协作的 AI 解决方案。'],
    [/Introducing the Services Track and Partner Hub/i,
      'Claude 合作伙伴网络新增 Services Track 和 Partner Hub，扩大企业服务生态。'],
    [/Introducing a way to reflect on how you use Claude/i,
      'Anthropic 推出 Claude 使用回顾功能，帮助用户反思和优化 AI 使用方式。'],
    [/Introducing the ChatGPT for small business program/i,
      'OpenAI 推出 ChatGPT 中小企业计划，提供专属 AI 服务方案。'],
    [/Claude Fable 5 and Claude Mythos 5/i,
      'Anthropic 发布 Claude Fable 5 和 Mythos 5 模型，性能大幅提升。'],
    [/Results from the first Anthropic Public Record/i,
      'Anthropic 公布首期公共记录结果，增强 AI 安全透明度。'],
    [/Responsible Scaling Policy/i,
      'Anthropic 更新负责任扩展政策（RSP），强化 AI 安全治理框架。'],
    [/Expanding Project Glasswing/i,
      'Anthropic 扩展 Project Glasswing 项目，覆盖更多国家和组织。'],
    [/Anthropic opens Seoul office/i,
      'Anthropic 开设首尔办公室，拓展韩国 AI 生态合作。'],
    [/Statement on the US government directive/i,
      '美国政府指令暂停部分模型访问权限，Anthropic 发表声明回应。'],
    [/Inviting hard questions/i,
      'Anthropic 向公众征集关于 AI 的"最难题"，承诺公开研究过程。'],
    [/Apply for Anthropic.*rare disease research grants/i,
      'Anthropic 开放 AI for Science 罕见病研究资助申请。'],
    [/Anthropic commits.*Canadian AI research/i,
      'Anthropic 承诺向加拿大 AI 研究投入资金，支持前沿探索。'],
    [/Ben Bernanke appointed to Anthropic/i,
      '前美联储主席 Ben Bernanke 加入 Anthropic 长期利益信托。'],
    [/More details on Fable 5.*cyber safeguards/i,
      'Anthropic 公开 Fable 5 网络安全防护和越狱防御框架详情。'],

    // --- OpenAI 新闻 ---
    [/Improving health intelligence in ChatGPT/i,
      'ChatGPT 健康智能功能改进，提升医疗场景 AI 应用能力。'],
    [/OpenAI and Hugging Face partner/i,
      'OpenAI 与 Hugging Face 合作处理模型评测期间的安全事件。'],
    [/New usage analytics and updated spend controls/i,
      'ChatGPT 企业版新增用量分析和消费管控功能。'],

    // --- 通用 AI 新闻 ---
    [/DXC will integrate Claude into.*regulated industries/i,
      'DXC 将 Claude 集成到银行、航空等受监管行业的关键系统中。'],
    [/TCS and Anthropic partner to bring Claude/i,
      'TCS 与 Anthropic 合作，将 Claude 引入受监管行业。'],
    [/What we learned mapping.*AI-enabled cyber threats/i,
      'Anthropic 发布 AI 网络威胁年度研究，揭示 AI 赋能攻击的模式与趋势。'],
    [/Case Study\s*UST is bringing Claude to physical AI/i,
      '案例：UST 将 Claude 应用于实体 AI，推动物理世界智能化。'],
    [/Case Study\s*Government of Alberta uses Claude/i,
      '案例：加拿大阿尔伯塔省政府使用 Claude 发现并修复网络安全漏洞。'],
];

// 关键词替换表（模块级常量）
const WORD_MAP = [
  [/\bpartner(?:s)? with\b/ig, '与...合作'],
  [/\bpartner(?:s)? to\b/ig, '合作以'],
  [/\bcommit(?:s|ted)? to\b/ig, '承诺'],
  [/\brelease(?:s|d)?\b/ig, '发布'],
  [/\blaunch(?:es|ed)?\b/ig, '推出'],
  [/\bintegrat(?:e|es|ed)\b/ig, '集成'],
  [/\bsecurity\b/ig, '安全'],
  [/\bmodel evaluation\b/ig, '模型评测'],
  [/\bresearch grants?\b/ig, '研究资助'],
  [/\bdata center\b/ig, '数据中心'],
  [/\bopen source\b/ig, '开源'],
  [/\bannounce(?:s|d|ment)?\b/ig, '宣布'],
  [/\bexpand(?:s|ed|ing)?\b/ig, '扩展'],
  [/\bcyber\s*security\b/ig, '网络安全'],
  [/\bcyber\s*threats?\b/ig, '网络威胁'],
  [/\bvulnerabilit(?:y|ies)\b/ig, '漏洞'],
  [/\bfrontier\b/ig, '前沿'],
  [/\benterprise\b/ig, '企业'],
  [/\bregulat(?:ed|ory)\b/ig, '受监管'],
  [/\bindustry\b/ig, '行业'],
  [/\bAI for Science\b/ig, 'AI 科研'],
  [/\brace disease\b/ig, '罕见病'],
  [/\bhealth intelligence\b/ig, '健康智能'],
  [/\bsmall business\b/ig, '中小企业'],
  [/\bspend controls?\b/ig, '消费管控'],
  [/\busage analytics?\b/ig, '用量分析'],
  [/\breflect\b/ig, '回顾'],
  [/\bhard questions?\b/ig, '难题'],
  [/\bpublic record\b/ig, '公共记录'],
  [/\bsafeguards?\b/ig, '安全防护'],
  [/\bjailbreak\b/ig, '越狱攻击'],
  [/\bresponsible scaling\b/ig, '负责任扩展'],
  [/\bLong-Term Benefit Trust\b/ig, '长期利益信托'],
];

function cleanDigestText(text) {
  return String(text || '')
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function hasChinese(text) {
  return /[一-龥]/.test(text);
}

/**
 * 生成中文摘要：如有中文直接返回，否则翻译英文标题
 */
function buildChineseDigest(item) {
  const baseText = cleanDigestText(item.summary || item.title || '');
  if (!baseText) { return '该条资讯暂无可用摘要。'; }
  if (hasChinese(baseText)) {
    return baseText;
  }
  return translateToChinese(item, baseText);
}

/**
 * 将英文 AI 新闻标题翻译为中文摘要
 * 按优先级：完整句子匹配（PHRASE_MAP）→ 前缀替换 → 关键词替换（WORD_MAP）→ 兜底
 */
function translateToChinese(item, text) {
  // 1. 完整句子/短语匹配（使用模块级 PHRASE_MAP）
  for (const [pattern, translation] of PHRASE_MAP) {
    if (pattern.test(text)) {
      return translation;
    }
  }

  // 2. 前缀替换
  let t = text;
  t = t.replace(/^Case Study\s*/i, '案例：');
  t = t.replace(/^Introducing the\s*/i, '发布 ');
  t = t.replace(/^Introducing an?\s*/i, '推出 ');
  t = t.replace(/^Introducing\s*/i, '发布 ');
  t = t.replace(/^Announcing\s*/i, '宣布 ');
  t = t.replace(/^Apply for\s*/i, '开放申请 ');
  t = t.replace(/^Statement on\s*/i, '就「');
  t = t.replace(/^What we learned\s*/i, '研究总结：');
  t = t.replace(/^New\s*/i, '新增 ');
  t = t.replace(/^Improving\s*/i, '改进 ');
  t = t.replace(/^More details on\s*/i, '更多关于 ');
  t = t.replace(/^OpenAI and\s*/i, 'OpenAI 与 ');
  t = t.replace(/^Anthropic and\s*/i, 'Anthropic 与 ');

  // 3. 关键词替换（使用模块级 WORD_MAP）
  for (const [pattern, replacement] of WORD_MAP) {
    t = t.replace(pattern, replacement);
  }

  // 4. 清理
  t = t.replace(/\s{2,}/g, ' ').replace(/[。.!?]$/, '').trim();

  if (hasChinese(t)) {
    return t;
  }

  // 5. 兜底：截取前 100 字符
  const short = text.substring(0, 100).replace(/\s+\S*$/, '').replace(/[.!?,;:]$/g, '');
  if (hasChinese(short)) {
    return short;
  }

  return `该条资讯来自 ${item.sourceName || '外部来源'}，详情请查看原文。`;
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

  // 二、今日值得关注（中文摘要形式呈现）
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
        const digest = buildChineseDigest(item);
        const timeInfo = item.date
          ? `${formatDateChinese(item.date)} ${formatTime(item.date)}`
          : '';
        md += `- **${digest}**\n`;
        if (timeInfo) {
          md += `  ${timeInfo}\n`;
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

/**
 * 挑选高优先级新闻作为"今日值得关注"
 * 优先选择有中文摘要且标记为高优先级的条目
 */
function pickHighlights(items) {
  const important = items.filter(
    (i) => (i.priority || 1) === 1 && i.summary && i.summary.length > 20,
  );
  if (important.length === 0) {
    return items.slice(0, 5).map((i) => buildChineseDigest(i));
  }
  return important.slice(0, 5).map((i) => buildChineseDigest(i));
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
