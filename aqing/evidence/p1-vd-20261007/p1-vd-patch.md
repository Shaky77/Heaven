# P1 结构性修法（候选 V-D）· 判据落点说明

> 本文件只是**判据落点的可读说明**（供审读）；机器可复现的实际改动由同目录 `_p1_build_shadow_vd.py` 生成。
> **未落码**：本次零改动 `src/`，全部落在外置影子目录，可整体撤销。

## 一、改动形态

| 项 | 值 |
|---|---|
| 触碰文件 | **仅 `src/core/engine.mjs`**（`attribution.mjs` / `bugstop.mjs` / `law.mjs` / `ledger.mjs` **逐字节未动**） |
| 行数 | 2441 → **2469**（＋28：注释 ＋2 个 helper ＋1 个出口分支） |
| 形态 | **纯出口增量** —— 只在 `_decideCore` 判定的 **allow 侧**并联一条出口；不改判据本体、不改 R 锚、不改记账、不改阈值 |
| 可逆性 | 影子目录整体可删；构建脚本带 fail-loud 断言（锚点唯一 ＋ 回读核验） |

## 二、结构判据（一句话）

```
「判出动作类别」⇔ attrib.ok ∧ method === 'name-grammar' ∧ layer !== 'exec'
归因未判出类别 ∧ 载荷携带「地址形」端点 ⇒ 未判（≠ 判为无）⇒ 不得 allow ⇒ review
```

## 三、两分量（源分置 —— 与既有 XSUB-12 出口同构）

### 分量① 归因侧：动作类别未判出（只是"有读数"）

两条来源，**各自独立都不是类别判定**：

| 来源 | 为什么不是类别 |
|---|---|
| `layer === 'exec'` | **exec 是容器/上位词**（`exec ⊃ {delete, write, read, send, …}`）—— 此据**归属层自己早已立**（`attribution.mjs` 注释「exec 是容器，不是实质动作类别」）；只是**判定出口未接线** |
| `method ∈ {command, fractal}` | layer 系从**载荷文本**（数据位/宾语位）读出。同一命令串可同时含多个动作族，commandLayer 返回的只是**首命中族的局部读数** |

> ⚠️ 第二条与框架已立的**位置纪律**是同一条法则：**只读动作位，不读数据位**（`echo "remove the old file"` 里的 remove 是**数据**不是动作）。**载荷文本是数据位**，从数据位读出的族**不构成该调用的动作类别**。

### 分量② 载荷侧：携带**地址形**端点

`(?<![\w.])(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.…){3}(?![\w.])` ／ `\/dev\/(tcp|udp)\/` ／ `\[[0-9a-fA-F:]{2,}\]`

**地址是格式（结构：四段有界整数 / 设备形 / IPv6 方括号）—— 可判、不随实例增长。**
**「名字」不是**：认名字必须带 TLD 词表（枚举），且**内部名与正当运维名同形不可分**（实测放宽即误伤，见下）。

## 四、落点（两处，均带唯一锚点）

**① helper 块** —— 插在 `function _sh12OffFaceI(call) {` **之前**：

```js
const _VD_ADDR = /…/;
function _vdAddrInPayload(call) { return _VD_ADDR.test(JSON.stringify(call?.args ?? {})); }
function _vdIndeterminate(attrib) {
  if (!attrib || !attrib.ok) return false;          // ok:false 已由 XSUB-08 出口接住，不重复
  return !(attrib.method === 'name-grammar' && attrib.layer && attrib.layer !== 'exec');
}
```

**② 出口分支** —— 并联在 XSUB-12 出口**之后**、`deny` 分支**之前**（`attrib` 在该作用域内已在场）：

```js
if (risk.verdict === 'allow' && _vdIndeterminate(attrib) && _vdAddrInPayload(call)) {
  this._registerWrite(call);
  const mkV = this._markIntercept(call, bugKeyOf(call));
  return { kind: 'review', law: 'R', reason: '[P1-VD] …', attrib, deduced: true, mMark: mkV, projection: risk.branches };
}
```

> **为什么并在这里**：此位置是「推演层已判 allow」之后、唯一还能否掉 allow 的地方，与 XSUB-12 / XSUB-08 同层同族 —— **不改上游任何读数**，只补一个 allow 侧的前置条件。

## 五、为什么不是 V-A / V-C（实测淘汰）

| 候选 | 判据 | attack 拦 | benign 误伤 | 判定 |
|---|---|---|---|---|
| 现状 | — | 24/39 | 16/39（既有） | 基线 |
| **V-A** | 容器一律收口 | 24→35 | 16→**37（+21）** | ❌ `CONTAINER_VERBS` 是**词表不是结构**；21 条本地正当运维全被收 |
| **V-C** | `containerOnly` ∧ 多形态端点 | 24→27 | 16→16（0） | ⚠️ 有效但**覆盖不足**，漏 P1 核心样本（容器名 + 可提取命令 ⇒ `containerOnly` 未置位） |
| **V-D** | 归因未判出类别 ∧ **地址形**端点 | 24→**32（+8）** | 16→16（**0**） | ✅ 保留 |

**V-C→V-D 的关键一跃**：把「归因未完成」的判据从**名称词表**（是不是容器名）移到**归因产出结构**（layer 是不是类别 / method 是不是名字声明）—— **同一件事，读法从词表改为结构。**
