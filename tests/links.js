#!/usr/bin/env node
/* links.js — every internal link, script, stylesheet and image on every page must point at something
   that exists. A page renamed or a file dropped shows up here instead of as a dead click months later.
   Run on its own:  node tests/links.js */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter(f => /\.html$/.test(f)).sort();

/* Pages that read a fragment. A link carrying one to a page that ignores it is a dead end for the
   reader, so it is reported rather than passed. */
const readsHash = {};
const handles = f => {
  if (!(f in readsHash)) {
    try { readsHash[f] = /location\.hash/.test(fs.readFileSync(path.join(root, f), 'utf8')); }
    catch (e) { readsHash[f] = false; }
  }
  return readsHash[f];
};

const problems = [];
const note = (page, what, why) => problems.push(page + ': ' + what + ' — ' + why);
let checked = 0;

/* Only static markup is walked. Links that JavaScript builds are covered by the browser suites. */
const ATTRS = [
  [/<a\b[^>]*?\shref\s*=\s*["']([^"']+)["']/gi, 'link'],
  [/<script\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi, 'script'],
  [/<link\b[^>]*?\shref\s*=\s*["']([^"']+)["']/gi, 'stylesheet'],
  [/<img\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi, 'image'],
  [/<iframe\b[^>]*?\ssrc\s*=\s*["']([^"']+)["']/gi, 'frame']
];

pages.forEach(page => {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const ids = new Set((html.match(/\sid\s*=\s*["']([^"']+)["']/gi) || [])
    .map(m => m.replace(/.*["']([^"']+)["']\s*$/, '$1')));

  ATTRS.forEach(([re, kind]) => {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(html))) {
      const raw = m[1].trim();
      if (!raw) { note(page, kind + ' with an empty target', 'points nowhere'); continue; }
      if (/^(https?:|mailto:|tel:|data:|blob:|javascript:|\/\/)/i.test(raw)) continue;   // external, left alone
      checked++;

      if (raw[0] === '#') {                                  // same page
        const id = decodeURIComponent(raw.slice(1));
        if (id && !ids.has(id)) note(page, kind + ' "' + raw + '"', 'no element with that id on this page');
        continue;
      }
      const hash = raw.indexOf('#');
      const file = hash < 0 ? raw : raw.slice(0, hash);
      const frag = hash < 0 ? '' : raw.slice(hash + 1);
      if (!fs.existsSync(path.join(root, file))) {
        /* badges/pdf/*.pdf are downloaded per device and deliberately absent from the repository */
        if (!/^badges\/pdf\//.test(file)) note(page, kind + ' "' + raw + '"', 'no such file');
        continue;
      }
      if (frag && /\.html$/.test(file) && !handles(file)) {
        note(page, kind + ' "' + raw + '"', file + ' does not read a fragment, so it lands at the top');
      }
    }
  });
});

if (problems.length) {
  console.log('FAIL ' + problems.length + ' broken reference' + (problems.length === 1 ? '' : 's') + ':');
  problems.forEach(p => console.log('  ' + p));
  console.log('RESULTS ' + problems.length + ' failed of ' + (checked + problems.length));
  process.exit(1);
}
console.log('PASS ' + checked + ' internal references across ' + pages.length + ' pages all resolve');
console.log('RESULTS 0 failed of ' + checked);
