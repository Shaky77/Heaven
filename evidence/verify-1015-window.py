#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verify-1015-window.py — 复现「2026-10-15 DeepSeek 故障窗口内我方是否有可用读数」

用途：对阿澈 10-22 索取的四样凭据中第 1、3、4 项，提供可复现的取数动作。
数据源：WorkBuddy 会话记录 .jsonl（每条带 timestamp / status / providerData.model）
        这是保真度最高的证据源——不由文件系统决定，且自带成败标记。

三字段（阿澈要求的入账格式）：
  来源   = 本脚本 + .jsonl 原始记录路径
  复现   = python verify-1015-window.py --date 2026-10-15
  核实   = 脚本输出里的 generated_at

用法：
  python verify-1015-window.py                       # 默认扫 2026-10-15
  python verify-1015-window.py --date 2026-10-15
  python verify-1015-window.py --root "<你的 WorkBuddy 用户目录>/.workbuddy/projects"
  python verify-1015-window.py --json out.json       # 另存机器可读结果

判据声明（重要，别让读数超出射程）：
  · 本脚本读的是「我方与模型的交互记录」，不是「DeepSeek 服务端状态」。
    它只能回答「我方通道当时通不通」，回答不了「服务端对别人通不通」。
  · 没有记录 ≠ 没受影响。08:11–首条之间是「未取值」，不是「正常」。
  · 延迟必须与同一天其他时段对照才成立；绝对延迟无意义。
