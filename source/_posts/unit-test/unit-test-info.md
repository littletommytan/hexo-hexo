---
title: 单元测试 - 简介
date: 2019-06-15
tags:
  - 单元测试
---

## 测试的类型

* 单元测试 Unit Test
* 集成测试 Integration Test
* 端到端测试 End-to-end Test
* 用户接受性测试 Acceptance Test

## 什么是单元测试？
* “单元测试”是一段由开发人员编写的测试代码，用于测试尽可能小的一个功能。
* “单元测试”保证了
    * 干的事儿和你想的一样，和需求一致
    * 并且以后也保持如此
* 根据输入和输出，一个功能可能需要有多个单元测试。

##为什么写单元测试？
* 实现简单
* 运行快
* 稳定性强
* 投入少回报高

## 都要测些什么？
* 测试正面情况（Positive）
* 测试负面情况（Negative）
* 测试分支（Branching）
* 测试边界值（Edge Cases）

##怎么写？

### 单元测试工具
* Jest
    * Facebook 出品
    * 适用于任何JavaScript/TypeScript项目
    * 快！

### 基础工具
* describe()            一个测试套件 (Test Suite)
* it()                        一个测试用例 (Test Case)
* expect()               一个断言 (assertion)
    * toBe(), toEqual(), toMatch(), …

### 简单的单元测试

### 其他工具
* Jest
    * jest.fn()
* Sinon
    * fake/stub/mock

### 复杂的单元测试

### 越来越多的依赖
* 依赖注入 Dependency Injection
    * 依赖反转原则 Dependency Inversion

## 什么是好的单元测试？
* 跑得快
* 不容易坏
* 一目了然
* 抓得住Bug！
* 投入产出比得当

### 常用原则
* 一个测试用例测一件事（单一责任原则）
* 描述清晰，言简意赅
* 没有if/for/while…
* 业务逻辑里没有测试逻辑（测试不该影响业务实现）
* （未完待续。。。

### 开头难
* React/Node/Cocos，结构迥异。
* 不同类型的测试对象，适用的方法不一样。
* 每个人都有自己的想法，测试的方式八仙过海。

### 总结经验
* 写测试 -> 总结经验 -> 推广好的测试方式。
* 改进工具，降低测试门槛。
    1. 增加通用的测试工具函数/类 (Utilities)
    2. 利用开发工具自动化
        1. TS Lint提示/自动生成测试

##测试驱动开发
Test-driven Development

## 资源
* https://jestjs.io/zh-Hans/
* https://www.slideshare.net/homespothq/unit-testing-concepts-and-best-practices
* https://zhuanlan.zhihu.com/p/25939152
