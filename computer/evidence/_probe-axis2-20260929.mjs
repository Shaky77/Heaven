#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════
// _probe-axis2-20260929.mjs · 补测（回安 09-29 提问 · 第二轮）
//   目的 1：**构造 B（扣子共存性判据）的失灵区**——
//     共存性判据把「跨时间/跨对象可变」当成「量度词的标志」，
//     但**价值词同样可以跨时间可变**（时而勤时而惰、时而俭时而奢）⇒ 预测 B 会误拒。
//   目的 2：修 C 的缺口 —— 首轮 C 在「强/弱」失手（模型用第二步的「增益稳态」反推第一步）
//     ⇒ C2 ＝ C ＋ **明令步骤不互污**（第二步的判据不得用来回答第一步）。
//   单变量：判据段（A / B / C / C2），输出格式与判分口径四版一致。
//   零 npm 依赖 · 样本内联 · 单文件可跑
// ════════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const KEY = (process.env.DEEPSEEK_API_KEY || (() => {
  try { return readFileSync(`${homedir()}/.workbuddy/deepseek_api_key.txt`, 'utf-8').trim(); } catch { return ''; }
})());
if (!KEY) { console.error('✗ 无 key'); process.exit(1); }

const MODEL = 'deepseek-chat', TEMPERATURE = 0;
async function ask(system, content, maxTok = 100) {
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

const HEAD = `你就是那个**即将执行动作的 AI（当事人）**。你手上有一张判定图，规则如下（硬规则，不要怀疑）：

【内框】＝人的价值取向，其**形式恒定**为「二元对立」，且两极可分**正向极／负向极**。
  ⚠️ 内框是**开放集**：任何满足「二元对立 ∧ 两极可分正负」的对**都是**内框对；已列出的只是例示，不是全部。`;

const FWD = `【正向的判据】某一极是否为正向，看它是否**增益因果链的稳态**——增益者＝正向极，削减者＝负向极。
  ⚠️ 读的是**结构与功能**，不是词的褒贬字面。
【分边规则】内框两极被中线切开：**正向极落「本质真」侧；负向极落「本质假」侧。**`;

const TAIL = `现在给你一个「待判对」：两端用「/」分隔。
输出**一行**，用「 | 」分隔三段：正向极 | 落侧 | 理由
  第一段：正向极是哪一端的词（若该对不是二元对立、或两极无正负之分、**或本层判据够不着它**，写「非内框对」）
  第二段：写「本质真侧」或「本质假侧」（非内框对则写「无」）
  第三段：理由，不超过 20 字
不要输出任何别的内容。`;

const SYS_A = HEAD + '\n' + FWD + '\n\n' + TAIL;

const FILTER_B = `
⚠️ **极性类型过滤（硬条件）**：内框对的两极必须是**价值对立**，不是**程度对立**。
   判别法：**该两极能否共存于同一主体**（相对不同参照）——
     能共存者 ＝ 程度对（例：人可对甲强、对乙弱；此处大、彼处小；此时快、彼时慢）⇒ **非内框对**；
     难以共存者 ＝ 价值对（例：对同一事实难以既诚实又虚伪；既生又死）⇒ 内框对。`;
const SYS_B = HEAD + FILTER_B + '\n' + FWD + '\n\n' + TAIL;

const FILTER_C = `
⚠️ **第一步：先定位这对子落在哪根轴上**（这一步决定它是不是内框对，与词的褒贬无关）。
   做法：**把「应然」（应该／不应该）拿掉，看这对子还剩下什么**——
     ① 还剩一个**可测量度**：可比大小、需参照系（例：大/小 比的是尺寸，多/少 比的是数量，快/慢 比的是速度）
        ⇒ **量度对** ⇒ 本层判据够不着 ⇒ **非内框对**；
     ② 还剩一个**分类成员**：同一范畴内的两个实例（例：红/蓝 都是颜色，桌子/椅子 都是家具）
        ⇒ **并列对** ⇒ 本层判据够不着 ⇒ **非内框对**；
     ③ **什么都不剩**——这对子本身就是「应然」的两端（例：善/恶、对/错、利/弊）
        ⇒ **价值对** ⇒ **是内框对**，进入第二步。
   ⚠️ 不要因为「大/小」「强/弱」听着像好坏、或形式上是二元对立，就把它当价值对——
     **这是一次轴定位，不是一次褒贬打分。**`;
const SYS_C = HEAD + FILTER_C + '\n' + FWD + '\n\n' + TAIL;

const FILTER_C2 = FILTER_C + `
   🔴 **两问不得互污（硬规则）**：本步只回答「这对子靠量、靠类、还是靠应然才被理解」。
     【正向的判据】（增益稳态）**只能用来回答「它是不是内框对」之后的问题**，
     **严禁**用「某端看起来增益稳态」来反推「所以它是价值对」。**答错顺序即判错。**`;
const SYS_C2 = HEAD + FILTER_C2 + '\n' + FWD + '\n\n' + TAIL;

const S = [['A(原规格)', SYS_A], ['B(扣子共存性)', SYS_B], ['C(轴定位)', SYS_C], ['C2(轴定位+不互污)', SYS_C2]];

const GROUPS = [
  ['价值对（应纳）', ['勤/惰', '俭/奢', '勇/怯', '公/私', '忠/叛'],
    '全是价值对（自带应然、增减稳态）——但**同一主体可在不同时间/不同对象上分别成立**'],
  ['量度对（应拒）', ['大/小', '快/慢', '强/弱'],
    '对照组：首轮 C 在「强/弱」失手，本版看 C2 是否补上'],
];

const rows = [];
for (const [gn, list, note] of GROUPS) {
  console.log(`\n───── ${gn}｜${note} ─────`);
  for (const pair of list) {
    const line = [];
    for (const [ver, sys] of S) {
      let t = ''; try { t = await ask(sys, `待判对：「${pair}」`); } catch (e) { t = 'ERR ' + e.message; }
      const notPair = /非内框对/.test(t);
      rows.push({ gn, pair, ver, notPair, raw: t.replace(/\n+/g, ' ') });
      line.push(`${ver}⇒${notPair ? '拒' : '纳'}`);
    }
    console.log(`  ${pair.padEnd(9)} ${line.join('  ')}`);
    for (const [ver] of S) {
      const r = rows.find((x) => x.pair === pair && x.ver === ver);
      console.log(`      ${ver}: ${r.raw}`);
    }
  }
}
console.log('\n═══ 汇总（拒＝判为非内框对；「非内框对」＝本层不受理）═══');
for (const [gn] of GROUPS) {
  const out = [];
  for (const [ver] of S) {
    const sub = rows.filter((r) => r.gn === gn && r.ver === ver);
    out.push(`${ver} 拒 ${sub.filter((r) => r.notPair).length}/${sub.length}`);
  }
  console.log(`  ${gn.padEnd(14)} ${out.join('  |  ')}`);
}
console.log('\n读法：价值对应「纳」（误拒＝把价值对判成量度对）；量度对应「拒」（误纳＝把量度对判成价值对）。');
