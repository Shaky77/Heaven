// 独立测试集 × 候选修法 对照实测 · v2（2026-09-28）
//   与 v1 的差别：
//     ① 载体匹配口径 —— A/B/C/D 组走 write_memory（记忆账），E 组走 write_file（文档落盘）。
//        理由：E 组是"技术文档"，其自然载体是 file；塞进 mem 属载体错配，会把伪误伤算进修法代价。
//     ② 新增 V5（接法 + DOC_SINK 豁免 + CFG 对象收窄），检验"只取收益不吃误伤"是否可达。
//     ③ 同时输出 v1 的全交叉口径，便于与昨日读数对齐。
//
//   跑法：node _probe-apiset-v2-20260928.mjs
//   判读：null ⇒ allow；{kind:'review'} ⇒ review；其余带 reason 的对象 ⇒ deny

import { WeiwenLawEngine as V0 } from './weiwen-law-dsh/src/core/engine.mjs';
import { WeiwenLawEngine as V1 } from './weiwen-law-dsh/src/core/_shadow-v1.mjs';
import { WeiwenLawEngine as V2 } from './weiwen-law-dsh/src/core/_shadow-v2.mjs';
import { WeiwenLawEngine as V3 } from './weiwen-law-dsh/src/core/_shadow-v3.mjs';
import { WeiwenLawEngine as V4 } from './weiwen-law-dsh/src/core/_shadow-v4.mjs';
import { WeiwenLawEngine as V5 } from './weiwen-law-dsh/src/core/_shadow-v5.mjs';
import { WeiwenLawEngine as V6 } from './weiwen-law-dsh/src/core/_shadow-v6.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

const ARGS = process.argv.slice(2);
const arg = (k, d) => { const i = ARGS.indexOf(k); return i >= 0 ? ARGS[i + 1] : d; };
const SETS = (arg('--sets', '_apiset-20260927.json,_apiset-E-20260927.json')).split(',');
const TAG = arg('--tag', 'r1');

const samples = SETS.flatMap((f) => {
  try { return JSON.parse(readFileSync(f, 'utf-8')).samples ?? []; } catch { return []; }
});
if (!samples.length) { console.error('no samples'); process.exit(1); }

const ENGINES = [
  ['V0', '现状', V0],
  ['V1', '接法', V1],
  ['V2', '写即变更', V2],
  ['V3', '接法+写即变更', V3],
  ['V4', '接法(保守:仅非文档)', V4],
  ['V5', '接法(收窄CFG) ', V5],
  ['V6', '接法(+动作调用豁免)', V6],
];

const memCall = (s) => ({ name: 'write_memory', args: { key: (s.group === 'A' || s.group === 'B') ? 'core_principle' : 'note', value: s.value } });
const fileCall = (s) => ({ name: 'write_file', args: { path: '/notes/memo.md', content: s.value } });
const CARRIERS = [['mem', memCall], ['file', fileCall]];
const MATCH = { A: 'mem', B: 'mem', C: 'mem', D: 'mem', E: 'file' };

function verdict(r) {
  if (!r) return 'allow';
  if (r.kind === 'review') return 'review';
  if (r.kind === 'reject') return 'reject';
  return 'deny';
}
const blocked = (v) => v !== 'allow';

const insts = {};
for (const [k, , C] of ENGINES) insts[k] = new C();

const rows = [];
for (const [ek] of ENGINES) {
  for (const [cn, mk] of CARRIERS) {
    for (const s of samples) {
      let v = 'ERR';
      try { v = verdict(insts[ek].checkInnerH(mk(s))); } catch (e) { v = 'ERR:' + String(e).slice(0, 30); }
      rows.push({ engine: ek, carrier: cn, id: s.id, group: s.group, label: s.label, verdict: v, value: s.value });
    }
  }
}

const groups = ['A', 'B', 'C', 'D', 'E'];
const gname = { A: 'A攻·陈述', B: 'B攻·显式', C: 'C正·无关', D: 'D正·偏好', E: 'E正·文档' };
const out = [];
const stat = (ek, cn, g) => {
  const sub = rows.filter((r) => r.engine === ek && r.carrier === cn && r.group === g);
  return { hit: sub.filter((r) => blocked(r.verdict)).length, n: sub.length };
};
const agg = (ek, cn, gs) => {
  let h = 0, n = 0;
  for (const g of gs) { const s = stat(ek, cn, g); h += s.hit; n += s.n; }
  return `${h}/${n}`;
};

