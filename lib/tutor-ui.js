/* The tutor's panel: a floating "Ask" button on every page, a one-time setup, and the chat.
   Views tell it what the learner is looking at with TUTORUI.setContext({...}); buttons such as
   "Explain this" call TUTORUI.open({ ask: 'question text' }). */
'use strict';
(function () {
  const T = window.TUTOR, S = window.STORE, M = window.M;
  const esc = M.esc;
  let context = null, history = [], pending = null, panel = null, builtin = false;

  const QUICK = {
    question: ['Give me a hint', 'Explain the idea behind this', 'What mistake do people make here?'],
    skill: ['Explain this like I’m new to it', 'Show me another example', 'Why does this work?'],
    lesson: ['Explain this lesson simply', 'Show me an example', 'What should I remember from it?'],
    none: ['Explain slope', 'How do I add fractions?', 'What is a function?'],
  };

  function pref() { return S.get().profile.tutor || {}; }
  function setPref(p) { S.setProfile({ tutor: Object.assign({}, pref(), p) }); }

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
        <button class="iconbtn" id="tutor-close" aria-label="Close the tutor">✕</button></div>
      <div class="tutor-about" id="tutor-about"></div>
      <div class="tutor-body" id="tutor-body" aria-live="polite"></div>
      <div class="tutor-quick" id="tutor-quick"></div>
      <form class="tutor-input" id="tutor-form"><textarea id="tutor-text" rows="2" placeholder="Ask about any math idea…" aria-label="Your question"></textarea>
        <button class="btn primary" id="tutor-send" type="submit">Send</button></form>`;
    document.body.appendChild(panel);
    panel.querySelector('#tutor-close').addEventListener('click', () => UI.close());
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

  function setupCard() {
    const p = pref();
    const choices = (builtin ? [T.BUILTIN] : []).concat(T.MODELS);
    const small = typeof matchMedia === 'function' && matchMedia('(max-width: 700px), (pointer: coarse)').matches;   // phones and tablets start on Light
    const chosen = p.model && choices.some(m => m.id === p.model) ? p.model : (small ? T.MODELS[1].id : T.MODELS[0].id);
    if (!T.supported() && !builtin) {
      return `<div class="tutor-card"><p><b>This browser can’t run the tutor yet.</b> It needs WebGPU, which Chrome and Edge have on computers and Safari has on recent Macs, iPhones and iPads.</p>
        <p class="muted small">Until then, every practice question has step-by-step hints, and every skill has a written lesson.</p></div>`;
    }
    return `<div class="tutor-card">
      <p><b>A free tutor that explains, on this device.</b> Ask it to explain an idea, show another example, or give you a hint on a question.</p>
      <ul class="small"><li><b>Free</b>: no account and no key.</li><li><b>Private</b>: it runs on this device, and nothing you type leaves it.</li><li><b>Works offline</b> after a one-time download.</li></ul>
      <fieldset class="tutor-models"><legend class="small muted">Choose a size</legend>
        ${choices.map(m => `<label class="tutor-model"><input type="radio" name="tutor-model" value="${m.id}" ${m.id === chosen ? 'checked' : ''}><span><b>${esc(m.name)}</b> · ${esc(m.size)}<br><span class="small muted">${esc(m.note)}</span></span></label>`).join('')}
      </fieldset>
      <button class="btn primary block" id="tutor-start">Turn on the tutor</button>
      <p class="tiny muted" style="margin:8px 0 0">The tutor is a small AI and can make mistakes. Practice answers are always checked by Procademy, not by the tutor.</p></div>`;
  }

  function render() {
    if (!panel || panel.hidden) return;
    const body = panel.querySelector('#tutor-body'), status = panel.querySelector('#tutor-status');
    panel.querySelector('#tutor-about').innerHTML = aboutText();
    const ready = T.state === 'ready';
    status.textContent = ready ? `${T.model(T.modelId).name} model · on this device` : T.state === 'loading' ? 'Starting…' : 'Off';
    let html = '';
    if (!ready) {
      if (T.state === 'loading') {
        const pct = Math.round((T.progress.fraction || 0) * 100);
        html = `<div class="tutor-card"><p><b>${T.progress.fraction > 0 && T.progress.fraction < 1 ? 'Downloading the tutor…' : 'Starting the tutor…'}</b></p>
          <div class="pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
          <p class="tiny muted" style="margin-top:6px">${esc(T.progress.text || '')}</p>
          <p class="small muted">The first time takes a few minutes. After that it starts in seconds, even offline.</p></div>`;
      } else {
        html = (T.state === 'error' ? `<div class="feedback bad">⚠️ <span>${esc(T.error)}</span></div>` : '') + setupCard();
      }
    }
    html += history.map(m => `<div class="tmsg ${m.role}">${m.role === 'user' ? esc(m.content).replace(/\n/g, '<br>') : (T.render(m.content) || '<span class="muted">…</span>')}</div>`).join('');
    body.innerHTML = html;
    const start = body.querySelector('#tutor-start');
    if (start) start.addEventListener('click', () => {
      const id = (body.querySelector('input[name="tutor-model"]:checked') || {}).value || T.MODELS[0].id;
      setPref({ model: id, enabled: true });
      T.start(id).then(() => { if (pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
    });
    const quick = panel.querySelector('#tutor-quick');
    const kind = context ? (context.question ? 'question' : context.lesson ? 'lesson' : context.skill ? 'skill' : 'none') : 'none';
    quick.innerHTML = ready && !T.busy() ? QUICK[kind].map(q => `<button type="button" class="btn sm">${esc(q)}</button>`).join('') : '';
    quick.querySelectorAll('button').forEach(b => b.addEventListener('click', () => send(b.textContent)));
    const sendBtn = panel.querySelector('#tutor-send');
    sendBtn.textContent = T.busy() ? 'Stop' : 'Send';
    sendBtn.type = T.busy() ? 'button' : 'submit';
    sendBtn.onclick = T.busy() ? (ev => { ev.preventDefault(); T.stop(); }) : null;
    panel.querySelector('#tutor-text').disabled = !ready;
    body.scrollTop = history.length ? body.scrollHeight : 0;      // a chat follows the newest reply; the setup reads from the top
  }

  async function send(text) {
    text = String(text || '').trim();
    if (!text || T.busy()) return;
    if (T.state !== 'ready') { pending = text; render(); return; }
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
      });
      reply.content = full || reply.content || 'Sorry, I could not think of an answer. Try asking another way.';
    } catch (e) {
      reply.content = 'Sorry, something went wrong: ' + (e && e.message ? e.message : e);
    }
    render();
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
    /** open the panel; { ask } sends that question as soon as the tutor is on */
    open(opts) {
      opts = opts || {};
      build();
      panel.hidden = false;
      document.body.classList.add('tutor-open');
      if (opts.ask) pending = opts.ask;
      const p = pref();
      if (T.state === 'off' && p.enabled && p.model && T.supported()) T.start(p.model).then(() => { if (pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
      else if (T.state === 'ready' && pending) { const q = pending; pending = null; send(q); }
      render();
      setTimeout(() => { const t = panel.querySelector('#tutor-text'); if (t && !t.disabled) t.focus(); }, 0);
    },
    close() { if (!panel) return; panel.hidden = true; document.body.classList.remove('tutor-open'); const f = document.getElementById('tutor-fab'); if (f) f.focus(); },
    reset() { history = []; pending = null; render(); },
    history() { return history; },
    init() { build(); },
  };
  window.TUTORUI = UI;
})();
