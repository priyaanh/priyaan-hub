/* The tutor's panel: a floating "Ask" button on every page, the chat, and a small settings view.
   Views tell it what the learner is looking at with TUTORUI.setContext({...}); buttons such as
   "Explain this" call TUTORUI.open({ ask: 'question text' }).
   The free cloud tutor is the default, so the panel is ready the moment it opens; the on-device tutor
   is a choice in the settings view, for anyone who wants it private and offline. */
'use strict';
(function () {
  const T = window.TUTOR, S = window.STORE, M = window.M;
  const esc = M.esc;
  let context = null, history = [], pending = null, panel = null, builtin = false, view = 'chat', waiting = null;

  const QUICK = {
    question: ['Give me a hint', 'Explain the idea behind this', 'Show me a similar example'],
    wrong: ['Why was my answer wrong?', 'Give me a hint', 'Explain it differently'],
    done: ['Explain how to get this answer', 'Why does this work?', 'Show me a similar example'],
    skill: ['Explain this like I’m new to it', 'Show me another example', 'Give me a question to try'],
    lesson: ['Explain this lesson simply', 'Show me an example', 'What should I remember from it?'],
    none: ['Explain slope', 'How do I add fractions?', 'What is a function?'],
  };

  function pref() { return S.get().profile.tutor || {}; }
  function setPref(p) { S.setProfile({ tutor: Object.assign({}, pref(), p) }); }
  /** which engine to use: the saved choice, or the free cloud tutor */
  function chosenEngine() { return pref().engine || 'cloud'; }

  function build() {
    if (panel) return panel;
    const btn = document.createElement('button');
    btn.className = 'tutor-fab'; btn.id = 'tutor-fab'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Ask the Procademy tutor'); btn.innerHTML = '<span aria-hidden="true">✦</span> Ask';
    btn.addEventListener('click', () => (panel.hidden ? UI.open() : UI.close()));
    document.body.appendChild(btn);
    panel = document.createElement('aside');
    panel.className = 'tutor'; panel.id = 'tutor'; panel.hidden = true;
    panel.setAttribute('aria-label', 'Procademy tutor');
    panel.innerHTML = `<div class="tutor-head"><div><b>✦ Procademy tutor</b><div class="tutor-status small muted" id="tutor-status"></div></div>
        <div class="row" style="gap:2px"><button class="iconbtn" id="tutor-settings" aria-label="Tutor settings" title="Tutor settings">⚙︎</button>
        <button class="iconbtn" id="tutor-close" aria-label="Close the tutor">✕</button></div></div>
      <div class="tutor-about" id="tutor-about"></div>
      <div class="tutor-body" id="tutor-body" aria-live="polite"></div>
      <div class="tutor-quick" id="tutor-quick"></div>
      <form class="tutor-input" id="tutor-form"><textarea id="tutor-text" rows="2" placeholder="Ask about any math idea…" aria-label="Your question"></textarea>
        <button class="btn primary" id="tutor-send" type="submit">Send</button></form>
      <div class="tutor-note tiny muted" id="tutor-note"></div>`;
    document.body.appendChild(panel);
    panel.querySelector('#tutor-close').addEventListener('click', () => UI.close());
    panel.querySelector('#tutor-settings').addEventListener('click', () => { view = view === 'settings' ? 'chat' : 'settings'; render(); });
    panel.querySelector('#tutor-form').addEventListener('submit', ev => { ev.preventDefault(); send(panel.querySelector('#tutor-text').value); });
    panel.querySelector('#tutor-text').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); send(ev.target.value); } });
    panel.addEventListener('keydown', ev => { if (ev.key === 'Escape') UI.close(); });
    T.on(() => render());
    T.builtinAvailable().then(b => { builtin = b; if (!panel.hidden) render(); });
    return panel;
  }

  function aboutText() {
    if (!context) return '';
    const what = context.question ? 'this question' : context.lesson ? 'lesson ' + context.lesson : context.skill ? context.skill : '';
    return what ? `<span class="chip">About: ${esc(what.length > 60 ? what.slice(0, 57) + '…' : what)}</span>` : '';
  }

  /** the settings view: cloud (default) or a model on this device */
  function settingsCard() {
    const current = chosenEngine(), device = T.supported();
    const options = [T.CLOUD].concat(builtin ? [T.BUILTIN] : [], T.MODELS);
    return `<div class="tutor-card">
      <p style="margin-bottom:8px"><b>How the tutor runs</b></p>
      <fieldset class="tutor-models"><legend class="visually-hidden">Choose how the tutor runs</legend>
        ${options.map(m => {
          const isDevice = m.id !== 'cloud' && m.id !== 'builtin', off = isDevice && !device;
          return `<label class="tutor-model${off ? ' off' : ''}"><input type="radio" name="tutor-engine" value="${m.id}" ${m.id === current ? 'checked' : ''} ${off ? 'disabled' : ''}>
            <span><b>${esc(isDevice ? 'On this device: ' + m.name : m.name)}</b> · ${esc(m.size)}${m.id === 'cloud' ? ' <span class="chip up">Recommended</span>' : ''}<br>
            <span class="small muted">${esc(m.note)}${isDevice ? ' Private, and works offline after a one-time download.' : ''}${off ? ' This browser can’t run it (it needs WebGPU).' : ''}</span></span></label>`;
        }).join('')}
      </fieldset>
      <button class="btn primary block" id="tutor-use">Use this</button>
      <p class="tiny muted" style="margin:10px 0 0">The free cloud tutor sends your question and the problem on screen to Pollinations, a free AI service. It never sends your name or your progress. Don’t type personal details. The on-device models send nothing anywhere.</p></div>`;
  }

  function render() {
    if (!panel || panel.hidden) return;
    const body = panel.querySelector('#tutor-body'), status = panel.querySelector('#tutor-status'), note = panel.querySelector('#tutor-note');
    panel.querySelector('#tutor-about').innerHTML = view === 'chat' ? aboutText() : '';
    const ready = T.state === 'ready', cloud = ready && T.isCloud();
    status.textContent = waiting ? `Free tutor · next reply in ${waiting.seconds} s`
      : ready ? (cloud ? 'Free cloud tutor · no download' : `${T.model(T.modelId).name} · on this device`)
      : T.state === 'loading' ? 'Starting…' : 'Off';
    note.textContent = view !== 'chat' ? '' : cloud ? 'Free AI (GPT-OSS on Pollinations). It can make mistakes; Procademy checks every practice answer itself.'
      : ready ? 'Runs on this device. It can make mistakes; Procademy checks every practice answer itself.' : '';
    let html = '';
    if (view === 'settings') html = settingsCard();
    else {
      if (T.state === 'loading') {
        const pct = Math.round((T.progress.fraction || 0) * 100);
        html = `<div class="tutor-card"><p><b>${T.progress.fraction > 0 && T.progress.fraction < 1 ? 'Downloading the on-device tutor…' : 'Starting the tutor…'}</b></p>
          <div class="pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
          <p class="tiny muted" style="margin-top:6px">${esc(T.progress.text || '')}</p>
          <p class="small muted">The first time takes a few minutes; after that it starts in seconds, even offline. <a href="#" class="tutor-use-cloud">Use the free cloud tutor instead</a>.</p></div>`;
      } else if (T.state === 'error') {
        html = `<div class="feedback bad">⚠️ <span>${esc(T.error)}</span></div><div class="btn-row"><button class="btn sm tutor-use-cloud">Use the free cloud tutor</button></div>`;
      } else if (ready && !history.length) {
        html = `<div class="tmsg assistant"><p>Hi! I’m the Procademy tutor. Ask me to explain an idea, show another example, or give you a hint. I won’t give away the answer to a practice question before you try it.</p></div>`;
      }
      html += history.map(m => `<div class="tmsg ${m.role}">${m.role === 'user' ? esc(m.content).replace(/\n/g, '<br>')
        : (m.content ? T.render(m.content) : `<span class="muted">${waiting ? `The free tutor answers once every 30 seconds. Your reply is coming in ${waiting.seconds} s…` : 'Thinking…'}</span>`)}</div>`).join('');
    }
    body.innerHTML = html;
    const use = body.querySelector('#tutor-use');
    if (use) use.addEventListener('click', () => {
      const id = (body.querySelector('input[name="tutor-engine"]:checked') || {}).value || 'cloud';
      setPref({ engine: id, enabled: true });
      view = 'chat';
      T.start(id).then(() => { if (pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
      render();
    });
    body.querySelectorAll('.tutor-use-cloud').forEach(a => a.addEventListener('click', ev => {
      ev.preventDefault(); setPref({ engine: 'cloud', enabled: true });
      T.start('cloud').then(() => { if (pending) { const q = pending; pending = null; send(q); } });
    }));
    const quick = panel.querySelector('#tutor-quick');
    let kind = 'none';
    if (context) kind = context.question ? (context.answerShown ? 'done' : context.studentAnswer ? 'wrong' : 'question') : context.lesson ? 'lesson' : context.skill ? 'skill' : 'none';
    quick.innerHTML = view === 'chat' && ready && !T.busy() ? QUICK[kind].map(q => `<button type="button" class="btn sm">${esc(q)}</button>`).join('') : '';
    quick.querySelectorAll('button').forEach(b => b.addEventListener('click', () => send(b.textContent)));
    const sendBtn = panel.querySelector('#tutor-send');
    sendBtn.textContent = T.busy() ? 'Stop' : 'Send';
    sendBtn.type = T.busy() ? 'button' : 'submit';
    sendBtn.onclick = T.busy() ? (ev => { ev.preventDefault(); T.stop(); }) : null;
    panel.querySelector('#tutor-form').hidden = view !== 'chat';
    panel.querySelector('#tutor-text').disabled = !ready;
    body.scrollTop = history.length && view === 'chat' ? body.scrollHeight : 0;      // a chat follows the newest reply; settings read from the top
  }

  async function send(text) {
    text = String(text || '').trim();
    if (!text || T.busy()) return;
    if (T.state !== 'ready') { pending = text; ensureStarted(); render(); return; }
    view = 'chat';
    panel.querySelector('#tutor-text').value = '';
    history.push({ role: 'user', content: text });
    const reply = { role: 'assistant', content: '' };
    history.push(reply);
    render();
    try {
      const full = await T.ask(history.slice(0, -1), context, partial => {
        reply.content = partial;
        const last = panel.querySelector('#tutor-body .tmsg.assistant:last-child');
        if (last) { last.innerHTML = T.render(partial); panel.querySelector('#tutor-body').scrollTop = 1e9; }
      }, w => { waiting = w; render(); });
      reply.content = full || reply.content || 'Sorry, I could not think of an answer. Try asking another way.';
    } catch (e) {
      reply.content = (e && e.message) ? e.message : 'Sorry, something went wrong.';
    }
    waiting = null;
    render();
  }

  function ensureStarted() {
    if (T.state === 'ready' || T.state === 'loading') return;
    let id = chosenEngine();
    if (id !== 'cloud' && id !== 'builtin' && !T.supported()) { id = 'cloud'; setPref({ engine: 'cloud' }); }
    T.start(id).then(() => { if (pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
  }

  const UI = {
    /** what the learner is looking at; views call this on every render */
    setContext(c) {
      const changed = JSON.stringify(c || null) !== JSON.stringify(context);
      if (changed && context && c && (context.question || '') !== (c.question || '') && history.length) history = [];   // a new question starts a new chat
      context = c || null;
      if (panel && !panel.hidden && changed) render();
    },
    getContext() { return context; },
    /** open the panel; { ask } sends that question as soon as the tutor is ready */
    open(opts) {
      opts = opts || {};
      build();
      panel.hidden = false;
      view = 'chat';
      document.body.classList.add('tutor-open');
      if (opts.ask) pending = opts.ask;
      if (T.state === 'ready' && pending) { const q = pending; pending = null; send(q); }
      else ensureStarted();
      render();
      setTimeout(() => { const t = panel.querySelector('#tutor-text'); if (t && !t.disabled) t.focus(); }, 0);
    },
    close() { if (!panel) return; panel.hidden = true; document.body.classList.remove('tutor-open'); const f = document.getElementById('tutor-fab'); if (f) f.focus(); },
    reset() { history = []; pending = null; render(); },
    history() { return history; },
    showSettings() { build(); panel.hidden = false; document.body.classList.add('tutor-open'); view = 'settings'; render(); },
    init() { build(); },
  };
  window.TUTORUI = UI;
})();
