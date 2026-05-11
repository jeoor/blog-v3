---
title: 如何处理 PowerShell 中文乱码问题
description: 设置一些命令默认使用UTF-8编码，解决 PowerShell 中的中文乱码问题，保证读写文件正确。
date: 2026-05-11 23:53:45
updated: 2026-05-11 23:53:45
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/6c61ee2
categories: [技术]
tags: [powershell]
---

::chat
{:一次让ai写代码时}

{AI}

除了这个文件有一些乱码行，没其他问题了

{.我}

一些乱码行？没有呀？

{AI}

可能是编码问题

{:AI 修不好，我上网去搜}
::

如果你在使用 PowerShell 时遇到了中文乱码问题，或者你的 Agent 工具不可以正常使用 PowerShell 读写中文文件，你可以尝试一下方法。

## 打开 PowerShell，输入以下命令：

:copy{code="notepad $PROFILE"}

这将打开 PowerShell 的配置文件。如果文件不存在，Notepad 会提示你创建一个新的文件。

## 在打开的文件中，添加以下内容：

```ps1 [Microsoft.PowerShell_profile.ps1]
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['Get-Content:Encoding'] = 'UTF8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'UTF8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'UTF8'
$PSDefaultParameterValues['Out-File:Encoding'] = 'UTF8'
$PSDefaultParameterValues['Export-Csv:Encoding'] = 'UTF8'
```
::folding
#title
代码说明
#default
- 设置 PowerShell 的输入编码为 UTF-8，这样 PowerShell 就可以正确地读取中文输入。
- 设置 PowerShell 的输出编码为 UTF-8，这样 PowerShell 就可以正确地显示中文输出。
- 设置 PowerShell 的默认输出编码为 UTF-8，这样 PowerShell 在输出到文件或管道时也会使用 UTF-8 编码。
- 设置 Get-Content 命令的默认编码为 UTF-8，这样在使用 Get-Content 读取文件时会默认使用 UTF-8 编码。
- 设置 Set-Content 命令的默认编码为 UTF-8，这样在使用 Set-Content 写入文件时会默认使用 UTF-8 编码。
- 设置 Add-Content 命令的默认编码为 UTF-8，这样在使用 Add-Content 追加内容到文件时会默认使用 UTF-8 编码。
- 设置 Out-File 命令的默认编码为 UTF-8，这样在使用 Out-File 输出到文件时会默认使用 UTF-8 编码。
- 设置 Export-Csv 命令的默认编码为 UTF-8，这样在使用 Export-Csv 导出 CSV 文件时会默认使用 UTF-8 编码。
::

## 重启 PowerShell
保存文件后，关闭并重新打开 PowerShell。现在，你应该能够正确地处理中文输入和输出了。