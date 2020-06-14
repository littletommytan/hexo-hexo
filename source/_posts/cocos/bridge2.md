---
title: Cocos 客户端开发中的三座桥（其二） JSB
date: 2019-12-15
top: true
tags:
  - Cocos
---
### JSB（Javascript Binding）
JSB是第二座桥，它与JNI类似，是提供Native层与Javascript层互相访问的一种方式，支持双向调用。

上面一章节提到了普通的Android程序架构，下面的是Cocos程序的架构，它是这样的：

<img src="/images/cocos/bridge/i2.png" width="15%">

在Java之上又通过JNI回到了Cocos的Native层，此层是通过动态链接库.so加载的。然后再经过一个JSB的桥与Javascript进行交互。游戏则是使用Javascript编写的。

JSB有好几种，有Mozilla家的SpiderMonkey和Google家的V8，最新的iOS里则用到了Apple自家的JSB接口。使用哪种JSB接口主要取决于使用哪种Javascript虚拟机。

排除掉各种JS虚拟机的不同，Cocos为我们提供了统一的接口，让我们可以使用。它能实现Javascript中的一个方法与一个C方法进行绑定。在Javascript中调用该方法时，则在C++中被绑定的方法会被调用。

#### 1、Javascript 调用 C++
如果我们在C++中看见这样的函数名js_<Namespace>_<Class>_<Method>(se::State& s)那么它就是为JSB而写的了。它不像JNI一样有严格的命名规范，可以时任意函数名，但为了可以方便快捷的定位方法，所以人为的定了这么一个命名规范。
```
static bool js_cocos2dx_FileUtils_addSearchPath(se::State& s)
{
    cocos2d::FileUtils* cobj = (cocos2d::FileUtils*)s.nativeThisObject();
    SE_PRECONDITION2(cobj, false, "js_cocos2dx_FileUtils_addSearchPath : Invalid Native Object");
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= seval_to_std_string(args[0], &arg0);
        SE_PRECONDITION2(ok, false, "js_cocos2dx_FileUtils_addSearchPath : Error processing arguments");
        cobj->addSearchPath(arg0);
        return true;
    }
    if (argc == 2) {
        std::string arg0;
        bool arg1;
        ok &= seval_to_std_string(args[0], &arg0);
        ok &= seval_to_boolean(args[1], &arg1);
        SE_PRECONDITION2(ok, false, "js_cocos2dx_FileUtils_addSearchPath : Error processing arguments");
        cobj->addSearchPath(arg0, arg1);
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 2);
    return false;
}
SE_BIND_FUNC(js_cocos2dx_FileUtils_addSearchPath)
```
这时一段典型的JSB代码，通过函数名我们就知道了这个JSB绑定的是FileUtils的addSearchPath方法。

addSearchPath是个重载函数，一个有1参数，一个有2参数。我们可以看到JSB中是以 逻辑 来区分函数重载的。

乍一看，JSB也辣么变态，1行代码变成27行。如果我只有一个函数绑定JSB还好，如果我有成百上千和函数要绑定，岂不是这辈子都要搭里面了？Noooooo...

好在Cocos又提供的方案，就是自动生成JSB代码。只需要简(bìng)单(bù)配置一个配置文件，然后让生成脚本跑一下，那成百上千的JSB绑定函数就变出来了。

在我们的项目中，我将这个工具放在了tools/bindings-generator下。配置文件是test/test.ini，生成脚本是test/test.py。

不细讲了，自己看吧。

#### 2、C++ 调用 Javascript
不推荐使用C++调用Javascript，因为需要明确地写明方法名来找到该JS方法并调用。而C++是编译语言不支持热更，Javascript则是脚本语言可以作为资源进行热更新。这很容易造成Js中的方法名修改后导致调用失效。

解决方案就是将Js方法作为参数传入C++中，在C++中调用该注册方法。上面提到的bindings-generator支持生成将函数作为参数的代码，好好利用吧。