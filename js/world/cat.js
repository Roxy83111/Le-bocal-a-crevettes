/*
 * Le chat de la maison (low poly) : de temps en temps, il saute sur le plan de travail au fond de la cuisine,
 * s'assoit face au bocal, fixe les crevettes en remuant la queue, miaule… puis repart.
 * Les crevettes libres paniquent et s'éloignent de son côté.
 */
'use strict';

const CAT_COATS = [
  { name: 'roux', fur: '#e8913a', dark: '#b8621f', light: '#fff1e0' },
  { name: 'noir', fur: '#2b2b30', dark: '#18181b', light: '#3c3c44' },
  { name: 'gris', fur: '#8d99ae', dark: '#5c677d', light: '#e9ecef' },
  { name: 'blanc', fur: '#f1f1ee', dark: '#d6d6cf', light: '#ffffff' },
];
const CAT_NAMES = ['Moustache le chat', 'Pacha', 'Gribouille', 'Câlin', 'Tigrou', 'Monsieur Patate'];
const CAT_SCALE = 2.2;

function buildCat(coat) {
  const root = new THREE.Group(),
    body = new THREE.Group();
  root.add(body);
  const fur = K(coat.fur, { roughness: 0.9 }),
    dark = K(coat.dark, { roughness: 0.9 }),
    light = K(coat.light, { roughness: 0.9 }),
    pink = K('#f4a3b4');
  // Corps (la tête est vers +z)
  part(body, jitter(Ico(1, 1), 0.06), fur, [0, 3.2, 0], [1.5, 1.35, 3]);
  part(body, jitter(Ico(0.9, 0), 0.05), light, [0, 3.1, 2], [1.1, 1.1, 1]);
  for (let i = 0; i < 3; i++)
    part(body, Box(2.6, 0.25, 0.5), dark, [0, 4.4, -1.2 + i * 1.1], [1, 1, 1], [0.15, 0, 0]);
  // Tête
  const head = new THREE.Group();
  head.position.set(0, 4.7, 2.9);
  body.add(head);
  part(head, jitter(Ico(1.25, 1), 0.05), fur, [0, 0, 0], [1.15, 0.95, 1]);
  part(head, Ico(0.6, 0), light, [0, -0.35, 0.85], [1.2, 0.8, 0.8]);
  for (const s of [-1, 1]) {
    part(head, Cone(0.48, 0.95, 4), fur, [s * 0.7, 1.05, -0.1], null, [0, 0, -s * 0.25]);
    part(head, Cone(0.25, 0.55, 4), pink, [s * 0.68, 0.98, 0.08], null, [0, 0, -s * 0.25]);
    part(head, Ico(0.22, 1), K('#9be564', { emissive: '#9be564', emissiveIntensity: 0.4 }), [
      s * 0.47,
      0.22,
      1.05,
    ]);
    part(head, Box(0.07, 0.3, 0.05), K('#111'), [s * 0.47, 0.22, 1.25]);
    for (const k of [-1, 1])
      part(head, Cyl(0.015, 0.015, 1.5, 3), K('#ffffff'), [s * 0.9, -0.3 + k * 0.08, 1.0], null, [
        0,
        0,
        Math.PI / 2 + k * 0.15 * s,
      ]);
  }
  part(head, Cone(0.15, 0.2, 3), pink, [0, -0.15, 1.25], null, [Math.PI / 2 + Math.PI, 0, 0]);
  // Pattes (pivot à la hanche)
  const legs = [];
  for (const [x, z] of [
    [-0.75, 1.9],
    [0.75, 1.9],
    [-0.75, -1.9],
    [0.75, -1.9],
  ]) {
    const p = new THREE.Group();
    p.position.set(x, 2.6, z);
    const g = Cyl(0.32, 0.26, 2.6, 5);
    g.translate(0, -1.3, 0);
    p.add(mk(g, fur));
    part(p, Ico(0.34, 0), light, [0, -2.55, 0.12], [1, 0.6, 1.3]);
    body.add(p);
    legs.push(p);
  }
  // Queue en segments
  const tail = [];
  let parent = body;
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Group();
    p.position.set(0, i ? 0.75 : 3.6, i ? 0 : -2.9);
    if (!i) p.rotation.x = -0.9;
    const g = Cyl(0.24 - i * 0.02, 0.28 - i * 0.02, 0.8, 5);
    g.translate(0, 0.4, 0);
    p.add(mk(g, i > 4 ? dark : fur));
    parent.add(p);
    tail.push(p);
    parent = p;
  }
  root.scale.setScalar(CAT_SCALE);
  root.traverse(o => {
    if (o.isMesh) o.castShadow = false;
  });
  return { root, body, head, legs, tail };
}

const Cat = {
  model: null,
  state: 'away', // away → jump → walk → sit → leave → down
  t: 0,
  nextIn: rnd(45, 80),
  x: 0,
  y: 0,
  name: '',
};

// Le chat apparaît (appelable à la main depuis la console : catVisit()).
function catVisit() {
  if (Cat.state !== 'away') return;
  if (Cat.model) {
    kitchen.remove(Cat.model.root);
    disposeObj(Cat.model.root);
  }
  const coat = pick(CAT_COATS);
  Cat.model = buildCat(coat);
  Cat.name = pick(CAT_NAMES);
  kitchen.add(Cat.model.root);
  Cat.state = 'jump';
  Cat.t = 0;
  Cat.x = 40;
  Cat.y = ROOM.floor;
  Cat.stopX = rnd(-6, 6);
  log(`🐈 ${Cat.name} (chat ${coat.name}) saute sur le plan de travail…`, 'decor');
  Hooks.emit('cat:visit', Cat);
}

