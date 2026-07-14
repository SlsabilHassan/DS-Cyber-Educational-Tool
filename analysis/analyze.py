#!/usr/bin/env python3
"""Analyze a Hacky Stacky learning_events CSV export.

Turns the raw event log (one row per event, with a JSON `payload` column)
into (1) readable research summaries printed to the console, and (2) a
flattened CSV where the JSON fields become real columns — so it opens cleanly
in Excel, SPSS, or pandas for deeper stats.

Usage:
    python3 analyze.py path/to/learning_events_rows.csv
    python3 analyze.py events.csv --exclude-device aeff9ace-...   # drop your own test rows
    python3 analyze.py events.csv --flat cleaned.csv              # also write flattened CSV

Pure standard library — no pip install needed.
"""

import argparse
import csv
import json
from collections import Counter, defaultdict


def load(path, exclude_device=None):
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if exclude_device and r.get("device_id") == exclude_device:
                continue
            try:
                r["data"] = json.loads(r.get("payload") or "{}")
            except json.JSONDecodeError:
                r["data"] = {}
            rows.append(r)
    return rows


def rule(title):
    print(f"\n{'─' * 60}\n{title}\n{'─' * 60}")


def overview(rows):
    rule("OVERVIEW")
    people = {r["user_id"] or f"anon:{r['device_id']}" for r in rows}
    sessions = {r["session_id"] for r in rows}
    print(f"{len(rows)} events · {len(people)} learners · {len(sessions)} sessions")
    print("\nEvents by type:")
    for etype, n in Counter(r["event_type"] for r in rows).most_common():
        print(f"  {n:>5}  {etype}")


def quiz_analysis(rows):
    rule("QUIZ ITEM ANALYSIS  (which questions trip people up)")
    per_q = defaultdict(lambda: {"answers": 0, "correct": 0})
    for r in rows:
        if r["event_type"] != "quiz_answer":
            continue
        q = r["data"].get("question", "?")
        per_q[q]["answers"] += 1
        per_q[q]["correct"] += 1 if r["data"].get("correct") else 0
    if not per_q:
        print("  (no quiz answers yet)")
        return
    for q, s in sorted(per_q.items(), key=lambda kv: kv[1]["correct"] / kv[1]["answers"]):
        pct = 100 * s["correct"] / s["answers"]
        print(f"  {pct:5.0f}% correct  ({s['answers']} answered)  {q[:60]}")


def challenge_funnel(rows):
    rule("CHALLENGE FUNNEL  (attempts, solves, and help used)")
    stats = defaultdict(lambda: {"attempts": 0, "passed_runs": 0, "solvers": set(),
                                 "hints": 0, "solutions": 0})
    for r in rows:
        key = (r.get("module") or "?", r.get("challenge_id") or "?")
        who = r["user_id"] or r["device_id"]
        e = r["event_type"]
        if e == "challenge_attempt":
            stats[key]["attempts"] += 1
            if r["data"].get("passed"):
                stats[key]["passed_runs"] += 1
        elif e == "challenge_solved":
            stats[key]["solvers"].add(who)
        elif e == "hint_reveal":
            stats[key]["hints"] += 1
        elif e == "solution_reveal":
            stats[key]["solutions"] += 1
    relevant = {k: v for k, v in stats.items()
                if k[1] != "?" and any([v["attempts"], v["hints"], v["solutions"]])}
    if not relevant:
        print("  (no challenge activity yet)")
        return
    print(f"  {'module / challenge':<42}{'att':>5}{'pass':>6}{'solved':>8}{'hints':>7}{'soln':>6}")
    for (mod, ch), v in sorted(relevant.items()):
        print(f"  {mod + ' / ' + ch:<42}{v['attempts']:>5}{v['passed_runs']:>6}"
              f"{len(v['solvers']):>8}{v['hints']:>7}{v['solutions']:>6}")


def lesson_completion(rows):
    rule("LESSON COMPLETION  (per module)")
    completes = Counter(r.get("module") for r in rows if r["event_type"] == "lesson_complete")
    starts = defaultdict(set)
    for r in rows:
        if r["event_type"] == "lesson_step":
            starts[r.get("module")].add(r["session_id"])
    if not starts:
        print("  (no lesson activity yet)")
        return
    for mod in sorted(starts):
        print(f"  {mod:<24} started by {len(starts[mod])} session(s), "
              f"completed {completes.get(mod, 0)} time(s)")


def top_pages(rows):
    rule("MOST-VISITED PAGES")
    views = Counter(r["data"].get("path") for r in rows if r["event_type"] == "page_view")
    for path, n in views.most_common(10):
        print(f"  {n:>4}  {path}")


# Payload keys we lift into their own columns in the flattened CSV.
FLAT_KEYS = ["path", "stepTitle", "stepIndex", "total", "question", "choice",
             "correct", "hintIndex", "passed", "testsPassed", "testsFailed",
             "granted", "steps"]


def write_flat(rows, out_path):
    base = ["created_at", "user_id", "device_id", "session_id",
            "event_type", "module", "challenge_id"]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(base + FLAT_KEYS)
        for r in rows:
            w.writerow([r.get(c, "") for c in base]
                       + [r["data"].get(k, "") for k in FLAT_KEYS])
    print(f"\n✓ Flattened CSV written to {out_path} "
          f"({len(rows)} rows, JSON expanded into columns)")


def main():
    ap = argparse.ArgumentParser(description="Analyze a learning_events CSV export.")
    ap.add_argument("csv", help="path to the exported learning_events CSV")
    ap.add_argument("--exclude-device", help="drop rows from this device_id (your own testing)")
    ap.add_argument("--flat", help="also write a flattened CSV to this path")
    args = ap.parse_args()

    rows = load(args.csv, args.exclude_device)
    overview(rows)
    quiz_analysis(rows)
    challenge_funnel(rows)
    lesson_completion(rows)
    top_pages(rows)
    if args.flat:
        write_flat(rows, args.flat)


if __name__ == "__main__":
    main()
