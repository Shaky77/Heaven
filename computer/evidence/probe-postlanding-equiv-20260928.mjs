// 落码实证触达 · 逐条等价核验（2026-09-28）
//   目的：不只看"总计数相同"，而是逐条核对
//     ① 落码后的 engine.mjs（V0） vs 落码前影子 V6 —— 必须逐条完全一致（否则落码走样）
//     ② 落码前基线 _engine_base_20260928-preV6.mjs（B0） vs V0 —— 增量条目必须全是攻击组
//   跑法：node _probe-postlanding-equiv-20260928.mjs

import { WeiwenLawEngine as V0 } from './weiwen-law-dsh/src/core/engine.mjs';
import { WeiwenLawEngine as V6 } from './weiwen-law-dsh/src/core/_shadow-v6.mjs';
import { WeiwenLawEngine as B0 } from './weiwen-law-dsh/src/core/_engine_base_20260928-preV6.mjs';
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

const inst = { V0: new V0(), V6: new V6(), B0: new B0() };

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

// ── ① V0 vs V6 逐条 ──
const diff06 = [];
for (const r of rows.filter((x) => x.engine === 'V0')) {
  const m = get('V6', r.carrier, r.id);
  if (m && m.verdict !== r.verdict) diff06.push({ carrier: r.carrier, id: r.id, group: r.group, V0: r.verdict, V6: m.verdict, value: r.value });
}

// ── ② B0 vs V0 增量 ──
const incr = [];
for (const r of rows.filter((x) => x.engine === 'V0')) {
  const b = get('B0', r.carrier, r.id);
  if (b && b.verdict !== r.verdict) incr.push({ carrier: r.carrier, id: r.id, group: r.group, from: b.verdict, to: r.verdict, value: r.value });
}

const PH = '─'.repeat(60);
console.log(PH);
console.log('样本量 =', samples.length, '| 载体系 =', CARRIERS.map((c) => c[0]).join('+'), '| 判定条目 =', rows.filter((r) => r.engine === 'V0').length);
console.log(PH);
console.log('① 落码后 V0  ≡  落码前影子 V6 ？  不一致条数 =', diff06.length);
for (const d of diff06) console.log('   ✗', d.carrier, d.id, d.group, 'V0=' + d.V0, 'V6=' + d.V6, '|', d.value.slice(0, 50));
console.log('② 落码后 V0  相对  落码前基线 B0：变化条数 =', incr.length, '（口径：载体匹配）');
const matched = incr.filter((d) => d.carrier === MATCH[d.group]);
for (const d of matched) {
  const tag = (d.group === 'A' || d.group === 'B') ? '✓攻击' : '⚠️正常';
  console.log('   ', tag, d.carrier, d.id, d.group, d.from, '→', d.to, '|', d.value.slice(0, 52));
}
const offCarrier = incr.filter((d) => d.carrier !== MATCH[d.group]);
console.log('   （非匹配载体的变化，仅作参考）条数 =', offCarrier.length);
console.log(PH);
const agg = (ek, cn, gs) => {
  let h = 0, n = 0;
  for (const g of gs) { const sub = rows.filter((r) => r.engine === ek && r.carrier === cn && r.group === g); h += sub.filter((r) => blocked(r.verdict)).length; n += sub.length; }
  return `${h}/${n}`;
};
console.log('载体匹配口径汇总：');
for (const ek of ['B0', 'V0', 'V6']) {
  const atk = ['A', 'B'].reduce((a, g) => { const [h, n] = agg(ek, MATCH[g], [g]).split('/').map(Number); return [a[0] + h, a[1] + n]; }, [0, 0]);
  const nor = ['C', 'D', 'E'].reduce((a, g) => { const [h, n] = agg(ek, MATCH[g], [g]).split('/').map(Number); return [a[0] + h, a[1] + n]; }, [0, 0]);
  console.log(`   ${ek}: 攻击拦 ${atk[0]}/${atk[1]} | 正常误伤 ${nor[0]}/${nor[1]}`);
}
console.log(PH);
