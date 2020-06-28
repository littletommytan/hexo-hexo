---
title: DOM事件模型
date: 2019-08-11
tags:
  - Web 开发
---

### DOM

DOM 全称是 Document Object Model，即文档对象模型。DOM 是 W3C 的标准，定义了访问 HTML 和 XML 文档的标准。

> “文档对象模型 （DOM） 是中立于平台和语言的接口，它允许程序和脚本动态地访问和更新文档的内容、结构和样式。”

### DOM 事件

DOM 使 Javascript 有能力对 HTML 上的事件做出反应。这些事件包括鼠标键盘的点击事件、移动事件以及页面中内容的变化等。HTML 元素事件是浏览器内在自动产生的,当有事件发生时 html 元素会向外界(这里主要指元素事件的订阅者)发出各种事件,如 click,onmouseover,onmouseout 等等。

### DOM 事件流

DOM 的结构是一个树形，每当 HTML 元素产生事件时，该事件就会在树的根节点和元素节点之间传播，所有经过的节点都会收到该事件。

### DOM 事件模型

DOM 事件模型分为两类：一类是 IE 所使用的冒泡型事件（Bubbling）；另一类是 DOM 标准定义的冒泡型与捕获型（Capture）的事件。除 IE 外的其他浏览器都支持标准的 DOM 事件处理模型。

<img src="/images/web/dom.png" width="15%">
