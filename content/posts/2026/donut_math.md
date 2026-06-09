---
title: 甜甜圈的数学：donut.c 是如何工作的
description: 解析 a1k0n 的 donut.c，透视投影、环面参数化、光照与 Z 缓冲。
date: 2026-06-09 21:19:49
updated: 2026-06-09 21:19:49
image: # 封面图推荐 2：1，不含与标题重复的文字
permalink: /posts/e6681c2
categories: [开发]
tags: [code, c/c++, math]
donation: false
references:
   - title: donut.c 是如何工作的
     link: https://www.a1k0n.net/2011/07/20/donut-math.html
   - title: 混淆 C 甜甜圈
     link: https://www.a1k0n.net/2006/09/15/obfuscated-c-donut.html
   - title: 甜甜圈增强版
     link: https://www.a1k0n.net/2006/09/20/obfuscated-c-donut-2.html
   - title: 不依赖数学库的 donut.c
     link: https://www.a1k0n.net/2021/01/13/optimizing-donut.html
   - title: donut.js 源码
     link: https://www.a1k0n.net/js/donut.js
---

::meta-copyright{title="翻译整理文章"}
本文整理自 a1k0n (Andy Sloane) 的相关博文，仅供学习交流。
::

> 本文主要翻译自: https://www.a1k0n.net/2011/07/20/donut-math.html
>
> 作者: a1k0n (Andy Sloane)
>
> 相关补充: https://www.a1k0n.net/2006/09/20/obfuscated-c-donut-2.html 与 https://www.a1k0n.net/2021/01/13/optimizing-donut.html

