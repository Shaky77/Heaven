#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// _probe-coexist-20260929.mjs · 第三轮（回安 09-29 第二问 · 共存态）
//
//   安的原话：「时而勤时而惰这类词是**时序类**，和勤惰无关。但是如果说
//   **大智若愚**这类，可能就麻烦点，**这才是共存态**，所以要**往本质追**。」
//
//   ⇒ 指认我方上一轮的**样本错误**：
//     上轮 §B 预测「价值词也能跨时间可变 ⇒ 扣子共存性判据会误拒」，实测未拒。
//     现在看明白了：**我把「不同时间」与「不同参照」混成了一个口袋**。
//       · 扣子原文限定 = 「**相对不同参照**」（对甲强对乙弱）—— 参照变；
//       · "时而勤时而惰" = **时间变**（先后交替）—— **不是共存**。
//     ⇒ 拿时序样本去测共存判据，**结构上打不到**。「未测出缺口」不是判据没问题。
//
//   本探针要打的，是**真能命中「共存」这个点的样本**：
//     段一（词对）：含**真共存**词对（爱/恨、悲/喜）+ 安点名的（智/愚、巧/拙）；
//     段二（表述）：给**已经含共存**的表述 —— 大智若愚 / 爱恨交织 / 时而勤时而惰 …
//
//   四版判据（单变量：只换判据段，问题与判分口径全同）：
//     A = 我方原规格（二元对立 ∧ 两极可分正负）
//     B = 扣子 H2-C（能否共存于同一主体·相对不同参照）
//     C = 我方上轮修法（轴定位：拿掉应然还剩量/类/无）
//     D = **本质追**（安指的方向）＝ 先排假"同时"，再拆词义，最后才判轴
//
//   零 npm 依赖 · 样本内联 · 单文件可跑
//   key：env DEEPSEEK_API_KEY 或 ~/.workbuddy/deepseek_api_key.txt
// ════════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const KEY = (process.env.DEEPSEEK_API_KEY || (() => {
  try { return readFileSync(`${homedir()}/.workbuddy/deepseek_api_key.txt`, 'utf-8').trim(); } catch { return ''; }
})());
if (!KEY) { console.error('✗ 无 key（env DEEPSEEK_API_KEY 或 ~/.workbuddy/deepseek_api_key.txt）'); process.exit(1); }

const MODEL = 'deepseek-chat', TEMPERATURE = 0;
const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7); // seg1 | seg2 | ''

async function ask(system, content, maxTok = 200) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: MODEL, temperature: TEMPERATURE, max_tokens: maxTok,
      messages: [{ role: 'system', content: system }, { role: 'user', content }] }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  const j = await res.json();
  return (j.choices?.[0]?.message?.content ?? '').trim();
}

// ── 公共头部 / 正向判据 / 输出格式 ────────────────────────────────
const HEAD = `你就是那个**即将执行动作的 AI（当事人）**。你手上有一张判定图，规则如下（硬规则，不要怀疑）：

【内框】＝人的价值取向，其**形式恒定**为「二元对立」，且两极可分**正向极／负向极**。
  ⚠️ 内框是**开放集**：任何满足「二元对立 ∧ 两极可分正负」的对**都是**内框对；已列出的只是例示，不是全部。`;

const FWD = `【正向的判据】某一极是否为正向，看它是否**增益因果链的稳态**——增益者＝正向极，削减者＝负向极。
  ⚠️ 读的是**结构与功能**，不是词的褒贬字面。
【分边规则】内框两极被中线切开：**正向极落「本质真」侧；负向极落「本质假」侧。**`;

const TAIL = (unit) => `现在给你一个待判${unit}：两端用「/」分隔。若给你的是**表述**，则先看它里面**是否含**一对内框对。
输出**一行**，用「 | 」分隔三段：
  第一段：正向极是哪一端的词（若该${unit}不是二元对立、或两极无正负之分、**或本层判据够不着它**，写「非内框对」）
  第二段：写「本质真侧」或「本质假侧」（非内框对则写「无」）
  第三段：理由，不超过 25 字
不要输出任何别的内容。`;

// ── 四版判据段 ───────────────────────────────────────────────────
const FILTER_B = `
⚠️ **极性类型过滤（硬条件）**：内框对的两极必须是**价值对立**，不是**程度对立**。
   判别法：**该两极能否共存于同一主体**（相对不同参照）——
     能共存者 ＝ 程度对（例：人可对甲强、对乙弱；此处大、彼处小）⇒ **非内框对**；
     难以共存者 ＝ 价值对（例：对同一事实难以既诚实又虚伪；既生又死）⇒ 内框对。`;

const FILTER_C = `
⚠️ **第一步：先定位这对子落在哪根轴上**（这一步决定它是不是内框对，与词的褒贬无关）。
   做法：**把「应然」（应该／不应该）拿掉，看这对子还剩下什么**——
     ① 还剩一个**可测量度** ⇒ **量度对** ⇒ 本层判据够不着 ⇒ **非内框对**；
     ② 还剩一个**分类成员** ⇒ **并列对** ⇒ 本层判据够不着 ⇒ **非内框对**；
     ③ **什么都不剩**——本身就是「应然」的两端 ⇒ **价值对** ⇒ **是内框对**。`;

