---
title: Vim使用手册（摘抄）
date: 2019-04-21
tags:
  - Java
---

# Vim的使用

阅读文档前推荐先看看命令：vimtutor **强烈推荐**

## vim 简介

全称：Vi IMproved,和vi的区别：他们都是多模式编辑器，它不仅兼容vi,还支持更多的特性，总的来说就是vi的升级版

## 模式

+ 普通模式
+ 插入模式
+ 命令模式
+ 窗口模式
+ 可视化模式


<img src="https://s2.ax1x.com/2019/01/09/FOC481.jpg" width="30%">

## vimrc

全称：**vim run command**   可以在命令模式下设置进行设置，或者全局设定在~/.vimrc中配置。

常用的有：

+ set number     显示行号
+ syntax on        语法高亮
+ set showmode   在底部显示，当前处于命令模式还是插入模式
+ set autoindent  自动缩进
+ set shifwdth=4 设置每一级的字符数
+ set softabstop=2 Tab转为多少个空格
+ set hlsearch    搜索结果高亮
+ set incsearch  输入搜索结果时显示搜索结果
+ set showcmd  显示输入命令



## 移动、跳转、缩进

### 方向移动

|  h   |  左  |
| :--: | :--: |
|  j   |  下  |
|  k   |  上  |
|  l   |  右  |

### 单词和字符串移动

| w/W  | 正向移动到下一个单词的开头 |
| :--: | :------------------------: |
| b/B  |          反向移动          |
| e/E  | 正向移动到下一个单词的结尾 |
|  ge  |            反向            |

<img src="https://s2.ax1x.com/2019/01/09/FOPyRI.jpg" width="30%">

### 跳转

|  Ctrl-f  |  下一页  |
| :------: | :------: |
|  Ctrl-b  |  上一页  |
| Ctrl-d/u | 上下半页 |
|   gg/G   |  首/尾   |
|    ^     |   行首   |
|    $     |   行尾   |

### 缩进

|            >>            |    右缩进    |
| :----------------------: | :----------: |
|            <<            |    左缩进    |
| :m,n >   注：“m>(n-m+1)” | m 到 n行缩进 |

## 复制、粘贴、删除

|     按键操作     |     定义     |
| :--------------: | :----------: |
| d = delete = cut |     剪切     |
| y = yank = copy  |     复制     |
| p = put = paste  | 粘贴到光标后 |
|     u = undo     |     撤销     |
|  Ctrl-r = redo   |     重做     |


## vim特性一

### 组合

​							**[count]operation ([count]{motion})**

|   2dw   |   执行两次删除单词的操作   |
| :-----: | :------------------------: |
| d{hjkl} | 删除上下左右一个操作的字符 |
|   yw    |        复制一个单词        |

## 修改、查找、替换

### 修改

|  r   | Repalee 替换字符 |
| :--: | :--------------: |
|  c   | Change 更改字符  |

### 查找

| f{char} | 正向查找下一个字符 |
| :-----: | :----------------: |
| /{char} |     命名行查找     |

### 替换（substitute）

**语法： s[ubstitute]/{pattern}/{string}/{flags}**

+ s/foo/bar     替换当前行

+ %s/foo/bar/g  %匹配所有的

## vim 特性二

### 文本对象

​								**{operator}{a}{object}**

​								**{operator}{i}{object}**

​									a 包含间隔空格

​									i 只是内容本身

### object

|  w   |   Word 单词    |
| :--: | :------------: |
|  s   | sentence 句子  |
|  p   | Paragraph 段落 |

## vim 特性三

## 宏

自增例子：

​	qa				开始录制宏到寄存器

​	yyp				复制粘贴

​	Ctrl-a			数字加一

q	退出完成录制

执行 @name

## 参考资料

[官网](https://www.vim.org/): [www.vim.org](http://www.vim.org)

配置: <http://www.ruanyifeng.com/blog/2018/09/vimrc.html>

维基百科：<https://zh.wikipedia.org/wiki/Vim>

视频教学： https://www.imooc.com/learn/1049

命令：vimtutor **强烈推荐**