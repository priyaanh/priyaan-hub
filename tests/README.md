# Tests

Two kinds, both run by `./tests/run.sh`:

- **`../test_im1.js`**, **`../test_grades.js`** and **`../test_pyquiz.js`** — the generators, in Node. The Python one executes every snippet with python3 and compares the real output with the claimed answer. Generates 1,260 problems per topic per level and
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
| `search.html` | the hub's search box: what each kind of content matches, the ranking, the ten-result cap, the deep links, the keyboard, and that the index is not fetched until the box is focused |
| `review.html` | Review Mistakes: what it collects from each of the four sources, that a retry round is skipped, rebuilding a question exactly, clearing one by answering it right, a wrong answer staying on the list, the source filter, re-opening a question missed again later, and the empty case |
| `progress.html` | the Progress page: what it reads out of each app, junk entries being dropped, the headline numbers, the range picker, the activity calendar and its day detail, every chart, the records, and the empty case |
| `dates.html` | `PH.todayISO`, `addDays`, `daysBetween` and `mondayOf` across daylight saving, month ends and year ends |
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
| `contrast.html` | every page, light and dark: text meets WCAG AA against the background actually behind it (4.5:1, or 3:1 for large text) |
| `python.html` | the Python app: topic choice, a round end to end, right and wrong answers, the keyboard, saved rounds |
| `gradesheet.html` | the by-grade worksheet maker: grade and topic choice, seeds, instant generation, printing |
| `hostile.html` | every page seeded with script payloads in every text field, then with wrong-typed values, then with corrupt JSON: nothing executes, payloads show as text, pages still render |
| `offline.html` | the service worker: registration, a versioned cache, the whole app shell precached, pages answering from cache, PDFs deliberately excluded (run over a local server via `tests/cdp.js`, since workers need a real origin and real time) |

Notes for anyone extending these:

- Never pass `--user-data-dir` to headless Chrome on this machine; it hangs.
- `--virtual-time-budget` fast-forwards timers, so `setTimeout` does **not** wait for real work such as
  `FileReader`. Wait on a condition, advancing real time with a real async operation each turn (see the
  `tick()`/`waitFor()` helpers the suites share).
- Suites that walk several pages run through `tests/cdp.js` in **real time**. Under `--virtual-time-budget`
  the clock races ahead, so a wall-clock wait for the next page expires instantly and every check
  silently runs against the page you just left. Sample colours only after a real settle delay, too, or
  CSS transitions are caught mid-fade.
- Do not wait on an iframe's `load` event alone when the page is `calendar.html`: it embeds Google Calendar,
  which never finishes loading in a test, so everything after it goes unchecked. The multi-page suites
  proceed once the page itself has rendered.
- Each suite snapshots the `localStorage` keys it touches and puts them back afterwards, so running the
  tests never destroys real practice data.
- A suite that reloads its iframe to test a second state must guard its `load` handler with a phase flag.
  Without one the handler fires again and silently re-runs every earlier check against the new state, which
  shows up as a pile of failures that look like real bugs.