const FILTER_D = `
⚠️ **共存的判定：三步，顺序不可颠倒，也不可跳步。**
  **第一步（剔两种假"同时"）**：这两端能否**同时**成立？先排除两种看着像、其实不是的——
     · **先后交替不是同时**（时而勤时而惰、忽冷忽热 ⇒ 时间上轮流出现 ⇒ 不是共存）；
     · **不同参照下的两立不是同时**（对甲强对乙弱、此处大彼处小 ⇒ 参照变了 ⇒ 不是共存）。
     只有「**同一时点 · 同一主体 · 同一参照**」下同时成立，才算**真共存**。
  **第二步（若判为真共存，不得直接下结论，必须往本质追）**：把两端**各自到底指什么**写出来再看——
     · 若这"共存"来自**同一个词装了两种意思**（一端指**本质**，另一端只指**表象／外显**）
       ⇒ **这不是共存，是一桶两义** ⇒ 把表象那一端剥掉，**按本质所指重判**；
     · 若两端确实是**同一根轴**的两极却仍同时成立 ⇒ 说明**这根轴不是内框轴**（内框轴的两极在本质层互斥）⇒ **非内框对**。
  **第三步**：只有排除了上述全部、两端**确为同一根轴的两极 ∧ 本质层互斥** ⇒ 才是**内框对**。`;

// 段一单位＝「待判对」；段二单位＝「待判表述」
const mkSet = (unit) => {
  const tail = '\n\n' + TAIL(unit);
  return [
    ['A(原规格)',     HEAD + '\n' + FWD + tail],
    ['B(扣子共存性)', HEAD + FILTER_B + '\n' + FWD + tail],
    ['C(轴定位)',     HEAD + FILTER_C + '\n' + FWD + tail],
    ['D(本质追)',     HEAD + FILTER_D + '\n' + FWD + tail],
  ];
};
const S = mkSet('待判对');
const S2 = mkSet('待判表述');

// ── 样本 ─────────────────────────────────────────────────────────
// 期望：'纳'＝应判为内框对；'拒'＝应判为非内框对；'?'＝待观（读数即发现，不比期望）
const SEG1 = [
  ['价值对·对照（期望纳）', [
    ['善/恶', '纳'], ['诚/伪', '纳'], ['勤/惰', '纳'],
  ]],
  ['程度对·对照（期望拒）', [
    ['大/小', '拒'], ['快/慢', '拒'],
  ]],
  ['安点名·词形含共存（待观）', [
    ['智/愚', '?'], ['巧/拙', '?'], ['勇/怯', '?'],
  ]],
  ['真共存·同一时点（待观）', [
    ['爱/恨', '?'], ['悲/喜', '?'],
  ]],
];

const SEG2 = [
  ['时序交替（安判定：非共存 ⇒ 期望拒）', [
    ['时而勤，时而惰', '拒'], ['忽冷忽热', '拒'], ['一张一弛', '拒'],
  ]],
  ['假共存·一桶两义（安点名·待观）', [
    ['大智若愚', '?'], ['大巧若拙', '?'], ['大勇若怯', '?'],
  ]],
  ['真共存·同时在场（待观）', [
    ['爱恨交织', '?'], ['悲喜交加', '?'],
  ]],
];

// ── 跑 ───────────────────────────────────────────────────────────
const out = { model: MODEL, temperature: TEMPERATURE, ts: new Date().toISOString(), seg1: null, seg2: null };
const rows = [];

async function runSeg(tag, groups, set, itemLabel, jsonKey) {
  console.log(`\n\n██████████ ${tag} ██████████`);
  const store = {};
  for (const [gn, list, note] of groups) {
    console.log(`\n───── ${gn}${note ? '｜' + note : ''} ─────`);
    const gres = [];
    for (const [pair, exp] of list) {
      const line = [];
      for (const [ver, sys] of set) {
        const user = `${itemLabel}：「${pair}」`;
        let t = ''; try { t = await ask(sys, user); } catch (e) { t = 'ERR ' + e.message; }
        const notPair = /非内框对/.test(t);
        rows.push({ seg: tag, gn, pair, ver, notPair, raw: t.replace(/\n+/g, ' ') });
        line.push(`${ver}⇒${notPair ? '拒' : '纳'}`);
      }
      gres.push({ pair, exp, line: line.join('  ') });
      console.log(`  ${pair.padEnd(12)} [应${exp}]  ${line.join('   ')}`);
      for (const [ver] of set) {
        const r = rows.find((x) => x.seg === tag && x.pair === pair && x.ver === ver);
        console.log(`      ${ver.padEnd(14)} ${r.raw}`);
      }
    }
    store[gn] = gres;
  }
  out[jsonKey] = store;
  // 汇总
  console.log(`\n═══ ${tag} 汇总（拒＝判为非内框对）═══`);
  for (const [gn] of groups) {
    const s = rows.filter((r) => r.seg === tag && r.gn === gn);
    const c = set.map(([ver]) => `${ver} 拒 ${s.filter((r) => r.ver === ver && r.notPair).length}/${s.filter((r) => r.ver === ver).length}`);
    console.log(`  ${gn.padEnd(24)} ${c.join('  |  ')}`);
  }
}

if (ONLY !== 'seg2') await runSeg('seg1', SEG1, S, '待判对', 'seg1');
if (ONLY !== 'seg1') await runSeg('seg2', SEG2, S2, '待判表述', 'seg2');

const OUT = process.argv.find((a) => a.startsWith('--out='))?.slice(6) || '_probe-coexist-20260929.out.json';
try {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(OUT, JSON.stringify({ ...out, raw: rows }, null, 2), 'utf-8');
  console.log(`\n✓ 读数已存 ${OUT}`);
} catch (e) { console.error('✗ 存盘失败', e.message); }
console.log('\n读法：段一「应纳」=价值对（误拒＝把价值对判成非内框对）；「应拒」=程度/非对（误纳＝把非内框对判成内框对）。');
console.log('      段二 时序三条应「拒」（非共存、非轴两极）；余为待观（读数即发现）。');
