---
title: JSB ( Javascript Binding ) 使用笔记
date: 2020-02-05
tags:
  - Cocos
---

学习使用 Jsb 时产生的笔记。

#### 调试
```
#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
    // Enable debugger here
    jsb_enable_debugger("0.0.0.0", 5086);
#endif
```


#### se::Object::root/unroot 与 se::Object::incRef/decRef 的区别?
root/unroot 用于控制 JS 对象是否受 GC 控制，root 表示不受 GC 控制，unroot 则相反，表示交由 GC 控制，对一个 se::Object 来说，root 和 unroot 可以被调用多次，se::Object 内部有_rootCount 变量用于表示 root 的次数。当 unroot 被调用，且_rootCount 为 0 时，se::Object 关联的 JS 对象将交由 GC 管理。还有一种情况，即如果 se::Object 的析构被触发了，如果_rootCount > 0，则强制把 JS 对象交由 GC 控制。

incRef/decRef 用于控制 se::Object 这个 cpp 对象的生命周期，前面章节已经提及，建议用户使用 se::HandleObject 来控制手动创建非绑定对象的方式控制 se::Object 的生命周期。因此，一般情况下，开发者不需要接触到 incRef/decRef。


#### 对象生命周期的关联与解除关联
```
se::Object::attachObject/dettachObject
```
objA->attachObject(objB);类似于 JS 中执行objA.__nativeRefs[index] = objB，只有当 objA 被 GC 后，objB 才有可能被 GC objA->dettachObject(objB);类似于 JS 中执行delete objA.__nativeRefs[index];，这样 objB 的生命周期就不受 objA 控制了