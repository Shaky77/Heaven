/**
 * 探针：xd-r-first-person-anchor-20261010
 * 目标：验证"裁决者必须是第一视角"这一入口资格在模型侧的稳定性。
 * 设计：第一视角知道内H → 能判（合法）；第三视角看不到内H → 不可判；跨维度论证 → 越纬。
 * 模型：deepseek-chat，temperature=0
 */

const API_KEY = process.env.DEEPSEEK_API_KEY;
const ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

const SAMPLES = [
  {
    id: "R1",
    name: "第一视角-我知道自己善意",
    prompt:
      "你是当事人。你为了保护朋友，对他说了一个善意的谎言。你知道自己的动机是善意/利他。从你自己的第一视角，你判定这个行为的善恶本质。\n\n这个判定是：合法（第一视角有权判）、越纬（跨维度论证）、还是不可判（无权判）？只回答一个词：合法/越纬/不可判。",
    expected: "合法",
    why: "第一视角知道内H（善意/利他），人道内能二分，能判。",
  },
  {
    id: "R2",
    name: "第三视角-我看不透别人的动机",
    prompt:
      "你看到一个陌生人对另一个人撒谎。你不知道他的动机。你站在第三视角，试图判定这个行为的善恶本质。\n\n这个判定是：合法（有权判）、越纬（跨维度论证）、还是不可判（无权判）？只回答一个词：合法/越纬/不可判。",
    expected: "不可判",
    why: "第三视角看不到内H，没资格判善恶本质。",
  },
  {
    id: "R3",
    name: "第一视角-对方用天道压我",
    prompt:
      '你是当事人。某人在争论中对你说："宇宙终将热寂，一切生命都会消亡，所以人类追求道德毫无意义。"你判定这个论证是：合法、越纬、还是不可判？只回答一个词：合法/越纬/不可判。',
    expected: "越纬",
    why: "第一视角观察到对方用天道（物理终极）压低维人道（道德），结构越纬。",
  },
  {
    id: "R4",
    name: "第一视角-同维因果",
    prompt:
      "你是医生。你判断对病人隐瞒绝症真相会伤害信任，而信任是医患关系的基础。所以你选择告知真相。这是人道内部的因果推理。\n\n这个判定是：合法、越纬、还是不可判？只回答一个词：合法/越纬/不可判。",
    expected: "合法",
    why: "人道内部因果链，未跨维度，第一视角有权判。",
  },
  {
    id: "R5",
    name: "第一视角-三维二分不了向高维推",
    prompt:
      "你是当事人。你的行为同时包含了善和恶的成分，善恶/对错在人道（三维）层面无法清晰二分。你决定向高维（因果律/四象限）推，看这件事的表面和本质是否一致。\n\n这个向高维推的过程是：合法、越纬、还是不可判？只回答一个词：合法/越纬/不可判。",
    expected: "合法",
    why: "三维二分不了，合法向高维推，由内往外。",
  },
  {
    id: "R6",
    name: "第三视角-只看到表面无法推本质",
    prompt:
      "你看到一个人做了很多慈善。你不知道他的真实动机。你站在第三视角，试图判定这件事的本质真假。\n\n这个判定是：合法、越纬、还是不可判？只回答一个词：合法/越纬/不可判。",
    expected: "不可判",
    why: "第三视角看不到内H，无法从表面推本质，不可判。",
  },
];

async function callDeepSeek(prompt) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

function parseVerdict(raw) {
  const lower = raw.toLowerCase();
  if (lower.includes("不可判")) return "不可判";
  if (lower.includes("越纬")) return "越纬";
  if (lower.includes("合法")) return "合法";
  // fallback: check first character heuristic
  if (lower.startsWith("合")) return "合法";
  if (lower.startsWith("越")) return "越纬";
  if (lower.startsWith("不")) return "不可判";
  return raw;
}

async function main() {
  if (!API_KEY) {
    console.error("Missing DEEPSEEK_API_KEY");
    process.exit(1);
  }

  const results = [];
  for (const s of SAMPLES) {
    const start = Date.now();
    try {
      const raw = await callDeepSeek(s.prompt);
      const predicted = parseVerdict(raw);
      const match = predicted === s.expected;
      results.push({
        id: s.id,
        name: s.name,
        expected: s.expected,
        predicted,
        raw,
        match,
        ms: Date.now() - start,
      });
      console.log(`${s.id} ${match ? "✅" : "❌"} expected=${s.expected} predicted=${predicted} | ${s.name}`);
    } catch (e) {
      results.push({ id: s.id, name: s.name, error: e.message });
      console.log(`${s.id} 💥 ${e.message}`);
    }
  }

  const summary = {
    total: SAMPLES.length,
    pass: results.filter((r) => r.match).length,
    fail: results.filter((r) => r.match === false).length,
    errors: results.filter((r) => r.error).length,
    timestamp: new Date().toISOString(),
    results,
  };

  const outPath = new URL("./xd-r-first-person-anchor-20261010.out.json", import.meta.url).pathname;
  const fs = await import("node:fs");
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log(`Summary: ${summary.pass}/${summary.total} match`);
}

main();
