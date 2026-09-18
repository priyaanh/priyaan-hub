#!/usr/bin/env node
/* test_science.js — checks science.js. A science question cannot be re-derived by arithmetic the way a
   maths one can, so what is checked here is the part that can be: that the answer is always among the
   options, that no option is offered twice, that the options are the same kind of thing as the answer,
   that the facts a question depends on agree with the tables they came from, and that the marking
   accepts the right answer and refuses every other option. Run: node test_science.js */
'use strict';
const SCI = require('./science.js');

let checks = 0, failures = 0;
const shown = new Set();
function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; const k = msg.slice(0, 60); if (!shown.has(k)) { shown.add(k); console.log('  FAIL: ' + msg); } }
  return !!cond;
}
const plain = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/* ---------------------------------------------------------------- the facts, written out here ------ */
{
  /* The order of the phases, spelled out independently of the generator. */
  const PHASES = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous',
    'full moon', 'waning gibbous', 'third quarter', 'waning crescent'];
  const ws = SCI.generate({ topics: ['moon'], count: 60, difficulty: 3, seed: 1234 });
  let checkedNext = 0, checkedPrev = 0;
  ws.problems.forEach(p => {
    const q = plain(p.question);
    let m = /^Which phase of the Moon comes straight after (.+)\?$/.exec(q);
    if (m) {
      const i = PHASES.indexOf(m[1]);
      assert(i >= 0, 'moon: "' + m[1] + '" is not a phase');
      assert(p.answer === PHASES[(i + 1) % 8], 'moon: after ' + m[1] + ' comes ' + PHASES[(i + 1) % 8] + ', not ' + p.answer);
      checkedNext++;
    }
    m = /^Which phase comes straight before (.+)\?$/.exec(q);
    if (m) {
      const i = PHASES.indexOf(m[1]);
      assert(i >= 0, 'moon: "' + m[1] + '" is not a phase');
      assert(p.answer === PHASES[(i + 7) % 8], 'moon: before ' + m[1] + ' comes ' + PHASES[(i + 7) % 8] + ', not ' + p.answer);
      checkedPrev++;
    }
  });
  assert(checkedNext > 0 && checkedPrev > 0, 'moon: both orderings were asked (' + checkedNext + ' after, ' + checkedPrev + ' before)');

  /* The planets, in order, written out here. */
  const ORDER = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
  const sol = SCI.generate({ topics: ['solar'], count: 60, difficulty: 3, seed: 99 });
  let checkedOrder = 0;
  sol.problems.forEach(p => {
    const m = /^Which planet is (\d+)\w\w from the Sun\?$/.exec(plain(p.question));
    if (!m) return;
    assert(p.answer === ORDER[Number(m[1]) - 1], 'solar: the ' + ord(Number(m[1])) + ' planet is ' + ORDER[Number(m[1]) - 1] + ', not ' + p.answer);
    checkedOrder++;
  });
  assert(checkedOrder > 0, 'solar: the order of the planets was asked about');
  sol.problems.forEach(p => {
    if (!p.choices) return;
    p.choices.forEach(c => {
      if (/^Which planet|^Which is/.test(plain(p.question)))
        assert(ORDER.indexOf(c) >= 0, 'solar: "' + c + '" is offered as a planet but is not one');
    });
  });
}

/* ---------------------------------------------------------------- every question, every topic ------ */
const table = {};
const TOPIC_IDS = SCI.TOPICS.map(t => t.id);
TOPIC_IDS.forEach(id => { table[id] = { made: 0, mc: 0 }; });

