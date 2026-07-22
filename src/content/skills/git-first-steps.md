---
title: "Git 新手生存指南：常用命令和场景"
date: "2026-05-20"
category: "开发工具"
tags: ["Git", "版本管理", "新手教程", "开发工具"]
cover: "/images/posts/skills/git-guide.svg"
description: "总结 Git 最常用的命令和实际操作场景，帮助新手快速上手版本管理。"
---

# Git 新手生存指南：常用命令和场景

## 为什么需要 Git

Git 是一个**版本管理工具**。它可以帮你：

- 保存代码的每一次修改记录
- 回到之前的任何一个版本
- 和团队成员协作开发同一个项目
- 备份代码到远程仓库（如 Gitee）

> 💡 **通俗理解**：Git 就像游戏的"存档系统"。你可以随时存档（commit），如果后面玩坏了，可以读档回到之前的状态。

## 安装和配置

### 安装 Git

从 [git-scm.com](https://git-scm.com) 下载安装包，按提示安装即可。

### 首次配置

安装完成后，打开命令行工具，设置你的名字和邮箱：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

这些信息会记录在你的每次提交中，让其他人知道是谁做了修改。

## 最常用的命令

### 创建仓库

```bash
# 在现有文件夹中初始化 Git
git init

# 从远程克隆一个仓库到本地
git clone <仓库地址>
```

### 日常操作流程

```bash
# 1. 查看当前改了哪些文件
git status

# 2. 把修改添加到暂存区（准备存档）
git add .
# 或者只添加某个文件
git add <文件名>

# 3. 提交修改（创建存档点）
git commit -m "描述这次修改了什么"

# 4. 推送到远程仓库
git push
```

### 查看历史

```bash
# 查看提交历史
git log
# 简洁版历史
git log --oneline
```

### 分支操作

```bash
# 创建新分支
git branch <分支名>

# 切换到某个分支
git checkout <分支名>

# 创建并切换到新分支（一步到位）
git checkout -b <分支名>

# 合并分支
git merge <要合并进来的分支名>
```

## 常见场景处理

### 场景一：改错了想撤销

```bash
# 撤销工作区的修改（还没 git add 的）
git checkout -- <文件名>

# 撤销暂存区的修改（已经 git add 但还没 commit）
git reset HEAD <文件名>

# 撤销最近的提交（保留修改的文件）
git reset --soft HEAD~1
```

### 场景二：提交信息写错了

```bash
git commit --amend -m "新的提交信息"
```

### 场景三：忘记切换分支就开始改了

```bash
# 先把修改暂存起来
git stash

# 创建并切换到新分支
git checkout -b <新分支名>

# 把暂存的修改拿出来
git stash pop
```

## 最佳实践

1. **频繁提交**：每完成一个小功能就提交一次，不要攒很多修改一起提交
2. **清晰的提交信息**：用简明的文字描述做了什么，方便以后回顾
3. **分支开发**：新功能在独立分支上开发，测试通过后再合并到主分支
4. **及时推送**：提交后及时 push 到远程，避免电脑出问题丢失代码

## 下一步

掌握这些基本命令之后，可以进一步学习：
- `.gitignore` 文件的使用
- Pull Request 流程
- 解决合并冲突

Git 的上手曲线可能有点陡，但一旦掌握了基础操作，你会离不开它。
