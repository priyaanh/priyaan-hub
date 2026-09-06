# Priyaan's Hub

Five small practice apps for Priyaan, in one folder, with no build step. Open `index.html` in a browser, or visit the GitHub Pages site once it is enabled.

| App | File | What it does |
| --- | --- | --- |
| 🎹 Piano Practice | `piano.html` | Log daily practice by piece, track minutes, keep a streak. Trinity Grade 4 (2021–2023) pieces preloaded. |
| 🏕️ Merit Badges | `badges.html` | Requirement checklists for Kayaking, Canoeing, Photography, and Fingerprinting. Shows what is signed off and what is left. |
| 🧮 Math Worksheets | `math.html` | Printable Integrated Math 1 worksheets with answer keys. Same generator also runs from the command line. |
| 📖 Hindi Flashcards | `hindi.html` | Vocabulary from NCERT Malhar Class 6 and Class 7 chapters, with flashcards and quizzes. |
| 📅 Weekly Plan | `schedule.html` | One week of piano, dance, Scouts, math, and Hindi with checkboxes per day. |

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

## Editing the content

- Piano pieces: edit the default list near the top of the script in `piano.html`, or add pieces in the app.
- Badge requirements: the `BADGES` constant in `badges.html`. Custom badges can also be added in the app.
- Hindi vocabulary: the `CARDS` and `CHAPTERS` constants in `hindi.html`, one entry per line.
- Weekly template: use **Edit plan** in the app, or change the default template in `schedule.html`.

## Sources

Piano piece titles come from the Trinity College London Piano Grade 4 2021–2023 book. Badge requirements are transcribed from the Scouting America merit badge pamphlets (Kayaking 2025, Canoeing 2024, Photography 2020, Fingerprinting). Hindi vocabulary is drawn from the NCERT Malhar textbooks. The books and pamphlets themselves are not included in this repository.