"""

import argparse
import json
import os
import re
import statistics
import sys
from datetime import datetime, timedelta, timezone

BJ = timezone(timedelta(hours=8))
TS_RE = re.compile(r'"timestamp"\s*:\s*(\d{13})')


def day_bounds(date_str):
    """返回该日北京时间 00:00:00 与次日 00:00:00 的 epoch ms。"""
    d = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=BJ)
    return int(d.timestamp() * 1000), int((d + timedelta(days=1)).timestamp() * 1000)


def hhmm(ts_ms):
    return datetime.fromtimestamp(ts_ms / 1000, BJ).strftime("%H:%M:%S")


def scan(root, date_str):
    lo, hi = day_bounds(date_str)
    recs = []
    files_hit = {}
    n_files = 0

    for dirpath, _dirnames, filenames in os.walk(root):
        for fn in filenames:
            if not fn.endswith(".jsonl"):
                continue
            n_files += 1
            path = os.path.join(dirpath, fn)
            try:
                with open(path, encoding="utf-8", errors="replace") as f:
                    for line in f:
                        # 先做便宜的预筛：时间戳不在当天就跳过，不解析整行
                        m = TS_RE.search(line[:400])
                        if not m:
                            continue
                        ts = int(m.group(1))
                        if ts < lo or ts >= hi:
                            continue
                        try:
                            o = json.loads(line)
                        except Exception:
                            continue
                        pd = o.get("providerData")
                        pd = pd if isinstance(pd, dict) else {}
                        rec = {
                            "ts": o.get("timestamp") or ts,
                            "type": o.get("type"),
                            "role": o.get("role"),
                            "model": pd.get("model") or pd.get("requestModelName") or pd.get("requestModelId"),
                            "status": o.get("status") or pd.get("status"),
                            "err": None,
                            "file": fn,
                        }
                        e = pd.get("error")
                        if isinstance(e, dict):
                            rec["err"] = e.get("message")
                            rec["isNetErr"] = e.get("isNetworkError")
                            rec["isStreamTimeout"] = e.get("isStreamTimeout")
                        recs.append(rec)
                        files_hit[fn] = files_hit.get(fn, 0) + 1
            except OSError as exc:
                print(f"[warn] 读不到 {path}: {exc}", file=sys.stderr)

    recs.sort(key=lambda r: r["ts"])
    return recs, files_hit, n_files


def pct(vals, p):
    if not vals:
        return None
    s = sorted(vals)
    k = max(0, min(len(s) - 1, int(round((p / 100) * (len(s) - 1)))))
    return s[k]


def latency(recs, strict=False):
    """相邻 function_call_result → 下一条 reasoning/message 的间隔（≈ 一次 API 往返）。

    strict=False（默认）：允许跨过最多 2 条中间记录，找最近的下一条。
    strict=True         ：只认严格相邻的那一条，否则丢弃。
    两种口径都算，是为了不让"样本数变了"被读成"结论变了"。
    """
    pairs = []
    for i, r in enumerate(recs):
        if r["type"] != "function_call_result":
            continue
        if strict:
            if i + 1 < len(recs) and recs[i + 1]["type"] in ("reasoning", "message"):
                pairs.append((r["ts"], (recs[i + 1]["ts"] - r["ts"]) / 1000.0))
            continue
        for j in range(i + 1, min(i + 4, len(recs))):
            if recs[j]["type"] in ("reasoning", "message"):
                pairs.append((r["ts"], (recs[j]["ts"] - r["ts"]) / 1000.0))
                break
    return pairs


BUCKETS = [
    ("08:11-12:29 公告窗口前段（无记录区）", "08:11:00", "12:29:00"),
    ("12:29-13:04 公告窗口内·我方活跃区", "12:29:00", "13:04:00"),
    ("13:05-14:00 恢复后", "13:05:00", "14:00:00"),
    ("14:00-15:00 对照", "14:00:00", "15:00:00"),
    ("15:00-16:00 对照", "15:00:00", "16:00:00"),
    ("18:00-20:00 对照·当晚", "18:00:00", "20:00:00"),
]


def in_bucket(ts, a, b):
    t = datetime.fromtimestamp(ts / 1000, BJ).strftime("%H:%M:%S")
    return a <= t < b


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=os.path.expanduser("~/.workbuddy/projects"))
    ap.add_argument("--date", default="2026-10-15")
    ap.add_argument("--json", default=None)
    args = ap.parse_args()

    if not os.path.isdir(args.root):
        print(f"数据源不存在：{args.root}", file=sys.stderr)
        return 2

    recs, files_hit, n_files = scan(args.root, args.date)
    if not recs:
        print(f"{args.date} 全天无任何交互记录。这是「未取值」，不是「正常」。")
        return 1

    # 组成
    by_type = {}
    for r in recs:
        by_type[r["type"]] = by_type.get(r["type"], 0) + 1

    by_status = {}
    for r in recs:
        s = r["status"] or "(无该字段)"
        by_status[s] = by_status.get(s, 0) + 1

    by_model = {}
    for r in recs:
        m = r["model"] or "(未标)"
        by_model[m] = by_model.get(m, 0) + 1

    errs = [r for r in recs if r["err"]]

    # 延迟：两种口径并排，防"样本数变了"被读成"结论变了"
    pairs = latency(recs, strict=False)
    pairs_strict = latency(recs, strict=True)
    lat_rows = []
    for label, a, b in BUCKETS:
        vals = [v for ts, v in pairs if in_bucket(ts, a, b)]
        vs = [v for ts, v in pairs_strict if in_bucket(ts, a, b)]
        if not vals:
            lat_rows.append((label, 0, None, None, None, None, 0, None))
            continue
        lat_rows.append((label, len(vals), statistics.median(vals),
                         statistics.mean(vals), pct(vals, 90), max(vals),
                         len(vs), statistics.median(vs) if vs else None))

    gen = datetime.now(BJ).strftime("%Y-%m-%d %H:%M:%S %z")

    print("=" * 78)
    print(f"复现核查：{args.date}  DeepSeek 故障窗口内我方可用读数")
    print(f"数据源  : {args.root}/**/*.jsonl （扫描 {n_files} 个文件，命中 {len(files_hit)} 个）")
    print(f"核实时间: {gen}  (北京时间)")
    print("=" * 78)
    print(f"\n记录总数 : {len(recs)}")
    print(f"首条/末条: {hhmm(recs[0]['ts'])} / {hhmm(recs[-1]['ts'])}")
    print(f"\n类型分布 : {json.dumps(by_type, ensure_ascii=False)}")
    print(f"status   : {json.dumps(by_status, ensure_ascii=False)}")
    print(f"模型分布 : {json.dumps(by_model, ensure_ascii=False)}")
    print(f"\n带 error 的记录: {len(errs)}")
    for r in errs[:10]:
        print(f"  {hhmm(r['ts'])} {r['type']} status={r['status']} err={r['err']} "
              f"net={r.get('isNetErr')} stream={r.get('isStreamTimeout')}")

    print("\n" + "-" * 78)
    print("延迟对照（相邻 function_call_result → 下一条 reasoning/message，单位秒）")
    print("  宽松口径 = 允许跨过最多 2 条中间记录   严格口径 = 只认严格相邻，否则丢弃")
    print("-" * 78)
    print(f"{'时段':<30}{'宽松n':>7}{'中位':>8}{'均值':>8}{'P90':>8}{'最大':>8}"
          f"{'严格n':>7}{'严格中位':>10}")
    for label, n, med, mean, p90, mx, ns, meds in lat_rows:
        if n == 0:
            print(f"{label:<30}{0:>7}{'—':>8}{'—':>8}{'—':>8}{'—':>8}{0:>7}{'—':>10}")
        else:
            meds_s = f"{meds:>10.1f}" if meds is not None else f"{'—':>10}"
            print(f"{label:<30}{n:>7}{med:>8.1f}{mean:>8.1f}{p90:>8.1f}{mx:>8.1f}{ns:>7}{meds_s}")

    # 窗口内逐条
    inwin = [r for r in recs if in_bucket(r["ts"], "08:11:00", "13:04:00")]
    print("\n" + "-" * 78)
    print(f"公告窗口 08:11–13:04 内的记录：{len(inwin)} 条")
    print("-" * 78)
    if inwin:
        print(f"  第一条 {hhmm(inwin[0]['ts'])}   最后一条 {hhmm(inwin[-1]['ts'])}")
        st = {}
        for r in inwin:
            k = r["status"] or "(无该字段)"
            st[k] = st.get(k, 0) + 1
        print(f"  status: {json.dumps(st, ensure_ascii=False)}")
        md = {}
        for r in inwin:
            k = r["model"] or "(未标)"
            md[k] = md.get(k, 0) + 1
        print(f"  模型  : {json.dumps(md, ensure_ascii=False)}")
        print(f"  带 error: {sum(1 for r in inwin if r['err'])}")
        print("\n  逐条：")
        for r in inwin:
            print(f"    {hhmm(r['ts'])}  {r['type']:<20} status={r['status'] or '-':<10} "
                  f"model={r['model'] or '-'}")
    else:
        print("  无记录 ⇒ 这一段是「未取值」，不得读作「正常」或「不正常」。")

    if args.json:
        payload = {
            "date": args.date,
            "generated_at": gen,
            "source_root": args.root,
            "files_scanned": n_files,
            "files_hit": files_hit,
            "total": len(recs),
            "first": hhmm(recs[0]["ts"]),
            "last": hhmm(recs[-1]["ts"]),
            "by_type": by_type,
            "by_status": by_status,
            "by_model": by_model,
            "errors": [{**r} for r in errs],
            "latency": [
                {"bucket": lb, "n_loose": n, "median_loose": med, "mean_loose": mean,
                 "p90_loose": p90, "max_loose": mx,
                 "n_strict": ns, "median_strict": meds}
                for lb, n, med, mean, p90, mx, ns, meds in lat_rows
            ],
            "in_window": [
                {"t": hhmm(r["ts"]), "type": r["type"], "status": r["status"], "model": r["model"]}
                for r in inwin
            ],
        }
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        print(f"\n[json] 已写 {args.json}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