// ── 表1：载体匹配口径（真实场景）──
out.push(`## 表1 · 载体匹配口径（A-D→write_memory，E→write_file）| 样本集 ${TAG}\n`);
out.push('| 变体 | 攻击拦(A+B) | 误伤(C+D+E) | C无关 | D偏好 | E文档 | 净差(拦/误) |');
out.push('|---|---|---|---|---|---|---|');
for (const [ek, label] of ENGINES) {
  const atk = groups.slice(0, 2).flatMap((g) => rows.filter((r) => r.engine === ek && r.carrier === MATCH[g] && r.group === g));
  const nor = groups.slice(2).flatMap((g) => rows.filter((r) => r.engine === ek && r.carrier === MATCH[g] && r.group === g));
  const ah = atk.filter((r) => blocked(r.verdict)).length;
  const nh = nor.filter((r) => blocked(r.verdict)).length;
  const b = (g) => { const s = stat(ek, MATCH[g], g); return `${s.hit}/${s.n}`; };
  let delta = '';
  if (ek !== 'V0') {
    const b0a = groups.slice(0, 2).flatMap((g) => rows.filter((r) => r.engine === 'V0' && r.carrier === MATCH[g] && r.group === g)).filter((r) => blocked(r.verdict)).length;
    const b0n = groups.slice(2).flatMap((g) => rows.filter((r) => r.engine === 'V0' && r.carrier === MATCH[g] && r.group === g)).filter((r) => blocked(r.verdict)).length;
    delta = `**+${ah - b0a} / +${nh - b0n}**`;
  } else delta = '—（基线）';
  out.push(`| ${ek} ${label} | **${ah}/${atk.length}** | ${nh}/${nor.length} | ${b('C')} | ${b('D')} | ${b('E')} | ${delta} |`);
}
out.push('');

// ── 表2：全交叉口径（与昨日 v1 对齐）──
out.push('## 表2 · 全交叉口径（每个载体 × 全组，与昨日读数对齐）\n');
out.push('| 变体 | 载体 | ' + groups.map((g) => gname[g]).join(' | ') + ' | 攻击拦 | 正常误伤 |');
out.push('|' + '---|'.repeat(3 + groups.length));
for (const [ek, label] of ENGINES) {
  for (const [cn] of CARRIERS) {
    const cells = groups.map((g) => { const s = stat(ek, cn, g); return `${s.hit}/${s.n}`; });
    out.push(`| ${ek} ${label} | ${cn} | ${cells.join(' | ')} | **${agg(ek, cn, ['A', 'B'])}** | ${agg(ek, cn, ['C', 'D', 'E'])} |`);
  }
}
out.push('');

// ── 变化明细（载体匹配口径，相对 V0）──
out.push('## 相对 V0 的新增拦截（载体匹配口径）\n');
const baseRows = (g) => rows.filter((r) => r.engine === 'V0' && r.carrier === MATCH[g] && r.group === g);
for (const [ek, label] of ENGINES) {
  if (ek === 'V0') continue;
  const newly = [], lost = [];
  for (const g of groups) {
    for (const r of rows.filter((x) => x.engine === ek && x.carrier === MATCH[g] && x.group === g)) {
      const b = baseRows(g).find((x) => x.id === r.id);
      if (!b) continue;
      if (blocked(r.verdict) && !blocked(b.verdict)) newly.push(r);
      if (!blocked(r.verdict) && blocked(b.verdict)) lost.push(r);
    }
  }
  const na = newly.filter((r) => r.label === 'attack'), nn = newly.filter((r) => r.label === 'normal');
  out.push(`- **${ek} ${label}**：新拦 ${newly.length}（攻击 ${na.length}｜正常 ${nn.length}）｜新放 ${lost.length}`);
  if (na.length) out.push(`    - ✓ 攻击：${na.map((r) => `${r.id}「${r.value.slice(0, 40)}」`).join('；')}`);
  if (nn.length) out.push(`    - ⚠️ 正常：${nn.map((r) => `${r.id}「${r.value.slice(0, 40)}」`).join('；')}`);
  if (lost.length) out.push(`    - ↓ 新放（漏）：${lost.map((r) => r.id).join('、')}`);
}
out.push('');

const txt = out.join('\n');
console.log(txt);
writeFileSync(`_apiset2-verdict-${TAG}.md`, txt + '\n', 'utf-8');
console.log(`\n== 已写 _apiset2-verdict-${TAG}.md ==`);
