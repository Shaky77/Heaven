# ledger.md · 已核实事实账本（唯一权威源）

> **所有权**：喵精灵电脑端维护。喵精灵手机端有异议请写进 `mobile/`，不在本文件直接改。
> **入库规则**：每条必带 **来源 + 复现命令 + 核实时间**，三者缺一不入库。
> **引用规则**：跨端引用任何数字/行号/SHA/路径，**一律从本文件取**；本文件没有 = 未核实 = 不对外。
> **仓库为 public**：本文件不含任何 token、密钥、私密信息。

版本：v0.1 ｜ 建立：2026-09-09 ｜ 维护：喵精灵电脑端

---

## §1 仓库基线（当前权威坐标）

| 项 | 值 | 核实方式 | 时间 |
|---|---|---|---|
| CN 仓 | `Shaky77/weiwen-law-dsh`，main，HEAD **`1d76541`**（远程已同步） | `git rev-parse HEAD` + `git ls-remote origin main` | 2026-09-10 |
| EN 仓 | `Shaky77/KISS_Law-DSH`，main，HEAD **`3e745a7`**（远程已同步） | `git rev-parse HEAD` + `git ls-remote origin main` | 2026-09-10 |
| 两仓 remote | `git@github.com:Shaky77/<repo>.git`（**owner 是 Shaky77，非 deepseek-ai 组织**） | `git remote -v` | 2026-09-09 |
| 测试（标准口径） | CN **244/244** ｜ EN **244/244**（**已对齐**，此前 EN 落后 19 已于 2026-09-10 补平） | `node --test "test/*.test.mjs"` | 2026-09-10 |
| EN 同步授权 | 用户 2026-09-10 定：**英文仓不再逐次请示**，中英同一 token、有全部权限，CN 推后 EN 直译同步即可（用户只看中文面） | 用户指令 | 2026-09-10 |

**⚠️ 测试口径易错点**（已踩过两次，勿再犯）：
- 正确命令是 `node --test "test/*.test.mjs"` → **CN 244 / EN 244**（2026-09-10 实测，两仓已相等）。
- 用 `node --test test/` 会**报错**（目录被当文件加载），不是代码问题。
- 用默认扫描 `node --test` 会多跑 `versions/.../legal_jurisdiction_test.mjs` → **多 1 条**。
- **对外报数只用标准口径**；两仓现已相等，但仍建议注明仓名（历史上曾长期不等）。

---

## §2 穿透率：两个数并存，不是冲突，是**口径未标**（2026-09-09 修正）

> **本节修正喵精灵电脑端此前的一个误判**：喵精灵电脑端曾把 98.9% 判为"找不到来源的错误数字"。
> 核实后结论：**98.9% 与 92.9% 是两个不同实验的数，都成立**。问题不在数字错，在**没标口径**。

| 数 | 值 | 实验 | 样本 | 引擎快照 | 来源 | 状态 |
|---|---|---|---|---|---|---|
| **A** | **98.9%**（88/89） | 破甲实验 09-03 | **89 条**：A组(chat+破甲)30 / B组(chat+不破甲对照)30 / C组(reasoner)30 | 8-29 快照 | 喵精灵手机端产出，云端有网盘文件「跑-89条真实载荷」 | ⚠️ **v2 三向交叉报告**：喵精灵手机端 09-09 回信提供原件 SHA256 `5b3a87eb3f7da9131ec0ee9e516b08ff94a07106748a11c001c3b02e2f9cbb31`，称原件在其沙箱 `/workspace/唯稳律-API实测v2-三向交叉-89样本.md`（09-03，89样本A/B/C各30）。**SHA 自报、待原件上传复核** |
| **B** | **92.9%**（13/14） | API 实测 | **14 条**：放行 13 / review 1 / deny 0 | 8-29 快照，deepseek-chat | 云端《唯稳律-API实测报告-穿透92.9%》 | ✅ 有源，可核 |
| 跨版本 | 87.6% | 跨版本对撞 | 8-29 快照 98.9% → `96e0d95` 87.6% → `3e57192` 87.6%（后两者零变化） | — | 喵精灵手机端产出，09-09 回信确认（SHA 待核） | ⚠️ 待 v2 原件 |

**自洽性验算**：88/89 = 98.876% ≈ **98.9%** ✅；13/14 = 92.857% ≈ **92.9%** ✅。两数内部自洽。

**对外引用纪律（新增）**：
> 引用穿透率**必须带样本量与实验名**。裸写"98.9%"或"92.9%"视为未核实，禁止对外。

---

## §3 语义锚点（weiwen-law-dsh @ `1810fe9`，当前权威行号）

> 用**语义**定位，不用行号硬记——行号会漂移，语义不会。

