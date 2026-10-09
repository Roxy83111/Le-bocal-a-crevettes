/*
 * Granulés de nourriture qui tombent dans le bocal.
 */
'use strict';
const pellets = [];
const pelletGeo = Ico(0.09, 0);
pelletGeo.userData.keep = true;
const pelletMat = M('#8b4f2a');
pelletMat.userData.keep = true;
function dropPellets(n, center) {
  Hooks.emit('feed', n);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(pelletGeo, pelletMat);
    m.castShadow = true;
    const c = center || randInside();
    const p = V(c.x + rnd(-1.6, 1.6), WATER_Y - 0.1, c.z + rnd(-1.6, 1.6));
    clampInside(p, 1.4);
    p.y = WATER_Y - 0.1;
    m.position.copy(p);
    scene.add(m);
    pellets.push({ mesh: m, vy: -rnd(0.5, 0.95), claims: 0, age: 0, gone: false, ph: rnd(0, 6) });
  }
}
function eatPellet(p) {
  if (p.gone) return;
  p.gone = true;
  scene.remove(p.mesh);
  pellets.splice(pellets.indexOf(p), 1);
}
function nearestPellet(pos) {
  let best = null,
    bd = 1e9;
  for (const p of pellets) {
    if (p.claims >= 2) continue;
    const d = p.mesh.position.distanceTo(pos);
    if (d < bd && d < 14) {
      bd = d;
      best = p;
    }
  }
  return best;
}
function updatePellets(dt) {
  for (let i = pellets.length - 1; i >= 0; i--) {
    const p = pellets[i],
      m = p.mesh;
    p.age += dt;
    if (m.position.y > 1.15) {
      m.position.y += p.vy * dt;
      m.position.x += Math.sin(p.age * 2 + p.ph) * 0.25 * dt;
      m.rotation.x += dt * 2;
      m.rotation.z += dt;
    }
    if (p.age > 50) eatPellet(p);
  }
}
