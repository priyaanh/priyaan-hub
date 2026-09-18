#!/usr/bin/env node
/* build_search.js — writes search_index.js, the small index the hub's search box reads.
   Run it after changing any content (badges, Hindi words, quiz lessons, maths or Python topics):
     node build_search.js
   Keeping it as a generated file means the hub loads ~40 KB instead of every data file on the site. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = __dirname;

/* Runs one or more browser-only scripts in a shared context, in order: a question bank can be split
   across files, with the later ones adding to what the first one set up. */
function loadBrowserScript(file, more) {
  const files = [file].concat(Array.isArray(more) ? more : (typeof more === 'string' ? [more] : []));
  const globals = (more && typeof more === 'object' && !Array.isArray(more)) ? more : null;
  const ctx = Object.assign({ window: {}, screen: {}, document: { querySelector: () => null } }, globals || {});
  ctx.window = ctx.window || {};
  vm.createContext(ctx);
  files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
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
 ['💬', 'Spanish Practice', 'Endless Spanish questions, marked on the page', 'spanish.html', 'español verbs ser estar conjugation vocabulary numbers time gustar'],
 ['🔬', 'Science', 'Moon phases, energy, cells, rocks and more, asked as multiple choice', 'ask.html#science', 'science moon planets solar system seasons matter water cycle energy forces cells food chain atoms light sound rocks'],
 ['🗨️', 'Ask for Practice', 'Say what to practise and get asked it, multiple choice', 'ask.html', 'chat ask question quiz multiple choice explain why maths spanish python lesson grade'],
 ['✏️', 'Make Practice', 'A worksheet by grade, or from a PDF', 'ai.html', 'grade 6 7 8 worksheet pdf chatgpt claude packet'],
 ['🗓️', 'Calendar & Tasks', 'Google Calendar and Google Tasks', 'calendar.html', 'google events todo reminders'],
 ['📈', 'Progress', 'Streaks, accuracy, practice time, every app at once', 'progress.html', 'streak history chart stats calendar heatmap records minutes accuracy'],
 ['🎯', 'Review Mistakes', 'Questions you got wrong, asked again until you have it', 'review.html', 'mistakes wrong missed retry redo practice again spaced repetition weak topics'],
 ['👤', 'Profile', 'Your name, the colours, and everything this hub has saved', 'profile.html', 'settings name theme colours dark light backup restore sync gist storage account device']
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
const cpm = loadBrowserScript('cpm_int2_ch1.js', 'cpm_int2_ch2.js');
((cpm.window.CPM_QUIZZES || {}).lessons || []).forEach(l => {
  add('📝', l.id + ' · ' + l.title, 'CPM lesson · ' + (l.focus || []).slice(0, 2).join(' · '),
    'quizzes.html#' + l.id, l.id + ' ' + l.title + ' ' + (l.focus || []).join(' ') + ' quiz cpm');
});

/* maths topics: Integrated 1 and the school grades */
const im1 = require('./im1.js');
(im1.TOPICS || []).forEach(t => add('🧮', t.name, 'Integrated Math 1 · ' + t.unit, 'math.html#' + t.id, t.name + ' ' + t.description));
const grades = require('./grades.js');
(grades.LEVELS || []).forEach(g => {
  add('✏️', g.name, 'Worksheets · ' + g.sub, 'ai.html#' + g.id, g.name + ' ' + g.sub + ' worksheet practice');
  (g.topics || []).forEach(t => add('✏️', t.name, g.name + ' topic', 'ai.html#' + g.id, t.name + ' ' + t.description + ' ' + g.name));
});

/* Spanish topics, and the words themselves */
const es = require('./spanish.js');
(es.TOPICS || []).forEach(t => add('💬', t.name, 'Spanish · ' + t.unit, 'spanish.html#' + t.id, t.name + ' ' + t.description + ' spanish español'));
(es.VOCAB || []).forEach(w => add('💬', w.es, 'Spanish · ' + w.en, 'spanish.html#vocab', w.es + ' ' + w.en + ' spanish español ' + (w.set || '')));

/* science topics, asked in the thread */
const sci = require('./science.js');
(sci.TOPICS || []).forEach(t => add('🔬', t.name, 'Science · ' + t.unit + ' · ' + (sci.BANDS[t.band] || ''), 'ask.html#' + t.id,
  t.name + ' ' + t.description + ' ' + t.unit + ' science'));

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
