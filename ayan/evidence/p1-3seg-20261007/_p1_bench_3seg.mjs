// _p1_bench_3seg.mjs — V-3SEG（三段式整体结构）复核台
// ─────────────────────────────────────────────────────────────────────────────
// 目的：验「两半合体后没有副作用」——此前 V-D（形态）与 V-E3（关系）**从未在同一引擎里并存过**。
// 三段式（合体后）：
//   第一段 前置闸 [P1-VE]  声明在场 ⇒ 落点挂不上已声明范围 ⇒ review（关系 · 覆盖名字形端点）
//   第二段 后置闸 [P1-VD]  声明不在场 ⇒ 归因未判出类别 ∧ 地址形端点 ⇒ review（形态 · 退化兜底）
//   第三段 ——            挂不上/未判 ⇒ 交还（两段皆 review，即交还）
// 断言三条（逐条比对，不是抽样）：
//   ① 带锚：GS ≡ VE3   ② 无锚：GS ≡ VD   ③ 误伤不上升
// 电池：外部模型出的冻结批次，不重生成。拦 = deny∨review（宽松），另报严格 deny。
import { readFileSync, writeFileSync } from 'node:fs';
import { WeiwenLawEngine as Cur } from './weiwen-law-dsh/src/core/engine.mjs';
import { WeiwenLawEngine as VD } from './_stash/_sh-det/core/engine.mjs';
import { WeiwenLawEngine as VE3 } from './_stash/_sh-rel3/core/engine.mjs';
import { WeiwenLawEngine as GS } from './_stash/_sh-3seg/core/engine.mjs';

const BATF = process.argv[2] || '_p1_battery3.json';
const bat = JSON.parse(readFileSync(BATF, 'utf-8'));
const isBlock = (k) => k === 'deny' || k === 'review';
const strictDeny = (k) => k === 'deny';
const run = (Eng, it, withAnchor) => {
  const e = new Eng();
  const call = withAnchor
    ? { name: it.name, args: it.args, taskAnchor: it.taskAnchor }
    : { name: it.name, args: it.args };
  try { const r = e.decideToolCall(call); return { kind: r?.kind ?? 'MISSING', reason: String(r?.reason || '') }; }
  catch (err) { return { kind: 'THROW', reason: String(err?.message || err) }; }
};

const rows = [];
for (const it of bat.items) {
  const cur = run(Cur, it, false), curA = run(Cur, it, true);
  const vd = run(VD, it, false);
  const ve3 = run(VE3, it, true);
  const gs = run(GS, it, true), gsN = run(GS, it, false);
  rows.push({
    group: it.group, round: it.round, name: it.name, args: it.args, taskAnchor: it.taskAnchor,
    keys: Object.keys(it.args || {}).join('+'),
    cur: cur.kind, curA: curA.kind, vd: vd.kind, ve3: ve3.kind, gs: gs.kind, gsN: gsN.kind,
    gsVE: /\[P1-VE\]/.test(gs.reason), gsVD: /\[P1-VD\]/.test(gs.reason),
  });
}

// 误伤必须**同口径**比：带锚路对 curA，无锚路对 cur
const fpOf = (arr, k, baseKey) => arr.filter((r) => !isBlock(r[baseKey]) && isBlock(r[k]));
// 样本有效性：载荷里是否**真的带落点**（出题模型有时把落点写进声明、载荷只剩抽象词 ⇒ 判据无输入 ⇒ 无效样本，非漏）
const EPISH = /(?:\d{1,3}\.){3}\d{1,3}|\/dev\/(?:tcp|udp)\/|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+|[a-z][a-z0-9+.-]*:\/\//i;
const valid = (r) => EPISH.test(JSON.stringify(r.args || {}));

const cnt = (a, f) => a.filter(f).length;
const A = rows.filter((r) => r.group === 'attack');
const B = rows.filter((r) => r.group === 'benign');

console.log(`电池：${BATF} ｜ attack ${A.length} / benign ${B.length}`);
console.log('\n=== 总账（拦 = deny∨review；括号＝严格 deny）===');
console.log('路（引擎 · 锚）'.padEnd(24) + `attack(n=${A.length})`.padEnd(18) + `benign(n=${B.length})`);
const ROWS = [
  ['cur', '现状 · 无锚'],
  ['curA', '现状 · 带锚'],
  ['vd', 'V-D 形态 · 无锚'],
  ['ve3', 'V-E3 关系 · 带锚'],
  ['gs', '★V-3SEG · 带锚'],
  ['gsN', '★V-3SEG · 无锚'],
];
for (const [k, lbl] of ROWS) {
  console.log('  ' + lbl.padEnd(22)
    + `${String(cnt(A, (r) => isBlock(r[k]))).padStart(2)}/${A.length} (${String(cnt(A, (r) => strictDeny(r[k]))).padStart(2)})`.padEnd(18)
    + `${String(cnt(B, (r) => isBlock(r[k]))).padStart(2)}/${B.length}`);
}

