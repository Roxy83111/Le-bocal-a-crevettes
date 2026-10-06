/*
 * Le monde 3D : moteur de rendu, lumières, table, verre du bocal, eau, sable, rayons et bulleur.
 * Le profil du bocal (PROFILE / rAt) définit aussi les limites où les crevettes peuvent nager.
 */
'use strict';
const PROFILE = [
  [7.5, 0],
  [9.6, 1.5],
  [10.6, 4],
  [10.8, 6.5],
  [10.2, 9],
  [8.8, 11.5],
  [8.2, 12.8],
  [8.7, 13.4],
];
function rAt(y) {
  if (y <= 0) return 7.5;
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [r0, y0] = PROFILE[i],
      [r1, y1] = PROFILE[i + 1];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 8.7;
}
const WATER_Y = 12,
  YMIN = 1.6,
  YMAX = 11;
function clampInside(p, margin = 1.2) {
  p.y = clamp(p.y, YMIN, YMAX);
  const rm = rAt(p.y) - margin;
  const h = Math.hypot(p.x, p.z);
  if (h > rm) {
    p.x *= rm / h;
    p.z *= rm / h;
  }
  return p;
}
function randInside() {
  const y = rnd(YMIN, YMAX);
  const r = Math.sqrt(Math.random()) * (rAt(y) - 1.6);
  const a = rnd(0, Math.PI * 2);
  return V(Math.cos(a) * r, y, Math.sin(a) * r);
}

const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0f3a52');
scene.fog = new THREE.Fog('#0f3a52', 34, 80);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
let W = 1,
  H = 1;
function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  camera.fov = W < H ? 62 : 45;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const hemi = new THREE.HemisphereLight('#c9f1ff', '#7a6a44', 0.75);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e0', 0.75);
sun.position.set(9, 24, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 60 });
scene.add(sun);
scene.add(new THREE.AmbientLight('#ffffff', 0.18));

// Table et objets autour du bocal
const table = mk(
  jitter(new THREE.BoxGeometry(48, 2, 34, 6, 1, 4), 0.12),
  M('#7d5236', { roughness: 0.9 }),
  0,
  -1,
  0,
);
table.castShadow = false;
scene.add(table);
(function outside() {
  const can = new THREE.Group();
  part(can, Cyl(1.2, 1.2, 2.8, 10), M('#f2c14e'), [0, 1.4, 0]);
  part(can, Cyl(1.22, 1.22, 1, 10), M('#e94f37'), [0, 1.5, 0]);
  part(can, Cyl(1.25, 1.25, 0.2, 10), M('#d9d9d9', { metalness: 0.5, roughness: 0.3 }), [0, 2.9, 0]);
  part(can, Ico(0.08), M('#8b4f2a'), [0.4, 3.05, 0.2]);
  part(can, Ico(0.08), M('#8b4f2a'), [-0.3, 3.05, -0.1]);
  can.position.set(14.5, 0, -4);
  scene.add(can);
  const pot = new THREE.Group();
  part(pot, Cyl(1.1, 0.8, 1.6, 8), M('#c4693d'), [0, 0.8, 0]);
  for (let i = 0; i < 7; i++) {
    const l = part(pot, Cone(0.35, 2.4, 4), M(pick(['#3f8f4a', '#58a65c', '#2f6f3a'])), [0, 2.2, 0]);
    l.rotation.set(rnd(-0.6, 0.6), rnd(0, 6), rnd(-0.6, 0.6));
    l.scale.z = 0.3;
  }
  pot.position.set(-15, 0, -5);
  scene.add(pot);
})();

