# 唯稳律上 dsh.so 精选实操方案（草稿）

**起草**：小搭子（xiaodazi）
**日期**：2026-09-17
**背景**：基于 dsh.so 实站抓取与 GitHub API 一手证据

---

## 当前基线

| 指标 | weiwen-law-dsh | KISS_Law-DSH | 备注 |
|---|---|---|---|
| awesome-dsh-plugin 收录 | ✅ PR #3329 已合并（2026-08-27） | ❌ 未收录 | 官方精选列表唯稳律已有 |
| dsh.so 专页 | ✅ 有 | ✅ 有 | 两者都已注册 |
| dsh.so 验证级别 | L5（runtime verified） | L5（Ecosystem app） | 最高档 |
| dsh.so Trust 级别 | Gold | Silver | 唯稳律更高一档 |
| dsh.so Risk | Low | Low | 均为最低风险 |
| dsh.so Health | Active | Active | 均为活跃 |
| GitHub Stars | 7 | 2 | 偏低，但不是硬性门槛 |
| 首页 Editor picks | ❌ 未入选 | ❌ 未入选 | 目标 |
| use case Top 6 | ❌ 未入选 | ❌ 未入选 | 目标 |

**关键发现**：dsh.so 的 Top 6 并非只看 star 数——Memory use case 第 6 名仅 5 star 即可入围，第 1 名 1.3k star 是榜首而非门槛线。验证级别（L5）、活跃状态（Active）、风险等级（Low）才是更重要的筛选条件。唯稳律这三项已经拉满。

---

## 两条上精选路径

### 路径 A：use case「Top 6 picks」（算法驱动，被动排序）

dsh.so 每个 use case 页面有 "Top 6 picks for this use case"，筛选条件是：
> Active this week · L5 run-tested · low risk · most starred

唯稳律目前的问题是：**没有被归入任何 use case**，因此连参与 Top 6 排序的资格都没有。

**use case 关联策略**：

1. **补齐 use case 标签**
   - dsh.so 的 use cases 共 13 个：github / vision / database / notification / web-search / terminal / file / memory / storage / skin-theme / code-review / office / creator
   - 唯稳律的"白箱风控"最贴近哪些？
     - `terminal`：拦截破坏性 shell 命令、凭据文件操作 → 最直接关联
     - `file`：拦截凭据文件读取/写入 → 直接关联
     - `code-review`：review 边界决策、给出风险判定 → 可关联
     - `memory`：上下文审计、决策链路记录 → 弱关联，但可写
   - **实操**：在仓库 README 的 description / keywords 中明确加入上述 use case 关键词，让 dsh.so 的 AI 标签提取器（"AI-inferred or rule-extracted from the README"）自动归类

2. **保持 L5 + Active + Low Risk**
   - 这三项已满足，但需维持：最近 push 日期在 09-15，继续定期更新即可保持 Active
   - 避免引入高风险操作（如网络请求、外部 API 调用），保持 Risk Low

3. **提升 star 数的边际策略**
   - 不是硬门槛，但同条件下 star 多会排前面
   - 在 awesome-dsh-plugin 列表中获得更多曝光（security 分类下目前有 70+ 条目，竞争激烈度中等）
   - 在相关社区（DSH Discord、r/mcp）提及，引导 star
   - 目标：从 7 → 30+（超过 security 分类大部分条目即可）

4. **时间窗口**
   - Top 6 似乎是"Active this week"滚动更新的，因此**持续维护**比一次性冲刺更重要
   - 建议每 2-4 周有一次可见更新（README 改进、bugfix、文档补充都算）

---

### 路径 B：首页「Editor picks」（人工/编辑驱动，主动争取）

首页 "Editor picks: start with these" 展示约 100+ 个 artifact，特点是：
- 不是按 use case 分的综合展示
- 覆盖多种类型（plugin / ecosystem app / skin / tool）
- 包含"dsh-desktop-97""dsh-web-2""modlens"等明星项目，也包含大量小众项目

**策略**：

1. **让编辑"看见"**
   - dsh.so 有 `/submit` 页面和 `hello@dsh.so` 邮箱
   - 可直接提交推荐请求，附上唯稳律的差异化定位："唯一因果内生风控方案，L5 Gold，零 API 成本"
   - 强调"填补了 security 类目中'因果审计'的空白"（对比表中真实竞品多为规则驱动：PerryLink/dsh-permission-rules 是 YAML 规则、wulun811/dsh-plugin-vet 是静态扫描）

2. **补齐"代表性"**
   - Editor picks 似乎追求多样性（首页已有 desktop/web/sidebar/pet 等各类型）
   - security 类目前首页展示的不多，唯稳律可以作为"security 代表"入选
   - 需要有一个吸引人的 one-liner：
     > "White-box causal guardrail: not rules, not heuristics — just causal law, presented."

3. **补齐视觉/文档**
   - 当前 README 以中文为主，dsh.so 抓取的是 en 描述（"White-box causal guardrail for dsh..."）
   - 建议增加一个英文 Quick Start 段落、一张架构图、一个 demo GIF（证明"白箱"——裁决过程可见）
   - dsh.so 的 badge 系统（Verification / Security / Trust）已经好看，但 README 本身需要让编辑一眼看懂价值

---

## 优先级排序（推荐执行顺序）

| 优先级 | 动作 | 预估时间 | 预期效果 |
|---|---|---|---|
| P0 | README 补 `terminal` `file` `code-review` use case 关键词 | 1 小时 | 让 dsh.so AI 标签提取器自动关联 use case，获得 Top 6 排序资格 |
| P1 | 保持每 2-4 周一次可见更新，维持 Active 状态 | 持续 | 维持 L5 + Active + Low Risk |
| P2 | 给 dsh.so 提交 Editor picks 推荐（邮件/提交页） | 2 小时 | 直接争取首页曝光 |
| P3 | README 增加英文 Quick Start + 架构图/demo | 4-8 小时 | 提升转化率，让编辑和用户都能快速理解 |
| P4 | 在社区引导 star（Discord、awesome 列表讨论区） | 持续 | 从 7 → 30+，Top 6 排序更靠前 |
| P5 | KISS_Law-DSH 升级 Trust Gold | 需了解规则 | 两个版本都 Gold，形成矩阵效应 |

---

## 一句话策略

> **先让 dsh.so 的算法"看见"你（补齐 use case 关键词 → 获得 Top 6 排序资格），再让人工编辑"记住"你（主动推荐 + 好文档）。验证级别已经是满分，现在缺的是"被归到正确的赛道里"。**

---

## 风险提示

- dsh.so 的 Editor picks 筛选逻辑未公开，以上为基于观测数据的推测
- "补齐 use case 关键词"策略依赖 dsh.so 的 AI 标签提取器行为，效果可能需要 1-2 周才能观测到
- 如果 dsh.so 的 use case 关联是人工审核而非自动提取，则需要走 `/submit` 通道申请归类

---

**下一步**：等 WorkBuddy（computer/）和扣子（coze/）各自给出策略建议后，汇总三方意见形成最终版方案。