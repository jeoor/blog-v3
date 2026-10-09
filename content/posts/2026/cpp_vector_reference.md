---
title: C++ 学习笔记：vector 不能存引用吗
description: 记录 vector 不能存引用的原因，以及存值、存指针的区别。
date: 2026-10-09 16:35:30
updated: 2026-10-09 20:18:23
image: # 封面图推荐 2:1，不含与标题重复的文字
permalink: /posts/7d7ab77
categories: [笔记]
tags: [cpp, code]
references:
  - title: STL Vector容器 - lsgxeva - 博客园
    link: https://www.cnblogs.com/lsgxeva/p/7790010.html
---

`vector` 不能直接存引用，下面这种写法会报错：

```cpp
#include <vector>

std::vector<int&> v; // 错误：元素类型不能是引用
```

## 一、引用是别名

引用就是已有对象的别名，初始化后不能重新绑定：

```cpp
int a = 10;
int b = 20;
int& r = a;

r = b; // a 变成 20，r 仍然是 a 的别名
```

## 二、vector 存的是对象

这里的对象不只是类的实例，`a`、`b` 这样的 `int` 变量本身也是对象。

`vector<int>` 会在容器自己的空间里存放 `int` 对象。引用本身不是对象，因此不能作为 `vector` 的元素类型。

`vector<T>` 的 `data()` 返回 `T*`，也就是指向元素的指针。如果 `T` 是 `int&`，就需要形成指向引用的指针，而 C++ 不允许这种类型。

## 三、想修改原变量，可以存指针

存值和存指针的区别：

```cpp
#include <vector>

int main() {
  int a = 10;

  std::vector<int> v1{a};
  v1[0] = 20; // 修改容器里的副本，a 仍然是 10

  std::vector<int*> v2{&a};
  *v2[0] = 30; // 修改 a，a 变成 30
}
```

`&a` 取出 `a` 的地址，`*v2[0]` 通过这个地址访问 `a`。指针本身也是对象，所以可以存进 `vector`。

存指针时，要保证原变量仍然有效。变量销毁后，不能再通过保存的指针访问它。
