// Loads Pyodide (CPython → WASM) from the CDN once, lazily, and runs a
// challenge's student code + test harness entirely in the browser.

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { set: (key: string, value: unknown) => void };
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
  }
}

const PYODIDE_VERSION = "0.26.4";
const BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<Pyodide> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.dataset.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export function getPyodide(): Promise<Pyodide> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    await loadScript(`${BASE}pyodide.js`);
    if (!window.loadPyodide) throw new Error("Pyodide failed to initialize.");
    return window.loadPyodide({ indexURL: BASE });
  })();
  return pyodidePromise;
}

// Driver: execs student code into a fresh module `chal`, then runs every
// test_* function defined by the harness, printing PASS/FAIL/ERROR per test.
const RUNNER = String.raw`
import types, traceback

chal = types.ModuleType("chal")
_ok = True
try:
    exec(STUDENT_CODE, chal.__dict__)
except Exception:
    print("Your code has an error and could not be loaded:")
    traceback.print_exc()
    _ok = False

class _Raises:
    def __init__(self, exc):
        self.exc = exc
    def __enter__(self):
        return self
    def __exit__(self, t, v, tb):
        if t is None:
            raise AssertionError("expected " + self.exc.__name__ + " but nothing was raised")
        return issubclass(t, self.exc)

def raises(exc):
    return _Raises(exc)

_ns = {"chal": chal, "raises": raises}
if _ok:
    try:
        exec(TEST_CODE, _ns)
    except Exception:
        print("Test harness failed to load:")
        traceback.print_exc()
        _ok = False

_passed = 0
_failed = 0
if _ok:
    _tests = sorted(n for n in _ns if n.startswith("test_") and callable(_ns[n]))
    for _name in _tests:
        try:
            _ns[_name]()
            print("PASS  " + _name)
            _passed += 1
        except AssertionError as _e:
            _msg = str(_e)
            print("FAIL  " + _name + ((": " + _msg) if _msg else ""))
            _failed += 1
        except Exception as _e:
            print("ERROR " + _name + ": " + type(_e).__name__ + ": " + str(_e))
            _failed += 1

print("__SUMMARY__ " + str(_passed) + " " + str(_failed))
`;

export type TestRun = {
  lines: string[];
  passed: number;
  failed: number;
};

export async function runTests(
  studentCode: string,
  testCode: string,
): Promise<TestRun> {
  const py = await getPyodide();

  let out = "";
  const write = (s: string) => {
    out += s + "\n";
  };
  py.setStdout({ batched: write });
  py.setStderr({ batched: write });

  py.globals.set("STUDENT_CODE", studentCode);
  py.globals.set("TEST_CODE", testCode);
  await py.runPythonAsync(RUNNER);

  const all = out.split("\n");
  const summary = all.find((l) => l.startsWith("__SUMMARY__"));
  let passed = 0;
  let failed = 0;
  if (summary) {
    const parts = summary.trim().split(/\s+/);
    passed = parseInt(parts[1] ?? "0", 10) || 0;
    failed = parseInt(parts[2] ?? "0", 10) || 0;
  }
  const lines = all.filter((l) => l.length > 0 && !l.startsWith("__SUMMARY__"));
  return { lines, passed, failed };
}
