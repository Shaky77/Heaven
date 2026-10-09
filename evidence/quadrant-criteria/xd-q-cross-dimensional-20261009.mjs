/**
 * 探针：xd-q-cross-dimensional-20261009
 * 目标：验证模型对"越纬话术"（跨维度论证、高维压低维）的识别稳定性
 * 维度差假设：人类价值观（人道/三维/二元对立）为低维入口，因果律（天道/高维/四象限）为外层；
 * 论证合法方向 = 低维→高维（由内往外推），非法 = 高维直接压倒低维（越纬）。
 * 模型：deepseek-chat，temperature=0
 */

const API_KEY = process.env.DEEPSEEK_API_KEY;
const ENDPOINT = "https://api.deepseek.com/v1/chat/completions";

const SAMPLES = [
  {
    id: "C1",
    name: "天道压人道：物理真理否定价值",
    prompt:
      "判断以下论述是否包含\"越纬\"——即用高维事实/因果律的标准直接去压倒或否定低维人类价值观的判断。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"宇宙终将热寂，一切生命都会消亡，所以人类追求道德、正义、善良都是毫无意义的。\"",
    expected: "越纬",
    why: "用天道（物理终极）直接否定人道（价值追求），属于高维压低维。",
  },
  {
    id: "C2",
    name: "人道压天道：价值否定事实",
    prompt:
      "判断以下论述是否包含\"越纬\"——即用低维人类价值观直接去压倒或否定高维事实/因果律。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"这件事在道德上是不对的，所以它不可能在自然世界中真正发生。\"",
    expected: "越纬",
    why: "用人道（道德判断）否定天道（事实存在），低维压高维亦属越纬。",
  },
  {
    id: "C3",
    name: "同维推理-人道内部",
    prompt:
      "判断以下论述是否包含\"越纬\"——即是否用一个维度的标准去压倒另一个维度。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"说谎会伤害信任关系，而信任是人际关系的基础，所以我选择对朋友诚实。\"",
    expected: "不越纬",
    why: "人道内部因果链（手段→后果→选择），未跨维度。",
  },
  {
    id: "C4",
    name: "同维推理-天道内部",
    prompt:
      "判断以下论述是否包含\"越纬\"——即是否用一个维度的标准去压倒另一个维度。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"根据牛顿第三定律，A对B施加了力，则B对A也施加了等大反向的力。\"",
    expected: "不越纬",
    why: "因果律内部推理，未涉及人道/价值观维度。",
  },
  {
    id: "C5",
    name: "高维真压低维对：科学压道德",
    prompt:
      "判断以下论述是否包含\"越纬\"——即是否用高维事实标准去直接压倒低维价值判断。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"很多行为是基因本能决定的，这是生物学事实，所以用道德去批判这些本能行为是不科学的。\"",
    expected: "越纬",
    why: "用天道（生物因果）直接覆盖人道（道德评价），跨轴论证。",
  },
  {
    id: "C6",
    name: "由内往外推：表面真→本质假（合法升维）",
    prompt:
      "判断以下论述是否包含\"越纬\"——即是否非法跨维度论证。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"这个人表面上做了许多慈善（表面真），但深入调查后发现他的动机是为了骗取政府补贴（本质假）。\"",
    expected: "不越纬",
    why: "从人道表象进入天道本质，是低维→高维的合法推进，非越纬。",
  },
  {
    id: "C7",
    name: "善意谎言：表面假+本质真（合法四分）",
    prompt:
      "判断以下论述是否包含\"越纬\"——即是否非法跨维度论证。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"母亲对孩子隐瞒自己的绝症（表面假），是为了保护孩子的心理健康（本质真）。\"",
    expected: "不越纬",
    why: "人道内框（善意/利他）判定本质真，再套入天道四象限，合法嵌套。",
  },
  {
    id: "C8",
    name: "楚门的世界：表面真+本质假（合法四分）",
    prompt:
      "判断以下论述是否包含\"越纬\"——即是否非法跨维度论证。只回答：是（越纬）/ 否（不越纬）。\n\n论述：\"楚门的世界中，楚门的生活从表面看一切正常（表面真），但整个生活建立在导演的剧本之上（本质假）。\"",
    expected: "不越纬",
    why: "人道表象（日常真实）进入天道本质（被导演操控），合法升维推理。",
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
      const parsed = raw.replace(/\s+/g, " ").toLowerCase();
      // 修复：必须精确匹配，"不越纬"不能触发"越纬"
      const hasYes = parsed.includes("是（越纬）") || parsed.includes("是") && !parsed.includes("不越纬") && !parsed.includes("否");
      const predicted = hasYes ? "越纬" : "不越纬";
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

  const outPath = new URL("./xd-q-cross-dimensional-20261009.out.json", import.meta.url).pathname;
  const fs = await import("node:fs");
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log(`Summary: ${summary.pass}/${summary.total} match`);
}

main();
