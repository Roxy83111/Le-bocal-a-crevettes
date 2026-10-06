/*
 * Outils pour construire les décors : placement, cachettes, rochers, coraux, algues…
 */
'use strict';
function put(g, o, a, r, y = 0.95) {
  o.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
  g.add(o);
  return o;
}
function behind(a, r, y = YMIN + 0.2) {
  return clampInside(V(Math.cos(a) * (r + 1.1), y, Math.sin(a) * (r + 1.1)), 1.1);
}
function rock(s, col) {
  const m = mk(jitter(Ico(s, 0), s * 0.25), M(col, { roughness: 0.9 }));
  m.scale.y = 0.7;
  m.rotation.y = rnd(0, 6);
  return m;
}
function coral(mat, len, rad, depth) {
  const g = new THREE.Group();
  part(g, Cyl(rad * 0.7, rad, len, 5), mat, [0, len / 2, 0]);
  if (depth > 0) {
    const n = rint(2, 3);
    for (let i = 0; i < n; i++) {
      const ch = coral(mat, len * 0.75, rad * 0.7, depth - 1);
      ch.position.y = len;
      ch.rotation.set(rnd(-0.7, 0.7), rnd(0, 3), rnd(-0.7, 0.7));
      g.add(ch);
    }
  } else part(g, Ico(rad * 1.2, 0), mat, [0, len, 0]);
  return g;
}
function seaweed(h, mat) {
  const root = new THREE.Group();
  let p = root;
  const segs = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const s = new THREE.Group();
    s.position.y = i ? h / n : 0;
    p.add(s);
    part(s, Box(0.28 * (1 - (i / n) * 0.6), h / n, 0.07), mat, [0, h / n / 2, 0]);
    segs.push(s);
    p = s;
  }
  root.userData.segs = segs;
  root.userData.ph = rnd(0, 6);
  return root;
}
function sway(sw, t) {
  const { segs, ph } = sw.userData;
  segs.forEach((s, i) => {
    s.rotation.z = Math.sin(t * 1.2 + ph + i * 0.5) * 0.13;
    s.rotation.x = Math.cos(t * 0.9 + ph + i * 0.4) * 0.08;
  });
}
function anemone(col) {
  const g = new THREE.Group(),
    m = M(col);
  part(g, Cyl(0.35, 0.45, 0.5, 7), M('#c9667a'), [0, 0.25, 0]);
  const tents = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const p = new THREE.Group();
    p.position.set(Math.cos(a) * 0.26, 0.5, Math.sin(a) * 0.26);
    p.rotation.y = -a;
    const cg = Cone(0.06, 0.65, 4);
    cg.translate(0, 0.32, 0);
    const c = mk(cg, m);
    c.rotation.z = -0.5;
    p.add(c);
    g.add(p);
    tents.push(c);
  }
  g.userData.tents = tents;
  return g;
}
function starfish(col) {
  const g = new THREE.Group(),
    m = M(col);
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Group();
    p.rotation.y = (i / 5) * Math.PI * 2;
    part(p, Cone(0.12, 0.5, 4), m, [0.25, 0, 0], [0.4, 1, 1], [0, 0, -Math.PI / 2]);
    g.add(p);
  }
  part(g, Ico(0.13), m, [0, 0, 0], [1, 0.4, 1]);
  return g;
}
function face(o, y = 1.5) {
  o.lookAt(0, y, 0);
}

// Liste des décors : chaque fichier de js/decors/themes/ y ajoute le sien.
const THEMES = [];
