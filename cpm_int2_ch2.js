/* Priyaan Hub — question bank, part two.
   CPM Core Connections Integrated II, Chapter 2 "Justification and Similarity".
   Plain script (no modules, no network). Appends its lessons to window.CPM_QUIZZES.lessons, which
   cpm_int2_ch1.js created, so the quiz page, the review page and the ask page all pick them up with
   no further wiring. Load it after chapter 1.
   Question kinds are the same as chapter 1:
     { type:'mc', q, choices:[strings], answer:index, explain, svg? }
     { type:'num', q, answer:number, unit?, tolerance?, explain, svg? }
     { type:'text', q, answer:'...', accept?:[...], explain, svg? }
     { type:'gen', make:function (rnd) { return one of the above } } */
(function () {
  'use strict';
  var BANK = window.CPM_QUIZZES;
  if (!BANK || !Array.isArray(BANK.lessons)) return;          // chapter 1 did not load; nothing to add to

  /* ---------------------------------------------------------------- helpers ---- */
  function ri(rnd, a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function shuffle(rnd, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function ratio(a, b) { var g = gcd(a, b); return (a / g) + ':' + (b / g); }
  function frac(n, d) { var g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; }
  function mc(q, choices, answer, explain, svg) { var o = { type: 'mc', q: q, choices: choices, answer: answer, explain: explain }; if (svg) o.svg = svg; return o; }
  function num(q, answer, unit, explain, svg) { var o = { type: 'num', q: q, answer: answer, explain: explain }; if (unit) o.unit = unit; if (svg) o.svg = svg; return o; }
  function txt(q, answer, accept, explain) { return { type: 'text', q: q, answer: answer, accept: accept || [], explain: explain }; }
  function gen(make) { return { type: 'gen', make: make }; }
  /** Four options, the right one first; the app shuffles them. */
  function four(rnd, correct, pool, fmt) {
    fmt = fmt || String;
    var out = [correct], seen = {}; seen[fmt(correct)] = true;
    var cand = shuffle(rnd, pool);
    for (var i = 0; i < cand.length && out.length < 4; i++) {
      var k = fmt(cand[i]);
      if (!seen[k]) { seen[k] = true; out.push(cand[i]); }
    }
    return { choices: out.map(fmt), answer: 0 };
  }

  /* ---------------------------------------------------------------- figures ---- */
  function S(w, h, inner, maxw) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-hidden="true" style="max-width:' + (maxw || 330) +
      'px;width:100%;height:auto;display:block" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" font-size="13">' + inner + '</svg>';
  }
  function T(x, y, s, anchor) {
    return '<text x="' + x + '" y="' + y + '" fill="currentColor" stroke="none" text-anchor="' + (anchor || 'middle') +
      '" dominant-baseline="middle" font-size="13">' + s + '</text>';
  }
  function tri(pts, o) {
    o = o || {};
    return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="var(--accent)" fill-opacity="' +
      (o.fo == null ? 0.14 : o.fo) + '"/>';
  }
  /** Two similar right triangles side by side, labelled with the sides given. */
  function twoTriangles(aLegs, bLegs, labels) {
    var s1 = tri([[20, 110], [20, 110 - aLegs[1]], [20 + aLegs[0], 110]]) +
      '<polyline points="20,110 20,' + (110 - aLegs[1]) + ' ' + (20 + aLegs[0]) + ',110 20,110"/>';
    var s2 = tri([[190, 110], [190, 110 - bLegs[1]], [190 + bLegs[0], 110]]) +
      '<polyline points="190,110 190,' + (110 - bLegs[1]) + ' ' + (190 + bLegs[0]) + ',110 190,110"/>';
    var lab = T(14, 110 - aLegs[1] / 2, labels[0], 'end') + T(20 + aLegs[0] / 2, 122, labels[1]) +
      T(184, 110 - bLegs[1] / 2, labels[2], 'end') + T(190 + bLegs[0] / 2, 122, labels[3]);
    return S(330, 140, s1 + s2 + lab);
  }

  /* ================================================================ 2.1.1 Similarity ---- */
  var L211 = [
    mc('Two figures are <b>similar</b>. Which of these must be true?',
      ['Corresponding angles are equal and corresponding sides are in the same ratio',
       'Corresponding angles are equal and corresponding sides are equal',
       'Corresponding sides are in the same ratio, but the angles may differ',
       'They have the same area'], 0,
      'Similar means the same shape: angles match exactly, sides match up to one scale factor.'),
    mc('Which pair of figures is <b>always</b> similar?',
      ['Any two squares', 'Any two rectangles', 'Any two triangles', 'Any two rhombuses'], 0,
      'Every square has four right angles and four equal sides, so one is always an enlargement of another. Rectangles can be long and thin or nearly square.'),
    mc('Two similar figures have scale factor 1. What does that mean?',
      ['They are congruent', 'One is twice the other', 'One is upside down', 'They have no sides in common'], 0,
      'A scale factor of 1 changes nothing, so the figures are the same size as well as the same shape: congruent.'),
    mc('Are all circles similar?',
      ['Yes — every circle is an enlargement of every other', 'No — only circles with the same radius',
       'No — circles have no angles to compare', 'Only if they have the same centre'], 0,
      'A circle has one measurement, the radius. Scaling that gives any other circle.'),
    gen(function (rnd) {
      var k = ri(rnd, 2, 5), a = ri(rnd, 3, 9);
      return num('Two similar figures have scale factor ' + k + '. A side of the smaller figure is ' + a +
        ' cm. How long is the matching side of the larger figure?', a * k, 'cm',
        'Multiply by the scale factor: ' + a + ' × ' + k + ' = ' + (a * k) + ' cm.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 5), a = ri(rnd, 3, 9);
      return txt('Two similar figures have matching sides of ' + a + ' cm and ' + (a * k) +
        ' cm. Write the scale factor from the smaller to the larger.', String(k), [k + ':1', k + ' : 1'],
        (a * k) + ' ÷ ' + a + ' = ' + k + '.');
    }),
    mc('A photo is enlarged. Which of these does <b>not</b> change?',
      ['The angles at its corners', 'The length of its sides', 'Its area', 'Its perimeter'], 0,
      'Enlarging multiplies every length by the scale factor. Angles are not lengths, so they stay put.'),
    mc('Are all rectangles similar to each other?',
      ['No — a long thin one is not an enlargement of a square one', 'Yes — they all have four right angles',
       'Yes — opposite sides are always equal', 'Only if they have the same area'], 0,
      'Equal angles are not enough: the sides also have to be in the same ratio.'),
    mc('Are all equilateral triangles similar?',
      ['Yes — every angle is 60°, so one is always an enlargement of another', 'No — only if the sides are equal',
       'Only if they are the same way up', 'No — triangles are never similar'], 0,
      'All three angles are 60° in every equilateral triangle, so AA~ applies.'),
    mc('A model is built to a scale of 1 : 50. What does that mean?',
      ['Every length on the model stands for 50 of the same units on the real thing',
       'The model is 50 times bigger', 'The model weighs one fiftieth as much',
       'The model has 50 parts'], 0,
      'A scale is a ratio of lengths: 1 cm on the model is 50 cm on the real thing.'),
    gen(function (rnd) {
      var k = ri(rnd, 2, 6), a = ri(rnd, 2, 9);
      return num('Two similar figures have scale factor ' + k + '. A side of the larger is ' + (a * k) +
        ' cm. How long is the matching side of the smaller?', a, 'cm',
        'Divide by the scale factor: ' + (a * k) + ' ÷ ' + k + ' = ' + a + ' cm.');
    }),
    gen(function (rnd) {
      var s = ri(rnd, 20, 60), n = ri(rnd, 2, 8);
      return num('A model is built to a scale of 1 : ' + s + '. The model is ' + n +
        ' cm long. How long is the real thing, in centimetres?', n * s, 'cm',
        'Each centimetre stands for ' + s + ' cm, so ' + n + ' × ' + s + ' = ' + (n * s) + ' cm.');
    }),
    gen(function (rnd) {
      var s = ri(rnd, 20, 60), n = ri(rnd, 2, 8);
      return num('A map has a scale of 1 : ' + s + '. Two places are ' + (n * s) +
        ' cm apart in real life. How far apart are they on the map, in centimetres?', n, 'cm',
        'Divide by the scale: ' + (n * s) + ' ÷ ' + s + ' = ' + n + ' cm.');
    })
  ];

  /* ================================================================ 2.1.2 Ratios in similar figures ---- */
  var L212 = [
    gen(function (rnd) {
      var a = ri(rnd, 2, 9), k = ri(rnd, 2, 4);
      return txt('Two similar triangles have corresponding sides ' + a + ' cm and ' + (a * k) +
        ' cm. Write the ratio of the smaller to the larger in its simplest form.',
        ratio(a, a * k), [ratio(a, a * k).replace(':', ' : '), frac(a, a * k)],
        'Both sides divide by ' + a + ', giving ' + ratio(a, a * k) + '.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), p = ri(rnd, 8, 30);
      return num('Two similar shapes have scale factor ' + k + '. The perimeter of the smaller is ' + p +
        ' cm. What is the perimeter of the larger?', p * k, 'cm',
        'Every side is multiplied by ' + k + ', so the perimeter is too: ' + p + ' × ' + k + ' = ' + (p * k) + ' cm.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 3, 8), b = ri(rnd, 3, 8);
      return num('Two similar rectangles have scale factor ' + k + '. The smaller has area ' + (a * b) +
        ' cm². What is the area of the larger?', a * b * k * k, 'cm²',
        'Area grows by the square of the scale factor: ' + (a * b) + ' × ' + k + '² = ' + (a * b * k * k) + ' cm².');
    }),
    mc('Two similar figures have scale factor 3. How do their <b>areas</b> compare?',
      ['The larger area is 9 times the smaller', 'The larger area is 3 times the smaller',
       'The larger area is 6 times the smaller', 'The areas are equal'], 0,
      'Both dimensions are tripled, so the area is multiplied by 3 × 3 = 9.'),
    mc('The ratio of the sides of two similar shapes is 2 : 5. What is the ratio of their perimeters?',
      ['2 : 5', '4 : 25', '5 : 2', '1 : 3'], 0,
      'Perimeter is a length, so it scales exactly as the sides do.'),
    mc('The ratio of the sides of two similar shapes is 2 : 5. What is the ratio of their areas?',
      ['4 : 25', '2 : 5', '8 : 125', '5 : 2'], 0,
      'Area scales by the square of the ratio: 2² : 5² = 4 : 25.'),
    mc('Two similar solids have scale factor 2. How do their <b>volumes</b> compare?',
      ['The larger is 8 times the smaller', 'The larger is 2 times the smaller',
       'The larger is 4 times the smaller', 'They are equal'], 0,
      'All three dimensions double, so the volume is multiplied by 2 × 2 × 2 = 8.'),
    mc('The areas of two similar figures are in the ratio 9 : 25. What is the ratio of their sides?',
      ['3 : 5', '9 : 25', '81 : 625', '5 : 3'], 0,
      'Take the square root of each: √9 : √25 = 3 : 5.'),
    gen(function (rnd) {
      var a = ri(rnd, 2, 6), k = ri(rnd, 2, 4), b = a * k;
      return txt('Two similar shapes have sides in the ratio ' + a + ' : ' + b +
        '. Write the ratio of their areas in its simplest form.',
        ratio(a * a, b * b), [ratio(a * a, b * b).replace(':', ' : ')],
        'Square both parts: ' + a + '² : ' + b + '² = ' + (a * a) + ' : ' + (b * b) + ', which simplifies to ' + ratio(a * a, b * b) + '.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), p = ri(rnd, 6, 20);
      return num('Two similar shapes have scale factor ' + k + '. The perimeter of the larger is ' + (p * k) +
        ' cm. What is the perimeter of the smaller?', p, 'cm',
        'Divide by ' + k + ': ' + (p * k) + ' ÷ ' + k + ' = ' + p + ' cm.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 2, 5), b = ri(rnd, 3, 6);
      return num('Two similar rectangles have scale factor ' + k + '. The larger has area ' + (a * b * k * k) +
        ' cm². What is the area of the smaller?', a * b, 'cm²',
        'Divide by ' + k + '² = ' + (k * k) + ': ' + (a * b * k * k) + ' ÷ ' + (k * k) + ' = ' + (a * b) + ' cm².');
    })
  ];

  /* ================================================================ 2.1.3 Using ratios to find a side ---- */
  var L213 = [
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 3, 8), b = ri(rnd, 3, 9);
      /* the drawing has to show one triangle larger than the other, and by the right amount */
      var w1 = a * 7, h1 = b * 7, scale = Math.min(2.2, 90 / Math.max(w1, h1));
      return num('These two triangles are similar. Find the missing side, marked x.', b * k, null,
        'The scale factor is ' + (a * k) + ' ÷ ' + a + ' = ' + k + ', so x = ' + b + ' × ' + k + ' = ' + (b * k) + '.',
        twoTriangles([Math.round(w1 * 0.6), Math.round(h1 * 0.6)],
                     [Math.round(w1 * 0.6 * scale), Math.round(h1 * 0.6 * scale)],
                     [b + '', a + '', 'x', (a * k) + '']));
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 5), a = ri(rnd, 2, 9), b = ri(rnd, 2, 9);
      return num('△ABC ~ △DEF. AB = ' + a + ', DE = ' + (a * k) + ', and BC = ' + b + '. Find EF.', b * k, null,
        'DE ÷ AB = ' + k + ', so every side of △DEF is ' + k + ' times its match: EF = ' + b + ' × ' + k + ' = ' + (b * k) + '.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 5), a = ri(rnd, 2, 9), b = ri(rnd, 2, 9);
      return num('△ABC ~ △DEF with AB = ' + (a * k) + ', DE = ' + a + ' and BC = ' + (b * k) + '. Find EF.', b, null,
        'This time the second triangle is the smaller one: divide by ' + k + '. EF = ' + (b * k) + ' ÷ ' + k + ' = ' + b + '.');
    }),
    gen(function (rnd) {
      var h = ri(rnd, 2, 6), shadow = ri(rnd, 2, 6), tall = ri(rnd, 3, 9);
      /* "an 8 m shadow", not "a 8 m shadow" */
      var art = function (n) { return String(n).charAt(0) === '8' || n === 11 || n === 18 ? 'an' : 'a'; };
      return num(art(h).replace(/^a$/, 'A').replace(/^an$/, 'An') + ' ' + h + ' m pole casts ' + art(shadow) + ' ' + shadow +
        ' m shadow. At the same moment a tree casts ' + art(shadow * tall) + ' ' + (shadow * tall) +
        ' m shadow. How tall is the tree, in metres?', h * tall, 'm',
        'The shadow is ' + tall + ' times as long, so the tree is ' + tall + ' times as tall: ' + h + ' × ' + tall + ' = ' + (h * tall) + ' m.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 2, 8), b = ri(rnd, 2, 8), c = ri(rnd, 2, 8);
      return num('△ABC ~ △DEF. The sides of △ABC are ' + a + ', ' + b + ' and ' + c + '. DE = ' + (a * k) +
        '. What is the perimeter of △DEF?', (a + b + c) * k, null,
        'The scale factor is ' + k + ', so the perimeter is ' + (a + b + c) + ' × ' + k + ' = ' + ((a + b + c) * k) + '.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), h = ri(rnd, 2, 9), w = ri(rnd, 2, 9);
      return num('A photo ' + w + ' cm wide and ' + h + ' cm tall is enlarged so that it is ' + (w * k) +
        ' cm wide. How tall is it now, in centimetres?', h * k, 'cm',
        'The width was multiplied by ' + k + ', so the height is too: ' + h + ' × ' + k + ' = ' + (h * k) + ' cm.');
    }),
    gen(function (rnd) {
      var a = ri(rnd, 2, 6), b = ri(rnd, 2, 6), k = ri(rnd, 2, 4);
      return num('Solve for x:  ' + a + ' / ' + b + ' = x / ' + (b * k), a * k, null,
        'The bottom was multiplied by ' + k + ', so the top is too: x = ' + a + ' × ' + k + ' = ' + (a * k) + '.');
    }),
    mc('Why can a shadow be used to measure the height of a tree?',
      ['The Sun is far away, so the tree and a nearby pole make similar triangles',
       'Shadows are always the same length as the object', 'Shadows have no width',
       'The tree and its shadow are congruent'], 0,
      'The Sun\u2019s rays arrive at the same angle for both, so the two triangles have equal angles: AA~.'),
    mc('Two similar triangles have scale factor 4. A side of the smaller is 3 cm. Which calculation gives the matching side of the larger?',
      ['3 × 4', '3 ÷ 4', '4 ÷ 3', '3 + 4'], 0,
      'Going from smaller to larger multiplies by the scale factor.'),
    mc('Which proportion is set up correctly for △ABC ~ △DEF?',
      ['AB / DE = BC / EF', 'AB / EF = BC / DE', 'AB / BC = EF / DE', 'AB × DE = BC × EF'], 0,
      'Match each side with the side it corresponds to, and keep the same triangle on top throughout.')
  ];

  /* ================================================================ 2.1.4 Similarity notation ---- */
  var L214 = [
    mc('△ABC ~ △DEF. Which angle is equal to ∠B?',
      ['∠E', '∠D', '∠F', 'There is not enough information'], 0,
      'The order of the letters says which parts match: A↔D, B↔E, C↔F.'),
    mc('△ABC ~ △DEF. Which side matches AC?',
      ['DF', 'DE', 'EF', 'BC'], 0,
      'A↔D and C↔F, so AC matches DF.'),
    mc('What does the symbol <b>~</b> mean between two figures?',
      ['They are similar', 'They are congruent', 'They are equal in area', 'They are perpendicular'], 0,
      '~ is similar; ≅ is congruent.'),
    mc('If △PQR ≅ △STU, what is also true?',
      ['△PQR ~ △STU, with scale factor 1', '△PQR ~ △STU, with scale factor 2',
       'They cannot be similar', 'Only their angles match'], 0,
      'Congruent figures are similar figures that happen to be the same size.'),
    gen(function (rnd) {
      var names = shuffle(rnd, ['D', 'E', 'F']);
      var map = { A: 'D', B: 'E', C: 'F' };
      var letter = pick(rnd, ['A', 'B', 'C']);
      return mc('△ABC ~ △DEF. Which angle matches ∠' + letter + '?',
        ['∠' + map[letter], '∠' + names[0], '∠' + names[1], '∠' + names[2]].filter(function (v, i, arr) { return arr.indexOf(v) === i; }).slice(0, 4),
        0, 'The letters line up in order: A↔D, B↔E, C↔F.');
    }),
    mc('△ABC ~ △DEF. Which of these is written correctly?',
      ['AB / DE = AC / DF', 'AB / EF = AC / DE', 'AB / DF = BC / DE', 'AB / DE = DF / AC'], 0,
      'Both fractions must have △ABC on top and △DEF underneath, with matching sides.'),
    mc('If △ABC ~ △DEF, which statement is also true?',
      ['△BCA ~ △EFD', '△ABC ~ △EFD', '△ABC ~ △FDE', '△ACB ~ △DEF'], 0,
      'Rotating both names the same way keeps the letters lined up.'),
    mc('What does ∠ABC mean?',
      ['The angle at B, between BA and BC', 'The angle at A', 'The angle at C', 'The whole triangle'], 0,
      'The middle letter is the corner the angle sits at.'),
    mc('In △PQR ~ △XYZ, which side matches QR?',
      ['YZ', 'XY', 'XZ', 'PQ'], 0,
      'Q↔Y and R↔Z, so QR matches YZ.'),
    gen(function (rnd) {
      var m = { A: 'D', B: 'E', C: 'F' };
      var two = shuffle(rnd, ['A', 'B', 'C']).slice(0, 2).sort();
      var side = two.join(''), want = m[two[0]] + m[two[1]];
      var wrong = ['DE', 'EF', 'DF'].filter(function (x) { return x !== want; });
      return mc('△ABC ~ △DEF. Which side matches ' + side + '?', [want].concat(wrong), 0,
        'A↔D, B↔E, C↔F, so ' + side + ' matches ' + want + '.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 5), a = ri(rnd, 2, 8);
      return txt('△ABC ~ △DEF with AB = ' + a + ' and DE = ' + (a * k) +
        '. Write the scale factor from △ABC to △DEF.', String(k), [k + ':1', k + ' : 1'],
        'DE ÷ AB = ' + (a * k) + ' ÷ ' + a + ' = ' + k + '.');
    })
  ];

  /* ================================================================ 2.2.1 Conditions for similarity ---- */
  var L221 = [
    mc('Two triangles have two pairs of equal angles. Are they similar?',
      ['Yes, by AA~', 'No, three pairs are needed', 'Only if a pair of sides is also equal', 'Only if they are right triangles'], 0,
      'If two pairs of angles match, the third pair must too, since the angles add to 180°. That is the AA~ condition.'),
    mc('Which condition shows two triangles are similar from their <b>sides</b> alone?',
      ['SSS~ — all three pairs of sides in the same ratio', 'SAS~ — two sides and the angle between them',
       'AA~ — two pairs of equal angles', 'HL — hypotenuse and one leg'], 0,
      'SSS~ compares all three ratios; if they are equal, the triangles are similar.'),
    mc('Two sides of one triangle are in the same ratio as two sides of another, and the angles <b>between</b> those sides are equal. Which condition is this?',
      ['SAS~', 'SSS~', 'AA~', 'ASA'], 0,
      'The angle has to be the one between the two sides for SAS~ to apply.'),
    mc('Is AAA a separate condition for similarity?',
      ['No — two pairs of equal angles already force the third', 'Yes — all three must be checked',
       'No — angles never show similarity', 'Only for right triangles'], 0,
      'The angles of a triangle add to 180°, so the third pair comes free. AA~ is enough.'),
    gen(function (rnd) {
      var a = ri(rnd, 30, 70), b = ri(rnd, 30, 70);
      while (a + b >= 175) b = ri(rnd, 30, 70);
      return mc('One triangle has angles of ' + a + '° and ' + b + '°. Another has angles of ' + a + '° and ' +
        (180 - a - b) + '°. Are they similar?',
        ['Yes — both have angles ' + a + '°, ' + b + '° and ' + (180 - a - b) + '°',
         'No — the second triangle has a different angle', 'Only if their sides are equal',
         'There is not enough information'], 0,
        'The third angle of the first is 180 − ' + a + ' − ' + b + ' = ' + (180 - a - b) + '°, so all three match: AA~.');
    }),
    mc('Two right triangles each have an angle of 40°. Are they similar?',
      ['Yes — the right angles match and so do the 40° angles, which is AA~',
       'No — right triangles are never similar', 'Only if their hypotenuses are equal',
       'There is not enough information'], 0,
      'Both have a 90° angle and a 40° angle, so the third angle is 50° in each.'),
    mc('Which of these is <b>not</b> enough to show two triangles are similar?',
      ['One pair of equal angles', 'Two pairs of equal angles',
       'Three pairs of sides in the same ratio', 'Two pairs of sides in ratio with the angle between them equal'], 0,
      'One angle leaves the other two free, so the triangles can be very different shapes.'),
    mc('In SAS~, where must the angle be?',
      ['Between the two sides being compared', 'Opposite the longest side',
       'Anywhere in the triangle', 'At the top of the triangle'], 0,
      'If the angle is not between them, the sides can swing to make a different triangle.'),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 2, 6), b = ri(rnd, 3, 8), ang = ri(rnd, 30, 110);
      return mc('One triangle has sides ' + a + ' and ' + b + ' with an angle of ' + ang +
        '° between them. Another has sides ' + (a * k) + ' and ' + (b * k) + ' with an angle of ' + ang +
        '° between them. Are they similar?',
        ['Yes, by SAS~', 'No — the sides are different lengths', 'Yes, by SSS~', 'There is not enough information'], 0,
        'Both pairs of sides are in the ratio ' + k + ' : 1 and the angle between them is the same in each.');
    }),
    gen(function (rnd) {
      var a = ri(rnd, 25, 75), b = ri(rnd, 25, 75);
      while (a + b >= 170) b = ri(rnd, 25, 75);
      return num('A triangle has angles of ' + a + '° and ' + b + '°. What is its third angle, in degrees?',
        180 - a - b, '°', 'The three angles add to 180°: 180 − ' + a + ' − ' + b + ' = ' + (180 - a - b) + '°.');
    })
  ];

  /* ================================================================ 2.2.2 Flowcharts and justification ---- */
  var L222 = [
    mc('What goes in the <b>ovals</b> of a flowchart proof?',
      ['The facts, each with the reason that gives it', 'Only the final conclusion',
       'The question being asked', 'The diagram'], 0,
      'Each oval holds a statement, with the reason written underneath, and arrows show what follows from what.'),
    mc('In a flowchart proof, what do the <b>arrows</b> mean?',
      ['These facts together give the next one', 'These facts are equal',
       'This is the order the sides were measured', 'These statements are guesses'], 0,
      'An arrow means the statements it comes from are enough to conclude the one it points to.'),
    mc('You have shown two pairs of angles are equal. What can the last oval say?',
      ['The triangles are similar, by AA~', 'The triangles are congruent, by AA~',
       'The triangles have equal area', 'Nothing more can be concluded'], 0,
      'Two pairs of equal angles give similarity, not congruence: the triangles may be different sizes.'),
    mc('Why does a proof need a <b>reason</b> under every statement?',
      ['So a reader can check each step instead of taking it on trust',
       'To make the flowchart longer', 'Because the teacher asks for it', 'To show which step came first'], 0,
      'A proof is an argument. Without reasons it is only a list of claims.'),
    mc('Two triangles share an angle at the point where their lines cross. Which fact names those equal angles?',
      ['Vertical angles are equal', 'Corresponding angles are equal',
       'Alternate interior angles are equal', 'Base angles of an isosceles triangle are equal'], 0,
      'Angles opposite each other where two lines cross are vertical angles, and they are always equal.'),
    mc('Which of these is a <b>reason</b>, not a statement?',
      ['Vertical angles are equal', '∠1 = ∠2', 'AB = CD', '△ABC ~ △DEF'], 0,
      'A statement says what is true here; a reason says why it is always true.'),
    mc('A proof ends with the thing you were asked to show. Where does it start?',
      ['With what you were given', 'With the answer', 'With a guess', 'With the diagram'], 0,
      'Every step has to rest on something already known, and the given facts are the only place to begin.'),
    mc('Two parallel lines are crossed by a third. Which reason gives equal angles on the same side, in matching positions?',
      ['Corresponding angles are equal', 'Vertical angles are equal',
       'Alternate interior angles are equal', 'Angles on a straight line add to 180°'], 0,
      'Matching positions at the two crossings are corresponding angles.'),
    mc('Why is "it looks equal in the diagram" not a reason?',
      ['A diagram can be drawn inaccurately, so it proves nothing', 'Diagrams are never allowed in proofs',
       'It is a reason, but only for triangles', 'Because the diagram is not to scale by law'], 0,
      'A proof has to work for every figure that fits the given facts, not just the one that was drawn.'),
    mc('You know △ABC ~ △DEF. What can you write next, with a reason?',
      ['AB / DE = BC / EF, because corresponding sides of similar triangles are in the same ratio',
       'AB = DE, because the triangles are similar', 'The triangles have the same area',
       'Nothing — similarity gives no information about sides'], 0,
      'Similar triangles have equal angles and sides in the same ratio, not equal sides.'),
    mc('What is the difference between showing two triangles are <b>congruent</b> and <b>similar</b>?',
      ['Congruent needs the sides equal; similar only needs them in the same ratio',
       'There is no difference', 'Congruent is about angles, similar is about sides',
       'Similar triangles must be right triangles'], 0,
      'Congruence is the special case of similarity where the scale factor is 1.')
  ];

  /* ================================================================ 2.2.3 Congruence conditions ---- */
  var L223 = [
    mc('Which of these does <b>not</b> prove two triangles congruent?',
      ['SSA', 'SSS', 'ASA', 'SAS'], 0,
      'Two sides and an angle that is not between them can describe two different triangles, so SSA proves nothing on its own.'),
    mc('Which condition applies only to right triangles?',
      ['HL', 'SSS', 'ASA', 'AAS'], 0,
      'HL uses the hypotenuse and one leg, and only a right triangle has a hypotenuse.'),
    mc('Two triangles have three pairs of equal angles. Are they congruent?',
      ['Not necessarily — they are similar, but may be different sizes', 'Yes, by AAA',
       'Yes, by ASA', 'Only if they are right triangles'], 0,
      'Equal angles fix the shape, not the size.'),
    mc('Two pairs of sides are equal and so is the angle <b>between</b> them. Which condition is that?',
      ['SAS', 'SSA', 'ASA', 'AAS'], 0,
      'The angle is between the two sides, so it is side-angle-side.'),
    mc('Two angles and the side <b>between</b> them are equal. Which condition is that?',
      ['ASA', 'AAS', 'SAS', 'SSS'], 0,
      'Angle-side-angle: the side is enclosed by the two angles.'),
    gen(function (rnd) {
      var opts = [
        { has: 'all three pairs of sides equal', is: 'SSS' },
        { has: 'two pairs of sides and the angle between them equal', is: 'SAS' },
        { has: 'two pairs of angles and the side between them equal', is: 'ASA' },
        { has: 'two pairs of angles and a side not between them equal', is: 'AAS' }
      ];
      var c = pick(rnd, opts);
      var f = four(rnd, c.is, ['SSS', 'SAS', 'ASA', 'AAS', 'HL', 'SSA'].filter(function (x) { return x !== c.is; }));
      return mc('Two triangles have ' + c.has + '. Which condition proves them congruent?', f.choices, f.answer,
        'That is exactly the ' + c.is + ' condition.');
    }),
    mc('Why does HL work for right triangles?',
      ['The third side is forced by the Pythagorean theorem, so it is really SSS',
       'Right triangles are all congruent', 'The hypotenuse is always the longest side',
       'Because the angle is between the two sides'], 0,
      'Knowing the hypotenuse and one leg fixes the other leg, so all three sides are known.'),
    mc('Two triangles have all three pairs of sides in the ratio 2 : 1. Are they congruent?',
      ['No — they are similar, but one is twice the size', 'Yes, by SSS', 'Yes, by SAS', 'Only if they are right triangles'], 0,
      'Congruent triangles need the sides equal, which means a ratio of 1 : 1.'),
    mc('Which pieces of information does AAS use?',
      ['Two angles and a side that is not between them', 'Two angles and the side between them',
       'Two sides and the angle between them', 'Three sides'], 0,
      'If two angles are known the third is too, so the side can be anywhere.'),
    mc('Two triangles share a side. What reason lets you say that side is equal in both?',
      ['It is the same segment in both triangles', 'Vertical angles are equal',
       'Corresponding sides of similar triangles', 'The triangles are congruent'], 0,
      'A shared side is one segment, so it is equal to itself. This step is used in almost every proof.'),
    gen(function (rnd) {
      var c = pick(rnd, ['SSS', 'SAS', 'ASA', 'AAS', 'HL']);
      var about = { SSS: 'three pairs of sides', SAS: 'two pairs of sides and the angle between them',
        ASA: 'two pairs of angles and the side between them', AAS: 'two pairs of angles and a side beside them',
        HL: 'the hypotenuse and one leg of two right triangles' };
      var f = four(rnd, about[c], Object.keys(about).filter(function (x) { return x !== c; }).map(function (x) { return about[x]; }));
      return mc('Which pieces of information does <b>' + c + '</b> compare?', f.choices, f.answer,
        c + ' uses ' + about[c] + '.');
    })
  ];

  /* ================================================================ 2.2.4 Deciding similarity ---- */
  var L224 = [
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 2, 6), b = ri(rnd, 3, 7), c = ri(rnd, 4, 8);
      return mc('One triangle has sides ' + a + ', ' + b + ', ' + c + '. Another has sides ' + (a * k) + ', ' +
        (b * k) + ', ' + (c * k) + '. Are they similar?',
        ['Yes, by SSS~ — every ratio is ' + k, 'No — the sides are different lengths',
         'Yes, but only if they are right triangles', 'There is not enough information'], 0,
        'Each pair of sides is in the ratio ' + k + ' : 1, so SSS~ applies.');
    }),
    gen(function (rnd) {
      var a = ri(rnd, 2, 6), b = ri(rnd, 3, 7), k = ri(rnd, 2, 4), off = ri(rnd, 1, 3);
      return mc('One triangle has sides ' + a + ' and ' + b + '. Another has ' + (a * k) + ' and ' + (b * k + off) +
        '. Are these two pairs in the same ratio?',
        ['No — ' + (a * k) + ' ÷ ' + a + ' = ' + k + ' but ' + (b * k + off) + ' ÷ ' + b + ' is not ' + k,
         'Yes — both are ' + k, 'Yes — every triangle is similar to every other',
         'There is not enough information'], 0,
        'The ratios have to match exactly. ' + (b * k + off) + ' ÷ ' + b + ' is not ' + k + ', so they are not.');
    }),
    mc('Two triangles are similar. What can you say about their <b>perimeters</b>?',
      ['They are in the same ratio as the sides', 'They are equal',
       'They are in the square of the ratio of the sides', 'Nothing at all'], 0,
      'A perimeter is a sum of lengths, so it scales exactly as the lengths do.'),
    mc('A triangle is enlarged by a scale factor of 1/2. What happens to its angles?',
      ['They stay the same', 'They are halved', 'They are doubled', 'They become right angles'], 0,
      'Scaling changes lengths, never angles. That is what makes the figures similar.'),
    gen(function (rnd) {
      var a = ri(rnd, 2, 6), k = ri(rnd, 2, 4);
      /* the wrong options have to be numbers that are not the scale factor, whatever a and k came out as */
      var f = four(rnd, k, [k + 1, k + 2, k - 1, a, a + k, 1].filter(function (v) { return v !== k && v > 0; }), String);
      return mc('Two triangles have sides ' + a + ', ' + (a + 1) + ', ' + (a + 2) + ' and ' + (a * k) + ', ' +
        ((a + 1) * k) + ', ' + ((a + 2) * k) + '. What is the scale factor?', f.choices, f.answer,
        'Divide any pair of matching sides: ' + (a * k) + ' ÷ ' + a + ' = ' + k + '.');
    }),
    mc('Two triangles are similar with scale factor 3. One has area 5 cm². What is the area of the other?',
      ['45 cm²', '15 cm²', '8 cm²', '5 cm²'], 0,
      'Area is multiplied by 3² = 9, so 5 × 9 = 45 cm².'),
    mc('Two triangles have angles 50°, 60°, 70° and 50°, 60°, 70°. What can you say?',
      ['They are similar, but not necessarily congruent', 'They are congruent',
       'They have the same area', 'Nothing at all'], 0,
      'Equal angles give similarity. Without a side in common, the sizes are still free.'),
    mc('A triangle has sides 3, 4, 5. Which of these is similar to it?',
      ['9, 12, 15', '4, 5, 6', '6, 8, 11', '3, 4, 6'], 0,
      'Each side is tripled, so every ratio is 3 : 1.'),
    mc('Which pair of triangles is <b>not</b> similar?',
      ['2, 3, 4 and 4, 6, 9', '2, 3, 4 and 4, 6, 8', '3, 4, 5 and 6, 8, 10', '5, 12, 13 and 10, 24, 26'], 0,
      '4 ÷ 2 = 2 and 6 ÷ 3 = 2, but 9 ÷ 4 is not 2, so the ratios do not all match.'),
    mc('Is every pair of similar triangles also a pair of congruent triangles?',
      ['No — only when the scale factor is 1', 'Yes, always', 'Yes, if they are right triangles', 'No, never'], 0,
      'Congruence is similarity with scale factor 1.')
  ];

  /* ================================================================ 2.3.1 Quadrilaterals on a grid ---- */
  var L231 = [
    gen(function (rnd) {
      var x1 = ri(rnd, -6, 2), y1 = ri(rnd, -6, 2), dx = ri(rnd, 2, 7), dy = ri(rnd, 2, 7);
      return num('A rectangle has corners (' + x1 + ', ' + y1 + '), (' + (x1 + dx) + ', ' + y1 + '), (' +
        (x1 + dx) + ', ' + (y1 + dy) + ') and (' + x1 + ', ' + (y1 + dy) + '). What is its area?', dx * dy, null,
        'It is ' + dx + ' across and ' + dy + ' up, so the area is ' + dx + ' × ' + dy + ' = ' + (dx * dy) + '.');
    }),
    gen(function (rnd) {
      var t = pick(rnd, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
      var x1 = ri(rnd, -5, 3), y1 = ri(rnd, -5, 3);
      return num('How long is the segment from (' + x1 + ', ' + y1 + ') to (' + (x1 + t[0]) + ', ' + (y1 + t[1]) + ')?',
        t[2], null, 'It goes ' + t[0] + ' across and ' + t[1] + ' up, so its length is √(' + t[0] + '² + ' + t[1] + '²) = ' + t[2] + '.');
    }),
    gen(function (rnd) {
      var x1 = ri(rnd, -6, 2), y1 = ri(rnd, -6, 2), dx = ri(rnd, 2, 6), dy = ri(rnd, 2, 6);
      return txt('What is the midpoint of the segment from (' + x1 + ', ' + y1 + ') to (' + (x1 + dx * 2) + ', ' + (y1 + dy * 2) + ')?',
        '(' + (x1 + dx) + ', ' + (y1 + dy) + ')', [(x1 + dx) + ',' + (y1 + dy)],
        'Average the x values and average the y values.');
    }),
    mc('Two sides of a quadrilateral on a grid have the same slope. What does that show?',
      ['They are parallel', 'They are perpendicular', 'They are equal in length', 'They meet at a right angle'], 0,
      'Equal slopes mean the lines never meet: they are parallel.'),
    mc('Two segments have slopes 2 and −1/2. What does that show?',
      ['They are perpendicular', 'They are parallel', 'They are equal in length', 'Nothing in particular'], 0,
      'Slopes that multiply to −1 meet at a right angle. 2 × (−1/2) = −1.'),
    gen(function (rnd) {
      var x1 = ri(rnd, -6, 3), y1 = ri(rnd, -6, 3), dx = ri(rnd, 1, 6), dy = ri(rnd, 1, 6);
      return txt('What is the slope of the line through (' + x1 + ', ' + y1 + ') and (' + (x1 + dx) + ', ' + (y1 + dy) + ')?',
        frac(dy, dx), [String(Math.round(dy / dx * 1000) / 1000)],
        'Slope is rise over run: ' + dy + '/' + dx + ' = ' + frac(dy, dx) + '.');
    }),
    gen(function (rnd) {
      var x1 = ri(rnd, -6, 3), y1 = ri(rnd, -6, 3), d = ri(rnd, 2, 8);
      return num('How long is the segment from (' + x1 + ', ' + y1 + ') to (' + (x1 + d) + ', ' + y1 + ')?', d, null,
        'The y values are the same, so just count along: ' + (x1 + d) + ' − ' + x1 + ' = ' + d + '.');
    }),
    mc('Two sides of a quadrilateral have slopes 3 and 3. What does that tell you?',
      ['Those sides are parallel', 'Those sides are equal in length',
       'The quadrilateral is a square', 'Those sides meet at a right angle'], 0,
      'Equal slopes mean parallel. It says nothing about their lengths.'),
    mc('A segment goes 3 across and 4 up. How long is it?',
      ['5', '7', '12', '25'], 0,
      '√(3² + 4²) = √25 = 5. It is the 3-4-5 triangle.'),
    mc('Which formula gives the midpoint of a segment?',
      ['Average the x values and average the y values', 'Subtract the x values and the y values',
       'Add the x values and the y values', 'Multiply the x values and the y values'], 0,
      'The midpoint is halfway along in each direction, which is the average of each coordinate.')
  ];

  /* ================================================================ 2.3.2 Naming a quadrilateral ---- */
  var L232 = [
    mc('A quadrilateral has both pairs of opposite sides parallel, and all four sides equal, but no right angles. What is it?',
      ['A rhombus', 'A square', 'A rectangle', 'A trapezoid'], 0,
      'Four equal sides with opposite sides parallel is a rhombus; the right angles would make it a square.'),
    mc('A quadrilateral has exactly one pair of parallel sides. What is it?',
      ['A trapezoid', 'A parallelogram', 'A rhombus', 'A kite'], 0,
      'Exactly one pair parallel is the definition of a trapezoid.'),
    mc('On a grid, both pairs of opposite sides of a quadrilateral have equal slopes and equal lengths, and one corner is a right angle. What is it?',
      ['A rectangle', 'A parallelogram but not a rectangle', 'A rhombus', 'A trapezoid'], 0,
      'Opposite sides parallel and equal make a parallelogram; one right angle makes all four right angles, so it is a rectangle.'),
    mc('Which of these is always a parallelogram?',
      ['A rhombus', 'A trapezoid', 'A kite', 'Any quadrilateral'], 0,
      'A rhombus has both pairs of opposite sides parallel, so it is a parallelogram with four equal sides.'),
    mc('The diagonals of a quadrilateral bisect each other. What must it be?',
      ['A parallelogram', 'A trapezoid', 'A kite', 'A square'], 0,
      'Diagonals that cut each other in half is one of the tests for a parallelogram.'),
    gen(function (rnd) {
      var s = ri(rnd, 2, 7);
      return num('A square on a grid has corners (0, 0), (' + s + ', 0), (' + s + ', ' + s + ') and (0, ' + s +
        '). What is its perimeter?', 4 * s, null, 'Each side is ' + s + ' long, so the perimeter is 4 × ' + s + ' = ' + (4 * s) + '.');
    }),
    mc('A quadrilateral has four right angles but its sides are not all equal. What is it?',
      ['A rectangle', 'A square', 'A rhombus', 'A trapezoid'], 0,
      'Four right angles make it a rectangle; equal sides as well would make it a square.'),
    mc('Which quadrilateral has two pairs of equal sides next to each other, but opposite sides not parallel?',
      ['A kite', 'A parallelogram', 'A rectangle', 'A trapezoid'], 0,
      'A kite has two pairs of adjacent equal sides.'),
    mc('The diagonals of which quadrilateral are always equal <b>and</b> bisect each other?',
      ['A rectangle', 'A rhombus', 'A kite', 'A trapezoid'], 0,
      'In a rectangle the diagonals are the same length and cut each other in half.'),
    mc('The diagonals of which quadrilateral always meet at right angles?',
      ['A rhombus', 'A rectangle', 'A trapezoid', 'Any parallelogram'], 0,
      'The diagonals of a rhombus are perpendicular.'),
    mc('Every square is also:',
      ['A rectangle and a rhombus', 'A trapezoid only', 'A kite but not a parallelogram', 'None of these'], 0,
      'It has four right angles like a rectangle and four equal sides like a rhombus.'),
    gen(function (rnd) {
      var kinds = [
        { has: 'both pairs of opposite sides parallel', is: 'a parallelogram' },
        { has: 'four equal sides and four right angles', is: 'a square' },
        { has: 'four right angles', is: 'a rectangle' },
        { has: 'exactly one pair of parallel sides', is: 'a trapezoid' }
      ];
      var c = pick(rnd, kinds);
      var f = four(rnd, c.is, kinds.filter(function (x) { return x.is !== c.is; }).map(function (x) { return x.is; }));
      return mc('A quadrilateral has ' + c.has + '. What is it?', f.choices, f.answer,
        'That is the definition of ' + c.is + '.');
    })
  ];

  /* ================================================================ 2.3.3 Similar figures on a grid ---- */
  var L233 = [
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), x = ri(rnd, 1, 6), y = ri(rnd, 1, 6);
      return txt('The point (' + x + ', ' + y + ') is enlarged from the origin by a scale factor of ' + k +
        '. Where does it land?', '(' + (x * k) + ', ' + (y * k) + ')', [(x * k) + ',' + (y * k)],
        'Multiply both coordinates by ' + k + '.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 2, 6), b = ri(rnd, 2, 6);
      return num('A rectangle ' + a + ' by ' + b + ' is enlarged from the origin by a scale factor of ' + k +
        '. What is the area of the image?', a * b * k * k, null,
        'Both sides grow by ' + k + ', so the area grows by ' + k + '² = ' + (k * k) + ': ' + (a * b) + ' × ' + (k * k) + ' = ' + (a * b * k * k) + '.');
    }),
    mc('A figure is enlarged from the origin by a scale factor of 2. What happens to the slope of each side?',
      ['It stays the same', 'It doubles', 'It halves', 'It becomes negative'], 0,
      'Both the rise and the run double, so the slope is unchanged. That is why the image is similar to the original.'),
    mc('A shape is enlarged by a scale factor of 1/3. Is the image similar to the original?',
      ['Yes — similar figures can be smaller as well as larger', 'No — it must get bigger to be similar',
       'Only if the scale factor is a whole number', 'Only if the shape is a triangle'], 0,
      'Any scale factor other than zero gives a similar figure; a fraction shrinks it.'),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), x = ri(rnd, 1, 6), y = ri(rnd, 1, 6);
      return txt('The point (' + (x * k) + ', ' + (y * k) + ') is the image of a point enlarged from the origin by a scale factor of ' +
        k + '. What was the original point?', '(' + x + ', ' + y + ')', [x + ',' + y],
        'Divide both coordinates by ' + k + '.');
    }),
    gen(function (rnd) {
      var k = ri(rnd, 2, 4), a = ri(rnd, 2, 7), b = ri(rnd, 2, 7);
      return num('A rectangle ' + a + ' by ' + b + ' is enlarged from the origin by a scale factor of ' + k +
        '. What is the perimeter of the image?', 2 * (a + b) * k, null,
        'Every side is multiplied by ' + k + ', so the perimeter is 2(' + a + ' + ' + b + ') × ' + k + ' = ' + (2 * (a + b) * k) + '.');
    }),
    gen(function (rnd) {
      var x = ri(rnd, 1, 6), y = ri(rnd, 1, 6);
      return txt('The point (' + x + ', ' + y + ') is enlarged from the origin by a scale factor of 1/2. Where does it land?',
        '(' + frac(x, 2) + ', ' + frac(y, 2) + ')', [frac(x, 2) + ',' + frac(y, 2), (x / 2) + ', ' + (y / 2), (x / 2) + ',' + (y / 2)],
        'Halve both coordinates.');
    }),
    mc('A triangle is enlarged from the origin by a scale factor of 3. What happens to the length of each side?',
      ['Each is 3 times as long', 'Each is 9 times as long', 'Each stays the same', 'Each is a third as long'], 0,
      'Lengths scale by the factor; it is the area that scales by its square.'),
    mc('Which point stays exactly where it is when a figure is enlarged from the origin?',
      ['The origin itself', 'The topmost point', 'The centre of the figure', 'None of them'], 0,
      'The centre of the enlargement never moves, and here that is the origin.'),
    mc('A shape is enlarged by a scale factor of −1 from the origin. What happens?',
      ['It is rotated 180° about the origin', 'It stays where it is', 'It is reflected in the x-axis only',
       'It becomes three times as large'], 0,
      'Multiplying both coordinates by −1 sends (x, y) to (−x, −y), which is a half turn.')
  ];

  var CH2 = [
    { id: '2.1.1', title: 'Similarity', focus: ['What similar means', 'Scale factor'], questions: L211 },
    { id: '2.1.2', title: 'Ratios in Similar Figures', focus: ['Side ratios', 'Perimeter and area'], questions: L212 },
    { id: '2.1.3', title: 'Using Ratios of Similarity', focus: ['Finding a missing side', 'Shadow problems'], questions: L213 },
    { id: '2.1.4', title: 'Similarity Notation', focus: ['~ and ≅', 'Corresponding parts'], questions: L214 },
    { id: '2.2.1', title: 'Conditions for Triangle Similarity', focus: ['AA~', 'SSS~', 'SAS~'], questions: L221 },
    { id: '2.2.2', title: 'Flowcharts and Justification', focus: ['Statements and reasons', 'What follows from what'], questions: L222 },
    { id: '2.2.3', title: 'Triangle Congruence', focus: ['SSS, SAS, ASA, AAS, HL', 'Why SSA fails'], questions: L223 },
    { id: '2.2.4', title: 'Determining Similarity', focus: ['Checking every ratio', 'What scaling does not change'], questions: L224 },
    { id: '2.3.1', title: 'Quadrilaterals on a Coordinate Grid', focus: ['Length and midpoint', 'Parallel and perpendicular'], questions: L231 },
    { id: '2.3.2', title: 'Naming a Quadrilateral', focus: ['Rhombus, rectangle, trapezoid', 'Tests from the diagonals'], questions: L232 },
    { id: '2.3.3', title: 'Similar Figures on a Grid', focus: ['Enlarging from the origin', 'What happens to area'], questions: L233 }
  ];
  CH2.forEach(function (l) { l.chapter = 2; l.chapterTitle = 'Justification and Similarity'; });
  BANK.lessons.push.apply(BANK.lessons, CH2);
  BANK.chapters = [
    { chapter: 1, title: BANK.title || 'Exploring Algebraic and Geometric Relationships' },
    { chapter: 2, title: 'Justification and Similarity' }
  ];
})();
