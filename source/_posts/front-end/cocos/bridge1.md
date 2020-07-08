---
title: Cocos 客户端开发中的三座桥（其一） JNI
date: 2019-11-03
top: true
tags:
  - Cocos
---

Cocos Creator ts项目构建后在Andorid上的开发，我们会用到三种语言：Java、C++和Javascript。往往一个简单的功能就需要同时用到这几种语言，例如微信的登录，需要在Javascript响应按钮的点击操作，在Java中调用SDK的login接口，最后再将SDK的结果返回给Javascript层用于进行后续逻辑。

在Java、C++、Javascript各自的语言上进行开发我们这里不做详解。基本上有编程经验的人都能很快上手。

### 一、JNI（Java native interface）
JNI是第一座桥，用于在Java和C++间进行交互。

Java jni本意是Java native interface（Java本地接口），是为了方便Java调用c、c++等本地代码所封装的一层接口。

Java的跨平台特性导致其本地交互的能力不够强大，一些和操作系统相关的特性Java无法完成，于是Java提供了JNI专门用于和本地代码交互，这样就增强了Java语言的本地交互能力。

通过Java jni，用户可以调用用c、c++所编写的native code。Native code也可以调用Java code。

一个普通的Android程序是这样的架构

<img src="/images/cocos/bridge/i1.png" width="15%">

通过JNI在Native（C++）和Java间进行交互，Android App使用Java进行开发。

#### 1、Java调用C++
当Java要使用C++的方法时，方法的实现是在C++中编写的，首先需要在Java中使用native关键字对该方法进行声明。

```
// Baz.java
package com.foo.bar
public class Baz {
  public static void native qux();
  public static int native quux(int param1, boolean param2, String param3);
}
```

然后在C++中仅仅需要按照规定的函数命名方式进行函数命名即可。

    注意: C++编译器可能会对普通的c函数进行函数名变形，所以别忘了加上extern "C"。

```
// BazJni.cpp
#include <jni.h>
extern "C" {
  JNIEXPORT void JNICALL Java_com_foo_bar_Baz_qux(JNIEnv *env, jobject thiz) {
    // balabala
  }
  JNIEXPORT jint JNICALL Java_com_foo_bar_Baz_quux(JNIEnv *env, jobject thiz, jint param1, jboolean param2, jobject param3) {
    jobject ref = env->NewLocalRef(param3);
    // balabala
  }
}
```

这样，JNI会自动将两者关联并进行调用，无需我们做更多处理。

需要注意的是，虽然C++和Java之间可以交互，对于传入C++的Java对象进行简单赋值是不会在Java内对其产生引用效果的，所以需要显式地创建Java引用来防止其在Java内被回收掉。

```
jobject ref = env->NewGlobalRef(param) // 创建全局引用
jobject ref = env->NewLocalRef(param) // 创建局部引用
```

#### 2、C++调用Java
C++调用Java相对麻烦点，需要采用一系列C++函数来 找到 并 执行 它。可想而知，一个简简单单的Java语句到了C++层来调用，要花掉好几行。

例如在Java中有这么一个方法需要在C++中被调用

```
// Baz.java
package com.foo.bar
public class Baz {
  public static int qux(int param1, boolean param2, String param3);
}
```

C++中是这么写的

```
// BazJni.cpp
#include <jni.h>
// Baz.qux(123, true, "HelloWorld");
env = getEnv();
jclass classID = _getClassID("com/foo/bar/Baz");
jmethodID methodID = env->GetStaticMethodID(classID, "qux", "(IZLjava/lang/String;)I");
jobject jtext = env->NewStringUTF("HelloWorld");
int ret = env->CallStaticIntMethod(classID, methodID, 123, true, jtext);
```

这里getEnv和_getClassID里面是如何实现我就不展开了，那又是一大段故事了。

简单的一行Baz.qux(123, true, "HelloWorld");竟然花了这么多行！！！而且其中还混入了奇怪的东西，"(IZLjava/lang/String;)I"又是什么鬼啊？？？

这又要引入新的概念了，就是数据类型签名。我们知道像Java这种高级语言是有 重载 功能的，即允许在同一范围中声明几个功能类似的同名函数，但是这些同名函数的形式参数必须不同。那么问题就来了，我想调用qux这个方法，但它如果有好几个重载，JNI如何知道该调用哪一个呢？程序又不会意念感应，当然不知道你想使用哪一个。

```
int qux();
int qux(int param1);
int qux(int param1, boolean param2);
int qux(int param1, boolean param2, String param3);
```
数据类型签名就是解决这个问题的，它需要程序员明确地注册参数列表样式，让JNI知道被调用的是哪一个方法。

数据签名如下表：

				
|  本地类型   | JNI类型  | Java类型 | 类型签名（signature） | 描述 |
|  ----  | ----  | ----  | ----  | ----  |
| void  | void | V | - | - |
| bool | jboolean | boolean	Z | 无符号8位 | - |
| signed | char | jbyte | byte | B | 有符号8位 | - |
| short | jshort | short | C | 无符号16位 | - |
| int | jint | int | I | 有符号32位 | - |
| long | long | jlong | long | J | 有符号64位 | - |
| float | jfloat | float | F | 32位浮点 | - |
| double | jdouble | double | D | 64位浮点 | - |
| <type>[] | | | [ <type> 数组 ] | 数组 |

使用方式是直接拼接成一个字符串

如上面的(int, boolean, String)就是变成了"(IZLjava/lang/String;)"，其中String的签名是Ljava/lang/String;，因为它的package是package java.lang。同样，返回值也是需要签名的。放在括号的后面，例如"(IZLjava/lang/String;)I"表示返回值是int类型。

讲了辣么多，是不是觉得 C++ 调用 Java 简直就是 地狱模式。

所幸Cocos的JniHelper类为我们提供了简单的方法，也得益于C++的模版功能，我们有了这么一系列简单的接口。

```
template <typename... Ts>
void callStaticVoidMethod(const std::string& className, const std::string& methodName, Ts... xs);
bool callStaticBooleanMethod(const std::string& className, const std::string& methodName, Ts... xs);
int callStaticIntMethod(const std::string& className, const std::string& methodName,  Ts... xs);
float callStaticFloatMethod(const std::string& className, const std::string& methodName, Ts... xs);
... etc.
```

只需要在后面直接列出参数即可，如此神奇。如下：
```
int ret = JniHelper::callStaticIntMethod("com/foo/bar/Baz", "qux", 123, true, "HelloWorld");
```
具体实现，可以移步"JniHelper.h"中了解。