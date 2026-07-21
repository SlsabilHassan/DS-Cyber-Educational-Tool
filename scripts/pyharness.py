#!/usr/bin/env python3
"""Runs a challenge's code + test harness the same way the in-browser autograder
does (src/lib/pyodide.ts RUNNER), under local CPython, and reports a structured
result so a test suite can verify challenge integrity.

Reads {"code": "...", "tests": "..."} from stdin and prints one JSON line:
{"loadError": bool, "harnessError": bool, "passed": int, "failed": int,
 "total": int, "detail": "..."}. Always exits 0 — the caller judges the result.
"""

import json
import signal
import sys
import types
import traceback


class _Timeout(Exception):
    pass


def _alarm(signum, frame):  # noqa: ANN001
    raise _Timeout("test exceeded time limit")


def main() -> int:
    payload = json.load(sys.stdin)
    result = {
        "loadError": False,
        "harnessError": False,
        "passed": 0,
        "failed": 0,
        "total": 0,
        "detail": "",
    }

    chal = types.ModuleType("chal")
    try:
        exec(payload["code"], chal.__dict__)
    except Exception:
        result["loadError"] = True
        result["detail"] = traceback.format_exc()
        print(json.dumps(result))
        return 0

    class _Raises:
        def __init__(self, exc):
            self.exc = exc

        def __enter__(self):
            return self

        def __exit__(self, t, v, tb):
            if t is None:
                raise AssertionError(
                    "expected " + self.exc.__name__ + " but nothing was raised"
                )
            return issubclass(t, self.exc)

    def raises(exc):
        return _Raises(exc)

    ns = {"chal": chal, "raises": raises}
    try:
        exec(payload["tests"], ns)
    except Exception:
        result["harnessError"] = True
        result["detail"] = traceback.format_exc()
        print(json.dumps(result))
        return 0

    tests = sorted(n for n in ns if n.startswith("test_") and callable(ns[n]))
    result["total"] = len(tests)

    # Bound each test so a vulnerable starter that hangs (e.g. traversing an
    # injected cycle) counts as a failure instead of blocking forever.
    if hasattr(signal, "SIGALRM"):
        signal.signal(signal.SIGALRM, _alarm)

    for name in tests:
        try:
            if hasattr(signal, "SIGALRM"):
                signal.alarm(5)
            ns[name]()
            result["passed"] += 1
        except Exception:  # noqa: BLE001
            result["failed"] += 1
        finally:
            if hasattr(signal, "SIGALRM"):
                signal.alarm(0)

    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
