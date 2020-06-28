---
title: Cocos Creator 生成项目的启动工作流程（抄录）
date: 2019-09-11
tags:
  - Cocos
---

### Javascript Binding

Cocos Creator 使用的是 Cocos2d-X 引擎的 js 绑定，开发语言也是 js 了。这里顺带提一下，关于用 Lua 还是 js 绑定的问题。主要的方式如下：引擎开启一个 脚本运行（ Lua 是 Lua State，JavaScript 用的是 V8 等等），然后把 C++ 写的代码，注入到这个引擎内。这样，引擎内就可以以调用注入函数的形式，调用底层代码。

而对于我们的用户而言，所看到的据，我们所编写的 Js/Lua 脚本，居然能够产生就跟原生代码一样的效果。

### 安卓的启动

jsb-default会把CocosCreator中的Cocos2dx引擎C++代码复制在build中，方便做自定义的引擎修改。

jsb-link不会复制C++代码出来，所以使用默认引擎

我们用 Cocos Creator 打包好的安卓项目内，与通常的安卓项目没有什么太大的差异，不过是利用了一些 Jni 技术来加载底层代码。但我们现在只关注启动的流程。

启动的 Activity 是一个叫做 AppActivity 的东西，在其 onCreate() 函数内进行了 SDK 的初始化：

```
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
    if (!isTaskRoot()) {
        // Android launched another instance of the root activity into an existing task
        //  so just quietly finish and go away, dropping the user back into the activity
        //  at the top of the stack (ie: the last state of this task)
        // Don't need to finish it again since it's finished in super.onCreate .
        return;
    }
    // DO OTHER INITIALIZATION BELOW
    
    SDKWrapper.getInstance().init(this);

    // 我们的项目中使用 SDKManager
    
}
```

最终都会执行到引擎的 C++ 类： AppDelegate.cpp。

在其中的一个方法内就能看到，加载初始化的代码：
```
bool AppDelegate::applicationDidFinishLaunching()
{
#if CC_TARGET_PLATFORM == CC_PLATFORM_IOS && PACKAGE_AS
    SDKManager::getInstance()->loadAllPlugins();
#endif
    // initialize director
    auto director = Director::getInstance();
    auto glview = director->getOpenGLView();
    if(!glview) {
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WP8) || (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
        glview = GLViewImpl::create("SCMJ");
#else
        glview = GLViewImpl::createWithRect("SCMJ", cocos2d::Rect(0,0,900,640));
#endif
        director->setOpenGLView(glview);
    }
    
    // set FPS. the default value is 1.0/60 if you don't call this
    director->setAnimationInterval(1.0 / 60);

    ScriptingCore* sc = ScriptingCore::getInstance();
    ScriptEngineManager::getInstance()->setScriptEngine(sc);

    se::ScriptEngine* se = se::ScriptEngine::getInstance();

    jsb_set_xxtea_key("");
    jsb_init_file_operation_delegate();

#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
    // Enable debugger here
    jsb_enable_debugger("0.0.0.0", 5086);
#endif

    se->setExceptionCallback([](const char* location, const char* message, const char* stack){
        // Send exception information to server like Tencent Bugly.

    });

    jsb_register_all_modules();

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS) && PACKAGE_AS
    se->addRegisterCallback(register_all_anysdk_framework);
    se->addRegisterCallback(register_all_anysdk_manual);
#endif

    se->start();

    jsb_run_script("main.js");

    return true;
}
```
简单的解释：

初始化 openGL 视图。
初始化脚本核心引擎。
注入所有模块。
启动脚本引擎
执行脚本 main.js。
这样就将控制权转交给了脚本引擎中的 main.js。

#### main.js

当加载完我们项目相关的 js 后，就会把这些参数，传递给给 引擎的 game 对象 run 方法。启动游戏了

#### jsb_register_all_modules 将相关的底层接口注册到js引擎

在这个函数中，首先获取一个 ScriptEngine(se) 的实例，然后就会进行一系列的加载操作。这样我们就有了 JavaScript 调用 C++ (Cocos Native 以及 SDKManager) 和 Java 的能力(因register_javascript_java_bridge)了，js 绑定完成。
