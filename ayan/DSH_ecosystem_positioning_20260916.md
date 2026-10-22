# 唯稳律DSH生态定位核查报告
**核查时间：2026-09-16**
**核查人：扣子小杠精（Agent端）**

---

## 一、收录状态核查

### 1. awesome-dsh-plugin ✅ 已收录

| 项目 | 详情 |
|---|---|
| **仓库** | `Shaky77/weiwen-law-dsh`（全小写） |
| **Stars** | 7 |
| **位置** | Plugins 主分类，无子分类归属 |
| **描述原文** | "White-box causal guardrail for dsh: every tool call is adjudicated before execution along a deterministic causal logic chain — blocks destructive and credential-file operations, escalates repeated boundary violations, cuts faulting links until verified-fixed, and gives risk verdicts on un-auditable execution; runs fully local with zero API cost, plus 6 white-box self-check tools." |
| **PR** | #3329，已合并 |

**注意：** 曾用错误名称 `Weiwen-Law-DSH`（驼峰式）查询，返回404。正确名称为全小写加横杠 `weiwen-law-dsh`。

### 2. dsh.so Top 6 picks ❌ 未入选

- 无专门的"因果"分类
- weiwen-law-dsh 不在任何 use case 的精选 6 中
- 首页有 13 个 use case 分类：memory、file、terminal、security、web-search 等，无 causal 类

### 3. KISS_Law-DSH（EN版）❌ 未收录

- 英文版不在 awesome-dsh-plugin 列表中
- 需要有人提交 PR 走审核流程

---

## 二、"因果分类"核查结论

**不存在。**

awesome-dsh-plugin 的子分类共 22 个：
`AGI Architecture Exploration`、`Security & Permissions`、`Tools & Capabilities`、`Memory`、`Workflow & Automation`、`Git & Code Review`、`Browser & Web`、`Development & Runtime`、`Remote & Mobile`、`Plugin Markets & Managers`、`Just for Fun` 等。

唯稳律描述中的 "causal" 只是形容词，未被归入任何专属分类。

---

## 三、生态同类插件对比

| 插件 | 仓库 | 定位 | 决策机制 | 关键特征 |
|---|---|---|---|---|
| **唯稳律** | Shaky77/weiwen-law-dsh | 因果内生风控 | 因果透明度驱动，R域常数锚定推理框架 | 累积违规升级、故障链切断、零API成本 |
| dsh-security-hardening | tancheng33/dsh-security-hardening | 规则集权限引擎 | 三元组DSL（action/resource/effect）+规则匹配 | 委派链衰减、审计闭环、网络白名单 |
| dsh-permission-rules | dsh1024/dsh-permission-rules | 声明式规则 | YAML规则列表+glob匹配 | 内置高风险基线、first-match-wins |
| dsh-my-guard | bsfeng/dsh-my-guard | 提示注入检测 | 规则扫描 | 投毒扫描+注入检测+破坏性命令拦截 |
| dsh-approve-for-me | @dsh-plugin/dsh-approve-for-me | 自动审批 | 规则+轻量LLM review | 严格模式每次调用前review |
| dsh-plugin-vet | @jieai/dsh-plugin-vet | 第三方插件体检 | 静态AST扫描 | 恶意模式/越权路径检测 |

---

## 四、范式差异分析

### 规则驱动 vs 因果驱动

| 维度 | 规则驱动（其他5个） | 因果驱动（唯稳律） |
|---|---|---|
| 决策依据 | 外部规则库查表匹配 | 因果框架内推理 |
| 框架稳定性 | 依赖规则本身是否完备 | R域常数锚定，保证推理基准不漂移 |
| 遇到新风险 | 规则未覆盖则失效 | 在框架内自主判断 |
| 可验证性 | 可形式化验证 | 依赖因果框架本身的准确性 |
| 模型依赖 | 不依赖模型推理能力 | 在R域常数锚定的框架内运行，不自由发挥 |

**核心结论：** 唯稳律是DSH生态中**唯一**的因果内生风控方案。其他插件解决的是"如何写更好的锁"，唯稳律解决的是"如何让屋里的人自己不想出去"。

---

## 五、进入 dsh.so Top 6 的现实路径

1. **英文版先进入 awesome-dsh-plugin**：KISS_Law-DSH 需要 PR 提交审核
2. **积累质量信号**：star量是重要指标，1.3k star 才刚进 Memory Top 6；当前 CN 版 7 star，EN 版 2 star，差距巨大
3. **dsh.so 维护者主动采录**：无公开提名入口

---

## 六、注意事项

- awesome-dsh-plugin 明确说明："This list doesn't rank plugins or judge their quality"——它是**安装可行性精选**，不是质量排名
- 收录门槛：能用 `dsh plugin add` 安装 + 描述与实际一致 + 归类正确 + 有维护
- CN 版因喵精灵维护，7 star 已属正常自然增长范围
