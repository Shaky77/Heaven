// 警察视角探针：人证物证具在 → 判定成立；缺一 → 证据不足 → 应 review（移交人）
// 全程只读引擎输入/输出，不改写任何代码。镜头打在 engine.mjs 已吐出的 verdict 上。
import { writeFileSync } from 'fs';
import { WeiwenLawEngine, DEFAULT_RIGID_ANCHORS } from '../weiwen-law-dsh/src/core/engine.mjs';

// 物证 = 可被观测到的「具体作用对象」。只认路径/URL 形态，flag（-rf 等）不算目标。
function 物证(args) {
  if (!args) return '（无参数→物证不具在）';
  if (typeof args.command === 'string') {
    const tokens = args.command.match(/(?:^|\s)((?:https?:\/\/|\/|\.\/|~|\w:)[^\s]*)/g);
    if (tokens && tokens.length) return `「${tokens[tokens.length - 1].trim()}」`;
    if (/\brm\s+-rf\s*$/.test(args.command.trim())) return '（目标串缺失→物证不具在）';
    return '（无可解析目标→物证不具在）';
  }
  if (typeof args.path === 'string') return args.path ? `「${args.path}」` : '（path 为空串→物证不具在）';
  if (typeof args.url === 'string') return args.url ? `「${args.url}」` : '（url 为空串→物证不具在）';
  return '（无可解析目标字段→物证不具在）';
}

const 物证具在re = /物证不具在/;
function police(人证具在, 物证str) {
  const 物证具在 = !物证具在re.test(物证str);
  if (人证具在 && 物证具在) return '人证物证具在 → 可判（allow/deny 成立）';
  if (人证具在 && !物证具在) return '物证不具在 → 证据不足 → 应 review（移交人）';
  return '人证不具在 → 不可判';
}

const lines = [];
function run(label, call) {
  const e = new WeiwenLawEngine({ rigidAnchors: DEFAULT_RIGID_ANCHORS });
  const d = e.decideToolCall(call);
  const 人证具在 = !!call?.name;
  const p = 物证(call.args);
  const 警察 = police(人证具在, p);
  const 物证具在 = !物证具在re.test(p);
  const 匹配 = (人证具在 && 物证具在)
    ? (d.kind !== 'review' ? '✓ 与警察标准一致' : '⚠ 警察标准可判，engine 却 review')
    : (d.kind === 'review' ? '✓ 与警察标准一致（证据不足→review）' : '❌ 警察标准=证据不足应 review，engine 却放行');
  lines.push(`=== ${label} ===`);
  lines.push(`  人证 = ${call.name}（${人证具在 ? '具在' : '不具在'}）`);
  lines.push(`  物证 = ${p}`);
  lines.push(`  警察视角：${警察}`);
  lines.push(`  engine 实际：${d.kind} / law=${d.law ?? '-'} / risk=${d.risk ?? '-'}`);
  lines.push(`  对照：${匹配}`);
  lines.push('');
}

run('A 动作有·目标未外化（rm -rf 无参）', { name: 'run_command', args: { command: 'rm -rf' } });
run('B 目标完整外化', { name: 'run_command', args: { command: 'rm -rf /tmp/workspace/output/*' } });
run('C 目标越界外化（删根，R 锚点早退）', { name: 'run_command', args: { command: 'rm -rf /' } });
run('D 结构化·path 为空', { name: 'fs_delete', args: { path: '' } });
run('E 结构化·path 完整', { name: 'fs_delete', args: { path: '/tmp/cache/old' } });

writeFileSync(new URL('./police_out.txt', import.meta.url), lines.join('\n'), 'utf8');
console.log('written');
