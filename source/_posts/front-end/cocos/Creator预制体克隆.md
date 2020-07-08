---
title: Cocos Creator 中简单克隆Scene/Prefab + Script的操作方式（不是拷贝） 
date:  2019-06-04
tags:
  - Cocos
---

##### 本文为简单拷贝项目中的预制体而脚本是新的切不丢失不影响property的解决方案
## 原始文件和节点树结构
![arc.png](/images/cocos/copy-prefab/i1.png)
![arc.png](/images/cocos/copy-prefab/i2.png)
![arc.png](/images/cocos/copy-prefab/i3.png)

## 复制步骤
1. 在Finder中找到原始文件的位置，直接复制所有的.fire/.prefab/.ts文件，并在新的副本中删除所有meta文件

![arc.png](/images/cocos/copy-prefab/i4.png)

2. 回到CocosCreator编辑器，等待生成新的meta文件

![arc.png](/images/cocos/copy-prefab/i5.png)

3. 打开新的场景，看到和原场景一样的节点树结构

![arc.png](/images/cocos/copy-prefab/i1.png)

![arc.png](/images/cocos/copy-prefab/i2.png)


4. 在原脚本文件和新的脚本文件上右键“显示资源UUID和路径”，得到新旧两份UUID+ClassID

![arc.png](/images/cocos/copy-prefab/i6.png)

5. 在VSCode中打开新的场景文件，复制原脚本文件ClassID的后18位进行搜索，找到原脚本的引用

![arc.png](/images/cocos/copy-prefab/i7.png)
![arc.png](/images/cocos/copy-prefab/i8.png)

6. 脚本文件的引用比较特殊，是用UUID的前5位和ClassID的后18位拼接起来的ID，所以将新脚本的UUID和ClassID如此组合得到新的ID之后，替换原脚本文件的引用，并保存对.fire文件的修改

![arc.png](/images/cocos/copy-prefab/i9.png)
![arc.png](/images/cocos/copy-prefab/i111.png)

7. 重新打开新的场景文件，发现提示警告

![arc.png](/images/cocos/copy-prefab/i10.png)

    查看属性

![arc.png](/images/cocos/copy-prefab/i11.png)

    这是因为脚本文件名不能冲突，所以在CocosCreator中重命名新的脚本文件名

![arc.png](/images/cocos/copy-prefab/i12.png)

    查看属性得到正确结果

![arc.png](/images/cocos/copy-prefab/i13.png)

Prefab文件的操作同Fire文件

至此，拷贝完毕。