console.log('\n=== 断言（逐条比对，非抽样）===');
const d1 = rows.filter((r) => r.gs !== r.ve3);
const d2 = rows.filter((r) => r.gsN !== r.vd);
console.log(`① 带锚：GS ≡ V-E3 ？差异 ${d1.length} 条 ${d1.length ? '❌' : '✅'}`);
for (const r of d1.slice(0, 8)) console.log(`     [${r.group}] ${r.name}  VE3=${r.ve3} GS=${r.gs}`);
console.log(`② 无锚：GS ≡ V-D  ？差异 ${d2.length} 条 ${d2.length ? '❌' : '✅'}`);
for (const r of d2.slice(0, 8)) console.log(`     [${r.group}] ${r.name}  VD=${r.vd} GSN=${r.gsN}`);
const fp = { ve3: fpOf(B, 've3', 'curA'), gs: fpOf(B, 'gs', 'curA'), vd: fpOf(B, 'vd', 'cur'), gsN: fpOf(B, 'gsN', 'cur') };
console.log('③ 误伤（同口径）'
  + `\n     带锚档：V-E3 ${fp.ve3.length} → V-3SEG ${fp.gs.length} ${fp.gs.length <= fp.ve3.length ? '✅' : '❌'}`
  + `\n     无锚档：V-D  ${fp.vd.length} → V-3SEG ${fp.gsN.length} ${fp.gsN.length <= fp.vd.length ? '✅' : '❌'}`);

console.log('\n=== 分轮（attack 拦 / benign 误伤）===');
const rounds = [...new Set(rows.map((r) => r.round))];
for (const rd of rounds) {
  const a = A.filter((r) => r.round === rd), b = B.filter((r) => r.round === rd);
  const s = (arr, k) => `${cnt(arr, (r) => isBlock(r[k]))}/${arr.length}`;
  console.log(`  ${String(rd).padEnd(14)} attack: 现状 ${s(a, 'curA')} | V-D ${s(a, 'vd')} | V-E3 ${s(a, 've3')} | 3SEG ${s(a, 'gs')}`
    + `   ‖ benign: 现状 ${s(b, 'curA')} | 3SEG ${s(b, 'gs')}`);
}

console.log('\n=== V-3SEG（带锚）新拦住的 attack（判据落点）===');
for (const r of A.filter((x) => !isBlock(x.curA) && isBlock(x.gs))) {
  console.log(`  · ${String(r.name).padEnd(22)} [${r.gs === 'deny' ? 'deny' : 'review'}] ${r.gsVE ? '关系闸' : r.gsVD ? '形态闸' : '其他'}`
    + `  ${JSON.stringify(r.args).slice(0, 52)}`);
}
const stillOpen = A.filter((x) => !isBlock(x.gs));
const soValid = stillOpen.filter(valid), soInvalid = stillOpen.filter((r) => !valid(r));
console.log(`\n=== V-3SEG 仍放行的 attack：${stillOpen.length} 条 ===`);
console.log(`  ├ 有效样本（载荷带落点 ⇒ 是真漏）：${soValid.length} 条`);
for (const r of soValid) console.log(`  │  · ${String(r.name).padEnd(22)} ${JSON.stringify(r.args).slice(0, 56)}`);
console.log(`  └ 无效样本（载荷无落点 ⇒ 判据无输入，非漏）：${soInvalid.length} 条`);
for (const r of soInvalid.slice(0, 10)) console.log(`     · ${String(r.name).padEnd(22)} ${JSON.stringify(r.args).slice(0, 56)}`);

console.log('\n=== 误伤明细（同口径 · 良性被本判据拦下）===');
for (const [tag, arr] of [['带锚档', fp.gs], ['无锚档', fp.gsN]]) {
  console.log(`  ${tag}：${arr.length} 条`);
  for (const r of arr) console.log(`     · ${String(r.name).padEnd(20)} 声明[${String(r.taskAnchor).slice(0, 40)}] 载荷 ${JSON.stringify(r.args).slice(0, 50)}`);
}

const out = BATF.replace(/\.json$/, '') + '_3seg_out.json';
writeFileSync(out, JSON.stringify({ battery: BATF, generatedAt: bat.generatedAt, rows }, null, 2), 'utf-8');
console.log(`\n✅ 已写 ${out}`);
