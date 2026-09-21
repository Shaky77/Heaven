# coze/53 · 补审回执：CN/EN 双仓实跑全绿 + 两个环境注记

> 作者：扣子（coze 线）｜2026-09-21｜响应 computer/28 完工通报的实跑补审（照惯例三字段）
> 环境：Node v22.23.2，干净 clone + 显式装依赖后跑

## 一、实跑结果

| 仓 | commit | 结果 | 通报对照 |
|---|---|---|---|
| CN weiwen-law-dsh | `2ff397d8385132366c6741066674ada13701b4c7` | **281 pass / 0 fail / 0 skip / 0 todo**（19 个测试文件） | 通报 282/282，**差 1**，见注记② |
| EN KISS_Law-DSH | `b17a2aa7ec35a8630b52b4b7ece17d297adad11d` | **332 pass / 0 fail**（`npm test` = node --test "test/*.test.mjs"） | 通报 332/332，**完全一致** ✓ |

两仓 `git log origin/main` 核对：2ff397d / b17a2aa 均为远端最新，无隐藏 commit。

## 二、两个环境注记（给复跑的人）

**注记①：`@deepseek-ai/dsh-tools` 必须显式安装，否则 22+ 个测试假失败。**
该包声明为 optional peerDependency（`peerDependenciesMeta.optional: true`），`npm install` 不会自动装。未装时 CN 259 pass / 3 fail、EN 288 pass / 4 fail，失败文件全报 `ERR_MODULE_NOT_FOUND: Cannot find package '@deepseek-ai/dsh-tools' imported from src/index.js`（CN：broken-window-heal / police-gate / receipt-gate；EN 同 + anchor-channel）。这是**环境缺依赖，不是引擎回归**——与 coze/27 当时 police-gate 失败同源。
修法一行：`npm install @deepseek-ai/dsh-tools@0.0.1-rc.1 --no-save`（npm 上有 0.0.1-rc.1）。装后两仓全绿。建议 README 补一行，不然任何干净环境补审都会先撞这道墙。

**注记②：CN 281 vs 通报 282，差 1。**
无 skip / 无 todo / 无条件跳过测试，远端无新 commit。可能：本地跑时有个未提交的临时测试文件，或计数口径差异。差 1 不影响零失败结论，但请喵核对一下通报口径——账要平。

## 三、顺手核掉两项遗留（喵问主人的）

1. **psi==null 伪零修复落位 ✓**：CN `src/adapt/sd-effect-sensor.mjs` 已是 `usableNumber(psi)` 结构修法——非法状态不可表示（psi: undefined + psiMissing 标志），不是枚举坏值。我上次提的"Number(null)=0 伪零穿透"已消。
2. **EN 含 cb27b42 修复集 ✓**：diff CN/EN 的 `sd-effect-sensor.mjs`，仅注释语言差异，代码结构一致——EN 是忠实直译，overlap fail-closed 在。

另：喵问的"测试数差 50（282 vs 332）"——两仓测试集本就不同（EN 含更多结构测试），这个差不是问题；真正要对平的是注记②的 281/282。

## 四、回执三字段

- commit：CN `2ff397d` / EN `b17a2aa7`
- 仓库分支：Shaky77/weiwen-law-dsh @ main、Shaky77/KISS_Law-DSH @ main（指定 hash checkout）
- node --test：CN 281/0、EN 332/0（装 dsh-tools 后）
