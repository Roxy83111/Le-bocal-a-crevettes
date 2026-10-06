/*
 * Décor « Temple englouti de Krillantis ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Temple englouti de Krillantis',
  water: '#3d9c86',
  sand: '#b9c6a3',
  bg: '#0f2f2a',
  sky: '#c4f0e0',
  ground: '#4f5a3a',
  amp: 0.8,
  build(g, D) {
    const off = rnd(0, 6.28),
      st = M('#c9c2a8', { roughness: 0.95 }),
      moss = M('#6a994e');
    const runes = E('#5ff2ff', 0.8);
    const column = (h, broken) => {
      const c = new THREE.Group();
      part(c, Box(1, 0.3, 1), st, [0, 0.15, 0]);
      const sh = Cyl(0.38, 0.42, h, 8);
      if (broken) jitter(sh, 0.06);
      part(c, sh, st, [0, 0.3 + h / 2, 0]);
      if (!broken) part(c, Box(1, 0.3, 1), st, [0, 0.45 + h, 0]);
      part(c, Ico(0.2), moss, [0.3, 0.4, 0.3], [1, 0.5, 1]);
      part(c, Box(0.06, 0.4, 0.02), runes, [0, 1, 0.4]);
      return c;
    };
    for (let i = 0; i < 4; i++) {
      const a = off + i * 0.9,
        r = 6.8;
      put(g, column(rnd(2.5, 4.3), i === 2), a, r, 0.9);
      D.hide.push(behind(a, r));
    }
    const fallen = part(g, Cyl(0.38, 0.42, 3.4, 8), st, [0, 0, 0], null, [0, 0, Math.PI / 2]);
    put(g, fallen, off + 4.2, 5.6, 1.25);
    fallen.rotation.y = rnd(0, 3);
    const head = new THREE.Group();
    part(head, jitter(Box(2, 2.4, 1.8), 0.12), M('#9aa58a', { roughness: 0.95 }), [0, 1.2, 0]);
    part(head, Box(0.4, 0.2, 0.1), E('#5ff2ff', 0.9), [-0.45, 1.6, 0.92]);
    part(head, Box(0.4, 0.2, 0.1), E('#5ff2ff', 0.9), [0.45, 1.6, 0.92]);
    part(head, Box(0.3, 0.6, 0.4), M('#8a957a'), [0, 1.15, 1]);
    part(head, Box(0.9, 0.12, 0.1), M('#3d4535'), [0, 0.6, 0.92]);
    part(head, Ico(0.4), moss, [0.7, 2.4, 0.2], [1, 0.4, 1]);
    const ha = off + 2.6;
    put(g, head, ha, 6.3, 0.85);
    face(head, 1.2);
    D.hide.push(behind(ha, 6.3), V(Math.cos(ha) * 6.3, 3.4, Math.sin(ha) * 6.3));
    const alt = new THREE.Group();
    part(alt, Box(2.4, 0.4, 1.6), st, [0, 0.2, 0]);
    part(alt, Box(1.8, 0.4, 1.2), st, [0, 0.6, 0]);
    part(alt, Box(1.2, 0.4, 0.8), st, [0, 1, 0]);
    const orb = part(alt, Ico(0.3, 0), E('#5ff2ff', 1), [0, 1.55, 0]);
    put(g, alt, off + 5.3, 6, 0.9);
    face(alt);
    D.ticks.push(t => {
      runes.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 2);
      orb.position.y = 1.55 + Math.sin(t * 1.5) * 0.1;
      orb.rotation.y = t;
    });
    for (let i = 0; i < 5; i++) put(g, rock(rnd(0.3, 0.7), '#8f9a80'), rnd(0, 6.28), rnd(4, 7.5), 1);
    for (let i = 0; i < 5; i++) {
      const s = seaweed(rnd(2, 4.5), M(pick(['#52b788', '#40916c'])));
      put(g, s, rnd(0, 6.28), rnd(4.5, 7.5));
      D.ticks.push(t => sway(s, t));
    }
  },
});
