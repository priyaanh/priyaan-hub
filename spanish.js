/* spanish.js — Spanish 1 practice generators for the Practice Hub.
   Works in the browser (window.ES) and in Node (require('./spanish.js')). No dependencies, no modules.
   API: ES.TOPICS, ES.generate(opts), ES.checkAnswer(problem, typed), ES.renderWorksheet(ws, opts).

   Every question is rebuilt from its seed, never stored: a worksheet is {seed, topics, difficulty, count},
   so the review page can ask the same question again from four numbers. That is also why nothing here may
   use Math.random outside generate() -- the same seed has to give the same worksheet for ever. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ES = factory();
})(this, function () {
  'use strict';

  /* ---------------------------------------------------------------- random (mulberry32, same as PH.rng) */
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function rint(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function shuffle(r, arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function chance(r, p) { return r() < p; }

  /* ---------------------------------------------------------------- text helpers */
  var BLANK = '______';
  /* Accents are stripped only when comparing answers, never when showing them: the key always prints
     "está" even though a student who types "esta" on a keyboard without accents is marked right. */
  var FOLD = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' };
  function fold(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[áéíóúüñ]/g, function (c) { return FOLD[c]; });
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function P(q, a, accept, work) { return { question: q, answer: a, accept: accept || [], work: work || '' }; }
  function uniq(list) { var seen = {}, out = []; for (var i = 0; i < list.length; i++) { var k = fold(list[i]); if (list[i] && !seen[k]) { seen[k] = 1; out.push(list[i]); } } return out; }

  /* ---------------------------------------------------------------- topics */
  var TOPICS = [
    { id: 'present',   name: 'Present tense: regular verbs', unit: 'Verbs',    description: 'Conjugate -ar, -er and -ir verbs for every subject pronoun.' },
    { id: 'serestar',  name: 'Ser vs estar',                 unit: 'Verbs',    description: 'Which "to be" the sentence needs, and the form that goes with its subject.' },
    { id: 'stem',      name: 'Stem-changing verbs',          unit: 'Verbs',    description: 'e→ie, o→ue and e→i verbs, which keep their plain stem for nosotros.' },
    { id: 'tener',     name: 'Tener and tener expressions',  unit: 'Verbs',    description: 'Forms of tener, tener que, and the ones English says with "to be": hambre, sed, frío, años.' },
    { id: 'ir',        name: 'Ir, ir + a, al and del',       unit: 'Verbs',    description: 'Forms of ir, saying what you are going to do, and the contractions a + el and de + el.' },
    { id: 'gustar',    name: 'Gustar',                       unit: 'Verbs',    description: 'me/te/le/nos/les with gusta or gustan, chosen by what is liked rather than who likes it.' },
    { id: 'gender',    name: 'Articles and agreement',       unit: 'Grammar',  description: 'el/la/los/las, un/una/unos/unas, and adjectives that match their noun.' },
    { id: 'questions', name: 'Question words',               unit: 'Grammar',  description: 'qué, quién, dónde, cuándo, por qué, cómo, cuánto and adónde.' },
    { id: 'numbers',   name: 'Numbers',                      unit: 'Basics',   description: 'Numbers to a thousand, written out and read back.' },
    { id: 'time',      name: 'Telling time, days and months', unit: 'Basics',  description: '¿Qué hora es?, the days of the week and the months of the year.' },
    { id: 'vocab',     name: 'Vocabulary',                   unit: 'Basics',   description: 'Everyday words both ways: family, food, colours, school, animals, clothes and places.' }
  ];
  var TOPIC_BY_ID = {};
  TOPICS.forEach(function (t) { TOPIC_BY_ID[t.id] = t; });

  /* ---------------------------------------------------------------- subjects */
  /* person: 0=yo 1=tú 2=él/ella/usted 3=nosotros 4=vosotros 5=ellos/ellas/ustedes.
     Vosotros is only asked at level 3: a US classroom meets it late, if at all. */
  var SUBJECTS = [
    { text: 'yo', p: 0, lvl: 1 },
    { text: 'tú', p: 1, lvl: 1 },
    { text: 'él', p: 2, lvl: 1 },
    { text: 'ella', p: 2, lvl: 1 },
    { text: 'usted', p: 2, lvl: 2 },
    { text: 'nosotros', p: 3, lvl: 1 },
    { text: 'nosotras', p: 3, lvl: 2 },
    { text: 'vosotros', p: 4, lvl: 3 },
    { text: 'ellos', p: 5, lvl: 1 },
    { text: 'ellas', p: 5, lvl: 2 },
    { text: 'ustedes', p: 5, lvl: 2 }
  ];
  function subjectsFor(lvl) { return SUBJECTS.filter(function (s) { return s.lvl <= lvl; }); }

  /* ---------------------------------------------------------------- verbs */
  var REGULAR = [
    { inf: 'hablar', en: 'to speak' }, { inf: 'estudiar', en: 'to study' }, { inf: 'cantar', en: 'to sing' },
    { inf: 'bailar', en: 'to dance' }, { inf: 'caminar', en: 'to walk' }, { inf: 'trabajar', en: 'to work' },
    { inf: 'escuchar', en: 'to listen to' }, { inf: 'mirar', en: 'to watch' }, { inf: 'nadar', en: 'to swim' },
    { inf: 'cocinar', en: 'to cook' }, { inf: 'dibujar', en: 'to draw' }, { inf: 'llevar', en: 'to wear' },
    { inf: 'necesitar', en: 'to need' }, { inf: 'comprar', en: 'to buy' }, { inf: 'usar', en: 'to use' },
    { inf: 'viajar', en: 'to travel' }, { inf: 'ayudar', en: 'to help' }, { inf: 'limpiar', en: 'to clean' },
    { inf: 'tomar', en: 'to take' }, { inf: 'enseñar', en: 'to teach' },
    { inf: 'comer', en: 'to eat' }, { inf: 'beber', en: 'to drink' }, { inf: 'aprender', en: 'to learn' },
    { inf: 'correr', en: 'to run' }, { inf: 'vender', en: 'to sell' }, { inf: 'comprender', en: 'to understand' },
    { inf: 'responder', en: 'to answer' }, { inf: 'romper', en: 'to break' },
    { inf: 'vivir', en: 'to live' }, { inf: 'escribir', en: 'to write' }, { inf: 'abrir', en: 'to open' },
    { inf: 'recibir', en: 'to receive' }, { inf: 'compartir', en: 'to share' }, { inf: 'subir', en: 'to go up' },
    { inf: 'decidir', en: 'to decide' }, { inf: 'asistir', en: 'to attend' }
  ];
  var ENDINGS = {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en']
  };
  function conjRegular(inf, person) {
    var kind = inf.slice(-2), stem = inf.slice(0, -2);
    if (!ENDINGS[kind]) throw new Error('not a regular verb: ' + inf);
    return stem + ENDINGS[kind][person];
  }

  /* Stem changers. The change happens in every form except nosotros and vosotros -- the "boot". */
  var STEM = [
    { inf: 'querer', en: 'to want', from: 'e', to: 'ie' }, { inf: 'pensar', en: 'to think', from: 'e', to: 'ie' },
    { inf: 'empezar', en: 'to begin', from: 'e', to: 'ie' }, { inf: 'cerrar', en: 'to close', from: 'e', to: 'ie' },
    { inf: 'entender', en: 'to understand', from: 'e', to: 'ie' }, { inf: 'perder', en: 'to lose', from: 'e', to: 'ie' },
    { inf: 'preferir', en: 'to prefer', from: 'e', to: 'ie' }, { inf: 'comenzar', en: 'to start', from: 'e', to: 'ie' },
    { inf: 'poder', en: 'to be able to', from: 'o', to: 'ue' }, { inf: 'dormir', en: 'to sleep', from: 'o', to: 'ue' },
    { inf: 'volver', en: 'to return', from: 'o', to: 'ue' }, { inf: 'almorzar', en: 'to eat lunch', from: 'o', to: 'ue' },
    { inf: 'costar', en: 'to cost', from: 'o', to: 'ue' }, { inf: 'encontrar', en: 'to find', from: 'o', to: 'ue' },
    { inf: 'recordar', en: 'to remember', from: 'o', to: 'ue' }, { inf: 'contar', en: 'to count', from: 'o', to: 'ue' },
    { inf: 'pedir', en: 'to ask for', from: 'e', to: 'i' }, { inf: 'servir', en: 'to serve', from: 'e', to: 'i' },
    { inf: 'repetir', en: 'to repeat', from: 'e', to: 'i' }, { inf: 'competir', en: 'to compete', from: 'e', to: 'i' },
    { inf: 'jugar', en: 'to play', from: 'u', to: 'ue' }
  ];
  function conjStem(v, person) {
    var kind = v.inf.slice(-2), stem = v.inf.slice(0, -2);
    if (person !== 3 && person !== 4) {
      /* change the LAST vowel of the stem, which is the one that carries the stress */
      var at = stem.lastIndexOf(v.from);
      if (at < 0) throw new Error('no ' + v.from + ' in the stem of ' + v.inf);
      stem = stem.slice(0, at) + v.to + stem.slice(at + 1);
    }
    return stem + ENDINGS[kind][person];
  }

  /* Irregulars written out: they are the point of the exercise, so nothing here is computed. */
  var SER   = ['soy', 'eres', 'es', 'somos', 'sois', 'son'];
  var ESTAR = ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'];
  var TENER = ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'];
  var IR    = ['voy', 'vas', 'va', 'vamos', 'vais', 'van'];

  /* ---------------------------------------------------------------- nouns, adjectives, vocabulary */
  /* g: 'm' or 'f'. pl: only where the plural is not just +s / +es. */
  var NOUNS = [
    { es: 'libro', en: 'book', g: 'm', set: 'school' }, { es: 'cuaderno', en: 'notebook', g: 'm', set: 'school' },
    { es: 'lápiz', en: 'pencil', g: 'm', pl: 'lápices', set: 'school' }, { es: 'bolígrafo', en: 'pen', g: 'm', set: 'school' },
    { es: 'papel', en: 'paper', g: 'm', set: 'school' }, { es: 'mochila', en: 'backpack', g: 'f', set: 'school' },
    { es: 'escritorio', en: 'desk', g: 'm', set: 'school' }, { es: 'silla', en: 'chair', g: 'f', set: 'school' },
    { es: 'mesa', en: 'table', g: 'f', set: 'house' }, { es: 'ventana', en: 'window', g: 'f', set: 'house' },
    { es: 'puerta', en: 'door', g: 'f', set: 'house' }, { es: 'casa', en: 'house', g: 'f', set: 'house' },
    { es: 'cocina', en: 'kitchen', g: 'f', set: 'house' }, { es: 'jardín', en: 'garden', g: 'm', pl: 'jardines', set: 'house' },
    { es: 'reloj', en: 'clock', g: 'm', pl: 'relojes', set: 'house' }, { es: 'plato', en: 'plate', g: 'm', set: 'house' },
    { es: 'vaso', en: 'glass', g: 'm', set: 'house' }, { es: 'teléfono', en: 'telephone', g: 'm', set: 'house' },
    { es: 'perro', en: 'dog', g: 'm', set: 'animals' }, { es: 'gato', en: 'cat', g: 'm', set: 'animals' },
    { es: 'pájaro', en: 'bird', g: 'm', set: 'animals' }, { es: 'caballo', en: 'horse', g: 'm', set: 'animals' },
    { es: 'vaca', en: 'cow', g: 'f', set: 'animals' }, { es: 'pez', en: 'fish', g: 'm', pl: 'peces', set: 'animals' },
    { es: 'manzana', en: 'apple', g: 'f', set: 'food' }, { es: 'naranja', en: 'orange', g: 'f', set: 'food' },
    { es: 'pan', en: 'bread', g: 'm', mass: 1, set: 'food' }, { es: 'queso', en: 'cheese', g: 'm', mass: 1, set: 'food' },
    { es: 'leche', en: 'milk', g: 'f', mass: 1, set: 'food' }, { es: 'huevo', en: 'egg', g: 'm', set: 'food' },
    { es: 'pollo', en: 'chicken', g: 'm', set: 'food' }, { es: 'arroz', en: 'rice', g: 'm', pl: 'arroces', mass: 1, set: 'food' },
    { es: 'camisa', en: 'shirt', g: 'f', set: 'clothes' }, { es: 'falda', en: 'skirt', g: 'f', set: 'clothes' },
    { es: 'zapato', en: 'shoe', g: 'm', set: 'clothes' }, { es: 'sombrero', en: 'hat', g: 'm', set: 'clothes' },
    { es: 'chaqueta', en: 'jacket', g: 'f', set: 'clothes' }, { es: 'vestido', en: 'dress', g: 'm', set: 'clothes' },
    { es: 'escuela', en: 'school', g: 'f', set: 'places' }, { es: 'biblioteca', en: 'library', g: 'f', set: 'places' },
    { es: 'tienda', en: 'store', g: 'f', set: 'places' }, { es: 'parque', en: 'park', g: 'm', set: 'places' },
    { es: 'playa', en: 'beach', g: 'f', set: 'places' }, { es: 'museo', en: 'museum', g: 'm', set: 'places' },
    { es: 'ciudad', en: 'city', g: 'f', pl: 'ciudades', set: 'places' }, { es: 'hospital', en: 'hospital', g: 'm', pl: 'hospitales', set: 'places' },
    { es: 'hermano', en: 'brother', g: 'm', set: 'family' }, { es: 'hermana', en: 'sister', g: 'f', set: 'family' },
    { es: 'madre', en: 'mother', g: 'f', set: 'family' }, { es: 'padre', en: 'father', g: 'm', set: 'family' },
    { es: 'abuela', en: 'grandmother', g: 'f', set: 'family' }, { es: 'abuelo', en: 'grandfather', g: 'm', set: 'family' },
    { es: 'primo', en: 'cousin', g: 'm', set: 'family' }, { es: 'hija', en: 'daughter', g: 'f', set: 'family' },
    { es: 'amigo', en: 'friend', g: 'm', set: 'people' }, { es: 'maestra', en: 'teacher', g: 'f', set: 'people' },
    { es: 'estudiante', en: 'student', g: 'm', set: 'people' }, { es: 'chica', en: 'girl', g: 'f', set: 'people' },
    { es: 'chico', en: 'boy', g: 'm', set: 'people' }, { es: 'mujer', en: 'woman', g: 'f', pl: 'mujeres', set: 'people' },
    /* the ones that catch everybody out: an -a that is masculine, an -o that is feminine */
    { es: 'mapa', en: 'map', g: 'm', tricky: 1, set: 'school' }, { es: 'día', en: 'day', g: 'm', tricky: 1, set: 'time' },
    { es: 'problema', en: 'problem', g: 'm', tricky: 1, set: 'school' }, { es: 'programa', en: 'program', g: 'm', tricky: 1, set: 'school' },
    { es: 'mano', en: 'hand', g: 'f', tricky: 1, set: 'body' }, { es: 'foto', en: 'photo', g: 'f', tricky: 1, set: 'house' }
  ];
  function plural(n) {
    if (n.pl) return n.pl;
    return /[aeiou]$/.test(n.es) ? n.es + 's' : n.es + 'es';
  }
  /* Adjectives. kind 'o' changes for gender; kind 'e' and 'c' (consonant) do not. */
  var ADJS = [
    { es: 'blanco', en: 'white', kind: 'o' }, { es: 'negro', en: 'black', kind: 'o' }, { es: 'rojo', en: 'red', kind: 'o' },
    { es: 'amarillo', en: 'yellow', kind: 'o' }, { es: 'pequeño', en: 'small', kind: 'o' }, { es: 'alto', en: 'tall', kind: 'o' },
    { es: 'bajo', en: 'short', kind: 'o' }, { es: 'bonito', en: 'pretty', kind: 'o' }, { es: 'nuevo', en: 'new', kind: 'o' },
    { es: 'viejo', en: 'old', kind: 'o' }, { es: 'largo', en: 'long', kind: 'o' }, { es: 'corto', en: 'short', kind: 'o' },
    { es: 'simpático', en: 'nice', kind: 'o' }, { es: 'divertido', en: 'fun', kind: 'o' }, { es: 'tranquilo', en: 'calm', kind: 'o' },
    { es: 'cansado', en: 'tired', kind: 'o' }, { es: 'contento', en: 'happy', kind: 'o' }, { es: 'enfermo', en: 'sick', kind: 'o' },
    { es: 'delgado', en: 'thin', kind: 'o' }, { es: 'moreno', en: 'dark-haired', kind: 'o' },
    { es: 'grande', en: 'big', kind: 'e' }, { es: 'verde', en: 'green', kind: 'e' }, { es: 'inteligente', en: 'intelligent', kind: 'e' },
    { es: 'interesante', en: 'interesting', kind: 'e' }, { es: 'alegre', en: 'cheerful', kind: 'e' }, { es: 'fuerte', en: 'strong', kind: 'e' },
    { es: 'azul', en: 'blue', kind: 'c', pl: 'azules' }, { es: 'gris', en: 'grey', kind: 'c', pl: 'grises' },
    { es: 'popular', en: 'popular', kind: 'c', pl: 'populares' }, { es: 'fácil', en: 'easy', kind: 'c', pl: 'fáciles' },
    { es: 'difícil', en: 'difficult', kind: 'c', pl: 'difíciles' }, { es: 'feliz', en: 'happy', kind: 'c', pl: 'felices' },
    { es: 'joven', en: 'young', kind: 'c', pl: 'jóvenes' }
  ];
  var ADJ_THING = ['blanco', 'negro', 'rojo', 'amarillo', 'verde', 'azul', 'gris', 'pequeño', 'grande',
    'nuevo', 'viejo', 'bonito', 'interesante'];
  var ADJ_PERSON = ['alto', 'bajo', 'simpático', 'inteligente', 'joven', 'moreno', 'delgado', 'fuerte',
    'divertido', 'tranquilo', 'alegre', 'popular', 'contento', 'cansado', 'enfermo', 'feliz', 'bonito'];

  /** The adjective as it must be written next to this noun. */
  function agree(adj, g, pl) {
    var s = adj.es;
    if (adj.kind === 'o') s = g === 'f' ? s.slice(0, -1) + 'a' : s;
    if (!pl) return s;
    if (adj.pl) return adj.pl;                                  /* felices, jóvenes, fáciles */
    return /[aeiou]$/.test(s) ? s + 's' : s + 'es';
  }
  function defArt(g, pl) { return pl ? (g === 'f' ? 'las' : 'los') : (g === 'f' ? 'la' : 'el'); }
  function indefArt(g, pl) { return pl ? (g === 'f' ? 'unas' : 'unos') : (g === 'f' ? 'una' : 'un'); }

  /* ---------------------------------------------------------------- numbers */
  var ONES = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
    'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  var TENS = { 30: 'treinta', 40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa' };
  var HUNDREDS = { 100: 'cien', 200: 'doscientos', 300: 'trescientos', 400: 'cuatrocientos', 500: 'quinientos',
    600: 'seiscientos', 700: 'setecientos', 800: 'ochocientos', 900: 'novecientos', 1000: 'mil' };
  function numberWords(n) {
    if (n < 30) return ONES[n];
    if (n < 100) { var t = Math.floor(n / 10) * 10, u = n % 10; return TENS[t] + (u ? ' y ' + ONES[u] : ''); }
    if (n === 100) return 'cien';
    if (n < 1000) {
      var h = Math.floor(n / 100) * 100, rest = n % 100;
      var head = h === 100 ? 'ciento' : HUNDREDS[h];
      return head + (rest ? ' ' + numberWords(rest) : '');
    }
    if (n === 1000) return 'mil';
    return String(n);
  }

  /* ---------------------------------------------------------------- days, months, time */
  var DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  var DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function hourName(h) { return h === 1 ? 'una' : ONES[h]; }
  /** "Son las tres y cuarto" and the other ways of saying 3:15, most usual one first. */
  function timeWords(h12, min) {
    var lead = h12 === 1 ? 'Es la ' : 'Son las ';
    /* the hour is feminine -- la hora -- so one o'clock is "la una", never "la uno" */
    var hourWord = hourName(h12);
    var outs = [];
    if (min === 0) outs.push(lead + hourWord + ' en punto', lead + hourWord);
    else if (min === 15) outs.push(lead + hourWord + ' y cuarto', lead + hourWord + ' y quince');
    else if (min === 30) outs.push(lead + hourWord + ' y media', lead + hourWord + ' y treinta');
    else if (min < 30) outs.push(lead + hourWord + ' y ' + numberWords(min));
    else {
      var nextH = h12 === 12 ? 1 : h12 + 1, to = 60 - min;
      var nlead = nextH === 1 ? 'Es la ' : 'Son las ';
      outs.push(nlead + hourName(nextH) + ' menos ' + (to === 15 ? 'cuarto' : numberWords(to)));
      outs.push(lead + hourWord + ' y ' + numberWords(min));
      if (to === 15) outs.push(nlead + hourName(nextH) + ' menos quince');
    }
    return uniq(outs);
  }

  /* ---------------------------------------------------------------- shared word lists */
  var PLACES_ES = ['México', 'España', 'Colombia', 'Perú', 'Chile', 'Argentina', 'Guatemala', 'Costa Rica', 'Puerto Rico', 'Ecuador', 'Cuba', 'Bolivia'];
  var WHERE = ['la mesa', 'la cocina', 'la escuela', 'el parque', 'la biblioteca', 'el jardín', 'la playa', 'el museo', 'la tienda', 'el hospital'];
  /* estar only: how someone happens to be today */
  var FEELINGS = [
    { es: 'cansado', kind: 'o' }, { es: 'contento', kind: 'o' }, { es: 'enfermo', kind: 'o' },
    { es: 'nervioso', kind: 'o' }, { es: 'ocupado', kind: 'o' }, { es: 'enojado', kind: 'o' },
    { es: 'preocupado', kind: 'o' }, { es: 'triste', kind: 'e' }
  ];
  /* ser only: what someone is like */
  var TRAITS = [
    { es: 'inteligente', kind: 'e' }, { es: 'alto', kind: 'o' }, { es: 'simpático', kind: 'o' },
    { es: 'joven', kind: 'c', pl: 'jóvenes' }, { es: 'rubio', kind: 'o' }, { es: 'moreno', kind: 'o' },
    { es: 'gracioso', kind: 'o' }, { es: 'serio', kind: 'o' }, { es: 'paciente', kind: 'e' }
  ];
  var JOBS = [
    { es: 'maestro', g: 'm' }, { es: 'maestra', g: 'f' }, { es: 'doctor', g: 'm' }, { es: 'doctora', g: 'f' },
    { es: 'estudiante', g: 'm' }, { es: 'ingeniero', g: 'm' }, { es: 'enfermera', g: 'f' }, { es: 'cocinero', g: 'm' }
  ];
  /* Subject wording per person, for sentences that need one. Gender is fixed here so the adjective
     printed beside it agrees: the blank is the verb, never the adjective. */
  var PERSON_SUBJ = [
    { text: 'Yo', p: 0, g: 'm', pl: false },
    { text: 'Tú', p: 1, g: 'm', pl: false },
    { text: 'Mi hermana', p: 2, g: 'f', pl: false },
    { text: 'Mi amigo Carlos', p: 2, g: 'm', pl: false },
    { text: 'Ella', p: 2, g: 'f', pl: false },
    { text: 'Él', p: 2, g: 'm', pl: false },
    { text: 'Nosotros', p: 3, g: 'm', pl: true },
    { text: 'Mis primos', p: 5, g: 'm', pl: true },
    { text: 'Las chicas', p: 5, g: 'f', pl: true },
    { text: 'Ellos', p: 5, g: 'm', pl: true },
    { text: 'Ustedes', p: 5, g: 'm', pl: true }
  ];
  /* "I am hungry", "we are hungry": the English cue has to agree with the subject it is glossing. */
  function beEn(sub) {
    return sub.p === 0 ? 'I am' : sub.p === 1 ? 'you are' : sub.p === 3 ? 'we are'
      : sub.p === 5 ? (sub.text === 'Ustedes' ? 'you all are' : 'they are') : 'he/she is';
  }
  function subjFor(r, d) {
    var pool = PERSON_SUBJ.filter(function (s) { return d >= 2 || s.p !== 5 || s.text === 'Ellos'; });
    return pick(r, pool);
  }

  /* ================================================================ topic generators */

  /* ---- present tense, regular verbs ---- */
  function genPresent(d, r) {
    var v = pick(r, REGULAR), s = pick(r, subjectsFor(d));
    var form = conjRegular(v.inf, s.p);
    if (d === 1 || chance(r, 0.45)) {
      return P('<b>' + v.inf + '</b> (' + v.en + ') — ' + s.text + ' ' + BLANK,
        form, [s.text + ' ' + form], 'stem <i>' + v.inf.slice(0, -2) + '</i> + <i>' + ENDINGS[v.inf.slice(-2)][s.p] + '</i>');
    }
    var obj = pick(r, ['español', 'la tarea', 'en la casa', 'con mis amigos', 'los sábados', 'en la escuela', 'mucho', 'por la mañana']);
    return P(cap(s.text) + ' ' + BLANK + ' ' + obj + '. <span class="cue">(' + v.inf + ')</span>',
      form, [], v.inf + ' → ' + s.text + ' ' + form);
  }

  /* ---- ser vs estar ---- */
  function genSerEstar(d, r) {
    var shapes = ['origin', 'location', 'feeling', 'trait', 'job', 'day'];
    if (d >= 2) shapes.push('feeling', 'trait', 'location');   /* the ones worth repeating */
    var shape = pick(r, shapes);
    var why, sent, form;
    if (shape === 'origin') {
      var s1 = subjFor(r, d);
      form = SER[s1.p];
      sent = s1.text + ' ' + BLANK + ' de ' + pick(r, PLACES_ES) + '.';
      why = 'ser: where someone is from';
    } else if (shape === 'location') {
      var n = pick(r, NOUNS), pl = chance(r, 0.35);
      form = ESTAR[pl ? 5 : 2];
      sent = cap(defArt(n.g, pl)) + ' ' + (pl ? plural(n) : n.es) + ' ' + BLANK + ' en ' + pick(r, WHERE) + '.';
      why = 'estar: where something is';
    } else if (shape === 'feeling') {
      var s2 = subjFor(r, d), f = pick(r, FEELINGS);
      form = ESTAR[s2.p];
      sent = s2.text + ' ' + BLANK + ' ' + agree(f, s2.g, s2.pl) + ' hoy.';
      why = 'estar: how someone feels right now';
    } else if (shape === 'trait') {
      var s3 = subjFor(r, d), t = pick(r, TRAITS);
      form = SER[s3.p];
      sent = s3.text + ' ' + BLANK + ' ' + agree(t, s3.g, s3.pl) + '.';
      why = 'ser: what someone is like';
    } else if (shape === 'job') {
      var j = pick(r, JOBS);
      form = SER[2];
      sent = (j.g === 'f' ? 'Mi tía' : 'Mi tío') + ' ' + BLANK + ' ' + j.es + '.';
      why = 'ser: what someone does';
    } else {
      form = SER[2];
      sent = 'Hoy ' + BLANK + ' ' + pick(r, DAYS) + '.';
      why = 'ser: the day and the date';
    }
    return P(sent + ' <span class="cue">(ser / estar)</span>', form, [], why);
  }

  /* ---- stem-changing verbs ---- */
  function genStem(d, r) {
    var v = pick(r, STEM), s = pick(r, subjectsFor(d));
    /* nosotros is the whole point, so ask for it more often than chance would */
    if (chance(r, 0.3)) s = pick(r, SUBJECTS.filter(function (x) { return x.p === 3; }));
    var form = conjStem(v, s.p);
    var hint = d === 3 ? '' : ' <span class="cue">(' + v.from + '→' + v.to + ')</span>';
    var why = (s.p === 3 || s.p === 4)
      ? 'nosotros and vosotros keep the plain stem: ' + form
      : v.from + ' → ' + v.to + ', so ' + form;
    return P('<b>' + v.inf + '</b> (' + v.en + ') — ' + s.text + ' ' + BLANK + hint, form, [s.text + ' ' + form], why);
  }

  /* ---- tener ---- */
  /* Things it makes sense to have to do, or to be going to do: "Ellos tienen que vivir hoy" parses
     but means nothing. A drill still has to say something. */
  var DOABLE = ['estudiar', 'trabajar', 'limpiar', 'cocinar', 'ayudar', 'practicar', 'caminar', 'nadar',
    'cantar', 'bailar', 'comer', 'correr', 'aprender', 'escribir', 'leer'];
  function activity(r) {
    var pool = REGULAR.filter(function (v) { return DOABLE.indexOf(v.inf) >= 0; });
    return pick(r, pool);
  }
  var TENER_EXPR = [
    { es: 'hambre', en: 'hungry' }, { es: 'sed', en: 'thirsty' }, { es: 'sueño', en: 'sleepy' },
    { es: 'frío', en: 'cold' }, { es: 'calor', en: 'hot' }, { es: 'miedo', en: 'afraid' },
    { es: 'prisa', en: 'in a hurry' }, { es: 'razón', en: 'right' }, { es: 'suerte', en: 'lucky' }
  ];
  function genTener(d, r) {
    var shape = pick(r, d === 1 ? ['form', 'expr', 'age'] : ['form', 'expr', 'age', 'que', 'expr']);
    var s = pick(r, subjectsFor(d));
    if (shape === 'form') {
      return P('<b>tener</b> (to have) — ' + s.text + ' ' + BLANK, TENER[s.p], [s.text + ' ' + TENER[s.p]], '');
    }
    if (shape === 'expr') {
      var e = pick(r, TENER_EXPR), sub = subjFor(r, d);
      return P(sub.text + ' ' + BLANK + ' ' + e.es + '. <span class="cue">(' + beEn(sub) + ' ' + e.en + ')</span>',
        TENER[sub.p], [], 'Spanish <i>has</i> hunger where English <i>is</i> hungry');
    }
    if (shape === 'age') {
      var age = rint(r, 8, 60), sub2 = subjFor(r, d);
      return P(sub2.text + ' ' + BLANK + ' ' + numberWords(age) + ' años. <span class="cue">(' + beEn(sub2) + ' ' + age + ' years old)</span>',
        TENER[sub2.p], [], 'age is <i>tener ... años</i>, never <i>ser</i>');
    }
    var v3 = activity(r), inf = v3.inf, sub3 = subjFor(r, d);
    return P(sub3.text + ' ' + BLANK + ' que ' + inf + ' hoy. <span class="cue">(' + (sub3.p === 2 ? 'has ' : 'have ') + v3.en + ' today)</span>',
      TENER[sub3.p], [], '<i>tener que</i> + infinitive = to have to');
  }

  /* ---- ir, ir + a, al and del ---- */
  function genIr(d, r) {
    var shape = pick(r, d === 1 ? ['form', 'contract'] : ['form', 'contract', 'futuro', 'contract']);
    if (shape === 'form') {
      var s = pick(r, subjectsFor(d));
      return P('<b>ir</b> (to go) — ' + s.text + ' ' + BLANK, IR[s.p], [s.text + ' ' + IR[s.p]], '');
    }
    if (shape === 'futuro') {
      var v2 = activity(r), s2 = subjFor(r, d), inf = v2.inf;
      return P(s2.text + ' ' + BLANK + ' a ' + inf + ' mañana. <span class="cue">(' + beEn(s2) + ' going ' + v2.en + ' tomorrow)</span>',
        IR[s2.p], [], '<i>ir</i> + a + infinitive says what is about to happen');
    }
    /* a + el = al, de + el = del, and the ones that do not contract */
    var n = pick(r, NOUNS.filter(function (x) { return x.set === 'places'; }));
    var from = chance(r, 0.5);
    if (n.g === 'm') {
      return P('Vengo ' + BLANK + ' ' + n.es + '. <span class="cue">(' + (from ? 'de' : 'a') + ' + el)</span>',
        from ? 'del' : 'al', [], from ? 'de + el = del' : 'a + el = al');
    }
    return P('Vengo ' + BLANK + ' ' + n.es + '. <span class="cue">(' + (from ? 'de' : 'a') + ' + la)</span>',
      (from ? 'de la' : 'a la'), [], 'only <i>el</i> contracts: <i>de la</i> and <i>a la</i> stay as they are');
  }

  /* ---- gustar ---- */
  var GUST_WHO = [
    { a: 'A mí', pron: 'me' }, { a: 'A ti', pron: 'te' }, { a: 'A él', pron: 'le' },
    { a: 'A ella', pron: 'le' }, { a: 'A nosotros', pron: 'nos' }, { a: 'A ellos', pron: 'les' },
    { a: 'A mi hermana', pron: 'le' }, { a: 'A mis padres', pron: 'les' }
  ];
  function genGustar(d, r) {
    /* you can like rice, but "los arroces" is not what a beginner should be shown */
    var countable = NOUNS.filter(function (x) { return !x.mass && x.set !== 'people' && x.set !== 'family'; });
    var who = pick(r, GUST_WHO), n = pick(r, countable), pl = chance(r, 0.5);
    if (d >= 2 && chance(r, 0.3)) {
      /* liking an activity: always singular, however many verbs follow */
      var inf = activity(r).inf;
      return P(who.a + ' ' + BLANK + ' ' + inf + '. <span class="cue">(gustar)</span>',
        who.pron + ' gusta', [], 'a verb after gustar is always <i>gusta</i>');
    }
    var thing = defArt(n.g, pl) + ' ' + (pl ? plural(n) : n.es);
    return P(who.a + ' ' + BLANK + ' ' + thing + '. <span class="cue">(gustar)</span>',
      who.pron + ' ' + (pl ? 'gustan' : 'gusta'), [],
      'what is liked is the subject: ' + thing + ' is ' + (pl ? 'plural → gustan' : 'singular → gusta'));
  }

  /* ---- articles and agreement ---- */
  function genGender(d, r) {
    var shape = pick(r, d === 1 ? ['def', 'indef', 'def'] : ['def', 'indef', 'plural', 'adj', 'adj']);
    var n = pick(r, d === 1 ? NOUNS.filter(function (x) { return !x.tricky; }) : NOUNS);
    if (shape === 'def') {
      return P(BLANK + ' ' + n.es + ' <span class="cue">(the)</span>', defArt(n.g, false), [],
        n.es + ' is ' + (n.g === 'f' ? 'feminine' : 'masculine') + (n.tricky ? ' — the ending does not say so' : ''));
    }
    if (shape === 'indef') {
      return P(BLANK + ' ' + n.es + ' <span class="cue">(a / an)</span>', indefArt(n.g, false), [],
        n.es + ' is ' + (n.g === 'f' ? 'feminine' : 'masculine'));
    }
    if (shape === 'plural') {
      return P('Write the plural: <b>' + defArt(n.g, false) + ' ' + n.es + '</b>',
        defArt(n.g, true) + ' ' + plural(n), [], n.pl ? 'the ending changes too' : '');
    }
    /* "los teléfonos simpáticos" is correct and silly, and so is "la hermana fácil". The drill is about
       agreement, but it should still say something, so each kind of noun has adjectives that suit it. */
    var human = n.set === 'people' || n.set === 'family';
    var names = human ? ADJ_PERSON : ADJ_THING;
    var pool = ADJS.filter(function (x) { return names.indexOf(x.es) >= 0; });
    var a = pick(r, pool), pl = chance(r, 0.4);
    var noun = (pl ? plural(n) : n.es);
    return P(defArt(n.g, pl) + ' ' + noun + ' ' + BLANK + ' <span class="cue">(' + a.es + ')</span>',
      agree(a, n.g, pl), [defArt(n.g, pl) + ' ' + noun + ' ' + agree(a, n.g, pl)],
      'match ' + noun + ': ' + (n.g === 'f' ? 'feminine' : 'masculine') + (pl ? ' plural' : ' singular'));
  }

  /* ---- question words ---- */
  var QWORDS = [
    { es: 'qué', en: 'what' }, { es: 'quién', en: 'who' }, { es: 'dónde', en: 'where' },
    { es: 'cuándo', en: 'when' }, { es: 'por qué', en: 'why' }, { es: 'cómo', en: 'how' },
    { es: 'cuántos', en: 'how many' }, { es: 'adónde', en: 'to where' }, { es: 'cuál', en: 'which one' }
  ];
  var QFRAMES = [
    { q: '¿' + BLANK + ' está la biblioteca? — Está cerca del parque.', a: 'dónde' },
    { q: '¿' + BLANK + ' es tu cumpleaños? — Es el cuatro de mayo.', a: 'cuándo' },
    { q: '¿' + BLANK + ' es esa chica? — Es mi hermana.', a: 'quién' },
    { q: '¿' + BLANK + ' años tienes? — Tengo trece años.', a: 'cuántos' },
    { q: '¿' + BLANK + ' estás? — Estoy muy bien, gracias.', a: 'cómo' },
    { q: '¿' + BLANK + ' no vas a la fiesta? — Porque tengo que estudiar.', a: 'por qué' },
    { q: '¿' + BLANK + ' vas? — Voy a la escuela.', a: 'adónde', accept: ['dónde'] },
    { q: '¿' + BLANK + ' hay en la mochila? — Hay dos libros.', a: 'qué' },
    { q: '¿' + BLANK + ' hermanos tienes? — Tengo dos hermanos.', a: 'cuántos' },
    { q: '¿' + BLANK + ' es tu clase favorita? — Es la clase de arte.', a: 'cuál' }
  ];
  function genQuestions(d, r) {
    if (d === 1 || chance(r, 0.4)) {
      var w = pick(r, QWORDS);
      return P('Say it in Spanish: <b>' + w.en + '</b> <span class="cue">(question word)</span>', w.es, [], '');
    }
    var f = pick(r, QFRAMES);
    return P(f.q, cap(f.a), [f.a].concat(f.accept || []), '');
  }

  /* ---- numbers ---- */
  function genNumbers(d, r) {
    var hi = d === 1 ? 30 : d === 2 ? 100 : 1000;
    var n = rint(r, 0, hi);
    var shape = pick(r, ['toWords', 'toDigits', d >= 2 ? 'sum' : 'toWords']);
    if (shape === 'toWords') return P('Write in Spanish: <b>' + n + '</b>', numberWords(n), [], '');
    if (shape === 'toDigits') return P('Write the numeral: <b>' + numberWords(n) + '</b>', String(n), [], '');
    var a = rint(r, 2, Math.min(50, hi)), b = rint(r, 2, Math.min(50, hi));
    return P('<b>' + numberWords(a) + ' más ' + numberWords(b) + '</b> = ' + BLANK + ' <span class="cue">(in words)</span>',
      numberWords(a + b), [String(a + b)], a + ' + ' + b + ' = ' + (a + b));
  }

  /* ---- time, days and months ---- */
  function genTime(d, r) {
    var shape = pick(r, ['clock', 'clock', 'readClock', 'day', 'month', d >= 2 ? 'nextDay' : 'day']);
    if (shape === 'clock' || shape === 'readClock') {
      var h = rint(r, 1, 12);
      var mins = d === 1 ? [0, 15, 30] : d === 2 ? [0, 10, 15, 20, 30, 45] : [0, 5, 10, 15, 20, 25, 30, 40, 45, 50];
      var m = pick(r, mins);
      var ways = timeWords(h, m);
      var digits = h + ':' + (m < 10 ? '0' + m : m);
      if (shape === 'clock') return P('¿Qué hora es? <b>' + digits + '</b>', ways[0], ways.slice(1), '');
      return P('Write the time in numbers: <b>' + ways[0] + '</b>', digits, [], '');
    }
    if (shape === 'day') {
      var i = rint(r, 0, 6);
      return chance(r, 0.5)
        ? P('Say it in Spanish: <b>' + DAYS_EN[i] + '</b>', DAYS[i], [], '')
        : P('Say it in English: <b>' + DAYS[i] + '</b>', DAYS_EN[i], [], '');
    }
    if (shape === 'nextDay') {
      var j = rint(r, 0, 6);
      return P('¿Qué día viene después de <b>' + DAYS[j] + '</b>?', DAYS[(j + 1) % 7], [], '');
    }
    var k = rint(r, 0, 11);
    return chance(r, 0.5)
      ? P('Say it in Spanish: <b>' + MONTHS_EN[k] + '</b>', MONTHS[k], [], '')
      : P('Say it in English: <b>' + MONTHS[k] + '</b>', MONTHS_EN[k], [], '');
  }

  /* ---- vocabulary ---- */
  /* One list built from the tables above, so a word never has to be typed twice and can never disagree
     with itself. Where two Spanish words share an English meaning, both are accepted. */
  var VOCAB = [];
  NOUNS.forEach(function (n) { VOCAB.push({ es: n.es, en: n.en, art: defArt(n.g, false), kind: 'noun', set: n.set }); });
  ADJS.forEach(function (a) { VOCAB.push({ es: a.es, en: a.en, kind: 'adj', set: 'describing' }); });
  REGULAR.concat(STEM).forEach(function (v) { VOCAB.push({ es: v.inf, en: v.en, kind: 'verb', set: 'verbs' }); });
  var BY_EN = {}, BY_ES = {};
  VOCAB.forEach(function (w) {
    (BY_EN[fold(w.en)] = BY_EN[fold(w.en)] || []).push(w);
    (BY_ES[fold(w.es)] = BY_ES[fold(w.es)] || []).push(w);
  });
  function genVocab(d, r) {
    var w = pick(r, VOCAB);
    var toSpanish = chance(r, 0.5);
    if (toSpanish) {
      var sameEn = BY_EN[fold(w.en)] || [w];
      var answers = uniq(sameEn.map(function (x) { return x.es; }));
      var accept = [];
      sameEn.forEach(function (x) { if (x.art) accept.push(x.art + ' ' + x.es); });
      answers.slice(1).forEach(function (a) { accept.push(a); });
      return P('Say it in Spanish: <b>' + w.en + '</b>' + (w.kind === 'verb' ? ' <span class="cue">(infinitive)</span>' : ''),
        answers[0], accept, w.art ? w.art + ' ' + w.es : '');
    }
    var sameEs = BY_ES[fold(w.es)] || [w];
    var ens = uniq(sameEs.map(function (x) { return x.en; }));
    var acc = ens.slice(1);
    ens.forEach(function (e) { if (/^to /.test(e)) acc.push(e.slice(3)); });
    return P('Say it in English: <b>' + (w.art ? w.art + ' ' : '') + w.es + '</b>', ens[0], acc, '');
  }

  var GEN = {
    present: genPresent, serestar: genSerEstar, stem: genStem, tener: genTener, ir: genIr,
    gustar: genGustar, gender: genGender, questions: genQuestions, numbers: genNumbers,
    time: genTime, vocab: genVocab
  };

  /* ================================================================ generate */
  function normTopics(topics) {
    var list = Array.isArray(topics) ? topics : typeof topics === 'string' ? topics.split(',') : [];
    list = list.map(function (s) { return String(s).trim().toLowerCase(); }).filter(Boolean);
    if (!list.length) return TOPICS.map(function (t) { return t.id; });
    list.forEach(function (id) { if (!GEN[id]) throw new Error('Unknown topic "' + id + '". Known topics: ' + TOPICS.map(function (t) { return t.id; }).join(', ')); });
    return TOPICS.map(function (t) { return t.id; }).filter(function (id) { return list.indexOf(id) >= 0; });
  }
  function generate(opts) {
    opts = opts || {};
    var topics = normTopics(opts.topics);
    var rawCount = (opts.count == null || opts.count === '') ? 20 : Number(opts.count);
    var count = isFinite(rawCount) ? Math.min(60, Math.max(1, Math.round(rawCount))) : 20;
    var difficulty = [1, 2, 3].indexOf(Number(opts.difficulty)) >= 0 ? Number(opts.difficulty) : 2;
    var seed = opts.seed;
    if (seed == null || seed === '' || isNaN(Number(seed))) seed = Math.floor(Math.random() * 1e9);
    seed = Math.abs(Math.floor(Number(seed))) % 4294967296;
    var r = rng(seed);
    var order = shuffle(r, topics.slice()), base = Math.floor(count / topics.length), extra = count % topics.length;
    var seen = {}, problems = [];
    order.forEach(function (id, i) {
      var n = base + (i < extra ? 1 : 0);
      for (var k = 0; k < n; k++) {
        var p, tries = 0;
        do { p = GEN[id](difficulty, r); tries++; } while (seen[p.question] && tries < 200);
        seen[p.question] = true;
        problems.push({ id: '', topic: id, topicName: TOPIC_BY_ID[id].name, question: p.question, answer: p.answer, accept: p.accept, work: p.work });
      }
    });
    shuffle(r, problems);
    problems.forEach(function (p, i) { p.id = 'q' + (i + 1); });
    return { seed: seed, difficulty: difficulty, topics: topics, count: count, problems: problems };
  }

  /* ================================================================ answer checking */
  /* Typing accents is awkward on a school keyboard, so "esta" is accepted for "está" and "anos" for
     "años". The key still shows the accents: this is about not punishing a keyboard. */
  function norm(s) {
    s = String(s == null ? '' : s);
    s = s.replace(/<[^>]+>/g, ' ');
    s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    s = fold(s);
    s = s.replace(/[¿¡?!.,;:"'“”‘’]/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }
  function checkAnswer(problem, typed) {
    if (!problem || typed == null) return false;
    var t = norm(typed); if (!t) return false;
    var cands = [problem.answer].concat(Array.isArray(problem.accept) ? problem.accept : []);
    for (var i = 0; i < cands.length; i++) {
      var a = norm(cands[i]);
      if (!a) continue;
      if (a === t) return true;
      /* "the book" for "book", "el libro" for "libro": a leading article on either side is not the point */
      if (stripArt(a) === stripArt(t)) return true;
    }
    return false;
  }
  function stripArt(s) { return s.replace(/^(el|la|los|las|un|una|unos|unas|the|a|an|to) /, ''); }

  /* ================================================================ worksheet HTML */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* Escape the lot, then put back only the few tags the generators above produce. */
  function safe(html) {
    return esc(html)
      .replace(/&lt;(\/?)(b|i)&gt;/g, '<$1$2>')
      .replace(/&lt;br&gt;/g, '<br>')
      .replace(/&lt;span class=&quot;cue&quot;&gt;/g, '<span class="cue">')
      .replace(/&lt;\/span&gt;/g, '</span>')
      .replace(/&amp;(lt|gt|amp|nbsp|#\d+);/g, '&$1;');
  }
  function renderWorksheet(ws, o) {
    o = o || {};
    if (!ws || !Array.isArray(ws.problems)) throw new Error('renderWorksheet needs a worksheet from ES.generate');
    var title = o.title || 'Spanish Practice', name = o.name || '', showAnswers = o.showAnswers !== false;
    var topics = (ws.topics || []).map(function (id) { return TOPIC_BY_ID[id] ? TOPIC_BY_ID[id].name : id; });
    var n = ws.problems.length, boxH = n <= 8 ? 1.5 : n <= 12 ? 1.05 : n <= 20 ? 0.7 : n <= 30 ? 0.5 : 0.4;
    var diffName = ['', 'Warm-up', 'Standard', 'Challenge'][ws.difficulty] || '';
    var css = [
      '@page{size:letter;margin:.5in .55in .55in}',
      '*{box-sizing:border-box}',
      'body{margin:0;color:#14161c;font:11pt/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
      '.page{max-width:8.5in;margin:0 auto;padding:.45in .5in}',
      '@media screen{body{background:#e9ebf0}.page{background:#fff;box-shadow:0 2px 18px rgba(16,24,40,.18);margin:22px auto;min-height:11in;border-radius:3px}}',
      'header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2.5px solid #14161c;padding-bottom:7px}',
      'h1{font-size:17pt;margin:0;letter-spacing:-.01em;line-height:1.15}',
      '.kicker{font-size:8.5pt;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#6b7280;margin-bottom:3px}',
      '.meta{font-size:8.5pt;color:#6b7280;text-align:right;line-height:1.5;white-space:nowrap}',
      '.idline{display:flex;gap:22px;margin:11px 0 16px;font-size:10.5pt;color:#374151}',
      '.idline span{display:flex;gap:6px;align-items:baseline;flex:1}',
      '.idline i{flex:1;border-bottom:1px solid #9aa0ab;min-width:1.3in;font-style:normal;color:#14161c}',
      'ol.problems{list-style:none;margin:0;padding:0;columns:2;column-gap:26px}',
      'li.prob{break-inside:avoid;page-break-inside:avoid;display:flex;gap:9px;margin:0 0 13px}',
      '.num{flex:none;width:19px;height:19px;border-radius:50%;background:#14161c;color:#fff;font-size:9.5pt;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}',
      '.body{flex:1;min-width:0}.t{overflow-wrap:anywhere}',
      '.cue{color:#6b7280;font-size:9pt}',
      '.work{height:' + boxH + 'in;border:1px dashed #c3c8d2;border-radius:5px;margin-top:6px}',
      '.key{page-break-before:always;break-before:page;padding-top:.15in}',
      '.key h2{font-size:12.5pt;margin:0 0 8px;border-bottom:1.5px solid #14161c;padding-bottom:4px}',
      '.key ol{list-style:none;margin:0;padding:0;columns:3;column-gap:22px;font-size:9.5pt}',
      '.key li{break-inside:avoid;display:flex;gap:7px;margin:0 0 7px;align-items:baseline}',
      '.key .n{flex:none;width:16px;height:16px;border-radius:50%;border:1px solid #9aa0ab;color:#4b5563;font-size:8pt;font-weight:700;display:flex;align-items:center;justify-content:center}',
      '.key .a{flex:1;font-weight:600;overflow-wrap:anywhere}',
      '.key .w{display:block;font-weight:400;color:#6b7280;font-size:8.8pt;margin-top:1px}',
      'footer{margin-top:16px;border-top:1px solid #d5d9e0;padding-top:5px;font-size:8pt;color:#8b919c;display:flex;justify-content:space-between;gap:1em;flex-wrap:wrap}',
      '@media print{.page{box-shadow:none;margin:0;padding:0;max-width:none;min-height:0}}',
      '@media (max-width:600px){ol.problems,.key ol{columns:1}.page{padding:.4in .35in}}'
    ].join('');
    var head = '<header><div><div class="kicker">Practice worksheet</div><h1>' + esc(title) + '</h1></div>' +
      '<div class="meta">' + n + ' questions · level ' + esc(ws.difficulty) + (diffName ? ' ' + diffName : '') + '<br>' + esc(topics.join(' · ')) + '</div></header>' +
      '<div class="idline"><span>Name <i>' + esc(name) + '</i></span><span>Date <i></i></span><span>Score <i></i></span></div>';
    var items = ws.problems.map(function (p, i) {
      return '<li class="prob"><span class="num">' + (i + 1) + '</span><div class="body"><div class="t">' + safe(p.question) + '</div><div class="work"></div></div></li>';
    }).join('');
    var hub = esc(o.hub || 'Practice Hub');
    var foot = '<footer><span>Seed ' + esc(ws.seed) + ' · ' + hub + '</span><span>Same seed, same worksheet — spanish.html</span></footer>';
    var key = showAnswers ? '<section class="key"><h2>Answer key — ' + esc(title) + ' (seed ' + esc(ws.seed) + ')</h2><ol>' +
      ws.problems.map(function (p, i) {
        return '<li><span class="n">' + (i + 1) + '</span><span class="a">' + safe(p.answer) + (p.work ? '<span class="w">' + safe(p.work) + '</span>' : '') + '</span></li>';
      }).join('') + '</ol><footer><span>' + esc(title) + ' · answer key</span><span>' + hub + '</span></footer></section>' : '';
    return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + esc(title) + ' — seed ' + esc(ws.seed) + '</title>\n<style>' + css + '</style>\n</head>\n<body>\n<div class="page">\n' + head + '\n<ol class="problems">\n' + items + '\n</ol>\n' + foot + '\n' + key + '\n</div>\n</body>\n</html>\n';
  }

  return {
    TOPICS: TOPICS, topic: function (id) { return TOPIC_BY_ID[id] || null; },
    generate: generate, checkAnswer: checkAnswer, normalise: norm, renderWorksheet: renderWorksheet,
    safeHTML: safe, rng: rng, BLANK: BLANK,
    /* exposed so the tests can re-derive every answer instead of trusting the generator */
    conjRegular: conjRegular, conjStem: conjStem, agree: agree, plural: plural, numberWords: numberWords,
    timeWords: timeWords, defArt: defArt, indefArt: indefArt,
    SER: SER, ESTAR: ESTAR, TENER: TENER, IR: IR, REGULAR: REGULAR, STEM: STEM,
    NOUNS: NOUNS, ADJS: ADJS, VOCAB: VOCAB, DAYS: DAYS, MONTHS: MONTHS, ENDINGS: ENDINGS
  };
});
