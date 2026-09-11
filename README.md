# Priyaan's Hub

Five small practice apps for Priyaan, in one folder, with no build step. Open `index.html` in a browser, or visit the GitHub Pages site once it is enabled.

| App | File | What it does |
| --- | --- | --- |
| 🎹 Piano Practice | `piano.html` | Log daily practice by piece, track minutes, keep a streak. Trinity Grade 4 (2021–2023) pieces preloaded. Prints a month's practice log for the teacher: minutes per piece per day, weekly totals, recent notes, and lines to sign. Has a metronome too: 40–208 BPM with the Italian tempo name, a beat light, beats per bar, and tap tempo. |
| 🏕️ Merit Badges | `badges.html` | Requirement checklists for Kayaking, Canoeing, Photography, and Fingerprinting, plus a catalog of all 139 merit badges by category with status and earned dates, a Trail to Eagle tracker (14 required + 7 electives), and a workbook PDF for each (offline after one download). |
| 🧮 Math Worksheets | `math.html` | Printable Integrated Math 1 worksheets with answer keys, from 11 topic generators covering CPM chapters 1-9. Pick topics, count, level and seed; practice on screen with instant checking, or print. The same generator runs from the command line. |
| 📝 Lesson Quizzes | `quizzes.html` | A separate quiz for each CPM Integrated II lesson 1.1.1 to 1.3.4: polygons, predictions from data, tile patterns, area models, describing graphs, angle pairs, transversals and triangles. 199 questions, many with drawn diagrams; 10 per attempt on screen, or print any lesson as a paper quiz with its diagrams and an answer key. |
| 📖 Hindi Flashcards | `hindi.html` | About 400 words from every chapter of NCERT Malhar (मल्हार) Class 6 and Class 7, in Devanagari with transliteration, meaning, and a Hindi hint. Flip flashcards in either direction, rate them Again / Got it for a Leitner spaced review (due cards come back after 1, 3, 7, 21 days), take a 10-question quiz per chapter, add your own words, print a two-column word list, or print cut-out flashcards, nine to a page with the backs already mirrored for double-sided printing. |
| 📅 Weekly Plan | `schedule.html` | One week of piano, dance, Scouts, math, and Hindi with checkboxes per day, plus any Google Tasks that are due or overdue. |
| 📄 From a PDF | `ai.html` | Turns a chapter, worksheet or study guide into fresh practice problems or a multiple-choice quiz, laid out as a proper printable worksheet with an answer key. Works with the **free ChatGPT** (copy a prompt, paste its reply back) or, with an API key, with Claude or ChatGPT directly. |
| 🗓️ Calendar &amp; Tasks | `calendar.html` | Google Calendar embedded (week / month / agenda) for as many Google accounts as you add, one-tap "add event" buttons for each activity, and Google Tasks: tick items off, add tasks with due dates, grouped into Overdue / Today / Coming up. |

## How it works

The hub page opens on a **Today** panel computed from the other apps' saved data: piano minutes against the daily goal, how much of today's plan is ticked off, today's calendar events with the next one named, Google Tasks that are due or overdue, Hindi words waiting for review, today's worksheet and quiz scores, merit badge requirements signed off this week, and any practice streaks. Keys **1**–**9** open the apps, and **?** names them. It only shows tiles that have something to say, and one line names the next unchecked thing on today's plan.


- Every page is a single HTML file using `shared.css` and `shared.js`. No frameworks, no network requests, no build.
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

## Turning a PDF into practice

`ai.html` sends a PDF (or a photo of a page) to Claude and asks for new problems that test the same skills, then shows them as a printable worksheet with an answer key or as an on-screen quiz. Everything it makes is saved in the browser, so old sets keep working offline.

**Free ChatGPT (the default, no key, no cost).** The page writes the prompt for you: press **Copy prompt & open ChatGPT**, which copies it and opens ChatGPT in a window docked to the side of the screen with the prompt already in its box. Attach the PDF there, send, then paste its whole reply back. (ChatGPT cannot be shown *inside* the page: chatgpt.com replies with `X-Frame-Options: SAMEORIGIN`, which forbids embedding. The hub's footer has the same 💬 ChatGPT button for general use.) The page reads the JSON it returns - or, failing that, a plain numbered list - and builds the same worksheet. Nothing is sent anywhere by the hub itself in this mode.

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

Loads every page in headless Chrome and fails on any console error, runs eight browser suites (about 190
checks) that drive the real pages with the network stubbed, then runs the 142,148 maths-generator checks in
`test_im1.js`. See `tests/README.md`.

## Editing the content

- Piano pieces: edit the default list near the top of the script in `piano.html`, or add pieces in the app.
- Badge requirements: the `BADGES` constant in `badges.html`. Custom badges can also be added in the app (the catalog's **＋ Checklist** button pre-fills the form). The list of all badges is `badges_catalog.js`, one badge per line.
- Hindi vocabulary: the `CARDS` and `CHAPTERS` constants in `hindi.html`, one entry per line (`hi` Devanagari, `tr` transliteration, `en` meaning, `hint` Hindi gloss). A card's progress is keyed by chapter + `hi`, so renaming a word resets it. Extra words can also be added in the app under **My words**.
- Weekly template: use **Edit plan** in the app, or change the default template in `schedule.html`.

## Sources

Piano piece titles come from the Trinity College London Piano Grade 4 2021–2023 book. Badge requirements are transcribed from the Scouting America merit badge pamphlets (Kayaking 2025, Canoeing 2024, Photography 2020, Fingerprinting). Hindi vocabulary is drawn from the NCERT Malhar textbooks. The books and pamphlets themselves are not included in this repository.
