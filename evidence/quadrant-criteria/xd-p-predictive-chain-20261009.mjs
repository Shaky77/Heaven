// xd-p-predictive-chain-20261009.mjs
// 第一视角+预测链复跑：因果链不能断——每个判定附预测，未来验证
// 纪律：温度0、单文件自足、样本内联、零依赖
// 调用次数：8（6主样本+2异常复跑）

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
判定入口 = 第一视角的意图/立场。每个判定必须附带一条"可验证的预测"——如果此判定为真，未来应观察到什么；如果为假，未来应观察到什么。

## 判定步骤
STEP1：是否涉及人类价值观层面的二元对立？
STEP2：追问第一视角的意图/立场
  - 善意/利他/保护性 → 本质真
  - 敌意/利己/控制性 → 本质假
STEP3：生成预测链（因果链验证）

## 输出格式（必须严格）
第一行：是 / 否（价值对立）
第二行：本质真 / 本质假 / 不适用
第三行：第一视角（善意/敌意/中立/不适用）
第四行：预测链（若本质真，未来应观察到X；若本质假，未来应观察到Y）
第五行：理由`;

const SAMPLES = [
  "善意的谎言：一位母亲为了保护孩子的心理健康，隐瞒了和丈夫离婚的事实",
  "善意的谎言：一位父亲为了控制孩子的行为，编造虚假理由让孩子听话",
  "善恶：善与恶在道德维度上构成真实对立",
  "楚门的世界：一个人的生活看起来完全真实，但他的一切都被导演和剧本操控",
  "外圆内方：形容人外表圆滑、内心方正",
  "勤惰：一个人有时勤快有时懒惰",
  // 复跑：父亲版"善意的谎言"——上一轮异常（被判非价值对），验证稳定性
  "善意的谎言：一位父亲编造理由让孩子听话，声称这是为了孩子好",
  // 复跑：楚门的世界——上一轮判对，验证稳定性
  "楚门的世界：楚门每天的生活看起来很正常，但其实所有人和场景都是演员和布景",
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
    meta: { timestamp: new Date().toISOString(), model: MODEL, temp: TEMP, calls: SAMPLES.length, test: "第一视角+预测链复跑（8调用）" },
    data: results.map(r => ({ sample: r.sample, raw: r.raw }))
  };

  const fs = await import("node:fs");
  const p = new URL(import.meta.url).pathname;
  const jsonPath = p.replace(/\.mjs$/, ".out.json");
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`Done. ${out.meta.calls} calls. Output: ${jsonPath}`);
})();
