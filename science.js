/* science.js — science questions for the Practice Hub, generated on the device.
   Works in the browser (window.SCI) and in Node (require('./science.js')). No dependencies, no modules.
   API: SCI.TOPICS, SCI.generate(opts), SCI.checkAnswer(problem, typed), SCI.BANDS

   Most questions here are pick-one, and they carry their own options: a wrong option for "which phase
   comes next" has to be another phase, and only the topic knows what those are. Where a question is a
   calculation the answer is a number and the options are built from it.
   Everything is rebuilt from the seed, so a round can be asked again from {seed, topics, count}. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SCI = factory();
})(this, function () {
  'use strict';

  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function shuffle(r, arr) { var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /** A question whose options are named here: the answer plus up to three others of the same kind. */
  function MC(r, question, answer, others, why) {
    var wrong = shuffle(r, others.filter(function (o) { return String(o) !== String(answer); })).slice(0, 3);
    return { question: question, answer: String(answer), choices: shuffle(r, wrong.concat([String(answer)])), accept: [], work: why || '' };
  }
  function P(question, answer, accept, why) { return { question: question, answer: String(answer), choices: null, accept: accept || [], work: why || '' }; }

  /* ---------------------------------------------------------------- the sky */
  var PHASES = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous',
    'full moon', 'waning gibbous', 'third quarter', 'waning crescent'];
  var PLANETS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  var PLANET_FACTS = {
    Mercury: { order: 1, moons: 0, note: 'the smallest planet and the closest to the Sun' },
    Venus:   { order: 2, moons: 0, note: 'the hottest planet, wrapped in thick carbon dioxide' },
    Earth:   { order: 3, moons: 1, note: 'the only one known to have life' },
    Mars:    { order: 4, moons: 2, note: 'the red planet, rusted by iron in its dust' },
    Jupiter: { order: 5, moons: 95, note: 'the largest planet, with a storm bigger than Earth' },
    Saturn:  { order: 6, moons: 146, note: 'the one with the brightest rings' },
    Uranus:  { order: 7, moons: 28, note: 'tipped on its side, so it rolls around its orbit' },
    Neptune: { order: 8, moons: 16, note: 'the windiest planet, and the furthest from the Sun' }
  };

  var TOPICS = [
    { id: 'moon', name: 'Phases of the Moon', unit: 'Space', band: '4-8',
      description: 'The order of the phases, what makes them, and which way the lit part faces.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 4 : 6);
        var i = ri(r, 0, 7);
        if (k === 1) return MC(r, 'Which phase of the Moon comes straight after <b>' + PHASES[i] + '</b>?',
          PHASES[(i + 1) % 8], PHASES, 'the cycle runs new → crescent → quarter → gibbous → full, then back again');
        if (k === 2) return MC(r, 'Which phase comes straight before <b>' + PHASES[i] + '</b>?',
          PHASES[(i + 7) % 8], PHASES, '');
        if (k === 3) return MC(r, 'What causes the phases of the Moon?',
          'we see different amounts of its lit half as it orbits',
          ['Earth’s shadow falls across the Moon each night', 'clouds cover part of the Moon on most nights', 'the Moon gives out less light at certain times'],
          'half the Moon is always lit by the Sun; the phase is how much of that half faces us');
        if (k === 4) return MC(r, 'A phase between new moon and full moon, getting bigger each night, is called:',
          'waxing', ['waning', 'eclipsing', 'orbiting'], 'waxing means growing, waning means shrinking');
        if (k === 5) return MC(r, 'About how long does the Moon take to go through all its phases?',
          'about 29.5 days', ['about 7 days', 'about 365 days', 'about 24 hours'], 'roughly a month, which is where the word comes from');
        return MC(r, 'At <b>full moon</b>, where is the Moon compared with the Sun and Earth?',
          'Earth is between the Sun and the Moon',
          ['the Moon is between the Sun and Earth', 'the Sun is between Earth and the Moon', 'all three are side by side'],
          'the whole lit half faces us, so the Moon is opposite the Sun');
      } },
    { id: 'solar', name: 'The solar system', unit: 'Space', band: '4-8',
      description: 'The planets in order, what each one is known for, and how they move.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        var p = pick(r, PLANETS), f = PLANET_FACTS[p];
        if (k === 1) return MC(r, 'Which planet is <b>' + ordinal(f.order) + '</b> from the Sun?', p, PLANETS, '');
        if (k === 2) return MC(r, 'Which is ' + f.note + '?', p, PLANETS, '');
        if (k === 3) return MC(r, 'Which planet is <b>closest to the Sun</b>?', 'Mercury', PLANETS, '');
        if (k === 4) return MC(r, 'What is a <b>year</b> on a planet?',
          'the time it takes to go once around the Sun',
          ['the time it takes to spin once', 'the time from sunrise to sunset', 'the time it takes its moon to orbit it'],
          'a day is one spin, a year is one orbit');
        return MC(r, 'Why do the planets stay in orbit around the Sun?',
          'the Sun’s gravity pulls on them',
          ['the solar wind pushes them', 'they are held by Earth’s magnetic field', 'they float because space is empty'],
          'gravity bends their path into an orbit instead of a straight line');
      } },
    { id: 'seasons', name: 'Seasons & day length', unit: 'Space', band: '4-8',
      description: 'Why the seasons happen, and why days are longer in summer.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 4);
        if (k === 1) return MC(r, 'What causes the seasons?',
          'Earth’s tilt points each half toward the Sun in turn',
          ['Earth is closer to the Sun during the summer months', 'the Sun gives out more heat during the summer', 'clouds block more of the sunlight during winter'],
          'the tilt is 23.5°, and it points the same way all year');
        if (k === 2) return MC(r, 'When it is <b>summer</b> in the northern half of the world, what is it in the southern half?',
          'winter', ['summer', 'spring', 'the same as the north'], 'the tilt points one half toward the Sun and the other away');
        if (k === 3) return MC(r, 'On which day is daylight longest in the northern half of the world?',
          'the June solstice', ['the December solstice', 'the March equinox', 'the September equinox'], '');
        return MC(r, 'What happens at an <b>equinox</b>?',
          'day and night are about the same length everywhere',
          ['the day is at its longest', 'the night is at its longest', 'the Sun does not set at all'],
          'the word means "equal night"');
      } },
    { id: 'states', name: 'States of matter', unit: 'Chemistry', band: '4-8',
      description: 'Solids, liquids and gases, and the names for changing between them.',
      gen: function (r, d) {
        var CHANGES = [
          { from: 'solid', to: 'liquid', name: 'melting' },
          { from: 'liquid', to: 'solid', name: 'freezing' },
          { from: 'liquid', to: 'gas', name: 'evaporating' },
          { from: 'gas', to: 'liquid', name: 'condensing' },
          { from: 'solid', to: 'gas', name: 'subliming' }
        ];
        var names = CHANGES.map(function (c) { return c.name; });
        var k = ri(r, 1, d === 1 ? 3 : 4);
        var c = pick(r, CHANGES);
        if (k === 1) return MC(r, 'What is it called when something goes from <b>' + c.from + '</b> to <b>' + c.to + '</b>?',
          c.name, names, '');
        if (k === 2) return MC(r, 'Which state keeps its own shape and its own volume?',
          'solid', ['liquid', 'gas', 'none of them'], 'the particles are locked in place');
        if (k === 3) return MC(r, 'Which state spreads out to fill whatever container it is in?',
          'gas', ['solid', 'liquid', 'none of them'], 'the particles move freely and far apart');
        return MC(r, 'When water boils, what happens to the water particles?',
          'they move faster and spread far apart',
          ['they get bigger', 'they turn into a different substance', 'they stop moving'],
          'boiling changes the state, not the substance');
      } },
    { id: 'water', name: 'The water cycle & weather', unit: 'Earth science', band: '4-8',
      description: 'Where rain comes from, and what the parts of the cycle are called.',
      gen: function (r, d) {
        var STEPS = ['evaporation', 'condensation', 'precipitation', 'collection'];
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What is it called when water rises from a lake as vapour?',
          'evaporation', STEPS, 'the Sun gives the water enough energy to become a gas');
        if (k === 2) return MC(r, 'What is it called when water vapour cools and forms clouds?',
          'condensation', STEPS, '');
        if (k === 3) return MC(r, 'Rain, snow, sleet and hail are all called:',
          'precipitation', STEPS, '');
        if (k === 4) return MC(r, 'What gives the water cycle its energy?',
          'the Sun', ['the wind', 'the Moon', 'the rivers'], '');
        return MC(r, 'Warm air rising and cool air sinking makes:',
          'wind', ['gravity', 'an eclipse', 'an earthquake'], 'air moves from high pressure to low pressure');
      } },
    { id: 'energy', name: 'Energy', unit: 'Physical science', band: '5-8',
      description: 'The forms energy takes, and what happens when it changes.',
      gen: function (r, d) {
        var FORMS = ['kinetic', 'potential', 'thermal', 'chemical', 'electrical', 'light', 'sound'];
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What is the energy of a moving object called?', 'kinetic', FORMS, '');
        if (k === 2) return MC(r, 'A ball held above the ground has which kind of energy?', 'potential', FORMS,
          'stored because of where it is');
        if (k === 3) return MC(r, 'Food and batteries store which kind of energy?', 'chemical', FORMS, '');
        if (k === 4) return MC(r, 'What does the law of conservation of energy say?',
          'energy is never made or destroyed, only changed in form',
          ['energy is used up and gradually runs out', 'energy can be made from nothing when needed', 'energy only ever moves from hot to cold'], '');
        return MC(r, 'As a ball falls, its energy changes from:',
          'potential to kinetic', ['kinetic to potential', 'chemical to light', 'sound to thermal'], '');
      } },
    { id: 'forces', name: 'Forces & motion', unit: 'Physical science', band: '5-8',
      description: 'Speed, gravity, friction, and what a force actually does.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) {
          var dist = ri(r, 2, 40) * 5, time = ri(r, 2, 10);
          return P('A car travels <b>' + (dist * time) + ' m</b> in <b>' + time + ' s</b>. What is its speed, in m/s?',
            String(dist), [dist + ' m/s'], 'speed = distance ÷ time');
        }
        if (k === 2) {
          var sp = ri(r, 2, 30), t2 = ri(r, 2, 12);
          return P('Something moves at <b>' + sp + ' m/s</b> for <b>' + t2 + ' s</b>. How far does it go, in metres?',
            String(sp * t2), [sp * t2 + ' m'], 'distance = speed × time');
        }
        if (k === 3) return MC(r, 'What is the force that slows things down when they rub together?',
          'friction', ['gravity', 'magnetism', 'air pressure'], '');
        if (k === 4) return MC(r, 'What happens to an object when the forces on it are balanced?',
          'it keeps doing what it was already doing',
          ['it speeds up until something stops it', 'it slows down and comes to a stop', 'it changes direction on its own'],
          'balanced forces mean no change in motion');
        return MC(r, 'Why does a heavier object need more force to get it moving?',
          'it has more mass, so it resists changing motion',
          ['gravity is stronger on it, so friction disappears', 'it already contains more energy of its own', 'heavier things are always larger in size'],
          'that resistance is called inertia');
      } },
    { id: 'cells', name: 'Cells & living things', unit: 'Life science', band: '5-8',
      description: 'The parts of a cell, and what tells living things apart.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'Which part of a cell controls what it does and holds its DNA?',
          'the nucleus', ['the cell wall', 'the vacuole', 'the ribosome'], '');
        if (k === 2) return MC(r, 'Which part is found in plant cells but not in animal cells?',
          'the cell wall', ['the nucleus', 'the cell membrane', 'the cytoplasm'], 'plants also have chloroplasts');
        if (k === 3) return MC(r, 'Where does a plant cell make food from sunlight?',
          'the chloroplast', ['the nucleus', 'the vacuole', 'the mitochondrion'], 'that process is photosynthesis');
        if (k === 4) return MC(r, 'Which part releases energy from food in both plant and animal cells?',
          'the mitochondrion', ['the chloroplast', 'the cell wall', 'the nucleus'], '');
        return MC(r, 'What are all living things made of?',
          'cells', ['atoms only', 'tissues only', 'organs only'], '');
      } },
    { id: 'ecosystems', name: 'Food chains & ecosystems', unit: 'Life science', band: '4-8',
      description: 'Who eats whom, where the energy comes from, and how living things fit their homes.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What is an organism that makes its own food called?',
          'a producer', ['a consumer', 'a decomposer', 'a predator'], 'plants are the usual example');
        if (k === 2) return MC(r, 'Where does the energy in a food chain start?',
          'the Sun', ['the soil', 'the water', 'the decomposers'], '');
        if (k === 3) return MC(r, 'What do fungi and bacteria do in an ecosystem?',
          'break down dead things and return nutrients',
          ['make their own food using sunlight', 'hunt and eat other living animals', 'stop plants from taking in water'],
          'they are the decomposers');
        if (k === 4) return MC(r, 'In the chain grass → rabbit → fox, what is the rabbit?',
          'a consumer that eats plants', ['a producer of its own food', 'a decomposer of dead matter', 'the predator at the top'], '');
        return MC(r, 'What usually happens to a population when its food runs short?',
          'it falls', ['it rises', 'it stays exactly the same', 'it turns into another species'], '');
      } },
    { id: 'matter', name: 'Atoms, elements & mixtures', unit: 'Chemistry', band: '6-8',
      description: 'What things are made of, and the difference between a mixture and a compound.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What is the smallest part of an element that is still that element?',
          'an atom', ['a molecule', 'a mixture', 'a compound'], '');
        if (k === 2) return MC(r, 'Water (H₂O) is an example of:',
          'a compound', ['an element', 'a mixture', 'a solution'],
          'the atoms are joined chemically, in a fixed ratio');
        if (k === 3) return MC(r, 'Sand stirred into water is an example of:',
          'a mixture', ['a compound', 'an element', 'a new substance'], 'nothing new is made, and it can be separated again');
        if (k === 4) return MC(r, 'Which particle in an atom has a negative charge?',
          'the electron', ['the proton', 'the neutron', 'the nucleus'], '');
        return MC(r, 'What does the periodic table arrange the elements by?',
          'the number of protons in an atom',
          ['how heavy they feel', 'when they were discovered', 'alphabetical order'], 'that number is the atomic number');
      } },
    { id: 'light', name: 'Light & sound', unit: 'Physical science', band: '5-8',
      description: 'How light and sound travel, and what happens when they meet something.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What is it called when light bounces off a surface?',
          'reflection', ['refraction', 'absorption', 'vibration'], '');
        if (k === 2) return MC(r, 'What is it called when light bends as it passes into water?',
          'refraction', ['reflection', 'absorption', 'conduction'], 'it changes speed, so it changes direction');
        if (k === 3) return MC(r, 'What does sound need in order to travel?',
          'something to travel through, such as air',
          ['an empty space with nothing in it', 'sunlight falling on it', 'a magnet somewhere nearby'], 'that is why there is no sound in space');
        if (k === 4) return MC(r, 'Which travels faster?',
          'light', ['sound', 'they are the same', 'it depends on the colour'], 'which is why lightning is seen before thunder');
        return MC(r, 'A higher-pitched sound has a:',
          'higher frequency', ['lower frequency', 'larger amplitude', 'longer wavelength and lower frequency'], '');
      } },
    { id: 'body', name: 'The human body', unit: 'Life science', band: '5-8',
      description: 'The systems that keep a body going, and which organ does which job.',
      gen: function (r, d) {
        var ORGANS = [
          { organ: 'the heart', job: 'pumps blood around the body', system: 'circulatory' },
          { organ: 'the lungs', job: 'take in oxygen and let out carbon dioxide', system: 'respiratory', many: 1 },
          { organ: 'the stomach', job: 'breaks food down with acid', system: 'digestive' },
          { organ: 'the brain', job: 'controls the body and makes sense of what it feels', system: 'nervous' },
          { organ: 'the skeleton', job: 'holds the body up and protects its organs', system: 'skeletal' },
          { organ: 'the kidneys', job: 'filter waste out of the blood', system: 'excretory', many: 1 }
        ];
        var SYSTEMS = ['circulatory', 'respiratory', 'digestive', 'nervous', 'skeletal', 'muscular', 'excretory'];
        var k = ri(r, 1, d === 1 ? 3 : 5);
        var o = pick(r, ORGANS);
        /* "the lungs" and "the kidneys" are plural, and the question has to agree with them */
        /* quoted as a job rather than conjugated, so one wording fits the singular and the plural */
        if (k === 1) return MC(r, 'Which organ has this job: <b>' + o.job + '</b>?', o.organ,
          ORGANS.map(function (x) { return x.organ; }), '');
        if (k === 2) return MC(r, 'What ' + (o.many ? 'do' : 'does') + ' <b>' + o.organ + '</b> do?', o.job,
          ORGANS.map(function (x) { return x.job; }), '');
        if (k === 3) return MC(r, 'Which system ' + (o.many ? 'do' : 'does') + ' <b>' + o.organ + '</b> belong to?', o.system, SYSTEMS, '');
        if (k === 4) return MC(r, 'Where does oxygen get into the blood?',
          'in the lungs', ['in the stomach', 'in the heart', 'in the kidneys'],
          'blood picks up oxygen in the lungs, then the heart pushes it round');
        return MC(r, 'What do muscles need bones for?',
          'something firm to pull against', ['somewhere to store energy', 'a way to carry blood', 'a place to make food'],
          'a muscle pulls; it cannot push, so it needs a bone to move');
      } },
    { id: 'genes', name: 'Heredity', unit: 'Life science', band: '6-8',
      description: 'Why children look like their parents: traits, DNA, and dominant and recessive.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What carries the instructions for a living thing?',
          'DNA', ['water', 'sunlight', 'oxygen'], 'DNA sits inside the nucleus of nearly every cell');
        if (k === 2) return MC(r, 'What is a <b>trait</b>?',
          'a feature passed from parents, such as eye colour',
          ['a habit picked up from friends', 'a job an organ does', 'a change in the weather'], '');
        if (k === 3) return MC(r, 'A <b>dominant</b> trait is one that:',
          'shows whenever the child inherits even one copy of it',
          ['is always the more common one', 'only shows in the second child', 'changes as a person grows'], '');
        if (k === 4) return MC(r, 'A <b>recessive</b> trait shows when:',
          'both copies inherited are the recessive one',
          ['one copy is inherited', 'neither parent has the trait', 'the child is the eldest'], '');
        return MC(r, 'Two brown-eyed parents have a blue-eyed child. How?',
          'each parent carried a hidden copy of the blue version',
          ['the child inherited nothing from them', 'eye colour is not inherited', 'the trait appeared from nothing'],
          'a recessive copy can be carried without showing');
      } },
    { id: 'electric', name: 'Electricity & magnets', unit: 'Physical science', band: '5-8',
      description: 'Circuits, what carries a current and what does not, and how magnets behave.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What does a circuit need in order to work?',
          'an unbroken loop from the power source and back',
          ['a switch that is open', 'a gap somewhere in the wire', 'two bulbs, never one'], '');
        if (k === 2) return MC(r, 'Which of these lets a current pass through easily?',
          'copper wire', ['a rubber band', 'a glass rod', 'dry wood'], 'metals are conductors; most other things are insulators');
        if (k === 3) return MC(r, 'What happens when two <b>north</b> poles are brought together?',
          'they push each other away', ['they pull together', 'nothing at all', 'one of them turns into a south pole'],
          'like poles repel, opposite poles attract');
        if (k === 4) return MC(r, 'Switching a circuit off does what?',
          'breaks the loop so the current stops',
          ['uses up the last of the current', 'reverses the current', 'turns the wire into an insulator'], '');
        return MC(r, 'Which of these is <b>not</b> attracted to a magnet?',
          'a copper coin', ['an iron nail', 'a steel paperclip', 'a nickel disc'],
          'iron, nickel and cobalt are magnetic; copper is not');
      } },
    { id: 'machines', name: 'Simple machines & work', unit: 'Physical science', band: '4-8',
      description: 'Levers, pulleys, ramps and the rest, and what a machine actually saves you.',
      gen: function (r, d) {
        var MACH = [
          { name: 'a lever', use: 'a crowbar prising a lid off' },
          { name: 'a pulley', use: 'a rope over a wheel lifting a flag' },
          { name: 'an inclined plane', use: 'a ramp up into a van' },
          { name: 'a wedge', use: 'an axe splitting wood' },
          { name: 'a screw', use: 'a bolt turning into a plank' },
          { name: 'a wheel and axle', use: 'a doorknob turning a shaft' }
        ];
        var k = ri(r, 1, d === 1 ? 2 : 4);
        var m = pick(r, MACH);
        if (k === 1) return MC(r, 'Which simple machine is <b>' + m.use + '</b>?', m.name, MACH.map(function (x) { return x.name; }), '');
        if (k === 2) return MC(r, 'What does a simple machine do?',
          'spreads the same job over a longer distance, so less force is needed',
          ['reduces the total amount of work that has to be done', 'makes energy out of nothing at all',
           'removes friction from the job completely'],
          'the work is much the same; the machine spreads it out');
        if (k === 3) return MC(r, 'Why is it easier to push a load up a ramp than to lift it straight up?',
          'the force needed is smaller, but it acts over a longer distance',
          ['the load weighs less on a ramp', 'gravity does not act on a slope', 'friction pushes it upward'], '');
        return MC(r, 'In science, <b>work</b> is done when:',
          'a force moves something', ['a person feels tired', 'an object is held still', 'a machine is switched on'],
          'holding something still is tiring, but no work is done on it');
      } },
    { id: 'tectonics', name: 'Plates, quakes & volcanoes', unit: 'Earth science', band: '5-8',
      description: 'Why the ground shakes, where mountains come from, and how the continents moved.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What is the Earth’s crust broken into?',
          'plates that move slowly over the mantle',
          ['one single solid shell', 'layers of ice', 'loose sand all the way down'], '');
        if (k === 2) return MC(r, 'What causes most earthquakes?',
          'plates slipping past one another', ['heavy rain', 'the Moon passing overhead', 'the Earth spinning faster'], '');
        if (k === 3) return MC(r, 'What happens where two plates push together?',
          'the land is forced up into mountains',
          ['a deep hole opens up', 'the plates disappear', 'nothing, because they stop moving'], '');
        if (k === 4) return MC(r, 'Why are the same fossils found on coastlines either side of an ocean?',
          'those lands were once joined and have since drifted apart',
          ['the animals swam across the ocean', 'the fossils were carried by wind', 'they formed at the same time by chance'],
          'that evidence is what continental drift was built on');
        return MC(r, 'What is molten rock called once it reaches the surface?',
          'lava', ['magma', 'sediment', 'ore'], 'it is magma underground and lava above');
      } },
    { id: 'method', name: 'Working scientifically', unit: 'Science skills', band: '4-8',
      description: 'Hypotheses, fair tests, what to change and what to keep the same.',
      gen: function (r, d) {
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'What is a <b>hypothesis</b>?',
          'an answer you can test, worked out before the experiment',
          ['the result of an experiment', 'a fact everyone agrees on', 'a question with no answer'], '');
        if (k === 2) return MC(r, 'In a fair test, how many things should be changed at a time?',
          'one', ['two', 'as many as possible', 'none'],
          'change more than one and there is no telling which one mattered');
        if (k === 3) return MC(r, 'What is the <b>control</b> in an experiment?',
          'the one left alone, to compare the others against',
          ['the person running it', 'the measurement taken last', 'the equipment used'], '');
        if (k === 4) return MC(r, 'A plant experiment tests different amounts of water. What should stay the same?',
          'the light, the soil and the kind of plant',
          ['the amount of water', 'nothing at all', 'the day it is measured, only'], '');
        return MC(r, 'What should happen if a result does not match the hypothesis?',
          'the hypothesis is changed to fit what was found',
          ['the result is ignored', 'the experiment is declared a failure', 'the numbers are adjusted'],
          'a result that surprises you is still a result');
      } },
    { id: 'rocks', name: 'Rocks & the Earth', unit: 'Earth science', band: '4-8',
      description: 'The three kinds of rock, how they change, and what shapes the land.',
      gen: function (r, d) {
        var KINDS = ['igneous', 'sedimentary', 'metamorphic'];
        var k = ri(r, 1, d === 1 ? 3 : 5);
        if (k === 1) return MC(r, 'Which kind of rock forms when melted rock cools?', 'igneous', KINDS.concat(['fossilised']), '');
        if (k === 2) return MC(r, 'Which kind forms in layers from bits of older rock?', 'sedimentary', KINDS.concat(['molten']),
          'fossils are usually found in this kind');
        if (k === 3) return MC(r, 'Which kind forms when rock is changed by heat and pressure?', 'metamorphic', KINDS.concat(['eroded']), '');
        if (k === 4) return MC(r, 'What is it called when wind or water carries soil away?',
          'erosion', ['weathering', 'deposition', 'condensation'], 'weathering breaks rock up; erosion moves it');
        return MC(r, 'What are the layers of the Earth, from the outside in?',
          'crust, mantle, outer core, inner core',
          ['mantle, crust, core', 'crust, core, mantle', 'inner core, outer core, crust, mantle'], '');
      } }
  ];
  function ordinal(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  var BANDS = { '4-8': 'Grades 4 to 8', '5-8': 'Grades 5 to 8', '6-8': 'Grades 6 to 8' };
  var BY_ID = {};
  TOPICS.forEach(function (t) { BY_ID[t.id] = t; });

  function normTopics(topics) {
    var list = Array.isArray(topics) ? topics : typeof topics === 'string' ? topics.split(',') : [];
    list = list.map(function (s) { return String(s).trim().toLowerCase(); }).filter(Boolean);
    if (!list.length) return TOPICS.map(function (t) { return t.id; });
    list.forEach(function (id) { if (!BY_ID[id]) throw new Error('Unknown topic "' + id + '". Known topics: ' + TOPICS.map(function (t) { return t.id; }).join(', ')); });
    return TOPICS.map(function (t) { return t.id; }).filter(function (id) { return list.indexOf(id) >= 0; });
  }
  function generate(opts) {
    opts = opts || {};
    var topics = normTopics(opts.topics);
    var rawCount = (opts.count == null || opts.count === '') ? 10 : Number(opts.count);
    var count = isFinite(rawCount) ? Math.min(60, Math.max(1, Math.round(rawCount))) : 10;
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
        do { p = BY_ID[id].gen(r, difficulty); tries++; } while (seen[p.question] && tries < 200);
        seen[p.question] = true;
        problems.push({ id: '', topic: id, topicName: BY_ID[id].name, question: p.question, answer: p.answer,
          choices: p.choices, accept: p.accept, work: p.work });
      }
    });
    shuffle(r, problems);
    problems.forEach(function (p, i) { p.id = 'q' + (i + 1); });
    return { seed: seed, difficulty: difficulty, topics: topics, count: count, problems: problems };
  }

  function norm(s) {
    return String(s == null ? '' : s).replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .toLowerCase().replace(/[.,;:!?"'’“”]/g, ' ')
      .replace(/\b(the|a|an|of|is|are|it|its)\b/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function checkAnswer(p, typed) {
    if (!p || typed == null) return false;
    var t = norm(typed); if (!t) return false;
    var cands = [p.answer].concat(Array.isArray(p.accept) ? p.accept : []);
    for (var i = 0; i < cands.length; i++) { var a = norm(cands[i]); if (a && a === t) return true; }
    return false;
  }

  return { TOPICS: TOPICS, BANDS: BANDS, topic: function (id) { return BY_ID[id] || null; },
    generate: generate, checkAnswer: checkAnswer, normalise: norm, rng: rng };
});
