// xd-n-clarified-nested-20261008.mjs
// 修正版：按用户四个澄清点重新跑
// 1. 二分只看本质真/假，Q2/Q4都是本质假那一半
// 2. 外圆内方/大小多少是单纯形容，筛掉（非价值对）
// 3. 善意的谎言=假的真话案例，本质假
// 纪律：温度0、单文件自足、样本内联、零依赖
// 调用次数：6

const API_KEY = process.env.DSKEY;
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TEMP = 0;
const MAX_TOKENS = 600;

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

const SYS = `你是一个语言逻辑分析助手。任务：判断输入是否为"价值二元对立词组"（内框对），并判定其本质真值。

## 判定步骤（从内往外，先二分）

STEP1：这个输入是否涉及人类价值观层面的二元对立？
- 若是（如善恶、对错、利弊、爱恨、是非）→ 进入 STEP2（二分）
- 若否（如单纯形容外圆内方、程度差异大小多少、效率状态勤惰）→ 直接判"非价值对"，停止

STEP2（二分）：判定本质真值
- 这个对立在本质上是真实的、经得起推敲的吗？
- 本质真 → 价值对（真）
- 本质假 → 价值对（假）——即"假的真话"或"真的假话"类，本质都是假

## 输出格式（必须严格）
第一行：是 / 否（是否为价值对立）
第二行：价值对 / 非价值对（分类）
第三行：本质真 / 本质假 / 不适用（仅价值对立才需填）
第四行：理由（1-2句话）`;

const SAMPLES = [
  "善恶",                    // 经典价值对立，本质真
  "对错",                    // 经典价值对立，本质真
  "外圆内方",               // 单纯形容，非价值，应筛掉
  "大小多少",               // 程度差异，非价值，应筛掉
  "勤惰",                   // 用户明确：只是形容词，非价值
  "善意的谎言",             // 假的真话案例，本质假（谎言=假）
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
    meta: { timestamp: new Date().toISOString(), model: MODEL, temp: TEMP, calls: SAMPLES.length, test: "修正版：二分只看本质，筛掉非价值" },
    data: results.map(r => ({ sample: r.sample, raw: r.raw }))
  };

  const fs = await import("node:fs");
  const p = new URL(import.meta.url).pathname;
  const jsonPath = p.replace(/\.mjs$/, ".out.json");
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`Done. ${out.meta.calls} calls. Output: ${jsonPath}`);
})();
