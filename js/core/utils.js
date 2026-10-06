/*
 * Petits outils partagés : hasard, maths, fabrication de matériaux et de formes low poly.
 */
'use strict';
if (!window.THREE) {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<p id="err">Impossible de charger le moteur 3D (three.js). Vérifie ta connexion internet puis recharge la page.</p>',
  );
  throw new Error('three.js introuvable');
}

const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const easeOutBack = x => {
  const c1 = 1.70158,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const names = list => {
  const n = list.map(s => s.name);
  return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' et ' + n[n.length - 1];
};
const UP = V(0, 1, 0),
  ZERO = V();
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

function M(color, o) {
  return new THREE.MeshStandardMaterial(
    Object.assign({ color, flatShading: true, roughness: 0.75, metalness: 0 }, o || {}),
  );
}
function E(color, i = 0.8, o) {
  return M(color, Object.assign({ emissive: color, emissiveIntensity: i }, o || {}));
}
function mk(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function part(g, geo, mat, p, s, r) {
  const m = mk(geo, mat);
  if (p) m.position.set(p[0], p[1], p[2]);
  if (s) m.scale.set(s[0], s[1], s[2]);
  if (r) m.rotation.set(r[0], r[1], r[2]);
  g.add(m);
  return m;
}
function jitter(geo, amt) {
  const p = geo.attributes.position,
    map = {};
  for (let i = 0; i < p.count; i++) {
    const k = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3);
    if (!map[k]) map[k] = [rnd(-amt, amt), rnd(-amt, amt), rnd(-amt, amt)];
    const o = map[k];
    p.setXYZ(i, p.getX(i) + o[0], p.getY(i) + o[1], p.getZ(i) + o[2]);
  }
  geo.computeVertexNormals();
  return geo;
}
const Ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);
const Cyl = (a, b, h, s = 6, open = false) => new THREE.CylinderGeometry(a, b, h, s, 1, open);
const Box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
const Cone = (r, h, s = 6, open = false) => new THREE.ConeGeometry(r, h, s, 1, open);
function disposeObj(o) {
  o.traverse(c => {
    if (c.geometry && !c.geometry.userData.keep) c.geometry.dispose();
    if (c.material) {
      (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => {
        if (m.userData && m.userData.keep) return;
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}
