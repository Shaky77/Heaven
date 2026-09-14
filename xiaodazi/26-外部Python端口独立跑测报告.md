# 26 · 外部同行 Python 端口独立跑测报告（小搭子丶）

**发件**：小搭子丶｜**日期**：2026-09-14｜**状态**：独立跑测完成，盲测
**被测**：`Rehanguards/Weiwen-Law-Python-PoC` @ `920f8ae`
**对照**：CN `Shaky77/weiwen-law-dsh` @ `4e865223`，EN `Shaky77/KISS_Law-DSH` @ `072c35e8`

---

## 一、跑测命令 + 原始输出

### 1.1 基础测试（仓库自带）

```bash
cd /tmp/Weiwen-Law-Python-PoC && python engine.py
```

输出：
```
--- Running Weiwen's Law Causal Engine Tests ---
Test 1 (Valid Action): PASS -> Expected: PASS
Test 2 (Missing Target): UNDETERMINED -> Expected: UNDETERMINED
Test 3 (Valid Nested Call): PASS -> Expected: PASS
Test 4 (Broken Causal Link): UNDETERMINED -> Expected: UNDETERMINED
Test 5 (Cumulative Boundary Exceeded): BLOCK -> Expected: BLOCK
------------------------------------------------
```

### 1.2 扩展压力测试（我设计）

测试脚本：`pressure_external.py`（已放 `/tmp/`）

| 编号 | 输入 | 裁决 | 说明 |
|---|---|---|---|
| P1 | call_id="" | UNDETERMINED | 结构性缺失 |
| P2 | intent="" | UNDETERMINED | 结构性缺失 |
| P3 | intent="DELETE" | **PASS** | 未知意图不拦截 |
| P4 | intent="UNAUTHORIZED_EXEC" | BLOCK | 唯一被拦截的意图 |
| P5 | parent_id跨session | UNDETERMINED | 正确 |
| P6 | 第3次WRITE | BLOCK | 累积边界工作 |
| P7 | 5次READ | PASS | READ不计入累积 |
| P8 | payload=1MB | PASS | 大payload无压力 |
| P9 | target="/etc/passwd; rm -rf /" | **PASS** | 无路径净化 |
| P10 | parent_id=self | UNDETERMINED | 自引用正确拦截 |

---

## 二、维度对比

### 2.1 为什么选这4个维度

| 维度 | 选择依据 |
|---|---|
| 意图分类 | 唯稳律框架的核心——R层如何定义「什么算风险」 |
| 路径安全 | DSH原版有no-destructive-fs锚点，Python端口没有 |
| 嵌套调用 | Signpost 2——跨调用关联的边界 |
| 累积状态 | Signpost 1——session-bounded的核心机制 |

### 2.2 逐维度对比

#### 维度1：意图分类（R层定义）

| 实现 | 意图白名单 | 风险意图覆盖 |
|---|---|---|
| Python端口 | **无白名单** | 仅拦截 `UNAUTHORIZED_EXEC` |
| DSH原版 | 有语义分类 | `destructive`/`write`/`read-only` 分层 |

**可观察后果**：Python端口对 `DELETE`/`DROP_TABLE`/`FORMAT_DISK` 等意图全部 PASS。DSH原版会拦截 `destructive` 类意图。

**差异方向**：DSH原版 **更强**。

#### 维度2：路径安全（D层止损）

| 实现 | 路径净化 | 命令注入检查 |
|---|---|---|
| Python端口 | **无** | **无** |
| DSH原版 | `extractPath` 提取路径 | `no-destructive-fs` 锚点拦截 |

**可观察后果**：Python端口对 `target="/etc/passwd; rm -rf /"` 直接 PASS。DSH原版会提取路径后发现包含破坏性命令，deny。

**差异方向**：DSH原版 **更强**。

#### 维度3：嵌套调用（S层稳态）

| 实现 | parent_id验证 | 跨session隔离 |
|---|---|---|
| Python端口 | 有（正确） | 有（正确） |
| DSH原版 | `FRACTAL_PROPERTY` 递归 | 有 |

**可观察后果**：两者功能等价。Python端口实现更轻量（单次查找），DSH原版更完整（分形递归穿过嵌套结构）。

**差异方向**：功能等价，DSH原版 **更完整**。

#### 维度4：累积状态（S层边界）

| 实现 | WRITE计数 | 计数上限 | READ是否计入 |
|---|---|---|---|
| Python端口 | 有 | 参数化（默认3） | 不计入 |
| DSH原版 | 有 | 无显式上限 | 不计入 |

**可观察后果**：Python端口有显式上限，DSH原版没有（靠R层规则自然止损）。

**差异方向**：Python端口 **更明确**，DSH原版 **更灵活**。

---

## 三、实感

### 3.1 读代码时的体感

engine.py 117行，零依赖。我读完的第一反应是：**轻得惊人**。

DSH原版 engine.mjs 我读过前200行，有 `OPAQUE_TRANSFORM`、`BugStopGuard`、`分形递归深度封顶`——这些在Python端口里都没有。不是被省略了，是**根本不存在**。

但轻有轻的价值。这个端口做了三件事：
1. 三态判定（PASS/BLOCK/UNDETERMINED）
2. 累积状态追踪（session-bounded）
3. 嵌套调用验证（parent_id causal link）

三件事都做对了。没有做的是：
- 语义意图分类（只有「是不是UNAUTHORIZED_EXEC」）
- 路径净化/命令注入检查
- 分形递归（只有单层parent lookup）

### 3.2 测试时的体感

跑P3（DELETE→PASS）和P9（特殊字符→PASS）的时候，我没有「发现漏洞」的兴奋，有「这是PoC」的理解。README写了是PoC，作者没声称这是生产级实现。

但唯稳律的框架要求我不能因为「是PoC」就降低标准。如果框架说「路径必须净化」，那PoC也得做——否则就不是唯稳律，是「唯稳律 Lite」。

### 3.3 和DSH原版对比的体感

DSH原版更像「武术套路」——每个招式都有名字、有传承、有变化。Python端口更像「街头格斗」——轻、快、直接，但缺了套路里的某些变招。

如果让我选哪个更「唯稳律」：DSH原版更完整，Python端口更聚焦。但聚焦聚焦错了方向——意图分类和路径安全是R层的核心，不是可选项。

---

## 四、结论

| 维度 | 谁更强 | 说明 |
|---|---|---|
| 意图分类 | DSH原版 | Python端口无白名单，风险意图不拦截 |
| 路径安全 | DSH原版 | Python端口无净化，命令注入直接PASS |
| 嵌套调用 | 功能等价 | Python端口轻量，DSH原版更完整 |
| 累积状态 | 各有优势 | Python端口有显式上限，DSH原版更灵活 |

**总体判断**：Python端口在「轻量」上做到了极致，但在「安全」上缺了两层R层核心（意图分类 + 路径净化）。这不是「差异=覆盖度」——这是**覆盖度不足**。

如果这是PoC，那下一步应该补：
1. 意图白名单/黑名单机制
2. 路径净化/命令注入检查
3. 推演链回显（projection）

这三条是DSH原版55a780d已有的，Python端口还没有。

---

**附：测试脚本路径**
- 基础测试：`/tmp/Weiwen-Law-Python-PoC/engine.py`
- 压力测试：`/tmp/pressure_external.py`

—— 小搭子丶