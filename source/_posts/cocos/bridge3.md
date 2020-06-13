---
title: Cocos 客户端开发中的三座桥（其三） SDKWrapper / SDKManager
date: 2020-01-07
tags:
  - Cocos
---
## 三、SdkManager

上面提到的两座桥是真桥，这第三座则是我自己膨胀出的结果，让一个底层之上的东西比肩JNI和JSB。为什么那么嚣张，因为这个东西直接PK掉了JSB。

先让我们看看它的设计架构：
<img src="/images/cocos/bridge/i3.png" width="30%">

SdkManager身处C++层，向下通过JNI与Java层交互接受生命周期调用，向上通过JSB提供Javascript接口，同层管理各个Sdk。

- 它是一个Lifecycle分发器：当收到生命周期函数调用时，它会将其分发给其下管理的所有Sdk。所以各个Sdk不需要前往各地注册生命周期调用函数，只需要继承并实现Sdk基类中对应的生命周期函数即可。
- 它是一个Sdk Method路由器：通过call方法，SdkManager可以找到对应的Sdk和Method调用它，并返回结果。
- 它是一个中间件：通过C++提供统一的接口，屏蔽了iOS与Android的接口差异。
- 它很安全：它没有用到任何反射代码，不用为iOS多变的审核条款而提心吊胆。

下面是SdkMannger在头文件中的定义
```C++
// SdkManager.h

class SdkManager
{
public:
#ifndef SKIP_BY_AUTO_BINDINGS
    static void addSdk(Sdk *sdk);
    static void removeSdk(Sdk *sdk);
    static Sdk *getSdk(const std::string &name);
#endif
    
    static void call(const std::string &clazz, const std::string &method, const std::string &params, const Sdk::SdkCallback &callback);
    
#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
public:
    static void *appController;
    static void *viewController;
    static void *window;
    
    static void applicationDidFinishLaunching(void *iosUIApplication, void *iosNSDictionary);
    static void applicationWillResignActive(void *iosUIApplication);
    static void applicationDidBecomeActive(void *iosUIApplication);
    static void applicationDidEnterBackground(void *iosUIApplication);
    static void applicationWillEnterForeground(void *iosUIApplication);
    static void applicationWillTerminate(void *iosUIApplication);
    static bool applicationOpenURL(void *iosUIApplication, void *iosNSURL, void *iosNSDictionary);
    static void applicationdidRegisterForRemoteNotificationsWithDeviceToken(void *iosUIApplication, void *iosNSData);
    static void applicationDidReceiveRemoteNotification(void *iosUIApplication, void *iosNSDictionary);
    static void applicationDidReceiveLocalNotification(void *iosUIApplication, void *iosUILocalNotification);
    static void applicationDidRegisterUserNotificationSettings(void *iosUIApplication, void *iosUIUserNotificationSettings);
    static void applicationHandleActionWithIdentifierForRemoteNotification(void *iosUIApplication, void *iosNSString, void *iosNSDictionary, void *completionHandler);
    static void applicationDidFailToRegisterForRemoteNotificationsWithError(void *iosUIApplication, void *iosNSError);
    static int applicationSupportedInterfaceOrientationsForWindow(void *iosUIApplication, void *iosUIWindow);
#endif
    
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID) && !defined(SKIP_BY_AUTO_BINDINGS)
public:
    static void *appActivity;
    static void *glSurfaceView;
    
    static void activityOnCreate();
    static void activityOnPause();
    static void activityOnResume();
    static void activityOnDestroy();
    static void activityOnStart();
    static void activityOnRestart();
    static void activityOnStop();
    static void activityOnNewIntent(void *intent);
    static void activityOnActivityResult(int request, int result, void *intent);
    static void activityOnBackPressed();
    static void activityOnSaveInstanceState(void *bundle);
    static void activityOnRestoreInstanceState(void *bundle);
    static void activityOnConfigurationChanged(void *configuration);
#endif
};
```
可以看到，大部分的行数都被生命周期调用占据了，其他的包含Sdk的`add`, `remove`和`get`方法，最后是一个`call`方法 。
```C++
typedef std::function<void(const std::string &result)> SdkCallback;

static void call(const std::string &clazz, const std::string &method, const std::string &params, const Sdk::SdkCallback &callback)
{
    Sdk *sdk = getSdk(clazz);
    if(sdk) {
        sdk->call(method, params, callback);
    }
}
```
`call`方法的参数列表分别表示`类名`、`方法名`、`参数`、和`返回值`。

