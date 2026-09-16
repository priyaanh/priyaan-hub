# Priyaan's Hub

Eleven small practice apps for Priyaan, in one folder, with no build step. Open `index.html` in a browser, or visit the GitHub Pages site once it is enabled.

| App | File | What it does |
| --- | --- | --- |
| 🎹 Piano Practice | `piano.html` | Log daily practice by piece, track minutes, keep a streak. Trinity Grade 4 (2021–2023) pieces preloaded. Prints a month's practice log for the teacher: minutes per piece per day, weekly totals, recent notes, and lines to sign. Has a metronome too: 40–208 BPM with the Italian tempo name, a beat light, beats per bar, and tap tempo. |
| 🏕️ Merit Badges | `badges.html` | Requirement checklists for Kayaking, Canoeing, Photography, and Fingerprinting, plus a catalog of all 139 merit badges by category with status and earned dates, a Trail to Eagle tracker (14 required + 7 electives), and a workbook PDF for each (offline after one download). |
| 🧮 Math Worksheets | `math.html` | Printable Integrated Math 1 worksheets with answer keys, from 11 topic generators covering CPM chapters 1-9. Pick topics, count, level and seed; practice on screen with instant checking, or print. The same generator runs from the command line. |
| 📝 Lesson Quizzes | `quizzes.html` | A separate quiz for each CPM Integrated II lesson 1.1.1 to 1.3.4: polygons, predictions from data, tile patterns, area models, describing graphs, angle pairs, transversals and triangles. 229 entries, many with drawn diagrams, of which 90 are templates that make fresh numbers every time, so a second attempt is a different quiz rather than the same one again; 10 per attempt on screen, or print any lesson as a paper quiz with its diagrams and an answer key. |
| 📖 Hindi Flashcards | `hindi.html` | About 400 words from every chapter of NCERT Malhar (मल्हार) Class 6 and Class 7, in Devanagari with transliteration, meaning, and a Hindi hint. Flip flashcards in either direction, rate them Again / Got it for a Leitner spaced review (due cards come back after 1, 3, 7, 21 days), take a 10-question quiz per chapter, add your own words, print a two-column word list, or print cut-out flashcards, nine to a page with the backs already mirrored for double-sided printing. |
| 📅 Weekly Plan | `schedule.html` | One week of piano, dance, Scouts, math, and Hindi with checkboxes per day, plus any Google Tasks that are due or overdue. |
| 🐍 Python Practice | `python.html` | Short rounds of "what does this print?" on eleven topics: types, strings, lists, loops, if/elif/else, functions, dictionaries, f-strings, list comprehensions, tuples and sets, and errors. A quick reference sits under the topic picker. Multiple choice or typed, with an explanation after each one, a review of what you missed, and history. Questions are generated on the device. |
| ✏️ Make Practice | `ai.html` | **By grade:** pick Grade 6, 7 or 8, choose topics, and get a printable worksheet with an answer key immediately - generated on the device, no key, no internet. **From a PDF:** turn a chapter or study guide into fresh problems or a quiz with the free ChatGPT (copy a prompt, paste the reply back) or, with an API key, with Claude or ChatGPT directly. |
| 🎯 Review Mistakes | `review.html` | Every question missed anywhere on the site — lesson quizzes, maths worksheets, Python rounds, generated practice sets — collected in one place and asked again. Get one right and it comes off the list; miss it again later and it comes back. Nothing is stored but the list of what has since been put right: each question is rebuilt from the seed it was generated with. |
| 📈 Progress | `progress.html` | Every app's history in one picture: an activity calendar going back up to a year, accuracy over time across quizzes, worksheets and Python rounds, piano minutes by week against the goal, Hindi words split across the five review boxes, merit badges by status, and records like the longest streak and the best round. Reads the other apps and writes nothing back. |
| 🗓️ Calendar &amp; Tasks | `calendar.html` | Google Calendar embedded (week / month / agenda) for as many Google accounts as you add, one-tap "add event" buttons for each activity, and Google Tasks: tick items off, add tasks with due dates, grouped into Overdue / Today / Coming up. |

## How it works

The hub page opens on a **Today** panel computed from the other apps' saved data: piano minutes against the daily goal, how much of today's plan is ticked off, today's calendar events with the next one named, Google Tasks that are due or overdue, Hindi words waiting for review, today's worksheet and quiz scores, merit badge requirements signed off this week, and any practice streaks. Keys **1**–**9** and **0** open the apps, and **?** names them. It only shows tiles that have something to say, and one line names the next unchecked thing on today's plan. A streak tile counts every day that any app recorded something and opens the Progress page. Underneath, a seven-day strip shows which days had piano, plan, maths and Hindi activity, with a count out of seven.

