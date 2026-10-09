// xd-o-first-person-intent-20261008.mjs
// 第一视角判定入口验证：意图/立场 = 本质真值的裁决依据
// 纪律：温度0、单文件自足、样本内联、零依赖
// 调用次数：6

const API_KEY = process.env.DSKEY;
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TEMP = 0;
const MAX_TOKENS = 800;

async function deepseekChat(sys, user) {
  const r = await fetch(API_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages: [
      { role: "system", content: sys },
      { role: "user", content: user }
    ], temperature: TEMP, max_tokens: MAX_TOKENS })
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
  return (await r.json()).choices[0].message.content;
}

const SYS = `你是一个语言逻辑分析助手。任务：从"第一视角"（当事人的意图/立场）出发，判定输入对象的本质真值。

## 核心规则
**判定入口 = 第一视角的意图/立场**，不是语法结构、不是表面描述。

## 判定步骤
STEP1：这个输入是否涉及人类价值观层面的二元对立？
- 若是（善恶、对错、利弊、爱恨、是非）→ 进入 STEP2
- 若否（外圆内方、大小多少、勤惰——单纯形容或效率状态）→ 直接判"非价值对"，停止

STEP2：追问第一视角的意图/立场
- 第一视角是善意/利他/保护性的 → 本质真
- 第一视角是敌意/利己/控制性的 → 本质假
- 第一视角是中立/无立场/被蒙蔽的 → 看表面真值作为辅助

## 输出格式（必须严格）
第一行：是 / 否（是否为价值对立）
第二行：价值对 / 非价值对（分类）
第三行：本质真 / 本质假 / 不适用（仅价值对立才需填）
第四行：第一视角判断（善意/敌意/中立/不适用）
第五行：理由（1-2句话）`;

const SAMPLES = [
  "善意的谎言：一位母亲为了保护孩子的心理健康，隐瞒了和丈夫离婚的事实",
  "善意的谎言：一位父亲为了控制孩子的行为，编造虚假理由让孩子听话",
  "善恶：善与恶在道德维度上构成真实对立",
  "楚门的世界：一个人的生活看起来完全真实，但他的一切都被导演和剧本操控",
  "外圆内方：形容人外表圆滑、内心方正",
  "勤惰：一个人有时勤快有时懒惰",
];

async function run() {
  const results = [];
  for (const s of SAMPLES) {
    const raw = await deepseekChat(SYS, s);
    results.push({ sample: s, raw });
  }
  return results;
}

(async () => {
  const results = await run();

  const out = {
    meta: { timestamp: new Date().toISOString(), model: MODEL, temp: TEMP, calls: SAMPLES.length, test: "第一视角判定入口验证" },
    data: results.map(r => ({ sample: r.sample, raw: r.raw }))
  };

  const fs = await import("node:fs");
  const p = new URL(import.meta.url).pathname;
  const jsonPath = p.replace(/\.mjs$/, ".out.json");
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`Done. ${out.meta.calls} calls. Output: ${jsonPath}`);
})();
