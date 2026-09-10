#!/usr/bin/env node
/* make_worksheet.js — make a printable Integrated Math 1 worksheet (with answer key) from the command line.
   CommonJS, no dependencies. Uses the same generators as math.html (im1.js).

   node make_worksheet.js --list
   node make_worksheet.js --topics linear,systems,exponents --count 20 --difficulty 2 --seed 42 --out worksheets/ */
'use strict';
const fs = require('fs');
const path = require('path');
const IM1 = require(path.join(__dirname, 'im1.js'));

const HELP = `Usage: node make_worksheet.js [options]

  --list                 print the topic table and exit
  --topics a,b,c         comma-separated topic ids (default: all topics)
  --count N              number of problems, 1-60 (default 20)
  --difficulty 1|2|3     1 warm-up, 2 standard, 3 challenge (default 2)
  --seed N               integer seed; the same seed always gives the same sheet (default: random, printed)
  --name "Priyaan"       prefill the Name line
  --title "..."          worksheet title (default "Integrated Math 1 Practice")
  --out <dir | file.html>
                         output directory (default worksheets/); a path ending in .html is written exactly
  --no-key               leave out the answer-key page
  --stdout               print the HTML instead of writing a file
  --help                 this text

Examples
  node make_worksheet.js --list
  node make_worksheet.js --topics linear,systems,exponents --count 20 --difficulty 2 --seed 42 --out worksheets/
  node make_worksheet.js --topics sequences --count 12 --difficulty 1 --name Priyaan --out worksheets/sequences.html
`;

function fail(msg) { process.stderr.write('make_worksheet: ' + msg + '\n\nRun with --help for usage.\n'); process.exit(1); }

function parseArgs(argv) {
  const args = [];
  argv.forEach(a => { const m = /^(--[a-z-]+)=(.*)$/s.exec(a); if (m) args.push(m[1], m[2]); else args.push(a); }); // allow --count=20
  const o = { topics: null, count: 20, difficulty: 2, seed: null, name: '', title: '', out: 'worksheets/', stdout: false, list: false, help: false, key: true };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const value = () => { if (i + 1 >= args.length) fail('Missing value after ' + a); return args[++i]; };
    switch (a) {
      case '--list': o.list = true; break;
      case '--help': case '-h': o.help = true; break;
      case '--stdout': o.stdout = true; break;
      case '--no-key': o.key = false; break;
      case '--topics': o.topics = value(); break;
      case '--count': o.count = value(); break;
      case '--difficulty': case '--level': o.difficulty = value(); break;
      case '--seed': o.seed = value(); break;
      case '--name': o.name = value(); break;
      case '--title': o.title = value(); break;
      case '--out': o.out = value(); break;
      default: fail('Unknown option "' + a + '"');
    }
  }
  return o;
}

function printList() {
  const w = Math.max(...IM1.TOPICS.map(t => t.id.length));
  console.log('Topics (' + IM1.TOPICS.length + '), by CPM Core Connections Integrated I chapter:\n');
  IM1.TOPICS.slice().sort((a, b) => a.chapter - b.chapter || IM1.TOPICS.indexOf(a) - IM1.TOPICS.indexOf(b)).forEach(t => {
    console.log('  ' + t.id.padEnd(w) + '  ' + t.unit.padEnd(11) + t.name);
    console.log('  ' + ' '.repeat(w) + '  ' + ' '.repeat(11) + t.description);
  });
  console.log('\nDifficulty: 1 warm-up · 2 standard · 3 challenge.  Example:\n  node make_worksheet.js --topics linear,systems --count 20 --difficulty 2 --seed 42');
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help) { process.stdout.write(HELP); return; }
  if (o.list) { printList(); return; }

  const count = Number(o.count);
  if (!Number.isInteger(count) || count < 1) fail('--count must be a whole number from 1 to 60 (got "' + o.count + '")');
  if (count > 60) process.stderr.write('make_worksheet: --count is capped at 60\n');
  const difficulty = Number(o.difficulty);
  if (![1, 2, 3].includes(difficulty)) fail('--difficulty must be 1, 2 or 3 (got "' + o.difficulty + '")');
  let seed = o.seed, randomSeed = false;
  if (seed == null) { seed = Math.floor(Math.random() * 1e9); randomSeed = true; }
  else if (!/^\d+$/.test(String(seed).trim())) fail('--seed must be a non-negative whole number (got "' + o.seed + '")');
  seed = Number(seed);

  let ws;
  try { ws = IM1.generate({ topics: o.topics, count, difficulty, seed }); }
  catch (e) { fail(e.message); }

  const html = IM1.renderWorksheet(ws, { title: o.title || undefined, name: o.name, showAnswers: o.key });
  if (o.stdout) { process.stdout.write(html); return; }

  let file;
  if (/\.html?$/i.test(o.out)) { file = o.out; fs.mkdirSync(path.dirname(file) || '.', { recursive: true }); }
  else {
    fs.mkdirSync(o.out, { recursive: true });
    const all = ws.topics.length === IM1.TOPICS.length;
    file = path.join(o.out, 'im1_' + (all ? 'all' : ws.topics.join('-')) + '_d' + ws.difficulty + '_s' + ws.seed + '.html');
  }
  fs.writeFileSync(file, html);
  console.log('Wrote ' + file);
  console.log('  ' + ws.problems.length + ' problems · topics ' + ws.topics.join(', ') + ' · difficulty ' + ws.difficulty + ' · seed ' + ws.seed + (randomSeed ? ' (random; pass --seed ' + ws.seed + ' to regenerate)' : ''));
}

main();
