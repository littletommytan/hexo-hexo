---
title: 我的 Docker 入门笔记
date:  2018-11-12
tags:
  - Docker
  - 云原生
---
## 开发环境选型
Mac OS 的 Docker 非常简单易用，无需赘述。
但对于 Windows 来说，就算有 Docker in Windows，仍推荐使用虚拟机跑 Linux，再到虚拟机里安装 Docker 。VmWare WorkStation Pro、SecureCRT、WinSCP 这三个工具是 Windows 上的神器。

<!-- more -->

## 安装及常用命令

``` bash
# 安装docker
curl https://get.docker.com | sh

# 常用命令
docker ps -a 
docker images
docker rm -f <c_id>
docker rmi <i_id>
docker volume ls
docker volume prune
docker logs --tail=20 <c_id> 
docker logs -f
docker exec -it <c_id> <bash|sh>
```

## Portainer的使用（ Docker管理工具 ）

在本地 Docker 开发环境，Portainer可谓非常好用，[部署详情见此链接](https://portainer.readthedocs.io/en/latest/deployment.html)

``` bash
# 开发环境简单部署
docker run -d -p 9000:9000 --name portainer --restart always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer

```

## Docker-Compose

简单部署，简单网络隔离，以下为一个 Redis 的例子
```
version: '3'
services:
  redis:
    image: redis
    container_name: redis
    command: redis-server --requirepass 'redis-pwd'
    restart: always
    ports:
      - '6379:6379'
```
<!-- 
## Quick Start

### Create a new post

``` bash
$ hexo new "My New Post"
```

More info: [Writing](https://hexo.io/docs/writing.html)

### Run server



More info: [Server](https://hexo.io/docs/server.html)

### Generate static files

``` bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### Deploy to remote sites

``` bash
$ hexo deploy
```

More info: [Deployment](https://hexo.io/docs/one-command-deployment.html) -->
