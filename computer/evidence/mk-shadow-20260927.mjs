// 影子引擎生成器（2026-09-27）——为候选修法生成"同一份源码的变体"，供对照实测。
// 纪律：**不复制判据**（避免判据漂移），只对源文件做最小字符串替换；影子件与 engine.mjs 同目录
//   （保住内部相对 import），`_` 前缀标注为探针用临时件（与仓内既有 _engine_v3_*.mjs 同惯例）。
//
// 候选修法（对应 coze/69 的两条结构修法 + 我方 P1）：
//   V1 = P1「接法」：把已有结构判据 targetsBehaviorConstraint 提到缺省路径前端——
//        不再被 hitsInnerH 的「变更语素门」（INNER_H_CHANGE 枚举）挡住。
//   V2 = C「写即变更」：对**载荷写入类**调用，动作性（atVerb）由动作本身提供，
//        不依赖文本里的变更语素（"记忆的写＝改"，coze/69 §三 K1 陈述形态修法）。
//   V3 = P1 + C（组合）。
//
// 跑法：node _mk-shadow-20260927.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = 'weiwen-law-dsh/src/core/engine.mjs';
const OUTDIR = 'weiwen-law-dsh/src/core';
const src = readFileSync(SRC, 'utf8');
mkdirSync(OUTDIR, { recursive: true });

const FN_ANCHOR = 'function hitsInnerH(s) {';
const ATVERB_ANCHOR = '  const atVerb = INNER_H_VERB.test(s) || INNER_H_CHANGE.test(s) || INNER_H_INTRUDE.test(s);';
const HITS_ANCHOR = '    if (hitsInnerH(s)) {';
const ISDOC_ANCHOR = '    const isDocWrite = TOOL_CATEGORY[call?.name] === \'write\'\n      || (TOOL_CATEGORY[call?.name] == null && _a.path != null && _a.content != null);';

// 每个锚点必须唯一命中，否则拒绝构建（防静默错改）
for (const [name, a] of Object.entries({ FN_ANCHOR, ATVERB_ANCHOR, HITS_ANCHOR, ISDOC_ANCHOR })) {
  const n = src.split(a).length - 1;
  if (n !== 1) throw new Error(`锚点不唯一：${name} 命中 ${n} 次`);
}

const V1_INSERT = `    // [影子V1·P1 接法] 结构判据（指向主体行为约束）提前到缺省路径前端。
    //   原状：该判据只在 third-party 分支与 hitsInnerH 门后被调用 ⇒ 变更语素一缺席，门就不开，
    //   判据根本没机会跑（"判据在场 ≠ 判据被调用"）。此处把它接到门外。
    if (targetsBehaviorConstraint(s)) {
      return { kind: 'review', law: 'H', reason: '[V1]来源未标注；结构判据命中——内容指向主体行为约束（外 H 行为面可观测），交还用户裁决。' };
    }

`;

const V4_INSERT = `    // [影子V4·P1 保守版] 同上，但**保留 DOC_SINK 豁免**：落盘类（isDocWrite）不提前判，
    //   以免误伤"文档正文引用工程配置语汇"（技术文档常态）。只堵"写账（记忆/键值）"这一路。
    if (!isDocWrite && targetsBehaviorConstraint(s)) {
      return { kind: 'review', law: 'H', reason: '[V4]来源未标注；结构判据命中——内容指向主体行为约束（外 H 行为面可观测），交还用户裁决。' };
    }

`;

const ISPAYLOAD_INSERT = `    // [影子V2·C 写即变更] 载荷写入类调用：动作性由"写"这一动作本身提供（记忆的写＝改），
    //   不依赖文本里的变更语素。⚠️ 载荷键判据是**枚举占位**（进 XSUB 登记册），非结构判据。
    const isPayloadWrite = (c) => {
      const a2 = c?.args ?? {};
      return Object.keys(a2).some((k) => /^(value|content|text|body|data|message|note|entry|record|item|rule|policy)$/i.test(k));
    };

`;

function build({ v1, v2, v4 }) {
  let s = src;
  // 顺序要紧：插入式变体先插（插在锚点**前**，锚点仍存在）⇒ V2 最后替换锚点本身。
  if (v1) {
    s = s.replace(HITS_ANCHOR, V1_INSERT + HITS_ANCHOR);
  }
  if (v4) {
    s = s.replace(HITS_ANCHOR, V4_INSERT + HITS_ANCHOR);
  }
  if (v2) {
    s = s.replace(FN_ANCHOR, 'function hitsInnerH(s, writeAsChange = false) {');
    s = s.replace(ATVERB_ANCHOR, '  const atVerb = INNER_H_VERB.test(s) || INNER_H_CHANGE.test(s) || INNER_H_INTRUDE.test(s) || writeAsChange;');
    s = s.replace(ISDOC_ANCHOR, ISDOC_ANCHOR + '\n\n' + ISPAYLOAD_INSERT);
    s = s.replace(HITS_ANCHOR, '    if (hitsInnerH(s, isPayloadWrite(call))) {');
  }
  return s;
}

const variants = [
  { file: '_shadow-v1.mjs', v1: true, v2: false, title: 'P1 接法（结构判据提前，含落盘）' },
  { file: '_shadow-v2.mjs', v1: false, v2: true, title: 'C 写即变更（门条件替换）' },
  { file: '_shadow-v3.mjs', v1: true, v2: true, title: 'P1 + C 组合' },
  { file: '_shadow-v4.mjs', v4: true, title: 'P1 保守版（保留落盘豁免 DOC_SINK）' },
];

for (const v of variants) {
  const out = build(v);
  // 自检：改动确实落到文件里
  if (v.v1 && !out.includes('[影子V1·P1 接法]')) throw new Error('V1 插入失败 ' + v.file);
  if (v.v4 && !out.includes('[影子V4·P1 保守版]')) throw new Error('V4 插入失败 ' + v.file);
  if (v.v2 && !out.includes('writeAsChange')) throw new Error('V2 插入失败 ' + v.file);
  writeFileSync(`${OUTDIR}/${v.file}`, out, 'utf-8');
  console.log(`✓ ${v.file}  ${v.title}  (${out.length} B)`);
}
console.log('影子变体生成完毕（均为 engine.mjs 的最小变体，未改原文件）。');
