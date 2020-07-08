---
title: Javascript 的一个特性
date: 2018-11-28
tags:
  - Javascript
---

## 学习 React Native 的一个笔记

在使用 React Native 时，你的 JavaScript 代码将会运行在两个不同的环境上：

在 iOS、Android 的模拟器或是真机上，React Native 使用的是`JavaScriptCore`，也就是 Safari 所使用的 JavaScript 引擎。但是在 iOS 上 JavaScriptCore 并没有使用即时编译技术（JIT），因为在 iOS 中应用无权拥有可写可执行的内存页（因而无法动态生成代码）。

<!-- more -->

在使用 Chrome 调试时，所有的 JavaScript 代码都运行在 Chrome 中，并且通过 WebSocket 与原生代码通信。此时的运行环境是`V8`引擎。

虽然两个环境非常类似，但开发者还是可能碰到一些不一致的地方。所以请尽量避免使用依赖于特定运行环境的代码。

不同 Js 运行环境对语法、词法要求不同，解析也会产生不同的效果，从而导致`兼容性问题`。
