#!/usr/bin/env node
/* test_quizbank.js — exercises every question in cpm_int2_ch1.js, including each 'gen' template over
   many seeds, and checks the things a person would notice: wording artefacts ("1x", "+ -8", "× 1"),
   choices that repeat or that contain the answer twice, numeric answers that are not numbers, and a
   marking rule that rejects the question's own answer or accepts a wrong one.
     node test_quizbank.js            all lessons
     node test_quizbank.js 1.3.2      one lesson */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'cpm_int2_ch1.js'), 'utf8'), ctx, { filename: 'cpm_int2_ch1.js' });
const BANK = ctx.window.CPM_QUIZZES;

function rng(seed) {
  let a = seed >>> 0;
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const only = process.argv[2];
const RUNS = Number(process.env.RUNS || 300);          // seeds per generated template

let checks = 0, fails = 0;
const seen = new Set();
function bad(where, why, detail) {
  const k = where + '|' + why;
  if (seen.has(k)) return;                             // one report per template per kind of problem
  seen.add(k);
  fails++;
  console.log('FAIL ' + where + ' — ' + why + (detail ? '\n        ' + detail : ''));
}
const ok = () => { checks++; };

/* Artefacts a generator produces when it forgets a special case. Every one of these has actually
   shipped in a maths generator on this site at some point. */
const ARTEFACTS = [
  [/(^|[^0-9a-z])1[a-z]\b/i, 'a coefficient of 1 written out ("1x")'],
  [/[+\-−]\s*[+\-−]/, 'two signs in a row ("+ -8")'],
  [/[+\-−]\s*0\b(?!\.)/, 'adding or subtracting zero'],
  [/[×*/]\s*1\b(?!\d|\/|\.)/, 'multiplying or dividing by 1'],
  [/\/\s*1\b(?!\d)/, 'a denominator of 1'],
  [/\bundefined\b|\bNaN\b|\bnull\b/, 'a value that did not compute'],
  [/\s{3,}/, 'a run of spaces'],
  [/\(\s*\)|\[\s*\]/, 'an empty bracket'],
  /* Only real words: "the angles marked a and c" and "an x-tile" are both correct English. */
  [/\ba (?!and\b)(?=(?:8|11|18)\b|[aeiou][a-z]{2,})/i, '"a" where it should be "an"'],
  [/\ban (?=[bcdfgjklmnpqrstvwyz][a-z]{2,})(?!hour)/i, '"an" where it should be "a"']
];
/* Entities become the character they stand for, not a blank: turning "x &lt; 0" into "x   0" would
   make it look like a run of spaces, and make it collide with "x &gt; 0". */
const ENT = { lt: '<', gt: '>', le: '\u2264', ge: '\u2265', ne: '\u2260', amp: '&', nbsp: ' ',
  deg: '\u00b0', times: '\u00d7', divide: '\u00f7', minus: '\u2212', plusmn: '\u00b1' };
const plain = s => String(s == null ? '' : s)
  .replace(/<sup>([^<]*)<\/sup>/gi, '^$1')
  .replace(/<\s*br\s*\/?>/gi, ' ')
  .replace(/<[^>]*>/g, '')
  .replace(/&([a-z]+);/gi, (m, e) => ENT[e.toLowerCase()] !== undefined ? ENT[e.toLowerCase()] : m)
  .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(Number(n)));

