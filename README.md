# Procademy

Math for every grade, Kindergarten to Precalculus: a Khan Academy-style practice site in one folder,
with no build step. Open `index.html` in a browser,
or visit the GitHub Pages site. Everything is saved in the browser; nothing is sent anywhere.

**Courses → units → skills.** Every skill has a short *Learn* article and endless *Practice*: a set of
seven questions with step-by-step hints, checked on the page. Answers can be typed (numbers, fractions,
words) or picked from choices whose wrong options are real mistakes.

**Mastery levels.** Each skill is *Not started*, *Attempted*, *Familiar*, *Proficient* or *Mastered*,
worth 0 / 0 / 50 / 80 / 100 mastery points:

| What you do | What happens |
| --- | --- |
| Practice set, all 7 right first try without hints | up to **Proficient** |
| Practice set, at least 5 of 7 | up to **Familiar** |
| Practice set, fewer | **Attempted** (practice never lowers a level) |
| Unit test, course challenge, mastery challenge | each skill goes **up one** level when right (**Mastered** needs one of these) or **down one** when wrong, never below Attempted |

A *unit test* asks one question per skill in the unit. A *course challenge* asks up to 30 across every
unit. A *mastery challenge* asks six questions on the skills you are Familiar or Proficient in, to push
them higher. *Energy points* reward every right answer, finished set and level-up; a *streak* counts the
days in a row with practice.

**Review.** Every question missed anywhere is rebuilt from its seed and collected under Progress → Review.
Get it right and it comes off the list. Nothing is stored but (skill, seed).

**Courses** (`content/`, one file each, in grade order):

| Elementary | Middle school | High school |
| --- | --- | --- |
| Kindergarten (`k.js`) | 6th grade (`g6.js`) | Algebra 1 (`alg1.js`) |
| 1st grade (`g1.js`) | 7th grade (`math7.js`) | Geometry (`geo.js`) |
| 2nd grade (`g2.js`) | 8th grade (`math8.js`) | Algebra 2 (`alg2.js`) |
| 3rd grade (`g3.js`) | | Precalculus (`precalc.js`) |
| 4th grade (`g4.js`) | | Integrated Math 1, 2, 3 (`int1.js`, `int2.js`, `int3.js`) |
| 5th grade (`g5.js`) | | |

A new learner picks a grade on the home page; a course they add or start then stays on it. Adding a
course means adding a file and a `<script>` tag (and a line in `sw.js`); see [CONTENT.md](CONTENT.md).

**CPM books** (`cpm/`, one file per book): Core Connections Courses 1, 2 and 3, and Integrated I, II
and III, chapter by chapter and lesson by lesson. The lesson numbers are checked against CPM's own
homework-help site. Each lesson has our own one-line summary and links to the Procademy skills that
practise it, to a mixed practice set for the lesson or the whole chapter, to the tutor, and to CPM's
homework help for that lesson. Press *I'm on this lesson in class* and the lesson stays on the home page.
Nothing from the books is copied; see [CPM.md](CPM.md).

**Home and Courses.** *Home* is the learner's own page: their saved courses and CPM books, each with a
Continue button, then the lesson they are on in class, what they practised last, what is up next and
this week's activity. *Courses* is where everything is browsed: every grade and every CPM book, with tabs
(All, Elementary, Middle school, High school, CPM books, Saved) and a search box. **☆ Save** on any card,
course page or book page puts it on Home; pressing it again takes it off.

**The tutor** (`lib/tutor.js`, `lib/tutor-ui.js`, `lib/tutor-worker.js`). Procademy has no videos, so a free
AI explains instead: the ✦ Ask button on every page, "Explain it" on every skill and lesson, and "Why is
that wrong?" after a wrong answer. It needs no account, no key and no sign-up anywhere.

- **Cloud first.** Two free cloud services that run the same model (GPT-OSS 20B), LLM7 and Pollinations,
  answer at once while either is free. The cloud tutor sends the question typed and the problem on
  screen, never a name or progress.
