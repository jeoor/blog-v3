---
title: 如何使用 archinstall 安装 Arch Linux
description: 使用 archinstall 自动化安装脚本安装 Arch Linux，并解决中文显示异常问题。
date: 2026-03-01 21:39:02
updated: 2026-04-12 14:37:25
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/f72a9d9
categories: [技术]
tags: [linux, 安装]
---

Arch Linux 的安装没有图形化界面，完全使用命令行安装，为了方便和避免错误，这里使用了 Arch Linux 官方社区提供的自动化脚本 archinstall 进行安装部署。

## 执行 archinstall 自动化安装脚本

::pic
---
src: https://bu.dusays.com/2026/03/04/69a79f67dad25.webp
caption: archinstall
height: 320
---
::

运行 `archinstall` 命令后会进入交互式配置界面，可以按下表进行设置：

| 配置项 | 推荐值 | 说明 |
|---|---|---|
| Language | `zh_CN.UTF-8` | 中文环境显示更友好 |
| Mirrors | `China` | 国内下载更稳定 |
| Disk configuration | 默认分区方案 | 新手不易出错 |
| Filesystem | `btrfs` | 支持快照，便于系统回滚 |
| Bootloader | `Systemd-boot` | 需要 UEFI 启动 |
| Swap | `No` | U 盘场景可减少写入 |
| Hostname / User | 自定义（用户建议开 sudo） | 便于日常管理 |
| Desktop | `KDE`（按需） | 可按喜好替换为其他桌面 |
| Graphics driver | 按硬件选择（如 `nvidia open driver`） | 以显卡型号为准 |
| Network | `NetworkManager` | 图形和命令行都方便管理 |
| Timezone / NTP | `Asia/Shanghai` / 开启 | 保持时间准确 |

配置完成后 install。

等待一段时间，安装后一系列环境和依赖后出现以下界面，就可以选择 Reboot system 进入安装好的系统了。

::pic
---
src: https://bu.dusays.com/2026/03/04/69a79f688d9d7.webp
caption: 安装完成
height: 320
---
::

## 解决中文显示异常问题

::pic
---
src: https://bu.dusays.com/2026/03/04/69a79f6683de9.webp
caption: 中文显示异常
height: 320
---
::

我们可以看到, 上面的登录界面中有许多方格, 这是因为 Arch Linux 默认不包含中文字体。通过安装 noto-fonts-cjk, wqy-microhei 等字体，并执行 fc-cache-fv 刷新字体缓存就可以解决该问题(如果还不行就注销重新登录)。

1. 安装中文字体
:copy{code = "sudo pacman -S adobe-source-han-sans-cn-fonts adobe-source-han-serif-cn-fonts noto-fonts-cjk wqy-microhei wqy-microhei-lite wqy-bitmapfont wqy-zenhei ttf-arphic-ukai ttf-arphic-uming"}

2. 刷新字体缓存
:copy{code = "fc-cache -fv"}

::pic
---
src: https://bu.dusays.com/2026/03/04/69a79f6732615.webp
caption: 中文显示正常
height: 320
---
::

OK, 中文可以正常显示了。
