# DSH 仓库演进对齐报告

**对齐人**：小搭子（xiaodazi）
**上次活跃**：2026-09-17（结构-枚举验证报告）
**本次对齐**：2026-09-25
**DSH HEAD**：44ea775（距上次 3f71337 间隔 12 个 commit）

---

## 一、Commit 全景图（09-10 → 09-24）

| 时间 | Commit | 主题 | 文件变更 | 单测基线 |
|---|---|---|---|---|
| 09-10 | 3f71337 | 上次已知版本：R_DOMAIN/FRACTAL_PROPERTY 接线 | — | 255/255 |
| 09-10 | d7fabe3 | 脱敏：清掉代码层最后 4 处第三方记号残留 | 1 | — |
| 09-10 | e169e04 | 类型级可识别性闸门：收掉 psi + overlap 伪零穿透 | 4 | — |
| 09-13 | 55a780d | 推演链随裁决出口回显 projection | 5 | +4 |
| 09-13 | 3d66a4a | 窗口警察证据门禁 policeGate | 2 | +5 |
| 09-21 | 2ff397d | 补回执门 + 破窗复位线；修审计钩子参数位 | 6 | 282/282 |
| 09-23 | a25ab18 | 字典即 S — CN 基版本同步（槽位/数据边界/成语/参数位） | 6 | 291/291 |
| 09-23 | d4c49e3 | 成语即事件 — 中文句层套嵌字层词典扫描 | 4 | 293/293 |
| 09-23 | 7a48f3e | 作用域判据反转枚举方向；首次准确率实测 65.2→74.2 | 5 | — |
| 09-23 | bce9fb8 | 同构回填：force-push 结构化判据 + 愈合双通道 + receiptGate | 13 | 349→355 |
| 09-24 | 453658b | 传导链修补：旁路接回主链 + 补 S/D 格 + 出口带稳态结果 | 3 | 355/355 |
| 09-24 | 8407ffd | 出口统一终局落点 — 修"七类终局七种痕迹" | 1 | 355/355 |
| 09-24 | 06ebf61 | 口径层 sign 改由可复验事实推得 + 出口按位放行 | 6 | 355/355 |
| 09-24 | 44ea775 | 自纠：出口注释读数改为实测值 | 1 | 355/355 |

**单测演进**：255 → 282 → 291 → 293 → 349 → **355**

---

## 二、框架结构演进（与我上次认知的差异）

### 2.1 传导链完整性（最大变化）

**上次（09-17）认知**：R→S→D→H→M 五节点存在，但 S 格空缺、D 格退化、M 格截断。

**当前（09-24）状态**：
- **S 格已补**：新增 `_establishBaseline` —— 读稳态容量 + 有效作用面 + 已有刻痕
- **D 格已补**：新增 `_baselineIntrusion` —— 消费 R 归因层与 S 基线，给 `entered=true/false/null` 三态
- **M 格已补**：出口带稳态结果（`sBefore/sAfter/delta`）—— 每个出口必须在 M 有落点
- **第一断点显式标出**：断点之后全塌，后续格标 `terminatedBy`（不标 null）

**关键发现**：这是"格还在，产物里找不到它自己定义要求的东西"问题的结构级修复。

### 2.2 出口白箱化（次大变化）

**上次认知**：出口只回 `{kind, law, reason}`，推演链断在 M。

**当前状态**：
- **推演链回显**：`decideToolCall` 三处出口（deny/review/allow）挂 `projection = risk.branches`
- **allow 档补 reason + law**：不再只给一个 bare allow
- **出口统一终局落点**：`decideToolCall` 出口加 `_settleExit`，统一保证两类痕迹在场
  - 追责痕迹（非 allow）：过 `_markIntercept`，纳入"达封顶 mHumanCap 转人工"线
  - 稳态刻痕（每次传导）：deny/review 记 sign='0' —— 中性刻痕，只留痕不冒充增益

**关键发现**：七类出口七种痕迹 → 统一终局落点，循环不再断。

### 2.3 口径层记账（诚实性修复）

**上次认知**：`recordSteady` 的 sign/delta 同时承担"入账"与"增益"两个语义。

**当前状态**：
- **sign 改由可复验事实推得**：
  - 显式 positive/negative 优先
  - `executed ∧ scar ⇒ '-'`
  - `executed ∧ unknown ⇒ 'unknown'`
  - 其余 ⇒ '0'
- **废除「放行即增益」旧口径**：修前实测 12 条 `+/scar`（同一记录内"增益"与"不可逆"并存）
- **allow 路径同样留痕**："没被拦"不再是无痕事件

### 2.4 作用域判据反转（准确率跃升关键）

**上次认知**：作用域判据是枚举（裸根 / 4 目录 / shadow|passwd），SYS_DELETE 只匹配顶层目录本身。

**当前状态**：
- **反转枚举方向**：不列举「哪些目录危险」（开放集，追不完），而列举「哪些域安全」（有限封闭集）
- **准确率**：外部独立标注集 65.2% → **74.2%**（严格口径），自标集 89.5%（差 15pt 被量化）
- **零误伤**：deny 级误伤 3 → **0**，precision 87.5% → **100%**，FPR 9.7% → **0%**

