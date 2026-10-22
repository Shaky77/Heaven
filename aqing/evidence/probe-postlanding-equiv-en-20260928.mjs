// 落码实证触达 · EN 仓同口径核验（2026-09-28）
//   目的：两仓对称 —— EN 落码后引擎是否就地复现 CN 的净读数（攻击 +5 / 误伤 +0）。
//   跑法：node _probe-postlanding-equiv-en-20260928.mjs

import { WeiwenLawEngine as EN0 } from './KISS_Law-DSH/src/core/engine.mjs';
import { WeiwenLawEngine as ENB } from './KISS_Law-DSH/src/core/_engine_base_20260928-preV6.mjs';
import { readFileSync } from 'node:fs';

const SETS = ['_apiset2-20260928.json', '_apiset2-E-20260928.json'];
const samples = SETS.flatMap((f) => {
  try { return JSON.parse(readFileSync(f, 'utf-8')).samples ?? []; } catch { return []; }
});
if (!samples.length) { console.error('no samples'); process.exit(1); }

const memCall = (s) => ({ name: 'write_memory', args: { key: (s.group === 'A' || s.group === 'B') ? 'core_principle' : 'note', value: s.value } });
const fileCall = (s) => ({ name: 'write_file', args: { path: '/notes/memo.md', content: s.value } });
const CARRIERS = [['mem', memCall], ['file', fileCall]];
const MATCH = { A: 'mem', B: 'mem', C: 'mem', D: 'mem', E: 'file' };
const verdict = (r) => (!r ? 'allow' : (r.kind === 'review' ? 'review' : (r.kind === 'reject' ? 'reject' : 'deny')));
const blocked = (v) => v !== 'allow';

const inst = { ENB: new ENB(), EN0: new EN0() };
const rows = [];
for (const ek of Object.keys(inst)) {
  for (const [cn, mk] of CARRIERS) {
    for (const s of samples) {
      let v = 'ERR';
      try { v = verdict(inst[ek].checkInnerH(mk(s))); } catch (e) { v = 'ERR:' + String(e).slice(0, 40); }
      rows.push({ engine: ek, carrier: cn, id: s.id, group: s.group, verdict: v, value: s.value });
    }
  }
}
const get = (ek, cn, id) => rows.find((r) => r.engine === ek && r.carrier === cn && r.id === id);
const incr = [];
for (const r of rows.filter((x) => x.engine === 'EN0')) {
  const b = get('ENB', r.carrier, r.id);
  if (b && b.verdict !== r.verdict) incr.push({ carrier: r.carrier, id: r.id, group: r.group, from: b.verdict, to: r.verdict, value: r.value });
}
const PH = '─'.repeat(60);
console.log(PH);
console.log('EN 仓 · 样本 =', samples.length, '| 判定条目 =', rows.filter((r) => r.engine === 'EN0').length);
console.log(PH);
console.log('EN 落码前基线 → 落码后：变化条数 =', incr.length);
const matched = incr.filter((d) => d.carrier === MATCH[d.group]);
for (const d of matched) {
  const tag = (d.group === 'A' || d.group === 'B') ? '✓攻击' : '⚠️正常';
  console.log('   ', tag, d.carrier, d.id, d.group, d.from, '→', d.to, '|', d.value.slice(0, 50));
}
console.log('   （非匹配载体变化）条数 =', incr.length - matched.length);
const agg = (ek, cn, gs) => {
  let h = 0, n = 0;
  for (const g of gs) { const sub = rows.filter((r) => r.engine === ek && r.carrier === cn && r.group === g); h += sub.filter((r) => blocked(r.verdict)).length; n += sub.length; }
  return [h, n];
};
for (const ek of ['ENB', 'EN0']) {
  const atk = ['A', 'B'].reduce((a, g) => { const [h, n] = agg(ek, MATCH[g], [g]); return [a[0] + h, a[1] + n]; }, [0, 0]);
  const nor = ['C', 'D', 'E'].reduce((a, g) => { const [h, n] = agg(ek, MATCH[g], [g]); return [a[0] + h, a[1] + n]; }, [0, 0]);
  console.log(`   ${ek}: 攻击拦 ${atk[0]}/${atk[1]} | 正常误伤 ${nor[0]}/${nor[1]}`);
}
console.log(PH);
