/*
 * Décor « Fête foraine » : grande roue qui tourne, manège à chevaux de bois, stand de barbe à papa,
 * guirlandes d'ampoules qui clignotent.
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Fête foraine',
  water: '#4a5fc1',
  sand: '#c9b18a',
  bg: '#1a1240',
  sky: '#ffd6f5',
  ground: '#4a3a6b',
  amp: 0.4,
  build(g, D) {
    const off = rnd(0, 6.28);
    const steel = M('#e9ecef', { metalness: 0.4, roughness: 0.4 });
    const pal = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#c77dff'];

    // Grande roue : deux pieds en A et une roue qui tourne avec ses nacelles
    const wheel = new THREE.Group();
    for (const z of [-0.5, 0.5])
      for (const s of [-1, 1])
        part(wheel, Box(0.15, 5.6, 0.15), steel, [s * 1.2, 2.6, z], null, [0, 0, s * 0.42]);
    const rotor = new THREE.Group();
    rotor.position.y = 5.2;
    wheel.add(rotor);
    for (const z of [-0.45, 0.45]) part(rotor, new THREE.TorusGeometry(2.6, 0.07, 4, 16), steel, [0, 0, z]);
    for (let i = 0; i < 8; i++)
      part(rotor, Box(0.06, 5.2, 0.06), steel, [0, 0, 0], null, [0, 0, (i / 8) * Math.PI]);
    const cabins = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const c = new THREE.Group();
      c.position.set(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0);
      part(c, Box(0.6, 0.5, 0.6), M(pal[i % pal.length]), [0, -0.45, 0]);
      part(c, Cone(0.45, 0.25, 4), M('#ffffff'), [0, -0.08, 0], null, [0, Math.PI / 4, 0]);
      rotor.add(c);
      cabins.push(c);
    }
    const wa = off;
    put(g, wheel, wa, 6.4, 0.9);
    face(wheel, 5);
    D.hide.push(behind(wa, 6.4));
    D.ticks.push(t => {
      rotor.rotation.z = t * 0.3;
      // Les nacelles restent à l'horizontale
      cabins.forEach(c => (c.rotation.z = -rotor.rotation.z));
    });

    // Manège : plateau qui tourne, chevaux qui montent et descendent
    const car = new THREE.Group();
    part(car, Cyl(2, 2.1, 0.3, 12), M('#ffd166'), [0, 0.15, 0]);
    const plate = new THREE.Group();
    plate.position.y = 0.3;
    car.add(plate);
    part(car, Cyl(0.15, 0.15, 3.2, 6), steel, [0, 1.7, 0]);
    for (let i = 0; i < 12; i++) {
      const p = new THREE.Group();
      p.rotation.y = (i / 12) * Math.PI * 2;
      part(
        p,
        Cone(2.3, 0.9, 3, true),
        M(i % 2 ? '#ef476f' : '#ffffff', { side: THREE.DoubleSide }),
        [0, 3.65, 0],
        [0.55, 1, 1],
      );
      car.add(p);
    }
    const horses = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const h = new THREE.Group();
      h.position.set(Math.cos(a) * 1.4, 0, Math.sin(a) * 1.4);
      part(h, Cyl(0.03, 0.03, 3, 4), M('#ffd166', { metalness: 0.6 }), [0, 1.5, 0]);
      const body = new THREE.Group();
      part(body, Box(0.9, 0.4, 0.3), M(pal[i]), [0, 0, 0]);
      part(body, Box(0.25, 0.45, 0.25), M(pal[i]), [0.45, 0.25, 0], null, [0, 0, -0.4]);
      for (const dx of [-0.3, 0.3]) part(body, Box(0.1, 0.4, 0.1), M('#ffffff'), [dx, -0.35, 0]);
      body.rotation.y = -a + Math.PI / 2;
      h.add(body);
      plate.add(h);
      horses.push(body);
    }
    const ca = off + 1.9;
    put(g, car, ca, 5.6, 0.95);
    D.hide.push(behind(ca, 5.6));
    D.ticks.push(t => {
      plate.rotation.y = t * 0.6;
      horses.forEach((b, i) => (b.position.y = 1.1 + Math.sin(t * 2.5 + i * 1.6) * 0.3));
    });

    // Stand de barbe à papa
    const stand = new THREE.Group();
    part(stand, Box(2, 1.2, 1), M('#ffffff'), [0, 0.6, 0]);
    part(stand, Box(2.05, 0.3, 1.05), M('#ef476f'), [0, 1.1, 0]);
    for (const s of [-1, 1]) part(stand, Cyl(0.05, 0.05, 1.4, 4), steel, [s * 0.95, 1.9, 0.4]);
    for (let i = 0; i < 5; i++)
      part(
        stand,
        Box(0.42, 0.3, 1.2),
        M(i % 2 ? '#ffffff' : '#ef476f'),
        [-0.84 + i * 0.42, 2.7, 0.1],
        null,
        [0.25, 0, 0],
      );
    for (let i = 0; i < 3; i++) {
      part(stand, Cyl(0.02, 0.02, 0.6, 4), M('#ffffff'), [-0.5 + i * 0.5, 1.6, 0.3]);
      part(stand, Ico(0.25, 1), M(pick(['#ffafcc', '#cdb4db', '#a2d2ff'])), [-0.5 + i * 0.5, 2, 0.3]);
    }
    const sa = off - 1.6;
    put(g, stand, sa, 6.2, 0.9);
    face(stand, 1.5);
    D.hide.push(behind(sa, 6.2));

    // Guirlande d'ampoules entre la grande roue et le stand
    const bulbs = [];
    for (let i = 0; i < 14; i++) {
      const u = i / 13;
      const a = sa + (wa - sa + (wa < sa ? Math.PI * 2 : 0)) * u;
      const b = part(g, Ico(0.12, 0), E(pal[i % pal.length], 1), [
        Math.cos(a) * 7.6,
        6.5 - Math.sin(u * Math.PI) * 1.2,
        Math.sin(a) * 7.6,
      ]);
      bulbs.push(b);
    }
    D.ticks.push(t =>
      bulbs.forEach((b, i) => (b.material.emissiveIntensity = (Math.floor(t * 3) + i) % 3 ? 1.4 : 0.2)),
    );

    // Ballons qui flottent
    for (let i = 0; i < 4; i++) {
      const bl = new THREE.Group();
      part(bl, Ico(0.4, 1), M(pal[i], { roughness: 0.3 }), [0, 0, 0], [1, 1.2, 1]);
      part(bl, Cyl(0.01, 0.01, 1.6, 3), M('#ffffff'), [0, -1.2, 0]);
      const p = randInside();
      p.y = rnd(7, 10);
      bl.position.copy(p);
      g.add(bl);
      const ph = rnd(0, 6);
      D.ticks.push(t => (bl.position.y = p.y + Math.sin(t + ph) * 0.4));
    }
  },
});
