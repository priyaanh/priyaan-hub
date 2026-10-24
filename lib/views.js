/* Every screen on the site. Each view is a function (root, ...params) that fills `root`. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, M = window.M;
  const esc = M.esc;

  /* ---------- small helpers ---------- */
  const possessive = name => name + (/s$/i.test(name) ? '’' : '’s');
  const brand = () => 'Procademy';
  const greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  const lvl = (level, big) => `<span class="lvl lvl-${level}${big ? ' big' : ''}" role="img" aria-label="${A.LEVELS[level]}" title="${A.LEVELS[level]}"></span>`;
  const courseVar = c => `style="--course:hsl(${c.hue == null ? 215 : c.hue} 70% 45%)"`;
  const courseHref = c => `#/course/${c.id}`;
  const unitHref = (c, u) => `#/unit/${c.id}/${u.id}`;
  const skillHref = sid => `#/skill/${encodeURIComponent(sid)}`;
  const practiceHref = sid => `#/practice/${encodeURIComponent(sid)}`;
  const plural = (k, one, many) => `${k} ${k === 1 ? one : (many || one + 's')}`;
  const fmt = k => k.toLocaleString('en-US');

  function mbar(skillIds, thin) {
    const m = E.mastery(skillIds);
    const total = skillIds.length || 1;
    const seg = l => m.counts[l] ? `<span class="m${l}" style="width:${m.counts[l] / total * 100}%"></span>` : '';
    return `<div class="mbar${thin ? ' thin' : ''}" role="img" aria-label="${m.points} of ${m.possible} mastery points">${seg(4)}${seg(3)}${seg(2)}${seg(1)}</div>`;
  }
  function legend(counts) {
    const items = [4, 3, 2, 1, 0].map(l => `<span><i class="dot" style="background:var(--lvl${l})"></i>${A.LEVELS[l]}${counts ? ` <b>${counts[l]}</b>` : ''}</span>`);
    return `<div class="legend">${items.join('')}</div>`;
  }
  function ago(t) {
    const d = Date.now() - t, m = Math.round(d / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    const days = Math.round(h / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return days + ' days ago';
    return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  /** the next skill worth doing after `sid`: later in the unit, then later units; prefers ones below Proficient */
  function nextSkill(sid) {
    const where = A.whereIs(sid);
    if (!where) return null;
    const all = A.courseSkills(where.course);
    const i = all.indexOf(sid);
    const after = all.slice(i + 1).concat(all.slice(0, i));
    return after.find(x => S.skill(x).level < 3) || after[0] || null;
  }
  function skillRow(sid, opts) {
    opts = opts || {};
    const def = A.skills[sid];
    if (!def) return '';
    const st = S.skill(sid);
    return `<li>${lvl(st.level)}<div class="name"><a href="${skillHref(sid)}">${def.title}</a>${opts.where ? `<div class="sub">${esc(opts.where)}</div>` : ''}</div>
      <div class="actions"><a class="btn sm ghost" href="${skillHref(sid)}">Learn</a><a class="btn sm primary" href="${practiceHref(sid)}">Practice</a></div></li>`;
  }
  function courseCard(c) {
    const ids = A.courseSkills(c), m = E.mastery(ids);
    return `<a class="card course-card" href="${courseHref(c)}" ${courseVar(c)}>
      <span class="icon" aria-hidden="true">${c.icon || '📘'}</span>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.blurb || '')}</p>
      <div class="row between small muted"><span>${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}</span><span>${m.pct}% mastered</span></div>
      <div class="pbar"><span style="width:${m.pct}%"></span></div></a>`;
  }
  function stats() {
    const st = S.streak(), pts = S.get().points;
    return `<span class="stat-pill${st.days ? '' : ' cold'}" title="Practice streak">🔥 ${st.days}</span><span class="stat-pill" title="Energy points">⚡ ${fmt(pts)}</span>`;
  }

  /* ---------- home ---------- */
  function home(root) {
    const s = S.get();
    const name = s.profile.name.trim();
    const allIds = Object.keys(A.skills);
    const mastered = allIds.filter(id => S.skill(id).level === 4).length;
    const st = S.streak();
    const recent = s.recent.filter(id => A.skills[id]).slice(0, 3);
    let courses = s.profile.enrolled.map(id => A.courseById(id)).filter(Boolean);
    if (!courses.length) courses = A.courses.filter(c => A.courseSkills(c).some(id => S.skill(id).level > 0));
    const showAll = !courses.length;
    // up next: the first unfinished skill in each course the learner is working on
    const upNext = [];
    courses.forEach(c => {
      const sid = A.courseSkills(c).find(id => S.skill(id).level < 3 && !recent.includes(id));
      if (sid && upNext.length < 3) upNext.push({ sid, c });
    });
    const days = [];
    for (let k = 6; k >= 0; k--) { const iso = S.dayShift(S.today(), -k); const d = s.days[iso] || { q: 0 }; days.push({ iso, q: d.q, label: new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'narrow' }) }); }
    const maxQ = Math.max(1, ...days.map(d => d.q));
    root.innerHTML = `
      <h1>${greeting()}${name ? ', ' + esc(name) : ''} 👋</h1>
      <p class="muted">${st.today ? 'You have practised today. Keep the streak going.' : st.days ? 'Practise today to keep your streak.' : 'Pick a skill and start a streak.'}</p>
      <div class="tiles">
        <div class="tile"><div class="big">🔥 ${st.days}</div><div class="label">${st.days === 1 ? 'day streak' : 'day streak'}</div></div>
        <div class="tile"><div class="big">⚡ ${fmt(s.points)}</div><div class="label">energy points</div></div>
        <div class="tile"><div class="big">★ ${mastered}</div><div class="label">of ${allIds.length} skills mastered</div></div>
      </div>
      ${recent.length ? `<div class="section-title"><h2>Pick up where you left off</h2></div>
        <div class="grid">${recent.map(id => { const d = A.skills[id], w = A.whereIs(id), st2 = S.skill(id); return `<div class="card tight"><div class="row">${lvl(st2.level, true)}<div style="flex:1;min-width:0"><div><a href="${skillHref(id)}"><b>${d.title}</b></a></div><div class="small muted">${w ? esc(w.course.title + ' · ' + w.unit.title) : ''}</div></div></div><div class="btn-row"><a class="btn sm primary" href="${practiceHref(id)}">Practice</a><span class="chip lv-${st2.level}">${A.LEVELS[st2.level]}</span></div></div>`; }).join('')}</div>` : ''}
      ${upNext.length ? `<div class="section-title"><h2>Up next</h2></div>
        <div class="card"><ul class="skills">${upNext.map(x => skillRow(x.sid, { where: x.c.title + ' · ' + A.whereIs(x.sid).unit.title })).join('')}</ul></div>` : ''}
      ${showAll ? `<div class="section-title"><h2>Pick your grade</h2><a href="#/courses">All courses →</a></div>
        <div class="card">${gradePicker()}</div>` : `<div class="section-title"><h2>Your courses</h2><a href="#/courses">All courses →</a></div>
        <div class="grid">${courses.map(courseCard).join('')}</div>`}
      <div class="section-title"><h2>This week</h2><a href="#/progress">Progress →</a></div>
      <div class="card"><div class="bars">${days.map(d => `<div class="b${d.iso === S.today() ? ' today' : ''}" title="${d.iso}: ${plural(d.q, 'question')}"><i style="height:${d.q / maxQ * 80}%"></i><span>${d.label}</span></div>`).join('')}</div>
      <p class="small muted" style="margin:8px 0 0">Questions answered each day. ${days.reduce((a, d) => a + d.q, 0)} this week.</p></div>`;
  }

  /** every course as a compact chip, grouped by grade band */
  function gradePicker() {
    return A.subjects().map(sub => `<div class="band"><div class="band-name">${esc(sub)}</div><div class="chips">${A.courses.filter(c => c.subject === sub).map(c => `<a class="grade-chip" href="${courseHref(c)}" ${courseVar(c)}><span aria-hidden="true">${c.icon || '📘'}</span>${esc(c.title)}</a>`).join('')}</div></div>`).join('');
  }

  /* ---------- all courses ---------- */
  function courses(root) {
    root.innerHTML = `<h1>Courses</h1><p class="muted">Math for every grade, from Kindergarten to Precalculus. Every course is a list of units, and every unit a list of skills. Practise a skill to level it up.</p>` +
      A.subjects().map(sub => `<div class="section-title"><h2>${esc(sub)}</h2></div><div class="grid">${A.courses.filter(c => c.subject === sub).map(courseCard).join('')}</div>`).join('');
  }

  /* ---------- a course ---------- */
  function course(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    const ids = A.courseSkills(c), m = E.mastery(ids);
    const enrolled = S.get().profile.enrolled.includes(c.id);
    const pool = E.masteryPool(c);
    root.innerHTML = `
      <div class="crumbs"><a href="#/courses">Courses</a> › <span>${esc(c.title)}</span></div>
      <div class="hero" ${courseVar(c)}>
        <div class="row between">
          <div class="row"><span class="icon-big" aria-hidden="true">${c.icon || '📘'}</span><div><h1 style="margin:0">${esc(c.title)}</h1><div class="muted">${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}</div></div></div>
          <button class="btn ${enrolled ? '' : 'primary'}" id="enroll">${enrolled ? '✓ On my home page' : '+ Add to my home page'}</button>
        </div>
        <p style="margin-top:12px">${esc(c.blurb || '')}</p>
        <div class="row between"><b>Course mastery: ${m.pct}%</b><span class="muted small">${fmt(m.points)} of ${fmt(m.possible)} mastery points</span></div>
        ${mbar(ids)}
        <div style="margin-top:10px">${legend(m.counts)}</div>
      </div>
      <div class="two-col" style="margin-top:20px">
        <aside class="sidebar card tight"><ul class="unit-nav">${c.units.map((u, i) => `<li><a href="${unitHref(c, u)}"><span class="n">${i + 1}</span><span>${esc(u.title)}</span><span class="pbar"><span style="width:${E.mastery(u.skills).pct}%"></span></span></a></li>`).join('')}</ul></aside>
        <div>
          <div class="grid">
            <div class="card tight"><h3>Course challenge</h3><p class="muted small">${Math.min(E.CHALLENGE_N, ids.length)} questions drawn from every unit. Right answers level skills up; wrong ones level them down.</p><a class="btn primary sm" href="#/challenge/${c.id}">Start course challenge</a></div>
            <div class="card tight"><h3>Mastery challenge</h3><p class="muted small">${pool.length ? `${E.MASTERY_N} questions on the ${plural(pool.length, 'skill')} you are Familiar or Proficient in, to push them higher.` : 'Practise a few skills to Familiar or Proficient first, then come back to push them to Mastered.'}</p>${pool.length ? `<a class="btn primary sm" href="#/mastery/${c.id}">Start mastery challenge</a>` : `<button class="btn sm" disabled>Not available yet</button>`}</div>
          </div>
          ${c.units.map((u, i) => unitCard(c, u, i)).join('')}
        </div>
      </div>`;
    root.querySelector('#enroll').addEventListener('click', () => { S.enroll(c.id, !enrolled); course(root, cid); toast(enrolled ? 'Removed from your home page' : 'Added to your home page'); });
  }
  function unitCard(c, u, i) {
    const m = E.mastery(u.skills);
    return `<div class="card unit-card" style="margin-top:16px">
      <div class="num">Unit ${i + 1}</div>
      <div class="row between"><h3 style="margin:0"><a href="${unitHref(c, u)}">${esc(u.title)}</a></h3><span class="muted small">${m.points} / ${m.possible} points</span></div>
      ${u.blurb ? `<p class="muted small" style="margin:4px 0 8px">${esc(u.blurb)}</p>` : ''}
      ${mbar(u.skills, true)}
      <ul class="skills" style="margin-top:10px">${u.skills.map(sid => skillRow(sid)).join('')}
        <li class="test"><span aria-hidden="true">📝</span><div class="name">Unit test<div class="sub">${plural(u.skills.length, 'question')}, one per skill. Level up or down.</div></div><div class="actions"><a class="btn sm" href="#/test/${c.id}/${u.id}">Start unit test</a></div></li>
      </ul></div>`;
  }

  /* ---------- a unit ---------- */
  function unit(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const i = c.units.indexOf(u), m = E.mastery(u.skills);
    const prev = c.units[i - 1], next = c.units[i + 1];
    root.innerHTML = `
      <div class="crumbs"><a href="#/courses">Courses</a> › <a href="${courseHref(c)}">${esc(c.title)}</a> › <span>Unit ${i + 1}</span></div>
      <div class="two-col">
        <aside class="sidebar card tight"><ul class="unit-nav">${c.units.map((uu, k) => `<li><a href="${unitHref(c, uu)}" class="${uu === u ? 'active' : ''}"><span class="n">${k + 1}</span><span>${esc(uu.title)}</span><span class="pbar"><span style="width:${E.mastery(uu.skills).pct}%"></span></span></a></li>`).join('')}</ul></aside>
        <div>
          <div class="hero" ${courseVar(c)}>
            <div class="num muted small" style="font-weight:600;text-transform:uppercase;letter-spacing:.04em">Unit ${i + 1} · ${esc(c.title)}</div>
            <h1>${esc(u.title)}</h1>
            ${u.blurb ? `<p>${esc(u.blurb)}</p>` : ''}
            <div class="row between"><b>Unit mastery: ${m.pct}%</b><span class="muted small">${m.points} of ${m.possible} mastery points</span></div>
            ${mbar(u.skills)}
            <div style="margin-top:10px">${legend(m.counts)}</div>
          </div>
          <div class="card" style="margin-top:16px">
            <ul class="skills">${u.skills.map(sid => skillRow(sid)).join('')}
              <li class="test"><span aria-hidden="true">📝</span><div class="name">Unit test<div class="sub">${plural(u.skills.length, 'question')}, one per skill.</div></div><div class="actions"><a class="btn sm primary" href="#/test/${c.id}/${u.id}">Start unit test</a></div></li>
            </ul>
          </div>
          <div class="row between" style="margin-top:16px">${prev ? `<a class="btn sm" href="${unitHref(c, prev)}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn sm" href="${unitHref(c, next)}">${esc(next.title)} →</a>` : ''}</div>
        </div>
      </div>`;
  }

  /* ---------- a skill: learn, then practise ---------- */
  function skill(root, sid) {
    const def = A.skills[sid], where = A.whereIs(sid);
    if (!def || !where) return notFound(root);
    const st = S.skill(sid), c = where.course, u = where.unit;
    const idx = u.skills.indexOf(sid);
    const nxt = nextSkill(sid);
    root.innerHTML = `
      <div class="crumbs"><a href="${courseHref(c)}">${esc(c.title)}</a> › <a href="${unitHref(c, u)}">${esc(u.title)}</a> › <span>Skill ${idx + 1} of ${u.skills.length}</span></div>
      <div class="hero" ${courseVar(c)}>
        <div class="row">${lvl(st.level, true)}<div style="flex:1;min-width:0"><h1 style="margin:0">${def.title}</h1><div class="muted small">${A.LEVELS[st.level]}${st.sets ? ` · practised ${plural(st.sets, 'time')} · ${st.tries ? Math.round(st.right / st.tries * 100) : 0}% right` : ' · not practised yet'}</div></div></div>
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice · ${E.PRACTICE_N} questions</a>${nxt ? `<a class="btn ghost" href="${skillHref(nxt)}">Next skill: ${A.skills[nxt].title} →</a>` : ''}</div>
      </div>
      <div class="card learn" style="margin-top:16px"><h2>Learn</h2>${def.learn || '<p class="muted">No notes for this skill yet. Jump into practice: every question comes with step-by-step hints.</p>'}
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice</a></div></div>`;
  }

  /* ---------- the exercise player ---------- */
  function exercise(root, s, opts) {
    opts = opts || {};
    root.__session = s;                      // for the test suite
    const total = s.items.length;
    let hintsShown = 0, selected = null, phase = 'fresh', lastFeedback = '';

    function dots() {
      return `<div class="dots" aria-label="Progress">${s.items.map((it, k) => {
        const r = s.results[k];
        let cls = k === s.i ? 'current' : '';
        if (r && r.done) cls = E.counts(r) ? 'right' : (r.correct ? 'hinted' : 'wrong');
        return `<span class="${cls}"></span>`;
      }).join('')}</div>`;
    }
    function answerArea(q) {
      if (q.type === 'choice') {
        return `<ul class="choices" id="choices">${q.choices.map((ch, k) => `<li><button type="button" data-k="${k}" aria-pressed="${selected === k}"><span class="key" aria-hidden="true">${k + 1}</span><span>${ch}</span></button></li>`).join('')}</ul>`;
      }
      const isNum = q.type === 'number';
      const pre = q.unit === '$', unit = q.unit && !pre ? `<span class="unit">${q.unit}</span>` : '';
      return `<div class="row">${pre ? '<span class="unit" style="margin:0">$</span>' : ''}<input id="ans" type="text" ${isNum ? 'inputmode="text"' : ''} autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" placeholder="${isNum ? 'Your answer' : 'Type your answer'}">${unit}</div>
        <div class="help">${isNum ? 'Fractions like <b>3/4</b>, mixed numbers like <b>1 1/2</b>, and decimals are all fine.' : (q.help || 'Accents and capital letters do not matter.')}</div>`;
    }
    function hintsArea(q) {
      const shown = q.hints.slice(0, hintsShown);
      const revealed = s.results[s.i] && s.results[s.i].revealed;
      return `<div class="hints" id="hints">${shown.map((hh, k) => `<div class="hint"><div class="hn">${k === q.hints.length - 1 ? 'Last step' : 'Hint ' + (k + 1)}</div>${hh}</div>`).join('')}
        ${revealed && !s.results[s.i].correct ? `<div class="hint"><div class="hn">Answer</div><b>${A.answerText(q)}</b></div>` : ''}</div>`;
    }
    function render() {
      if (E.isDone(s)) return summary();
      const it = E.current(s), q = it.q, r = s.results[s.i];
      const canHint = s.hints && hintsShown < q.hints.length && phase !== 'done';
      const def = A.skills[it.skillId];
      root.innerHTML = `<div class="ex">
        <div class="ex-head"><a class="btn sm ghost back" href="${opts.back || '#/'}">← <span class="back-long">${esc(opts.backLabel || 'Back')}</span><span class="back-short">Back</span></a><h1>${esc(s.title)}</h1>${dots()}</div>
        <div class="card">
          <div class="question">${s.kind !== 'practice' ? `<div class="lead">${def.title}</div>` : ''}${q.prompt}</div>
          <div class="answer">${answerArea(q)}</div>
          <div id="feedback">${lastFeedback}</div>
          ${hintsArea(q)}
          <div class="ex-foot">
            ${s.hints ? `<button class="btn" id="hint" ${canHint ? '' : 'disabled'}>💡 Hint${canHint ? ` <span class="muted small">(${q.hints.length - hintsShown} left)</span>` : ''}</button>` : ''}
            ${phase !== 'done' ? `<button class="btn ghost" id="giveup">I don’t know</button>` : ''}
            <span class="spacer"></span>
            <span class="muted small">${s.i + 1} / ${total}</span>
            ${phase === 'done' ? `<button class="btn primary" id="next">${s.i + 1 === total ? 'Finish' : 'Next'} →</button>` : `<button class="btn primary" id="check" disabled>Check</button>`}
          </div>
        </div></div>`;
      bind(q);
    }
    function currentInput(q) {
      if (q.type === 'choice') return selected;
      const el = root.querySelector('#ans');
      return el ? el.value : '';
    }
    function hasInput(q) { const v = currentInput(q); return q.type === 'choice' ? v != null : String(v).trim().length > 0; }
    function bind(q) {
      const check = root.querySelector('#check'), next = root.querySelector('#next'), hint = root.querySelector('#hint'), giveup = root.querySelector('#giveup');
      const ans = root.querySelector('#ans');
      if (ans) {
        if (phase === 'done') ans.disabled = true; else setTimeout(() => ans.focus(), 0);
        ans.addEventListener('input', () => { if (check) check.disabled = !hasInput(q); });
        if (q.type !== 'choice' && phase !== 'done' && typeof lastInput === 'string') { ans.value = lastInput; if (check) check.disabled = !hasInput(q); }
      }
      root.querySelectorAll('#choices button').forEach(b => {
        if (phase === 'done') {
          b.disabled = true;
          const k = Number(b.dataset.k);
          if (k === q.answerIndex) b.classList.add('is-right');
          else if (k === selected) b.classList.add('is-wrong');
        } else b.addEventListener('click', () => { selected = Number(b.dataset.k); root.querySelectorAll('#choices button').forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.k) === selected))); if (check) check.disabled = false; });
      });
      if (check) check.addEventListener('click', doCheck);
      if (next) { next.addEventListener('click', doNext); setTimeout(() => next.focus(), 0); }
      if (hint) hint.addEventListener('click', doHint);
      if (giveup) giveup.addEventListener('click', doGiveUp);
    }
    let lastInput = null;
    function doCheck() {
      const q = E.current(s).q;
      if (!hasInput(q)) return;
      const res = E.answer(s, currentInput(q));
      lastInput = q.type === 'choice' ? null : String(currentInput(q));
      const r = s.results[s.i];
      if (res.unreadable) { lastFeedback = `<div class="feedback note">🤔 <span>I could not read that as a number. Try something like <b>12</b>, <b>−3</b>, <b>3/4</b> or <b>0.5</b>.</span></div>`; render(); return; }
      if (res.correct) {
        phase = 'done'; r.done = true;
        lastFeedback = `<div class="feedback good">✅ <span>Correct!${r.hinted ? ' You got there with a hint.' : (r.tries > 1 ? ' Second time lucky.' : '')}</span></div>`;
        if (hintsShown < q.hints.length) lastFeedback += `<details style="margin-top:10px"><summary class="muted small">See the steps</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      } else if (s.hints) {
        lastFeedback = `<div class="feedback bad">❌ <span>Not quite. Try again, or take a hint.</span></div>`;
      } else {
        phase = 'done'; E.reveal(s); r.revealed = true;
        lastFeedback = `<div class="feedback bad">❌ <span>Not quite. The answer is <b>${A.answerText(q)}</b>.</span></div>
          <details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      }
      render();
    }
    function doHint() {
      const q = E.current(s).q;
      if (hintsShown >= q.hints.length) return;
      E.useHint(s);
      hintsShown += 1;
      if (hintsShown === q.hints.length) { E.reveal(s); phase = 'done'; lastFeedback = `<div class="feedback note">💡 <span>That was the last step. Read it through, then move on: this one will come back in Review.</span></div>`; }
      render();
    }
    function doGiveUp() {
      const q = E.current(s).q;
      E.reveal(s); phase = 'done'; hintsShown = s.hints ? q.hints.length : 0;
      lastFeedback = `<div class="feedback note">💡 <span>No problem. The answer is <b>${A.answerText(q)}</b>${s.hints ? ', and the steps are below' : ''}. It will come back in Review.</span></div>` +
        (s.hints ? '' : `<details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`);
      render();
    }
    function doNext() {
      E.next(s);
      hintsShown = 0; selected = null; phase = 'fresh'; lastFeedback = ''; lastInput = null;
      render();
      window.scrollTo(0, 0);
    }
    function summary() {
      const f = E.finish(s);
      if (window.APP) window.APP.refreshStats();
      const ratio = f.total ? f.right / f.total : 0;
      const head = ratio === 1 ? 'Perfect!' : ratio >= 0.7 ? 'Nice work!' : ratio >= 0.4 ? 'Good effort.' : 'Keep going.';
      const changes = f.changes.map(ch => `<span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.skills[ch.skillId].title}: ${A.LEVELS[ch.from]} → <b>${A.LEVELS[ch.to]}</b></span>`).join('');
      let nextBtn = '';
      if (s.kind === 'practice') { const nx = nextSkill(s.skillId); if (nx) nextBtn = `<a class="btn" href="${skillHref(nx)}">Next skill: ${A.skills[nx].title} →</a>`; }
      root.innerHTML = `<div class="ex"><div class="card summary">
        <div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${esc(s.title)}</div>
        <h1 style="margin-top:6px">${head}</h1>
        <div class="score">${f.right} / ${f.total}</div>
        <div class="what">${f.right === f.total ? 'Every question right, first try, no hints.' : `${plural(f.right, 'question')} right first try without a hint.${s.kind === 'practice' && ratio < 1 ? ' Get all ' + f.total + ' to reach Proficient.' : ''}`}</div>
        ${changes ? `<div class="changes">${changes}</div>` : (s.kind !== 'review' ? `<p class="muted" style="margin-top:14px">No level changes this time.</p>` : '')}
        <div class="chip" style="font-size:1rem">⚡ +${fmt(f.pts)} energy points</div>
        <div class="btn-row">
          ${opts.again ? `<button class="btn primary" id="again">${opts.againLabel || 'Practice again'}</button>` : ''}
          ${nextBtn}
          <a class="btn" href="${opts.back || '#/'}">${esc(opts.backLabel || 'Back')}</a>
        </div></div></div>`;
      const again = root.querySelector('#again');
      if (again) again.addEventListener('click', () => opts.again());
    }
    if (root.__onKey) root.removeEventListener('keydown', root.__onKey);   // one player per element: drop the last session's keys
    root.__onKey = onKey;
    root.addEventListener('keydown', onKey);
    function onKey(ev) {
      if (!root.isConnected) { root.removeEventListener('keydown', onKey); return; }
      if (ev.key === 'Enter' && !ev.shiftKey) {
        const next = root.querySelector('#next'), check = root.querySelector('#check');
        if (next) { ev.preventDefault(); next.click(); }
        else if (check && !check.disabled && document.activeElement && document.activeElement.id !== 'giveup' && document.activeElement.id !== 'hint') { ev.preventDefault(); check.click(); }
      } else if (/^[1-9]$/.test(ev.key) && phase !== 'done' && !(document.activeElement && document.activeElement.tagName === 'INPUT')) {
        const b = root.querySelector(`#choices button[data-k="${Number(ev.key) - 1}"]`);
        if (b) b.click();
      }
    }
    render();
  }

  function practice(root, sid) {
    const def = A.skills[sid], where = A.whereIs(sid);
    if (!def || !where) return notFound(root);
    const start = () => exercise(root, E.start('practice', { skillId: sid }), { back: unitHref(where.course, where.unit), backLabel: where.unit.title, again: start });
    start();
  }
  function unitTest(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const start = () => exercise(root, E.start('unit-test', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Take it again' });
    start();
  }
  function challenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    const start = () => exercise(root, E.start('course-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Take it again' });
    start();
  }
  function masteryChallenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    if (!E.masteryPool(c).length) { root.innerHTML = `<div class="card empty">Nothing to level up yet. Practise a few skills first.<div class="btn-row" style="justify-content:center"><a class="btn" href="${courseHref(c)}">Back to ${esc(c.title)}</a></div></div>`; return; }
    const start = () => { if (!E.masteryPool(c).length) return masteryChallenge(root, cid); exercise(root, E.start('mastery-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Another round' }); };
    start();
  }
  function review(root) {
    const missed = S.get().missed.filter(m => A.skills[m.skill]);
    if (!missed.length) { root.innerHTML = `<h1>Review</h1><div class="card empty">Nothing to review. Every question you missed has been put right. 🎉<div class="btn-row" style="justify-content:center"><a class="btn" href="#/">Home</a></div></div>`; return; }
    const start = () => { if (!S.get().missed.length) return review(root); exercise(root, E.start('review'), { back: '#/progress', backLabel: 'Progress', again: start, againLabel: 'Keep reviewing' }); };
    start();
  }

  /* ---------- progress ---------- */
  function progress(root) {
    const s = S.get(), st = S.streak();
    const allIds = Object.keys(A.skills);
    const levels = [0, 0, 0, 0, 0];
    allIds.forEach(id => { levels[S.skill(id).level] += 1; });
    const totalQ = Object.values(s.days).reduce((a, d) => a + d.q, 0), totalRight = Object.values(s.days).reduce((a, d) => a + d.right, 0);
    const activeDays = Object.values(s.days).filter(d => d.q).length;
    // heatmap: 26 weeks of Monday-first columns ending this week
    const today = S.today();
    const dow = (new Date(today + 'T12:00').getDay() + 6) % 7;         // 0 = Monday
    const start = S.dayShift(today, -(dow + 7 * 25));
    let cells = '';
    for (let k = 0; k < 26 * 7; k++) {
      const iso = S.dayShift(start, k);
      const d = s.days[iso];
      const q = d ? d.q : 0;
      const cls = !q ? '' : q < 5 ? 'h1' : q < 15 ? 'h2' : q < 30 ? 'h3' : 'h4';
      cells += `<span class="${cls}" title="${iso}: ${plural(q, 'question')}"${iso > today ? ' style="visibility:hidden"' : ''}></span>`;
    }
    const missed = s.missed.filter(m => A.skills[m.skill]);
    const kinds = { practice: 'Practice', 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', review: 'Review' };
    root.innerHTML = `
      <h1>Progress</h1>
      <div class="tiles">
        <div class="tile"><div class="big">🔥 ${st.days}</div><div class="label">day streak</div></div>
        <div class="tile"><div class="big">⚡ ${fmt(s.points)}</div><div class="label">energy points</div></div>
        <div class="tile"><div class="big">${fmt(totalQ)}</div><div class="label">questions answered</div></div>
        <div class="tile"><div class="big">${totalQ ? Math.round(totalRight / totalQ * 100) : 0}%</div><div class="label">right first try</div></div>
        <div class="tile"><div class="big">${activeDays}</div><div class="label">days practised</div></div>
      </div>
      <div class="section-title"><h2>Activity</h2><span class="muted small">last 26 weeks</span></div>
      <div class="card"><div class="heat" aria-label="Questions answered per day">${cells}</div></div>
      <div class="section-title"><h2>Mastery</h2></div>
      <div class="card">${legend(levels)}<div style="margin-top:10px">${mbar(allIds)}</div>
        <table class="plain" style="margin-top:14px"><thead><tr><th>Course</th><th>Mastery</th><th class="small">★ / P / F / A</th></tr></thead><tbody>
        ${A.courses.map(c => { const ids = A.courseSkills(c), m = E.mastery(ids); return `<tr><td><a href="${courseHref(c)}">${c.icon || ''} ${esc(c.title)}</a></td><td style="width:40%"><div class="row"><div class="pbar" style="flex:1" ${courseVar(c)}><span style="width:${m.pct}%"></span></div><b class="small">${m.pct}%</b></div></td><td class="small muted">${m.counts[4]} / ${m.counts[3]} / ${m.counts[2]} / ${m.counts[1]}</td></tr>`; }).join('')}
        </tbody></table></div>
      <div class="section-title"><h2>Mistakes to review</h2></div>
      <div class="card">${missed.length ? `<div class="row between"><span>${plural(missed.length, 'question')} you missed, rebuilt exactly as asked. Get one right and it comes off the list.</span><a class="btn primary sm" href="#/review">Review now</a></div>` : '<p class="muted" style="margin:0">Nothing waiting. Missed questions will collect here.</p>'}</div>
      <div class="section-title"><h2>Recent activity</h2></div>
      <div class="card">${s.log.length ? `<ul class="log">${s.log.slice(0, 25).map(e => {
        const what = e.skill && A.skills[e.skill] ? A.skills[e.skill].title : e.unit && A.unitById(e.course, e.unit) ? A.unitById(e.course, e.unit).title : e.course && A.courseById(e.course) ? A.courseById(e.course).title : '';
        return `<li><span class="when">${ago(e.t)}</span><span><b>${kinds[e.kind] || e.kind}</b>${what ? ' · ' + what : ''} <span class="muted">${e.right}/${e.total}</span>${(e.changes || []).map(ch => ` <span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.LEVELS[ch.to]}</span>`).join('')}</span><span class="pts">+${e.pts}</span></li>`; }).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing yet. Your practice will show up here.</p>'}</div>`;
  }

  /* ---------- settings ---------- */
  function settings(root) {
    const p = S.get().profile;
    const skillCount = Object.keys(A.skills).length;
    root.innerHTML = `
      <h1>Settings</h1>
      <div class="card"><h2>You</h2>
        <div class="field"><label for="name">Your name</label><input id="name" type="text" value="${esc(p.name)}" placeholder="Optional" autocomplete="off"><div class="help">Used in the greeting. It stays on this device.</div></div>
        <div class="field"><label for="theme">Colours</label><select id="theme"><option value="system">Match my device</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
        <div class="field"><label for="size">Text size</label><select id="size"><option value="normal">Normal</option><option value="large">Large</option><option value="xlarge">Extra large</option></select></div>
      </div>
      <div class="card"><h2>Your progress</h2>
        <p class="muted">Everything is saved in this browser. To move to another device, or to keep a copy safe, save a file here and load it there.</p>
        <div class="btn-row"><button class="btn primary" id="export">Save a copy</button><label class="btn">Load a copy <input id="import" type="file" accept="application/json,.json" class="visually-hidden"></label></div>
      </div>
      <div class="card"><h2>Start over</h2><p class="muted">Erases every level, point and streak on this device. The copy you saved, if any, is not touched.</p><button class="btn danger" id="reset">Erase everything on this device</button></div>
      <div class="card"><h2>About</h2><p class="muted">${A.courses.length} courses, ${skillCount} skills. Every question is generated on this device from a seed, so a missed question can always be asked again exactly as it was. Nothing is sent anywhere. <a href="https://github.com/priyaanh/priyaan-hub">Source on GitHub</a>.</p></div>`;
    root.querySelector('#theme').value = p.theme || 'system';
    root.querySelector('#size').value = p.textSize || 'normal';
    root.querySelector('#name').addEventListener('input', ev => { S.setProfile({ name: ev.target.value.slice(0, 40) }); window.APP.applyPrefs(); });
    root.querySelector('#theme').addEventListener('change', ev => { S.setProfile({ theme: ev.target.value }); window.APP.applyPrefs(); });
    root.querySelector('#size').addEventListener('change', ev => { S.setProfile({ textSize: ev.target.value }); window.APP.applyPrefs(); });
    root.querySelector('#export').addEventListener('click', () => {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `procademy-backup-${S.today()}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Saved a copy');
    });
    root.querySelector('#import').addEventListener('change', ev => {
      const f = ev.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { S.importJSON(String(rd.result)); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Loaded your copy'); } catch (e) { toast(e.message || 'Could not read that file'); } };
      rd.readAsText(f);
    });
    root.querySelector('#reset').addEventListener('click', () => {
      if (!confirm('Erase every level, point and streak on this device?')) return;
      S.reset(); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Erased');
    });
  }

  /* ---------- search ---------- */
  function search(root, q) {
    q = (q || '').trim();
    const words = A.normText(q).split(' ').filter(Boolean);
    const hit = text => { const t = A.normText(text); return words.length && words.every(w => t.includes(w)); };
    const skills = Object.keys(A.skills).filter(sid => { const w = A.whereIs(sid); return w && (hit(A.skills[sid].title) || hit(A.skills[sid].title + ' ' + w.unit.title + ' ' + w.course.title)); }).slice(0, 40);
    const courses = A.courses.filter(c => hit(c.title) || hit(c.blurb || ''));
    const units = A.courses.flatMap(c => c.units.filter(u => hit(u.title)).map(u => ({ c, u }))).slice(0, 12);
    root.innerHTML = `<h1>Search</h1><p class="muted">${q ? `Results for “${esc(q)}”` : 'Type in the box above to search skills, units and courses.'}</p>
      ${courses.length ? `<div class="section-title"><h2>Courses</h2></div><div class="grid">${courses.map(courseCard).join('')}</div>` : ''}
      ${units.length ? `<div class="section-title"><h2>Units</h2></div><div class="card">${units.map(x => `<div class="search-hit"><span aria-hidden="true">📂</span><div><a href="${unitHref(x.c, x.u)}"><b>${esc(x.u.title)}</b></a><div class="where">${esc(x.c.title)}</div></div></div>`).join('')}</div>` : ''}
      ${skills.length ? `<div class="section-title"><h2>Skills</h2></div><div class="card"><ul class="skills">${skills.map(sid => { const w = A.whereIs(sid); return skillRow(sid, { where: w.course.title + ' · ' + w.unit.title }); }).join('')}</ul></div>` : ''}
      ${q && !courses.length && !units.length && !skills.length ? `<div class="card empty">Nothing matched. Try a shorter word, like “fraction” or “slope”.</div>` : ''}`;
  }

  function notFound(root) {
    root.innerHTML = `<div class="card empty"><h1>Not here</h1><p>That page does not exist, or the skill has moved.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/">Home</a><a class="btn" href="#/courses">Courses</a></div></div>`;
  }

  window.VIEWS = { home, courses, course, unit, skill, practice, unitTest, challenge, masteryChallenge, review, progress, settings, search, notFound, stats, brand, toast };
})();
