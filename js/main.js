/*
 * Démarrage : crée les crevettes et le premier décor, puis lance la boucle d’animation.
 */
'use strict';
fillGroupSelect();
for (let i = 0; i < 14; i++) new Shrimp();
setDecor(rint(0, THEMES.length - 1), true);
renderList();
log(`🫙 Bienvenue dans le bocal. ${shrimps.length} crevettes s’installent.`, 'decor');
Hooks.emit('start');
let last = performance.now(),
  uiT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const rdt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const total = rdt * speed;
  const n = Math.max(1, Math.ceil(total / 0.05));
  const dt = total / n;
  if (total > 0)
    for (let i = 0; i < n; i++) {
      simTime += dt;
      decorT += dt;
      separation();
      schedule(dt);
      acts.slice().forEach(a => a.step(dt));
      for (const s of shrimps) s.update(dt, simTime);
      resolveCollisions();
      updatePellets(dt);
      environment(dt);
      Hooks.emit('tick', dt);
      if (decorT > DECOR_PERIOD) nextDecor();
    }
  decorUpdate(total, rdt);
  Hooks.emit('frame', total, rdt);
  updateCamera(rdt);
  renderer.render(scene, camera);
  overlay(total);
  uiT -= rdt;
  if (uiT <= 0) {
    uiT = 0.4;
    const c = clockStr();
    $('clock').textContent = `Jour ${c.d} · ${c.hh}`;
    $('decorBar').style.width = Math.min(100, (decorT / DECOR_PERIOD) * 100) + '%';
    shrimps.forEach(s => {
      if (s.listStatus) s.listStatus.textContent = s.status;
    });
    updateFocus();
  }
}
requestAnimationFrame(frame);