*原文发布于 2011年7月20日，2021年1月13日更新了[一些优化](https://www.a1k0n.net/2021/01/13/optimizing-donut.html)*

a1k0n 在 2006 年写的["甜甜圈"代码](https://www.a1k0n.net/2006/09/15/obfuscated-c-donut.html)，后来因 Lex Fridman、Joma Tech 等视频传播而再次走红，有人要求解释，于是 a1k0n 写了这篇详解。

donut.c 的渲染流程可以概括为：在环面表面采样大量 3D 点，绕两个轴旋转，用透视投影映射到终端字符网格，根据光照选择亮度字符，并用 Z 缓冲遮挡后方点。下面是完整代码：

```c [donut.c]
             k;double sin()
         ,cos();main(){float A=
       0,B=0,i,j,z[1760];char b[
     1760];printf("\x1b[2J");for(;;
  ){memset(b,32,1760);memset(z,0,7040)
  ;for(j=0;6.28>j;j+=0.07)for(i=0;6.28
 >i;i+=0.02){float c=sin(i),d=cos(j),e=
 sin(A),f=sin(j),g=cos(A),h=d+2,D=1/(c*
 h*e+f*g+5),l=cos      (i),m=cos(B),n=s\
in(B),t=c*h*g-f*        e;int x=40+30*D*
(l*h*m-t*n),y=            12+15*D*(l*h*n
+t*m),o=x+80*y,          N=8*((f*e-c*d*g
 )*m-c*d*e-f*g-l        *d*n);if(22>y&&
 y>0&&x>0&&80>x&&D>z[o]){z[o]=D;;;b[o]=
 ".,-~:;=!*#$@"[N>0?N:0];}}/*#****!!-*/
  printf("\x1b[H");for(k=0;1761>k;k++)
   putchar(k%80?b[k]:10);A+=0.04;B+=
     0.02;}}/*****####*******!!=;:~
       ~::==!!!**********!!!==::-
         .,~~;;;========;;;:~-.
             ..,--------,*/
```

...代码和运行效果都是甜甜圈🍩，也可以到[我的关于页](/about)查看效果。

::pic
---
src: https://bu.dusays.com/2026/06/09/6a27ee8ac4d9c.gif
caption: 运行效果
height: 320
---
::

编译命令：

:copy{code="gcc -std=c89 -w donut.c -o donut -lm"}

::alert{type="info"}
原始代码依赖旧式 C 规则。若改成现代 C 写法，通常需要补上 `#include <stdio.h>`、`#include <string.h>`、`#include <math.h>`，并使用标准的 `main` 函数声明。
::

为了方便后续对照，先列出原始代码中关键变量的含义：

| 变量 | 含义 |
|------|------|
| `j` | 截面圆角度 $\theta$（外层循环，步长 0.07） |
| `i` | 环面旋转角度 $\phi$（内层循环，步长 0.02） |
| `A`, `B` | 动画旋转角（绕 $x$ 轴和 $z$ 轴） |
| `c, l` | $\sin\phi, \cos\phi$ |
| `d, f` | $\cos\theta, \sin\theta$ |
| `e, g` | $\sin A, \cos A$ |
| `m, n` | $\cos B, \sin B$ |
| `h` | $R_2 + R_1\cos\theta$（即 $\cos\theta + 2$） |
| `D` | $1/z$，倒深度，同时用于透视缩放和 Z 缓冲比较 |
| `t` | 中间变量（$c h g - f e$），同时用于 $x$ 和 $y$ 屏幕坐标计算 |
| `x, y` | 屏幕坐标 |
| `N` | 光照亮度索引（映射到字符 `.,-~:;=!*#$@`） |
| `z[1760]` | Z 缓冲区（80×22） |
| `b[1760]` | 字符帧缓冲区 |

它的核心是一个帧缓冲区和一个 Z 缓冲区，用于渲染像素。因为只是渲染相对低分辨率的 ASCII 艺术，所以可以走捷径。它所做的只是沿着环面表面以固定角度增量绘制像素，并且绘制得足够密集，使最终结果看起来是实心的。它绘制的"像素"是 ASCII 字符，对应每个点表面的光照值：

:tip[.,-~:;=!*#$@]{tip="从最暗到最亮的 12 个亮度级别"}

不需要光线追踪。

那么该怎么做呢？让我们从 3D 透视渲染背后的数学开始。

## 3D 透视投影

下面的示意图是一个人坐在屏幕前的侧视图，观看屏幕后面的 3D 物体。

::pic
---
src: https://bu.dusays.com/2026/06/09/6a27d2745d00c.webp
caption: 透视投影示意图
height: 320
---
::

要将 3D 物体渲染到 2D 屏幕上，需要将 3D 空间中的每个点 $(x,y,z)$ 投影到距离观察者 $z'$ 单位的平面上，使得对应的 2D 位置为 $(x',y')$。由于是从侧面观察，只能看到 $y$ 和 $z$ 轴，但数学对 $x$ 轴同样适用（只需把这当作俯视图）。这个投影很容易得到：注意原点、$y$ 轴和点 $(x,y,z)$ 形成一个直角三角形，而 $(x',y',z')$ 形成一个相似的直角三角形。因此相对比例得以保持：

$$
\begin{aligned}
\frac{y'}{z'} &= \frac{y}{z} \\
y' &= \frac{y z'}{z}
\end{aligned}
$$

所以要将 3D 坐标投影到 2D，用屏幕距离 $z'$ 来缩放坐标。由于 $z'$ 是一个固定常数，而不是一个功能性的坐标，可以重命名为 $K_1$，所以投影方程变为：

$$
(x',y') = \left(\frac{K_1 x}{z}, \frac{K_1 y}{z}\right)
$$

$K_1$ 可以根据想要在 2D 窗口中显示的视野来自由选择。例如，如果有一个 100×100 的像素窗口，那么视图中心在（50,50）；如果想看到一个在 3D 空间中宽 10 个单位、距观察者 5 个单位的物体，那么 $K_1$ 应该选择使得点 $x=10$、$z=5$ 的投影仍在屏幕上，即 $x' < 50$：$10K_1/5 < 50$，即 $K_1 < 25$。

当绘制一堆点时，可能会在相同的 $(x',y')$ 位置绘制不同深度的点，因此需要维护一个 [Z 缓冲区](https://en.wikipedia.org/wiki/Z-buffering) 记录每个屏幕位置当前最靠前的深度。如果需要绘制某个位置，首先检查是否在已绘制内容的前面。在这个程序里，实际比较的是 $z^{-1} = \frac{1}{z}$，这样很方便，因为：

::alert{type="info"}
- $z^{-1} = 0$ 对应无限深度，所以可以将 Z 缓冲区预初始化为 0，让背景在无限远处
- 可以在计算 $x'$ 和 $y'$ 时重用 $z^{-1}$：除法一次然后乘以 $z^{-1}$ 两次，比除以 $z$ 两次更便宜
- 存储 $z^{-1}$ 而非 $z$，意味着比较方向和常规 Z 缓冲相反：$z^{-1}$ 越大表示越近（而不是越小），所以代码中用 `D > z[o]` 而非 `D < z[o]`
::

到这里，我们已经知道了如何把 3D 点投影到 2D 屏幕；下一步是搞清楚甜甜圈的 3D 形状从哪来。

## 环面参数化

如何绘制甜甜圈，也就是[环面](https://en.wikipedia.org/wiki/Torus)？环面是一个[旋转体](https://en.wikipedia.org/wiki/Solid_of_revolution)。一种方法是在 3D 空间中的某个点周围绘制一个 2D 圆，然后绕环面的中心轴旋转它。下面是通过环面中心的横截面：

::pic
---
src: https://bu.dusays.com/2026/06/09/6a27d288c4a28.webp
caption: 环面横截面
height: 320
---
::

有一个半径为 $R_1$ 的圆，圆心在 $(R_2,0,0)$，绘制在 $xy$ 平面上。可以通过扫过角度——称之为 $\theta$——从 $0$ 到 $2\pi$ 来绘制它：

$$
(x,y,z) = (R_2,0,0) + (R_1 \cos \theta, R_1 \sin \theta, 0)
$$

然后取这个圆并绕 $y$ 轴旋转另一个角度——称之为 $\phi$。要将任意 3D 点绕某个主轴旋转，标准技术是乘以一个[旋转矩阵](https://en.wikipedia.org/wiki/Rotation_matrix)。所以如果取之前的点并绕 $y$ 轴旋转，得到：

$$
\left( \begin{matrix}
R_2 + R_1 \cos \theta, &
R_1 \sin \theta, &
0 \end{matrix} \right)
\cdot
\left( \begin{matrix}
\cos \phi & 0 & \sin \phi \\
0 & 1 & 0 \\
-\sin \phi & 0 & \cos \phi \end{matrix} \right)
$$

$$
= \left( \begin{matrix}
(R_2 + R_1 \cos \theta)\cos \phi, &
R_1 \sin \theta, &
-(R_2 + R_1 \cos \theta)\sin \phi \end{matrix} \right)
$$

到这里，我们已经有了环面上每个点的 3D 坐标；下一步是把整个环面旋转起来。

> 注意区分两层旋转：$\phi$ 是**建模旋转**——绕 $y$ 轴将截面圆旋转一圈，构造出环面的形状。接下来要做的 $A$ 和 $B$ 是**动画旋转**——绕 $x$ 轴和 $z$ 轴旋转整个环面，产生我们看到的三维旋转效果。这两层旋转在矩阵乘法中是叠加在一起的。

## 旋转与展开

但是还需要让整个甜甜圈绕至少两个轴旋转来实现动画。它们在原始代码中被称为 $A$ 和 $B$：一个是绕 $x$ 轴旋转 $A$，另一个是绕 $z$ 轴旋转 $B$。这更复杂一些，但它是一堆矩阵乘法：

$$
\left( \begin{matrix}
R_2 + R_1 \cos \theta, &
R_1 \sin \theta, &
0 \end{matrix} \right)
\cdot
\left( \begin{matrix}
\cos \phi & 0 & \sin \phi \\
0 & 1 & 0 \\
-\sin \phi & 0 & \cos \phi \end{matrix} \right)
\cdot
\left( \begin{matrix}
1 & 0 & 0 \\
0 & \cos A & \sin A \\
0 & -\sin A & \cos A \end{matrix} \right)
\cdot
\left( \begin{matrix}
\cos B & \sin B & 0 \\
-\sin B & \cos B & 0 \\
0 & 0 & 1 \end{matrix} \right)
$$

通过以上计算，得到了环面上的一个 $(x,y,z)$ 点，绕两个轴旋转，以原点为中心。要实际获得屏幕坐标，需要：

- 将环面移到观察者前方（观察者在原点）——只需给 $z$ 加上某个常数使其向后移动
- 从 3D 投影到 2D 屏幕

所以有另一个常数需要选择，称之为 $K_2$，表示甜甜圈到观察者的距离，投影公式变为：

$$
\left( x', y' \right)
=
\left( \frac{K_1 x}{K_2 + z}, \frac{K_1 y}{K_2 + z} \right)
$$

$K_1$ 和 $K_2$ 可以一起调整，以改变视野并压缩或拉伸物体的深度。

可以在代码中实现一个 3×3 矩阵乘法程序，然后直接按上述方式实现。但如果目标是尽可能缩小代码，那么矩阵中的每个 0 都是简化的契机。所以把它乘开。通过一大堆代数运算（感谢 Mathematica！）完整结果是：

$$
\left( \begin{matrix} x \\ y \\ z \end{matrix} \right) =
\left( \begin{matrix}
 (R_2 + R_1 \cos \theta)(\cos B \cos \phi + \sin A \sin B \sin \phi) - R_1 \cos A \sin B \sin \theta \\

 (R_2 + R_1 \cos \theta)(\cos \phi \sin B - \cos B \sin A \sin \phi) + R_1 \cos A \cos B \sin \theta \\
 \cos A (R_2 + R_1 \cos \theta) \sin \phi + R_1 \sin A \sin \theta
\end{matrix} \right)
$$

到这里，我们已经知道每个点画在屏幕上的什么位置；下一步是决定每个点画成什么亮度。

看起来很丑陋，但可以预计算一些公共子表达式（比如所有的正弦和余弦值，以及 $R_2 + R_1 \cos \theta$）并在代码中重用它们。事实上，a1k0n 在原始代码中用了完全不同的因式分解方式，这留给读者作为练习。（原始代码还交换了 A 的正弦和余弦，实际上旋转了 90 度，所以最初的推导有些不同，但没关系。）

## 光照与表面法线

现在知道把像素放在哪里了，但还没有考虑绘制什么色调。要计算光照，需要知道[表面法线](https://en.wikipedia.org/wiki/Surface_normal)——每个点处垂直于表面的方向。如果有了它，就可以取表面法线与光照方向的[点积](https://en.wikipedia.org/wiki/Dot_product)，光照方向可以任意选择。这给出了光照方向和表面方向之间夹角的余弦值：如果点积 > 0，表面朝向光源；如果 < 0，表面背离光源。值越高，落在表面上的光越多。

表面法线方向的推导与空间中点的推导几乎相同。从圆上的一个点开始，绕环面的中心轴旋转，然后再做两次旋转。圆上点的表面法线很显然：与以原点为中心的单位圆（半径 $=1$）上的点相同。

所以表面法线 $(N_x, N_y, N_z)$ 的推导与上面相同，只是起始的点是 $(\cos \theta, \sin \theta, 0)$。然后应用相同的旋转：

$$
\left( \begin{matrix}
N_x, &
N_y, &
N_z \end{matrix} \right)
=
\left( \begin{matrix}
\cos \theta, &
\sin \theta, &
0 \end{matrix} \right)
\cdot
\left( \begin{matrix}
\cos \phi & 0 & \sin \phi \\
0 & 1 & 0 \\
-\sin \phi & 0 & \cos \phi \end{matrix} \right)
\cdot
\left( \begin{matrix}
1 & 0 & 0 \\
0 & \cos A & \sin A \\
0 & -\sin A & \cos A \end{matrix} \right)
\cdot
\left( \begin{matrix}
\cos B & \sin B & 0 \\
-\sin B & \cos B & 0 \\
0 & 0 & 1 \end{matrix} \right)
$$

那么应该选择什么光照方向？选择一个来自观察者上方和后方的光照方向 $(0,1,-1)$，其中 $y=1$ 表示向上，$z=-1$ 指向屏幕深处（远离观察者）。从技术上讲，这应该是一个归一化的单位向量，而这个向量的长度是 $\sqrt{2}$。没关系——稍后会补偿。因此计算上面的法线 $(N_x,N_y,N_z)$，与光照向量做点积，因为光照的 $x$ 分量为 0，所以只剩下 $L = N_y - N_z$：

$$
\begin{aligned}
L &=
\left( \begin{matrix}
N_x, &
N_y, &
N_z \end{matrix} \right)
\cdot
\left( \begin{matrix}
0, &
1, &
-1 \end{matrix} \right)
\\
&=
\cos \phi \cos \theta \sin B - \cos A \cos \theta \sin \phi - \sin A \sin \theta +
\cos B (\cos A \sin \theta - \cos \theta \sin A \sin \phi)
\end{aligned}
$$

同样不太优雅，但一旦预计算了所有的正弦和余弦值，就不算太糟。

## 参数选择与实现

剩下的就是为 $R_1$、$R_2$、$K_1$ 和 $K_2$ 选一些值：

| 参数 | 值 | 含义 |
|------|-----|------|
| $R_1$ | 1 | 截面圆半径 |
| $R_2$ | 2 | 环面中心到截面圆心距离 |
| $K_2$ | 5 | 观察者到甜甜圈距离 |
| $K_1$ | $W \cdot K_2 \cdot \frac{3}{8(R_1+R_2)}$ | 投影缩放系数（$W$ 为屏幕宽度） |

在原始甜甜圈代码中，a1k0n 选择 $R_1 = 1$、$R_2 = 2$，所以它的几何形状与上面的横截面图相同。$K_1$ 控制缩放，这取决于像素分辨率——ASCII 字符的宽高比不是 1:1，所以 $x$ 和 $y$ 方向的缩放系数需要分别调整。$K_2$（观察者到甜甜圈的距离）选择为 5。

a1k0n 用上面的方程写了一个简陋的 Canvas 实现，只绘制像素和上面方程的光照值。结果与原始版本不完全相同，因为一些旋转方向相反或相差 90 度，但效果大同小异。

如果不加 Z 缓冲，环面会显得像是被看穿了，但加上深度比较之后说明数学推导是正确的。将其转换为带 Z 缓冲的 ASCII 渲染，就得到了一个巧妙的小程序。

现在有了所有的部分，但如何编写代码？大致如下（对 2D 数组做了一些伪代码处理）：

```c
const float theta_spacing = 0.07;
const float phi_spacing   = 0.02;

const float R1 = 1;
const float R2 = 2;
const float K2 = 5;
// 根据屏幕尺寸计算 K1: 最大 x 距离大约出现在
// 环面边缘，即 x=R1+R2，z=0 处。希望
// 它被放置在屏幕宽度的 3/8 处，也就是
// 从中心到屏幕边缘的 3/4 处。
// screen_width*3/8 = K1*(R1+R2)/(K2+0)
// screen_width*K2*3/(8*(R1+R2)) = K1
const float K1 = screen_width*K2*3/(8*(R1+R2));

render_frame(float A, float B) {
  // 预计算 A 和 B 的正弦和余弦
  float cosA = cos(A), sinA = sin(A);
  float cosB = cos(B), sinB = sin(B);

  // 伪代码：这里表示二维数组，不是合法 C 语法
  char output[screen_width][screen_height] = ' ';
  float zbuffer[screen_width][screen_height] = 0;

  // theta 绕环面的截面圆旋转
  for (float theta=0; theta < 2*pi; theta += theta_spacing) {
    // 预计算 theta 的正弦和余弦
    float costheta = cos(theta), sintheta = sin(theta);

    // phi 绕环面的旋转中心旋转
    for(float phi=0; phi < 2*pi; phi += phi_spacing) {
      // 预计算 phi 的正弦和余弦
      float cosphi = cos(phi), sinphi = sin(phi);

      // 圆的 x,y 坐标，旋转之前（从上面的方程中提取）
      float circlex = R2 + R1*costheta;
      float circley = R1*sintheta;

      // 旋转后的最终 3D (x,y,z) 坐标，直接来自上面的数学推导
      float x = circlex*(cosB*cosphi + sinA*sinB*sinphi)
        - circley*cosA*sinB;
      float y = circlex*(sinB*cosphi - sinA*cosB*sinphi)
        + circley*cosA*cosB;
      float z = K2 + cosA*circlex*sinphi + circley*sinA;
      float ooz = 1/z;  // "one over z"

      // x 和 y 投影。注意 y 在这里取反，因为
      // y 在 3D 空间中向上，但在 2D 显示中向下。
      int xp = (int) (screen_width/2 + K1*ooz*x);
      int yp = (int) (screen_height/2 - K1*ooz*y);

      // 计算亮度。丑陋，但正确。
      float L = cosphi*costheta*sinB - cosA*costheta*sinphi -
        sinA*sintheta + cosB*(cosA*sintheta - costheta*sinA*sinphi);
      // L 的范围从 -sqrt(2) 到 +sqrt(2)。如果 < 0，表面
      // 背对我们，所以不会尝试绘制它。
      if (L > 0) {
        // 与 Z 缓冲区比较。1/z 越大，像素
        // 比已绘制的内容更接近观察者。
        if(ooz > zbuffer[xp][yp]) {
          zbuffer[xp][yp] = ooz;
          int luminance_index = L*8;
          // L*8 就是"稍后会补偿"的体现：光照向量长度为 sqrt(2)，
          // 乘以 8 后 luminance_index 范围约为 0..11，刚好覆盖 12 个字符
          // 现在查找对应亮度的字符并绘制到输出中:
          output[xp][yp] = ".,-~:;=!*#$@"[luminance_index];
        }
      }
    }
  }

  // 现在将 output[] 输出到屏幕。
  // 将光标移到"home"位置，适用于几乎所有
  // 当前使用的终端仿真模式
  printf("\x1b[H");
  for (int j = 0; j < screen_height; j++) {
    for (int i = 0; i < screen_width; i++) {
      putchar(output[i][j]);
    }
    putchar('\n');
  }

}
```

::alert{type="info"}
ASCII 渲染和 Canvas 渲染的 JavaScript 源代码在[这里](https://www.a1k0n.net/js/donut.js)，可以在浏览器中交互体验。
::

## 不依赖数学库的版本

a1k0n 一直比较遗憾的一点是对 `sin` 和 `cos` 的大量使用——既因为这需要链接数学库（`-lm`），也因为它比实际需要的更加耗费 CPU。如果尝试移植到老 CPU 或嵌入式设备上，这一点尤其明显。

下面是修订版，不使用 `sin`、`cos`，也不需要链接数学库（但这个版本仍然使用浮点类型）：

:copy{code="gcc -std=c89 -w donut_no_math.c -o donut"}

```c [donut_no_math.c]
             i,j,k,x,y,o,N;
         main(){float z[1760],a
      #define R(t,x,y) f=x;x-=t*y\
   ;y+=t*f;f=(3-x*x-y*y)/2;x*=f;y*=f;
   =0,e=1,c=1,d=0,f,g,h,G,H,A,t,D;char
 b[1760];for(;;){memset(b,32,1760);g=0,
h=1;memset(z,0,7040);for(j=0;j<90;j++){
G=0,H=1;for(i=0;i<314;i++){A=h+2,D=1/(G*
A*a+g*e+5);t=G*A        *e-g*a;x=40+30*D
*(H*A*d-t*c);y=          12+15*D*(H*A*c+
t*d);o=x+80*y;N          =8*((g*a-G*h*e)
*d-G*h*a-g*e-H*h        *c);if(22>y&&y>
 0&&x>0&&80>x&&D>z[o]){z[o]=D;b[o]=(N>0
  ?N:0)[".,-~:;=!*#$@"];}R(.02,H,G);}R(
  .07,h,g);}for(k=0;1761>k;k++)putchar
   (k%80?b[k]:10);R(.04,e,a);R(.02,d,
     c);usleep(15000);printf('\n'+(
        " donut.c! \x1b[23A"));}}
          /*no math lib needed
             .@a1k0n 2021.*/
```

输出和之前基本一样。

### 定义旋转

那么，如何在不使用 `sin` 和 `cos` 的情况下得到正弦和余弦？其实代码并不真正需要正弦和余弦本身；它实际做的是在两个嵌套循环中绕原点旋转一个点，另外还旋转两个角度用于动画。如果还记得另一篇文章，内层循环只是在一个圆上画点，而这个圆又绕着另一个更大的圆旋转。在每个循环中，正弦/余弦项只是移动一个小的固定角度。所以我们根本不需要跟踪角度，只需要从 `cos=1`、`sin=0` 开始，绕原点旋转一个圆来生成我们需要的所有正弦和余弦值。我们只需要反复应用一个固定的旋转矩阵：

$$
\begin{bmatrix}
c' \\
s'
\end{bmatrix}
=
\begin{bmatrix}
\cos \theta & -\sin \theta \\
\sin \theta & \cos \theta
\end{bmatrix}
\begin{bmatrix}
c \\
s
\end{bmatrix}
$$

例如，如果在内层循环中使用 0.02 弧度的角度，大致如下：

```c
float c = 1, s = 0; // c for cos, s for sin
for (int i = 0; i < 314; i++) { // 314 * .02 ~= 2π
  // (use c, s in code)
  float newc = 0.9998*c - 0.019998666*s;
  s = 0.019998666*c + 0.9998*s;
  c = newc;
}
```

### 归一化修正漂移

这样做可以，但有个问题：无论定义的常数多么精确，反复迭代这个过程后，$(c, s)$ 向量的长度会随时间指数增长或缩小。如果只需要遍历一次循环，也许可以凑合；但如果需要多次（旋转动画就需要），就必须修正。

::pic
---
src: https://bu.dusays.com/2026/06/09/6a27d229a5542.webp
caption: 重复低精度旋转导致正弦余弦向量长度漂移（夸张示意）
height: 320
---
::

最简单的方法是将 $c$ 和 $s$ 乘以 $\frac{1}{\sqrt{c^2 + s^2}}$，但这样又会用到数学库。相反，可以利用这样一个事实：向量长度一开始就非常接近 1，而且我们还要反复迭代这个过程：可以在每次旋转后做一步牛顿迭代，这就足以让长度在一段时间内保持"足够接近" 1。

我们的目标是求 $a = c^2 + s^2$（即 $(c, s)$ 向量长度的平方）的倒数平方根。定义函数：

$$
f(x) = \frac{1}{x^2} - a
$$

当 $x = \frac{1}{\sqrt{a}}$ 时，函数值为 0。可以从初始猜测 1 开始，执行一步牛顿迭代得到 $x'$，它会"更接近" $\frac{1}{\sqrt{a}}$，也就是让 $c$ 和 $s$ 的长度 $\sqrt{c^2 + s^2}$ 重新"接近" 1 的正确缩放值。

牛顿迭代的定义是：

$$
x' = x - \frac{f(x)}{f'(x)}
$$

a1k0n 用 SymPy 做了求导和化简，得到：

$$
x' = \frac{x(3 - ax^2)}{2}
$$

因为只做一步，可以把初始猜测 $x = 1$ 代入，并把 $a$ 替换回 $c^2 + s^2$，得到最终的校正因子：

$$
x' = \frac{3 - c^2 - s^2}{2}
$$

### 进一步简化旋转矩阵

既然不用担心结果的长度（在一定范围内），还可以再走一步捷径（a1k0n 说是从研究老式 CORDIC 算法中得到的启发）。如果把 $\cos \theta$ 从原始旋转矩阵中提取出来，就得到：

$$
\begin{bmatrix}
c' \\
s'
\end{bmatrix}
=
\frac{1}{\cos \theta}
\begin{bmatrix}
1 & -\tan \theta \\
\tan \theta & 1
\end{bmatrix}
\begin{bmatrix}
c \\
s
\end{bmatrix}
$$

这里用到了三角恒等式：

$$
\tan \theta = \frac{\sin \theta}{\cos \theta}
$$

由于只处理小角度，前面的 $\frac{1}{\cos \theta}$ 项足够接近 1，可以忽略，让后面的牛顿归一化步骤顺便修正长度误差。这样优化版中 `R()` 宏的含义就清楚了：把一对表示余弦/正弦的变量原地旋转一个小角度，然后把它们拉回单位圆附近。

代码顶部是这个宏定义（重新缩进后）：

```c
#define R(t,x,y) \
  f = x;       \
  x -= t * y;  \
  y += t * f;  \
  f = (3 - x*x - y*y) / 2; \
  x *= f;      \
  y *= f;
```

它对单位向量 `x, y` 做原地旋转，其中 `t` 是 $\tan \theta$。`f` 是临时变量；前三行对 `x, y` 做“矩阵乘法”。然后 `f` 被重用来计算长度校正，最后 `x` 和 `y` 乘以 `f`，把它们拉回单位圆上。有了这个操作，只需把所有角度替换成它们的正弦和余弦值，然后运行旋转算子 `R()` 来代替调用 `sin` / `cos`。代码在其他方面完全相同。

**原始旋转矩阵：**
$$
\begin{bmatrix} c' \\ s' \end{bmatrix} =
\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}
\begin{bmatrix} c \\ s \end{bmatrix}
$$

**近似旋转（小角度）：**
$$
\begin{bmatrix} c' \\ s' \end{bmatrix} \approx
\begin{bmatrix} 1 & -t \\ t & 1 \end{bmatrix}
\begin{bmatrix} c \\ s \end{bmatrix}
$$

其中 $t = \tan\theta \approx \sin\theta$（小角度时）。

**归一化修正：**
$$
f = \frac{3 - c^2 - s^2}{2}
$$

这一步牛顿迭代将向量拉回单位圆附近。

### 去掉浮点

完全可以用同样的思路配合整数定点运算，不使用任何浮点运算。a1k0n 用 10 位精度重做了所有数学，得到了以下 C 代码，在能做 32 位乘法、有约 4KB 可用 RAM 的嵌入式设备上运行良好：

:copy{code="gcc -std=c89 -w donut_fixed.c -o donut"}

::alert{type="info"}
整数定点版使用 10 位精度（1024 = 2^10），所有三角函数值和坐标都用整数表示。选择 10 位是因为它在 16 位整数范围内留有足够余量（乘法结果不会溢出 32 位），同时 `>> 10` 和 `>> 11` 对应除以 1024 和 2048，正好覆盖代码中 $R_1=1$（即 1024）和 $R_2=2$（即 2048）的缩放。
::

```c [donut_fixed.c]
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#define R(mul,shift,x,y) \
  _=x; \
  x -= mul*y >> shift; \
  y += mul*_ >> shift; \
  _ = 3145728-x*x-y*y >> 11; \
  x = x*_ >> 10; \
  y = y*_ >> 10;

int8_t b[1760], z[1760];
void main() {
  int sA = 1024, cA = 0, sB = 1024, cB = 0, _;
  for (;;) {
    memset(b, 32, 1760);    // text buffer
    memset(z, 127, 1760);   // z buffer
    int sj = 0, cj = 1024;
    for (int j = 0; j < 90; j++) {
      int si = 0, ci = 1024; // sine and cosine of angle i
      for (int i = 0; i < 324; i++) {
        int R1 = 1, R2 = 2048, K2 = 5120 * 1024;
        int x0 = R1*cj + R2,
            x1 = ci*x0 >> 10,
            x2 = cA*sj >> 10,
            x3 = si*x0 >> 10,
            x4 = R1*x2 - (sA*x3 >> 10),
            x5 = sA*sj >> 10,
            x6 = K2 + R1*1024*x5 + cA*x3,
            x7 = cj*si >> 10,
            x = 40 + 30*(cB*x1 - sB*x4) / x6,
            y = 12 + 15*(cB*x4 + sB*x1) / x6,
            N = (-cA*x7 - cB*((-sA*x7 >> 10) + x2)
                 - ci*(cj*sB >> 10) >> 10) - x5 >> 7;
        int o = x + 80*y;
        int8_t zz = (x6-K2) >> 15;
        if (22>y && y>0 && x>0 && 80>x && zz < z[o]) {
          z[o] = zz;
          b[o] = ".,-~:;=!*#$@"[N>0?N:0];
        }
        R(5, 8, ci, si)   // rotate i
      }
      R(9, 7, cj, sj)     // rotate j
    }
    for (int k = 0; 1761>k; k++)
      putchar(k%80 ? b[k] : 10);
    R(5, 7, cA, sA);
    R(5, 8, cB, sB);
    usleep(15000);
    printf("\x1b[23A");
  }
}
```

输出基本一样。

注意：定点版中 Z 缓冲的比较方向变成了 `zz < z[o]`，与浮点版的 `D > z[o]` 相反。这是因为浮点版存的是 $1/z$（越大越近），而定点版存的是 $(z - K_2)$ 右移后的近似值（越小越近）。

## 增强版：美化甜甜圈——一个老派 CG 经典

a1k0n 在 2006 年 9 月写了[第二版](https://www.a1k0n.net/2006/09/20/obfuscated-c-donut-2.html)标题是 *Embellishing the donut: an old-school CG cliche*。其中有一个变体（滚动文字写的是 "IOCCC 2006"）出现在了 2006 年国际混淆 C 代码大赛（IOCCC）上。

相比原始版本，增强版额外添加了：地面棋盘格透视（用简单的 $x/y$ 透视公式绘制无限延伸的地面）、散布的背景噪声，以及用压缩字符串表编码的滚动文字（如 "IOCCC 2006"）。亮度字符集也有所调整，引入了空白字符用于背景，使画面有了景深感。

编译方式和第一个一样（`-lm`），需要 ANSI 风格的终端仿真。

:copy{code="gcc -std=c89 -w donut_enhanced.c -o donut -lm"}

完整代码如下：

```c [donut_enhanced.c]
_,x,y,o       ,N;char       b[1840]       ;p(n,c)
{for(;n       --;x++)       c==10?y       +=80,x=
o-1:x>=       0?80>x?       c!='~'?       b[y+x]=
c:0:0:0       ;}c(q,l       ,r,o,v)       char*l,
       *r;{for       (;q>=0;       )q=("A"       "YLrZ^"
       "w^?EX"           "novne"     "bYV"       "dO}LE"
       "{yWlw"      "Jl_Ja|[ur]zovpu"   ""       "i]e|y"
       "ao_Be"   "osmIg}r]]r]m|wkZU}{O}"         "xys]]\
x|ya|y"        "sm||{uel}|r{yIcsm||ya[{uE"  "{qY\
w|gGor"      "VrVWioriI}Qac{{BIY[sXjjsVW]aM"  "T\
tXjjss"     "sV_OUkRUlSiorVXp_qOM>E{BadB"[_/6  ]-
62>>_++    %6&1?r[q]:l[q])-o;return q;}E(a){for (
       o= x=a,y=0,_=0;1095>_;)a= " <.,`'/)(\n-"  "\\_~"[
       c  (12,"!%*/')#3"  ""     "+-6,8","\"(.$" "01245"
       " &79",46)+14],  p(""       "#$%&'()0:439 "[ c(10
       , "&(*#,./1345" ,"')"       "+%-$02\"! ", 44)+12]
-34,a);  }main(k){float     A=0,B= 0,i,j,z[1840];
puts(""  "\x1b[2J");;;      for(;; ){float e=sin
(A), n=  sin(B),g=cos(      A),m=  cos(B);for(k=
0;1840>   k;k++)y=-10-k/    80   ,o=41+(k%80-40
       )* 1.3/y+n,N=A-100.0/y,b[k]=".#"[o+N&1],  z[k]=0;
       E(  80-(int)(9*B)%250);for(j=0;6.28>j;j   +=0.07)
       for  (i=0;6.28>i;i+=0.02){float c=sin(    i),  d=
       cos(  j),f=sin(j),h=d+2,D=15/(c*h*e+f     *g+5),l
=cos(i)        ,t=c*h*g-f*e;x=40+2*D*(l*h*  m-t*n
),y=12+       D  *(l*h*n+t*m),o=x+80*y,N  =8*((f*
e-c*d*g       )*m   -c*d*e-f*g-l        *d*n)     ;if(D>z
[o])z[o       ]=D,b[     o]=" ."          ".,,-+"
       "+=#$@"       [N>0?N:       0];;;;}       printf(
       "%c[H",       27);for       (k=1;18       *100+41
       >k;k++)       putchar       (k%80?b       [k]:10)
       ;;;;A+=       0.053;;       B+=0.03       ;;;;;}}
```

运行效果：

::pic
---
src: https://bu.dusays.com/2026/06/09/6a27fb11c5786.gif
caption: 2.0 运行结果
height: 320
---
::

::alert{type="warning"}
需要支持 ANSI/VT100 转义序列的终端，Windows 10+ 的 CMD/PowerShell 默认已支持。如果显示乱码，需要在终端属性里开启「启用虚拟终端处理」。
::