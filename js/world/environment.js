/*
 * Vie du bocal : vagues de la surface, bulles, cycle jour/nuit.
 */
'use strict';
let simTime = 0;
// Variateur de lumière global : une activité (ex. le meurtre) peut baisser la lumière
// en réglant lightDimTarget (1 = normal, 0.3 = presque noir). Le retour se fait en douceur.
let lightDim = 1,
  lightDimTarget = 1;
function hourNow() {
  return ((8 * 60 + simTime * 2) % 1440) / 60;
}
function isNight() {
  const h = hourNow();
  return h >= 22 || h < 6;
}
const surfBase = Float32Array.from(surfGeo.attributes.position.array);
function environment(dt) {
  const p = surfGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = surfBase[i * 3],
      z = surfBase[i * 3 + 2];
    if (Math.hypot(x, z) > surfR * 0.98) continue;
    p.setY(i, Math.sin(x * 0.9 + simTime * 1.2) * 0.07 + Math.cos(z * 0.8 + simTime) * 0.07);
  }
  p.needsUpdate = true;
  for (const b of airBubbles) {
    b.position.y += b.userData.v * dt;
    b.position.x = BUBBLER.x + Math.sin(simTime * 3 + b.userData.ph) * 0.15;
    b.position.z = BUBBLER.z + Math.cos(simTime * 2.5 + b.userData.ph) * 0.15;
    if (b.position.y > WATER_Y - 0.05) b.position.y = 1.2;
  }
  const h = hourNow(),
    f = 0.5 + 0.5 * Math.cos(((h - 13) / 24) * Math.PI * 2);
  lightDim += (lightDimTarget - lightDim) * (1 - Math.exp(-dt * 2));
  sun.intensity = (0.3 + 0.45 * f) * lightDim;
  hemi.intensity = (0.4 + 0.3 * f) * (0.35 + 0.65 * lightDim);
  rayMat.opacity = (0.015 + 0.045 * f) * lightDim;
  rays.forEach((r, i) => {
    r.rotation.y += dt * 0.05;
    r.scale.x = r.scale.z = 1 + Math.sin(simTime * 0.7 + i) * 0.15;
  });
}