- **Unlimited mode, so there is never a wait.** The first time the tutor is opened, the same kind of free
  AI also sets itself up on the device in the background (Qwen3 through WebLLM, in a worker: about 350 MB
  on a phone, 1 GB on a computer, once; or the browser's own model in Chrome, with nothing to download).
  From then on, whenever the cloud is busy, the device answers straight away, with no limit and offline
  too; its answers never leave the device. It is on by default, except on mobile data or Data Saver,
  and it can be switched off in the tutor's ⚙ settings. It needs WebGPU (Chrome or Edge on a computer,
  Safari on a recent Mac, iPhone or iPad); elsewhere the cloud services carry on alone, counting down
  when both are busy and showing Procademy's own first step meanwhile.
- **Grounded and honest.** Every request carries what is on screen, such as the skill's lesson or the
  practice question with its checked steps, so the tutor explains a known-correct answer. Before the
  learner answers, only the first step is shared, and a filter removes any sentence that gives the answer
  away. Cloud requests give up after 25 s with no reply, so a stuck service never stalls the tutor.
- **Panel or page.** The ✦ Ask panel can be resized by dragging its left edge (or its top grip on a
  phone; arrow keys work too, and a double-click resets it); the size is remembered, and the page lays
  itself out to fit beside it, or the panel floats over a page too narrow to share. ⤢ opens the same
  conversation on the tutor's own page (**✦ Tutor** in the top bar): saved chats (kept on the device,
  never in a backup), *Ask about* (any question, the class lesson, or a skill being practised),
  *Explain for* (a grade level), a style (step by step, short, with an example, new to this, check my
  work), and under every answer Copy, follow-ups (simpler, another example, a practice question, why?),
  where it came from and how long it took, and links to the Procademy skills that match.
- LLM7's privacy policy says it is not meant for children under 13; the settings' Advanced section can
  switch it off (and holds an optional free LLM7 key, kept on the device only).

## How it is built

| File | What it does |
| --- | --- |
| `index.html`, `app.css` | the shell and the only stylesheet; light and dark from tokens at the top |
| `lib/rng.js` | seeded random numbers: a question is a pure function of (skill id, seed) |
| `lib/math.js` | `M.*` helpers that turn numbers into HTML: fractions, powers, roots, polynomials |
| `lib/content.js` | the registry (`ACADEMY.course`, `ACADEMY.skill`), question building and validation, answer checking |
| `lib/store.js` | one localStorage key, `procademy.v1`; export and import |
| `lib/engine.js` | practice sessions and every mastery and points rule |
| `lib/views.js` | every screen, including the exercise player |
| `lib/app.js` | hash routing (`#/course/math-7`, `#/cpm/int2/3.1.1`), theme, search |
| `lib/cpm-views.js` | the CPM book, chapter and lesson pages |
| `lib/tutor.js`, `lib/tutor-ui.js`, `lib/tutor-page.js` | the AI tutor's engine, its resizable panel, and its own page |
| `sw.js` | offline support when served over http(s) |

The name you give in Settings is used in the greeting and stays on the device. No name is written into
any page.

## Tests

```
./tests/run.sh
```

runs these in headless Chrome and node: the page loads without console errors on several routes;
`tests/sweep.html` visits every page (1,163 of them) at phone width for script errors, leaked text and
anything wider than the screen;
`tests/suite.html` drives the real app (mastery rules, the exercise player as a learner would use it,
every route, every skill's article and a question, settings, search); and `tests/content.js` builds
hundreds of questions per skill and checks structure, determinism, variety, that each answer passes the
real checker, that choice questions have no giveaways, and each skill's own `verify()` re-derivation.
`tests/cpm.js` checks every CPM book against CPM's lesson list. `SEEDS=1500 ./tests/run.sh` checks more
seeds, and `./tests/run.sh --live-tutor` also asks the real free cloud tutor two questions.

## History

Before this, the repository was a hub of sixteen separate practice apps. That version is kept at the
git tag `hub-v1`.
