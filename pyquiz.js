/* pyquiz.js — Python practice questions, generated on the device.
   Every question is built so its answer is known by construction: the generator picks the values first and
   writes the snippet around them, so nothing has to be executed to know what it prints.
     PY.TOPICS              -> [{ id, name, description }]
     PY.generate(opts)      -> { seed, difficulty, topics, questions: [...] }
     PY.checkAnswer(q, s)   -> boolean
   A question is { id, topic, topicName, code, prompt, answer, accept, explain, choices? }. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PY = factory();
})(this, function () {
  'use strict';

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  function shuffle(r, a) { var b = a.slice(), i, j, t;
    for (i = b.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
  function Q(o) { return { code: o.code || '', prompt: o.prompt, answer: String(o.answer), accept: o.accept || [], explain: o.explain || '', choices: o.choices || null }; }
  function pyList(a) { return '[' + a.join(', ') + ']'; }
  function pyStrList(a) { return '[' + a.map(function (x) { return "'" + x + "'"; }).join(', ') + ']'; }

  var NAMES = ['priyaan', 'maya', 'arjun', 'nina', 'diego', 'leena'];
  var WORDS = ['python', 'banana', 'rocket', 'guitar', 'planet', 'yellow', 'garden', 'silver'];
  var FRUIT = ['apple', 'mango', 'pear', 'plum', 'fig', 'kiwi'];

  var TOPICS = [
    { id: 'types', name: 'Variables & types', description: 'What type is it, and what does the arithmetic give?',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) {
          var vals = [['7', 'int'], ['7.0', 'float'], ["'7'", 'str'], ['True', 'bool'], ['[7]', 'list'], ["{'a': 7}", 'dict']];
          var v = pick(r, vals);
          var others = shuffle(r, ['int', 'float', 'str', 'bool', 'list', 'dict'].filter(function (x) { return x !== v[1]; })).slice(0, 3);
          return Q({ code: 'x = ' + v[0] + '\nprint(type(x).__name__)', prompt: 'What does this print?',
            answer: v[1], choices: shuffle(r, others.concat([v[1]])), explain: v[0] + ' is a ' + v[1] + '.' });
        }
        if (k === 2) {
          var a = ri(r, 2, 12), b = ri(r, 2, 9);
          return Q({ code: 'print(' + a + ' // ' + b + ')', prompt: 'What does this print?', answer: String(Math.floor(a / b)),
            explain: '// divides and throws away the remainder: ' + a + ' ÷ ' + b + ' = ' + (a / b).toFixed(2) + ' → ' + Math.floor(a / b) + '.' });
        }
        if (k === 3) {
          var c = ri(r, 5, 40), e = ri(r, 2, 9);
          return Q({ code: 'print(' + c + ' % ' + e + ')', prompt: 'What does this print?', answer: String(c % e),
            explain: '% gives the remainder: ' + c + ' = ' + e + '×' + Math.floor(c / e) + ' + ' + (c % e) + '.' });
        }
        var n = ri(r, 2, 9), m = ri(r, 2, 4);
        return Q({ code: 'print(' + n + ' ** ' + m + ')', prompt: 'What does this print?', answer: String(Math.pow(n, m)),
          explain: '** is a power: ' + n + ' to the power ' + m + '.' });
      } },

    { id: 'strings', name: 'Strings', description: 'Indexing, slicing, length and the common string methods.',
      gen: function (r, d) {
        var w = pick(r, WORDS), k = ri(r, 1, 5);
        if (k === 1) { var i = ri(r, 0, w.length - 1);
          return Q({ code: "word = '" + w + "'\nprint(word[" + i + "])", prompt: 'What does this print?', answer: w[i],
            explain: 'Indexing starts at 0, so position ' + i + " is '" + w[i] + "'." }); }
        if (k === 2) { var a = ri(r, 0, 2), b = a + ri(r, 2, 3);
          return Q({ code: "word = '" + w + "'\nprint(word[" + a + ':' + b + "])", prompt: 'What does this print?', answer: w.slice(a, b),
            explain: 'A slice takes from ' + a + ' up to but not including ' + b + '.' }); }
        if (k === 3) return Q({ code: "word = '" + w + "'\nprint(len(word))", prompt: 'What does this print?', answer: String(w.length),
          explain: "'" + w + "' has " + w.length + ' letters.' });
        if (k === 4) return Q({ code: "word = '" + w + "'\nprint(word.upper())", prompt: 'What does this print?', answer: w.toUpperCase(),
          explain: '.upper() returns the string in capitals.' });
        var sep = pick(r, [' ', ',']);
        var parts = shuffle(r, FRUIT).slice(0, 3);
        return Q({ code: "s = '" + parts.join(sep) + "'\nprint(len(s.split('" + sep + "')))", prompt: 'What does this print?',
          answer: '3', explain: ".split() cuts the string at each '" + sep + "', giving " + parts.length + ' pieces.' });
      } },

    { id: 'lists', name: 'Lists', description: 'Indexing, slicing, append and pop, length and sorting.',
      gen: function (r, d) {
        var n = ri(r, 4, 6), nums = [], i;
        for (i = 0; i < n; i++) nums.push(ri(r, 1, 30));
        var k = ri(r, 1, 5);
        if (k === 1) { var j = ri(r, 0, n - 1);
          return Q({ code: 'nums = ' + pyList(nums) + '\nprint(nums[' + j + '])', prompt: 'What does this print?', answer: String(nums[j]),
            explain: 'Counting from 0, position ' + j + ' holds ' + nums[j] + '.' }); }
        if (k === 2) return Q({ code: 'nums = ' + pyList(nums) + '\nprint(nums[-1])', prompt: 'What does this print?', answer: String(nums[n - 1]),
          explain: '-1 means the last item.' });
        if (k === 3) { var add = ri(r, 1, 30);
          return Q({ code: 'nums = ' + pyList(nums) + '\nnums.append(' + add + ')\nprint(len(nums))', prompt: 'What does this print?',
            answer: String(n + 1), explain: 'append adds one item, so the length goes from ' + n + ' to ' + (n + 1) + '.' }); }
        if (k === 4) return Q({ code: 'nums = ' + pyList(nums) + '\nnums.pop()\nprint(nums[-1])', prompt: 'What does this print?',
          answer: String(nums[n - 2]), explain: 'pop() removes the last item, so the new last item is ' + nums[n - 2] + '.' });
        var sorted = nums.slice().sort(function (a, b) { return a - b; });
        return Q({ code: 'nums = ' + pyList(nums) + '\nprint(sorted(nums)[0])', prompt: 'What does this print?', answer: String(sorted[0]),
          explain: 'sorted() puts them in order, so the first is the smallest.' });
      } },

    { id: 'loops', name: 'Loops', description: 'What a for or while loop prints or adds up.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) { var stop = ri(r, 3, 8);
          var total = stop * (stop - 1) / 2;
          return Q({ code: 'total = 0\nfor i in range(' + stop + '):\n    total += i\nprint(total)', prompt: 'What does this print?',
            answer: String(total), explain: 'range(' + stop + ') is 0 to ' + (stop - 1) + ', and those add to ' + total + '.' }); }
        if (k === 2) { var start = ri(r, 1, 5), end = start + ri(r, 3, 6), step = pick(r, [1, 2]);
          var count = Math.ceil((end - start) / step);
          return Q({ code: 'n = 0\nfor i in range(' + start + ', ' + end + ', ' + step + '):\n    n += 1\nprint(n)', prompt: 'What does this print?',
            answer: String(count), explain: 'From ' + start + ' up to (not including) ' + end + ' in steps of ' + step + ' gives ' + count + ' numbers.' }); }
        if (k === 3) { var word = pick(r, WORDS);
          var inWord = word.split('').filter(function (c, i2, arr) { return arr.indexOf(c) === i2; });
          var letter = r() < 0.8 ? pick(r, inWord) : pick(r, ['a', 'e', 'o', 'n', 'r', 'z']);
          var times = word.split(letter).length - 1;
          return Q({ code: "count = 0\nfor ch in '" + word + "':\n    if ch == '" + letter + "':\n        count += 1\nprint(count)",
            prompt: 'What does this print?', answer: String(times), explain: "'" + word + "' contains '" + letter + "' " + times + ' time' + (times === 1 ? '' : 's') + '.' }); }
        var limit = ri(r, 3, 7), doubleStart = 1, steps = 0, v = doubleStart;
        while (v < Math.pow(2, limit)) { v *= 2; steps++; }
        return Q({ code: 'n = 1\nsteps = 0\nwhile n < ' + Math.pow(2, limit) + ':\n    n *= 2\n    steps += 1\nprint(steps)',
          prompt: 'What does this print?', answer: String(steps), explain: 'Doubling from 1 reaches ' + Math.pow(2, limit) + ' after ' + steps + ' steps.' });
      } },

    { id: 'conditionals', name: 'If / elif / else', description: 'Which branch runs, and what comes out.',
      gen: function (r, d) {
        var x = ri(r, 1, 100), lo = ri(r, 20, 40), hi = lo + ri(r, 20, 40);
        var out = x < lo ? 'small' : x < hi ? 'medium' : 'large';
        var k = ri(r, 1, 2);
        if (k === 1) return Q({
          code: 'x = ' + x + '\nif x < ' + lo + ":\n    print('small')\nelif x < " + hi + ":\n    print('medium')\nelse:\n    print('large')",
          prompt: 'What does this print?', answer: out, choices: ['small', 'medium', 'large'],
          explain: x + (out === 'small' ? ' is below ' + lo : out === 'medium' ? ' is between ' + lo + ' and ' + hi : ' is at least ' + hi) + '.' });
        var a = ri(r, 1, 20), b = ri(r, 1, 20);
        var res = (a > b) && (a % 2 === 0);
        return Q({ code: 'a = ' + a + '\nb = ' + b + '\nprint(a > b and a % 2 == 0)', prompt: 'What does this print?',
          answer: res ? 'True' : 'False', choices: ['True', 'False'],
          explain: 'a > b is ' + (a > b) + ' and a is ' + (a % 2 === 0 ? 'even' : 'odd') + ', so both parts are ' + (res ? 'true' : 'not both true') + '.' });
      } },

    { id: 'functions', name: 'Functions', description: 'Defining, calling, returning and default arguments.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var m = ri(r, 2, 9), c = ri(r, 1, 20), arg = ri(r, 2, 12);
          return Q({ code: 'def f(x):\n    return ' + m + ' * x + ' + c + '\n\nprint(f(' + arg + '))', prompt: 'What does this print?',
            answer: String(m * arg + c), explain: m + ' × ' + arg + ' + ' + c + ' = ' + (m * arg + c) + '.' }); }
        if (k === 2) { var base = ri(r, 2, 9), def = ri(r, 2, 5);
          return Q({ code: 'def power(n, p=' + def + '):\n    return n ** p\n\nprint(power(' + base + '))', prompt: 'What does this print?',
            answer: String(Math.pow(base, def)), explain: 'p was left out, so the default ' + def + ' is used: ' + base + ' ** ' + def + '.' }); }
        var w = pick(r, NAMES);
        return Q({ code: 'def greet(name):\n    return "hi " + name\n\nmsg = greet("' + w + '")\nprint(len(msg))', prompt: 'What does this print?',
          answer: String(3 + w.length), explain: '"hi " is 3 characters plus ' + w.length + ' for the name.' });
      } },

    { id: 'dicts', name: 'Dictionaries', description: 'Looking things up, .get(), keys and updating.',
      gen: function (r, d) {
        var keys = shuffle(r, FRUIT).slice(0, 3);
        var vals = keys.map(function () { return ri(r, 1, 20); });
        var src = '{' + keys.map(function (k2, i) { return "'" + k2 + "': " + vals[i]; }).join(', ') + '}';
        var k = ri(r, 1, 4);
        if (k === 1) { var i2 = ri(r, 0, 2);
          return Q({ code: 'stock = ' + src + "\nprint(stock['" + keys[i2] + "'])", prompt: 'What does this print?', answer: String(vals[i2]),
            explain: "The value stored under '" + keys[i2] + "' is " + vals[i2] + '.' }); }
        if (k === 2) { var missing = pick(r, FRUIT.filter(function (x) { return keys.indexOf(x) < 0; }));
          return Q({ code: 'stock = ' + src + "\nprint(stock.get('" + missing + "', 0))", prompt: 'What does this print?', answer: '0',
            explain: "'" + missing + "' is not a key, so .get() returns the fallback 0." }); }
        if (k === 3) return Q({ code: 'stock = ' + src + '\nprint(len(stock))', prompt: 'What does this print?', answer: '3',
          explain: 'There are 3 key/value pairs.' });
        var add = ri(r, 1, 20);
        return Q({ code: 'stock = ' + src + "\nstock['" + keys[0] + "'] = " + add + "\nprint(stock['" + keys[0] + "'])",
          prompt: 'What does this print?', answer: String(add), explain: 'Assigning to an existing key replaces its value.' });
      } },

    { id: 'errors', name: 'Errors', description: 'Which error a snippet raises, and why.',
      gen: function (r, d) {
        var cases = [
          { code: 'nums = [1, 2, 3]\nprint(nums[5])', answer: 'IndexError', why: 'There is no position 5 in a list of 3.' },
          { code: "d = {'a': 1}\nprint(d['b'])", answer: 'KeyError', why: "There is no key 'b'." },
          { code: "print('7' + 7)", answer: 'TypeError', why: 'A string and a number cannot be added.' },
          { code: 'print(10 / 0)', answer: 'ZeroDivisionError', why: 'Dividing by zero is not allowed.' },
          { code: "print(int('hello'))", answer: 'ValueError', why: "'hello' cannot be read as a number." },
          { code: 'print(total)', answer: 'NameError', why: 'total was never given a value.' }
        ];
        var c = pick(r, cases);
        var others = shuffle(r, cases.filter(function (x) { return x.answer !== c.answer; })).slice(0, 3).map(function (x) { return x.answer; });
        return Q({ code: c.code, prompt: 'Which error does this raise?', answer: c.answer,
          choices: shuffle(r, others.concat([c.answer])), explain: c.why });
      } }
  ];
  var BY_ID = {}; TOPICS.forEach(function (t) { BY_ID[t.id] = t; });

  function generate(opts) {
    opts = opts || {};
    var wanted = Array.isArray(opts.topics) && opts.topics.length
      ? TOPICS.filter(function (t) { return opts.topics.indexOf(t.id) >= 0; }) : TOPICS;
    if (!wanted.length) wanted = TOPICS;
    var raw = (opts.count == null || opts.count === '') ? 10 : Number(opts.count);
    var count = isFinite(raw) ? Math.min(40, Math.max(1, Math.round(raw))) : 10;
    var difficulty = [1, 2, 3].indexOf(Number(opts.difficulty)) >= 0 ? Number(opts.difficulty) : 2;
    var seed = isFinite(Number(opts.seed)) ? Number(opts.seed) >>> 0 : (Math.random() * 1e9) >>> 0;
    var r = rng(seed);
    var order = [], i;
    for (i = 0; i < count; i++) order.push(wanted[i % wanted.length]);
    order = shuffle(r, order);
    var out = [], seen = {};
    for (i = 0; i < order.length; i++) {
      var topic = order[i], q = null, guard;
      for (guard = 0; guard < 40; guard++) {
        q = topic.gen(r, difficulty);
        if (q && q.prompt && !seen[q.code + q.prompt]) break;
      }
      if (!q || !q.prompt) continue;
      seen[q.code + q.prompt] = 1;
      out.push({ id: 'q' + (out.length + 1), topic: topic.id, topicName: topic.name, code: q.code, prompt: q.prompt,
        answer: q.answer, accept: q.accept, explain: q.explain, choices: q.choices });
    }
    return { seed: seed, difficulty: difficulty, topics: wanted.map(function (t) { return t.id; }), questions: out };
  }

  function norm(s) {
    return String(s == null ? '' : s).trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, ' ').toLowerCase();
  }
  function checkAnswer(q, typed) {
    if (!q || typed == null || String(typed).trim() === '') return false;
    var want = [q.answer].concat(q.accept || []).map(norm);
    var got = norm(typed);
    if (want.indexOf(got) >= 0) return true;
    var gn = Number(got), wn = Number(want[0]);
    return isFinite(gn) && isFinite(wn) && gn === wn;
  }

  return { TOPICS: TOPICS.map(function (t) { return { id: t.id, name: t.name, description: t.description }; }),
    generate: generate, checkAnswer: checkAnswer, rng: rng, _topics: TOPICS };
});
