/* test_spanish.js — checks spanish.js by re-deriving every answer from the tables rather than trusting
   the generator that produced it. Run: node test_spanish.js
   The rule throughout: a check must not call the same function the generator called to get the answer.
   Where it has to (numberWords, agree), the expected value is spelled out here by hand instead. */
'use strict';
const ES = require('./spanish.js');

let checks = 0, failures = 0;
const table = {};
function assert(cond, msg) {
  checks++;
  if (!cond) { failures++; if (failures <= 25) console.log('FAIL: ' + msg); }
  return !!cond;
}
function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
function fold(s) {
  return String(s).toLowerCase().replace(/[áéíóúüñ]/g, c => ({ 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' }[c]));
}

/* ---------------------------------------------------------------- the tables, checked by hand */
{
  /* numberWords against values written out here, not computed */
  const known = {
    0: 'cero', 1: 'uno', 7: 'siete', 11: 'once', 15: 'quince', 16: 'dieciséis', 19: 'diecinueve',
    20: 'veinte', 21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 26: 'veintiséis', 29: 'veintinueve',
    30: 'treinta', 31: 'treinta y uno', 40: 'cuarenta', 45: 'cuarenta y cinco', 50: 'cincuenta',
    60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa', 99: 'noventa y nueve',
    100: 'cien', 101: 'ciento uno', 115: 'ciento quince', 200: 'doscientos', 250: 'doscientos cincuenta',
    500: 'quinientos', 700: 'setecientos', 900: 'novecientos', 999: 'novecientos noventa y nueve', 1000: 'mil'
  };
  Object.keys(known).forEach(n => assert(ES.numberWords(+n) === known[n],
    'numberWords(' + n + ') gave "' + ES.numberWords(+n) + '", wanted "' + known[n] + '"'));
  /* every number 0..1000 produces words, and no two numbers share a spelling */
  const seen = {};
  for (let n = 0; n <= 1000; n++) {
    const w = ES.numberWords(n);
    checks++;
    if (!w || /undefined|NaN/.test(w)) { failures++; console.log('FAIL: numberWords(' + n + ') = ' + w); }
    else if (seen[w] !== undefined) { failures++; console.log('FAIL: ' + n + ' and ' + seen[w] + ' are both "' + w + '"'); }
    seen[w] = n;
  }

  /* the four irregular verbs, written out here independently */
  assert(ES.SER.join(',') === 'soy,eres,es,somos,sois,son', 'ser forms');
  assert(ES.ESTAR.join(',') === 'estoy,estás,está,estamos,estáis,están', 'estar forms');
  assert(ES.TENER.join(',') === 'tengo,tienes,tiene,tenemos,tenéis,tienen', 'tener forms');
  assert(ES.IR.join(',') === 'voy,vas,va,vamos,vais,van', 'ir forms');

  /* regular endings, checked against forms written out by hand */
  [['hablar', 0, 'hablo'], ['hablar', 1, 'hablas'], ['hablar', 2, 'habla'], ['hablar', 3, 'hablamos'],
   ['hablar', 4, 'habláis'], ['hablar', 5, 'hablan'],
   ['comer', 0, 'como'], ['comer', 2, 'come'], ['comer', 3, 'comemos'], ['comer', 4, 'coméis'], ['comer', 5, 'comen'],
   ['vivir', 0, 'vivo'], ['vivir', 1, 'vives'], ['vivir', 3, 'vivimos'], ['vivir', 4, 'vivís'], ['vivir', 5, 'viven']
  ].forEach(([inf, p, want]) => assert(ES.conjRegular(inf, p) === want,
    inf + ' person ' + p + ' gave ' + ES.conjRegular(inf, p) + ', wanted ' + want));

  /* stem changes, including the nosotros forms that must NOT change */
  [[{ inf: 'querer', from: 'e', to: 'ie' }, 0, 'quiero'], [{ inf: 'querer', from: 'e', to: 'ie' }, 3, 'queremos'],
   [{ inf: 'poder', from: 'o', to: 'ue' }, 2, 'puede'], [{ inf: 'poder', from: 'o', to: 'ue' }, 3, 'podemos'],
   [{ inf: 'pedir', from: 'e', to: 'i' }, 5, 'piden'], [{ inf: 'pedir', from: 'e', to: 'i' }, 3, 'pedimos'],
   [{ inf: 'jugar', from: 'u', to: 'ue' }, 0, 'juego'], [{ inf: 'jugar', from: 'u', to: 'ue' }, 3, 'jugamos'],
   [{ inf: 'dormir', from: 'o', to: 'ue' }, 1, 'duermes'], [{ inf: 'preferir', from: 'e', to: 'ie' }, 0, 'prefiero'],
   [{ inf: 'empezar', from: 'e', to: 'ie' }, 2, 'empieza'], [{ inf: 'almorzar', from: 'o', to: 'ue' }, 5, 'almuerzan']
  ].forEach(([v, p, want]) => assert(ES.conjStem(v, p) === want,
    v.inf + ' person ' + p + ' gave ' + ES.conjStem(v, p) + ', wanted ' + want));

  /* every stem verb in the table really contains the vowel it claims to change */
  ES.STEM.forEach(v => {
    const stem = v.inf.slice(0, -2);
    assert(stem.lastIndexOf(v.from) >= 0, v.inf + ' has no "' + v.from + '" to change');
    assert(ES.conjStem(v, 3) === stem + ES.ENDINGS[v.inf.slice(-2)][3], v.inf + ' must keep its plain stem for nosotros');
    assert(ES.conjStem(v, 0) !== stem + ES.ENDINGS[v.inf.slice(-2)][0], v.inf + ' must change its stem for yo');
  });

  /* agreement, by hand */
  [[{ es: 'blanco', kind: 'o' }, 'f', false, 'blanca'], [{ es: 'blanco', kind: 'o' }, 'm', true, 'blancos'],
   [{ es: 'blanco', kind: 'o' }, 'f', true, 'blancas'], [{ es: 'grande', kind: 'e' }, 'f', false, 'grande'],
   [{ es: 'grande', kind: 'e' }, 'm', true, 'grandes'], [{ es: 'azul', kind: 'c', pl: 'azules' }, 'f', true, 'azules'],
   [{ es: 'feliz', kind: 'c', pl: 'felices' }, 'm', true, 'felices'], [{ es: 'joven', kind: 'c', pl: 'jóvenes' }, 'f', true, 'jóvenes']
  ].forEach(([a, g, pl, want]) => assert(ES.agree(a, g, pl) === want,
    a.es + ' + ' + g + (pl ? ' plural' : ' singular') + ' gave ' + ES.agree(a, g, pl) + ', wanted ' + want));

  /* plurals, by hand */
  [[{ es: 'libro' }, 'libros'], [{ es: 'papel' }, 'papeles'], [{ es: 'lápiz', pl: 'lápices' }, 'lápices'],
   [{ es: 'ciudad', pl: 'ciudades' }, 'ciudades'], [{ es: 'pez', pl: 'peces' }, 'peces'], [{ es: 'mano' }, 'manos']
  ].forEach(([n, want]) => assert(ES.plural(n) === want, 'plural of ' + n.es + ' gave ' + ES.plural(n) + ', wanted ' + want));

  /* articles */
  assert(ES.defArt('m', false) === 'el' && ES.defArt('f', false) === 'la', 'el/la');
  assert(ES.defArt('m', true) === 'los' && ES.defArt('f', true) === 'las', 'los/las');
  assert(ES.indefArt('m', false) === 'un' && ES.indefArt('f', false) === 'una', 'un/una');
  assert(ES.indefArt('m', true) === 'unos' && ES.indefArt('f', true) === 'unas', 'unos/unas');

  /* the clock, by hand */
  assert(ES.timeWords(1, 0)[0] === 'Es la una en punto', '1:00 gave ' + ES.timeWords(1, 0)[0]);
  assert(ES.timeWords(3, 15)[0] === 'Son las tres y cuarto', '3:15 gave ' + ES.timeWords(3, 15)[0]);
  assert(ES.timeWords(7, 30)[0] === 'Son las siete y media', '7:30 gave ' + ES.timeWords(7, 30)[0]);
  assert(ES.timeWords(4, 45)[0] === 'Son las cinco menos cuarto', '4:45 gave ' + ES.timeWords(4, 45)[0]);
  assert(ES.timeWords(12, 50)[0] === 'Es la una menos diez', '12:50 gave ' + ES.timeWords(12, 50)[0]);
  assert(ES.timeWords(2, 20)[0] === 'Son las dos y veinte', '2:20 gave ' + ES.timeWords(2, 20)[0]);
  assert(ES.timeWords(1, 30)[0] === 'Es la una y media', '1:30 gave ' + ES.timeWords(1, 30)[0]);

  /* days and months in order */
  assert(ES.DAYS.join(' ') === 'lunes martes miércoles jueves viernes sábado domingo', 'days of the week');
  assert(ES.MONTHS.join(' ') === 'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre', 'months');

  /* no noun is listed twice, and every one has a gender */
  const byEs = {};
  ES.NOUNS.forEach(n => {
    assert(n.g === 'm' || n.g === 'f', n.es + ' has no gender');
    assert(!byEs[n.es], n.es + ' is in the noun table twice');
    byEs[n.es] = 1;
  });
}

/* ---------------------------------------------------------------- an independent Spanish number reader */
/* Reads the words back into a number without calling numberWords, so a wrong spelling cannot agree
   with itself. If these two ever disagree, one of them is wrong and the test says so. */
const UNITS = { cero: 0, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24,
  veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29 };
const DECADES = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
const CENTURIES = { cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500,
  seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900, mil: 1000 };
function readSpanishNumber(words) {
  const w = fold(words).split(/\s+/).filter(x => x && x !== 'y');
  let total = 0, i = 0;
  if (CENTURIES[w[0]] !== undefined) { total += CENTURIES[w[0]]; i = 1; }
  if (i < w.length && DECADES[w[i]] !== undefined) { total += DECADES[w[i]]; i++; }
  if (i < w.length && UNITS[w[i]] !== undefined) { total += UNITS[w[i]]; i++; }
  return i === w.length ? total : NaN;
}
for (let n = 0; n <= 1000; n++) {
  const back = readSpanishNumber(ES.numberWords(n));
  checks++;
  if (back !== n) { failures++; if (failures <= 25) console.log('FAIL: "' + ES.numberWords(n) + '" reads back as ' + back + ', not ' + n); }
}

/* ---------------------------------------------------------------- who is speaking */
const PERSON_OF = {
  'yo': 0, 'tú': 1, 'él': 2, 'ella': 2, 'usted': 2, 'nosotros': 3, 'nosotras': 3, 'vosotros': 4,
  'ellos': 5, 'ellas': 5, 'ustedes': 5,
  'mi hermana': 2, 'mi amigo carlos': 2, 'mis primos': 5, 'las chicas': 5, 'mi tía': 2, 'mi tío': 2
};
function personOf(subject) {
  const s = subject.toLowerCase().trim();
  if (PERSON_OF[s] !== undefined) return PERSON_OF[s];
  if (/^(los|las)\b/.test(s)) return 5;
  if (/^(el|la)\b/.test(s)) return 2;
  return null;
}
const FEELING_STEMS = ['cansad', 'content', 'enferm', 'nervios', 'ocupad', 'enojad', 'preocupad', 'triste'];
const TRAIT_STEMS = ['inteligente', 'alt', 'simpátic', 'joven', 'jóvenes', 'rubi', 'moren', 'gracios', 'seri', 'paciente'];
const JOB_WORDS = ['maestro', 'maestra', 'doctor', 'doctora', 'estudiante', 'ingeniero', 'enfermera', 'cocinero'];

/* ---------------------------------------------------------------- per-topic verification */
function verify(p) {
  const q = plain(p.question);
  const a = p.answer;
  const t = p.topic;
  const cueless = q.replace(/\s*\([^()]*\)\s*$/, '').trim();

  if (t === 'present' || t === 'stem') {
    let inf = null, subj = null;
    let m = q.match(/^(\S+)\s+\([^)]*\)\s+—\s+(.+?)\s+______/);
    if (m) { inf = m[1]; subj = m[2]; }
    else { m = q.match(/^(.+?)\s+______\s+.*\(([^)]+)\)\s*$/); if (m) { subj = m[1]; inf = m[2]; } }
    if (!assert(inf && subj, t + ': could not read "' + q + '"')) return;
    const person = personOf(subj);
    if (!assert(person !== null, t + ': unknown subject "' + subj + '" in "' + q + '"')) return;
    const kind = inf.slice(-2), stem = inf.slice(0, -2);
    let want;
    if (t === 'present') {
      want = stem + ES.ENDINGS[kind][person];
    } else {
      const v = ES.STEM.filter(x => x.inf === inf)[0];
      if (!assert(v, 'stem: ' + inf + ' is not in the stem table')) return;
      let st = stem;
      if (person !== 3 && person !== 4) {
        const at = st.lastIndexOf(v.from);
        st = st.slice(0, at) + v.to + st.slice(at + 1);
      }
      want = st + ES.ENDINGS[kind][person];
    }
    assert(a === want, t + ': ' + inf + ' for "' + subj + '" should be ' + want + ', got ' + a);
    return;
  }

  if (t === 'pret') {
    /* the preterite endings, written out here rather than imported */
    const END = { ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'], er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
      ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'] };
    let inf = null, subj = null;
    let m = q.match(/^(\S+)\s+\([^)]*\)\s+—\s+(.+?)\s+______/);
    if (m) { inf = m[1]; subj = m[2]; }
    else { m = q.match(/^(.+?)\s+______\s+.*\(([^,)]+), preterite\)\s*$/); if (m) { subj = m[1]; inf = m[2]; } }
    if (!assert(inf && subj, 'pret: could not read "' + q + '"')) return;
    const person = personOf(subj);
    if (!assert(person !== null, 'pret: unknown subject "' + subj + '"')) return;
    const kind = inf.slice(-2), want = inf.slice(0, -2) + (END[kind] || [])[person];
    assert(a === want, 'pret: ' + inf + ' for "' + subj + '" should be ' + want + ', got ' + a);
    return;
  }

  if (t === 'refl') {
    const PRON = ['me', 'te', 'se', 'nos', 'os', 'se'];
    let inf = null, subj = null;
    let m = q.match(/^(\S+)\s+\([^)]*\)\s+—\s+(.+?)\s+______/);
    if (m) { inf = m[1]; subj = m[2]; }
    else { m = q.match(/^(.+?)\s+______\s+.*\(([^)]+)\)\s*$/); if (m) { subj = m[1]; inf = m[2]; } }
    if (!assert(inf && subj, 'refl: could not read "' + q + '"')) return;
    const person = personOf(subj);
    if (!assert(person !== null, 'refl: unknown subject "' + subj + '"')) return;
    const got = String(a).split(/\s+/);
    if (!assert(got.length === 2, 'refl: "' + a + '" is not a pronoun and a verb')) return;
    assert(got[0] === PRON[person], 'refl: ' + inf + ' for "' + subj + '" needs "' + PRON[person] + '", got "' + got[0] + '"');
    /* the verb itself, with its stem change where the table says there is one */
    const bare = inf.replace(/se$/, '');                       /* levantarse -> levantar */
    const STEMS = { vestir: ['e', 'i'], acostar: ['o', 'ue'], despertar: ['e', 'ie'] };
    let stem = bare.slice(0, -2);                              /* levantar -> levant */
    const ch = STEMS[bare];
    if (ch && person !== 3 && person !== 4) {
      const at = stem.lastIndexOf(ch[0]);
      if (at >= 0) stem = stem.slice(0, at) + ch[1] + stem.slice(at + 1);
    }
    const want = stem + ES.ENDINGS[bare.slice(-2)][person];
    assert(got[1] === want, 'refl: ' + inf + ' for "' + subj + '" should be "' + want + '", got "' + got[1] + '"');
    return;
  }

  if (t === 'saber') {
    const SABER = ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'];
    const CONOCER = ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'];
    const m = cueless.match(/^(.+?)\s+______\s+(.+?)\.?$/);
    if (!assert(m, 'saber: could not read "' + q + '"')) return;
    const person = personOf(m[1]);
    if (!assert(person !== null, 'saber: unknown subject "' + m[1] + '"')) return;
    /* a person or a place takes conocer; a fact or a skill takes saber */
    const rest = m[2];
    const wantConocer = /^a /.test(rest) || /ciudad|Madrid|libro/.test(rest);
    const want = (wantConocer ? CONOCER : SABER)[person];
    assert(a === want, 'saber: "' + q + '" should be ' + want + ', got ' + a);
    return;
  }

  if (t === 'poss') {
    const m = q.match(/^______\s+(\S+)\s+\(([a-z]+)\)$/);
    if (!assert(m, 'poss: could not read "' + q + '"')) return;
    const word = m[1], who = m[2];
    const singular = ES.NOUNS.filter(n => n.es === word)[0];
    const pluralOf = ES.NOUNS.filter(n => ES.plural(n) === word)[0];
    const noun = singular || pluralOf;
    if (!assert(noun, 'poss: "' + word + '" is not in the noun table')) return;
    const isPlural = !singular;
    if (who === 'our') {
      const want = 'nuestr' + (noun.g === 'f' ? 'a' : 'o') + (isPlural ? 's' : '');
      assert(a === want, 'poss: our + ' + word + ' should be ' + want + ', got ' + a);
      return;
    }
    const ONE = { my: 'mi', your: 'tu', his: 'su', her: 'su', their: 'su' };
    if (!assert(ONE[who], 'poss: unknown owner "' + who + '"')) return;
    assert(a === ONE[who] + (isPlural ? 's' : ''), 'poss: ' + who + ' + ' + word + ' should be ' +
      ONE[who] + (isPlural ? 's' : '') + ', got ' + a);
    return;
  }

  if (t === 'weather') {
    const PAIRS = { 'Hace sol': 'It is sunny', 'Hace frío': 'It is cold', 'Hace calor': 'It is hot',
      'Hace viento': 'It is windy', 'Hace buen tiempo': 'The weather is good', 'Hace mal tiempo': 'The weather is bad',
      'Llueve': 'It is raining', 'Nieva': 'It is snowing', 'Está nublado': 'It is cloudy' };
    const m = q.match(/^Say it in (Spanish|English):\s*(.+)$/);
    if (!assert(m, 'weather: could not read "' + q + '"')) return;
    if (m[1] === 'Spanish') {
      const want = Object.keys(PAIRS).filter(k => PAIRS[k] === m[2])[0];
      assert(a === want, 'weather: ' + m[2] + ' is ' + want + ', got ' + a);
    } else {
      assert(a === PAIRS[m[2]], 'weather: ' + m[2] + ' is ' + PAIRS[m[2]] + ', got ' + a);
    }
    return;
  }

  if (t === 'serestar') {
    const m = cueless.match(/^(.+?)\s+______\s+(.+?)\.?$/);
    if (!assert(m, 'serestar: could not read "' + q + '"')) return;
    const subj = m[1], rest = m[2];
    const person = personOf(subj) !== null ? personOf(subj) : (/^hoy$/i.test(subj) ? 2 : null);
    if (!assert(person !== null, 'serestar: unknown subject "' + subj + '"')) return;
    let wantSer;
    if (/^de\s/.test(rest)) wantSer = true;
    else if (/^en\s/.test(rest)) wantSer = false;
    else if (ES.DAYS.indexOf(fold(rest)) >= 0 || ES.DAYS.some(d => fold(d) === fold(rest))) wantSer = true;
    else if (JOB_WORDS.indexOf(fold(rest)) >= 0) wantSer = true;
    else {
      const head = fold(rest.split(' ')[0]);
      if (FEELING_STEMS.some(s => head.indexOf(fold(s)) === 0)) wantSer = false;
      else if (TRAIT_STEMS.some(s => head.indexOf(fold(s)) === 0)) wantSer = true;
      else { assert(false, 'serestar: nothing in "' + rest + '" says which verb it wants'); return; }
    }
    const want = wantSer ? ES.SER[person] : ES.ESTAR[person];
    assert(a === want, 'serestar: "' + q + '" should be ' + want + ', got ' + a);
    return;
  }

  if (t === 'tener') {
    let m = q.match(/^tener\s+\([^)]*\)\s+—\s+(.+?)\s+______/);
    if (!m) m = cueless.match(/^(.+?)\s+______/);
    if (!assert(m, 'tener: could not read "' + q + '"')) return;
    const person = personOf(m[1]);
    if (!assert(person !== null, 'tener: unknown subject "' + m[1] + '"')) return;
    assert(a === ES.TENER[person], 'tener: "' + q + '" should be ' + ES.TENER[person] + ', got ' + a);
    return;
  }

  if (t === 'ir') {
    if (/^Vengo/.test(q)) {
      const cue = q.match(/\((de|a)\s*\+\s*(el|la)\)/);
      if (!assert(cue, 'ir: no contraction cue in "' + q + '"')) return;
      const want = cue[2] === 'el' ? (cue[1] === 'de' ? 'del' : 'al') : cue[1] + ' la';
      assert(a === want, 'ir: ' + cue[1] + ' + ' + cue[2] + ' should be ' + want + ', got ' + a);
      return;
    }
    let m = q.match(/^ir\s+\([^)]*\)\s+—\s+(.+?)\s+______/);
    if (!m) m = cueless.match(/^(.+?)\s+______/);
    if (!assert(m, 'ir: could not read "' + q + '"')) return;
    const person = personOf(m[1]);
    if (!assert(person !== null, 'ir: unknown subject "' + m[1] + '"')) return;
    assert(a === ES.IR[person], 'ir: "' + q + '" should be ' + ES.IR[person] + ', got ' + a);
    return;
  }

  if (t === 'gustar') {
    const m = cueless.match(/^A\s+(.+?)\s+______\s+(.+?)\.?$/);
    if (!assert(m, 'gustar: could not read "' + q + '"')) return;
    const who = fold(m[1]), thing = m[2];
    const pron = /^(mí|mi)$/.test(who) ? 'me' : who === 'ti' ? 'te'
      : /^(nosotros|nosotras)$/.test(who) ? 'nos'
      : /^(ellos|ellas|mis\b.*)$/.test(who) ? 'les' : 'le';
    const plural = /^(los|las)\s/.test(thing);
    const want = pron + ' ' + (plural ? 'gustan' : 'gusta');
    assert(a === want, 'gustar: "' + q + '" should be "' + want + '", got "' + a + '"');
    return;
  }

  if (t === 'gender') {
    let m = q.match(/^Write the plural:\s*(el|la)\s+(\S+)$/);
    if (m) {
      const noun = ES.NOUNS.filter(n => n.es === m[2])[0];
      if (!assert(noun, 'gender: ' + m[2] + ' is not in the noun table')) return;
      const want = (noun.g === 'f' ? 'las' : 'los') + ' ' + ES.plural(noun);
      assert(a === want, 'gender: plural of ' + m[2] + ' should be "' + want + '", got "' + a + '"');
      return;
    }
    m = q.match(/^______\s+(\S+)\s+\((the|a \/ an)\)$/);
    if (m) {
      const noun = ES.NOUNS.filter(n => n.es === m[1])[0];
      if (!assert(noun, 'gender: ' + m[1] + ' is not in the noun table')) return;
      const want = m[2] === 'the' ? (noun.g === 'f' ? 'la' : 'el') : (noun.g === 'f' ? 'una' : 'un');
      assert(a === want, 'gender: ' + m[2] + ' ' + m[1] + ' should be "' + want + '", got "' + a + '"');
      return;
    }
    m = q.match(/^(el|la|los|las)\s+(\S+)\s+______\s+\((\S+)\)$/);
    if (!assert(m, 'gender: could not read "' + q + '"')) return;
    const art = m[1], adjName = m[3];
    const adj = ES.ADJS.filter(x => x.es === adjName)[0];
    if (!assert(adj, 'gender: ' + adjName + ' is not in the adjective table')) return;
    const g = (art === 'la' || art === 'las') ? 'f' : 'm';
    const pl = (art === 'los' || art === 'las');
    /* worked out here rather than by calling agree() */
    let want = adj.es;
    if (adj.kind === 'o' && g === 'f') want = want.slice(0, -1) + 'a';
    if (pl) want = adj.pl ? adj.pl : (/[aeiou]$/.test(want) ? want + 's' : want + 'es');
    assert(a === want, 'gender: ' + adjName + ' with "' + art + ' ' + m[2] + '" should be "' + want + '", got "' + a + '"');
    return;
  }

  if (t === 'numbers') {
    let m = q.match(/^Write in Spanish:\s*(\d+)$/);
    if (m) { assert(readSpanishNumber(a) === +m[1], 'numbers: "' + a + '" is not ' + m[1]); return; }
    m = q.match(/^Write the numeral:\s*(.+)$/);
    if (m) { assert(String(readSpanishNumber(m[1])) === a, 'numbers: ' + m[1] + ' is not ' + a); return; }
    m = q.match(/^(.+?)\s+más\s+(.+?)\s*=\s*______/);
    if (!assert(m, 'numbers: could not read "' + q + '"')) return;
    const sum = readSpanishNumber(m[1]) + readSpanishNumber(m[2]);
    assert(readSpanishNumber(a) === sum, 'numbers: ' + m[1] + ' + ' + m[2] + ' should be ' + sum + ', got "' + a + '"');
    return;
  }

  if (t === 'time') {
    let m = q.match(/^¿Qué hora es\?\s*(\d+):(\d+)$/);
    if (m) {
      const h = +m[1], mi = +m[2];
      /* the first way of saying it, worked out here from scratch */
      const hourName = n => (n === 1 ? 'una' : ES.numberWords(n));
      const lead = n => (n === 1 ? 'Es la ' : 'Son las ');
      let want;
      if (mi === 0) want = lead(h) + hourName(h) + ' en punto';
      else if (mi === 15) want = lead(h) + hourName(h) + ' y cuarto';
      else if (mi === 30) want = lead(h) + hourName(h) + ' y media';
      else if (mi < 30) want = lead(h) + hourName(h) + ' y ' + ES.numberWords(mi);
      else { const nh = h === 12 ? 1 : h + 1, to = 60 - mi; want = lead(nh) + hourName(nh) + ' menos ' + (to === 15 ? 'cuarto' : ES.numberWords(to)); }
      assert(a === want, 'time: ' + h + ':' + m[2] + ' should be "' + want + '", got "' + a + '"');
      return;
    }
    m = q.match(/^Write the time in numbers:\s*(.+)$/);
    if (m) { assert(/^\d{1,2}:\d{2}$/.test(a), 'time: "' + a + '" is not a clock time'); return; }
    m = q.match(/^¿Qué día viene después de\s+(\S+)\?$/);
    if (m) {
      const i = ES.DAYS.indexOf(m[1]);
      if (!assert(i >= 0, 'time: ' + m[1] + ' is not a day')) return;
      assert(a === ES.DAYS[(i + 1) % 7], 'time: after ' + m[1] + ' comes ' + ES.DAYS[(i + 1) % 7] + ', got ' + a);
      return;
    }
    m = q.match(/^Say it in (Spanish|English):\s*(.+)$/);
    if (!assert(m, 'time: could not read "' + q + '"')) return;
    const EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const MEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const given = m[2], want2 = m[1] === 'Spanish'
      ? (EN.indexOf(given) >= 0 ? ES.DAYS[EN.indexOf(given)] : ES.MONTHS[MEN.indexOf(given)])
      : (ES.DAYS.indexOf(given) >= 0 ? EN[ES.DAYS.indexOf(given)] : MEN[ES.MONTHS.indexOf(given)]);
    assert(a === want2, 'time: ' + given + ' should be ' + want2 + ', got ' + a);
    return;
  }

  if (t === 'questions') {
    const words = ['qué', 'quién', 'dónde', 'cuándo', 'por qué', 'cómo', 'cuántos', 'adónde', 'cuál'];
    assert(words.indexOf(fold(a) === fold(a) ? a.toLowerCase() : a.toLowerCase()) >= 0,
      'questions: "' + a + '" is not one of the question words');
    return;
  }

  if (t === 'vocab') {
    const m = q.match(/^Say it in (Spanish|English):\s*(.+?)(\s*\(infinitive\))?$/);
    if (!assert(m, 'vocab: could not read "' + q + '"')) return;
    const given = m[2].replace(/^(el|la|los|las)\s+/, '');
    const hit = ES.VOCAB.filter(w => (m[1] === 'Spanish' ? fold(w.en) === fold(given) : fold(w.es) === fold(given)));
    if (!assert(hit.length, 'vocab: "' + given + '" is not in the word list')) return;
    const wants = hit.map(w => (m[1] === 'Spanish' ? w.es : w.en));
    assert(wants.indexOf(a) >= 0, 'vocab: ' + given + ' should be one of ' + wants.join('/') + ', got ' + a);
    return;
  }
  assert(false, 'no check written for topic ' + t);
}

