---
title: Serverless 初尝试
date:  2018-12-05
tags:
  - 云原生
  - 架构
---
### Serverless是解决服务器压力的重要途径之一。

目前国内较成熟的产品有：
1. 函数计算 + 表格存储（阿里云）
2. FunctionGraph + 云表格存储（华为云）

<!-- more -->
### 优点
高性能
高可用
服务解耦

### 缺点：
CI/CD难度较高

### 表格存储
表格存储相关产品主要基于NoSql实现。
原因是NoSql具有天生的分布式，分区分片比较合适。故分片是表格存储比较重要的概念，表现为分片键，如以下uuid，具体优点见文档：https://help.aliyun.com/document_detail/27356.html

某个表的信息：
![tablestore.png](/images/tablestore.png)