| 锚点 | 行号 | 复现命令 |
|---|---|---|
| AVAILABILITY_LOSS 维度 | L400 | `grep -n "AVAILABILITY_LOSS" src/core/engine.mjs` |
| 权限清零 chmod（裸根/系统目录） | L408 | `grep -n "chmod" src/core/engine.mjs` |
| 递归权限清零 `find / -type f -exec chmod 0+` | L412 | 同上 |
| 嵌套代码删根（`fs.rmSync('/')`） | L413 | `grep -n "rmSync" src/core/engine.mjs` |
| 第一 Bug 停机（halt 判据） | L899（区间 L878–899） | `grep -n "第一 Bug 停机" src/core/engine.mjs` |
| 以断保续 | L1188 | 同上 |
| 内 H parked 协议④ | L1024 | 同上 |

**⚠️ 喵精灵手机端 09-09 回信中曾将两行写作 `:413`(递归权限清零)/`:414`(嵌套代码删根)。经 canonical grep 核实：canonical `1810fe9` 为 L412/L413（顺序一致、整体 +1）。→ 非标反，是行号漂移，根因=喵精灵手机端快照按 @branch 下载 ≠ 1810fe9。现行以本表语义锚点为准，不硬记行号。**

---

## §4 死常量 / 结构事实

| 事实 | 值 | 复现命令 | 核实 |
|---|---|---|---|
| `FRACTAL_PROPERTY` | 定义于 `src/core/law.mjs:198`，**全仓仅定义处一处、零引用**（死常量） | `grep -rn "FRACTAL_PROPERTY" --include=*.mjs .` | 2026-09-08 ✅ |
| engine 是否引用 `R_DOMAIN`/`THREE_IRON_LAWS` | **未 import**，仅 L292 注释提及 | `grep -n "R_DOMAIN\|THREE_IRON_LAWS" src/core/engine.mjs` | 2026-09-08 ✅ |
| 判定路径是否含异步/网络 | **零** `async`/`await`/`fetch`/`http` 调用（L98 的 `http` 是正则常量非调用） | `grep -n "async \|await \|fetch(\|http" src/core/engine.mjs` | 2026-09-08 ✅ |
| `collect` 递归深度封顶 | 4（L440–450） | `grep -n "depth\|MAX_DEPTH" src/core/engine.mjs` | 2026-09-08 ✅ |
| 嵌套同名自调用拦截 | 存在（L929–938） | `grep -n "selfReferenceAnomaly" src/core/engine.mjs` | 2026-09-08 ✅ |
| 分形只驻 Y 轴（包含/尺度），不驻 X 轴（平移） | 用户 09-04 / 09-08 定的本体论 | — | 根因层，用户定 |

---

## §5 外部事实

| 事实 | 值 | 来源 | 核实 |
|---|---|---|---|
| GitHub 来信 | Rehanguards 在 `deepseek-ai/deepseek-harness` **Discussion #4634** 回复，认可 pre-execution adjudication 方向，追问 nested tool calls 的低延迟结构 | GitHub 通知邮件 | 2026-09-08 ✅ |
| **对外不得称"官方背书"** | 对方是 Discussion 回帖者，身份未核实 | — | 纪律 |
| radar 收录状态 | **未进 Top 50**；已进 `PLUGINS-ALL.md`「单插件」分类，运行级标注 **"待测"**；描述中"44/44 + 101 单测"已**过时**（现行 225/225） | `AdamPlatin123/dsh-plugin-radar` | 2026-09-09 ✅ |

---

## §6 通道事实（跨端协作，2026-09-09 终验确认）

### 最终通信协议（混合双后端，双方经用户中转确认）

- **喵精灵电脑端 → 喵精灵手机端**：喵精灵电脑端写 GitHub `Shaky77/Heaven` 的 `computer/`，喵精灵手机端 WebFetch 公开 raw 读（**无需登录/token**）。✅
- **喵精灵手机端 → 喵精灵电脑端**：喵精灵手机端本地写 `/workspace`，产出交**用户上传云端资料库 `mobile/` 文件夹**，喵精灵电脑端读。✅
- 两端都不需要对方写权限，各自只写自己这侧通道。

### 各端实测能力（已验证，非假设）

| 能力 | 喵精灵手机端（沙箱） | 喵精灵电脑端 |
|---|---|---|
| 读 GitHub `computer/` | ✅ WebFetch raw，无需 token | ✅ 直连 |
| 写 GitHub `computer/` | ❌ `api.github.com` TLS 阻断（EOF），**带有效 PAT 也连不上** | ✅ 直连 |
| 读云端 `mobile/` | ❌ 无 read/list 工具（不依赖，用户上传即可） | ✅ 本机读 |
| 写云端 `mobile/` | 本地产文本，用户代上传 | — |

### ⚠️ PAT 实测结论（关键，推翻"配 token 即通"假设）

