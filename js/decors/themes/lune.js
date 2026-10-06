/*
 * Décor « Base lunaire Crustacé-1 ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Base lunaire Crustacé-1',
  water: '#3b3f8f',
  sand: '#a7a8b8',
  bg: '#0a0b22',
  sky: '#b9bdf5',
  ground: '#3a3a52',
  amp: 1.35,
  build(g, D) {
    const off = rnd(0, 6.28);
    for (let i = 0; i < 5; i++) {
      const c = part(
        g,
        new THREE.TorusGeometry(rnd(0.6, 1.1), 0.2, 4, 9),
        M('#8c8d9e'),
        null,
        [1, 1, 0.5],
        [Math.PI / 2, 0, 0],
      );
      put(g, c, rnd(0, 6.28), rnd(2, 6.8), 1.05);
    }
    const rk = new THREE.Group();
    part(rk, Cyl(0.45, 0.5, 2.4, 8), M('#f1faee'), [0, 1.4, 0]);
    part(rk, Cone(0.45, 0.9, 8), M('#e63946'), [0, 3.05, 0]);
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Group();
      p.rotation.y = (i / 3) * Math.PI * 2;
      part(p, Box(0.08, 0.8, 0.6), M('#e63946'), [0, 0.5, 0.55]);
      rk.add(p);
    }
    part(rk, Cyl(0.18, 0.18, 0.1, 8), E('#7df9ff', 0.8), [0, 2, 0.47], null, [Math.PI / 2, 0, 0]);
    const flame = part(rk, Cone(0.3, 0.6, 6), E('#ff9f1c', 1), [0, 0.05, 0], null, [Math.PI, 0, 0]);
    const ra = off;
    put(g, rk, ra, 6.2, 0.9);
    rk.rotation.z = 0.08;
    D.hide.push(behind(ra, 6.2));
    D.ticks.push(t => {
      const s = 0.8 + Math.random() * 0.4;
      flame.scale.set(s, s * 1.2, s);
    });
    const ufo = new THREE.Group();
    part(ufo, Cyl(1, 1.25, 0.28, 10), M('#b8c0cc', { metalness: 0.7, roughness: 0.25 }));
    part(
      ufo,
      new THREE.SphereGeometry(0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: '#7df9ff',
        emissive: '#2bb5c4',
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.75,
        flatShading: true,
      }),
      [0, 0.12, 0],
    );
    const lights = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      lights.push(part(ufo, Ico(0.08), E('#ffd23f', 1), [Math.cos(a) * 1.15, -0.05, Math.sin(a) * 1.15]));
    }
    const beam = new THREE.Mesh(
      Cone(1, 3.6, 8, true),
      new THREE.MeshBasicMaterial({
        color: '#9dff8a',
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    beam.position.y = -1.9;
    ufo.add(beam);
    g.add(ufo);
    D.ticks.push(t => {
      ufo.position.set(Math.cos(t * 0.25) * 3.8, 8.8 + Math.sin(t) * 0.3, Math.sin(t * 0.25) * 3.8);
      ufo.rotation.y = t * 0.8;
      lights.forEach(
        (l, i) => (l.material.emissiveIntensity = (Math.floor(t * 4) + i) % 3 === 0 ? 1.6 : 0.2),
      );
    });
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Group(),
        h = rnd(1, 2.6),
        col = pick(['#9dff8a', '#ff70d4', '#7df9ff']);
      part(p, Cyl(0.05, 0.08, h, 4), M('#5a4a8a'), [0, h / 2, 0], null, [rnd(-0.2, 0.2), 0, rnd(-0.2, 0.2)]);
      const bulb = part(p, Ico(0.22, 0), E(col, 0.9), [0, h, 0]);
      const a = off + 1 + i * 0.8;
      put(g, p, a, rnd(5, 7.3), 1);
      D.ticks.push(t => (bulb.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 2 + i)));
    }
    const fl = new THREE.Group();
    part(fl, Cyl(0.04, 0.04, 2.4, 4), M('#ddd'), [0, 1.2, 0]);
    part(fl, Box(1, 0.6, 0.02), M('#ff7b5c'), [0.5, 2.1, 0]);
    part(fl, Ico(0.12), M('#ffd23f'), [0.5, 2.1, 0.02], [1, 1, 0.3]);
    put(g, fl, off + 5.2, 5, 1);
    const dish = new THREE.Group();
    part(dish, Cyl(0.08, 0.12, 1.2, 5), M('#ccc'), [0, 0.6, 0]);
    part(
      dish,
      new THREE.SphereGeometry(0.8, 8, 3, 0, Math.PI * 2, 0, Math.PI / 3),
      M('#e0e0e8', { side: THREE.DoubleSide }),
      [0, 1.6, 0],
      null,
      [2.5, 0, 0],
    );
    const da = off + 4;
    put(g, dish, da, 6.4, 1);
    D.hide.push(behind(da, 6.4));
    for (let i = 0; i < 5; i++) put(g, rock(rnd(0.3, 0.8), '#6d6e80'), rnd(0, 6.28), rnd(3.5, 7.5), 1);
  },
});
