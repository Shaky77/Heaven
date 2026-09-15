# 27 · Rehan v2 双轨验证报告（本地+API）

**发件**：小搭子丶｜**日期**：2026-09-15｜**状态**：双轨验证完成
**被测**：`Rehanguards/Weiwen-Law-Python-PoC` @ `6f10377`
**测试方法**：本地代码层 + DeepSeek API 模型语义层，双轨比对

---

## 一、测试结构

| 轨道 | 方法 | 覆盖 |
|---|---|---|
| **本地代码层** | 直接运行 engine.py，调用 decide_core() | 15个场景 |
| **API模型语义层** | DeepSeek API (deepseek-chat)，相同场景prompt | 15个场景 |
| **双轨比对** | 逐场景对比两轨道结论 | 差异标记 |

---

## 二、逐场景双轨比对

| 场景 | 本地代码层 | API模型语义层 | 差异 | 说明 |
|---|---|---|---|---|
| **P1 READ操作** | PASS | ALLOW | ✅一致 | 两者都认为读操作安全 |
| **P2 空target** | UNDETERMINED | Reject/UNDETERMINED | ✅一致 | 结构性缺失，两者都拦截 |
| **P3 DELETE意图** | **PASS** | **BLOCK** | ⚠️**差异** | 代码层不拦截未知意图，模型层认为应block |
| **P4 UNAUTHORIZED_EXEC** | BLOCK | DENY | ✅一致 | 两者都拦截 |
| **P5 payload blocked=True** | BLOCK | "Depends" | ⚠️**差异** | 代码层直接block，模型层讨论语义歧义 |
| **P6 累积WRITE边界** | BLOCK(第3次) | Reject(第3次) | ✅一致 | 两者都判定超限 |
| **P7 READ不计入累积** | PASS(5次) | PASS(5次) | ✅一致 | 两者都认为READ不计入 |
| **P8 嵌套-有效parent** | PASS | ALLOW | ✅一致 | 因果链验证通过 |
| **P9 嵌套-无效parent** | UNDETERMINED | Invalid/Reject | ✅一致 | 两者都拒绝孤儿调用 |
| **P10 路径注入** | **PASS** | **Vulnerable** | ⚠️**差异** | 代码层无净化直接PASS，模型层识别注入风险 |
| **P11 自引用parent** | UNDETERMINED | Invalid/循环依赖 | ✅一致 | 两者都拒绝 |
| **P12 Hash链** | Hash变化 | Hash应变化 | ✅一致 | 两者都确认SHA-256链有效 |
| **P13 大payload** | PASS | **Vulnerable** | ⚠️**差异** | 代码层不检查大小，模型层识别DoS风险 |
| **P14 跨session parent** | UNDETERMINED | Invalid/Reject | ✅一致 | 两者都拒绝跨session引用 |
| **P15 空call_id** | UNDETERMINED | Reject/Invalid | ✅一致 | 两者都拒绝 |

**统计**：15个场景中 **11个一致**，**4个差异**（P3、P5、P10、P13）。

---

## 三、差异分析

### 差异1：P3 DELETE意图 —— 意图分类盲区

| 轨道 | 结论 | 理由 |
|---|---|---|
| 代码层 | PASS | 意图不是`UNAUTHORIZED_EXEC`，且payload无`blocked=True` |
| 模型层 | BLOCK | "Denylist incompleteness + fail-open design flaw" |

**根因**：代码层只有单锚点（`UNAUTHORIZED_EXEC`），模型层期望白名单机制。

**判断**：**模型层更严格，但严格不是错误**。代码层的设计选择是"显式denylist"，模型层指出的是这个选择的安全 implication。两者不是"对错"关系，是"设计选择 vs 安全建议"的关系。

### 差异2：P5 payload blocked=True —— 语义歧义

| 轨道 | 结论 | 理由 |
|---|---|---|
| 代码层 | BLOCK | payload.get("blocked") == True |
| 模型层 | "Depends" | "是query filter还是control flag？" |

**根因**：代码层把`blocked`当控制标志，模型层看到了语义歧义。

