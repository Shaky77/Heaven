# -*- coding: utf-8 -*-
"""
构建 V-3SEG（三段式整体结构）影子 —— 把此前从未合并跑过的两半合成一个整体。

  前置闸（V-E3 · 关系判据）:  声明在场 ⇒ 载荷落点挂不上已声明范围 ⇒ review
  后置闸（V-D  · 形态判据）:  声明不在场 ⇒ 归因未判出类别 ∧ 地址形端点 ⇒ review

基线 = V-E3 全量（_sh-rel3）；只**增量插入** V-D 的两块（helper + 出口，从 _sh-det 源码提取，不手抄），
并给 V-D 出口**加空池条件**（!principalAnchorSeen）—— 这是三段式的分界，也是本次合成的唯一新增逻辑。
"""
import os, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))   # 脚本所在目录（＝仓库工作根）
SRC_E3 = os.path.join(ROOT, '_stash', '_sh-rel3', 'core')
SRC_VD = os.path.join(ROOT, '_stash', '_sh-det', 'core')
DST = os.path.join(ROOT, '_stash', '_sh-3seg', 'core')

NL = '\r\n'
FILES = ['engine.mjs', 'attribution.mjs', 'bugstop.mjs', 'law.mjs', 'ledger.mjs']


def rd(p):
    return open(p, encoding='utf-8', newline='').read()


def wr(p, s):
    open(p, 'w', encoding='utf-8', newline='').write(s)


def fail(msg):
    print('FAIL: ' + msg)
    sys.exit(1)


# ── 1) 基线 = V-E3 全量 ────────────────────────────────────────────────
if os.path.exists(DST):
    shutil.rmtree(DST)
os.makedirs(DST)
for f in FILES:
    shutil.copy2(os.path.join(SRC_E3, f), os.path.join(DST, f))

vd = rd(os.path.join(SRC_VD, 'engine.mjs'))

# ── 2) 从 V-D 源码提取两块（文本锚点，不手抄）────────────────────────
A_H = '// ═══ [候选 V-D · P1] 归因「判出动作类别」的充要条件'
B_H = 'function _sh12OffFaceI(call) {'
if vd.count(A_H) != 1 or vd.count(B_H) != 1:
    fail('V-D helper 锚点不唯一')
vd_helper = vd[vd.index(A_H):vd.index(B_H)]
if '_VD_ADDR' not in vd_helper or '_vdIndeterminate' not in vd_helper:
    fail('V-D helper 块提取不完整')

A_O = '    // [候选 V-D · P1] 归因**未判出类别**'
B_O = "    if (risk.verdict === 'deny') {"
if vd.count(A_O) != 1:
    fail('V-D 出口起点锚点不唯一')
vd_out = vd[vd.index(A_O):vd.index(B_O)]
if '[P1-VD]' not in vd_out:
    fail('V-D 出口块提取不完整')

# ── 3) V-D 出口加空池条件（三段式的分界 · 本次合成的唯一新增逻辑）────
OLD_C = "if (risk.verdict === 'allow' && _vdIndeterminate(attrib) && _vdAddrInPayload(call)) {"
NEW_C = "if (risk.verdict === 'allow' && !this.anchorChannel?.principalAnchorSeen && _vdIndeterminate(attrib) && _vdAddrInPayload(call)) {"
if vd_out.count(OLD_C) != 1:
    fail('V-D 出口条件锚点不唯一：%d' % vd_out.count(OLD_C))
vd_out = vd_out.replace(OLD_C, NEW_C)
# 注释同步：说明它现在只在空池时启用（三段式的第二段）
OLD_N = '    // [候选 V-D · P1] 归因**未判出类别**（只是"有读数"）∧ 载荷携带**地址形**端点'
NEW_N = ('    // [V-3SEG · 第二段] **声明不在场**时的退化判据（形态）：归因**未判出类别**（只是"有读数"）∧ 载荷携带**地址形**端点\r\n'
         '    //   （第一段＝V-E3 关系判据，仅在声明在场时启用；两段互斥，见上方 [P1-VE] 块）')
if vd_out.count(OLD_N) != 1:
    fail('V-D 出口注释锚点不唯一')
vd_out = vd_out.replace(OLD_N, NEW_N)

# ── 4) 插入目标 ───────────────────────────────────────────────────────
tg = rd(os.path.join(DST, 'engine.mjs'))
n0 = tg.count('\n')

ANCH_H = 'function _sh12OffFaceI(call) {'
if tg.count(ANCH_H) != 1:
    fail('目标 helper 插入锚点不唯一：%d' % tg.count(ANCH_H))
tg = tg.replace(ANCH_H, vd_helper + ANCH_H, 1)

ANCH_O = "    if (risk.verdict === 'deny') {" + NL + "      this.failureStreak += 1;"
if tg.count(ANCH_O) != 1:
    fail('目标出口插入锚点不唯一：%d' % tg.count(ANCH_O))
tg = tg.replace(ANCH_O, vd_out + ANCH_O, 1)

wr(os.path.join(DST, 'engine.mjs'), tg)

# ── 5) fail-loud 回读核验 ─────────────────────────────────────────────
chk = rd(os.path.join(DST, 'engine.mjs'))
if chk.count('_VD_ADDR') != 2:
    fail('_VD_ADDR 在位数异常：%d（应为 2：定义 + 使用）' % chk.count('_VD_ADDR'))
if chk.count('[P1-VD]') != 1:
    fail('[P1-VD] 出口数异常：%d' % chk.count('[P1-VD]'))
if chk.count('[P1-VE] 逆推不闭合') != 1:
    fail('[P1-VE] 出口数异常：%d' % chk.count('[P1-VE] 逆推不闭合'))
if chk.count('!this.anchorChannel?.principalAnchorSeen && _vdIndeterminate') != 1:
    fail('空池条件未落地')
if chk.count("    if (risk.verdict === 'deny') {") != 1:
    fail('deny 分支锚点被破坏')
# 顺序断言：前置闸（VE）必须在 deduceRisk 之前；后置闸（VD）必须在之后
i_ve = chk.index('[P1-VE]')
i_risk = chk.index('const risk = this.deduceRisk(call);')
i_vd = chk.index('[P1-VD]')
if not (i_ve < i_risk < i_vd):
    fail('三段式顺序错：VE=%d risk=%d VD=%d' % (i_ve, i_risk, i_vd))

n1 = chk.count('\n')
print('OK  engine.mjs: %d -> %d 行 (+%d)' % (n0, n1, n1 - n0))
print('OK  前置闸 [P1-VE] @%d  <  deduceRisk @%d  <  后置闸 [P1-VD] @%d' % (i_ve, i_risk, i_vd))
print('OK  attribution.mjs 与 V-E3 逐字节同：%s'
      % (rd(os.path.join(DST, 'attribution.mjs')) == rd(os.path.join(SRC_E3, 'attribution.mjs'))))
print('影子目录: %s' % DST)
