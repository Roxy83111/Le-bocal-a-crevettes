/*
 * Anniversaire : tout le monde chante autour d'un gâteau, la crevette fêtée souffle les bougies
 * et reçoit des cadeaux (souvent discutables).
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makeCake(candles) {
  const g = new THREE.Group();
  part(g, Cyl(1, 1.05, 0.5, 10), M('#f4a261'), [0, 0.25, 0]);
  part(g, Cyl(1.02, 1.02, 0.12, 10), M('#ff8fab'), [0, 0.52, 0]);
  part(g, Cyl(0.7, 0.75, 0.4, 10), M('#f4a261'), [0, 0.78, 0]);
  part(g, Cyl(0.72, 0.72, 0.1, 10), M('#ffffff'), [0, 0.99, 0]);
  const flames = [];
  for (let i = 0; i < candles; i++) {
    const a = (i / candles) * Math.PI * 2;
    part(g, Cyl(0.04, 0.04, 0.35, 5), M(pick(['#3a86ff', '#ff006e', '#ffd23f', '#06d6a0'])), [
      Math.cos(a) * 0.45,
      1.2,
      Math.sin(a) * 0.45,
    ]);
    flames.push(
      part(g, Cone(0.06, 0.16, 5), E('#ffb703', 1.2), [Math.cos(a) * 0.45, 1.46, Math.sin(a) * 0.45]),
    );
  }
  for (let i = 0; i < 6; i++) part(g, Ico(0.08), M('#d00000'), [rnd(-0.6, 0.6), 1.06, rnd(-0.6, 0.6)]);
  g.userData.flames = flames;
  return g;
}
const GIFTS = [
  'un caillou très spécial',
  'une bulle (déjà éclatée)',
  'un granulé emballé dans une algue',
  'un coquillage d’occasion',
  'une carte « Bonne mue ! »',
  'un poster de homard dédicacé',
];

GROUPS.push({
  id: 'anniversaire',
  label: 'Anniversaire',
  min: 6,
  max: 12,
  status: 'fête un anniversaire',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const [hero, ...guests] = A.m;
    const age = rint(2, 7);
    const cake = A.prop(makeCake(age));
    cake.position.set(0, 1.1, 0);
    Object.assign(A.data, { hero, guests, age, cake });
    hero.goTo(V(0, 3.4, 1.7), 1.4);
    hero.faceObj = V(0, 2.6, 0);
    hero.status = 'fête son anniversaire';
    hero.addTemp(makeHat('cotillon'));
    guests.forEach((s, i) => {
      const a = Math.PI * 0.75 + (i / Math.max(1, guests.length - 1)) * Math.PI * 1.5;
      s.goTo(V(Math.cos(a) * 3, 2.5 + (i % 2) * 0.6, Math.sin(a) * 3 - 0.4), 1.5);
      s.faceObj = V(0, 2.5, 0);
    });
    log(`🎂 C’est l’anniversaire de ${hero.name} : ${age} mues aujourd’hui !`, 'group');
    toast(`Joyeux anniversaire ${hero.name} !`);
  },
  play(A, t, dt) {
    const D = A.data;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('chic');
    }
    D.cake.userData.flames.forEach((f, i) => {
      if (f.visible) f.scale.setScalar(0.8 + Math.sin(t * 20 + i) * 0.2);
    });
    if (t < 6) {
      D.guests.forEach(s => (s.pose.hop = Math.abs(Math.sin(t * 4 + s.phase)) * 0.15));
      if (Math.random() < dt * 2) emit(pick(D.guests).headPos(), pick(NOTES));
    }
    at(A, t, 0.3, () => D.guests[0].say('🎶 Joyeux anniversaire…', 2));
    at(A, t, 2, () => D.guests[1].say(`🎶 Joyeux anniversaire ${D.hero.name}…`, 2));
    at(A, t, 4, () => D.guests.forEach((s, i) => i % 3 === 0 && s.say('🎶 Joyeux anniversaaaire !', 2)));
    at(A, t, 6.2, () => D.hero.say('Je fais un vœu… *souffle*', 1.8));
    // Les bougies s'éteignent une à une.
    D.cake.userData.flames.forEach((f, i) => {
      at(A, t, 7 + i * 0.25, () => {
        f.visible = false;
        emit(f.getWorldPosition(V()), '💨', { life: 1 });
      });
    });
    at(A, t, 7.4 + D.age * 0.25, () => {
      D.guests.forEach(s => s.flip(1));
      for (let i = 0; i < 16; i++)
        emit(V(rnd(-2, 2), rnd(2.5, 4.5), rnd(-2, 2)), pick(['✦', '✧', '•']), {
          color: `hsl(${rint(0, 360)},90%,65%)`,
          v: V(rnd(-1, 1), rnd(-0.6, 0.6), rnd(-1, 1)),
          life: 2,
        });
      log(`🎉 ${D.hero.name} souffle ses ${D.age} bougies d’un coup.`);
    });
    at(A, t, 10, () => {
      D.giver = pick(D.guests);
      const g = pick(GIFTS);
      D.giver.say(`Je t’ai apporté ${g} !`, 2.4);
      D.gift = g;
    });
    at(A, t, 12.6, () =>
      D.hero.say(
        pick(['Oh… merci… vraiment.', 'C’est exactement ce que je voulais !', '…tu l’as trouvé par terre ?']),
        2.2,
      ),
    );
    return t > 15;
  },
});
