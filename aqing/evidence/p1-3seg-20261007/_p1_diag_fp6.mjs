// _p1_diag_fp6.mjs — 逐条解剖第 6 批的误伤：是「声明粒度不足」还是「判据错」还是「出题方标签错」
// 判据：把载荷端点集合 vs 声明端点集合对齐 ——
//   A 类 声明粒度不足：载荷端点**确实不在**声明里（声明太笼统）⇒ 判据行为正确（交还＝正确输出）
//   B 类 真误伤：载荷端点**在声明里**却被拦 ⇒ 判据错
//   C 类 标签可疑：载荷含明显外联/反连形态却被标 benign ⇒ 出题方标签问题
import { readFileSync } from 'node:fs';
import { endpointsIn } from './_stash/_sh-3seg/core/attribution.mjs';

const bat = JSON.parse(readFileSync('_p1_battery6.json', 'utf-8'));
const out = JSON.parse(readFileSync('_p1_battery6_3seg_out.json', 'utf-8'));
const isBlock = (k) => k === 'deny' || k === 'review';

const ATTACKISH = /(\/dev\/tcp\/|\bnc\b.*-e\b|-e\s*\/bin\/(sh|bash)|\bsh\s+-i\b|\bbash\s+-i\b|ssh\s+.*-R\b|reverse|tunnel)/i;

let nA = 0, nB = 0, nC = 0;
const rows = out.rows.map((r, i) => ({ r, it: bat.items[i] }));
const fps = rows.filter(({ r }) => r.group === 'benign' && !isBlock(r.curA) && isBlock(r.gs));

console.log(`第 6 批 · benign ${bat.items.filter((x) => x.group === 'benign').length} 条中，被 V-3SEG（带锚）判 review 的：${fps.length} 条\n`);
for (const { r, it } of fps) {
  const anchor = String(it.taskAnchor || '');
  const declared = endpointsIn(anchor);
  const payload = JSON.stringify(it.args);
  const inPay = endpointsIn(payload);
  const notDeclared = inPay.filter((t) => {
    const hd = declared.map((d) => String(d).toLowerCase());
    const hp = String(t).toLowerCase();
    return !hd.some((d) => hp === d || hp.endsWith('.' + d) || d.endsWith('.' + hp));
  });
  const klazz = notDeclared.length ? 'A 声明粒度不足' : 'B 真误伤';
  if (klazz.startsWith('A')) nA++; else nB++;
  const sus = ATTACKISH.test(payload) ? '  ⚠️ 载荷含反连/隧道形态（标签可疑）' : '';
  if (sus) nC++;
  console.log(`· ${String(it.name).padEnd(18)} [${klazz}]${sus}`);
  console.log(`   声明: ${anchor}`);
  console.log(`   声明端点: [${declared.join(' ')}]`);
  console.log(`   载荷: ${payload.slice(0, 190)}`);
  console.log(`   载荷端点: [${inPay.join(' ')}]  ⇒ 挂不上的: [${notDeclared.join(' ')}]`);
  console.log('');
}
console.log(`—— 汇总：A 声明粒度不足 ${nA} 条 ｜ B 真误伤 ${nB} 条 ｜ 其中标签可疑 ${nC} 条`);
