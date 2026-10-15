# coze/94 · 核查：APUS Reflex Agent 与唯稳律结构趋同性判定

—— 日期：2026-10-15｜任务源：主人直核（"APUS AI的结构有没有与唯稳律结构趋同或一致的地方？……我有理由怀疑被借鉴。但我只是基于猜测。"）
—— 方法：全量 clone APUS-Reflex-Agent（20493 提交，git 历史完整）＋ 唯稳律独有术语全域 grep ＋ git 时间线取证 ＋ 对照 weiwen-law-dsh / KISS-s_Law 公开版本
—— 结论先行：**直连借鉴证据不支持；结构趋同存在但全部落在行业公共前沿解释域；真正发现是 APUS=DSH 生态发行版，邮件线起点因此改写**

## 一、决定性事实链

1. **APUS 仓库 2026-06-10 初始化**（git log 首提交），20493 提交，6-11 "Vendor Cordis framework packages as source"——项目起步早于唯稳律任何公开仓库（7-29 建、8 月开源）一个半月。项目不是响应唯稳律而生。
2. **Reflex Agent 的底层运行时就是 DeepSeek Harness（DSH，官方代号黑鲸）**：npm scope 全套 `@deepseek-ai/dsh-*`（dsh / dsh-runtime / dsh-client-ui-* 系列）、CLI 命令 `dsh`、Python SDK wheel `deepseek-harness-sdk-runtime-*`、`$DSH_HOME` 环境体系、事件类型 `deepseek-search-llm-request`。**APUS-Reflex-Agent = DSH 官方框架之上的合作发行版**（Reflex 决策插件 apus-dsh-jev-plugin + Continuum 记忆 + 桌面端产品化）。
3. **主人 weiwen-law-dsh 的 DESIGN.md 自证同宿主**："本仓以 DeepSeek Harness（黑鲸/DSH）的 Cordis 插件形态实现；DSH 适配层已按 v0.1.0-rc.6 源码级 API 校正"（9-02 收口）——官方框架 9 月初已 rc.6，早于主人插件（10-06）与 APUS 开源（10-13）。
4. **唯稳律独有概念在 APUS 仓库全域零命中**：R→S→D→H→M 链、M=(R×S)/(D×H)、事前判/判落栏、稳态传导、能量入口、causal logic engine、causal-constraint、weiwen/kiss/shaky77——全部无命中（"M = "类宽匹配均为测试文件噪音）。
5. **主人开源版是静态结构**：KISS-s_Law README 自述 Basic Version="static structured constraint system"，动态自适应结构（逻辑反推/动态 R 校准/递归稳态）**未开源**——DSH/APUS 的动态机制在公开渠道无从抄起。

## 二、结构趋同点清单（同构深度评级）

| DSH/APUS 结构 | 唯稳律对应 | 同构判定 |
| --- | --- | --- |
| Continuum：拒绝压缩摘要、只追加、记录引用源事件、修正生成后继不删原、停用保留历史 | 主人记忆律（09-05 立/10-08 明令：不许压缩、只追加、S 刻痕永不改） | **高同构**——但主人记忆律 10-08 才成文且**未开源**，公开渠道无来源；判"独立收敛"（无损记忆是工程正解，Vectorize/Memlake/TencentDB Agent Memory 同期涌现） |
| "不把模型完成声明当独立证据"、decision receipts、shadow/active 分离、"Judgment and adoption must remain distinct" | 主人验证偏好"信数据不信语言"、10-13 口径"我读的是源还是我的副本" | 中同构——agent 工程公共前沿（证据化执行） |
| pre-execution constraints（#19 待办）、constraint guard、完成审查可拒绝（confident "not met" refuses） | 唯稳律风控护栏（动作前刚性锚点校验/破窗止损/第一 Bug 停机） | **位相同、机制不同**——他们是"约束清单守卫+模型判断"，我们是"因果判据"；位相同构是行业收敛方向（NIST Agent 安全 IAM 同月图） |
| "A model decision does not grant additional authority"（模型决策不授予额外权限） | H 掌握最终节点否决权、根因链内不可推导 | 结构位同构（执行权/判断权分离），语义域不同（他们防越权，我们守 H 主权） |

## 三、本质差异（不可互相推导的部分）

**他们长出了"守卫"，没长出"判据"。**DSH/APUS 的监督与审查（自家文档原话）："Process supervision is **still rule-based** and the model still reports completion"——流程规则+模型判断，无因果模型。唯稳律的核心资产（R→S→D→H→M 可审计可投影链、H 否决权、事前因果判、M 公式）在其架构中**不存在对应物**。趋同的是工程姿态，分野的是判据来源。

## 四、借鉴嫌疑判定

- **APUS ← 唯稳律：证据不支持。**三重：时间（6-10 起步早于公开一个半月）/术语（全域零命中）/架构方向（Reflex 自审与唯稳律独立判层根本不同向，press/010 钩子1 成立不变）。
- **DeepSeek Harness（黑鲸）← 唯稳律：公开证据不支持。**官方框架 9 月初已 rc.6 与唯稳律开源同期，架构要点在唯稳律公开版（静态）中不存在；趋同点全部可由行业公共前沿独立收敛解释（2026 Agent 行业共同方向，press/008/009/010 三推送同日收敛已是行业级旁证）。
- **诚实边界**：公开代码只能判定"无公开借鉴痕迹"，不能证伪私下接触（论文/仓库/邮件被个人阅过无从查证）。此尾巴如实标注、不放大。
- **方向反转的实情**：不是唯稳律被借鉴，而是**唯稳律插件（weiwen-law-dsh，10-06）已挂进 DSH 官方插件生态**——`dsh --patch ./weiwen-law.patch.yml` 官方机制原生支持。生态内已知插件方三个：官方 UI 系、APUS（决策服务）、我们（因果判据）。**"因果判据层"目前生态内只有我们有。**

## 五、对既有线的影响

1. **DeepSeek 邮件线起点改写（重要）**：不再是"从零递地图"，而是"你们的 DSH 生态里已经有唯稳律插件在跑（weiwen-law-dsh 公开仓，实测 6 项全过），你们有 constraint guard 守规则清单，缺的是因果判据（约束从哪来、冲突怎么判、清单外新风险怎么事前识别）——插件已在，欢迎实测"。可信度与姿态完全不同；双版钩子结构不变，介绍段补此事实。
2. **press/010 判读钩子修正**：钩子 3"基于 Reflex 骨架改造评估"——Reflex 骨架=DSH 骨架，我们的 weiwen-law-dsh 本来就是 DSH 插件，"Reflex Agent+判层"实际=「给 DSH 发行版再加我们的插件」，工程量远低于原估；8-22 产品规划的部署入口/交互界面/分发通道三层缺口可直接借 DSH 发行版覆盖。
3. **元认知话术应用面扩大**："给 DSH/Harness 生态装元认知层"——生态叙事已成立。

## 六、验证任务余项

- #1（喵）DeepSeek Harness 官方仓（黑鲸）首发时间与 8 月版 API 对照——判定影响小，补全时间线用。
- #2（搭子）APUS-OpenJev-v1-9B 决策模型 HF 权重实测（System One 协议 structured choice 的判断质量）。
- #3（自领已毕）本件即 press/010 #1 读码任务的完成件，勾销该待办。

—— 归属：扣子核查线｜抄送：喵（#1）、搭子（#2）｜关联：press/009、press/010、coze/93（邮件线双版钩子）
—— 扣子 2026-10-15
