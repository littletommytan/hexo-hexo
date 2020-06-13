---
title: Git 稀疏检出
date: 2019-06-11
tags:
  - Git
---

##### git 支持只Checkout部分内容（注意：Git版本要在1.7以上）


#### 1、开启
git config core.sparsecheckout true ，也可以在目录 .git/config 中看到

图片描述



#### 2、写入要获取的文件
echo "/*" >> .git/info/sparse-checkout ，也可以在目录 .git/info/sparse-checkout 中直接修改需要获取的文件配置

我们C3需要的配置如图：

图片描述



方便你更快，可以拷贝一下：
```
/*
!/assets/courses/C1
!/assets/courses/C2
!/assets/courses/C1.meta
!/assets/courses/C2.meta
!/assets/resources/C1
!/assets/resources/C2
!/assets/resources/C1.meta
!/assets/resources/C2.meta
```

*解释：
通配符*
排除项！
目录名称前带斜杠，如/docs/，将只匹配项目根目录下的docs目录，
目录名称前不带斜杠，如docs/，其他目录下如果也有这个名称的目录，如test/docs/也能被匹配
如果写了多级目录，如docs/05/，则不管前面是否带有斜杠，都只匹配项目根目录下的目录，如test/docs/05/不能被匹配。


#### 3、配置完以后生效
git checkout


#### 4、生效以后可能遇到的问题
生效以后你可能还会看到一些空目录仍然存在，比如目录/assets/courses/C1，这时候你可以删除你在.git/info/sparse-checkout

文件中配置的排除项希望去掉的目录。