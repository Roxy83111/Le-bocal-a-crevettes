/*
 * Décor « Banquise » : igloo, blocs de glace translucides, stalactites, bonhomme de neige
 * et une petite pluie de flocons.
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Banquise',
  water: '#8ecae6',
  sand: '#f1f6fb',
  bg: '#1b3a57',
  sky: '#e8f6ff',
  ground: '#9fb8cc',
  amp: 0.7,
  build(g, D) {
    const off = rnd(0, 6.28);
    const snow = M('#ffffff', { roughness: 0.9 }),
      ice = M('#bde0fe', { transparent: true, opacity: 0.75, roughness: 0.1, metalness: 0.1 });

    // Igloo en briques de neige
    const igloo = new THREE.Group();
    part(
      igloo,
      jitter(new THREE.SphereGeometry(2, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0.06),
      snow,
      [0, 0, 0],
    );
    for (let r = 1; r < 4; r++)
      part(
        igloo,
        new THREE.TorusGeometry(2 * Math.cos((r / 4) * (Math.PI / 2)), 0.04, 3, 18),
        M('#d6e4f0'),
        [0, 2 * Math.sin((r / 4) * (Math.PI / 2)), 0],
        null,
        [Math.PI / 2, 0, 0],
      );
    // Tunnel d'entrée
    part(igloo, new THREE.CylinderGeometry(0.8, 0.8, 1.6, 8, 1, true, 0, Math.PI), snow, [0, 0, 2.1], null, [
      Math.PI / 2,
      0,
      Math.PI / 2,
    ]);
    part(igloo, Box(1.2, 1, 0.1), M('#24384a'), [0, 0.45, 2.85]);
    const ia = off;
    put(g, igloo, ia, 6, 0.85);
    face(igloo, 1);
    D.hide.push(behind(ia, 6), V(Math.cos(ia) * 5.2, YMIN + 0.1, Math.sin(ia) * 5.2));

    // Blocs de glace translucides
    for (let i = 0; i < 6; i++) {
      const b = part(
        g,
        jitter(Box(rnd(0.8, 1.8), rnd(0.8, 2.4), rnd(0.8, 1.6)), 0.12),
        ice,
        [0, 0, 0],
        null,
        [rnd(-0.2, 0.2), rnd(0, 3), rnd(-0.2, 0.2)],
      );
      const a = off + 1.3 + i * 0.75,
        r = rnd(4.5, 7.2);
      put(g, b, a, r, 1.3);
      if (i % 2) D.hide.push(behind(a, r));
    }

    // Stalactites de glace qui pendent sous la surface
    for (let i = 0; i < 14; i++) {
      const a = rnd(0, 6.28),
        r = rnd(2, 8);
      const h = rnd(0.6, 1.8);
      const st = part(
        g,
        Cone(rnd(0.12, 0.25), h, 5),
        ice,
        [Math.cos(a) * r, WATER_Y - 0.6 - h / 2, Math.sin(a) * r],
        null,
        [Math.PI, 0, 0],
      );
      clampInside(st.position, 1.5);
      st.position.y = WATER_Y - 0.6 - h / 2;
    }

    // Bonhomme de neige avec écharpe et chapeau
    const sm = new THREE.Group();
    part(sm, Ico(0.9, 1), snow, [0, 0.8, 0]);
    part(sm, Ico(0.65, 1), snow, [0, 2.1, 0]);
    part(sm, Ico(0.45, 1), snow, [0, 3.1, 0]);
    part(sm, Cone(0.08, 0.5, 5), M('#f77f00'), [0, 3.1, 0.65], null, [Math.PI / 2, 0, 0]);
    for (const s of [-1, 1]) part(sm, Ico(0.06), M('#111'), [s * 0.15, 3.25, 0.4]);
    part(sm, new THREE.TorusGeometry(0.5, 0.12, 4, 10), M('#e63946'), [0, 2.65, 0], null, [
      Math.PI / 2,
      0,
      0,
    ]);
    part(sm, Box(0.2, 0.7, 0.1), M('#e63946'), [0.3, 2.3, 0.45], null, [0, 0, 0.2]);
    part(sm, Cyl(0.35, 0.35, 0.05, 8), M('#1b1b22'), [0, 3.5, 0]);
    part(sm, Cyl(0.24, 0.24, 0.45, 8), M('#1b1b22'), [0, 3.75, 0]);
    for (const s of [-1, 1])
      part(sm, Cyl(0.03, 0.04, 1.1, 4), M('#6b4226'), [s * 0.85, 2.3, 0], null, [0, 0, s * 1.1]);
    const sma = off - 1.4;
    put(g, sm, sma, 5.8, 0.95);
    face(sm, 3);
    D.hide.push(behind(sma, 5.8));

    // Petit pingouin (original, tout rond) qui se dandine
    const pg = new THREE.Group();
    part(pg, Ico(0.45, 1), M('#22223b'), [0, 0.55, 0], [1, 1.3, 0.9]);
    part(pg, Ico(0.32, 1), M('#ffffff'), [0, 0.5, 0.18], [1, 1.3, 0.8]);
    part(pg, Ico(0.28, 1), M('#22223b'), [0, 1.25, 0]);
    part(pg, Cone(0.07, 0.2, 4), M('#ffb703'), [0, 1.22, 0.3], null, [Math.PI / 2, 0, 0]);
    for (const s of [-1, 1]) part(pg, Ico(0.04), M('#ffffff'), [s * 0.1, 1.33, 0.22]);
    for (const s of [-1, 1]) part(pg, Box(0.12, 0.05, 0.2), M('#ffb703'), [s * 0.15, 0.03, 0.1]);
    const pa = off + 0.9;
    put(g, pg, pa, 5, 0.95);
    face(pg, 1);
    D.ticks.push(t => (pg.rotation.z = Math.sin(t * 4) * 0.15));

    // Flocons qui tombent
    D.ticks.push((t, dt) => {
      if (Math.random() < dt * 3) {
        const p = randInside();
        p.y = YMAX;
        emit(p, '❄', { color: '#ffffff', v: V(rnd(-0.2, 0.2), -rnd(0.8, 1.4), rnd(-0.2, 0.2)), life: 4 });
      }
    });
  },
});
