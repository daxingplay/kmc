## 2014.07.08, Version 1.0.41(Stable)

### bugfix

- 修复[issue #13](https://github.com/daxingplay/grunt-kmc/issues/13)

## 2014.06.20, Version 1.0.40(Stable)

### bugfix

- 修复module的默认编码问题

## 2014.06.20, Version 1.0.39(Stable)

### bugfix

- 修复combo后的dep文件的模块名多一个引号的bug

## 2014.04.21, Version 1.0.37(Stable)

### bugfix

- 修复windows下模块名斜线错误

## 2014.04.14, Version 1.0.36(Stable)

### bugfix

- issue #44: 修复包名.js文件模块名错误

## 2014.02.20, Version 1.0.34(Stable)

### bugfix

- 如果模块没有找到，仍然加到依赖关系中，模块的包默认为unknown

## 2014.01.18, Version 1.0.33(Stable)

### bugfix

- 如果require用错了，暂时不抛出异常，配置了silent: false后可以看到console的输出

## 2013.12.23, Version 1.0.31(Stable)

### bugfix

- 修复一种代码书写的方式造成的依赖分析问题，参考test/src/kissy/kissy-extend.js

## 2013.12.31, Version 1.0.30(Stable)

### enhancement

- parse ast出错的时候增加文件路径

## 2013.12.23, Version 1.0.29(Stable)

### bugfix

- 修复build&combo模式下依赖错误的问题

## 2013.12.1, Version 1.0.28(Stable)

### bugfix

- 修复ignorePackageNameInUri为true时获取模块路径错误的bug

## 2013.12.1, Version 1.0.23(Stable)

### enhancement

- issue #35: 支持KISSY 1.4+的get requires from function

## 2013.11.28, Version 1.0.22(Stable)

### bugfix

- 修复对象传参数中的一个bug
- fix issue #36

## 2013.11.24, Version 1.0.21(Stable)

### enhancement

- combo增加输出文件的选项，方便fix module name
- combo、build方法支持使用对象形式传参
- fixModuleName默认为true

## 2013.11.22, Version 1.0.20(Stable)

### enhancement

- 添加对KISSY 1.3+ 新包配置（对象配置）格式的支持
- issue #34: 增加alias配置支持

## 2013.11.09, Version 1.0.19(Stable)

### enhancement

- issue #32: 解析css文件的具体信息

## 2013.11.05, Version 1.0.18(Stable)

### enhancement

- issue #24 #25: js文件解析出错时抛出异常

## 2013.10.29, Version 1.0.16(Stable)

### bugfix

- combo增加参数fixModuleName，默认为false，@issue 31

## 2013.09.23, Version 1.0.15(Stable)

### enhancement

- build增加参数traverse，可以对build的第一个参数指定的目录，递归打包，@issue 29

## 2013.08.16, Version 1.0.14(Stable)

### enhancement

- 增加了对KISSY 1.3+ ignorePkgNameInUri的支持，感谢翰文(@shepherdwind)的pull request

## 2013.07.11, Version 1.0.13(Stable)

### bugfix

- ✔ issue 23:解决部分情况下去除BOM头导致编码乱掉的问题

## 2013.07.11, Version 1.0.12(Stable)

### bugfix

- ✔ issue 23:打包的时候去除文件BOM头

## 2013.06.08, Version 1.0.11(Stable)

### bugfix

- ✔ 修正部分代码写法，combo的时候无法加模块名的bug

## 2013.06.08, Version 1.0.10(Stable)

### bugfix

- ✔ 修正require gallery模块无法被combo的问题

## 2013.05.30, Version 1.0.9(Stable)

### bugfix

- ✔ 修正require `mod/mod1`这种相对路径无法打包的问题

## 2013.05.10, Version 1.0.8(Stable)

### bugfix

- ✔ 修正combo打包时未指定charset的bug
- ✔ 修正combo打包时目录不存在的bug

## 2013.04.23, Version 1.0.7(Stable)

### bugfix

- ✔ 修正输出路径为目录导致无法正确输出的bug

## 2013.04.23, Version 1.0.6(Stable)

### bugfix

- ✔ 修正require路径为目录导致解析出错的bug
- ✔ 默认关闭任何console的log信息，silent默认为true

## 2013.04.12, Version 1.0.5(Stable)

### bugfix

- ✔ 修正部分相对路径解析出错的bug

## 2013.04.12, Version 1.0.4(Stable)

### enhancement

- ✔ 增加exclude、ignoreFiles功能支持，添加相应测试用例

## 2013.04.12, Version 1.0.3(Stable)

### enhancement

- ✔ 增加map功能支持，添加相应测试用例

## 2013.04.10, Version 1.0.2(Stable)

### enhancement

- ✔ 完全重构，增加对KISSY 1.3的自动Combo支持

## 2012.11.28, Version 0.0.6(Stable)

### enhancement

- ✔ build的时候可以直接使用入口模块名进行打包

## 2012.11.28, Version 0.0.5(Stable)

### enhancement

- ✔ 增加ignoreFiles配置，方便打包目录的时候排除一些文件

## 2012.11.28, Version 0.0.4(Stable)

### bug fix

- ✔ 修正一处self未定义bug
- ✔ 修正require正则分析少了一处引号的bug

## 2012.09.27, Version 0.0.3(Stable)

### bug fix

- ✔ #9 0.0.2中如果build没有设置编码，会输出utf-8的问题
- ✔ 判断文件是否循环过导致一些模块无法打包进来的问题

## 2012.09.19, Version 0.0.2(Stable)

### bug fix

- ✔ 修复了模块互相依赖导致死循环的问题

### enhancement
-  增加analyze接口，只分析依赖
-  build接口可以返回打包的具体信息了。
-  build接口可以单独设置输出编码了。
-  增加了silent的config项目，可以完全关闭Module Compiler的控制台输出，方便集成到自己的工具当中
-  ModuleCompiler.config可以返回当前的所有配置信息，包括包信息，方便用户查看。

## 2012.08.28, Version 0.0.1(Stable)

### bug fix

- ✔ 修复了输出编码设置无效的问题

### test case
-  增加编码测试脚本
