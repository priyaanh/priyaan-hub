#!/bin/bash
# Runs the browser test suites and a console-error check on every page, in headless Chrome.
#   ./tests/run.sh              all suites
#   ./tests/run.sh hub tasks    just those
# Set CHROME to point at another browser binary if needed. Exits non-zero if anything fails.
set -u
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME (set CHROME=/path/to/chrome)"; exit 2; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
# NB: never pass --user-data-dir here, it makes headless Chrome hang on macOS.
FLAGS=(--headless=new --disable-gpu --no-first-run --hide-scrollbars --allow-file-access-from-files
       --enable-logging=stderr --v=0 --window-size=1300,1500)
fail=0

echo "▶ pages load without console errors"
for page in index piano badges math quizzes hindi schedule calendar ai; do
  "$CHROME" "${FLAGS[@]}" --virtual-time-budget=5000 --dump-dom "file://$ROOT/$page.html" >/dev/null 2>"$TMP/$page.err"
  errs=$(grep "CONSOLE" "$TMP/$page.err" | grep -iE "error|uncaught|not defined|undefined|failed" | grep -v favicon)
  if [ -n "$errs" ]; then fail=1; echo "  ✗ $page.html"; echo "$errs" | sed 's/^\[[^]]*\] /    /' | head -5
  else echo "  ✓ $page.html"; fi
done

want=("$@"); [ ${#want[@]} -eq 0 ] && want=(hub free ai tasks sched quizprint cal badges)
for name in "${want[@]}"; do
  suite="tests/$name.html"
  [ -f "$suite" ] || { echo "▶ $name — no such suite"; fail=1; continue; }
  "$CHROME" "${FLAGS[@]}" --virtual-time-budget=45000 --dump-dom "file://$ROOT/$suite" >/dev/null 2>"$TMP/$name.err"
  pass=$(grep -c "PASS " "$TMP/$name.err")
  bad=$(grep -oE "FAIL[^\"]*" "$TMP/$name.err" | sort -u)
  if [ -n "$bad" ]; then fail=1; echo "▶ $name — $pass passed, FAILURES:"; echo "$bad" | sed 's/^/    /'
  elif [ "$pass" -eq 0 ]; then fail=1; echo "▶ $name — nothing ran (the harness may have thrown early)"
  else echo "▶ $name — $pass checks passed"; fi
done

echo "▶ problem generators (node test_im1.js)"
if out=$(node test_im1.js 2>&1); then echo "  ✓ $(echo "$out" | tail -1)"; else fail=1; echo "$out" | tail -12; fi

[ $fail -eq 0 ] && echo "✅ everything passed" || echo "❌ something failed"
exit $fail
