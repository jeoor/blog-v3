---
title: 如何安装 Windows 的包管理器 scoop 并配置国内镜像
description: 安装 Windows 的包管理器 scoop，并配置国内镜像源以快速而方便地安装/更新软件。
date: 2026-05-15 20:32:17
updated: 2026-05-15 20:32:17
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/ed5b381
categories: [技术]
tags: [scoop, install, windows]
references:
   - title: scoop 国内镜像
     link: https://gitee.com/scoop-installer/scoop
---

## 什么是包管理器

你可能使用过 Ubuntu，那你就应该用过 apt 命令，apt 就是 Ubuntu 的包管理器。

包管理器可以让你只需输入一行命令就可以方便快捷地安装、更新和管理软件包。不需要上网找软件安装包，也可以避免下载带盗版软件的问题。而且会自动安装软件所须的依赖，不需要困惑于频繁的`缺少依赖`错误。

那 Windows 上有什么包管理器呢？—— scoop

## 安装 scoop

::alert
scoop 通过 git 更新，需要提前安装 git，可以参考[我的这篇文章](/posts/f9cc792)。
::

打开 PowerShell

允许当前用户运行线上脚本，并不需要手动确认：

:copy{prompt="PS>" lang="ps1" code="Set-ExecutionPolicy RemoteSigned -scope CurrentUser -Force"}

默认安装到用户目录：

:copy{prompt="PS>" lang="ps1" code="iwr -useb scoop.201704.xyz | iex"}

如果想自定义安装目录：

:copy{prompt="PS>" lang="ps1" code="irm scoop.201704.xyz -outfile 'install.ps1'"}

请根据自己的喜好修改修改 `-ScoopDir` 和 `-ScoopGlobalDir`的值：

:copy{prompt="PS>" lang="ps1" code=".\install.ps1 -ScoopDir 'D:\Scoop' -ScoopGlobalDir 'D:\GlobalScoopApps'"}

`-ScoopDir` 指定用户安装目录，`-ScoopGlobalDir` 指定全局安装目录（`scoop install -g`）。

::alert{type="warning"}
如果以管理员身份运行会报错，请以普通用户身份运行。
::

此时，运行 `scoop help`，如果能看到帮助信息就说明安装成功了。

## 切换国内镜像

更换 scoop 仓库地址为 gitee:

:copy{prompt="PS>" lang="ps1" code='scoop config SCOOP_REPO "https://gitee.com/scoop-installer/scoop"'}

拉取新库地址:

:copy{prompt="PS>" lang="ps1" code="scoop update"}

## 添加 bucket（可选）

bucket 就是 scoop 的软件仓库，类似 apt 的 source，添加后可获取更多软件。

### 添加官方 bucket

查看有哪些已知 bucket：

:copy{prompt="PS>" lang="ps1" code="scoop bucket known"}

添加常用 bucket

:copy{prompt="PS>" lang="ps1" code="scoop bucket add extras"}

国内镜像已经把已知 bucket 同步到 gitee，添加后会自动从 gitee 拉取。可以用 `scoop bucket list` 确认，正常情况下 URL 应该显示 `gitee.com`：

```
Name     Source                                       Manifests
----     ------                                       ---------
main     https://gitee.com/scoop-installer/Main            1524
extras   https://gitee.com/scoop-installer/Extras          2305
```

### 添加第三方 bucket

基本语法:

:copy{prompt="PS>" lang="ps1" code="scoop bucket add <别名> <git地址>"}

例如添加 scoopcn（国内应用）:

:copy{prompt="PS>" lang="ps1" code="scoop bucket add scoopcn https://gitee.com/scoop-installer/scoopcn"}

::quote
更多 bucket 可访问 [scoop-installer](https://scoop.201704.xyz)。
::

如果不想要某个 bucket：

:copy{prompt="PS>" lang="ps1" code="scoop bucket rm <别名>"}

## 常用命令

安装：

:copy{prompt="PS>" lang="ps1" code="scoop install <软件名>"}

指定 bucket 安装：

:copy{prompt="PS>" lang="ps1" code="scoop install scoopcn/wechat"}

一次装多个：

:copy{prompt="PS>" lang="ps1" code="scoop install qq wechat aria2"}

卸载：

:copy{prompt="PS>" lang="ps1" code="scoop uninstall qq"}

更新所有：

:copy{prompt="PS>" lang="ps1" code="scoop update *"}

查看已安装：

:copy{prompt="PS>" lang="ps1" code="scoop list"}

搜索软件：

:copy{prompt="PS>" lang="ps1" code="scoop search <关键词>"}

暂停更新某个软件：

:copy{prompt="PS>" lang="ps1" code="scoop hold <软件名>"}

允许更新：

:copy{prompt="PS>" lang="ps1" code="scoop unhold <软件名>"}

切换已安装软件的版本：

:copy{prompt="PS>" lang="ps1" code="scoop reset <软件名@版本号>"}

清理旧版本：

:copy{prompt="PS>" lang="ps1" code="scoop cleanup *"}

清理下载缓存：

:copy{prompt="PS>" lang="ps1" code="scoop cache rm *"}
