---
title: 如何安装 Claude Code 并用 cc-switch 配置国内大模型
description: 如果你还不会安装 Claude Code，并配置国内大模型，可以看这篇文章，我来教你。
date: 2026-05-26 18:06:21
updated: 2026-05-26 18:06:21
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/54cd2e3
categories: [技术]
tags: [ai, 安装]
---

# Claude Code是什么？

它是当前很流行的 AI 智能体工具，由 Anthropic 开发，默认使用 Claude 模型

但 Claude 对国内用户不友好，所以需要接入国内模型方便使用

智能体（Agent）可以做什么？可以简单理解为能够使 AI 自己决策，执行任务，读写电脑文件，为 AI（脑子）提供了各种工具

## 安装 Node.js

为了方便管理，我推荐使用 npm 安装 Claude Code，同时 node 是 Claude Code 运行的必备环境，这需要安装 Node.js

以 Windows 为例，[点击这里](https://nodejs.org/dist/v24.16.0/node-v24.16.0-x64.msi)下载安装包

双击安装包进行安装，安装很简单，这里简单叙述：
   1. 欢迎界面，点击`Next`
   2. 许可协议界面，勾选 `I accept...`，点击 `Next`
   3. 安装路径界面，按自己习惯修改路径，点击 `Next`
   4. 自定义安装界面，保持默认，点击 `Next`
   5. 最后的工具安装界面，`不要`勾选，否组会下载很大的工具包，点击 `Next`
   6. 点击 `Install`，等待进度条走完，点击 `Finish`

::alert{icon="tabler:bounce-right" title="验证安装"}
:key{code="R" win} 输入 `cmd` 打开命令行，

输入 `node -v` 和 `npm -v`，如果能看到版本信息就说明安装成功了。
::

## 设置国内镜像

为在国内有较快的速度来安装软件，我们需要配置镜像源

:key{code="R" win} 输入 `cmd` 打开命令行，输入：

:copy{prompt="PS>" lang="ps1" code="npm config set registry https://registry.npmmirror.com"}

用一下命令验证，看到 `https://registry.npmmirror.com` 即可：

:copy{prompt="PS>" lang="ps1" code="npm config get registry"}

## 安装 git

Claude Code 在 Windows 需使用 Git Bash

看[这篇文章](/posts/f9cc792)

## 安装 Claude Code

运行以下命令：

:copy{prompt="PS>" lang="ps1" code="npm install -g @anthropic-ai/claude-code"}

::alert{icon="tabler:bounce-right" title="验证安装"}
:key{code="R" win} 输入 `cmd` 打开命令行，

输入 `claude -v`，如果能看到版本信息就说明安装成功了。
::

## 安装 cc-switch

cc-switch 是一个很好用的 Claude Code 配置工具，我们使用它来配置国内模型

[点击这里](https://gh-proxy.org/https://github.com/farion1231/cc-switch/releases/download/v3.15.0/CC-Switch-v3.15.0-Windows.msi)下载安装包

双击安装包进行安装

## 配置模型

这里以 Deepseek 为例，需要提前在[这里](https://platform.deepseek.com/)准备好余额

打开 cc-switch，点击右上角加号

::pic
---
src: https://bu.dusays.com/2026/05/26/6a156d3d01684.webp
caption: cc-switch 右上角加号
height: 320
---
::

选择 Deepseek 供应商

::pic
---
src: https://bu.dusays.com/2026/05/26/6a156dedae9b2.webp
caption: 选择 Deepseek
height: 320
---
::

到[这里](https://platform.deepseek.com/api_keys)生成 api key 并复制

粘贴到图示位置：

::pic
---
src: https://bu.dusays.com/2026/05/26/6a156ea7040eb.webp
caption: 选择 Deepseek
height: 320
---
::

在下方勾选：

::pic
---
src: https://bu.dusays.com/2026/05/26/6a156efb2e314.webp
caption: 选择 Deepseek
height: 320
---
::

之后点击右下角`+添加`，添加后会自动激活配置

## 使用 Claude code

配置完后，打开终端，输入 `claude` 即可运行 Claude Code

::pic
---
src: https://bu.dusays.com/2026/05/26/6a156fff0a469.webp
caption: 选择 Deepseek
height: 320
---
::

::alert
如有上图乱码，请使用 Windows Terminal 运行

本文章提供的安装包链接均为写文时的最新版本，请按需更新
::