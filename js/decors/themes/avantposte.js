/*
 * Décor « Avant-poste Galactique Delta-7 » : une base de science-fiction miniature et originale,
 * avec un petit robot-marcheur, une capsule de secours écrasée, une antenne radar et des caisses.
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Avant-poste Galactique Delta-7',
  water: '#3a6f8f',
  sand: '#b8a98a',
  bg: '#0d1b2a',
  sky: '#d0e8ff',
  ground: '#5e503f',
  amp: 1,
  build(g, D) {
    const off = rnd(0, 6.28);
    const hull = M('#e9e4d4', { roughness: 0.5 }),
      stripe = M('#2ec4b6'),
      steel = M('#6c757d', { metalness: 0.5, roughness: 0.4 });

    // Robot-marcheur (« Bidule »), corps en caisse, un grand œil rond, deux jambes trapues
    const bot = new THREE.Group();
    const body = new THREE.Group();
    body.position.y = 2.6;
    bot.add(body);
    part(body, jitter(Box(1.9, 1.5, 1.6), 0.04), hull, [0, 0, 0]);
    part(body, Box(1.95, 0.25, 1.65), stripe, [0, -0.3, 0]);
    const eye = part(body, Cyl(0.42, 0.42, 0.2, 10), E('#7df9ff', 1), [0, 0.15, 0.82], null, [
      Math.PI / 2,
      0,
      0,
    ]);
    part(body, new THREE.TorusGeometry(0.45, 0.07, 4, 10), steel, [0, 0.15, 0.85]);
    part(body, Cyl(0.04, 0.04, 0.9, 4), steel, [0.6, 1.2, 0]);
    const beacon = part(body, Ico(0.1), E('#ff5d8f', 1), [0.6, 1.7, 0]);
    for (const s of [-1, 1]) {
      part(body, Box(0.35, 1, 0.35), steel, [s * 1.15, -0.2, 0.2], null, [0.3, 0, 0]);
      part(body, Box(0.45, 0.25, 0.45), stripe, [s * 1.15, -0.75, 0.45]);
    }
    const legs = [];
    for (const s of [-1, 1]) {
      const l = new THREE.Group();
      l.position.set(s * 0.55, 1.9, 0);
      part(l, Box(0.45, 1.6, 0.45), steel, [0, -0.8, 0]);
      part(l, Box(0.75, 0.25, 0.95), hull, [0, -1.7, 0.15]);
      bot.add(l);
      legs.push(l);
    }
    const ba = off;
    put(g, bot, ba, 5.8, 0.9);
    face(bot, 2.5);
    D.hide.push(behind(ba, 5.8));
    D.ticks.push(t => {
      body.rotation.y = Math.sin(t * 0.6) * 0.5;
      body.position.y = 2.6 + Math.sin(t * 2) * 0.05;
      legs[0].rotation.x = Math.sin(t * 2) * 0.08;
      legs[1].rotation.x = -Math.sin(t * 2) * 0.08;
      eye.material.emissiveIntensity = Math.random() < 0.02 ? 0.1 : 1;
      beacon.material.emissiveIntensity = Math.floor(t * 2) % 2 ? 1.5 : 0.2;
    });

    // Capsule de secours écrasée, qui fume
    const cap = new THREE.Group();
    part(cap, jitter(Ico(1.2, 1), 0.06), hull, [0, 0, 0], [1, 1.25, 1]);
    part(cap, Cyl(1.22, 1.22, 0.3, 10), stripe, [0, 0.2, 0]);
    part(cap, Cyl(0.45, 0.45, 0.1, 8), E('#ffb703', 0.6), [0, 0.6, 1.05], null, [Math.PI / 2 - 0.3, 0, 0]);
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Group();
      p.rotation.y = (i / 3) * Math.PI * 2;
      part(p, Box(0.1, 0.9, 0.7), steel, [0, -1.1, 0.9]);
      cap.add(p);
    }
    const ca = off + 2.1;
    put(g, cap, ca, 6, 1.6);
    cap.rotation.set(0.5, 0, 0.35);
    D.hide.push(behind(ca, 6));
    D.ticks.push((t, dt) => {
      if (Math.random() < dt * 1.8)
        emit(V(Math.cos(ca) * 6, 3.4, Math.sin(ca) * 6), '●', {
          color: '#9e9e9e',
          v: V(rnd(-0.2, 0.2), 1.2, rnd(-0.2, 0.2)),
          life: 2.4,
        });
    });

    // Antenne radar qui tourne
    const radar = new THREE.Group();
    part(radar, Cyl(0.15, 0.3, 2.6, 6), steel, [0, 1.3, 0]);
    const dish = new THREE.Group();
    dish.position.y = 2.7;
    part(
      dish,
      new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, 0, Math.PI / 3),
      M('#dee2e6', { side: THREE.DoubleSide }),
      [0, 0, 0],
      null,
      [Math.PI / 2 + 0.4, 0, 0],
    );
    part(dish, Cyl(0.03, 0.03, 0.9, 4), steel, [0, 0.1, 0.45], null, [Math.PI / 2 + 0.4, 0, 0]);
    radar.add(dish);
    put(g, radar, off + 3.6, 6.6, 0.9);
    D.ticks.push(t => (dish.rotation.y = t * 0.8));

    // Panneaux solaires
    for (let i = 0; i < 2; i++) {
      const sp = new THREE.Group();
      part(sp, Cyl(0.08, 0.08, 1.4, 4), steel, [0, 0.7, 0]);
      const pan = part(
        sp,
        Box(2.2, 0.08, 1.3),
        M('#1d3557', { metalness: 0.4, roughness: 0.2 }),
        [0, 1.45, 0],
        null,
        [-0.5, 0, 0],
      );
      for (let k = 1; k < 4; k++) part(pan, Box(0.03, 0.1, 1.3), M('#a8dadc'), [-1.1 + k * 0.55, 0, 0]);
      put(g, sp, off + 4.4 + i * 0.5, 6.4, 0.9);
      face(sp, 1.4);
    }

    // Caisses de ravitaillement
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Group();
      part(c, Box(1, 1, 1), M('#6a994e'), [0, 0.5, 0]);
      part(c, Box(1.02, 0.18, 1.02), M('#ffd166'), [0, 0.5, 0]);
      const a = off + 5.3 + (i % 2) * 0.25;
      put(g, c, a, 5 + Math.floor(i / 2) * 1.1, 0.9 + (i === 3 ? 1 : 0));
      c.rotation.y = rnd(-0.4, 0.4);
    }
    D.hide.push(behind(off + 5.4, 5.6));

    // Petite tour de guet avec gyrophare
    const tower = new THREE.Group();
    for (const [x, z] of [
      [-0.5, -0.5],
      [0.5, -0.5],
      [-0.5, 0.5],
      [0.5, 0.5],
    ])
      part(tower, Box(0.12, 3.2, 0.12), steel, [x, 1.6, z]);
    part(tower, Box(1.5, 0.15, 1.5), hull, [0, 3.2, 0]);
    const light = part(tower, Cone(0.3, 0.5, 6), E('#ff9f1c', 1), [0, 3.55, 0]);
    put(g, tower, off + 1.1, 6.8, 0.9);
    D.ticks.push(t => (light.material.emissiveIntensity = 0.6 + 0.6 * Math.abs(Math.sin(t * 3))));
    for (let i = 0; i < 4; i++) put(g, rock(rnd(0.3, 0.7), '#8d7b68'), rnd(0, 6.28), rnd(3.5, 7.5), 1);
  },
});
