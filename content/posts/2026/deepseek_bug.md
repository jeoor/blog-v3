---
title: 给 Deepseek 发 <think> 之后，它就串台了？
description: 网上很多人发现给 Deepseek 发 <think> 之后会展示出 Deepseek 与别人的对话内容，真的吗？
date: 2026-05-15 16:40:49
updated: 2026-05-15 16:40:49
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/ce24957
categories: [杂谈]
tags: [ai]
references:
   - title: deepseek的bug
     link: https://linux.do/t/topic/2135678
   - title: deepseek神秘bug，输入think有概率触发模型幻觉
     link: https://bbs.nga.cn/read.php?tid=46776505&rand=459
---

近期在网上冲浪时，发现很多人在说，给 Deepseek 发送 `<think>` 之后，它看起来像别人的对话片段，就像这样：

::pic
---
src: https://bu.dusays.com/2026/05/15/6a06dfe45b15c.webp
caption: deepseek 胡说
height: 320
---
::

真是如此吗？于是我上网查了一些资料。

## 当然不是泄露

Deepseek 怎么会犯这么低级的错误呢？只靠一个简单的 `<think>` 就能让它`串台`，泄露其他用户的对话内容？

## `<think>` 是特殊 token

Deepseek 在训练时使用 `<think>` 和 `</think>` 标记思维链推理过程。`<think>` 被识别成了特殊 token，当用户单独发送时，模型会误以为自己进入了思考模式。

## 你发了空指令

当你只发送了一个 `<think>`，大模型把它当成了开始思考的信号，却没有收到明确的问题，于是它只能根据训练时学到的语言模式继续生成内容。这些内容看似像真实对话，实际上是模型凭概率"编"出来的，只是触发了大模型的`幻觉`罢了。

::quote
#icon
设想一下
#default
一个领导只对你说”想一想”，没有其他信息，你只好开始胡编了...
::
