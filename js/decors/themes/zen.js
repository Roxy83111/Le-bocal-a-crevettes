/*
 * Décor « Jardin zen ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Jardin zen',
  water: '#7cc3b0',
  sand: '#d8cba8',
  bg: '#1d3a34',
  sky: '#f2f7ec',
  ground: '#8a8268',
  amp: 0.15,
  build(g, D) {
    const off = rnd(0, 6.28),
      stone = M('#5a5f63', { roughness: 0.95 }),
      moss = M('#6a994e'),
      red = M('#c1121f');
    for (let i = 0; i < 3; i++) {
      const a = off + i * 2.1 + 0.4,
        r = rnd(3, 5.5);
      const rk = rock(rnd(0.6, 1), '#5a5f63');
      put(g, rk, a, r, 1.05);
      part(g, Ico(0.3), moss, [rk.position.x + 0.2, 1.6, rk.position.z], [1, 0.4, 1]);
      for (let k = 1; k <= 4; k++) {
        const ring = part(
          g,
          new THREE.TorusGeometry(0.75 + k * 0.35, 0.035, 3, 24),
          M('#b3a47f'),
          null,
          null,
          [Math.PI / 2, 0, 0],
        );
        ring.position.set(rk.position.x, 0.92, rk.position.z);
        ring.castShadow = false;
      }
      D.hide.push(behind(a, r));
    }
    const tor = new THREE.Group();
    for (const x of [-1.3, 1.3]) part(tor, Cyl(0.16, 0.18, 3.4, 6), red, [x, 1.7, 0]);
    part(tor, Box(3.8, 0.25, 0.38), M('#1b1b1b'), [0, 3.5, 0]);
    part(tor, Box(3.2, 0.18, 0.25), red, [0, 2.9, 0]);
    for (const s of [-1, 1])
      part(tor, Box(0.6, 0.2, 0.38), M('#1b1b1b'), [s * 2, 3.58, 0], null, [0, 0, s * 0.25]);
    const ta = off + 1.2;
    put(g, tor, ta, 6.6, 0.9);
    face(tor);
    D.hide.push(behind(ta, 6.6));
    const bon = new THREE.Group(),
      bark = M('#5e3a1f');
    part(bon, Cyl(0.18, 0.28, 1.2, 5), bark, [0, 0.6, 0], null, [0, 0, 0.25]);
    part(bon, Cyl(0.12, 0.18, 1, 5), bark, [-0.3, 1.5, 0], null, [0, 0, -0.5]);
    part(bon, Cyl(0.08, 0.12, 0.8, 5), bark, [0.3, 1.6, 0], null, [0, 0, 0.8]);
    const blos = [
      [-0.7, 2.1, 0, 0.75],
      [0.7, 2, 0.1, 0.6],
      [0, 2.5, -0.2, 0.65],
    ].map(([x, y, z, s]) => part(bon, jitter(Ico(s, 0), 0.08), M('#ffafcc'), [x, y, z]));
    const ba = off + 3.3;
    put(g, bon, ba, 6.4, 0.9);
    D.hide.push(behind(ba, 6.4));
    D.ticks.push((t, dt) => {
      if (Math.random() < dt * 0.4) {
        const b = pick(blos);
        const p = bon.localToWorld(b.position.clone());
        emit(p, '🌸', { v: V(rnd(-0.2, 0.2), -0.35, rnd(-0.2, 0.2)), life: 3 });
      }
    });
    for (let i = 0; i < 2; i++) {
      const L = new THREE.Group();
      part(L, Cyl(0.45, 0.55, 0.3, 6), stone, [0, 0.15, 0]);
      part(L, Cyl(0.15, 0.15, 0.9, 6), stone, [0, 0.75, 0]);
      part(L, Box(0.6, 0.5, 0.6), stone, [0, 1.45, 0]);
      part(L, Box(0.36, 0.3, 0.62), E('#ffb703', 1), [0, 1.45, 0]);
      part(L, Cone(0.65, 0.45, 4), stone, [0, 1.92, 0], null, [0, Math.PI / 4, 0]);
      part(L, Ico(0.1), stone, [0, 2.2, 0]);
      const a = off + 4.5 + i * 0.8;
      put(g, L, a, 6.8, 0.9);
      D.hide.push(behind(a, 6.8));
    }
    const br = new THREE.Group();
    for (let k = 0; k < 7; k++) {
      const u = k / 6;
      part(
        br,
        Box(0.42, 0.08, 1.2),
        M('#9c6644'),
        [(k - 3) * 0.42, 0.95 + Math.sin(u * Math.PI) * 0.8, 0],
        null,
        [0, 0, -Math.cos(u * Math.PI) * 0.55],
      );
    }
    for (const z of [-0.6, 0.6])
      for (let k = 0; k < 7; k += 2) {
        const u = k / 6;
        part(br, Cyl(0.04, 0.04, 0.5, 4), red, [(k - 3) * 0.42, 1.2 + Math.sin(u * Math.PI) * 0.8, z]);
      }
    put(g, br, off + 5.9, 5.2, 0.3);
    br.rotation.y = -(off + 5.9);
  },
});