Hooks.on('tick', dt => {
  if (Cat.state === 'away') {
    Cat.nextIn -= dt;
    if (Cat.nextIn <= 0) catVisit();
    return;
  }
  const m = Cat.model,
    root = m.root,
    t = (Cat.t += dt);
  const z = COUNTER.z + 1,
    top = COUNTER.top;
  const walk = speed => {
    const ph = simTime * 7;
    m.legs.forEach(
      (l, i) => (l.rotation.x = Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.5 * speed),
    );
    m.body.position.y = Math.abs(Math.sin(ph)) * 0.08 * speed;
  };
  // Queue qui ondule en permanence
  m.tail.forEach((p, i) => {
    if (i) p.rotation.z = Math.sin(simTime * 2.5 - i * 0.6) * (Cat.state === 'sit' ? 0.35 : 0.18);
  });
  if (Cat.state === 'jump') {
    // Saut du sol jusqu'au plan de travail
    const u = Math.min(1, t / 0.9);
    Cat.y = ROOM.floor + (top - ROOM.floor) * u + Math.sin(u * Math.PI) * 6;
    root.position.set(Cat.x, Cat.y, z);
    root.rotation.y = -Math.PI / 2;
    m.body.rotation.x = -0.4 * Math.sin(u * Math.PI);
    if (u >= 1) {
      Cat.state = 'walk';
      Cat.t = 0;
      m.body.rotation.x = 0;
    }
  } else if (Cat.state === 'walk') {
    Cat.x -= dt * 7;
    root.position.set(Cat.x, top, z);
    walk(1);
    if (Cat.x <= Cat.stopX) {
      Cat.state = 'sit';
      Cat.t = 0;
    }
  } else if (Cat.state === 'sit') {
    // Il se tourne vers le bocal, s'assoit et fixe les crevettes.
    root.rotation.y += (0 - root.rotation.y) * (1 - Math.exp(-dt * 3));
    m.body.rotation.x += (-0.5 - m.body.rotation.x) * (1 - Math.exp(-dt * 3));
    m.legs[2].rotation.x = m.legs[3].rotation.x = 1.2;
    m.legs[0].rotation.x = m.legs[1].rotation.x = 0.5;
    m.body.position.y = -0.9;
    const look = shrimps.length ? shrimps[Math.floor(simTime / 2) % shrimps.length].pos : V(0, 5, 0);
    m.head.rotation.y = clamp((look.x - Cat.x) * 0.04, -0.6, 0.6);
    m.head.rotation.x = 0.35 + Math.sin(simTime * 0.7) * 0.05;
    at(Cat, t, 1.2, () => {
      speakAt(() => m.head.getWorldPosition(V()).add(V(0, 6, 0)), 'Miaou…', 2.2);
      Sound.meow();
      shrimps.forEach(s => {
        if (s.busy) return;
        if (Math.random() < 0.5)
          s.say(pick(['😱 LE CHAT !', 'Ne bouge plus…', 'Il nous regarde !', 'Cachez-vous !']), 1.8);
        s.goTo(V(s.pos.x * 0.5, rnd(2, 5), rnd(3, 6)), 2.2);
        s.wanderT = 4;
      });
    });
    at(Cat, t, 4, () => (m.head.rotation.z = 0.3));
    at(Cat, t, 5.5, () => {
      m.head.rotation.z = 0;
      speakAt(
        () => m.head.getWorldPosition(V()).add(V(0, 6, 0)),
        pick(['…sushi.', 'Miaaaou.', '*se lèche la patte*', 'Un jour…']),
        2,
      );
      Sound.meow();
    });
    if (t > 7.5) {
      Cat.state = 'leave';
      Cat.t = 0;
      m.body.position.y = 0;
    }
  } else if (Cat.state === 'leave') {
    root.rotation.y += (-Math.PI / 2 - root.rotation.y) * (1 - Math.exp(-dt * 4));
    m.body.rotation.x += (0 - m.body.rotation.x) * (1 - Math.exp(-dt * 4));
    m.head.rotation.set(0, 0, 0);
    if (t > 0.6) {
      Cat.x -= dt * 8;
      walk(1.1);
    }
    root.position.set(Cat.x, top, z);
    if (Cat.x < -32) {
      Cat.state = 'down';
      Cat.t = 0;
    }
  } else if (Cat.state === 'down') {
    // Il saute du plan de travail et disparaît derrière.
    const u = Math.min(1, t / 0.7);
    root.position.set(Cat.x - u * 5, top + Math.sin(u * Math.PI) * 3 - u * u * (top - ROOM.floor), z + u * 6);
    if (u >= 1) {
      Cat.state = 'away';
      Cat.nextIn = rnd(80, 150);
      kitchen.remove(root);
      disposeObj(root);
      Cat.model = null;
      Object.keys(Cat).forEach(k => k.startsWith('@') && delete Cat[k]);
    }
  }
});
// `at()` range ses repères dans A.data : on en donne un au chat.
Cat.data = Cat;
