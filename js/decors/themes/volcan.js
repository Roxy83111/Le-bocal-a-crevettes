/*
 * Décor « Volcan sous-marin ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Volcan sous-marin',
  water: '#3c5a6b',
  sand: '#3d3a3a',
  bg: '#1a0f0f',
  sky: '#ffb48a',
  ground: '#3a1d12',
  amp: 1.3,
  build(g, D) {
    const off = rnd(0, 6.28),
      basalt = M('#2b2626', { roughness: 0.95 }),
      lava = E('#ff5a1f', 1.2);
    // Le volcan principal
    const v = new THREE.Group();
    part(
      v,
      jitter(Cyl(0.9, 3.4, 4.6, 9, true), 0.18),
      M('#3a3030', { roughness: 0.95, side: THREE.DoubleSide }),
      [0, 2.3, 0],
    );
    part(v, Cyl(0.85, 0.85, 0.2, 9), lava, [0, 4.3, 0]);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const stream = part(v, Box(0.3, 4.4, 0.12), lava, [Math.cos(a) * 2.2, 2.3, Math.sin(a) * 2.2]);
      // Coulée posée sur la pente du cône (le haut penche vers le cratère).
      stream.quaternion.setFromAxisAngle(V(-Math.sin(a), 0, Math.cos(a)), 0.5);
    }
    const glow = new THREE.PointLight('#ff6b2b', 1.4, 12);
    glow.position.set(0, 5, 0);
    v.add(glow);
    put(g, v, off, 5.6, 0.9);
    D.hide.push(behind(off, 5.6), behind(off + 0.4, 5.4));
    D.ticks.push((t, dt) => {
      lava.emissiveIntensity = 1 + Math.sin(t * 3) * 0.3;
      glow.intensity = 1.2 + Math.sin(t * 5) * 0.3 + Math.random() * 0.2;
      if (Math.random() < dt * 3)
        emit(V(Math.cos(off) * 5.6, 6, Math.sin(off) * 5.6), pick(['●', '○']), {
          color: pick(['#8d8d8d', '#bdbdbd', '#ff9f43']),
          v: V(rnd(-0.3, 0.3), rnd(1.2, 2), rnd(-0.3, 0.3)),
          life: 2.5,
        });
    });
    // Petits cônes fumants (cheminées hydrothermales)
    for (let i = 0; i < 3; i++) {
      const a = off + 2 + i * 1.3,
        r = rnd(4.5, 7);
      const c = new THREE.Group();
      part(c, jitter(Cyl(0.3, 0.8, 1.8, 6), 0.08), basalt, [0, 0.9, 0]);
      part(c, Cyl(0.28, 0.28, 0.1, 6), E('#ffb703', 0.9), [0, 1.8, 0]);
      put(g, c, a, r, 0.9);
      D.ticks.push((t, dt) => {
        if (Math.random() < dt * 1.5)
          emit(V(Math.cos(a) * r, 3, Math.sin(a) * r), '○', { cls: 'bub', v: V(0, 1.4, 0), life: 2 });
      });
    }
    // Roches de lave fissurées et cristaux d'obsidienne
    for (let i = 0; i < 6; i++) {
      const rk = rock(rnd(0.5, 1), '#2b2626');
      const crack = part(rk, Box(0.9, 0.06, 0.06), lava, [0, 0.3, 0.3], null, [0, rnd(0, 3), 0.3]);
      crack.castShadow = false;
      put(g, rk, rnd(0, 6.28), rnd(3.5, 7.5), 1);
    }
    for (let i = 0; i < 4; i++) {
      const cr = new THREE.Group();
      for (let k = 0; k < 4; k++)
        part(
          cr,
          new THREE.OctahedronGeometry(rnd(0.25, 0.5)),
          M('#2d1b4e', { roughness: 0.15, metalness: 0.4 }),
          [rnd(-0.4, 0.4), rnd(0.3, 0.8), rnd(-0.4, 0.4)],
          [0.6, 1.8, 0.6],
          [rnd(-0.4, 0.4), 0, rnd(-0.4, 0.4)],
        );
      const a = off + 4.2 + i * 0.5;
      put(g, cr, a, rnd(5, 7.2), 0.9);
    }
    D.hide.push(behind(off + 4.5, 6.4));
  },
});