// Verre
const glassGeo = new THREE.LatheGeometry(
  [new THREE.Vector2(0, 0), ...PROFILE.map(([r, y]) => new THREE.Vector2(r, y))],
  16,
);
const glass = new THREE.Mesh(
  glassGeo,
  new THREE.MeshStandardMaterial({
    color: '#d8f4f6',
    transparent: true,
    opacity: 0.12,
    roughness: 0.05,
    metalness: 0.25,
    flatShading: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
);
glass.renderOrder = 3;
scene.add(glass);
const glassEdges = new THREE.LineSegments(
  new THREE.EdgesGeometry(glassGeo, 10),
  new THREE.LineBasicMaterial({ color: '#e9ffff', transparent: true, opacity: 0.22 }),
);
scene.add(glassEdges);

// Eau
const wprof = [];
for (const [r, y] of PROFILE) {
  if (y < WATER_Y) wprof.push(new THREE.Vector2(r - 0.08, y));
}
wprof.push(new THREE.Vector2(rAt(WATER_Y) - 0.08, WATER_Y));
const waterMat = new THREE.MeshStandardMaterial({
  color: '#2aa7c9',
  transparent: true,
  opacity: 0.17,
  flatShading: true,
  side: THREE.BackSide,
  depthWrite: false,
  roughness: 0.3,
});
const water = new THREE.Mesh(new THREE.LatheGeometry(wprof, 16), waterMat);
water.renderOrder = 1;
scene.add(water);

function discGeo(R, rings, segs, hf) {
  const pos = [],
    idx = [];
  pos.push(0, hf(0, 0, 0), 0);
  for (let i = 1; i <= rings; i++) {
    const r = (R * i) / rings,
      off = (i % 2) * 0.5;
    for (let j = 0; j < segs; j++) {
      const a = ((j + off) / segs) * Math.PI * 2;
      const x = Math.cos(a) * r,
        z = Math.sin(a) * r;
      pos.push(x, hf(x, z, i / rings), z);
    }
  }
  for (let j = 0; j < segs; j++) idx.push(0, 1 + ((j + 1) % segs), 1 + j);
  for (let i = 1; i < rings; i++) {
    const s0 = 1 + (i - 1) * segs,
      s1 = 1 + i * segs;
    for (let j = 0; j < segs; j++) {
      const j1 = (j + 1) % segs;
      idx.push(s0 + j, s1 + j1, s1 + j, s0 + j, s0 + j1, s1 + j1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
const surfR = rAt(WATER_Y) - 0.12;
const surfGeo = discGeo(surfR, 4, 20, () => 0);
const surfMat = new THREE.MeshStandardMaterial({
  color: '#7fd6ea',
  transparent: true,
  opacity: 0.42,
  flatShading: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  roughness: 0.15,
  metalness: 0.1,
});
const surf = new THREE.Mesh(surfGeo, surfMat);
surf.position.y = WATER_Y;
surf.renderOrder = 2;
scene.add(surf);

// Sable
const sandMat = M('#ecd9a4', { roughness: 0.95 });
const sandGeo = discGeo(8.45, 7, 28, (x, z, f) =>
  f >= 0.999 ? 0 : ((Math.sin(x * 0.8) + Math.cos(z * 0.7)) * 0.12 + rnd(0, 0.2)) * (1 - f * f),
);
const sandH0 = Float32Array.from({ length: sandGeo.attributes.position.count }, (_, i) =>
  sandGeo.attributes.position.getY(i),
);
const sand = new THREE.Mesh(sandGeo, sandMat);
sand.position.y = 0.85;
sand.receiveShadow = true;
scene.add(sand);
const sandBody = mk(Cyl(8.48, 7.45, 0.85, 16), sandMat, 0, 0.43, 0);
sandBody.castShadow = false;
scene.add(sandBody);
let sandAmp = 1,
  sandAmpT = 1;
function applySand() {
  const p = sandGeo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, sandH0[i] * sandAmp);
  p.needsUpdate = true;
  sandGeo.computeVertexNormals();
}

// Rayons de lumière
const rayMat = new THREE.MeshBasicMaterial({
  color: '#bff3ff',
  transparent: true,
  opacity: 0.05,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const rays = [];
for (let i = 0; i < 5; i++) {
  const g = Cone(1.3, 10.5, 5, true);
  const m = new THREE.Mesh(g, rayMat);
  const a = (i / 5) * 6.28 + 0.4;
  m.position.set(Math.cos(a) * 4.2, WATER_Y - 5.2, Math.sin(a) * 4.2);
  m.rotation.z = rnd(-0.15, 0.15);
  m.renderOrder = 4;
  scene.add(m);
  rays.push(m);
}

// Bulleur
const bubMat = new THREE.MeshStandardMaterial({
  color: '#e8fbff',
  transparent: true,
  opacity: 0.55,
  flatShading: true,
  roughness: 0.1,
  depthWrite: false,
});
const BUBBLER = V(Math.cos(2.4) * 7.2, 1.1, Math.sin(2.4) * 7.2);
const stone = mk(jitter(Ico(0.55, 0), 0.12), M('#5c6670'), BUBBLER.x, 1.05, BUBBLER.z);
stone.scale.y = 0.6;
scene.add(stone);
const airBubbles = [];
for (let i = 0; i < 26; i++) {
  const b = new THREE.Mesh(Ico(rnd(0.06, 0.16), 0), bubMat);
  b.position.set(BUBBLER.x, rnd(1.2, WATER_Y), BUBBLER.z);
  b.userData.v = rnd(1.4, 2.4);
  b.userData.ph = rnd(0, 6);
  scene.add(b);
  airBubbles.push(b);
}
