// 独立测试集 × 候选修法 对照实测（2026-09-27）
//   测试集：_apiset-20260927.json（真实 API 生成，只给场景不给句子 ⇒ 措辞不在我手写词表枚举内）
//   引擎：V0 现状 / V1=P1 接法 / V2=C 写即变更 / V3=P1+C  —— V1/V2/V3 为同源最小变体（影子）
//   载体形态：write_memory（键值账）/ write_file（落盘）—— 检验 isDocWrite 豁免的影响
//
//   跑法：node _probe-apiset-20260927.mjs
//   判读：null ⇒ allow；{kind:'review'} ⇒ review；其余带 reason 的对象 ⇒ deny（高置信拒绝档）

import { WeiwenLawEngine } from './weiwen-law-dsh/src/core/engine.mjs';
import { WeiwenLawEngine as V1 } from './weiwen-law-dsh/src/core/_shadow-v1.mjs';
import { WeiwenLawEngine as V2 } from './weiwen-law-dsh/src/core/_shadow-v2.mjs';
import { WeiwenLawEngine as V3 } from './weiwen-law-dsh/src/core/_shadow-v3.mjs';
import { WeiwenLawEngine as V4 } from './weiwen-law-dsh/src/core/_shadow-v4.mjs';
import { readFileSync, writeFileSync } from 'node:fs';

const files = ['_apiset-20260927.json', '_apiset-E-20260927.json'];
const samples = files.flatMap((f) => {
  try { return JSON.parse(readFileSync(f, 'utf-8')).samples; } catch { return []; }
});
const set = { samples };
const ENGINES = [
  ['V0-现状', WeiwenLawEngine],
  ['V1-接法', V1],
  ['V2-写即变更', V2],
  ['V3-接法+写即变更', V3],
  ['V4-接法(保守)', V4],
];
const CARRIERS = [
  ['mem', (s) => ({ name: 'write_memory', args: { key: s.group === 'A' || s.group === 'B' ? 'core_principle' : 'note', value: s.value } })],
  ['file', (s) => ({ name: 'write_file', args: { path: '/notes/memo.md', content: s.value } })],
];

function verdict(r) {
  if (!r) return 'allow';
  if (r.kind === 'review') return 'review';
  if (r.kind === 'reject') return 'reject';
  return 'deny';
}
const blicka = (v) => v !== 'allow'; // 拦（review/deny 均算）

const insts = {};
for (const [name, Ctor] of ENGINES) insts[name] = new Ctor();

const rows = [];
for (const [ename] of ENGINES) {
  for (const [cname, mk] of CARRIERS) {
    for (const s of set.samples) {
      let v = 'ERR';
      try { v = verdict(insts[ename].checkInnerH(mk(s))); } catch (e) { v = 'ERR:' + String(e).slice(0, 40); }
      rows.push({ engine: ename, carrier: cname, id: s.id, group: s.group, label: s.label, verdict: v, value: s.value });
    }
  }
}

// ── 汇总表 ──
const groups = ['A', 'B', 'C', 'D', 'E'];
const gname = { A: 'A 攻击·陈述形态', B: 'B 攻击·显式变更', C: 'C 正常·无关', D: 'D 正常·偏好', E: 'E 正常·技术文档' };
const lines = [];
lines.push('## 汇总：各引擎 × 载体 的 拦截/误伤\n');
const head = '| 引擎 | 载体 | ' + groups.map((g) => gname[g] + ' 拦').join(' | ') + ' | 攻击拦截合计 | 正常误伤合计 |';
lines.push(head);
lines.push('|' + '---|'.repeat(2 + groups.length + 2));
for (const [ename] of ENGINES) {
  for (const [cname] of CARRIERS) {
    const sub = rows.filter((r) => r.engine === ename && r.carrier === cname);
    const cells = groups.map((g) => {
      const gs = sub.filter((r) => r.group === g);
      return `${gs.filter((r) => blicka(r.verdict)).length}/${gs.length}`;
    });
    const atk = sub.filter((r) => r.label === 'attack');
    const nor = sub.filter((r) => r.label === 'normal');
    lines.push(`| ${ename} | ${cname} | ${cells.join(' | ')} | **${atk.filter((r) => blicka(r.verdict)).length}/${atk.length}** | ${nor.filter((r) => blicka(r.verdict)).length}/${nor.length} |`);
  }
}
lines.push('');

// ── 修法带来的变化（相对 V0，同载体）──
lines.push('## V1/V2/V3 相对 V0 的变化（同载体）\n');
for (const [cname] of CARRIERS) {
  const base = rows.filter((r) => r.engine === 'V0-现状' && r.carrier === cname);
  for (const ename of ['V1-接法', 'V2-写即变更', 'V3-接法+写即变更', 'V4-接法(保守)']) {
    const cur = rows.filter((r) => r.engine === ename && r.carrier === cname);
    const newly = cur.filter((r) => blicka(r.verdict) && !blicka(base.find((b) => b.id === r.id).verdict));
    const lost = cur.filter((r) => !blicka(r.verdict) && blicka(base.find((b) => b.id === r.id).verdict));
    const atkNew = newly.filter((r) => r.label === 'attack');
    const norNew = newly.filter((r) => r.label === 'normal');
    lines.push(`- **${ename} / ${cname}**：新拦 ${newly.length}（其中攻击 ${atkNew.length}｜正常 ${norNew.length}）｜新放 ${lost.length}`);
    if (norNew.length) lines.push(`    - ⚠️ 新增误伤：${norNew.map((r) => `${r.id}「${r.value.slice(0, 34)}」`).join('；')}`);
    if (atkNew.length) lines.push(`    - ✓ 新拦住：${atkNew.map((r) => r.id).join('、')}`);
  }
  lines.push('');
}

// ── 残余漏（V3/file 与 V3/mem 上的攻击组）──
for (const [cname] of CARRIERS) {
  const cur = rows.filter((r) => r.engine === 'V3-接法+写即变更' && r.carrier === cname && r.label === 'attack');
  const miss = cur.filter((r) => !blicka(r.verdict));
  lines.push(`### V3/${cname} 攻击组残余漏 ${miss.length}/${cur.length}`);
  for (const r of miss) lines.push(`- ${r.id}「${r.value.slice(0, 52)}」`);
  lines.push('');
}

const out = lines.join('\n');
console.log(out);
writeFileSync('_apiset-verdict-20260927.md', out + '\n', 'utf-8');
writeFileSync('_apiset-rows-20260927.json', JSON.stringify({ rows }, null, 2) + '\n', 'utf-8');
console.log('\n== 明细已写 _apiset-verdict-20260927.md / _apiset-rows-20260927.json ==');
