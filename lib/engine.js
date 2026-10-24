/* Practice sessions and the mastery rules.
   A session is a list of (skill, seed) items. Answering records a result; finishing applies the
   mastery rules and awards points. Everything mastery-related is in this one file. */
'use strict';
(function () {
  const A = (typeof window !== 'undefined' && window.ACADEMY) || require('./content.js');
  const STORE = (typeof window !== 'undefined' && window.STORE) || require('./store.js');

  const PRACTICE_N = 7;             // questions in a practice set
  const CHALLENGE_N = 30;           // questions in a course challenge
  const MASTERY_N = 6;              // questions in a mastery challenge
  const POINTS = { correct: 15, hinted: 5, set: 50, levelUp: [0, 0, 100, 150, 250], unitTest: 100, challenge: 200 };

  /** pick `k` seeds for a skill whose prompts differ, deriving them from the session seed */
  function distinctItems(skillId, sessionSeed, k, seen) {
    seen = seen || new Set();
    const items = [];
    for (let attempt = 0; items.length < k && attempt < k * 12; attempt++) {
      const seed = `${sessionSeed}-${attempt}`;
      const q = A.question(skillId, seed);
      const key = A.normText(A.stripTags(q.prompt));
      if (seen.has(key) && attempt < k * 12 - k) continue;   // allow repeats only as a last resort
      seen.add(key);
      items.push({ skillId, seed, q });
    }
    return items;
  }

  function spreadAcrossUnits(course, k, rng) {
    // one question per skill, taken evenly across units, at most k in total
    const perUnit = course.units.map(u => rng.shuffle(u.skills));
    const out = [];
    while (out.length < k && perUnit.some(l => l.length)) {
      perUnit.forEach(l => { if (out.length < k && l.length) out.push(l.shift()); });
    }
    return out;
  }

  const ENGINE = {
    PRACTICE_N, CHALLENGE_N, MASTERY_N, POINTS,

    /** kind: practice | unit-test | course-challenge | mastery-challenge | mix | review */
    start(kind, opts) {
      opts = opts || {};
      const sessionSeed = opts.seed || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
      const rng = RNG.make('session:' + sessionSeed);
      const s = { kind, seed: sessionSeed, items: [], i: 0, results: [], hints: kind === 'practice' || kind === 'review', title: '', courseId: opts.courseId || null, unitId: opts.unitId || null };
      if (kind === 'practice') {
        const def = A.skills[opts.skillId];
        if (!def) throw new Error('no skill ' + opts.skillId);
        s.skillId = opts.skillId;
        s.title = def.title;
        s.items = distinctItems(opts.skillId, sessionSeed, opts.n || PRACTICE_N);
        const where = A.whereIs(opts.skillId);
        if (where) { s.courseId = where.course.id; s.unitId = where.unit.id; }
      } else if (kind === 'unit-test') {
        const unit = A.unitById(opts.courseId, opts.unitId);
        if (!unit) throw new Error('no unit');
        s.title = 'Unit test: ' + unit.title;
        rng.shuffle(unit.skills).forEach((sid, k) => { s.items.push({ skillId: sid, seed: `${sessionSeed}-${k}`, q: A.question(sid, `${sessionSeed}-${k}`) }); });
      } else if (kind === 'course-challenge') {
        const course = A.courseById(opts.courseId);
        if (!course) throw new Error('no course');
        s.title = 'Course challenge: ' + course.title;
        spreadAcrossUnits(course, opts.n || CHALLENGE_N, rng).forEach((sid, k) => { s.items.push({ skillId: sid, seed: `${sessionSeed}-${k}`, q: A.question(sid, `${sessionSeed}-${k}`) }); });
      } else if (kind === 'mastery-challenge') {
        const course = A.courseById(opts.courseId);
        if (!course) throw new Error('no course');
        s.title = 'Mastery challenge: ' + course.title;
        const pool = ENGINE.masteryPool(course);
        if (!pool.length) throw new Error('nothing to level up yet');
        rng.sample(pool, opts.n || MASTERY_N).forEach((sid, k) => { s.items.push({ skillId: sid, seed: `${sessionSeed}-${k}`, q: A.question(sid, `${sessionSeed}-${k}`) }); });
      } else if (kind === 'mix') {
        // a practice set drawn from several skills, such as a CPM lesson or chapter: hints on
        const ids = (opts.skills || []).filter(id => A.skills[id]);
        if (!ids.length) throw new Error('nothing to practise here yet');
        s.title = opts.title || 'Mixed practice';
        s.skills = ids;
        s.cpm = opts.cpm || null;
        s.hints = true;
        const n = opts.n || PRACTICE_N, order = rng.shuffle(ids), seen = new Set();
        for (let k = 0; k < n; k++) {
          const sid = order[k % order.length];
          s.items.push(distinctItems(sid, `${sessionSeed}-${k}`, 1, seen)[0]);
        }
      } else if (kind === 'review') {
        const missed = (opts.items || STORE.get().missed).filter(m => A.skills[m.skill]).slice(0, opts.n || 10);
        s.title = 'Review your mistakes';
        missed.forEach(m => { s.items.push({ skillId: m.skill, seed: m.seed, q: A.question(m.skill, m.seed) }); });
      } else throw new Error('unknown kind ' + kind);
      s.items.forEach(() => s.results.push(null));
      return s;
    },

    /** skills a mastery challenge can level up: Familiar or Proficient */
    masteryPool(course) {
      return A.courseSkills(course).filter(sid => { const l = STORE.skill(sid).level; return l === 2 || l === 3; });
    },

    current(s) { return s.items[s.i] || null; },
    /** record the learner's answer to the current question; returns the check result */
    answer(s, input) {
      const item = s.items[s.i];
      const r = s.results[s.i] || (s.results[s.i] = { tries: 0, hinted: false, correct: false, done: false, revealed: false });
      const res = A.check(item.q, input);
      if (!res.unreadable) r.tries += 1;
      if (res.correct) { r.correct = true; r.done = true; }
      return Object.assign(res, { firstTry: r.tries === 1 });
    },
    useHint(s) { const r = s.results[s.i] || (s.results[s.i] = { tries: 0, hinted: false, correct: false, done: false, revealed: false }); r.hinted = true; return r; },
    /** give up on the current question: it is shown, and counts as missed */
    reveal(s) { const r = s.results[s.i] || (s.results[s.i] = { tries: 0, hinted: false, correct: false, done: false, revealed: false }); r.revealed = true; r.hinted = true; r.done = true; return r; },
    /** did this question count as right, for mastery? first try, no hints */
    counts(r) { return !!(r && r.correct && r.tries === 1 && !r.hinted); },
    next(s) { if (s.i < s.items.length) s.i += 1; return s.i >= s.items.length; },
    isDone(s) { return s.i >= s.items.length; },

    /** apply the results: mastery levels, points, log, mistakes. Returns a summary. */
    finish(s) {
      if (s.finished) return s.finished;
      const total = s.items.length;
      let right = 0, pts = 0;
      const perSkill = {};
      s.items.forEach((it, k) => {
        const r = s.results[k] || { tries: 0, hinted: false, correct: false };
        const good = ENGINE.counts(r);
        if (good) right += 1;
        pts += good ? POINTS.correct : (r.correct ? POINTS.hinted : 0);
        STORE.countAnswer(good);
        const sk = STORE.skill(it.skillId);
        STORE.setSkill(it.skillId, { tries: sk.tries + 1, right: sk.right + (good ? 1 : 0), last: Date.now() });
        if (good) STORE.clearMissed(it.skillId, it.seed); else STORE.addMissed(it.skillId, it.seed);
        (perSkill[it.skillId] = perSkill[it.skillId] || []).push(good);
      });
      const changes = [];
      const bump = (sid, to) => {
        const from = STORE.skill(sid).level;
        if (to === from) return;
        STORE.setSkill(sid, { level: to });
        changes.push({ skillId: sid, from, to });
        if (to > from) pts += POINTS.levelUp[to] || 0;
      };
      if (s.kind === 'practice') {
        const sk = STORE.skill(s.skillId);
        STORE.setSkill(s.skillId, { sets: sk.sets + 1 });
        STORE.touchRecent(s.skillId);
        const level = sk.level;
        if (right === total) bump(s.skillId, Math.max(level, 3));
        else if (right / total >= 0.7) bump(s.skillId, Math.max(level, 2));
        else bump(s.skillId, Math.max(level, 1));
        pts += POINTS.set;
      } else if (s.kind === 'unit-test' || s.kind === 'course-challenge' || s.kind === 'mastery-challenge') {
        Object.keys(perSkill).forEach(sid => {
          const level = STORE.skill(sid).level;
          const good = perSkill[sid].every(Boolean);
          if (good) bump(sid, level < 2 ? 2 : Math.min(4, level + 1));
          else bump(sid, Math.max(1, level - 1));
        });
        pts += s.kind === 'unit-test' ? POINTS.unitTest : (s.kind === 'course-challenge' ? POINTS.challenge : 0);
      } else if (s.kind === 'mix') {
        // like practice, spread over skills: every question of a skill right → at least Familiar; never lowers
        Object.keys(perSkill).forEach(sid => {
          const level = STORE.skill(sid).level;
          bump(sid, perSkill[sid].every(Boolean) ? Math.max(level, 2) : Math.max(level, 1));
          STORE.touchRecent(sid);
        });
        pts += POINTS.set;
      } else if (s.kind === 'review') {
        // review changes no levels; getting one right only clears it from the list, which happened above
      }
      STORE.addPoints(pts);
      STORE.logEvent({ kind: s.kind, course: s.courseId, unit: s.unitId, skill: s.skillId || null, cpm: s.cpm || null, title: s.kind === 'mix' ? s.title : undefined, right, total, pts, changes });
      s.finished = { right, total, pts, changes };
      return s.finished;
    },

    /** mastery summary for a list of skill ids */
    mastery(skillIds) {
      const counts = [0, 0, 0, 0, 0];
      let points = 0;
      skillIds.forEach(sid => { const l = STORE.skill(sid).level; counts[l] += 1; points += A.LEVEL_POINTS[l]; });
      const possible = skillIds.length * 100;
      return { counts, points, possible, pct: possible ? Math.round(points / possible * 100) : 0 };
    },
  };

  if (typeof module !== 'undefined') module.exports = ENGINE;
  if (typeof window !== 'undefined') window.ENGINE = ENGINE;
})();
