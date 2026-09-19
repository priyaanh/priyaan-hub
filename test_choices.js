#!/usr/bin/env node
/* test_choices.js — checks choices.js, which turns a generated question into a pick-one question and
   says how a wrong pick relates to the right answer. Run: node test_choices.js
   The rule for whyWrong is that it may only say things that are true of the two values in front of it.
   Anything it cannot read off them, it must say nothing about. */
'use strict';
const C = require('./choices.js');

let checks = 0, failures = 0;
function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; if (failures <= 20) console.log('  FAIL: ' + msg); }
  return !!cond;
}

/* ---------------------------------------------------------------- the shape of an answer ---------- */
{
  const shapes = [
    ['12', 'num'], ['-4', 'num'], ['3.5', 'num'], ['3/4', 'frac'], ['−3/4', 'frac'],
    ['$12.00', 'money'], ['−$3.00', 'money'], ['45%', 'percent'], ['(2, 5)', 'point'],
    ['{1, 2, 4}', 'set'], ['x = 6', 'eq:x='], ['y > 3', 'eq:y>'], ['bread', 'text:1'],
    ['to eat lunch', 'text:3'], ['a very long sentence indeed here', 'text:4']
  ];
  shapes.forEach(([v, want]) => assert(C.shapeOf(v) === want, 'shapeOf("' + v + '") gave ' + C.shapeOf(v) + ', wanted ' + want));
  assert(C.classOf('frac') === 'num' && C.classOf('money') === 'num', 'fractions and money count as numbers');
  assert(C.classOf('text:1') === 'text' && C.classOf('text:4') === 'text', 'words count as words');
  assert(C.numOf('3/4') === 0.75 && C.numOf('−$3.00') === -3 && C.numOf('bread') === null, 'reading a number out of an answer');
}

/* ---------------------------------------------------------------- building the options ------------ */
{
  const pool = [];
  for (let i = 1; i <= 20; i++) pool.push({ from: 'Slope', answer: String(i) });
  ['to run', 'to sleep', 'to open', 'to write'].forEach(a => pool.push({ from: 'Vocab', answer: a }));

  const items = [{ from: 'Slope', answer: '7' }, { from: 'Vocab', answer: 'to eat' }];
  const built = C.build(items, pool, 42);
  assert(built.length === 2, 'one built item per item in');
  built.forEach(it => {
    assert(it.choices && it.choices.length >= 2, 'every question got options');
    assert(it.choices.indexOf(String(it.answer)) >= 0, 'the answer is among its options');
    assert(it.choices.filter((c, i) => it.check('', i)).length === 1, 'exactly one option is right');
    assert(new Set(it.choices.map(c => c.toLowerCase())).size === it.choices.length, 'no option twice');
  });
  const words = built[1].choices;
  assert(words.every(c => /^to /.test(c)), 'a word answer is offered beside other words: ' + JSON.stringify(words));
  const nums = built[0].choices;
  assert(nums.every(c => /^\d+$/.test(c)), 'a number answer is offered beside other numbers: ' + JSON.stringify(nums));

  /* the same inputs always give the same options, so a round can be asked again exactly */
  assert(JSON.stringify(C.build(items, pool, 42)) === JSON.stringify(C.build(items, pool, 42)), 'same seed, same options');
  assert(JSON.stringify(C.build(items, pool, 43).map(i => i.choices)) !== JSON.stringify(built.map(i => i.choices)),
    'a different seed gives a different arrangement');

  /* nothing plausible to offer: leave it to be typed rather than invent a word */
  const lonely = C.build([{ from: 'Odd', answer: 'a sentence with no neighbours at all' }], [], 1);
  assert(!lonely[0].choices, 'a word answer with no neighbours is left to be typed');
  /* a number can always be nudged, so it never has to be typed */
  const num = C.build([{ from: 'Odd', answer: '42' }], [], 1);
  assert(num[0].choices && num[0].choices.length === 4, 'a number answer always gets four options');
  assert(num[0].choices.indexOf('42') >= 0, 'including the right one');

  /* options already written into the question are lifted out */
  const lettered = C.build([{ from: 'Data', q: 'Which one?<br>(a) first<br>(b) second<br>(c) third', answer: 'b' }], [], 5);
  assert(lettered[0].choices && lettered[0].choices.join('|') === 'first|second|third', 'lettered options are lifted: ' + JSON.stringify(lettered[0].choices));
  assert(lettered[0].answer === 'second', 'and the answer becomes the option itself');
  assert(lettered[0].q === 'Which one?', 'and the question keeps only its stem');
  assert(lettered[0].check('', 1) === true && lettered[0].check('', 0) === false, 'and it marks by position');

  /* anything that already had options is left alone */
  const already = C.build([{ from: 'X', answer: 'True', choices: ['True', 'False'] }], pool, 1);
  assert(already[0].choices.join() === 'True,False', 'existing options are left as they are');
}

/* ---------------------------------------------------------------- why a pick was wrong ------------ */
{
  const says = [
    ['12', '13', /one out/i],
    ['12', '15', /3 away/i],
    ['12', '−12', /wrong sign/i],
    ['x = 5', 'x = −5', /wrong sign/i],
    ['3/4', '4/3', /upside down/i],
    ['(2, 5)', '(5, 2)', /wrong way round/i],
    ['(2, 5)', '(2, −5)', /y value has the wrong sign/i],
    ['(2, 5)', '(−2, 5)', /x value has the wrong sign/i],
    ['45', '90', /twice the answer/i],
    ['90', '45', /half the answer/i],
    ['36', '6', /still has to be squared/i],
    ['6', '36', /squared when it should not/i],
    /* 10 squared is 100, so the squaring reads truer here than the decimal point would */
    ['100', '10', /still has to be squared/i],
    ['250', '25', /decimal point/i]
  ];
  says.forEach(([a, p, re]) => {
    const got = C.whyWrong(a, p);
    assert(re.test(got || ''), 'whyWrong("' + a + '", "' + p + '") said "' + got + '", wanted ' + re);
  });

  /* and, just as importantly, when it has nothing true to say it says nothing */
  const quiet = [
    ['bread', 'milk'], ['Rhombus', 'Kite'], ['soy', 'estoy'], ['y = 2x + 1', 'y = 3x − 2'],
    ['enero', 'marzo'], ['waxing crescent', 'first quarter']
  ];
  quiet.forEach(([a, p]) => assert(C.whyWrong(a, p) === '', 'whyWrong("' + a + '", "' + p + '") should say nothing, said "' + C.whyWrong(a, p) + '"'));
  assert(C.whyWrong('12', '12') === '', 'nothing to say when the pick was right');
  assert(C.whyWrong('', 'x') === '' && C.whyWrong('x', '') === '' && C.whyWrong(null, null) === '', 'nothing missing breaks it');

  /* it must never claim two things at once, or run on */
  says.concat([['7', '8']]).forEach(([a, p]) => {
    const got = C.whyWrong(a, p) || '';
    assert(got.length < 90, 'whyWrong stays short: "' + got + '"');
    assert(!got || /[.!]$/.test(got.trim()), 'whyWrong ends in a full stop: "' + got + '"');
  });
}

console.log('\n' + checks + ' checks, ' + failures + ' failure' + (failures === 1 ? '' : 's') +
  (failures ? '' : ' — options built and wrong picks explained'));
process.exit(failures ? 1 : 0);
