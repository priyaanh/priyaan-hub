# Tests

Two kinds, both run by `./tests/run.sh`:

- **`../test_im1.js`** — the maths generators, in Node. Generates 1,260 problems per topic per level and
  checks them: no junk in the text, deterministic for a seed, no duplicates in a sheet, and, where the
  question can be re-solved, that the answer is actually right (substituting back into equations, systems
  and inequalities, recomputing slopes, midpoints, distances, sequence terms and exponential values).
- **`*.html`** — each one drives a real page inside an iframe in headless Chrome, stubbing `window.fetch`
  where a network call would happen, and logs `PASS`/`FAIL` lines to the console.

```bash
./tests/run.sh                 # every page, every suite
./tests/run.sh hub tasks       # just those suites
CHROME=/path/to/chrome ./tests/run.sh
```

| Suite | Covers |
| --- | --- |
| `hub.html` | the Today panel's counting rules, streaks, tile links, survival of a corrupt saved key, and that backups leave API keys out |
| `free.html` | the free-ChatGPT flow: the generated prompt, the one-click handoff, the three reply formats it can read, and the printable sheet |
| `ai.html` | the Claude and OpenAI request shapes, headers, JSON-schema output, key storage per provider, quiz marking, error and refusal handling |
| `tasks.html` | Google Tasks: grouping by due date, ticking off, adding, deleting, switching lists, the offline copy |
| `cal.html` | several Google accounts: migration from the old format, colours, show/hide, the embed URL, quick-add targeting |
| `sched.html` | the weekly plan's strip of Google Tasks that are due |
| `quizprint.html` | printing a lesson quiz: diagrams, choice lists, answer key |
| `badges.html` | the merit badge catalog, Trail to Eagle counting, filters, sorting, the workbook viewer |
| `hindicards.html` | printable Hindi flashcards: sheet pagination, mirrored backs for duplex printing, cut lines |
| `pianolog.html` | the printable piano practice log: the day grid, totals, the four-week window, notes and signature lines |

Notes for anyone extending these:

- Never pass `--user-data-dir` to headless Chrome on this machine; it hangs.
- `--virtual-time-budget` fast-forwards timers, so `setTimeout` does **not** wait for real work such as
  `FileReader`. Wait on a condition, advancing real time with a real async operation each turn (see the
  `tick()`/`waitFor()` helpers the suites share).
- Each suite snapshots the `localStorage` keys it touches and puts them back afterwards, so running the
  tests never destroys real practice data.
