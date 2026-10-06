/*
 * Décor « Île tropicale » : un îlot de sable avec des palmiers, un hamac, un parasol,
 * des torches tiki et un petit coffre de vacances.
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
function palmTree(h) {
  const g = new THREE.Group();
  const trunk = M('#9c6b3c', { roughness: 0.9 }),
    leaf = M(pick(['#2d9b4f', '#3fa34d', '#52b788']), { side: THREE.DoubleSide });
  // Tronc en anneaux, légèrement courbé
  let y = 0;
  for (let i = 0; i < 6; i++) {
    const r = 0.28 - i * 0.025;
    part(
      g,
      Cyl(r * 0.85, r, h / 6, 6),
      trunk,
      [Math.sin(i * 0.35) * 0.35, y + h / 12, 0],
      null,
      [0, 0, -0.08],
    );
    y += h / 6;
  }
  const top = V(Math.sin(5 * 0.35) * 0.35, y, 0);
  // Palmes : cônes aplatis qui retombent
  const leaves = new THREE.Group();
  leaves.position.copy(top);
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Group();
    p.rotation.y = (i / 7) * Math.PI * 2;
    const lg = Cone(0.35, 2.4, 4);
    lg.translate(0, 1.2, 0);
    const l = mk(lg, leaf);
    l.scale.set(1, 1, 0.15);
    l.rotation.z = -1.1;
    p.add(l);
    leaves.add(p);
  }
  for (let i = 0; i < 3; i++)
    part(leaves, Ico(0.2, 0), M('#6b4226'), [Math.cos(i * 2) * 0.25, -0.2, Math.sin(i * 2) * 0.25]);
  g.add(leaves);
  g.userData.leaves = leaves;
  return g;
}

THEMES.push({
  name: 'Île tropicale',
  water: '#1fb5c9',
  sand: '#f4dfa1',
  bg: '#0e4d64',
  sky: '#fff3c4',
  ground: '#c9a86a',
  amp: 0.8,
  build(g, D) {
    const off = rnd(0, 6.28);
    // L'îlot : une butte de sable plus claire
    const isle = part(
      g,
      jitter(new THREE.SphereGeometry(3.2, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), 0.12),
      M('#fbe7b2'),
      [0, 0, 0],
      [1.4, 0.35, 1],
    );
    put(g, isle, off, 5.4, 0.85);
    isle.rotation.y = -off;
    // Palmiers sur l'îlot
    const palms = [];
    for (let i = 0; i < 3; i++) {
      const p = palmTree(rnd(4, 6));
      const a = off + (i - 1) * 0.45,
        r = 5.4 + rnd(-0.6, 0.8);
      put(g, p, a, r, 1.3);
      p.rotation.y = rnd(0, 6);
      palms.push(p);
      D.hide.push(behind(a, r));
    }
    D.ticks.push(t => palms.forEach((p, i) => (p.userData.leaves.rotation.z = Math.sin(t * 0.8 + i) * 0.08)));
    // Hamac entre deux poteaux
    const ham = new THREE.Group();
    for (const s of [-1, 1]) part(ham, Cyl(0.1, 0.12, 2.6, 5), M('#8d6e63'), [s * 1.6, 1.3, 0]);
    const net = part(
      ham,
      new THREE.SphereGeometry(1.6, 10, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 4),
      M('#e76f51', { side: THREE.DoubleSide }),
      [0, 2.4, 0],
      [1, 0.5, 0.35],
    );
    const ha = off + 1.6;
    put(g, ham, ha, 6.4, 0.9);
    face(ham, 1.5);
    D.ticks.push(t => (net.rotation.x = Math.sin(t * 1.2) * 0.12));
    // Parasol rayé + serviette
    const um = new THREE.Group();
    part(um, Cyl(0.06, 0.06, 3.4, 5), M('#ffffff'), [0, 1.7, 0], null, [0, 0, 0.12]);
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Group();
      p.rotation.y = (i / 8) * Math.PI * 2;
      const sg = Cone(1.8, 0.6, 3, true);
      p.add(mk(sg, M(i % 2 ? '#ffffff' : '#ef476f', { side: THREE.DoubleSide })));
      p.children[0].position.y = 3.3;
      p.children[0].scale.set(0.5, 1, 1);
      um.add(p);
    }
    part(um, Box(1.4, 0.05, 2.4), M('#118ab2'), [0.9, 0.05, 0.5], null, [0, 0.3, 0]);
    const ua = off - 1.5;
    put(g, um, ua, 6.2, 0.95);
    // Torches tiki
    for (let i = 0; i < 3; i++) {
      const tk = new THREE.Group();
      part(tk, Cyl(0.08, 0.1, 2.6, 5), M('#6b4226'), [0, 1.3, 0]);
      part(tk, Cyl(0.2, 0.15, 0.5, 6), M('#a47148'), [0, 2.7, 0]);
      const fl = part(tk, Cone(0.18, 0.5, 5), E('#ff9f1c', 1.4), [0, 3.15, 0]);
      const a = off + 2.5 + i * 0.6;
      put(g, tk, a, 7, 0.9);
      D.ticks.push(t => fl.scale.set(1, 0.8 + Math.random() * 0.5, 1));
    }
    // Coquillages et étoiles de mer sur la plage
    for (let i = 0; i < 5; i++)
      part(
        g,
        new THREE.SphereGeometry(0.25, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2),
        M(pick(['#ffd6a5', '#ffadad', '#fdffb6'])),
        [Math.cos(off + rnd(-1, 1)) * rnd(3, 7), 1.05, Math.sin(off + rnd(-1, 1)) * rnd(3, 7)],
        [1, 0.6, 1],
      );
    for (let i = 0; i < 2; i++)
      put(g, starfish(pick(['#ff7b5c', '#ffb703'])), rnd(0, 6.28), rnd(3, 6.5), 1.2);
    // Petit coffre de vacances (glacière)
    const cool = new THREE.Group();
    part(cool, Box(1.2, 0.8, 0.8), M('#06d6a0'), [0, 0.4, 0]);
    part(cool, Box(1.25, 0.2, 0.85), M('#ffffff'), [0, 0.85, 0]);
    const ca = off + 3.4;
    put(g, cool, ca, 5, 0.9);
    D.hide.push(behind(ca, 5));
  },
});
