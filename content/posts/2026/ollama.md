---
title: 如何在自己使用 ollama 和 open-webui 搭建自己的本地 AI 助手
description: 在本地搭建一个 AI 助手，使用 ollama 作为后端模型服务，open-webui 作为前端界面，提供一个便捷的交互平台。
date: 2026-03-01 21:40:21
updated: 2026-03-01 21:40:21
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/f1249d8
categories: [技术]
tags: [linux, ai, ollama]
---

## 下载 Ollama 与 Docker

### 安装 ollama-cuda

:copy{code="paru -S ollama-cuda"}

启动 ollama 服务。

:copy{code="sudo systemctl start ollama"}

拉取并运行一个模型并测试运行，没问题。

::pic
---
src: https://bu.dusays.com/2026/03/04/69a8034325be6.webp
caption: 拉取运行  olmo-3
height: 320
---
::

### 安装 Docker 容器并开启 Nvidia cuda 加速支持

安装 Docker 容器。

:copy{code="paru -S docker"}

并启动 Docker 服务。

:copy{code="sudo systemctl start docker.service"}

为避免在使用 docker 命令时频繁地使用 sudo 对当前用户提权，将当前用户添加到 docker 组, 然后注销并重新登录，或运行以下命令使更改立即生效。

:copy{code="newgrp docker"}

:copy{code="sudo usermod -aG docker \$USER"}

为启用 nvidia cuda 加速, 安装 nvidia-container-toolkit。

:copy{code="sudo pacman -S nvidia-container-toolkit"}

然后配置 docker 使用 Nvidia cuda 加速。

:copy{code="sudo nvidia-ctk runtime configure --runtime=docker"}

运行命令后的/etc/docker/daemon.json 如下图所示, 其原理是修改容器默认使用 nvidia 运行时，容器自动获得 GPU 访问能力，从而使用 nvidia 显卡的 cuda 加速能力。

::pic
---
src: https://bu.dusays.com/2026/03/04/69a8039432c76.webp
caption: daemon.json
height: 320
---
::

## 下载运行 open-webui

### 下载 open-webui

来到 open-webui 的 github 界面。

::link-card
---
title: open-webui
description: 用户友好型 AI 界面（支持 Ollama， OpenAI API 等）
link: https://github.com/open-webui/open-webui
icon: https://openwebui.com/favicon.ico
---
::

官方的 github 的 README 有详细的部署步骤：

- 如果 Ollama 在本地，使用以下命令：

:copy{code="docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/ -"}

- 如果 Ollama 在远程服务器，使用以下命令：

为了连接到另一台服务器上的 Ollama，请将 OLLAMA_BASE_URL 更改为服务器的 URL：

:copy{code="docker run -d -p 3000:8080 -e OLLAMA_BASE_URL=https://example.com -v open-webui:/app/backer -"}

- 如果需要使用 nvidia 的 cuda 加速能力, 使用以下命令：

:copy{code="docker run -d -p 3000:8080 --gpus all --add-host=host.docker.internal:host-gateway -v open- -"}

这里使用第三条命令进行安装，以使用 nvidia 的 cuda 加速能力。

### 运行测试 open-webui

等待 open-webui 完全启动后, 在浏览器打开 localhost:3000 就可以看到 open-webui 的注册界面。

创建好账号进入界面后发现，找不到之前下载的模型?

::pic
---
src: https://bu.dusays.com/2026/03/04/69a8071cbdd94.webp
caption: 找不到模型
height: 320
---
::

这是因为 Ollama 默认最对宿主机开放端口，Docker 内访问不到，只需要将 Ollama 的端口开放到 0.0.0.0(所有端口可访问，但不是很安全)就可以了，将以下配置写入 Ollama 服务文件。

```bash
sudo tee /etc/systemd/system/ollama.service << 'EoF'
[Unit]
Description=ollama ServiceAfter=network-online.target
[Service]
ExecStart=/usr/bin/ollama serveUser=keao
Group=keao
Restart=always
RestartSec=3
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_HOST=0.0.0.0"
[Install]
wantedBy=multi-user.target
EOF
```

完成之后, 重新加载 daemon, 再重启 Ollama 服务。

:copy{code="sudo systemctl daemon-reload"}
:copy{code="sudo systemctl restart ollama"}

这时, 刷新 open-webui 应该就可以访问到模型了。