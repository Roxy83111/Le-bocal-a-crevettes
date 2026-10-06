/*
 * Hitbox des crevettes : chaque crevette est une « gélule » (capsule) qui suit son corps,
 * de la tête jusqu'à la queue. Après chaque déplacement, les gélules qui se chevauchent
 * sont écartées : les crevettes ne peuvent plus se traverser.
 * Le bouton « Hitbox » affiche ces gélules en fil de fer.
 */
'use strict';

// Dimensions dans le repère de la crevette (multipliées par sa taille).
const HITBOX = {
  front: V(0, 0, 0.55), // centre de la tête
  back: V(0, -0.12, -1.25), // bout de la queue (légèrement recourbée vers le bas)
  radius: 0.3,
};
const COLLISION_PASSES = 3;

const _d1 = V(),
  _d2 = V(),
  _r = V(),
  _c1 = V(),
  _c2 = V(),
  _n = V();

// Met à jour les deux extrémités de la gélule en coordonnées du monde.
function updateCapsule(s) {
  if (!s.hitA) {
    s.hitA = V();
    s.hitB = V();
  }
  s.hitA.copy(HITBOX.front).multiplyScalar(s.size).applyQuaternion(s.root.quaternion).add(s.pos);
  s.hitB.copy(HITBOX.back).multiplyScalar(s.size).applyQuaternion(s.root.quaternion).add(s.pos);
  s.hitR = HITBOX.radius * s.size;
}

// Points les plus proches entre les segments [p1,q1] et [p2,q2] (méthode classique d'Ericson).
function closestSegments(p1, q1, p2, q2, out1, out2) {
  const d1 = _d1.subVectors(q1, p1),
    d2 = _d2.subVectors(q2, p2),
    r = _r.subVectors(p1, p2);
  const a = d1.dot(d1),
    e = d2.dot(d2),
    f = d2.dot(r);
  let s = 0,
    t = 0;
  if (a > 1e-9 || e > 1e-9) {
    if (a <= 1e-9) t = clamp(f / e, 0, 1);
    else {
      const c = d1.dot(r);
      if (e <= 1e-9) s = clamp(-c / a, 0, 1);
      else {
        const b = d1.dot(d2),
          den = a * e - b * b;
        s = den !== 0 ? clamp((b * f - c * e) / den, 0, 1) : 0;
        t = (b * s + f) / e;
        if (t < 0) {
          t = 0;
          s = clamp(-c / a, 0, 1);
        } else if (t > 1) {
          t = 1;
          s = clamp((b - c) / a, 0, 1);
        }
      }
    }
  }
  out1.copy(p1).addScaledVector(d1, s);
  out2.copy(p2).addScaledVector(d2, t);
  return out1.distanceTo(out2);
}

function resolveCollisions() {
  const list = shrimps.filter(s => s.root.visible && !s.noCollide);
  for (let pass = 0; pass < COLLISION_PASSES; pass++) {
    for (const s of list) updateCapsule(s);
    let moved = false;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        // Test rapide : trop loin pour se toucher.
        if (a.pos.distanceToSquared(b.pos) > 9) continue;
        const d = closestSegments(a.hitA, a.hitB, b.hitA, b.hitB, _c1, _c2);
        const minD = a.hitR + b.hitR;
        if (d >= minD) continue;
        if (d > 1e-5) _n.subVectors(_c1, _c2).divideScalar(d);
        else _n.set(rnd(-1, 1), rnd(-0.3, 0.3), rnd(-1, 1)).normalize();
        const push = (minD - d) * 0.5;
        a.pos.addScaledVector(_n, push);
        b.pos.addScaledVector(_n, -push);
        // On annule la vitesse qui les rapproche, pour éviter qu'ils « forcent ».
        const rel = _r.subVectors(a.vel, b.vel).dot(_n);
        if (rel < 0) {
          a.vel.addScaledVector(_n, -rel * 0.5);
          b.vel.addScaledVector(_n, rel * 0.5);
        }
        clampInside(a.pos, 1.05);
        clampInside(b.pos, 1.05);
        moved = true;
      }
    }
    if (!moved) break;
  }
}

/* ---------- Affichage des hitbox (bouton « Hitbox ») ---------- */
let hitboxesVisible = false;
const hitboxMat = new THREE.MeshBasicMaterial({
  color: '#7df9ff',
  wireframe: true,
  transparent: true,
  opacity: 0.55,
});
hitboxMat.userData.keep = true;

function makeHitboxMesh() {
  const g = new THREE.Group();
  const dir = HITBOX.back.clone().sub(HITBOX.front);
  const len = dir.length();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(HITBOX.radius, HITBOX.radius, len, 8, 1, true),
    hitboxMat,
  );
  body.position.copy(HITBOX.front).addScaledVector(dir, 0.5);
  body.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  g.add(body);
  for (const p of [HITBOX.front, HITBOX.back]) {
    const sph = new THREE.Mesh(new THREE.SphereGeometry(HITBOX.radius, 8, 6), hitboxMat);
    sph.position.copy(p);
    g.add(sph);
  }
  return g;
}

function setHitboxesVisible(on) {
  hitboxesVisible = on;
  for (const s of shrimps) {
    if (!s.hitboxMesh) {
      s.hitboxMesh = makeHitboxMesh();
      s.root.add(s.hitboxMesh);
    }
    s.hitboxMesh.visible = on;
  }
}
// Les crevettes ajoutées plus tard suivent le réglage en cours.
Hooks.on('shrimp:create', s => {
  if (hitboxesVisible) {
    s.hitboxMesh = makeHitboxMesh();
    s.root.add(s.hitboxMesh);
  }
});
