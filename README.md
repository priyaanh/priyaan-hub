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
| `lib/app.js` | hash routing (`#/course/math-7`), theme, search |
| `sw.js` | offline support when served over http(s) |

The name you give in Settings is used in the greeting and stays on the device. No name is written into
any page.

## Tests

```
./tests/run.sh
```

runs three things in headless Chrome and node: the page loads without console errors on several routes;
`tests/suite.html` drives the real app (mastery rules, the exercise player as a learner would use it,
every route, every skill's article and a question, settings, search); and `tests/content.js` builds
hundreds of questions per skill and checks structure, determinism, variety, that each answer passes the
real checker, that choice questions have no giveaways, and each skill's own `verify()` re-derivation.
`SEEDS=1500 ./tests/run.sh` checks more seeds.

## History

Before this, the repository was a hub of sixteen separate practice apps. That version is kept at the
git tag `hub-v1`.