**Search.** The box under the greeting searches the whole site: all 139 merit badges, every one of the 408 Hindi words in either script or by its English meaning, each CPM lesson, the Python topics, and the worksheet generators for Integrated Math 1 and Grades 6-8. Press **/** to jump to it, arrow keys to move, Enter to open; results link straight to the right card, chapter or lesson. The index is a generated file, so the hub itself stays small:

```bash
node build_search.js        # rewrites search_index.js after any content change
```


- Every page is a single HTML file using `shared.css` and `shared.js`. No frameworks, no network requests, no build.
- Question text is a little HTML — `<sup>` for exponents, `<br>` between the lines of a system, `&lt;` for a symbol. `PH.safeHTML` escapes everything and then re-allows exactly that short list, so the formatting shows but nothing with an attribute can get through; `PH.plainText` gives the same text with the markup taken out, for places only plain text fits.
- Progress is saved in the browser's localStorage under keys named `ph.<app>.v1`. Each app also writes a short `summary` that the hub page shows on its card.
- Data lives only in the browser you use. Use **Back up all data** on the hub page now and then, and **Restore** on a new device. The footer says how long it has been, and nags in amber past a month. API keys are deliberately left out of backups, so add those again per device.
- If the browser ever refuses to save (a full quota, or a private window), the page says so instead of losing the work quietly.
- Works when opened directly from disk (`file://`) and when hosted on GitHub Pages.

## Math worksheets from the command line

```bash
node make_worksheet.js --list
node make_worksheet.js --topics linear,systems,exponents --count 20 --difficulty 2 --seed 42 --out worksheets/
node test_im1.js        # self-test of every topic generator
```

Output is a self-contained HTML file in `worksheets/` laid out like a real worksheet - numbered problems in two columns with work boxes, and the answer key on its own page. Open it and print.

## Making practice

Two ways, on one page.

**By grade (the default).** `grades.js` holds 24 problem generators — eight each for Grade 6, 7 and 8 — covering integers and fractions, decimals, ratios and percents, expressions and equations, area and volume, statistics, proportional reasoning, probability, circles and angles, exponents and scientific notation, slope, systems, Pythagoras, transformations and functions. Pick a grade, narrow the topics if you want, choose how many and how hard, and the worksheet appears at once with its answer key. **Week's packet** prints five different sheets, one per school day, with a single answer key at the back. Any worksheet can also be answered on screen, and whatever you get wrong can be turned into a shorter set to try again. Nothing leaves the device, and the seed makes any sheet reproducible. `node test_grades.js` generates 600 problems per topic per level and checks the answers computationally: 109,213 checks.

## Python questions

`pyquiz.js` writes each snippet around values it has already chosen, so the answer is known without running
anything. `node test_pyquiz.js` then checks that claim the only way that really counts: it executes every
distinct snippet with `python3` in a fresh namespace and compares what Python actually prints (or raises)
with the stated answer. 1,632 snippets, 41,527 checks.

## Turning a PDF into practice

`ai.html` sends a PDF (or a photo of a page) to Claude and asks for new problems that test the same skills, then shows them as a printable worksheet with an answer key or as an on-screen quiz. Everything it makes is saved in the browser, so old sets keep working offline.

**Free ChatGPT (the default, no key, no cost).** The page writes the prompt for you: press **Copy prompt & open ChatGPT**, which copies it and opens ChatGPT in a new browser tab with the prompt already in its box. Attach the PDF there, send, then paste its whole reply back. (ChatGPT cannot be shown *inside* the page: chatgpt.com replies with `X-Frame-Options: SAMEORIGIN`, which forbids embedding, and a pop-up window gets blocked, so it opens as an ordinary tab. The hub's footer has the same 💬 ChatGPT link.) The page reads the JSON it returns - or, failing that, a plain numbered list - and builds the same worksheet. Nothing is sent anywhere by the hub itself in this mode.

**With an API key (optional).** Pick **Claude API** or **ChatGPT API** instead and the page calls that service directly, so one press does the whole thing. Choose a model from the dropdown, which shows what each costs per million tokens. The key is entered once and kept in that browser's local storage only; keys are stored per service, so you can keep both. It is never committed, never included in an export, and never sent anywhere except to Anthropic. Get one at [console.anthropic.com](https://console.anthropic.com/), set a monthly spending limit, and expect a few cents per worksheet - the exact cost of each run is shown when it finishes. The API modes use a JSON schema (Claude's `output_config.format`, OpenAI's `text.format`) so questions always come back in a fixed shape, and **Another set** re-runs the same PDF for different numbers and contexts.

## Google Calendar

`calendar.html` embeds Google's own calendar view. **Several Google accounts can be added** (Priyaan, a parent, a troop or school calendar): each gets a label, a colour, and a show/hide toggle, and new events can be sent to whichever one you pick. A calendar shows up when the browser is signed in to an account that can see it, so the reliable way to combine accounts is to share the second calendar with the first (Google Calendar → Settings for my calendars → Share with specific people); the page has step-by-step instructions. The **Add to the calendar** buttons open Google Calendar's event form prefilled (piano practice, Scouts, math, Hindi, …). **Google Tasks** appears on the same page. Tasks has no public embed, so it needs the same one-time Google API client ID as the event list below it; once that is set up, one sign-in covers both, and ticking a task off in the hub updates Google. The last fetch is cached, so tasks still show (read-only) when offline. Listing events *inside* the hub needs that same free client ID; the page walks through the 5-minute setup (Google Cloud project → enable the Calendar API and the Tasks API → OAuth client with `https://priyaanh.github.io` as an authorized origin). No calendar data is stored in the repository or on any server; sign-in happens in the browser only.

## Use it offline / add to the home screen

The hosted site installs a small service worker (`sw.js`) the first time you open it. After that every page you have visited keeps working with no internet, and updates are picked up automatically the next time you are online. On a phone or iPad, open https://priyaanh.github.io/priyaan-hub/ and use **Share → Add to Home Screen** (iOS) or **Install app** (Android/Chrome) to get a 🚀 icon that opens the hub full-screen. Long-pressing that icon jumps straight to today's plan, piano practice, a new worksheet, or Hindi flashcards. `manifest.webmanifest` and the `icon-*.png` files describe the app; nothing about this runs when the folder is opened from disk.

## Merit badge workbooks offline

The badges page lists every merit badge with three links: **Workbook PDF** (the free study workbook from the U.S. Scouting Service Project), **Requirements** (current wording), and **Official** (Scouting America's page). To make the workbooks open with no internet, run once in this folder:

```bash
node fetch_workbooks.js          # downloads all 138 workbooks (~70 MB) into badges/pdf/
node fetch_workbooks.js kayak    # just the badges whose name contains "kayak"
```

The page then shows **Workbook · offline** and opens the local file. The PDFs stay on your device: USSSP allows local Scouting use but not re-publishing, so `badges/pdf/*.pdf` is ignored by git and only an empty `manifest.js` is in the repository. Re-run the script when workbooks are updated.

## Tests

```bash
./tests/run.sh
```

Loads every page in headless Chrome and fails on any console error, runs twenty-three browser suites (about 800
checks) that drive the real pages with the network stubbed — including accessibility, phone layout, WCAG
contrast in both light and dark, and the offline service worker — then runs the 142,148 maths-generator
checks in `test_im1.js`, the 111,628 in `test_grades.js` and the 41,527 in `test_pyquiz.js`. See `tests/README.md`.

## Reviewing mistakes

Every app that marks an answer now records *which* questions were wrong, not just how many. `review.html`
gathers them and asks them again.

Nothing is copied: each generator on this site is deterministic, so a saved `{seed, topics, difficulty,
count}` plus an index is the whole question, and the page rebuilds it. Worksheet problems, Python snippets
and the 139 fixed quiz questions come back exactly as they were. The 60 quiz entries that are templates
rather than fixed questions come back as a sibling — the same skill with its own numbers, drawn from a seed
fixed to that question so it is at least the same every time you see it.

A lesson-quiz reference like `1.1.1:3` is turned back into a question by `cpm_int2_ch1.js`, which also holds
the marking rules, so the quiz page and the review page can never disagree about whether `6 + 5x + x^2`
answers `x^2 + 5x + 6`.

A question is identified by what it *is*, not by the attempt it came from, so getting it right once clears
it wherever it appeared, and missing it again on a later day puts it back. The only thing the page saves is
that list of dates.

## Editing the content

- Piano pieces: edit the default list near the top of the script in `piano.html`, or add pieces in the app.
- Badge requirements: the `BADGES` constant in `badges.html`. Custom badges can also be added in the app (the catalog's **＋ Checklist** button pre-fills the form). The list of all badges is `badges_catalog.js`, one badge per line.
- Hindi vocabulary: the `CARDS` and `CHAPTERS` constants in `hindi_data.js`, one entry per line (`hi` Devanagari, `tr` transliteration, `en` meaning, `hint` Hindi gloss). A card's progress is keyed by chapter + `hi`, so renaming a word resets it. Extra words can also be added in the app under **My words**. Re-run `node build_search.js` afterwards so the hub can find them.
- Weekly template: use **Edit plan** in the app, or change the default template in `schedule.html`.

## Sources

Piano piece titles come from the Trinity College London Piano Grade 4 2021–2023 book. Badge requirements are transcribed from the Scouting America merit badge pamphlets (Kayaking 2025, Canoeing 2024, Photography 2020, Fingerprinting). Hindi vocabulary is drawn from the NCERT Malhar textbooks. The books and pamphlets themselves are not included in this repository.