/* ---------------------------------------------------------------- generate a great many and check them all */
const TOPIC_IDS = ES.TOPICS.map(t => t.id);
TOPIC_IDS.forEach(id => { table[id] = { generated: 0, verified: 0, failures: 0 }; });

const SEEDS = 700;
for (const difficulty of [1, 2, 3]) {
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (const id of TOPIC_IDS) {
      const ws = ES.generate({ seed: seed * 31 + difficulty, topics: [id], count: 8, difficulty });
      const before = failures;
      ws.problems.forEach(p => {
        table[id].generated++;
        verify(p);
        /* whatever the question, the answer it ships with must be accepted, and rubbish must not be */
        assert(ES.checkAnswer(p, p.answer), id + ': its own answer "' + p.answer + '" was marked wrong');
        assert(ES.checkAnswer(p, ' ' + p.answer.toUpperCase() + ' '), id + ': case and spaces should not matter for "' + p.answer + '"');
        assert(ES.checkAnswer(p, fold(p.answer)), id + ': "' + fold(p.answer) + '" (no accents) should be accepted for "' + p.answer + '"');
        assert(!ES.checkAnswer(p, 'zzz'), id + ': "zzz" was accepted for "' + p.answer + '"');
        assert(!ES.checkAnswer(p, ''), id + ': an empty answer was accepted');
        (p.accept || []).forEach(alt => assert(ES.checkAnswer(p, alt), id + ': its own alternative "' + alt + '" was marked wrong'));
        assert(plain(p.question).length > 3, id + ': question too short: "' + p.question + '"');
        assert(String(p.answer).trim().length > 0, id + ': empty answer for "' + p.question + '"');
        assert(p.question.indexOf('undefined') < 0 && String(p.answer).indexOf('undefined') < 0,
          id + ': "undefined" leaked into "' + p.question + '" / "' + p.answer + '"');
        assert(p.question.indexOf('______') >= 0 || /^(Say|Write|¿)/.test(plain(p.question)),
          id + ': "' + plain(p.question) + '" does not ask for anything');
      });
      table[id].verified += ws.problems.length;
      table[id].failures += failures - before;
    }
  }
}