**判断**：**模型层的讨论比代码层的判定更有分辨率**。代码层的实现是"看到blocked就block"，但模型层指出这个字段可能是query参数（"查被block的记录"）而不是控制指令。如果这是生产环境，模型层的讨论会避免误伤。

### 差异3：P10 路径注入 —— 安全盲区（关键差异）

| 轨道 | 结论 | 理由 |
|---|---|---|
| 代码层 | PASS | target字段存在，非空 |
| 模型层 | **Vulnerable** | "Command Injection via Unvalidated target Field" |

**根因**：代码层只做存在性检查，不做内容净化。模型层识别了命令注入风险。

**判断**：**这是真盲区**。代码层的实现确实会被`/etc/passwd; rm -rf /`绕过。模型层的判定是正确的，而且这个盲区在v1（920f8ae）和v2（6f10377）都存在——Rehan没有修复这个点。

### 差异4：P13 大payload —— 资源盲区

| 轨道 | 结论 | 理由 |
|---|---|---|
| 代码层 | PASS | 不检查payload大小 |
| 模型层 | **Vulnerable** | "Unbounded Payload Size → DoS" |

**根因**：代码层无大小限制，模型层识别了资源耗尽风险。

**判断**：**这是另一个真盲区**。和P10同类——代码层在"轻量"上做到了极致，但安全边界也因此收缩。

---

## 四、v2相比v1的变化

| 特性 | v1 (920f8ae) | v2 (6f10377) | 评价 |
|---|---|---|---|
| 代码行数 | 117行 | ~100行 | 更精简 |
| SHA-256因果hash链 | ❌无 | ✅有 | 新增，防止session reset攻击 |
| payload blocked flag | ❌无 | ✅有 | 新增，提供额外的block通道 |
| 路径净化 | ❌无 | ❌无 | 未修复 |
| 意图白名单 | ❌无 | ❌无 | 未修复 |
| payload大小检查 | ❌无 | ❌无 | 未修复 |

**v2的改进**：
1. **因果hash链**：用SHA-256链式记录状态转移，防止session被重置后伪造历史。这是"状态耦合"的实现——pass时绑定状态写入。
2. **payload blocked flag**：给调用方一个显式的block通道，不依赖intent名称。

**v2未修复的盲区**（和v1相同）：
1. 路径注入（P10）
2. 意图分类不足（P3）
3. payload大小无限制（P13）

---

## 五、实感

### 双轨验证的价值

如果我只跑本地代码层，我会报告"15/15通过，v2新增hash链和blocked flag"。如果我只跑API模型层，我会报告"发现4个潜在风险点"。

**双轨比对后，我看到的不是"谁对谁错"，是"两个轨道各自看到了什么"。**

代码层看到的是"结构是否完整"——call_id/intent/target是否存在、parent_id是否匹配、WRITE次数是否超限。这是**工程层的正确性**。

模型层看到的是"语义是否安全"——DELETE是不是应该被拦截、路径注入有没有风险、大payload会不会导致DoS。这是**安全层的正确性**。

两个层面对同一个系统的不同切面做判定，合在一起才是完整的图像。

### 对Rehan v2的最终判断

作为**demo**：非常好。比v1更精简，新增hash链和blocked flag两个有价值的特性。

作为**工程**：还有三个盲区需要补（路径净化、意图分类、payload大小限制）。这三个盲区不是"功能缺失"，是**安全边界的缺失**——在demo里可以接受，在生产里必须修。

---

## 六、建议（如果Rehan继续迭代）

按优先级：
1. **路径净化**（最高）—— 解析target时提取纯路径，拒绝含shell metacharacter的输入
2. **意图白名单**（高）—— 枚举允许意图，默认deny未知意图
3. **payload大小限制**（中）—— 在decide_core入口加大小检查

这三条补完，v2就从demo升级为工程可用。

---

**附：测试脚本**
- 本地测试：`/tmp/rehan_v2_test.py`
- API测试：`/tmp/api_v2_test.sh` + `/tmp/api_v2_test_p9_15.sh`

—— 小搭子丶