function checkItem(item, where) {
  if (!item) return bad(where, 'did not produce a question');
  ok();
  const q = plain(item.q);
  if (!q.trim()) return bad(where, 'empty question text');
  ok();
  ARTEFACTS.forEach(([re, why]) => {
    if (re.test(q)) bad(where, why, 'in: ' + q.slice(0, 100));
    else ok();
  });
  if (!item.explain || !String(item.explain).trim()) bad(where, 'no explanation');
  else ok();

  if (item.type === 'mc') {
    const c = item.choices || [];
    if (c.length < 2) return bad(where, 'fewer than two choices');
    ok();
    const norm = c.map(x => plain(x).trim().toLowerCase());
    if (new Set(norm).size !== norm.length) bad(where, 'two choices say the same thing', norm.join(' | '));
    else ok();
    if (norm.some(x => !x)) bad(where, 'an empty choice');
    else ok();
    if (!(item.answer >= 0 && item.answer < c.length)) bad(where, 'the answer is not one of the choices');
    else ok();
    ARTEFACTS.forEach(([re, why]) => { if (c.some(x => re.test(plain(x)))) bad(where, why + ' in a choice', c.join(' | ')); else ok(); });
    if (!BANK.checkAnswer(item, item.answer)) bad(where, 'its own answer is marked wrong');
    else ok();
    const other = (item.answer + 1) % c.length;
    if (BANK.checkAnswer(item, other)) bad(where, 'a different choice is also marked right');
    else ok();
  } else if (item.type === 'num') {
    if (!isFinite(item.answer)) return bad(where, 'the answer is not a number', String(item.answer));
    ok();
    if (!BANK.checkAnswer(item, String(item.answer))) bad(where, 'its own answer is marked wrong', String(item.answer));
    else ok();
    if (BANK.checkAnswer(item, String(item.answer + 7))) bad(where, 'a wrong number is marked right');
    else ok();
    if (BANK.checkAnswer(item, '')) bad(where, 'an empty answer is marked right');
    else ok();
  } else {
    if (!String(item.answer || '').trim()) return bad(where, 'no answer given');
    ok();
    if (!BANK.checkAnswer(item, item.answer)) bad(where, 'its own answer is marked wrong', String(item.answer));
    else ok();
    if (BANK.checkAnswer(item, 'zzqqzz')) bad(where, 'nonsense is marked right');
    else ok();
    (item.accept || []).forEach(a => {
      if (!BANK.checkAnswer(item, a)) bad(where, 'an answer it says it accepts is marked wrong', String(a));
      else ok();
    });
  }
}

/* ---------------------------------------------------------------------------------------------
   Phase two: re-derive the answer from the wording alone. The checks above say a question is well
   formed; these say it is right. Each rule reads the numbers out of the question the way a reader
   would and works the answer out independently of the code that produced it. */