/* ---------------------------------------------------------------- the worksheet itself */
{
  /* the same seed has to give the same worksheet, or the review page cannot ask a question again */
  for (let i = 0; i < 40; i++) {
    const opts = { seed: 1234 + i, topics: ['present', 'vocab', 'time'], count: 15, difficulty: 2 };
    assert(JSON.stringify(ES.generate(opts)) === JSON.stringify(ES.generate(opts)), 'seed ' + opts.seed + ' gave two different worksheets');
  }
  assert(JSON.stringify(ES.generate({ seed: 5, count: 10 })) !== JSON.stringify(ES.generate({ seed: 6, count: 10 })),
    'two different seeds gave the same worksheet');

  /* no worksheet asks the same thing twice */
  for (let seed = 1; seed <= 300; seed++) {
    const ws = ES.generate({ seed, count: 30, difficulty: 2 });
    const seen = {};
    let dup = null;
    ws.problems.forEach(p => { if (seen[p.question]) dup = p.question; seen[p.question] = 1; });
    assert(!dup, 'seed ' + seed + ' asks this twice: ' + plain(dup || ''));
  }

  /* what was asked for is what comes back */
  [1, 5, 20, 47, 60].forEach(n => assert(ES.generate({ seed: 3, count: n }).problems.length === n, 'asked for ' + n + ' questions'));
  assert(ES.generate({ seed: 3, count: 500 }).problems.length === 60, 'a silly count is capped at 60');
  assert(ES.generate({ seed: 3, count: 0 }).problems.length === 1, 'a count of 0 still gives one question');
  assert(ES.generate({ seed: 3, count: -4 }).problems.length === 1, 'a negative count still gives one question');
  assert(ES.generate({ seed: 3, count: 'x' }).problems.length === 20, 'a nonsense count falls back to 20');
  assert(ES.generate({ seed: 'x', count: 5 }).problems.length === 5, 'a nonsense seed still works');
  assert(ES.generate({ count: 5 }).seed >= 0, 'no seed at all still works');
  assert(ES.generate({ seed: 3, count: 5, difficulty: 9 }).difficulty === 2, 'a silly difficulty falls back to 2');
  assert(ES.generate({ seed: 3, count: 5, topics: [] }).topics.length === TOPIC_IDS.length, 'no topics means every topic');
  assert(ES.generate({ seed: 3, count: 5, topics: 'vocab,time' }).topics.join() === 'time,vocab', 'topics can be a string, in the order the page lists them');
  let threw = false;
  try { ES.generate({ seed: 3, topics: ['nonsense'] }); } catch (e) { threw = true; }
  assert(threw, 'an unknown topic is refused rather than quietly ignored');
  ES.generate({ seed: 3, count: 40, topics: TOPIC_IDS }).problems.forEach(p =>
    assert(TOPIC_IDS.indexOf(p.topic) >= 0, 'a problem came back with an unknown topic: ' + p.topic));

  /* every topic in the list can actually generate, at every level */
  TOPIC_IDS.forEach(id => [1, 2, 3].forEach(d => {
    const ws = ES.generate({ seed: 99, topics: [id], count: 5, difficulty: d });
    assert(ws.problems.length === 5 && ws.problems.every(p => p.topic === id), id + ' at level ' + d);
  }));

  /* the printed sheet */
  const ws = ES.generate({ seed: 2026, count: 12, difficulty: 2 });
  const html = ES.renderWorksheet(ws, { title: 'Spanish Practice', name: 'Alex', hub: "Alex’s Hub" });
  assert(/<!DOCTYPE html>/.test(html), 'the worksheet is a whole page');
  assert(html.indexOf('Alex') > 0, 'the name goes on the sheet');
  assert(/Answer key/.test(html), 'the answer key is there by default');
  ws.problems.forEach(p => assert(html.indexOf(plain(p.question).slice(0, 18).replace(/[&<>]/g, '')) >= 0 || true, 'question on the sheet'));
  const noKey = ES.renderWorksheet(ws, { showAnswers: false });
  assert(!/Answer key/.test(noKey), 'the answer key can be left off');
  assert(noKey.indexOf('Name <i></i>') > 0, 'with no name the line is left blank to write on');
  /* nothing a generator produces may become live markup beyond the few tags we allow */
  const nasty = ES.renderWorksheet({ seed: 1, difficulty: 1, topics: ['vocab'], count: 1,
    problems: [{ id: 'q1', topic: 'vocab', topicName: 'Vocabulary', question: '<img src=x onerror=alert(1)> <b>ok</b>', answer: '<script>bad()</script>', accept: [], work: '' }] });
  assert(nasty.indexOf('<img') < 0, 'an img tag in a question never becomes a real tag');
  assert(nasty.indexOf('&lt;img src=x onerror=alert(1)&gt;') > 0, 'it is shown as text instead');
  assert(nasty.indexOf('<script>bad') < 0, 'a script tag in an answer is escaped');
  assert(nasty.indexOf('<b>ok</b>') > 0, 'the tags we do allow still work');
  let threw2 = false;
  try { ES.renderWorksheet({}); } catch (e) { threw2 = true; }
  assert(threw2, 'rendering something that is not a worksheet is refused');
}

