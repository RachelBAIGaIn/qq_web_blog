---
title: "AI行业晚报 | 2026-06-19"
date: "2026-06-19"
category: "AI 行业晚报"
tags: ["AI行业晚报", "Anthropic", "OpenAI", "BBC", "Yahoo Tech", "证券时报", "Microsoft DevBlogs", "SiliconANGLE", "Google ADK", "Open Source For You", "Claude Code Docs", "Taskade", "AI Agent Store", "Tech Times"]
cover: ""
description: "汇总截至北京时间晚上 20:00前最近一轮可直接核实的 AI 行业动态。"
isDailyBrief: true
briefDate: "2026-06-19"
briefType: "evening"
newsCount: 26
status: "review"
---

# AI晚报

## 一、今日总览

- 汇总截至北京时间 晚上 20:00 前最近一轮可直接核实的 AI 行业动态。
- 本轮共采集 26 条来自一手来源的资讯。

## 二、模型与产品发布

- **DXC will integrate Claude into the systems banks, airlines, and other regulated industries rely on** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/dxc-anthropic-alliance)
- **Introducing Claude Corps** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/claude-corps)
- **Claude Fable 5 and Claude Mythos 5** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/claude-fable-5-mythos-5)
- **Introducing the Services Track and Partner Hub of the Claude Partner Network** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/services-track-partner-hub)
- **TCS and Anthropic partner to bring Claude to regulated industries** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/tcs-anthropic-partnership)
- **Improving health intelligence in ChatGPT** （2026年6月18日 19:00）
  来源：[OpenAI News](https://openai.com/index/improving-health-intelligence-in-chatgpt)
- **NVIDIA发布RTX Spark AI超级芯片，面向个人PC的Blackwell架构SoC** （2026年6月2日 08:00）
  Computex 2026发布，集成Grace CPU和Blackwell GPU，最高128GB统一内存，AI算力达1 Petaflop(FP4)，可运行120B参数模型，TSMC 3nm工艺，2026年秋季上市。
  来源：[BBC News](https://www.bbc.com/news/articles/crmp9mppvzro)
- **Microsoft Agent Framework 1.0正式GA，合并AutoGen与Semantic Kernel** （2026年6月3日 08:00）
  BUILD 2026发布Agent Harness、Foundry Hosted Agents、CodeAct(微VM沙箱执行，快52%)、GitHub Copilot SDK集成和Handoff多Agent编排。
  来源：[Microsoft DevBlogs](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-at-build-2026-announce/)
- **Google ADK 2.0发布，新增Workflow Runtime和Task API** （2026年6月4日 08:00）
  图型执行引擎(路由/扇出扇入/循环/重试/状态管理)，四语言SDK(Python/TypeScript/Java/Go)，支持session回退和Vertex AI沙箱执行。
  来源：[Google ADK](https://pypi.org/project/google-adk/1.34.3/)
- **Claude Agent SDK计费变更：Agent用量独立配额** （2026年6月15日 08:00）
  Agent SDK和非交互式claude -p使用从月度Agent SDK额度扣除(Pro: $20, Max 5×: $100)，超出后按标准API费率，未用完不累计。
  来源：[Claude Code Docs](https://code.claude.com/docs/en/changelog)
- **Agent Skills开放标准成熟：SKILL.md格式实现跨工具可移植** （2026年6月9日 08:00）
  Anthropic 2025年底发布Agent Skills开放标准，OpenAI/Google/GitHub/Cursor均已采用。同一SKILL.md文件可在Claude Code、Codex CLI、Cursor Agents和Gemini CLI之间无缝运行。
  来源：[Taskade Blog](https://www.taskade.com/blog/claude-skills-explained)
- **Claude Code v2.1.170发布：Fable 5模型和动态工作流** （2026年6月9日 08:00）
  Claude Opus 4.8(5月28日)和Fable 5(6月9日)相继发布，新增Dynamic Workflows自动生成编排脚本、--safe-mode故障排除、/cd命令切换会话目录。
  来源：[Claude Code Docs](https://code.claude.com/docs/en/changelog)
- **skills.sh注册中心上线，一键安装跨Agent技能** （2026年6月16日 08:00）
  Vercel Labs推出skills.sh，npx skills add一键安装到所有Agent。claude-skills库已收录345+技能覆盖13个Agent，含51个高级工程师角色。LobeHub Skills和SkillsMP目录提供数万条目。
  来源：[Tech Times](https://www.techtimes.com/articles/318518/20260616/ai-coding-agent-skills-library-gives-any-tool-51-senior-engineer-personas.htm)

## 三、AI 芯片 / 算力硬件

- **NVIDIA Vera Rubin AI平台进入全面量产，Q3 2026开始交付** （2026年6月4日 08:00）
  Vera Rubin NVL72机架集成36颗Vera CPU+72颗Rubin GPU，10倍Agent AI吞吐量，成本降至Grace Blackwell的1/10。早期客户包括Anthropic、OpenAI、xAI。
  来源：[Yahoo Tech](https://tech.yahoo.com/ai/articles/nvidia-vera-rubin-ai-chip-115036873.html)
- **NVIDIA与SK海力士签署多年合作协议，共同开发下一代AI内存** （2026年6月8日 08:00）
  HBM4供应商确认为三星、SK海力士和美光，全部进入量产。SK海力士将使用NVIDIA CUDA-X和PhysicsNeMo进行芯片仿真优化。
  来源：[证券时报](https://stcn.com/article/detail/3948081.html)
- **OpenAI Codex Goal Mode正式GA，支持跨会话多步骤工程任务** （2026年5月21日 08:00）
  Goal Mode让Codex成为持久Agent，支持跨会话断点续做。新增Appshots(macOS窗口截图)、Locked Use远程执行和Windows computer-use。
  来源：[AI Agent Store](https://aiagentstore.ai/ai-agent-news/topic/coding/2026-06-02)

## 四、产业与大事件

- **What we learned mapping a year’s worth of AI-enabled cyber threats** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/AI-enabled-cyber-threats-mitre-attack)
- **Responsible Scaling Policy** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)
- **Expanding Project GlasswingWe’re extending Project Glasswing to approximately 150 new organizations in more than fifteen countries.** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/expanding-project-glasswing)
- **Anthropic opens Seoul office and announces new partnerships across the Korean AI ecosystem** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/seoul-office-partnerships-korean-ai-ecosystem)
- **Statement on the US government directive to suspend access to Fable 5 and Mythos 5** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/fable-mythos-access)
- **Results from the first Anthropic Public Record** （2026年6月19日 18:27）
  来源：[Anthropic Newsroom](https://www.anthropic.com/news/anthropic-public-record)
- **New usage analytics and updated spend controls for enterprises** （2026年6月19日 01:00）
  来源：[OpenAI News](https://openai.com/index/chatgpt-enterprise-spend-controls)

## 五、开源工具链 / Agent SDK 更新

- **Vercel开源eve Agent框架——「Agent版的Next.js」** （2026年6月19日 08:00）
  Agent视作一个目录，内置持久化、沙箱计算、工具和人工审批。AI Agent已占Vercel平台50%以上提交量(年初不到3%)。
  来源：[Open Source For You](https://www.opensourceforu.com/2026/06/vercel-open-sources-eve-amid-agentic-ai-boom/)

## 六、Skills 更新 / 有趣 Skills

- **NVIDIA开源NemoClaw Agent框架和OpenShell安全运行时** （2026年6月1日 08:00）
  NemoClaw支持多Agent编排(规划/推理/执行/委派/记忆管理)。OpenShell是与微软、Canonical和Red Hat联合开发的容器化安全运行时。
  来源：[SiliconANGLE](https://siliconangle.com/2026/06/01/nvidia-gives-developers-tool-build-secure-autonomous-ai-workers-scale/)
- **Kaltura开源生产级AI Agent技能库** （2026年6月15日 08:00）
  Kaltura将视频平台生产环境中经过实战检验的AI技能开源，为社区提供高质量参考实现。标志着Agent Skills从实验走向企业生产。
  来源：[Open Source For You](https://www.magzter.com/stories/technology/Open-Source-For-You/KALTURA-OPEN-SOURCES-MACHINEREADABLE-AI-SKILLS)

## 七、今日值得关注

1. NVIDIA发布RTX Spark AI超级芯片，面向个人PC的Blackwell架构SoC
2. NVIDIA Vera Rubin AI平台进入全面量产，Q3 2026开始交付
3. Microsoft Agent Framework 1.0正式GA，合并AutoGen与Semantic Kernel
4. Agent Skills开放标准成熟：SKILL.md格式实现跨工具可移植
5. Claude Code v2.1.170发布：Fable 5模型和动态工作流

---

## 本期来源

- [Anthropic Newsroom](https://www.anthropic.com/news) — 贡献 11 条
- [OpenAI News](https://openai.com/news/rss.xml) — 贡献 2 条
- [BBC News](https://www.bbc.com/news) — 贡献 1 条
- [Yahoo Tech](https://tech.yahoo.com/ai) — 贡献 1 条
- [证券时报](https://stcn.com) — 贡献 1 条
- [Microsoft DevBlogs](https://devblogs.microsoft.com) — 贡献 1 条
- [SiliconANGLE](https://siliconangle.com) — 贡献 1 条
- [Google ADK](https://github.com/google/adk-python) — 贡献 1 条
- [Open Source For You](https://www.opensourceforu.com) — 贡献 2 条
- [Claude Code Docs](https://code.claude.com/docs) — 贡献 2 条
- [Taskade Blog](https://www.taskade.com/blog) — 贡献 1 条
- [AI Agent Store](https://aiagentstore.ai) — 贡献 1 条
- [Tech Times](https://www.techtimes.com) — 贡献 1 条

> 核查日期：2026年6月19日