const NAMES={triangle:3,quadrilateral:4,pentagon:5,hexagon:6,heptagon:7,octagon:8,nonagon:9,decagon:10,dodecagon:12};
const LONGEST=Object.keys(NAMES).sort((a,b)=>b.length-a.length);  /* "dodecagon" contains "decagon" */
const sides=t=>{for(const k of LONGEST) if(t.includes(k)) return NAMES[k];const m=t.match(/(\d+)-gon/);return m?+m[1]:null};
/* Each rule re-derives the answer from the wording alone, with no reference to how it was built. */
const RULES=[
 [/how many diagonals does a (.+?) have/i, m=>{const n=sides(m[1]);return n*(n-3)/2}],
 [/how many (?:sides|vertices|angles) does a (.+?) have/i, m=>sides(m[1])],
 [/what do the interior angles of a (.+?) add up to/i, m=>(sides(m[1])-2)*180],
 [/each interior angle of a regular (.+?) measures how many/i, m=>{const n=sides(m[1]);return (n-2)*180/n}],
 [/each exterior angle of a regular ([a-z-]+?) measures how many/i, m=>360/sides(m[1])],
 [/each exterior angle of a regular polygon measures (\d+)/i, m=>360/+m[1]],
 [/complementary\. one measures (\d+)/i, m=>90-+m[1]],
 [/supplementary\. one measures (\d+)/i, m=>180-+m[1]],
 [/two angles of a triangle measure (\d+). and (\d+)/i, m=>180-+m[1]-+m[2]],
 [/not next to a particular exterior angle measure (\d+). and (\d+)/i, m=>+m[1]+ +m[2]],
 [/apex angle of (\d+)/i, m=>(180-+m[1])/2],
 [/one angle measures (\d+). what is its (corresponding|alternate interior|alternate exterior|co-interior) angle/i, m=>m[2]==="co-interior"?180-+m[1]:+m[1]],
 [/alternate interior angles measure \((\d+)x \+ (\d+)\). and \((\d+)x \+ (\d+)\)/i, m=>(+m[4]-+m[2])/(+m[1]-+m[3])],
 [/co-interior angles measure \((\d+)x \+ (\d+)\). and \((\d+)x \+ (\d+)\)/i, m=>(180-(+m[2]+ +m[4]))/(+m[1]+ +m[3])],
 [/measures \((\d+)x \+ (\d+)\). and its corresponding angle measures (\d+)/i, m=>(+m[3]-+m[2])/+m[1]],
 [/figure 1 of a tile pattern has a perimeter of (\d+) units, figure 2 has (\d+),.*?perimeter of figure (\d+)/i, m=>{const d=+m[2]-+m[1];return d*+m[3]+(+m[1]-d)}],
 [/grows by (\d+) units every figure, and figure 1 has a perimeter of (\d+).*?perimeter of (\d+) units/i, m=>{const a=+m[1],b=+m[2]-a;return (+m[3]-b)/a}],
 [/figure 1 of a tile pattern has an area of (\d+) square units.*?area of figure (\d+)/i, m=>+m[1]*+m[2]*+m[2]],
 [/line y = (-?\d+)x ([+−-]) (\d+) cross the x-axis/i, m=>{const b=(m[2]==="+"?1:-1)*+m[3];return -b/+m[1]}],
 [/value of y does the line y = (-?\d+)x ([+−-]) (\d+) cross the y-axis/i, m=>(m[2]==="+"?1:-1)*+m[3]],
 [/(\d+) red, (\d+) blue and (\d+) green marbles.*?put back, (\d+) times over.*?expect to be (red|blue|green)/i,
   m=>{const c={red:+m[1],blue:+m[2],green:+m[3]};return +m[4]*c[m[5]]/(+m[1]+ +m[2]+ +m[3])}],
 [/fair (\d+)-sided die is rolled (\d+) times/i, m=>+m[2]/+m[1]],
 [/sample of (\d+) students, (\d+) walk.*?school.s (\d+) students/i, m=>+m[2]*(+m[3]/+m[1])]
];
let derived = 0, wrong = 0;
function rederive(item, where) {
  if (!item || item.type !== 'num') return;
  const q = plain(item.q);
  for (let r = 0; r < RULES.length; r++) {
    const m = q.match(RULES[r][0]);
    if (!m) continue;
    const want = RULES[r][1](m);
    if (want == null || !isFinite(want)) return;
    derived++;
    if (Math.abs(want - item.answer) > 1e-9) {
      wrong++;
      bad(where, 'the answer does not match the question', q.slice(0, 100) + '\n        says ' + item.answer + ', worked out from the wording it is ' + want);
    }
    return;
  }
}

let fixed = 0, templates = 0;
BANK.lessons.forEach(lesson => {
  if (only && lesson.id !== only) return;
  lesson.questions.forEach((def, idx) => {
    const where = lesson.id + ':' + idx;
    if (def.type === 'gen') {
      templates++;
      const shapes = new Set();
      for (let s = 1; s <= RUNS; s++) {
        const item = BANK.materialise(lesson.id, idx, rng(s * 7919));
        checkItem(item, where);
        rederive(item, where);
        /* the numbers of a diagram question live in its SVG, not its wording */
        if (item) shapes.add((plain(item.q) + '|' + (item.svg || '') + '|' + (item.choices || []).join(',')).replace(/-?\d+(\.\d+)?/g, '#'));
      }
      /* a template that always asks the identical question is a fixed question wearing a costume */
      if (shapes.size === 1) {
        const one = BANK.materialise(lesson.id, idx, rng(11));
        const two = BANK.materialise(lesson.id, idx, rng(999));
        const sig = it => plain(it.q) + '|' + (it.svg || '') + '|' + (it.choices || []).join(',') + '|' + it.answer;
        if (one && two && sig(one) === sig(two)) bad(where, 'a template that never varies', plain(one.q).slice(0, 80));
        else ok();
      } else ok();
    } else {
      fixed++;
      const one = BANK.materialise(lesson.id, idx, rng(1));
      checkItem(one, where);
      rederive(one, where);
    }
  });
});

console.log((fails ? '\n' : '') + checks + ' checks over ' + fixed + ' fixed questions and ' +
  templates + ' templates × ' + RUNS + ' seeds, ' + derived + ' answers re-derived from the wording, ' +
  fails + ' problem' + (fails === 1 ? '' : 's') + (fails ? '' : ' — the bank is clean'));
process.exit(fails ? 1 : 0);
