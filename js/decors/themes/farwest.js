/*
 * Décor « Far West » : saloon avec portes battantes, cactus, château d'eau, chariot,
 * et un buisson qui roule dans le vent.
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
function cactus(h) {
  const g = new THREE.Group(),
    green = M('#4c8c3a', { roughness: 0.8 });
  part(g, jitter(Cyl(0.32, 0.38, h, 7), 0.03), green, [0, h / 2, 0]);
  part(g, Ico(0.33, 1), green, [0, h, 0], [1, 0.6, 1]);
  for (const s of [-1, 1]) {
    if (Math.random() < 0.25) continue;
    const y = rnd(h * 0.35, h * 0.6),
      l = rnd(0.5, 1);
    part(g, Cyl(0.2, 0.2, 0.7, 6), green, [s * 0.5, y, 0], null, [0, 0, Math.PI / 2]);
    part(g, Cyl(0.18, 0.2, l, 6), green, [s * 0.85, y + l / 2, 0]);
    part(g, Ico(0.19, 0), green, [s * 0.85, y + l, 0]);
  }
  if (Math.random() < 0.5) part(g, Ico(0.12, 0), M('#ff70a6'), [0, h + 0.2, 0]);
  return g;
}

THEMES.push({
  name: 'Far West',
  water: '#c9874a',
  sand: '#e0b47a',
  bg: '#3d1f12',
  sky: '#ffe2b8',
  ground: '#9c5a2e',
  amp: 0.9,
  build(g, D) {
    const off = rnd(0, 6.28);
    const wood = M('#8d5a34', { roughness: 0.9 }),
      dark = M('#5c3a21');

    // Saloon : façade haute, véranda, portes battantes
    const sal = new THREE.Group();
    part(sal, Box(3.6, 2.6, 2), wood, [0, 1.3, 0]);
    part(sal, Box(3.8, 1.2, 0.2), M('#b5835a'), [0, 3.1, 0.95]);
    part(sal, Box(3.2, 0.5, 0.05), M('#f1e3c8'), [0, 3.1, 1.06]);
    for (let i = 0; i < 6; i++) part(sal, Box(0.3, 0.12, 0.03), M('#5c3a21'), [-1.1 + i * 0.44, 3.1, 1.09]);
    part(sal, Box(4, 0.12, 1), dark, [0, 2.2, 1.45]);
    for (const s of [-1.8, 1.8]) part(sal, Cyl(0.06, 0.06, 2.2, 5), dark, [s, 1.1, 1.9]);
    part(sal, Box(4, 0.15, 1.2), M('#a47148'), [0, 0.07, 1.5]);
    for (const s of [-1, 1])
      part(sal, Box(0.6, 0.4, 0.05), M('#ffd166', { emissive: '#ffb703', emissiveIntensity: 0.4 }), [
        s * 1.2,
        1.5,
        1.01,
      ]);
    const doors = [];
    for (const s of [-1, 1]) {
      const p = new THREE.Group();
      p.position.set(s * 0.5, 1.1, 1.02);
      part(p, Box(0.48, 0.7, 0.05), M('#6b4226'), [-s * 0.24, 0, 0]);
      sal.add(p);
      doors.push({ p, s });
    }
    const sa = off;
    put(g, sal, sa, 6.2, 0.9);
    face(sal, 1.5);
    D.hide.push(behind(sa, 6.2), behind(sa + 0.35, 6));
    D.ticks.push(t => doors.forEach(({ p, s }) => (p.rotation.y = s * Math.max(0, Math.sin(t * 1.3)) * 0.8)));

    // Cactus
    for (let i = 0; i < 6; i++) {
      const c = cactus(rnd(1.4, 3.2));
      const a = off + 1.2 + i * 0.8,
        r = rnd(4.4, 7.2);
      put(g, c, a, r, 0.95);
      c.rotation.y = rnd(0, 6);
      if (i % 2 === 0) D.hide.push(behind(a, r));
    }

    // Château d'eau
    const tw = new THREE.Group();
    for (const [x, z] of [
      [-0.8, -0.8],
      [0.8, -0.8],
      [-0.8, 0.8],
      [0.8, 0.8],
    ])
      part(tw, Box(0.15, 4, 0.15), dark, [x, 2, z]);
    part(tw, Cyl(1.2, 1.2, 1.8, 10), wood, [0, 4.9, 0]);
    part(tw, Cone(1.35, 0.8, 10), dark, [0, 6.2, 0]);
    for (const y of [4.3, 5.5])
      part(tw, new THREE.TorusGeometry(1.22, 0.05, 3, 12), M('#333'), [0, y, 0], null, [Math.PI / 2, 0, 0]);
    put(g, tw, off - 1.6, 6.6, 0.9);

    // Chariot avec bâche
    const wag = new THREE.Group();
    part(wag, Box(2.4, 0.6, 1.2), wood, [0, 0.9, 0]);
    part(
      wag,
      new THREE.CylinderGeometry(0.75, 0.75, 2.3, 10, 1, true, 0, Math.PI),
      M('#f1e3c8', { side: THREE.DoubleSide }),
      [0, 1.2, 0],
      null,
      [0, 0, Math.PI / 2],
    );
    for (const x of [-0.9, 0.9])
      for (const z of [-0.7, 0.7]) {
        const w = part(wag, new THREE.TorusGeometry(0.42, 0.06, 4, 10), dark, [x, 0.45, z]);
        for (let k = 0; k < 3; k++)
          part(w, Box(0.8, 0.05, 0.05), dark, [0, 0, 0], null, [0, 0, (k / 3) * Math.PI]);
      }
    const wa = off + 2.9;
    put(g, wag, wa, 5.4, 0.9);
    wag.rotation.y = rnd(0, 6);
    D.hide.push(behind(wa, 5.4));

    // Buisson virevoltant qui traverse le bocal
    const tumble = new THREE.Group();
    for (let k = 0; k < 5; k++)
      part(tumble, new THREE.TorusGeometry(0.45, 0.03, 3, 8), M('#a47148'), [0, 0, 0], null, [
        rnd(0, 3),
        rnd(0, 3),
        rnd(0, 3),
      ]);
    g.add(tumble);
    D.ticks.push(t => {
      const u = ((t * 0.12) % 1) * 2 - 1;
      tumble.position.set(u * 6.5, 1.5 + Math.abs(Math.sin(t * 3)) * 0.6, Math.cos(off) * 2);
      tumble.rotation.z = -t * 3;
    });

    // Crâne de vache (os blanc) et rochers rouges
    const sk = new THREE.Group();
    part(sk, Ico(0.35, 0), M('#f5f0e1'), [0, 0.3, 0], [1, 0.8, 1.3]);
    for (const s of [-1, 1])
      part(sk, Cone(0.07, 0.6, 5), M('#f5f0e1'), [s * 0.4, 0.45, -0.1], null, [0, 0, -s * 1.2]);
    put(g, sk, rnd(0, 6.28), rnd(3, 5), 1);
    for (let i = 0; i < 4; i++) put(g, rock(rnd(0.5, 1.1), '#b5562b'), rnd(0, 6.28), rnd(4, 7.5), 1);
  },
});
