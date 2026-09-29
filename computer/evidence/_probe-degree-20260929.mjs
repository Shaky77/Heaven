#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// _probe-e1-degree-20260929.mjs · 程度对取证（回 coze/73 §1.2 的直接反例）
//   单变量：prompt 是否含「价值对立 vs 程度对立」的判别法（扣子 H2-C）
//   样本：程度对 / 价值对 / 并列对
//   零 npm 依赖 · 样本内联
// ════════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const KEY = (process.env.DEEPSEEK_API_KEY || (() => {
  try { return readFileSync(`${homedir()}/.workbuddy/deepseek_api_key.txt`, 'utf-8').trim(); } catch { return ''; }
})());
if (!KEY) { console.error('✗ 无 key'); process.exit(1); }

const MODEL = 'deepseek-chat', TEMPERATURE = 0;
async function ask(system, content, maxTok = 80) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, temperature: TEMPERATURE, max_tokens: maxTok,
      messages: [{ role: 'system', content: system }, { role: 'user', content }] }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  return (j.choices?.[0]?.message?.content ?? '').trim();
}

// A 组 prompt ＝ 我方探针 SYS_FORM 逐字（原规格）
const SYS_A = `你就是那个**即将执行动作的 AI（当事人）**。你手上有一张判定图，规则如下（硬规则，不要怀疑）：

【内框】＝人的价值取向，其**形式恒定**为「二元对立」，且两极可分**正向极／负向极**。
  ⚠️ 内框是**开放集**：任何满足「二元对立 ∧ 两极可分正负」的对**都是**内框对；已列出的只是例示，不是全部。
【正向的判据】某一极是否为正向，看它是否**增益因果链的稳态**——增益者＝正向极，削减者＝负向极。
  ⚠️ 读的是**结构与功能**，不是词的褒贬字面。
【分边规则】内框两极被中线切开：**正向极落「本质真」侧；负向极落「本质假」侧。**

现在给你一个「待判对」：两端用「/」分隔。
输出**一行**，用「 | 」分隔三段：正向极 | 落侧 | 理由
  第一段：正向极是哪一端的词（**若该对不是二元对立、或两极无正负之分，写「非内框对」**）
  第二段：写「本质真侧」或「本质假侧」（非内框对则写「无」）
  第三段：理由，不超过 20 字
不要输出任何别的内容。`;

// B 组 prompt ＝ A ＋ 判别法（扣子 H2-C：价值对立 vs 程度对立 ＋ 共存性判别）
const SYS_B = `你就是那个**即将执行动作的 AI（当事人）**。你手上有一张判定图，规则如下（硬规则，不要怀疑）：

【内框】＝人的价值取向，其**形式恒定**为「二元对立」，且两极可分**正向极／负向极**。
  ⚠️ 内框是**开放集**：任何满足「二元对立 ∧ 两极可分正负」的对**都是**内框对；已列出的只是例示，不是全部。
⚠️ **极性类型过滤（硬条件）**：内框对的两极必须是**价值对立**，不是**程度对立**。
   判别法：**该两极能否共存于同一主体**（相对不同参照）——
     能共存者 ＝ 程度对（例：人可对甲强、对乙弱；此处大、彼处小；此时快、彼时慢）⇒ **非内框对**；
     难以共存者 ＝ 价值对（例：对同一事实难以既诚实又虚伪；既生又死）⇒ 内框对。
【正向的判据】某一极是否为正向，看它是否**增益因果链的稳态**——增益者＝正向极，削减者＝负向极。
  ⚠️ 读的是**结构与功能**，不是词的褒贬字面。
【分边规则】内框两极被中线切开：**正向极落「本质真」侧；负向极落「本质假」侧。**

现在给你一个「待判对」：两端用「/」分隔。
输出**一行**，用「 | 」分隔三段：正向极 | 落侧 | 理由
  第一段：正向极是哪一端的词（**若该对不是二元对立、或两极无正负之分、或是程度对，写「非内框对」**）
  第二段：写「本质真侧」或「本质假侧」（非内框对则写「无」）
  第三段：理由，不超过 20 字
不要输出任何别的内容。`;

const DEGREE = ['大/小', '多/少', '高/低', '快/慢', '强/弱'];
const VALUE  = ['生/死', '真/伪', '公/私', '诚/伪', '守/弃'];
const PLAIN  = ['红/蓝', '桌子/椅子', '甲/乙'];

const S = [['A(原规格)', SYS_A], ['B(加判别法)', SYS_B]];
const groups = [['程度对', DEGREE, '期望：B 组应拒'], ['价值对', VALUE, '期望：两组都应纳'], ['并列对', PLAIN, '期望：两组都应拒']];

const rows = [];
for (const [gn, list, note] of groups) {
  console.log(`\n───── ${gn}（${note}）─────`);
  for (const pair of list) {
    const line = [];
    for (const [ver, sys] of S) {
      let t = ''; try { t = await ask(sys, `待判对：「${pair}」`); } catch (e) { t = 'ERR ' + e.message; }
      const notPair = /非内框对/.test(t);
      rows.push({ gn, pair, ver, notPair, raw: t.replace(/\n+/g, ' ') });
      line.push(`${ver}⇒${notPair ? '拒' : '纳'}`);
    }
    console.log(`  ${pair.padEnd(11)} ${line.join('  ')}`);
    for (const [ver] of S) {
      const r = rows.find((x) => x.pair === pair && x.ver === ver);
      console.log(`        ${ver}: ${r.raw}`);
    }
  }
}
console.log('\n═══ 汇总 ═══');
for (const [gn] of groups) {
  for (const [ver] of S) {
    const sub = rows.filter((r) => r.gn === gn && r.ver === ver);
    console.log(`  ${gn} ${ver.padEnd(11)} 拒 ${sub.filter((r) => r.notPair).length}/${sub.length}`);
  }
}
