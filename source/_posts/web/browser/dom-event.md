---
title: DOM 事件模型
date: 2019-08-11
tags:
  - Web 开发
---

### DOM

DOM 全称是 Document Object Model，即文档对象模型。DOM 是 W3C 的标准，定义了访问 HTML 和 XML 文档的标准。

> “文档对象模型 （DOM） 是中立于平台和语言的接口，它允许程序和脚本动态地访问和更新文档的内容、结构和样式。”

### DOM 事件

DOM 使 Javascript 有能力对 HTML 上的事件做出反应。这些事件包括鼠标键盘的点击事件、移动事件以及页面中内容的变化等。HTML 元素事件是浏览器内在自动产生的,当有事件发生时 html 元素会向外界(这里主要指元素事件的订阅者)发出各种事件,如 click,onmouseover,onmouseout 等等。

### DOM 事件流及事件模型

DOM 的结构是一个树形，每当 HTML 元素产生事件时，该事件就会在树的根节点和元素节点之间传播，所有经过的节点都会收到该事件。

DOM 事件模型分为两类：一类是 IE 所使用的冒泡型事件（Bubbling）；另一类是 DOM 标准定义的冒泡型与捕获型（Capture）的事件。除 IE 外的其他浏览器都支持标准的 DOM 事件处理模型。

<img src="/images/web/dom.png" width="20%">

- #### 冒泡型事件处理模型（Bubbling）

如上图所示，冒泡型事件处理模型在事件发生时，首先在最精确的元素上触发，然后向上传播，直到根节点。反映到 DOM 树上就是事件从叶子节点传播到根节点。

- #### 捕获型事件处理模型（Captrue）

相反地，捕获型在事件发生时首先在最顶级的元素上触发，传播到最低级的元素上。在 DOM 树上的表现就是由根节点传播到叶子节点。

### 标准的 DOM 事件处理模型

标准的事件处理模型分为三个阶段：

- 父元素中所有的捕捉型事件（如果有）自上而下地执行
- 目标元素的冒泡型事件（如果有）
- 父元素中所有的冒泡型事件（如果有）自下而上地执行

### 注册事件监听

#### 1、传统方式的事件模型即直接在 DOM 元素上绑定事件处理器，例如—

```
  window.onload=function(){…}
  obj.onmouseover=function(e){…}
  obj.onclick=function(){…}
```

首先这种方式是无论在 IE 还是 Firefox 等其他浏览器上都可以成功运行的通用方式。这便是它最大的优势了，而且在 Event 处理函数内部的 this 变量无一例外的都只想被绑定的 DOM 元素，这使得 Js 程序员可以大大利用 this 关键字做很多事情。

至于它的缺点也很明显，就是传统方式只支持 Bubbling，而不支持 Capturing，并且一次只能绑定一个事件处理器在 DOM 元素上，无法实现多 Handler 绑定。最后就是 function 参数中的 event 参数只对非 IE 浏览器有效果(因为 IE 浏览器有特制的 window.event)。

#### 2、W3C (Firefox.e.g) Event Module

Firefox 等浏览器很坚决的遵循 W3C 标准来制定浏览器事件模型，使用 addEventListener 和 removeEventListener 两个函数，看几个例子—

```
  window.addEventListener(‘load’,function(){…},false);
  document.body.addEventListener(‘keypress’,function{…},false);
  obj.addEventListener(‘mouseover’,MV,true);
  function MV(){…}
```

addEventListener 带有三个参数，第一个参数是事件类型，就是我们熟知的那些事件名字去掉前面的’on’，第二个参数是处理函数，可以直接给函数字面量或者函数名，第三个参数是 boolean 值，表示事件是否支持 Capturing。

W3C 的事件模型优点是 Bubbling 和 Capturing 都支持，并且可以在一个 DOM 元素上绑定多个事件处理器，各自并不会冲突。并且在处理函数内部，this 关键字仍然可以使用只想被绑定的 DOM 元素。另外 function 参数列表的第一个位置(不管是否显示调用)，都永远是 event 对象的引用。

至于它的缺点，很不幸的就只有在市场份额最大的 IE 浏览器下不可使用这一点。

#### 3、IE Event Module

IE 自己的事件模型跟 W3C 的类似，但主要是通过 attachEvent 和 detachEvent 两个函数来实现的。依旧看几个例子吧—

```
window.attachEvent(‘onload’,function(){…});
document.body.attachEvent(‘onkeypress’,myKeyHandler);
```

可以发现它跟 W3C 的区别是没有第三个参数，而且第一个表示事件类型的参数也必须把’on’给加上。这种方式的优点就是能绑定多个事件处理函数在同一个 DOM 元素上。

至于它的缺点，为什么如今在实际开发中很少见呢？首先 IE 浏览器本身只支持 Bubbling 不支持 Capturing；而且在事件处理的 function 内部 this 关键字也无法使用，因为 this 永远都只想 window object 这个全局对象。要想得到 event 对象必须通过 window.event 方式，最后一点，在别的浏览器中，它显然是无法工作的。
