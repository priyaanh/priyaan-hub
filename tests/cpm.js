#!/usr/bin/env node
/* Checks the CPM book files in cpm/: every chapter and lesson number matches CPM's own homework-help
   site (tests/cpm-lessons.json), every lesson has a topic, and every linked skill exists.
     node tests/cpm.js                 every book named in index.html
     node tests/cpm.js cpm/int2.js     just that book */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
require('../lib/rng.js'); require('../lib/math.js'); require('../lib/content.js');
const A = global.ACADEMY;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
(html.match(/content\/[\w-]+\.js/g) || []).forEach(f => require(path.join(root, f)));
const official = JSON.parse(fs.readFileSync(path.join(__dirname, 'cpm-lessons.json'), 'utf8'));
const args = process.argv.slice(2);
const files = args.length ? args : [...new Set(html.match(/cpm\/[\w-]+\.js/g) || [])];
let fails = 0;
const fail = m => { fails++; console.log('FAIL ' + m); };
for (const f of files) {
  const p = path.resolve(root, f);
  if (!fs.existsSync(p)) { if (args.length) fail('missing ' + f); else console.log('skip ' + f + ' (not written yet)'); continue; }
  const before = A.cpm.length;
  try { require(p); } catch (e) { fail(`${f} threw while loading: ${e.message}`); continue; }
  const book = A.cpm[before];
  if (!book) { fail(`${f} did not call ACADEMY.cpmBook()`); continue; }
  const want = official[book.id];
  if (!want) { fail(`${book.id}: not one of ${Object.keys(official).join(', ')}`); continue; }
  ['title', 'short', 'band', 'homework', 'icon'].forEach(k => { if (!book[k]) fail(`${book.id}: missing ${k}`); });
  if (book.hue == null) fail(`${book.id}: missing hue`);
  if (book.homework !== want.homework) fail(`${book.id}: homework should be ${want.homework}`);
  const gotChapters = book.chapters.map(c => String(c.n));
  if (gotChapters.join() !== Object.keys(want.chapters).join()) fail(`${book.id}: chapters ${gotChapters.join(',')} should be ${Object.keys(want.chapters).join(',')}`);
  let lessons = 0, linked = 0, titled = 0;
  for (const ch of book.chapters) {
    if (!ch.title || typeof ch.title !== 'string') fail(`${book.id} ch ${ch.n}: missing chapter title`);
    const ids = ch.lessons.map(l => l.id), wantIds = want.chapters[String(ch.n)] || [];
    if (ids.join() !== wantIds.join()) fail(`${book.id} ch ${ch.n}: lessons [${ids.join(' ')}] should be [${wantIds.join(' ')}]`);
    for (const l of ch.lessons) {
      lessons++;
      if (l.title) titled++;
      if (l.title != null && (typeof l.title !== 'string' || !l.title.trim())) fail(`${book.id} ${l.id}: title must be a string or null`);
      if (!l.topic || typeof l.topic !== 'string' || l.topic.length < 12) fail(`${book.id} ${l.id}: topic missing or too short`);
      if (l.topic && l.topic.length > 160) fail(`${book.id} ${l.id}: topic over 160 characters`);
      if (l.skills.length > 4) fail(`${book.id} ${l.id}: more than 4 skills`);
      l.skills.forEach(id => { if (!A.skills[id]) fail(`${book.id} ${l.id}: no such skill ${id}`); });
      if (new Set(l.skills).size !== l.skills.length) fail(`${book.id} ${l.id}: a skill is listed twice`);
      if (l.skills.length) linked++;
    }
  }
  console.log(`${book.id}: ${book.chapters.length} chapters, ${lessons} lessons, ${titled} titled, ${linked} linked to practice (${Math.round(linked / Math.max(1, lessons) * 100)}%)`);
}
console.log(`${fails ? 'FAIL' : 'PASS'}: ${A.cpm.length} CPM book${A.cpm.length === 1 ? '' : 's'}; ${fails} problem${fails === 1 ? '' : 's'}`);
process.exit(fails ? 1 : 0);
