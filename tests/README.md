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
| `metronome.html` | the metronome: tempo clamping and memory, tempo names, beats per bar, tap tempo, start/stop, the keyboard shortcuts |
| `a11y.html` | every page: one h1, no skipped heading levels, named controls, labelled inputs, alt text, titled iframes, no positive tabindex, no duplicate ids |
| `mobile.html` | every page at 390px and 320px: the document never scrolls sideways, and topbar buttons stay tappable |
| `offline.html` | the service worker: registration, a versioned cache, the whole app shell precached, pages answering from cache, PDFs deliberately excluded (run over a local server via `tests/cdp.js`, since workers need a real origin and real time) |

Notes for anyone extending these:

- Never pass `--user-data-dir` to headless Chrome on this machine; it hangs.
- `--virtual-time-budget` fast-forwards timers, so `setTimeout` does **not** wait for real work such as
  `FileReader`. Wait on a condition, advancing real time with a real async operation each turn (see the
  `tick()`/`waitFor()` helpers the suites share).
- Do not wait on an iframe's `load` event alone when the page is `calendar.html`: it embeds Google Calendar,
  which never finishes loading in a test, so everything after it goes unchecked. The multi-page suites
  proceed once the page itself has rendered.
- Each suite snapshots the `localStorage` keys it touches and puts them back afterwards, so running the
  tests never destroys real practice data.
