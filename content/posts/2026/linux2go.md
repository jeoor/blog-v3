---
title: 如何使用 Ventoy 制作一个便捷的 Arch Linux to go
description: 使用 Ventoy 制作一个属于自己的 Arch Linux to go，方便在不同设备上使用自己的 Linux 环境
date: 2026-03-01 21:36:58
updated: 2026-03-01 21:36:58
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/2a0607d
categories: [经验分享]
tags: [linux, linux2go]
---

本文以 Arch Linux 为例，你也可以替换为其他 Linux 发行版。

## 前提准备

制作 Linux to go 介质需要以下工具：

- [Oracle VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- [Ventoy](https://www.ventoy.net/en/download.html)
- [Arch Linux 系统镜像](https://archlinux.org/download/)
- [vtoyboot 插件](https://github.com/ventoy/vtoyboot/releases)

## 准备安装环境

### 制作 Ventoy 引导盘

打开 `Ventoy2Disk.exe`，选择要制作的 U 盘并点击安装（这里我已经安装过了）。

::pic
---
src: https://bu.dusays.com/2026/03/02/69a5a9896d170.webp
caption: Ventoy2Disk
height: 320
---
::

安装后，文件资源管理器里会出现一个盘符为 Ventoy 的空 U 盘。你可以把它格式化为 NTFS（不会影响已安装的 Ventoy），相对更安全，断电后也更不容易丢文件。

这样，Ventoy 引导盘就做好了。

### 创建虚拟机

打开 Oracle VirtualBox，新建虚拟机并选择准备好的镜像，软件会自动识别系统类型。

接下来有两个非常重要的设置：

- 勾选 `Use EFI`：否则无法被 Ventoy 正确引导。这里我的内存和 CPU 数量都使用了软件推荐值（仅影响虚拟机，不会继承到 Linux to go）。

::pic
---
src: https://bu.dusays.com/2026/03/02/69a5ac8114c25.webp
caption: 勾选 Use EFI
height: 320
---
::

- 预先分配全部空间：这个值就是系统安装后的总空间。我这里设置为 64G（请根据自己的需求和 U 盘容量设置），该项配置完成后通常不便更改。

::pic
---
src: https://bu.dusays.com/2026/03/02/69a5ac81b6d79.webp
caption: 预先分配全部空间
height: 320
---
::

配置完成后，创建介质并启动虚拟机安装系统。

## 安装系统

如果你同样使用 Arch Linux，可以参考[我的这篇文章](/posts/f72a9d9)。

## 制作 vtoy 文件

### 配置启动参数

1. 查看 `/boot/loader/entries` 中的 `PARTUUID` 并记录

:copy{code="cat /boot/loader/entries/*.conf | grep --color=auto PARTUUID"}

2. 查询本机的 `UUID` 并记录

:copy{code="blkid"}

3. 将 `PARTUUID` 替换为 `UUID`

:copy{code="sudo sed -i.bak 's/PARTUUID=你的PARTUUID/UUID=你的UUID/' /boot/loader/entries/*.conf"}

### 配置 Grub

1. 安装 `grub` 和 `lvm2`

:copy{code="sudo pacman -S --needed grub lvm2"}

2. 配置 Grub

:copy{code="sudo grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=grub --removable"}

:copy{code="sudo grub-mkconfig -o /boot/grub/grub.cfg"}

### 运行 vtoyboot 脚本

1. 挂载 `vtoyboot.iso`（前面下载的 Ventoy 插件）

::pic
---
src: https://bu.dusays.com/2026/03/02/69a5b3b0cabd7.webp
caption: 挂载 vtoyboot.iso
height: 320
---
::

2. 打开文件管理器，找到新增的盘符 `Vtoyboot`，可以看到 `vtoyboot.tar.gz`，将其解压到任意位置

3. 运行 vtoyboot 脚本

:copy{code="sudo ./vtoyboot.sh"}

### 移动介质到 Ventoy U 盘

完成以上步骤后，将虚拟机的 `.vdi` 文件移动到 U 盘根目录，并把后缀改为 `.vtoy`。

## 进入系统

进入电脑的 BIOS 界面。下面是常见品牌的快捷键，在开机 Logo 出现时按下对应按键即可。

::alert
如果不确定按键时机，可以在开机时连续按下对应快捷键。
::

| 品牌 | 快捷键 |
|---|---|
|华硕 (ASUS) |	F2 或 Del |
|联想 (Lenovo) 笔记本 |	F2、Fn + F2、F1 |
|联想 (Lenovo) 台式机 |	F1 |
|联想 ThinkPad | 按 Enter 后再按 F1 |
|戴尔 (Dell) |	F2 或 F12 |
|惠普 (HP) | Esc、F10 |
|宏碁 (Acer) |	F2、Del |
|技嘉 (Gigabyte) | Del、F12 |
|微星 (MSI) | Del、F2 |
|三星 (Samsung) |	F2、F10 |
|微软 Surface | 按住音量增大键 |

::quote
建议先在 BIOS 中关闭 Secure Boot（安全启动），以避免 Ventoy / .vtoy 无法引导。
::

进入 BIOS 的启动设备选择界面后，选择已制作好的 U 盘，进入到 Ventoy 引导界面，选择 `xxx.vtoy` 即可进入系统。

::pic
---
src: https://bu.dusays.com/2026/03/03/69a5b75d8c5e2.webp
caption: 配置好的桌面
height: 320
---
::