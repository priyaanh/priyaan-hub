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
for page in index piano badges math quizzes hindi schedule calendar ai python progress review; do
  "$CHROME" "${FLAGS[@]}" --virtual-time-budget=5000 --dump-dom "file://$ROOT/$page.html" >/dev/null 2>"$TMP/$page.err"
  errs=$(grep "CONSOLE" "$TMP/$page.err" | grep -iE "error|uncaught|not defined|undefined|failed" | grep -v favicon)
  if [ -n "$errs" ]; then fail=1; echo "  ✗ $page.html"; echo "$errs" | sed 's/^\[[^]]*\] /    /' | head -5
  else echo "  ✓ $page.html"; fi
done

want=("$@"); [ ${#want[@]} -eq 0 ] && want=(hub search progress review theme dates free ai gradesheet python tasks sched quizprint cal badges hindicards pianolog a11y mobile metronome contrast contrast-dark contrast-midnight contrast-paper contrast-contrast hostile offline)

# The offline suite needs a real origin: service workers do not run from file://.
serve() {
  PORT=8787
  while lsof -i :$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 50); do curl -sf "http://127.0.0.1:$PORT/shared.js" >/dev/null && break; done
}
for name in "${want[@]}"; do
  # contrast-<theme> runs the contrast suite again with that theme chosen
  case "$name" in
    contrast-dark)  suite="tests/contrast.html"; query="" ;;
    contrast-*)     suite="tests/contrast.html"; query="?theme=${name#contrast-}" ;;
    *)              suite="tests/$name.html";    query="" ;;
  esac
  [ -f "$suite" ] || { echo "▶ $name — no such suite"; fail=1; continue; }
  # Every suite runs in REAL time through the DevTools driver. Under --virtual-time-budget the clock races
  # ahead: waits for the next page expire instantly, colours are read mid-transition, and suites end early
  # with a quietly reduced count.
  darkflag=""; [ "$name" = "contrast-dark" ] && darkflag="--dark"
  if [ "$name" = "offline" ]; then
    serve                                        # service workers also need a real origin
    CHROME="$CHROME" node tests/cdp.js "http://127.0.0.1:$PORT/$suite" 60000 "RESULTS" >"$TMP/$name.err" 2>&1
    kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null
  else
    CHROME="$CHROME" node tests/cdp.js "file://$ROOT/$suite$query" 180000 "RESULTS" $darkflag >"$TMP/$name.err" 2>&1
  fi
  # each suite ends with "RESULTS <n> failed of <m>" — trust that over counting console lines, which
  # Chrome can drop when several runs are in flight.
  summary=$(grep -oE "RESULTS [0-9]+ failed of [0-9]+" "$TMP/$name.err" | tail -1)
  bad=$(grep -oE "FAIL[^\"]*" "$TMP/$name.err" | sort -u)
  if [ -n "$summary" ]; then
    failed=$(echo "$summary" | awk '{print $2}'); total=$(echo "$summary" | awk '{print $5}')
  else
    failed=$(echo "$bad" | grep -c "FAIL"); total=$(grep -c "PASS " "$TMP/$name.err")
  fi
  if [ -n "$bad" ]; then fail=1; echo "▶ $name — $failed of $total failed:"; echo "$bad" | sed 's/^/    /'
  elif [ "${total:-0}" -eq 0 ]; then fail=1; echo "▶ $name — nothing ran (the harness may have thrown early)"
  else echo "▶ $name — $total checks passed"; fi
done

echo "▶ internal links"
if out=$(node tests/links.js 2>&1); then echo "  ✓ $(echo "$out" | head -1 | sed 's/^PASS //')"; else fail=1; echo "$out" | sed 's/^/    /' | head -12; fi

for gen in test_im1.js test_grades.js test_pyquiz.js test_quizbank.js; do
  echo "▶ problem generators (node $gen)"
  if out=$(node "$gen" 2>&1); then echo "  ✓ $(echo "$out" | tail -1)"; else fail=1; echo "$out" | tail -12; fi
done

[ $fail -eq 0 ] && echo "✅ everything passed" || echo "❌ something failed"
exit $fail
