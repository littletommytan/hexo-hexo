---
title: Redis 学习笔记
date: 2019-01-15
tags:
  - Redis
  - 架构
---

### Redis 介绍

多核 cpu（docker 构建 redis 集群） （vm 机制） nosql 缓存、内存模型（多路 io 复用）、丰富的数据类型

编码方式、内存分配器、SDS、RedisObject

<!-- more -->

### 对比

memcache 物理内存

mongodb 日志类型 索引查询 优化查询 K-V

### 数据类型

Redis 8 种数据类型的使用场景 string hash list 集合 有序集合 （底层结构、数据结构）

string 存储数据表信息 以分隔符方式（分段设计法） set Teacher::100::name pack
string 二进制文件（字符串）
string json 序列化
string 计数器

hash 整表数据缓存
hset student:101 name xiaoming phone 18666666666
hget(student:101,name)

list（列表）--底层 双向链表 添加时间复杂度为 O(1)
消息队列（并发 2-3w） 简单、开发成本低、不支持消息重发机制
lpush rpush 存
lpop rpop 取

### Redis 在游戏服务器中的简单应用

![](/images/redis-com.png)
https://zhuanlan.zhihu.com/p/34672726

### Redis 与 Mysql 双写一致性方案解析

https://zhuanlan.zhihu.com/p/72671938?utm_source=wechat_session&utm_medium=social&utm_oi=997539823040753664

### QPS 计算方法

![](/images/qps.jpg)