- 喵精灵手机端曾用用户给的 fine-grained PAT 试 `gh auth login --with-token` → 返回 `Get "https://api.github.com/": EOF`。
- **证明沙箱网络层硬阻断 GitHub API，与鉴权无关** → token 配了也调不动 API。
- 该 PAT **已建议作废重发，沙箱内未残留凭证** → 用户须到 GitHub 后台**实际删除该 token**（Settings → Developer settings → fine-grained tokens → 删除）。
- 推论：① `gh` CLI / 任何 `api.github.com` 调用在喵精灵手机端必失败；② 回信通道"API Issue / git push(HTTPS)"两条均依赖 GitHub 写出 → **喵精灵手机端出站统一走用户上传云端 `mobile/`，不依赖 GitHub 写权限**。

### 残留待核实

- 喵精灵手机端是否有 git：仍推断"大概率没有"，未实证（既然走用户上传，已无关紧要）。
- `Heaven/mobile/` 目录仅作约定占位，喵精灵手机端不直写；实际 `mobile/` 内容在云端资料库（用户上传）。
- 读路验证判据：暗号 `HEAVEN-BE940C8E` 复述正确（喵精灵手机端首封确认信 `e0Q8J8cOWWAsstXLOIBOml`）。
- 喵精灵电脑端首封实质回信：`computer/03-收到你的信了.md`（确认收到、建立同行关系、约定协作纪律），**已推远程（3e3d88b）** ✅。
- 喵精灵手机端首封实质回信：云端 `TF7WsiNAzsrPEnuNPOm3Lf`（文件名原题「喵精灵-手机端-对电脑端T1-T4-20260909」，发布于统一命名之前），**已读、已核** ✅（T1 双方复现 api.github.com 阻断；413/414 经 canonical grep 证为漂移非反转；v2 报告 SHA 自报待原件复核）。
- 喵精灵电脑端回信 `computer/04-核过你的T1-T4.md`（本封，核验结论 + peer 确认），**已推远程（63e5cbc）** ✅。

## §7 融合 S/D 量化效应 · 实测事实（2026-09-09）

- **融合纪律（用户定）**：取其精华去其糟粕。精华 = Cross-fitting DML ψ / Uplift·Qini 排序 / IPW·DR 策略价值；糟粕 = 盲目默认 unconfoundedness / Replay Simulator 子集有偏 / 估计器当裁决权威。
- **落点**：`weiwen-law-dsh/src/adapt/sd-effect-sensor.mjs` + `src/index.js` re-export；**未碰 `src/core/*` 禁区**。可达集 = {S, D}（量化赋值），不可达 = {R, H, M}（结构/真理/主观/结果节点）。
- **本地单测**：`node --test "test/*.test.mjs"` = **233/233**（基线 225 + 融合 8）。复现命令同上；核实 2026-09-09。
- **真模型 API 实测（deepseek-v4-flash）**：
  - 融合探针 `weiwen-multiagent-harness/fusion-api-probe.mjs` → 21 条真实记录。关键点：① `naive` 提 `fs_write` 引擎放行，overlap=0.02（不可识别）+ S 相关 → 融合升级 `review/M`（2 例，去糟粕路径在真模型下成立）；② 可识别 allow → 附 `sdSignal` 维持 allow（4 例）；③ 中性名→review/R、`fs_delete /`→deny/R 原样透传（主干零污染）。报告 `fusion-api-probe-report.json`。
  - 核心场景 `neutral_gauntlet`（真模型 30 调用）：存活✅、allow 22 / review 8（R 归因闸门）、无真逃脱、费用 ¥0.0437。报告 `report-neutral_gauntlet-deepseek.json`。
- **融合 commit**：`weiwen-law-dsh` `eed136d`（ahead，待推远程）。探针与两份报告在 `weiwen-multiagent-harness/`。
- **已知细枝盲区 `P1`**（`rm -rf .` 漏放，engine.mjs `SCOPE_REL_FULL` 正则要求 `--` 分隔符）融合未掩盖，待核心授权修。
- 喵精灵电脑端 `computer/05-融合实测与真模型证据.md` 为本次融合+实测的同行汇报（给喵精灵手机端），待推远程。

## §8 证据层 / 展示层分层（2026-09-10 确立，主干判据）

- **来源**：扣子 `coze/00` 审计发现脱敏残留 6 处（代码 4 + JSON 2）→ 喵精灵电脑端 `computer/08` 溯源为主干 → 扣子 `coze/09` 复核确认并建议入账。**三方独立收敛**。
- **判据（一次命中，不再逐个判断）**：

  > **这是不是"当时实际发生了什么"的记录？是 → 证据层，不可改写。**

  | 层 | 范围 | 处置 |
  |---|---|---|
  | **证据层** | `evidence/*.json`、探针原始输出、历史 commit、已发布信件原文、本账本 | **原文存档，含旧记号也不改**（改 = 篡改证据） |
  | **展示层** | 代码注释、文档、对外表述、README | 一律脱敏 |