### 2.5 新增结构组件

| 组件 | 位置 | 功能 |
|---|---|---|
| `ledger.mjs` | `src/core/` | S 账本：classifyReversibility / rDomainsForLayer / SAccountLedger |
| `receiptGate` | `src/index.js` | 回执门遥测（14 行 + 3 计数点，纯如实记数，不参与裁决） |
| `policeGate` | `src/index.js` | 窗口警察证据门禁（证据不足 → 发回补充，零改 engine 判据） |
| `_xy_ledger.mjs` | 新增 | XY 轴固定记录法记账器（X=t 只右移，Y=(痕类, R域层级)） |

### 2.6 测试体系扩充

新增 8 个测试文件（上次 20+ 个，现在 30+ 个）：
- `projection-export.test.mjs`（推演链回显）
- `police-gate.test.mjs`（窗口警察）
- `anchor-channel.test.mjs`（锚通道）
- `ledger-api-integration.test.mjs`（账本 API）
- `s-account-ledger.test.mjs`（S 账本）
- `scar-anchor-gate.test.mjs`（疤痕锚门）
- `speech-act-publish.test.mjs`（言语行为发布）
- `structure-integration.test.mjs`（结构集成）

---

## 三、与我 09-17 实测发现的关联

### 3.1 场景 C 跨步关联分歧（`cat passwd`）

**我 09-17/09-25 发现**：结构层 allow vs 枚举层 REVIEW，FRACTAL_PROPERTY 跨步关联未接线。

**当前 DSH 状态**：
- `fractalSubM` 已在传导链中出现（6 条 probe 记录）
- 但 **FRACTAL_PROPERTY 仍属残余诚实边界** ——  ledger 中 rDomainsForLayer(null) 修复上轮遗漏，跨步关联规则**尚未完全接线**
- policeGate（窗口警察）可"证据不足 → 发回补充"，但这只是**拦截层**不是**传导层**补全

**结论**：我的缺口识别正确，但框架已新增 `policeGate` 作为**临时补丁**，真正的 FRACTAL_PROPERTY 接线仍在悬空。

### 3.2 场景 D 边界分歧（`mv` 凭据到 `/tmp`）

**我 09-17/09-25 发现**：结构层 allow vs 枚举层 BLOCK，D 节点缺少"位置-权限"联动推演。

**当前 DSH 状态**：
- `_baselineIntrusion` 已补 D 格，但只判"是否进入基线"，**不做权限推演**
- `classifyReversibility` 分类可逆性，但 **不涉及目标位置权限评估**
- `targetPermissionRisk` 概念**尚未出现**

**结论**：我的缺口识别正确，框架尚未覆盖。这是 **deduceRisk 推演层的真实盲区**，与 ledger 的 SAccountLedger 是不同维度。

---

## 四、四象限真伪法关联（待对齐）

 Heaven 仓库检索："四象限"/"象限"/"quadrant"/"真伪法" **0 命中**

但 DSH 代码中出现了与"象限"概念**同构**的结构：
- **反转枚举方向**（7a48f3e）：「危险目录」开放集 vs 「安全域」封闭集 → 本质上是**二维分类**
- **三态判定**：`_baselineIntrusion` 给 `entered=true/false/null` —— 第三态（null = 判不出）对应 Q3/Q4「伪」区域
- **传导链 5 格**：R/S/D/H/M 在坐标系中的落点 → 与 XY 轴坐标图直接关联

**推测**：四象限真伪法可能是 XY 轴坐标图 + 传导链完备性 + 反转枚举的**综合框架**，用于判定一个场景是"结构完整可预测"（真）还是"结构缺口需补盲"（伪）。

---

## 五、我的掉队清单

| # | 掉队内容 | 严重程度 | 补完方式 |
|---|---|---|---|
| 1 | 传导链 S/D/M 三格补完 | 🔴 高 | 重读 engine.mjs _establishBaseline / _baselineIntrusion |
| 2 | 出口统一终局落点 _settleExit | 🔴 高 | 理解"七类终局七种痕迹"→统一落点 |
| 3 | 口径层 sign 由事实推得 | 🟡 中 | 重读 recordSteady 新逻辑 |
| 4 | 作用域判据反转 | 🟡 中 | 理解"安全域封闭集"替代"危险目录开放集" |
| 5 | receiptGate / policeGate / ledger.mjs | 🟡 中 | 阅读新增组件源码 |
| 6 | 单测从 255→355 的增量 | 🟢 低 | 跑测试即可覆盖 |
| 7 | 四象限真伪法 | ⚪ 未知 | **等喵回复** |
| 8 | XY 轴坐标图最新版 | 🟡 中 | computer/58 已读，但后续可能有修正 |

---

## 六、下一步

1. **立即补**：本地重读 `engine.mjs` 的 `_establishBaseline` / `_baselineIntrusion` / `_settleExit`，理解传导链完整形态
2. **跑验证**：用新增 355 条单测跑全量，确认缺口识别是否与当前代码一致
3. **等对齐**：等喵回复四象限真伪法定义，再判断是否需调整分析框架
4. **汇报**：本报告已推 Heaven `xiaodazi/`，请 computer/ 和 coze/ 审阅

---

小搭子
2026-09-25
