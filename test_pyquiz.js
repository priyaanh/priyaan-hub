#!/usr/bin/env node
/* test_pyquiz.js — checks the Python practice questions by RUNNING them.
   Generates a large sample, executes each snippet with python3 in a fresh namespace, and compares what it
   actually prints (or raises) with the answer the generator claims. Exit 1 on any mismatch. */
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { execFileSync } = require('child_process');
const PY = require(path.join(__dirname, 'pyquiz.js'));

let failures = 0, checks = 0;
const shown = new Set();
function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; const k = msg.slice(0, 60); if (!shown.has(k)) { shown.add(k); console.log('  FAIL: ' + msg); } }
  return !!cond;
}

const junk = /NaN|undefined|Infinity|\[object/;
const all = [];
for (const topic of PY.TOPICS) {
  for (const difficulty of [1, 2, 3]) {
    for (let seed = 1; seed <= 12; seed++) {
      const set = PY.generate({ topics: [topic.id], count: 20, difficulty, seed });
      assert(set.questions.length === 20, topic.id + ': count honoured (' + set.questions.length + ')');
      const again = PY.generate({ topics: [topic.id], count: 20, difficulty, seed });
      assert(JSON.stringify(again) === JSON.stringify(set), topic.id + ': deterministic for seed ' + seed);
      for (const q of set.questions) {
        assert(q.code && q.prompt && q.answer !== '', topic.id + ': fields present');
        assert(!junk.test(q.code + q.answer + q.explain), topic.id + ': junk in "' + q.code.replace(/\n/g, ' ⏎ ') + '"');
        assert(PY.checkAnswer(q, q.answer), topic.id + ': accepts its own answer "' + q.answer + '"');
        assert(!PY.checkAnswer(q, 'zzz-nonsense'), topic.id + ': rejects nonsense');
        if (q.choices) {
          assert(q.choices.length >= 2 && q.choices.length <= 4, topic.id + ': 2-4 choices (got ' + q.choices.length + ')');
          assert(new Set(q.choices).size === q.choices.length, topic.id + ': choices are distinct');
          assert(q.choices.indexOf(q.answer) >= 0, topic.id + ': the answer is among the choices');
        }
        all.push({ topic: topic.id, code: q.code, answer: q.answer, wantsError: /error does this raise/i.test(q.prompt) });
      }
    }
  }
}

/* Run every distinct snippet through python3 and compare. */
const distinct = [];
const seenCode = new Set();
for (const q of all) { if (!seenCode.has(q.code)) { seenCode.add(q.code); distinct.push(q); } }
console.log('test_pyquiz: running ' + distinct.length + ' distinct snippets through python3 …');

const runner = `
import json, sys, io, contextlib
cases = json.load(open(sys.argv[1]))
out = []
for c in cases:
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(c["code"], "<snippet>", "exec"), {})
        out.append({"printed": buf.getvalue().strip(), "error": None})
    except Exception as e:
        out.append({"printed": buf.getvalue().strip(), "error": type(e).__name__})
json.dump(out, open(sys.argv[2], "w"))
`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyquiz-'));
const inFile = path.join(dir, 'cases.json'), outFile = path.join(dir, 'out.json'), runFile = path.join(dir, 'run.py');
fs.writeFileSync(inFile, JSON.stringify(distinct.map(q => ({ code: q.code }))));
fs.writeFileSync(runFile, runner);
try {
  execFileSync('python3', [runFile, inFile, outFile], { stdio: ['ignore', 'ignore', 'pipe'] });
} catch (e) {
  console.log('  FAIL: could not run python3 — ' + String(e.stderr || e.message).slice(0, 200));
  process.exit(1);
}
const results = JSON.parse(fs.readFileSync(outFile, 'utf8'));
fs.rmSync(dir, { recursive: true, force: true });

const perTopic = {};
distinct.forEach((q, i) => {
  const r = results[i];
  perTopic[q.topic] = perTopic[q.topic] || { run: 0, bad: 0 };
  perTopic[q.topic].run++;
  const label = q.topic + ': "' + q.code.replace(/\n/g, ' ⏎ ') + '"';
  if (q.wantsError) {
    if (!assert(r.error === q.answer, label + ' should raise ' + q.answer + ' but ' + (r.error ? 'raised ' + r.error : 'printed "' + r.printed + '"'))) perTopic[q.topic].bad++;
  } else {
    if (!assert(!r.error, label + ' raised ' + r.error)) { perTopic[q.topic].bad++; return; }
    if (!assert(r.printed === q.answer, label + ' printed "' + r.printed + '" but the answer says "' + q.answer + '"')) perTopic[q.topic].bad++;
  }
});

console.log('\n  topic          snippets run  wrong');
Object.keys(perTopic).forEach(t => console.log('  ' + t.padEnd(15) + String(perTopic[t].run).padStart(12) + String(perTopic[t].bad).padStart(7)));
console.log('\n' + checks + ' checks, ' + failures + ' failure' + (failures === 1 ? '' : 's') + (failures ? '' : ' — every snippet matches what Python actually does'));
process.exit(failures ? 1 : 0);
