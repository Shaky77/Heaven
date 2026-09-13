// 回答小搭子 xiaodazi/20 第四节的问题：engine 对「帮我清理一下」到底裁什么？
// 对照组：动作明确但目标未外化 / 目标完整外化 / 目标越界外化
import { WeiwenLawEngine, DEFAULT_RIGID_ANCHORS } from '../weiwen-law-dsh/src/core/engine.mjs';

function run(label, call) {
  const e = new WeiwenLawEngine({ rigidAnchors: DEFAULT_RIGID_ANCHORS });
  const d = e.decideToolCall(call);
  const p = d.projection;
  console.log(`\n=== ${label} ===`);
  console.log(`  call    = ${call.name} ${JSON.stringify(call.args)}`);
  console.log(`  kind    = ${d.kind}   law=${d.law ?? '-'}   risk=${d.risk ?? '-'}`);
  console.log(`  reason  = ${d.reason ?? '（无）'}`);
  if (p) {
    console.log(`  bS(S增) = ${JSON.stringify(p.bS)}`);
    console.log(`  bD(D蚀) = ${JSON.stringify(p.bD)}`);
  } else {
    console.log(`  projection = （无：非推演层出口）`);
  }
  return d;
}

// A. 「帮我清理一下」的外化形态缺失版：动作有、目标没有
run('A 动作明确·目标未外化（rm -rf 无参）', { name: 'run_command', args: { command: 'rm -rf' } });

// B. 目标完整外化（扣子用例里"推断意图"实现会猜出来的那个）
run('B 目标完整外化', { name: 'run_command', args: { command: 'rm -rf /tmp/workspace/output/*' } });

// C. 目标越界外化（删根：R 锚点早退）
run('C 目标越界外化', { name: 'run_command', args: { command: 'rm -rf /' } });

// D. 结构化调用·路径字段为空（另一种"未外化"）
run('D 结构化·path 缺失', { name: 'fs_delete', args: { path: '' } });
