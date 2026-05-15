---
title: 如何在 Windows 安装 Git
description: 手把手教你在 Windows 上安装 Git，并完成基础初始化配置
date: 2026-05-15 23:00:50
updated: 2026-05-15 23:00:50
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/f9cc792
categories: [技术]
tags: [git, windows, 安装]
---

## 获取安装包

在[官网](https://git-scm.com/install/windows)下载 Windows 的 git 安装包，如果你的网络环境不允许你直接在这里下载，你也可以在[清华源](https://mirrors.tuna.tsinghua.edu.cn/github-release/git-for-windows/git/LatestRelease/)下载。

大多数人电脑是 x64 的，选择 Git for Windows/x64 Setup 或 Git-xx-64-bit.exe 即可。

## 开始安装

1. 点击安装包，进入许可证界面，点击 Next。

2. 按喜好设置安装路径后点击 Next。

3. 按需勾选自己需要的服务：

::pic
---
src: https://bu.dusays.com/2026/05/15/6a07306802a8e.webp
caption: 选择组件
height: 320
---
::

这里我勾选了`添加 Git Bash 到 Windows Terminal`，这样就可以在 Windows Terminal 里直接打开 Git Bash 了。

4. 询问是否添加 Git 到开始菜单，默认，点击 Next。

5. 选择默认编辑器，按需设置，我选择了`Use Visual Studio Code as Git's default editor`。

6. 设置默认分支名，默认是 `master`，建议改为 `main`，和 GitHub 一致，点击 Next。

7. 询问你想如何在命令行使用 git，默认是 `Git from the command line and also from 3rd-party software`，点击 Next。

8. 设置 HTTPS 传输后端，默认是 `Use the native Windows Secure Channel Library`，点击 Next。

9. 设置换行符，默认是 `Checkout Windows-style, commit Unix-style line endings`，点击 Next。

10. 设置终端模拟器，默认是 `Use MinTTY (the default terminal of MSYS2)`，它对 Git Bash 这套环境的兼容性更自然，点击 Next。

11. 选择 git pull 的默认行为，默认是 `Default (fast-forward or merge)`，点击 Next。

12. 配置凭证管理器，默认是 `Git Credential Helper`，点击 Next。

13. 配置额外选项，默认是 `Enable file system caching`，点击 Install 进行安装。

14. 安装完成，点击 Finish。

::alert{icon="tabler:bounce-right" title="验证安装"}
:key{code="R" win} 输入 `cmd` 打开命令行，

输入 `git -v`，如果能看到版本信息就说明安装成功了。
::

## 初始化配置

为方便后续使用，推荐你设置全局的用户名和邮箱：

:copy{prompt="PS>" lang="ps1" code='git config --global user.name "xx"'}

:copy{prompt="PS>" lang="ps1" code="git config --global user.email xx@xx.com"}
