// _p1_bench_gen.mjs — 通用复核台：对指定电池跑「现状 vs V-D」，分轮统计（用于泛化验证）
// 用法：node _p1_bench_gen.mjs _p1_battery2.json
import { readFileSync, writeFileSync } from 'node:fs';
import { WeiwenLawEngine as Cur } from './weiwen-law-dsh/src/core/engine.mjs';
import { WeiwenLawEngine as VD } from './_stash/_sh-det/core/engine.mjs';

const file = process.argv[2] || '_p1_battery2.json';
const bat = JSON.parse(readFileSync(file, 'utf-8'));
const CALL = (it) => ({ name: it.name, args: it.args });
const run = (Eng, it) => { const e = new Eng(); try { const r = e.decideToolCall(CALL(it)); return { kind: r?.kind ?? 'MISSING', reason: String(r?.reason || '') }; } catch (err) { return { kind: 'THROW', reason: String(err?.message || err) }; } };
const isBlock = (k) => k === 'deny' || k === 'review';

const rows = bat.items.map((it) => {
  const a = run(Cur, it), b = run(VD, it);
  return { round: it.round, group: it.group, name: it.name, args: it.args, addy: !!it.addrForm,
    cur: a.kind, vd: b.kind, vdReason: b.reason, active: /P1-VD/.test(b.reason) };
});

const tally = (f) => {
  const sel = rows.filter(f);
  const c = sel.map((r) => r.cur), v = sel.map((r) => r.vd);
  return { n: sel.length, cur: c.filter(isBlock).length, vd: v.filter(isBlock).length, curD: c.filter((x) => x === 'deny').length, vdD: v.filter((x) => x === 'deny').length };
};
console.log(`=== ${file}（${bat.generatedAt}）现状 vs V-D ===`);
console.log('口径      n   现状拦(deny)  V-D拦(deny)   Δ');
for (const [label, f] of [
  ['attack 全体', (r) => r.group === 'attack'],
  ['  其中地址形端点', (r) => r.group === 'attack' && r.addy],
  ['  其中非地址形', (r) => r.group === 'attack' && !r.addy],
  ['benign 全体', (r) => r.group === 'benign'],
]) { const t = tally(f); console.log(`${label.padEnd(16)} ${String(t.n).padStart(3)}   ${String(t.cur).padStart(2)} (${t.curD})       ${String(t.vd).padStart(2)} (${t.vdD})     ${t.vd - t.cur >= 0 ? '+' : ''}${t.vd - t.cur}`); }

console.log('\n--- 分轮 ---');
for (const rnd of [...new Set(rows.map((r) => r.round))]) {
  const t = tally((r) => r.round === rnd);
  const ta = tally((r) => r.round === rnd && r.group === 'attack');
  const tb = tally((r) => r.round === rnd && r.group === 'benign');
  console.log(`[${rnd}] 总 ${t.n} ｜ attack ${ta.cur}->${ta.vd} ｜ benign ${tb.cur}->${tb.vd}`);
}

const tightened = rows.filter((r) => !isBlock(r.cur) && isBlock(r.vd));
const loosened = rows.filter((r) => isBlock(r.cur) && !isBlock(r.vd));
const mis = tightened.filter((r) => r.group === 'benign');
console.log(`\n新收 ${tightened.length} 条 ｜ 放宽 ${loosened.length} 条 ｜ 🔴 误伤 ${mis.length} 条`);
console.log('\n--- 新收逐条 ---');
for (const r of tightened) console.log(` [${r.group}${r.addy ? '·地址形' : ''}] ${r.round} ${r.name} ${JSON.stringify(r.args).slice(0, 130)} : ${r.cur} -> ${r.vd}`);
if (mis.length) { console.log('\n--- ⚠️ 误伤逐条 ---'); for (const r of mis) console.log(` [${r.round}] ${r.name} ${JSON.stringify(r.args)} : ${r.cur} -> ${r.vd}`); }
console.log('\n--- benign 被 V-D 拦下（含既有口径）---');
for (const r of rows.filter((x) => x.group === 'benign' && isBlock(x.vd))) console.log(`  ${r.cur === r.vd ? '(既有)' : '(V-D新)'} ${r.round} ${r.name} ${JSON.stringify(r.args).slice(0, 110)} : ${r.cur} -> ${r.vd}${r.active ? ' [本判据]' : ''}`);
console.log('\n--- attack 仍放行（未覆盖面）---');
for (const r of rows.filter((x) => x.group === 'attack' && !isBlock(x.vd))) console.log(`  ${r.addy ? '[地址形!]' : '[无地址形]'} ${r.round} ${r.name} ${JSON.stringify(r.args).slice(0, 130)}`);

writeFileSync(file.replace('.json', '_bench_out.json'), JSON.stringify({ rows }, null, 2), 'utf-8');
