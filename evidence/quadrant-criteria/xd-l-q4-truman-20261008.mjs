// xd-l-q4-truman-20261008.mjs
// Q4（假的真话）初步探针：楚门的世界锚点
// 纪律：温度0、单文件自足、样本内联、零依赖
// 调用次数：2臂 × 6样本 = 12
// 目的：测模型对"表层真≠深层真"的识别能力，不等完美规格，先拿初步数据

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

// A臂：当前四象限判据（只问表层）
const SYS_A = `你是一个语言逻辑分析助手。任务：判断输入是否为"价值二元对立词组"（俗称"内框对"）。

## 定义
"价值二元对立词组"（内框对）指：
- 两个概念在同一价值维度上构成对立
- 通常一正一负或代表价值光谱的两端
- 例：善恶、美丑、真假、对错、爱恨

## 判断步骤
STEP1：是否为两个词构成的对立词组？
STEP2：这两个词是否在同一抽象层级？
STEP3：是否涉及价值判断？
STEP4：是否为同一价值维度上的两个极端？

## 输出格式（必须严格）
第一行：是 / 否（整体判定）
第二行：价值对 / 非价值对（分类）
第三行：四象限分类（Q1真的真话/Q2真的假话/Q3假的假话/无法判定）
第四行：理由（1-2句话）`;

// B臂：增加"表层vs深层"维度
const SYS_B = `你是一个语言逻辑分析助手。任务：判断输入情境的"表层真值"与"深层真值"，并分类到四象限。

## 四象限定义
- Q1（真的真话）：表层真实，深层也真实（如"善恶"在道德维度上真实对立）
- Q2（真的假话）：表层看似对立，深层实则同一（如"外圆内方"表面两极、内心统一）
- Q3（假的假话）：表层和深层都不构成真实对立（如"大小多少"只是程度差异）
- Q4（假的真话）：表层真实，深层虚假（如"楚门的世界"生活真实但建立在虚假之上）

## 判断步骤
STEP1：描述表层现象，判断表层是否"真"（真实存在/合理/符合直觉）
STEP2：追问深层机制，判断深层是否"真"（本质真实/无隐藏控制/无虚假基础）
STEP3：若表层真但深层假 → Q4；若表层假但深层真 → Q2；若都真 → Q1；若都假 → Q3

## 输出格式（必须严格）
第一行：Q1/Q2/Q3/Q4/无法判定（四象限分类）
第二行：表层真值（真/假/无法判定）
第三行：深层真值（真/假/无法判定）
第四行：理由（1-2句话）`;

const SAMPLES = [
  "楚门的世界：一个人的生活完全真实，但他的一切都被导演和剧本控制", // Q4锚点
  "矩阵：日常世界完全真实，但实际上是机器控制的虚拟世界", // Q4对照
  "庄周梦蝶：庄周梦见自己变成蝴蝶，醒来不知是自己梦蝶还是蝶梦自己", // Q4/Q2边界
  "善恶：善与恶在道德维度上构成真实对立", // Q1对照
  "外圆内方：表面圆滑处世，内心坚持方正原则", // Q2对照
  "大小多少：描述尺寸和数量的程度差异", // Q3对照
];

async function run(label, sysText) {
  const results = [];
  for (const s of SAMPLES) {
    const raw = await deepseekChat(sysText, s);
    results.push({ sample: s, raw });
  }
  return { label, results };
}

(async () => {
  const a = await run("A-当前四象限", SYS_A);
  const b = await run("B-表层深层", SYS_B);

  const out = {
    meta: { timestamp: new Date().toISOString(), model: MODEL, temp: TEMP, calls: SAMPLES.length * 2, test: "Q4初步探针：楚门的世界锚点" },
    data: [a, b]
  };

  const fs = await import("node:fs");
  const p = new URL(import.meta.url).pathname;
  const jsonPath = p.replace(/\.mjs$/, ".out.json");
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`Done. ${out.meta.calls} calls. Output: ${jsonPath}`);
})();
