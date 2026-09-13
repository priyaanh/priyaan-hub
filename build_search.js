#!/usr/bin/env node
/* build_search.js — writes search_index.js, the small index the hub's search box reads.
   Run it after changing any content (badges, Hindi words, quiz lessons, maths or Python topics):
     node build_search.js
   Keeping it as a generated file means the hub loads ~40 KB instead of every data file on the site. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = __dirname;

function loadBrowserScript(file, globals) {
  const ctx = Object.assign({ window: {}, screen: {}, document: { querySelector: () => null } }, globals || {});
  ctx.window = ctx.window || {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
  return ctx;
}

const entries = [];
const add = (icon, title, sub, url, keywords) => entries.push({ i: icon, t: title, s: sub, u: url, k: (keywords || '').toLowerCase() });

/* the apps themselves */
[['🎹', 'Piano Practice', 'Log practice, streaks, metronome, printable log', 'piano.html', 'music trinity grade 4 metronome tempo practice log'],
 ['🏕️', 'Merit Badges', 'Checklists, all 139 badges, Trail to Eagle', 'badges.html', 'scouts scouting eagle counselor workbook requirements'],
 ['🧮', 'Math Worksheets', 'Integrated Math 1 worksheets and practice', 'math.html', 'cpm algebra worksheet printable answer key'],
 ['📝', 'Lesson Quizzes', 'A quiz per CPM Integrated II lesson', 'quizzes.html', 'cpm geometry quiz test lesson'],
 ['📖', 'Hindi Flashcards', 'Malhar Class 6 and 7 vocabulary', 'hindi.html', 'हिंदी malhar ncert vocabulary flashcards devanagari'],
 ['📅', 'Weekly Plan', 'The week, with checkboxes and tasks due', 'schedule.html', 'timetable routine chores homework'],
 ['🐍', 'Python Practice', 'What does this print? Eleven topics', 'python.html', 'code coding programming'],
 ['✏️', 'Make Practice', 'A worksheet by grade, or from a PDF', 'ai.html', 'grade 6 7 8 worksheet pdf chatgpt claude packet'],
 ['🗓️', 'Calendar & Tasks', 'Google Calendar and Google Tasks', 'calendar.html', 'google events todo reminders'],
 ['📈', 'Progress', 'Streaks, accuracy, practice time, every app at once', 'progress.html', 'streak history chart stats calendar heatmap records minutes accuracy']
].forEach(a => add(a[0], a[1], a[2], a[3], a[4]));

/* merit badges */
const mb = loadBrowserScript('badges_catalog.js');
(mb.window.MB.CATALOG || []).forEach(b => {
  add(b.emoji || '🎖️', b.name, 'Merit badge · ' + (b.cat || '') + (b.eagle === 'required' ? ' · Eagle-required' : ''),
    'badges.html#' + b.id, b.name + ' ' + (b.cat || '') + ' merit badge scout ' + (b.eagle ? 'eagle' : ''));
});

/* Hindi chapters and every word */
const hindi = require('./hindi_data.js');
const chapterById = {};
(hindi.CHAPTERS || []).forEach(c => {
  chapterById[c.id] = c;
  add('📖', c.title, 'Class ' + c.cls + ' chapter ' + c.n + ' · ' + c.genre + (c.author ? ' · ' + c.author : ''),
    'hindi.html#' + c.id, c.title + ' ' + (c.author || '') + ' ' + c.genre + ' hindi malhar class ' + c.cls);
});
(hindi.CARDS || []).forEach(w => {
  const ch = chapterById[w.ch];
  add('🔤', w.hi + ' — ' + w.en, 'Hindi word · ' + (ch ? ch.title : w.ch),
    'hindi.html#' + w.ch, w.hi + ' ' + w.tr + ' ' + w.en + ' ' + (w.hint || ''));
});

/* CPM lessons */
const cpm = loadBrowserScript('cpm_int2_ch1.js');
((cpm.window.CPM_QUIZZES || {}).lessons || []).forEach(l => {
  add('📝', l.id + ' · ' + l.title, 'CPM lesson · ' + (l.focus || []).slice(0, 2).join(' · '),
    'quizzes.html#' + l.id, l.id + ' ' + l.title + ' ' + (l.focus || []).join(' ') + ' quiz cpm');
});

/* maths topics: Integrated 1 and the school grades */
const im1 = require('./im1.js');
(im1.TOPICS || []).forEach(t => add('🧮', t.name, 'Integrated Math 1 · ' + t.unit, 'math.html', t.name + ' ' + t.description));
const grades = require('./grades.js');
(grades.LEVELS || []).forEach(g => {
  add('✏️', g.name, 'Worksheets · ' + g.sub, 'ai.html#' + g.id, g.name + ' ' + g.sub + ' worksheet practice');
  (g.topics || []).forEach(t => add('✏️', t.name, g.name + ' topic', 'ai.html#' + g.id, t.name + ' ' + t.description + ' ' + g.name));
});

/* Python topics */
const py = require('./pyquiz.js');
(py.TOPICS || []).forEach(t => add('🐍', t.name, 'Python topic', 'python.html#' + t.id, t.name + ' ' + t.description + ' python'));

/* dedupe on title + url, then write */
const seen = new Set();
const out = entries.filter(e => { const k = e.t + '|' + e.u; if (seen.has(k)) return false; seen.add(k); return true; });

/* A result that opens nothing is worse than no result, and a typo here is invisible until someone
   searches for that one word. Check every link before writing the file. */
const problems = [];
const handlesHash = {};
out.forEach(e => {
  const hash = e.u.indexOf('#'), file = hash < 0 ? e.u : e.u.slice(0, hash);
  const exists = fs.existsSync(path.join(root, file));
  if (!exists) { problems.push(e.t + ' → ' + e.u + ' (no such file)'); return; }
  if (hash >= 0) {
    if (hash === e.u.length - 1) problems.push(e.t + ' → ' + e.u + ' (empty fragment)');
    if (handlesHash[file] === undefined)
      handlesHash[file] = /location\.hash/.test(fs.readFileSync(path.join(root, file), 'utf8'));
    if (!handlesHash[file]) problems.push(e.t + ' → ' + e.u + ' (' + file + ' ignores the fragment)');
  }
  if (!e.t || !e.u) problems.push(JSON.stringify(e) + ' (missing title or url)');
});
if (problems.length) {
  console.error('search_index.js NOT written — ' + problems.length + ' bad link' + (problems.length === 1 ? '' : 's') + ':');
  problems.slice(0, 20).forEach(p => console.error('  ' + p));
  process.exit(1);
}

const js = '/* search_index.js — generated by build_search.js. Do not edit by hand; run `node build_search.js`. */\n' +
  'window.PH_SEARCH = ' + JSON.stringify(out) + ';\n';
fs.writeFileSync(path.join(root, 'search_index.js'), js);
const kinds = {};
out.forEach(e => { const k = (e.s.split('·')[0] || '').trim() || 'app'; kinds[k] = (kinds[k] || 0) + 1; });
console.log('search_index.js: ' + out.length + ' entries, ' + Math.round(js.length / 1024) + ' KB');
Object.keys(kinds).sort().forEach(k => console.log('  ' + k.padEnd(22) + kinds[k]));
