#!/usr/bin/env node
/* Runs a page in headless Chrome over the DevTools protocol and prints its console output, in REAL time.
   Needed for tests/offline.html: --virtual-time-budget fast-forwards timers but service-worker install and
   cache writes are real work, so the usual --dump-dom run exits before any of it happens.
   Usage: node tests/cdp.js <url> [maxMs] [stopWhenLineContains] */
'use strict';
const { spawn } = require('child_process');
const url = process.argv[2];
const maxMs = Number(process.argv[3] || 30000);
const stopOn = process.argv[4] || null;
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=' + port,
  '--window-size=1280,1000', 'about:blank'], { stdio: 'ignore' });
let sawError = false;

(async () => {
  let version;
  for (let i = 0; i < 120 && !version; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); }
    catch (e) { await new Promise(r => setTimeout(r, 100)); }
  }
  if (!version) throw new Error('Chrome did not start a debugging port');
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('devtools socket failed')); });
  let id = 0; const pending = new Map();
  const send = (method, params, sessionId) => new Promise(res => { const m = ++id; pending.set(m, res); ws.send(JSON.stringify({ id: m, method, params, sessionId })); });
  let done; const finished = new Promise(r => { done = r; });
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result || msg.error); pending.delete(msg.id); return; }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => (a.value !== undefined ? String(a.value) : (a.description || a.type))).join(' ');
      console.log(text);
      if (msg.params.type === 'error') sawError = true;
      if (stopOn && text.includes(stopOn)) done();
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      sawError = true;
      const d = msg.params.exceptionDetails;
      console.log('EXCEPTION ' + ((d.exception && d.exception.description) || d.text));
    }
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  await send('Page.navigate', { url }, sessionId);
  const timer = setTimeout(done, maxMs);
  await finished;
  clearTimeout(timer);
  ws.close(); chrome.kill();
  process.exit(sawError ? 1 : 0);
})().catch(e => { console.error('harness error:', e.message); chrome.kill(); process.exit(2); });
