/*
 * Pyramide de crevettes… qui finit toujours par s’effondrer.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'pyramide',
  label: 'Pyramide de crevettes',
  min: 6,
  max: 9,
  status: 'construit une pyramide',
  gatherFrac: 0.85,
  gatherMax: 12,
  start(A) {
    const py = A.m.slice(0, 6),
      fans = A.m.slice(6);
    Object.assign(A.data, { py, fans });
    const y0 = YMIN + 0.1;
    const slots = [
      [-1.2, 0],
      [0, 0],
      [1.2, 0],
      [-0.6, 1],
      [0.6, 1],
      [0, 2],
    ];
    py.forEach((s, i) => {
      const [x, l] = slots[i];
      s.slot = V(x, y0 + l * 0.62, 0.5);
      s.layer = l;
      s.goTo(s.slot, 1.6);
      s.faceObj = V(x, y0 + l * 0.62, 20);
    });
    fans.forEach((s, i) => {
      const a = -Math.PI / 2 + (i - (fans.length - 1) / 2) * 0.6;
      s.goTo(V(Math.cos(a) * 4, 2.8, Math.sin(a) * 4 + 0.5), 1.4);
      s.faceObj = V(0, 2.5, 0.5);
      s.status = 'encourage';
    });
    log(`🔺 ${names(py)} tentent une pyramide de crevettes.`, 'group');
    toast('Pyramide de crevettes');
  },
  play(A, t, dt) {
    const D = A.data,
      w = Math.min(t, 7) * 0.025;
    if (t < 7.5)
      D.py.forEach(s => {
        const o = Math.sin(t * 2.6 + s.layer) * w * (s.layer + 1);
        s.goTo(s.slot.clone().add(V(o, 0, 0)), 3);
        s.pose.roll = o * 0.6;
      });
    at(A, t, 0.6, () => D.py[5].say('Je vois ma maison d’ici !', 2.2));
    at(A, t, 2.6, () => D.py[0].say('Arrête de gigoter là-haut…', 2));
    at(A, t, 4.2, () =>
      D.fans.forEach(s => s.say(pick(['Allez !!', 'Plus haut !', 'Magnifique !', '📸']), 1.6)),
    );
    at(A, t, 5.8, () => D.py[1].say('😬 Ça va lâcher…', 1.8));
    at(A, t, 7.5, () => {
      D.py.forEach(s => {
        s.goTo(s.pos.clone().add(V(rnd(-3, 3), rnd(-0.5, 2.5), rnd(-3, 3))), 2.5);
        s.pose.roll = 0;
        s.flip(0.9);
        s.say(pick(['Aaaah !', 'Ouille !', 'Mes antennes !', 'C’était prévu.']), 1.6);
      });
      for (let i = 0; i < 8; i++)
        emit(V(rnd(-1.5, 1.5), YMIN, rnd(-0.5, 1.5)), '💨', { v: V(rnd(-1, 1), rnd(0.2, 0.8), rnd(-1, 1)) });
      log('💥 La pyramide s’effondre dans un nuage de sable. Note du jury : 7/10.');
    });
    D.fans.forEach(s => {
      s.pose.hop = Math.abs(Math.sin(t * 6 + s.phase)) * 0.15;
    });
    return t > 10.5;
  },
  end(A) {
    A.m.forEach(s => {
      delete s.slot;
      delete s.layer;
    });
  },
});
