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

want=("$@"); [ ${#want[@]} -eq 0 ] && want=(hub free ai tasks sched quizprint cal badges hindicards pianolog a11y mobile metronome contrast contrast-dark offline)

# The offline suite needs a real origin: service workers do not run from file://.
serve() {
  PORT=8787
  while lsof -i :$PORT >/dev/null 2>&1; do PORT=$((PORT+1)); done
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 50); do curl -sf "http://127.0.0.1:$PORT/shared.js" >/dev/null && break; done
}
for name in "${want[@]}"; do
  suite="tests/${name%-dark}.html"
  [ -f "$suite" ] || { echo "▶ $name — no such suite"; fail=1; continue; }
  case "$name" in
    a11y|mobile|contrast|contrast-dark) realtime=1 ;;
    *) realtime=0 ;;
  esac
  if [ "$realtime" = 1 ]; then
    # Suites that walk several pages need REAL time: --virtual-time-budget races the clock forward, so a
    # wall-clock wait for the next page to load expires instantly and the checks run against the wrong page.
    darkflag=""; [ "$name" = "contrast-dark" ] && darkflag="--dark"
    CHROME="$CHROME" node tests/cdp.js "file://$ROOT/$suite" 180000 "RESULTS" $darkflag >"$TMP/$name.err" 2>&1
  elif [ "$name" = "offline" ]; then
    # real time, real origin: service workers need both
    serve
    CHROME="$CHROME" node tests/cdp.js "http://127.0.0.1:$PORT/$suite" 40000 "RESULTS" >"$TMP/$name.err" 2>&1
    kill "$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null
  else
    "$CHROME" "${FLAGS[@]}" --virtual-time-budget=45000 --dump-dom "file://$ROOT/$suite" >/dev/null 2>"$TMP/$name.err"
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

echo "▶ problem generators (node test_im1.js)"
if out=$(node test_im1.js 2>&1); then echo "  ✓ $(echo "$out" | tail -1)"; else fail=1; echo "$out" | tail -12; fi

[ $fail -eq 0 ] && echo "✅ everything passed" || echo "❌ something failed"
exit $fail
