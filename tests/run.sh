#!/bin/bash
# Runs every check: the page loads without console errors, the browser suite passes, the content passes.
#   ./tests/run.sh            everything
#   SEEDS=1500 ./tests/run.sh more seeds per skill in the content check
# Set CHROME to point at another browser binary if needed. Exits non-zero if anything fails.
set -u
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$CHROME" ] || { echo "Chrome not found at: $CHROME (set CHROME=/path/to/chrome)"; exit 2; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
# NB: never pass --user-data-dir here, it makes headless Chrome hang on macOS.
FLAGS=(--headless=new --disable-gpu --no-first-run --hide-scrollbars --allow-file-access-from-files --enable-logging=stderr --v=0 --window-size=1300,1500)
fail=0

echo "▶ index.html loads without console errors"
for route in "" "#/courses" "#/course/math-7" "#/progress" "#/settings"; do
  "$CHROME" "${FLAGS[@]}" --virtual-time-budget=4000 --dump-dom "file://$ROOT/index.html$route" >"$TMP/dom.html" 2>"$TMP/page.err"
  errs=$(grep "CONSOLE" "$TMP/page.err" | grep -iE "error|uncaught|not defined|undefined|failed" | grep -v favicon)
  if [ -n "$errs" ]; then fail=1; echo "  ✗ index.html$route"; echo "$errs" | sed 's/^\[[^]]*\] /    /' | head -5
  elif ! grep -q 'class="card' "$TMP/dom.html"; then fail=1; echo "  ✗ index.html$route rendered nothing"
  else echo "  ✓ index.html$route"; fi
done

echo "▶ browser suite (tests/suite.html)"
CHROME="$CHROME" node tests/cdp.js "file://$ROOT/tests/suite.html" 180000 "RESULTS" >"$TMP/suite.out" 2>&1
summary=$(grep -oE "RESULTS [0-9]+ failed of [0-9]+" "$TMP/suite.out" | tail -1)
bad=$(grep -E "^(FAIL|EXCEPTION)" "$TMP/suite.out")
if [ -n "$bad" ]; then fail=1; echo "  ${summary:-no summary}"; echo "$bad" | sed 's/^/    /' | head -40
elif [ -z "$summary" ]; then fail=1; echo "  ✗ the suite did not finish"; tail -5 "$TMP/suite.out" | sed 's/^/    /'
else echo "  ✓ ${summary#RESULTS 0 failed of } checks passed"; fi

echo "▶ content (node tests/content.js)"
if out=$(node tests/content.js 2>&1); then echo "  ✓ $(echo "$out" | tail -1)"; else fail=1; echo "$out" | tail -25 | sed 's/^/    /'; fi

[ $fail -eq 0 ] && echo "✅ everything passed" || echo "❌ something failed"
exit $fail
