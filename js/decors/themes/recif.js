/*
 * Décor « Récif de corail ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Récif de corail',
  water: '#2aa7c9',
  sand: '#dcc488',
  bg: '#0f3a52',
  sky: '#c9f1ff',
  ground: '#7a6a44',
  amp: 1,
  build(g, D) {
    const off = rnd(0, 6.28),
      cc = ['#ff6f91', '#ff9671', '#ffc75f', '#c34a6f', '#f9f871', '#845ec2'];
    for (let i = 0; i < 6; i++) {
      const a = off + (i / 6) * 6.28 + rnd(-0.2, 0.2),
        r = rnd(5.6, 7.2);
      const c = coral(M(pick(cc)), rnd(0.7, 1), 0.16, 3);
      c.scale.setScalar(rnd(0.9, 1.35));
      put(g, c, a, r);
      D.hide.push(behind(a, r));
    }
    for (let i = 0; i < 7; i++) {
      const a = off + 0.5 + (i / 7) * 6.28,
        r = rnd(4.5, 7.5);
      const s = seaweed(rnd(2.5, 5), M(pick(['#3fa34d', '#2d6a4f', '#74c69d', '#52b788'])));
      put(g, s, a, r);
      D.ticks.push(t => sway(s, t));
    }
    for (let i = 0; i < 3; i++) {
      const a = off + 1.1 + i * 2.1,
        r = rnd(4.8, 6.5);
      const an = anemone(pick(['#ff70a6', '#ffd670', '#e0aaff']));
      put(g, an, a, r);
      D.ticks.push(t =>
        an.userData.tents.forEach((c, j) => (c.rotation.z = -0.5 + Math.sin(t * 2 + j) * 0.18)),
      );
      D.hide.push(behind(a, r));
    }
    for (let i = 0; i < 5; i++) put(g, rock(rnd(0.4, 0.9), '#8d8a80'), rnd(0, 6.28), rnd(4, 7.5), 1);
    for (let i = 0; i < 2; i++) put(g, starfish(pick(['#ff7b5c', '#ffb703'])), rnd(0, 6.28), rnd(3, 6), 1.25);
  },
});
