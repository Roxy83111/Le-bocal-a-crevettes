/*
 * Décor « Forêt de champignons ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
function mushroom(h, capR, capColor, dots = true, glow = false) {
  const g = new THREE.Group();
  part(g, jitter(Cyl(capR * 0.22, capR * 0.3, h, 7), 0.03), M('#f1ead8'), [0, h / 2, 0]);
  const capMat = glow ? E(capColor, 0.8) : M(capColor, { roughness: 0.5 });
  const cap = part(
    g,
    new THREE.SphereGeometry(capR, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    capMat,
    [0, h - 0.05, 0],
    [1, 0.7, 1],
  );
  part(g, Cyl(capR * 0.95, capR * 0.6, 0.12, 9), M('#e9dcc3'), [0, h - 0.05, 0]);
  if (dots)
    for (let i = 0; i < 6; i++) {
      const a = rnd(0, 6.28),
        r = rnd(0.2, 0.75) * capR;
      part(g, Ico(capR * 0.11, 0), M('#ffffff'), [
        Math.cos(a) * r,
        h - 0.05 + Math.sqrt(Math.max(0, capR * capR - r * r)) * 0.7,
        Math.sin(a) * r,
      ]);
    }
  g.userData.cap = cap;
  return g;
}

THEMES.push({
  name: 'Forêt de champignons',
  water: '#4fa3a5',
  sand: '#5f7f45',
  bg: '#123028',
  sky: '#d9ffe0',
  ground: '#3f5a2a',
  amp: 0.9,
  build(g, D) {
    const off = rnd(0, 6.28);
    // Grands champignons rouges à pois
    for (let i = 0; i < 5; i++) {
      const a = off + i * 1.25,
        r = rnd(5.4, 7.2);
      const m = mushroom(rnd(2.5, 4.5), rnd(1.1, 1.7), pick(['#d62828', '#e85d04', '#9d0208']));
      put(g, m, a, r, 0.9);
      m.rotation.z = rnd(-0.1, 0.1);
      D.hide.push(behind(a, r));
    }
    // Champignons lumineux qui pulsent
    for (let i = 0; i < 8; i++) {
      const col = pick(['#4cc9f0', '#b5179e', '#80ffdb']);
      const m = mushroom(rnd(0.6, 1.4), rnd(0.35, 0.6), col, false, true);
      const a = rnd(0, 6.28);
      put(g, m, a, rnd(3.5, 7.4), 1);
      D.ticks.push(t => (m.userData.cap.material.emissiveIntensity = 0.5 + 0.4 * Math.sin(t * 2 + i)));
    }
    // La maison-champignon
    const house = mushroom(3, 2.2, '#f4a261', true);
    part(house, Box(0.8, 1.3, 0.1), M('#6b4226'), [0, 0.65, 0.68]);
    part(house, Ico(0.06), M('#ffd166'), [0.25, 0.65, 0.75]);
    const win = E('#ffd166', 0.9);
    part(house, Cyl(0.3, 0.3, 0.1, 8), win, [0, 2, 0.62], null, [Math.PI / 2, 0, 0]);
    part(house, Cyl(0.15, 0.2, 1.2, 6), M('#8d6e63'), [1.1, 3.6, 0]);
    const ha = off + 0.6;
    put(g, house, ha, 6.2, 0.9);
    face(house, 1.5);
    D.hide.push(behind(ha, 6.2));
    D.ticks.push((t, dt) => {
      win.emissiveIntensity = 0.7 + Math.sin(t * 1.3) * 0.2;
      if (Math.random() < dt * 0.8)
        emit(V(Math.cos(ha) * 6.2, 5, Math.sin(ha) * 6.2), '○', {
          color: '#cfcfcf',
          v: V(0.1, 0.8, 0),
          life: 2.2,
        });
    });
    // Petite barrière
    for (let i = 0; i < 6; i++)
      part(g, Box(0.12, 0.7, 0.12), M('#a1887f'), [
        Math.cos(ha + 0.35) * (4.6 + i * 0.35),
        1.25,
        Math.sin(ha + 0.35) * (4.6 + i * 0.35),
      ]);
    // Mousse et lucioles
    for (let i = 0; i < 6; i++)
      put(
        g,
        part(new THREE.Group(), jitter(Ico(rnd(0.4, 0.8), 1), 0.08), M('#3a6b35'), [0, 0, 0], [1, 0.4, 1]),
        rnd(0, 6.28),
        rnd(3, 7.5),
        1,
      );
    D.ticks.push((t, dt) => {
      if (Math.random() < dt * 2)
        emit(randInside(), '•', {
          color: '#e9ff70',
          v: V(rnd(-0.4, 0.4), rnd(-0.2, 0.4), rnd(-0.4, 0.4)),
          life: 2.5,
        });
    });
  },
});
