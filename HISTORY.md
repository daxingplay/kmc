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