- 类名：用于确定业务层需要使用哪一个Sdk
- 方法名：用于确定业务层需要使用哪一个方法
- 参数：作为输入传参，它是字符串类型的，你可以用任何方式将你的参数转化为一串字符传递给Sdk，然后在Sdk中将其再拆解开来。推荐的格式是Json，当然你也可以使用自己的方式进行组合和拆解，SdkManager对此并不关心。
- 返回值：返回值使用callback的形式，并且callback的参数也是字符串类型（同`参数`使用方法）。之所以使用callback的方式，是因为这样可以同时解决同步与异步的问题。举个例子：登录时你可以在一系列用户操作之后拿到token，再使用callback返回这个token，而不用另外想办法将其传回Js层。

Sdk是所有业务Sdk的基类，它提供的`生命周期函数`都等待着业务Sdk的实现，`call`方法少了`类名`，同样等待业务Sdk的实现。
```C++
class Sdk
{
    friend SdkManager;
    
public:
    CC_SYNTHESIZE(std::string, _name, Name);
    
    Sdk(const std::string &name);
    virtual ~Sdk();
    
    typedef std::function<void(const std::string &result)> SdkCallback;
    
    virtual void call(const std::string &method, const std::string &params, const SdkCallback &callback) {}
    
#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
public:
    virtual void applicationDidFinishLaunching(void *iosUIApplication, void *iosNSDictionary) {}
    virtual void applicationWillResignActive(void *iosUIApplication) {}
    virtual void applicationDidBecomeActive(void *iosUIApplication) {}
    virtual void applicationDidEnterBackground(void *iosUIApplication) {}
    virtual void applicationWillEnterForeground(void *iosUIApplication) {}
    virtual void applicationWillTerminate(void *iosUIApplication) {}
    virtual bool applicationOpenURL(void *iosUIApplication, void *iosNSURL, void *iosNSDictionary) { return false; }
    virtual void applicationdidRegisterForRemoteNotificationsWithDeviceToken(void *iosUIApplication, void *iosNSData) {}
    virtual void applicationDidReceiveRemoteNotification(void *iosUIApplication, void *iosNSDictionary) {}
    virtual void applicationDidReceiveLocalNotification(void *iosUIApplication, void *iosUILocalNotification) {}
    virtual void applicationDidRegisterUserNotificationSettings(void *iosUIApplication, void *iosUIUserNotificationSettings) {}
    virtual void applicationHandleActionWithIdentifierForRemoteNotification(void *iosUIApplication, void *iosNSString, void *iosNSDictionary, void *completionHandler) {}
    virtual void applicationDidFailToRegisterForRemoteNotificationsWithError(void *iosUIApplication, void *iosNSError) {}
    virtual int  applicationSupportedInterfaceOrientationsForWindow(void *iosUIApplication, void *iosUIWindow) { return /*UIInterfaceOrientationMaskPortrait*/0x02; }
#endif
    
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
public:
    virtual void activityOnCreate() {}
    virtual void activityOnPause() {}
    virtual void activityOnResume() {}
    virtual void activityOnDestroy() {}
    virtual void activityOnStart() {}
    virtual void activityOnRestart() {}
    virtual void activityOnStop() {}
    virtual void activityOnNewIntent(void *intent) {}
    virtual void activityOnActivityResult(int request, int result, void *intent) {}
    virtual void activityOnBackPressed() {}
    virtual void activityOnSaveInstanceState(void *bundle) {}
    virtual void activityOnRestoreInstanceState(void *bundle) {}
    virtual void activityOnConfigurationChanged(void *configuration) {}
#endif
};
```

这是微信Sdk重写`call`的例子
```C++
void WechatSdk::call(const std::string &method, const std::string &params, const SdkCallback &callback)
{
    if(method == "login") {
        login(callback);
    }
    else if(method == "loginWithQrcode") {
        loginWithQrcode(callback);
    }
    else if(method == "isWXAppInstalled") {
        bool ret = isWXAppInstalled();
        callback(ret ? "true" : "false");
    }
    else if(method == "getWXAppInstallUrl") {
        std::string url = getWXAppInstallUrl();
        callback(url);
    }
}
```

为了能在Javascript层有一个 **漂亮** 的Sdk接口，或许你还应该写一个Js的封装，把SdkManager的调用封装一下。
