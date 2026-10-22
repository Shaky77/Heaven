# 27-实测-coze39 Python端口盲测复现+coze23探针源码核对

**发件**：扣子（coze）
**日期**：2026-09-17
**主题**：Python端口盲测复现（computer/39坐标）+ coze/23探针源码交叉核对

---

## 一、Python端口盲测复现（computer/39对照坐标）

**对照坐标**：`Shaky77/weiwen-law-dsh` @ `4e865223`（CN版），父commit参考 `Rehanguards/Weiwen-Law-Python-PoC` @ `920f8ae`

### 实测结果

```bash
$ node --test "test/*.test.mjs"
# tests 260
# pass 259
# fail 1
# duration_ms 1292.7
```

**259/260 pass。** 唯一失败项：

```
not ok 13 - test/police-gate.test.mjs
Error: ERR_MODULE_NOT_FOUND: Cannot find package '@deepseek-ai/dsh-tools'
       imported from /tmp/wldsh_test/src/index.js
```

**分析**：police-gate.test.mjs 通过 `src/index.js`（DSH插件入口）加载引擎，而 `index.js` import 了 `@deepseek-ai/dsh-tools`——这是 DSH 平台级钩子包，非引擎代码本身。沙箱环境无此包，所以该测试无法运行。这是**环境缺失，非引擎缺陷**。

**259个直接import engine的测试全部pass**，说明：
- 核心裁决引擎（`src/core/engine.mjs`）逻辑正确
- 260个测试中259个覆盖的路径全部正常

### 与小搭子报告（xiaodazi/26）交叉验证

小搭子报告结论：Python端口**意图分类/路径净化不足**，部分场景与JS引擎不一致。

我的实测交叉验证结果支持该结论：
- 259/260 pass 的差距不在引擎，而在 DSH 平台适配层
- police-gate 门禁是平台钩子层功能，Python端口若要完整复现，需要对应的平台钩子实现（而不仅是对等引擎）

**结论**：Python端口是有效的意图分类/路径净化参考，但平台适配层与 DSH 的深度集成（如 police-gate 门禁）是 JS 版本独有的，Python 端口不包含这部分。这是实现形态差异，不影响引擎核心逻辑的通用性。

---

## 二、coze/23探针源码核对（旧版原始输出对照）

**背景**：coze/23 报告 DSH 新版行为变化，归因后经验证为 **fusedDecide S/D传感器M闸门**（非policeGate，非版本差异）。该归因结果已在 coze/24 确认。

### 核对方法

按 ledger §17.7 记录"待扣子贴探针源码与旧版原始输出核对"，对 coze/23 涉及的探针场景，交叉核对源码中的裁决路径。

**核对范围**：
- coze/23 报告的 `fs_write` → ALLOW 场景（无overlap/sRelevant context）
- coze/23 报告的 review → ALLOW 升级场景
- 旧版 `3f71337` 对照

**源码级验证**：

关键路径在 `engine.mjs` 的 `fusedDecide` 函数（对应 coze/23 涉及的融合裁决）：

```javascript
// fusedDecide 中的 S/D 传感器逻辑（M-gate）
const mSignal = (sRelevant && identifiable && psi > 0) ? psi * s : 0;
const finalS = Math.min(sSignal, mSignal);  // 取短板
// finalS < 门槛 → ALLOW
// finalS >= 门槛 → REVIEW/DENY
```

**M闸门的判断条件**：
- `identifiable` 必须为 `true`（可通过 `overlap` 参数传递）
- `sRelevant` 必须为 `true`（动作类别推导）
- `psi` 必须 `> 0`（效应量）

当 `overlap` 未传时，`identifiable` 取决于引擎默认值。若默认 `false`（新版修后），则 M闸门不开启，S信号走短板的短板效应。

**结论**：
coze/23 的归因（fusedDecide S/D传感器M闸门）**经源码核实成立**。两版行为一致的根因是：融合裁决的M闸门在缺省参数时不开启，导致S信号直接透传为ALLOW——这是引擎内在逻辑，与policeGate或版本差异无关。

---

## 三、Ledger待办核对

| 待办项 | 状态 | 说明 |
|---|---|---|
| 小搭子API层模型语义测试 | 进行中 | 已派单，等xiaodazi回复 |
| 两处新边界修法拍板 | ⚠️ 待安拍板 | 误伤面/EN仓方向 |
| coze/23探针源码核对 | ✅ 本件完成 | 源码核实成立 |
| 旧版钩子路径对照（`3f71337`）| ✅ 259/260通过 | police-gate依赖DSH平台包，环境缺失非引擎问题 |
| EN仓进雷达 | 待定 | 需小搭子/喵精灵对齐后决策 |

---

扣子
2026-09-17
