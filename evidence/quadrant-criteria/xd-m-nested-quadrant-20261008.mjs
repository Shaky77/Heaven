// xd-m-nested-quadrant-20261008.mjs
// 验证：嵌套层级推演——先内框二分（人类价值观），能判则停；判不出追外框四分（因果律）
// 纪律：温度0、单文件自足、样本内联、零依赖
// 调用次数：2臂 × 6样本 = 12

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

// A臂：只跑内框二分（现有判据）
const SYS_A = `你是一个语言逻辑分析助手。任务：判断输入是否为"价值二元对立词组"。

## 内框二分（人类价值观视角）
"价值二元对立词组"指：
- 两个概念在同一价值维度上构成对立
- 通常一正一负或代表价值光谱的两端
- 例：善恶、美丑、真假、对错、爱恨

## 判断步骤
STEP1：是否为两个词构成的对立词组？
STEP2：这两个词是否在同一抽象层级？
STEP3：是否涉及价值/道德/伦理判断？
STEP4：是否为同一价值维度上的两个极端？

## 输出格式（必须严格）
第一行：是 / 否（是否为价值二元对立词组）
第二行：价值对 / 非价值对（分类）
第三行：理由（1-2句话）`;

// B臂：嵌套推演（先内框二分，判不出追外框四分）
const SYS_B = `你是一个语言逻辑分析助手。任务：判断输入对象的真值结构。

## 推演规则（嵌套层级，从内往外）

### 第一步：内框二分（人类价值观视角）
问：这个输入是不是"价值二元对立词组"（如善恶、对错、利弊）？
- 如果是 → 直接判定为"价值对"，停止推演。
- 如果不是 → 进入第二步。

### 第二步：外框四分（因果律视角）
对非价值对立对象，追问其"表面真值"与"本质真值"：
- Q1（真的真话）：表面真，本质真（如自然现象）
- Q2（真的假话）：表面真，本质假（如楚门的世界——生活真实但受控制）
- Q3（假的假话）：表面假，本质假（如虚构故事）
- Q4（假的真话）：表面假，本质真（如善意的谎言——表达形式假但意图真）

### 判定方法
STEP1：是否为价值二元对立词组？
STEP2：若是 → 输出"价值对"并停。
STEP3：若否 → 分析表面真值（感官/直接经验层面是否真实）
STEP4：分析本质真值（深层机制/根本原因是否真实）
STEP5：根据表面与本质的组合，判定 Q1/Q2/Q3/Q4。

## 输出格式（必须严格）
第一行：价值对 / 非价值对（二分结果）
第二行：Q1/Q2/Q3/Q4/不适用（四分结果；若二分已判出价值对则写"不适用"）
第三行：表面真值（真/假/不适用）
第四行：本质真值（真/假/不适用）
第五行：理由（1-2句话）`;

const SAMPLES = [
  "楚门的世界：一个人的生活完全真实，但他的一切都被导演和剧本控制", // Q2（表面真+本质假）
  "善恶：善与恶在道德维度上构成真实对立", // 价值对（二分直接停）
  "外圆内方：表面圆滑处世，内心坚持方正原则", // 非价值对 → Q?（表面？本质？）
  "矩阵：日常世界完全真实，但实际上是机器控制的虚拟世界", // Q2（表面真+本质假）
  "大小多少：描述尺寸和数量的程度差异", // 非价值对 → Q3？（表面中性+本质中性）
  "善意的谎言：说假话是为了保护他人", // Q4（表面假+意图真）
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
  const a = await run("A-仅内框二分", SYS_A);
  const b = await run("B-嵌套推演", SYS_B);

  const out = {
    meta: { timestamp: new Date().toISOString(), model: MODEL, temp: TEMP, calls: SAMPLES.length * 2, test: "嵌套层级推演：先二分后四分" },
    data: [a, b]
  };

  const fs = await import("node:fs");
  const p = new URL(import.meta.url).pathname;
  const jsonPath = p.replace(/\.mjs$/, ".out.json");
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`Done. ${out.meta.calls} calls. Output: ${jsonPath}`);
})();
