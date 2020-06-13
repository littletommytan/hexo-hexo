---
title: 基于 Git 的工作流
date: 2018-12-02
tags:
  - DevOps
  - Git
---

三条主分支：`master` & `release` & `production`，贯彻整个流程始终，需要设置为protected branch，杜绝直接commit和merge代码

master 分支，粒度划分要细，建议不超过一周，杜绝出现 long-lived-branches ；多人协作时，建议经常从 master 最新代码；建议发起 pr 前均需要 pull 一次代码。

<!-- more -->

release 分支，只做 bug 修复，bug 修复完后，发布上线至production，同时要将修复的代码 master

production 为稳定版本，不允许风吹草动

