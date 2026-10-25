/* The Procademy tutor: a free AI that explains.

   Procademy has no videos, so the tutor is what explains an idea a second way. Two ways to run it:
   - Cloud (the default): free AI services running GPT-OSS 20B, used in turn. LLM7 answers about once a
     second; Pollinations (once every 30 seconds) takes over when LLM7 is busy or unreachable. No download,
     no account, no key; a free LLM7 token, if one is pasted into the tutor's settings, is kept on this
     device and secures LLM7's documented free limits. When every service is busy, the tutor waits out the
     shortest Retry-After and sends again by itself. What is sent: the question typed, and what is on
     screen (the skill, the practice question and its steps). No name, no progress.
   - On this device: a small open model (Qwen3, through WebLLM) on the device's own graphics chip. It
     downloads once, then runs privately and offline. Chrome's built-in model is offered where it exists.

   The tutor is grounded: every request carries what the learner is looking at — the skill's lesson, or the
   question with its checked step-by-step hints — so the model explains a known-correct answer instead of
   working it out (small models make arithmetic slips). Before the learner has answered, the final step
   is withheld, so the tutor can guide but cannot give the answer away.

   This is the only part of Procademy that needs the network (once, for the library and the model). */
'use strict';
(function () {
  const LIB = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';
  const MODELS = [
    { id: 'Qwen3-1.7B-q4f16_1-MLC', name: 'Standard', size: 'about 1 GB', note: 'Clear explanations. Right for most laptops and desktops.' },
    { id: 'Qwen3-0.6B-q4f16_1-MLC', name: 'Light', size: 'about 350 MB', note: 'Quicker and smaller, with simpler answers. For phones, tablets and older computers.' },
    { id: 'Qwen3-4B-q4f16_1-MLC', name: 'Best', size: 'about 2.3 GB', note: 'The most careful explanations. Needs a recent computer with plenty of memory.' },
  ];
  const BUILTIN = { id: 'builtin', name: 'Built into this browser', size: 'already on this device', note: 'Uses the AI model that ships with this browser.' };
  const CLOUD = { id: 'cloud', name: 'Free cloud tutor', size: 'no download', note: 'Free AI services (GPT-OSS 20B through LLM7 and Pollinations). Starts at once and gives the strongest explanations. Needs the internet.' };
  /** the free services, tried in this order; each speaks the OpenAI chat format */
  const PROVIDERS = [
    // LLM7 rejects reasoning_effort for this model (400 "does not support reasoning"), so it gets no extras
    { id: 'llm7', name: 'LLM7', url: 'https://api.llm7.io/v1/chat/completions', model: 'gpt-oss:20b', token: true, extra: {}, privacy: 'https://llm7.io/privacy' },
    { id: 'pollinations', name: 'Pollinations', url: 'https://text.pollinations.ai/openai', model: 'openai', token: false, extra: { reasoning_effort: 'low' }, privacy: 'https://pollinations.ai/privacy' },
  ];
  const CLOUD_URL = PROVIDERS[1].url;
  const CLOUD_WAIT_MAX = 75;         // longest total wait for a free slot before giving up, in seconds
  const HISTORY = 6;                 // past messages sent with each question (the model's window is small)
  const CONTEXT_CHARS = 2200;        // longest context block

  const SYSTEM = [
    'You are the Procademy tutor, a friendly and patient math teacher for students from about 6th grade to 12th grade.',
    'Procademy has no videos, so you are how ideas get explained: explain the way a good teacher would at the board.',
    'Rules:',
    '- Explain step by step, in short paragraphs or a numbered list. Use a small, concrete example when it helps.',
    '- Say why each step works, not only what to do. Name the idea being used (for example, "inverse operations").',
    '- If the student gave a wrong answer, find the likely mistake they made, explain it kindly, and show the fix.',
    '- When you explain a new idea, end with one short question the student can try, to check they understood.',
    '- Write math in plain text, like 3/4, x^2, sqrt(2), 2(x + 3) = 14. Never use LaTeX or dollar signs.',
    '- Keep answers under about 180 words unless the student asks for more.',
    '- When the context gives an answer or steps, trust them: they have been checked. Explain why they are right; do not recompute differently.',
    '- If the student is working on a practice question and the context says the answer is hidden, do not give the final answer. Give the next step and invite them to try it.',
    '- Be encouraging. Mistakes are how people learn.',
    '- Only help with math and studying. If asked about anything else, kindly bring the conversation back to math.',
    '- If you are not sure, say so.',
  ].join('\n');

  let engine = null, engineKind = null, loading = null, controller = null;
  const listeners = new Set();
  const T = {
    MODELS, BUILTIN, CLOUD, LIB, SYSTEM, CLOUD_URL, PROVIDERS,
    /** which providers to use (ids), and a free LLM7 token if there is one; set by the panel */
    cloud: { use: ['llm7', 'pollinations'], tokens: {} },
    /** time limits for a cloud request, in seconds (tests shorten them) */
    limits: { firstByte: 25, idle: 30 },
    /** the provider that gave the last answer */
    lastProvider: null,
    /** tests replace this with a fake fetch for the cloud tutor */
    fetch: (...a) => fetch(...a),
    /** waiting for a free cloud slot: { seconds } or null */
    waiting: null,
    state: 'off',                    // off | loading | ready | error
    progress: { text: '', fraction: 0 },
    error: '',
    modelId: null,
    /** tests replace this with a fake: async (modelId, onProgress) => engine */
    engineFactory: null,

    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    _emit() { listeners.forEach(fn => { try { fn(T); } catch (e) { console.error(e); } }); },

    /** can this browser run the downloaded model? */
    supported() { return !!(T.engineFactory || (typeof navigator !== 'undefined' && navigator.gpu)); },
    /** does this browser ship its own model (Chrome's Prompt API)? */
    async builtinAvailable() {
      try {
        if (typeof LanguageModel === 'undefined') return false;
        const a = await LanguageModel.availability();
        return a === 'available' || a === 'downloadable' || a === 'downloading';
      } catch (e) { return false; }
    },
    model(id) { return id === 'cloud' ? CLOUD : id === 'builtin' ? BUILTIN : (MODELS.find(m => m.id === id) || MODELS[0]); },
    isCloud() { return engineKind === 'cloud'; },

    async isCached(modelId) {
      try { const lib = await import(LIB); return await lib.hasModelInCache(modelId); } catch (e) { return false; }
    },
    async forget(modelId) {
      try { if (T.modelId === modelId) await T.unload(); const lib = await import(LIB); await lib.deleteModelAllInfoInCache(modelId); return true; } catch (e) { return false; }
    },

    /** load a model (downloads it the first time). Resolves when the tutor is ready. */
    async start(modelId) {
      modelId = modelId || 'cloud';
      if (T.state === 'ready' && T.modelId === modelId) return T;
      if (loading && T.modelId === modelId) return loading;
      if (engine) await T.unload();
      T.modelId = modelId; T.state = 'loading'; T.error = ''; T.progress = { text: 'Starting…', fraction: 0 }; T._emit();
      const onProgress = p => { T.progress = { text: p.text || '', fraction: typeof p.progress === 'number' ? p.progress : 0 }; T._emit(); };
      loading = (async () => {
        try {
          if (modelId === 'cloud') { engine = { cloud: true }; engineKind = 'cloud'; }
          else if (T.engineFactory) { engine = await T.engineFactory(modelId, onProgress); engineKind = 'fake'; }
          else if (modelId === 'builtin') {
            if (!(await T.builtinAvailable())) throw new Error('This browser does not offer a built-in model.');
            engine = await LanguageModel.create({
              initialPrompts: [{ role: 'system', content: SYSTEM }],
              monitor(m) { m.addEventListener('downloadprogress', e => onProgress({ text: 'Downloading the browser’s model…', progress: e.loaded })); },
            });
            engineKind = 'builtin';
          } else {
            if (!navigator.gpu) throw new Error('This browser cannot run the tutor: it needs WebGPU (Chrome or Edge on a computer, or Safari on a recent Mac, iPhone or iPad).');
            const lib = await import(LIB);
            engine = await lib.CreateMLCEngine(modelId, { initProgressCallback: onProgress });
            engineKind = 'webllm';
          }
          T.state = 'ready'; T.progress = { text: 'Ready', fraction: 1 }; T._emit();
          return T;
        } catch (e) {
          engine = null; T.state = 'error'; T.error = friendlyError(e); T._emit();
          throw e;
        } finally { loading = null; }
      })();
      return loading;
    },
    async unload() {
      T.stop();
      try { if (engine && engine.unload) await engine.unload(); else if (engine && engine.destroy) engine.destroy(); } catch (e) { /* already gone */ }
      engine = null; T.state = 'off'; T._emit();
    },

    /** build the message list for one question: system, context, recent history, the question */
    messages(history, context) {
      const msgs = [{ role: 'system', content: SYSTEM + (context ? '\n\n' + T.contextText(context) : '') }];
      history.slice(-HISTORY).forEach(m => msgs.push({ role: m.role, content: m.content }));
      return msgs;
    },
    /** what the learner is looking at, as text for the model. See VIEWS for the shapes. */
    contextText(c) {
      const lines = ['Context (what the student is looking at right now):'];
      if (c.course) lines.push('Course: ' + c.course);
      if (c.lesson) lines.push('CPM lesson: ' + c.lesson);
      if (c.skill) lines.push('Skill: ' + c.skill);
      if (c.question) {
        lines.push('Practice question: ' + c.question);
        if (c.choices && c.choices.length) lines.push('Choices: ' + c.choices.join(' | '));
        if (c.steps && c.steps.length) lines.push((c.answerShown ? 'Checked worked steps:\n' : 'Checked first step (the rest is hidden):\n') + c.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'));
        lines.push(c.answerShown ? 'Correct answer (checked): ' + c.answer : 'The answer is hidden: the student has not answered yet. Do not reveal it.');
        if (c.studentAnswer) lines.push('The student answered: ' + c.studentAnswer);
      }
      if (c.notes) lines.push('Lesson notes: ' + c.notes);
      let text = lines.join('\n');
      if (text.length > CONTEXT_CHARS) text = text.slice(0, CONTEXT_CHARS) + '…';
      return text;
    },

    /** ask a question; onDelta(textSoFar) is called as words arrive. Resolves to the full answer. */
    async ask(history, context, onDelta, onStatus) {
      if (T.state !== 'ready' || !engine) throw new Error('The tutor is not on yet.');
      T.stop();
      controller = { stopped: false, abort: typeof AbortController !== 'undefined' ? new AbortController() : null };
      const mine = controller;
      const msgs = T.messages(history, context);
      let text = '';
      const push = chunk => { text += chunk; if (onDelta) onDelta(T.guard(T.clean(text), context)); };
      try {
        if (engineKind === 'cloud') {
          await cloudAsk(msgs, push, mine, onStatus || (() => {}));
        } else if (engineKind === 'builtin') {
          const session = await engine.clone();
          const prompt = msgs.slice(1).map(m => (m.role === 'user' ? 'Student: ' : 'Tutor: ') + m.content).join('\n\n');
          const stream = session.promptStreaming((context ? T.contextText(context) + '\n\n' : '') + prompt + '\n\nTutor:');
          for await (const chunk of stream) { if (mine.stopped) break; push(chunk); }
          session.destroy && session.destroy();
        } else {
          const stream = await engine.chat.completions.create({ messages: msgs, stream: true, temperature: 0.4, max_tokens: 700, extra_body: { enable_thinking: false } });
          for await (const chunk of stream) {
            if (mine.stopped) { try { engine.interruptGenerate && engine.interruptGenerate(); } catch (e) { /* fine */ } break; }
            const d = chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content;
            if (d) push(d);
          }
        }
      } finally { if (controller === mine) controller = null; }
      return T.guard(T.clean(text), context);
    },

    /** small models do not always keep a secret: before the learner has answered, remove any sentence
        that states the answer, and any echo of the instructions */
    guard(text, c) {
      const echo = /do not reveal|answer is hidden|context \(what the student|checked first step|the rest is hidden|final step is hidden/i;
      const hidden = !!(c && c.question && !c.answerShown && c.answer);
      const tests = [];
      if (hidden) {
        const ans = String(c.answer).replace(/−/g, '-').trim();
        const num = ans.replace(/[^\d./-]/g, '');
        if (num && /\d/.test(num)) {
          const n = num.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[-−]');
          tests.push(new RegExp(`(=|≈|is|equals|get|gives|answer[^.\\n]*?)\\s*\\$?\\(?${n}(?![\\d/.]\\d)`, 'i'));
        }
        const words = A_norm(ans);
        if (words.length >= 3 && !/^[\d\s./-]+$/.test(ans)) tests.push({ test: t => A_norm(t).includes(words) });
      }
      let removed = false;
      const lines = String(text || '').split('\n').map(line => {
        const sentences = line.split(/(?<=[.!?])\s+(?=\S)/);
        const kept = sentences.filter(sn => {
          if (echo.test(sn)) return false;                                  // an echo of the instructions: drop quietly
          const hit = tests.some(x => x.test(sn.replace(/−/g, '-')));
          if (hit) removed = true;
          return !hit;
        });
        const joined = kept.join(' ');
        return kept.length < sentences.length && /^\s*(\d+[.)]|[-•*])?\s*$/.test(joined) ? null : joined;   // a list marker left on its own goes too
      }).filter(l => l !== null);
      let body = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      if (!removed) return body;
      if (!body.replace(/[^a-z0-9]/gi, '')) body = c.steps && c.steps[0] ? 'Here is how to start: ' + c.steps[0] : 'Think about what the first step should be.';
      return body + '\n\nNow try the last step yourself, then press Check.';
    },
    stop() { if (controller) { controller.stopped = true; try { controller.abort && controller.abort.abort(); } catch (e) { /* fine */ } } },
    busy() { return !!controller; },

    /** tidy model output: drop thinking blocks, turn stray LaTeX into plain text */
    clean(s) {
      return String(s || '')
        .replace(/<think>[\s\S]*?(<\/think>|$)/g, '')
        .replace(/\\\(|\\\)|\\\[|\\\]/g, '')
        .replace(/\$\$?/g, '')
        .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
        .replace(/\\sqrt\{([^{}]*)\}/g, '√($1)')
        .replace(/\\(cdot|times)/g, '×').replace(/\\div/g, '÷').replace(/\\pm/g, '±')
        .replace(/\\(le|leq)\b/g, '≤').replace(/\\(ge|geq)\b/g, '≥').replace(/\\neq?\b/g, '≠')
        .replace(/\\pi\b/g, 'π').replace(/\\theta\b/g, 'θ').replace(/\\circ\b/g, '°').replace(/\^\{?\\circ\}?/g, '°')
        .replace(/\\(text|mathrm|mathbf)\{([^{}]*)\}/g, '$2')
        .replace(/\\left|\\right/g, '').replace(/\\,/g, ' ')
        .replace(/[ \t]{2,}/g, ' ').replace(/ ([.,;:!?])/g, '$1')
        .replace(/^\s+/, '');
    },
    /** safe HTML from the model's text: escaped first, then a little markdown */
    render(s) {
      const esc = String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      const inline = t => t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\^(\d+|\([^)]*\))/g, (m, e) => '<sup>' + e.replace(/^\(|\)$/g, '') + '</sup>');
      const out = []; let list = null;
      esc.split(/\n/).forEach(line => {
        const bullet = line.match(/^\s*[-•*]\s+(.*)$/), num = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        if (bullet || num) {
          const kind = bullet ? 'ul' : 'ol';
          if (!list || list.kind !== kind) { if (list) out.push(`</${list.kind}>`); list = { kind }; out.push(`<${kind}>`); }
          out.push(`<li>${inline(bullet ? bullet[1] : num[2])}</li>`);
        } else {
          if (list) { out.push(`</${list.kind}>`); list = null; }
          const h = line.match(/^\s*#{1,4}\s+(.*)$/);
          if (h) out.push(`<p><b>${inline(h[1])}</b></p>`);
          else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
        }
      });
      if (list) out.push(`</${list.kind}>`);
      return out.join('');
    },
  };

  /** the free cloud tutor: OpenAI-style streaming requests to the free services in turn.
      Each time, the service that will be free soonest is asked; one that is unreachable, wants a key or
      errors is skipped for the rest of this question. When all are busy, the panel counts down. */
  /** when each service is next free (ms since epoch), learned from Retry-After and Pollinations' 30 s rule */
  const nextFree = {};
  const POLLINATIONS_GAP = 30;
  async function cloudAsk(msgs, push, mine, onStatus) {
    const order = PROVIDERS.filter(p => (T.cloud.use || []).includes(p.id));
    if (!order.length) throw new Error('No free tutor service is switched on. Turn one on in the tutor’s settings.');
    const off = new Set();             // services that cannot answer this time (key needed, unreachable, error)
    const started = Date.now();
    let lastError = '';
    for (let round = 0; round < 16; round++) {
      if (mine.stopped) return;
      const open = order.filter(p => !off.has(p.id));
      if (!open.length) break;
      // the service that is free soonest; ties go to the order given (LLM7 first)
      const now = Date.now();
      const p = open.reduce((best, x) => ((nextFree[x.id] || 0) < (nextFree[best.id] || 0) ? x : best), open[0]);
      const waitMs = Math.max(0, (nextFree[p.id] || 0) - now);
      if (now + waitMs - started > CLOUD_WAIT_MAX * 1000) throw new Error('The free tutor services are all busy right now. Try again in a minute, or add a free key in the tutor’s settings.');
      if (waitMs > 0) await sleepFor(waitMs / 1000, mine, onStatus, waitMs > 1500);
      if (mine.stopped) return;
      const sentAt = Date.now();
      const r = await cloudTry(p, msgs, push, mine);
      if (T.debug) console.log('tutor: ' + p.id + ' → ' + JSON.stringify(r));
      if (p.id === 'pollinations') nextFree[p.id] = sentAt + POLLINATIONS_GAP * 1000;
      if (r.ok) { T.lastProvider = p.id; return; }
      if (r.stopped) return;
      if (r.wait != null) nextFree[p.id] = Date.now() + r.wait * 1000;
      else { off.add(p.id); lastError = r.error || lastError; }
    }
    throw new Error(lastError || 'The free tutor could not be reached. Check the internet connection, or switch to the on-device tutor in the tutor’s settings.');
  }
  T._nextFree = nextFree;              // for tests
  async function sleepFor(seconds, mine, onStatus, show) {
    const end = Date.now() + seconds * 1000;
    while (!mine.stopped) {
      const left = end - Date.now();
      if (left <= 0) break;
      if (show) { T.waiting = { seconds: Math.ceil(left / 1000) }; onStatus(T.waiting); }
      await new Promise(r => setTimeout(r, Math.min(1000, left)));
    }
    if (show) { T.waiting = null; onStatus(null); }
  }
  /** one request to one provider: { ok } | { wait: seconds } | { error } | { stopped } */
  async function cloudTry(p, msgs, push, mine) {
    const headers = { 'Content-Type': 'application/json' };
    const token = p.token && T.cloud.tokens && T.cloud.tokens[p.id];
    if (token) headers.Authorization = 'Bearer ' + token;
    // this request's own abort, tied to Stop and to the time limits, so a service that hangs cannot stall the tutor
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const onStop = () => { if (ctrl) ctrl.abort(); };
    if (mine.abort) mine.abort.signal.addEventListener('abort', onStop);
    let timedOut = false, timer = null;
    const arm = seconds => { clearTimeout(timer); timer = setTimeout(() => { timedOut = true; if (ctrl) ctrl.abort(); }, seconds * 1000); };
    const done = r => { clearTimeout(timer); if (mine.abort) mine.abort.signal.removeEventListener('abort', onStop); return r; };
    arm(T.limits.firstByte);
    let res;
    try {
      res = await T.fetch(p.url, {
        method: 'POST', headers,
        body: JSON.stringify(Object.assign({ model: p.model, messages: msgs, stream: true }, p.extra || {})),
        signal: ctrl ? ctrl.signal : undefined,
      });
    } catch (e) {
      if (T.debug) console.log('tutor: ' + p.id + ' fetch threw ' + (e && e.message) + (timedOut ? ' (timed out)' : ''));
      if (mine.stopped) return done({ stopped: true });
      if (timedOut) return done({ wait: 10 });                   // no answer in time: busy, try the other service
      return done({ error: 'The free tutor could not be reached. Check the internet connection, or switch to the on-device tutor in the tutor’s settings.' });
    }
    arm(T.limits.idle);
    if (res.status === 402 || res.status === 429 || res.status === 503) {
      let wait = Number(res.headers.get('Retry-After'));
      if (!wait) { try { const j = await res.clone().json(); wait = Number(j && (j.retry_after || (j.error && j.error.retry_after))); } catch (e) { /* not JSON */ } }
      return done({ wait: Math.max(1, Math.min(60, wait || (res.status === 429 ? 2 : 30))) });
    }
    if (res.status === 401 || res.status === 403) return done({ error: `${p.name} now needs a free key. Paste one in the tutor’s settings, or the tutor will use the other service.` });
    if (!res.ok) {
      let why = '';
      try { const j = await res.json(); why = (j && j.error && (j.error.message || j.error)) || ''; } catch (e) { /* not JSON */ }
      if (typeof console !== 'undefined') console.warn(`tutor: ${p.name} answered ${res.status}: ${why}`);   // a provider that changed its rules shows up here, not as silence
      return done({ error: res.status === 400 && /filter|safety|refus|policy/i.test(String(why)) ? 'The free tutor would not answer that. Try asking about the math in another way.' : `The free tutor had a problem (${p.name} ${res.status}). Try again in a moment.` });
    }
    const ct = res.headers.get('Content-Type') || '';
    if (!res.body || !/event-stream/.test(ct)) {             // a service that ignores stream: take the whole reply
      const j = await res.json().catch(() => null);
      const t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
      if (!t) return done(timedOut ? { wait: 10 } : { error: `The free tutor gave an empty reply (${p.name}).` });
      push(t);
      return done({ ok: true });
    }
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = '', got = false;
    const line = raw => {
      const l = raw.trim();
      if (!l.startsWith('data:')) return;
      const data = l.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const j = JSON.parse(data);
        const d = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
        if (d) { push(d); got = true; }
      } catch (e) { /* a broken line: skip it */ }
    };
    for (;;) {
      if (mine.stopped) { try { reader.cancel(); } catch (e) { /* fine */ } return done({ stopped: true }); }
      let chunk;
      try { chunk = await reader.read(); } catch (e) {
        if (mine.stopped) return done({ stopped: true });
        if (got) return done({ ok: true });                       // it went quiet after answering: keep what came
        return done(timedOut ? { wait: 10 } : { error: 'The connection to the free tutor dropped. Try again.' });
      }
      if (chunk.done) break;
      arm(T.limits.idle);
      buf += dec.decode(chunk.value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) { line(buf.slice(0, nl)); buf = buf.slice(nl + 1); }
    }
    if (buf) line(buf);                                         // a last line without a newline
    return done(got ? { ok: true } : { error: `The free tutor gave an empty reply (${p.name}).` });
  }

  function A_norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }

  function friendlyError(e) {
    const m = String((e && e.message) || e || '');
    if (/WebGPU|gpu|adapter/i.test(m)) return 'This device could not start the tutor’s graphics engine. Try the Light model, or Chrome or Edge on a computer.';
    if (/quota|storage|space/i.test(m)) return 'There is not enough free storage on this device for the model. Try the Light model, or free some space.';
    if (/fetch|network|Failed to load|import/i.test(m)) return 'The tutor could not download. Check the internet connection and try again.';
    if (/memory|OOM|allocation/i.test(m)) return 'This device ran out of memory loading the model. Try the Light model.';
    return m || 'The tutor could not start.';
  }

  window.TUTOR = T;
})();