for (const difficulty of [1, 2, 3]) {
  for (let seed = 1; seed <= 400; seed++) {
    for (const id of TOPIC_IDS) {
      const ws = SCI.generate({ topics: [id], count: 6, difficulty, seed: seed * 17 + difficulty });
      assert(ws.problems.length === 6, id + ': asked for six questions, got ' + ws.problems.length);
      ws.problems.forEach(p => {
        const row = table[id];
        row.made++;
        assert(plain(p.question).length > 8, id + ': question too short "' + plain(p.question) + '"');
        assert(String(p.answer).trim().length > 0, id + ': no answer for "' + plain(p.question) + '"');
        assert(!/undefined|NaN|\[object/.test(p.question + p.answer + p.work),
          id + ': junk in "' + plain(p.question) + '" / "' + p.answer + '"');
        assert(/\?$|:$/.test(plain(p.question)), id + ': not phrased as a question: "' + plain(p.question) + '"');
        /* the marking */
        assert(SCI.checkAnswer(p, p.answer), id + ': its own answer was marked wrong ("' + p.answer + '")');
        assert(SCI.checkAnswer(p, ' ' + String(p.answer).toUpperCase() + ' '), id + ': case and spaces should not matter');
        assert(!SCI.checkAnswer(p, 'zzz'), id + ': "zzz" was accepted');
        assert(!SCI.checkAnswer(p, ''), id + ': an empty answer was accepted');
        if (p.choices) {
          row.mc++;
          assert(p.choices.length >= 2 && p.choices.length <= 4, id + ': ' + p.choices.length + ' options for "' + plain(p.question) + '"');
          assert(p.choices.indexOf(String(p.answer)) >= 0, id + ': the answer is not among the options for "' + plain(p.question) + '"');
          assert(new Set(p.choices.map(c => String(c).toLowerCase().trim())).size === p.choices.length,
            id + ': an option is offered twice in "' + plain(p.question) + '": ' + JSON.stringify(p.choices));
          assert(p.choices.filter(c => String(c) === String(p.answer)).length === 1,
            id + ': more than one option is the answer in "' + plain(p.question) + '"');
          /* every other option must be marked wrong, or the question has two answers */
          p.choices.forEach(c => {
            if (String(c) === String(p.answer)) return;
            assert(!SCI.checkAnswer(p, c), id + ': "' + c + '" is also accepted for "' + plain(p.question) + '"');
          });
          /* options should be the same kind of thing: not one word against a sentence */
          const lens = p.choices.map(c => String(c).split(' ').length);
          assert(Math.max.apply(null, lens) <= Math.min.apply(null, lens) + 8,
            id + ': the options are wildly different lengths in "' + plain(p.question) + '": ' + JSON.stringify(p.choices));
        }
      });
    }
  }
}

/* ---------------------------------------------------------------- how it is asked for --------------- */
{
  const opts = { seed: 555, topics: ['moon', 'cells'], count: 12, difficulty: 2 };
  assert(JSON.stringify(SCI.generate(opts)) === JSON.stringify(SCI.generate(opts)), 'the same seed gives the same round');
  assert(JSON.stringify(SCI.generate({ seed: 1, count: 8 })) !== JSON.stringify(SCI.generate({ seed: 2, count: 8 })),
    'two seeds give two different rounds');
  [1, 5, 20, 47, 60].forEach(n => assert(SCI.generate({ seed: 3, count: n }).problems.length === n, 'asked for ' + n));
  assert(SCI.generate({ seed: 3, count: 500 }).problems.length === 60, 'a silly count is capped');
  assert(SCI.generate({ seed: 3, count: 0 }).problems.length === 1, 'a count of zero still gives one');
  assert(SCI.generate({ seed: 'x', count: 4 }).problems.length === 4, 'a nonsense seed still works');
  assert(SCI.generate({ count: 4 }).seed >= 0, 'no seed at all still works');
  assert(SCI.generate({ seed: 3, count: 4, difficulty: 9 }).difficulty === 2, 'a silly difficulty falls back to 2');
  assert(SCI.generate({ seed: 3, count: 4, topics: [] }).topics.length === TOPIC_IDS.length, 'no topics means every topic');
  let threw = false;
  try { SCI.generate({ seed: 1, topics: ['astrology'] }); } catch (e) { threw = true; }
  assert(threw, 'an unknown topic is refused rather than quietly ignored');
  /* a round of 30 should not repeat itself */
  for (let seed = 1; seed <= 200; seed++) {
    const ws = SCI.generate({ seed, count: 24, difficulty: 2 });
    const seen = {}; let dup = null;
    ws.problems.forEach(p => { if (seen[p.question]) dup = plain(p.question); seen[p.question] = 1; });
    assert(!dup, 'seed ' + seed + ' asks this twice: ' + dup);
  }
  /* every topic says which grades it is for, and describes itself */
  SCI.TOPICS.forEach(t => {
    assert(t.name && t.description && t.description.length > 20, t.id + ': needs a description');
    assert(SCI.BANDS[t.band], t.id + ': unknown grade band "' + t.band + '"');
    assert(t.unit && t.unit.length > 3, t.id + ': needs a strand');
  });
}

console.log('\n  topic          asked   multiple choice');
Object.keys(table).forEach(id => console.log('  ' + id.padEnd(14) + String(table[id].made).padStart(7) + String(table[id].mc).padStart(18)));
console.log('\n' + checks + ' checks, ' + failures + ' failure' + (failures === 1 ? '' : 's') +
  (failures ? '' : ' — every option checked against its answer'));
process.exit(failures ? 1 : 0);
