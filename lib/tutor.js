/* The Procademy tutor: a free AI that explains, running inside the browser.

   Procademy has no videos, so the tutor is what explains an idea a second way. It runs a small open model
   (Qwen3, through the WebLLM library) on the device's own graphics chip: no account, no key, no cost, and
   nothing the learner types leaves the device. The model downloads once and is cached by the browser.
   Where the browser has its own built-in model (Chrome's Prompt API), that is offered too.

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
  const HISTORY = 6;                 // past messages sent with each question (the model's window is small)
  const CONTEXT_CHARS = 2200;        // longest context block

  const SYSTEM = [
    'You are the Procademy tutor, a friendly and patient math teacher for students from about 6th grade to 12th grade.',
    'Procademy has no videos, so you are how ideas get explained: explain the way a good teacher would at the board.',
    'Rules:',
    '- Explain step by step, in short paragraphs or a numbered list. Use a small, concrete example when it helps.',
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
    MODELS, BUILTIN, LIB, SYSTEM,
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
    model(id) { return id === 'builtin' ? BUILTIN : (MODELS.find(m => m.id === id) || MODELS[0]); },

    async isCached(modelId) {
      try { const lib = await import(LIB); return await lib.hasModelInCache(modelId); } catch (e) { return false; }
    },
    async forget(modelId) {
      try { if (T.modelId === modelId) await T.unload(); const lib = await import(LIB); await lib.deleteModelAllInfoInCache(modelId); return true; } catch (e) { return false; }
    },

    /** load a model (downloads it the first time). Resolves when the tutor is ready. */
    async start(modelId) {
      modelId = modelId || MODELS[0].id;
      if (T.state === 'ready' && T.modelId === modelId) return T;
      if (loading && T.modelId === modelId) return loading;
      if (engine) await T.unload();
      T.modelId = modelId; T.state = 'loading'; T.error = ''; T.progress = { text: 'Starting…', fraction: 0 }; T._emit();
      const onProgress = p => { T.progress = { text: p.text || '', fraction: typeof p.progress === 'number' ? p.progress : 0 }; T._emit(); };
      loading = (async () => {
        try {
          if (T.engineFactory) { engine = await T.engineFactory(modelId, onProgress); engineKind = 'fake'; }
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
    async ask(history, context, onDelta) {
      if (T.state !== 'ready' || !engine) throw new Error('The tutor is not on yet.');
      T.stop();
      controller = { stopped: false };
      const mine = controller;
      const msgs = T.messages(history, context);
      let text = '';
      const push = chunk => { text += chunk; if (onDelta) onDelta(T.guard(T.clean(text), context)); };
      try {
        if (engineKind === 'builtin') {
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
    stop() { if (controller) controller.stopped = true; },
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
