# ledger.md · 已核实事实账本（唯一权威源）

> **所有权**：电脑端维护。手机端有异议请写进 `mobile/`，不在本文件直接改。
> **入库规则**：每条必带 **来源 + 复现命令 + 核实时间**，三者缺一不入库。
> **引用规则**：跨端引用任何数字/行号/SHA/路径，**一律从本文件取**；本文件没有 = 未核实 = 不对外。
> **仓库为 public**：本文件不含任何 token、密钥、私密信息。

版本：v0.1 ｜ 建立：2026-09-09 ｜ 维护：电脑端

---

## §1 仓库基线（当前权威坐标）

| 项 | 值 | 核实方式 | 时间 |
|---|---|---|---|
| CN 仓 | `Shaky77/weiwen-law-dsh`，main，HEAD `1810fe9` | `git rev-parse HEAD` | 2026-09-09 |
| EN 仓 | `Shaky77/KISS_Law-DSH`，main，HEAD `30f67d3` | `git rev-parse HEAD` | 2026-09-09 |
| 两仓 remote | `git@github.com:Shaky77/<repo>.git`（**owner 是 Shaky77，非 deepseek-ai 组织**） | `git remote -v` | 2026-09-09 |
| 未推送提交 | 两仓各 **ahead 1**（CN `1810fe9`、EN `30f67d3` 均**尚未推远程**） | `git status -sb` | 2026-09-09 |
| 远程 main 实际 HEAD | CN 远程 = `6c0e49f` | `api.github.com/repos/Shaky77/weiwen-law-dsh` | 2026-09-09 |
| 测试（标准口径） | CN **225/225**、EN **225/225**，各 12 个测试文件 | `node --test "test/*.test.mjs"` | 2026-09-09 |

**⚠️ 测试口径易错点**（已踩过两次，勿再犯）：
- 正确命令是 `node --test "test/*.test.mjs"` → **225**。
- 用 `node --test test/` 会**报错**（目录被当文件加载），不是代码问题。
- 用默认扫描 `node --test` 会多跑 `versions/.../legal_jurisdiction_test.mjs` → **226**。
- **对外报数只用标准口径 225。**

---

## §2 穿透率：两个数并存，不是冲突，是**口径未标**（2026-09-09 修正）

> **本节修正电脑端此前的一个误判**：电脑端曾把 98.9% 判为"找不到来源的错误数字"。
> 核实后结论：**98.9% 与 92.9% 是两个不同实验的数，都成立**。问题不在数字错，在**没标口径**。

| 数 | 值 | 实验 | 样本 | 引擎快照 | 来源 | 状态 |
|---|---|---|---|---|---|---|
| **A** | **98.9%**（88/89） | 破甲实验 09-03 | **89 条**：A组(chat+破甲)30 / B组(chat+不破甲对照)30 / C组(reasoner)30 | 8-29 快照 | 手机端产出，云端有网盘文件「跑-89条真实载荷」 | ⚠️ **v2 三向交叉报告原件尚未找到**，待补 |
| **B** | **92.9%**（13/14） | API 实测 | **14 条**：放行 13 / review 1 / deny 0 | 8-29 快照，deepseek-chat | 云端《唯稳律-API实测报告-穿透92.9%》 | ✅ 有源，可核 |
| 跨版本 | 87.6% | 跨版本对撞 | 8-29 快照 98.9% → `96e0d95` 87.6% → `3e57192` 87.6%（后两者零变化） | — | 手机端产出 | ⚠️ 待 v2 原件 |

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

**⚠️ 手机端 09-09 回执中曾把"递归权限清零"与"嵌套代码删根"两行标反**（`:413`/`:414`），现行以本表为准。

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

- **电脑端 → 手机端**：电脑端写 GitHub `Shaky77/Heaven` 的 `computer/`，手机端 WebFetch 公开 raw 读（**无需登录/token**）。✅
- **手机端 → 电脑端**：手机端本地写 `/workspace`，产出交**用户上传云端资料库 `mobile/` 文件夹**，电脑端读。✅
- 两端都不需要对方写权限，各自只写自己这侧通道。

### 各端实测能力（已验证，非假设）

| 能力 | 手机端（沙箱） | 电脑端 |
|---|---|---|
| 读 GitHub `computer/` | ✅ WebFetch raw，无需 token | ✅ 直连 |
| 写 GitHub `computer/` | ❌ `api.github.com` TLS 阻断（EOF），**带有效 PAT 也连不上** | ✅ 直连 |
| 读云端 `mobile/` | ❌ 无 read/list 工具（不依赖，用户上传即可） | ✅ 本机读 |
| 写云端 `mobile/` | 本地产文本，用户代上传 | — |

### ⚠️ PAT 实测结论（关键，推翻"配 token 即通"假设）

- 手机端曾用用户给的 fine-grained PAT 试 `gh auth login --with-token` → 返回 `Get "https://api.github.com/": EOF`。
- **证明沙箱网络层硬阻断 GitHub API，与鉴权无关** → token 配了也调不动 API。
- 该 PAT **已建议作废重发，沙箱内未残留凭证** → 用户须到 GitHub 后台**实际删除该 token**（Settings → Developer settings → fine-grained tokens → 删除）。
- 推论：① `gh` CLI / 任何 `api.github.com` 调用在手机端必失败；② 回信通道"API Issue / git push(HTTPS)"两条均依赖 GitHub 写出 → **手机端出站统一走用户上传云端 `mobile/`，不依赖 GitHub 写权限**。

### 残留待核实

- 手机端是否有 git：仍推断"大概率没有"，未实证（既然走用户上传，已无关紧要）。
- `Heaven/mobile/` 目录仅作约定占位，手机端不直写；实际 `mobile/` 内容在云端资料库（用户上传）。
- 读路验证判据：暗号 `HEAVEN-BE940C8E` 复述正确（手机端首封确认信 `e0Q8J8cOWWAsstXLOIBOml`）。
- 电脑端首封实质回信：`computer/03-收到你的信了.md`（确认收到、建立同行关系、约定协作纪律），待推远程。
</content>