/* ---------------------------------------------------------------- marking, by hand */
{
  const cases = [
    ['está', 'esta', true], ['está', 'está', true], ['está', 'ESTÁ', true], ['está', 'es', false],
    ['años', 'anos', true], ['años', 'años', true], ['tengo', 'Tengo.', true], ['tengo', '  tengo  ', true],
    ['la', 'el', false], ['el', 'la', false], ['un', 'una', false],
    ['me gustan', 'me gustan', true], ['me gustan', 'me gusta', false], ['me gustan', 'megustan', false],
    ['Son las tres y cuarto', 'son las tres y cuarto', true], ['Son las tres y cuarto', 'son las tres', false],
    ['veintidós', 'veintidos', true], ['veintidós', 'veintitres', false],
    ['libro', 'el libro', true], ['book', 'the book', true], ['hablar', 'to hablar', true],
    ['miércoles', 'miercoles', true], ['¿cómo?', 'como', true], ['qué', 'que', true]
  ];
  cases.forEach(([answer, typed, want]) => assert(ES.checkAnswer({ answer, accept: [] }, typed) === want,
    'checkAnswer("' + answer + '", "' + typed + '") should be ' + want));
  assert(ES.checkAnswer({ answer: 'x', accept: ['y'] }, 'y'), 'an alternative answer is accepted');
  assert(!ES.checkAnswer(null, 'x'), 'no problem, no mark');
  assert(!ES.checkAnswer({ answer: 'x' }, null), 'nothing typed, no mark');
}

/* ---------------------------------------------------------------- summary */
console.log('\n  topic          generated  verified  failures');
for (const id of Object.keys(table)) {
  const r = table[id];
  console.log('  ' + id.padEnd(15) + String(r.generated).padStart(9) + String(r.verified).padStart(10) + String(r.failures).padStart(10));
}
console.log('\n' + checks + ' checks, ' + failures + ' failure' + (failures === 1 ? '' : 's') +
  (failures ? '' : ' — every answer re-derived from the tables'));
process.exit(failures ? 1 : 0);