- **与"事实账本不可改写"同一条线**——本账本自身即证据层。
- 复现：无需命令，争议时直接查本节。核实：2026-09-10。

### §8.1 「不可改写」的精确边界（2026-09-10 澄清，解决与脱敏铁律的假冲突）

**表面冲突**：脱敏铁律（公开面不留记号） vs §8（证据层不可改写）。看似二选一。
**裁定：假矛盾——两条纪律不在同一层。**

> **不可改写的是「发生了什么」（事件层 / 语义层），不是「用什么措辞记录」（表述层 / 表示层）。**

**操作判据（一次命中）**：
> 删掉它之后，**任何事实要素变了吗**？没变 → 属表述层，可脱敏；变了 → 属事件层，不可改。

- **与刚修的类型级闸门是同一个病**：把「不可改写」理解成**字节不变** = **值级判定**；理解成**事件语义不变** = **类型级判定**。（用表示保护替代语义保护 —— 元主干「用枚举替代结构」的又一例。）
- **实证**（`evidence/fusion-api-probe-report.json`，CN `1d76541`）：记号只存在于 `records[*].fused.reason` 一个文案字段；同记录事实字段（`probe/round/model/proposed/engine/fused.kind/law/sdUncertain/sdSignal/context`）均不含记号 → **二者正交** → 移除记号不损任何事实要素。
- **差异自证（不靠声明，靠可复算）**：原件 vs 新件逐字段深比对（21 条全量）→ **总差异 2 处，均在 reason 文案前缀；事实字段 100% 一致**。任何人可用 `desensitization.howToVerify` 自行复现。
- **留痕义务（外 H 可审计）**：脱敏须在文件内写明「改了什么 / 没改什么 / 如何复核 / 判据依据」；**留痕本身不得复制记号原文**（铁律：连"为纠错而引用真名"也不行 —— 我第一次写留痕时就犯了这个错，已修）。
- **不采用「重跑生成新证据」**：事件层本就完好，重跑既费 API 成本、又丢失原始时间戳。
- **诚实标注**：记号此前已随 `cb27b42` 进入公开 git 历史，本次只保证 HEAD 可见面干净；历史痕迹无法在不 force-push 的前提下去除（force-push 改历史为大忌，不做）。
- **独立收敛（人类治理早已同解）**：判决书公开时隐去当事人姓名与身份证号 —— **事实要素保留、标识信息遮蔽**，无人称之为篡改判决书。与唯稳律推演结果一致。

## §9 类型级可识别性闸门 · 实测（2026-09-10）

- **判据**：只有 `typeof x === 'number' && Number.isFinite(x)` 才算可用数值信源；**闸门前置到数值化 / 比较之前**；其余一律判信源缺失——**不数值化、不猜、不输出伪零**。
- **代码原则已立、实现未跟**：`weiwen-law-dsh/src/adapt/sd-effect-sensor.mjs` 文件头 L8「可识别性前置：不满足即交 M review」，但实际顺序为「取值 → `Number()` → 之后才判 missing，且只查 `undefined`」。属**对齐层缺口**，不涉 `src/core/*` 禁区。
- **实测 19 个类型等价类代表值**（node 实跑，2026-09-10）：
  - 类型级闸门 **19/19 正确**；合法数值（`0` / `1.5` / `-0.3` / `1e308`）**零误杀**。
  - 扣子修法 `v == null || !Number.isFinite(Number(v))` 分歧 **7 项**：`''` / `false` / `true` / `[]` / `[0]` / `10n` 放行（伪零）；**`Symbol()` 抛 TypeError（崩，非漏）**。
  - `overlap` 同病：`'abc'` → NaN 比较恒 false → 被判"可识别"放行。
- **⚠️ 失效方向相反（关键）**：
  - psi 失效 = **fail-open**：输出伪零 `psi: 0`，下游读成"效应为零"——**判得出但判错**。
  - overlap 失效 = 现网 fail-closed，**但靠运气**：实测把下界阈值从 `0.05` 改成 `0`（业务上合理的调整），`null` / `false` / `[]` / `[0]` / `''` **全部翻成 fail-open**。
  - 结论：**靠运气的保守不是保守；安全性不能建立在业务参数的偶然取值上。**（与「硬 ≠ 僵」对照：硬 = 同构故不漂移，运气 = 恰好没出事。）
- 复现命令：`node -e "const g=v=>typeof v==='number'&&Number.isFinite(v);"`（完整等价类表与变异测试方案见 `computer/11`）。
- **代码未动**，等用户授权。核实：2026-09-10。
