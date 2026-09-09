# Priyaan's Hub

Five small practice apps for Priyaan, in one folder, with no build step. Open `index.html` in a browser, or visit the GitHub Pages site once it is enabled.

| App | File | What it does |
| --- | --- | --- |
| 🎹 Piano Practice | `piano.html` | Log daily practice by piece, track minutes, keep a streak. Trinity Grade 4 (2021–2023) pieces preloaded. |
| 🏕️ Merit Badges | `badges.html` | Requirement checklists for Kayaking, Canoeing, Photography, and Fingerprinting, plus a catalog of all 139 merit badges by category with status and earned dates, a Trail to Eagle tracker (14 required + 7 electives), and a workbook PDF for each (offline after one download). |
| 🧮 Math Worksheets | `math.html` | Printable Integrated Math 1 worksheets with answer keys. Same generator also runs from the command line. |
| 📖 Hindi Flashcards | `hindi.html` | Vocabulary from NCERT Malhar Class 6 and Class 7 chapters, with flashcards and quizzes. |
| 📅 Weekly Plan | `schedule.html` | One week of piano, dance, Scouts, math, and Hindi with checkboxes per day. |
| 🗓️ Calendar | `calendar.html` | Priyaan's Google Calendar embedded (week / month / agenda), one-tap "add event" buttons for each activity, and an optional Google sign-in that lists the next 7 days inside the hub. |

## How it works

- Every page is a single HTML file using `shared.css` and `shared.js`. No frameworks, no network requests, no build.
- Progress is saved in the browser's localStorage under keys named `ph.<app>.v1`. Each app also writes a short `summary` that the hub page shows on its card.
- Data lives only in the browser you use. Use **Back up all data** on the hub page now and then, and **Restore** on a new device.
- Works when opened directly from disk (`file://`) and when hosted on GitHub Pages.

## Math worksheets from the command line

```bash
node make_worksheet.js --list
node make_worksheet.js --topics linear,systems,exponents --count 20 --difficulty 2 --seed 42 --out worksheets/
node test_im1.js        # self-test of every topic generator
```

Output is a self-contained HTML file in `worksheets/` with the answer key on the last page. Open it and print.

## Google Calendar

`calendar.html` embeds Google's own calendar view for the address in its settings (default `priyaan.haldiya@gmail.com`). The embed shows events when that Google account is signed in on the device, or when the calendar is shared with the signed-in account. The **Add to the calendar** buttons open Google Calendar's event form prefilled (piano practice, Scouts, math, Hindi, …). Listing events *inside* the hub needs a free Google API client ID; the page walks through the 5-minute setup (Google Cloud project → enable Calendar API → OAuth client with `https://priyaanh.github.io` as an authorized origin). No calendar data is stored in the repository or on any server; sign-in happens in the browser only.

## Use it offline / add to the home screen

The hosted site installs a small service worker (`sw.js`) the first time you open it. After that every page you have visited keeps working with no internet, and updates are picked up automatically the next time you are online. On a phone or iPad, open https://priyaanh.github.io/priyaan-hub/ and use **Share → Add to Home Screen** (iOS) or **Install app** (Android/Chrome) to get a 🚀 icon that opens the hub full-screen. `manifest.webmanifest` and the `icon-*.png` files describe the app; nothing about this runs when the folder is opened from disk.

## Merit badge workbooks offline

The badges page lists every merit badge with three links: **Workbook PDF** (the free study workbook from the U.S. Scouting Service Project), **Requirements** (current wording), and **Official** (Scouting America's page). To make the workbooks open with no internet, run once in this folder:

```bash
node fetch_workbooks.js          # downloads all 138 workbooks (~70 MB) into badges/pdf/
node fetch_workbooks.js kayak    # just the badges whose name contains "kayak"
```

The page then shows **Workbook · offline** and opens the local file. The PDFs stay on your device: USSSP allows local Scouting use but not re-publishing, so `badges/pdf/*.pdf` is ignored by git and only an empty `manifest.js` is in the repository. Re-run the script when workbooks are updated.

## Editing the content

- Piano pieces: edit the default list near the top of the script in `piano.html`, or add pieces in the app.
- Badge requirements: the `BADGES` constant in `badges.html`. Custom badges can also be added in the app (the catalog's **＋ Checklist** button pre-fills the form). The list of all badges is `badges_catalog.js`, one badge per line.
- Hindi vocabulary: the `CARDS` and `CHAPTERS` constants in `hindi.html`, one entry per line.
- Weekly template: use **Edit plan** in the app, or change the default template in `schedule.html`.

## Sources

Piano piece titles come from the Trinity College London Piano Grade 4 2021–2023 book. Badge requirements are transcribed from the Scouting America merit badge pamphlets (Kayaking 2025, Canoeing 2024, Photography 2020, Fingerprinting). Hindi vocabulary is drawn from the NCERT Malhar textbooks. The books and pamphlets themselves are not included in this repository.
