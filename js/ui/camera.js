/*
 * Caméra orbitale : glisser pour tourner, molette/pincer pour zoomer, clic pour suivre une crevette.
 */
'use strict';
// Distance maximale : la caméra reste dans la cuisine.
const CAM_MAX_DIST = 38;
const cam = { th: 0.6, ph: 1.13, dist: 27, target: V(0, 5.2, 0), follow: null, idle: 0 };
const pointers = new Map();
let drag = null,
  hovered = null,
  showNames = false;
const ray = new THREE.Raycaster(),
  ndc = new THREE.Vector2();
function pickShrimp(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(
    shrimps.map(s => s.root),
    true,
  );
  if (!hits.length) return null;
  let o = hits[0].object;
  while (o && !o.userData.shrimp) o = o.parent;
  return o ? o.userData.shrimp : null;
}
function follow(s) {
  cam.follow = s;
  cam.idle = 0;
  if (s) {
    cam.dist = Math.min(cam.dist, 10);
    $('focus').hidden = false;
    updateFocus();
  } else $('focus').hidden = true;
}
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  drag = { moved: 0 };
  cam.idle = 0;
});
canvas.addEventListener('pointermove', e => {
  const p = pointers.get(e.pointerId);
  if (!p) {
    if (e.pointerType === 'mouse' && performance.now() - (canvas._hv || 0) > 80) {
      canvas._hv = performance.now();
      hovered = pickShrimp(e);
      canvas.style.cursor = hovered ? 'pointer' : '';
    }
    return;
  }
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const d0 = Math.hypot(a.x - b.x, a.y - b.y);
    p.x = e.clientX;
    p.y = e.clientY;
    const d1 = Math.hypot(a.x - b.x, a.y - b.y);
    if (d1 > 0) cam.dist = clamp((cam.dist * d0) / d1, 6, CAM_MAX_DIST);
    drag.moved += 10;
    return;
  }
  const dx = e.clientX - p.x,
    dy = e.clientY - p.y;
  p.x = e.clientX;
  p.y = e.clientY;
  if (drag) drag.moved += Math.abs(dx) + Math.abs(dy);
  cam.th += dx * 0.006;
  cam.ph = clamp(cam.ph - dy * 0.005, 0.2, 1.62);
  cam.idle = 0;
});
function endPointer(e, click) {
  pointers.delete(e.pointerId);
  if (click && drag && drag.moved < 6 && pointers.size === 0) {
    const s = pickShrimp(e);
    follow(s);
  }
  if (pointers.size === 0) drag = null;
}
canvas.addEventListener('pointerup', e => endPointer(e, true));
canvas.addEventListener('pointercancel', e => endPointer(e, false));
canvas.addEventListener(
  'wheel',
  e => {
    e.preventDefault();
    cam.dist = clamp(cam.dist * Math.exp(e.deltaY * 0.001), 6, CAM_MAX_DIST);
    cam.idle = 0;
  },
  { passive: false },
);
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT') return;
  if (e.key === 'Escape') follow(null);
  if (e.key === ' ' && e.target === document.body) {
    e.preventDefault();
    setSpeed(speed ? 0 : 1);
  }
});
const _tgt = V(0, 5.2, 0);
const _camRay = new THREE.Raycaster(),
  _camDir = V();
function updateCamera(rdt) {
  cam.idle += rdt;
  if (!cam.follow && cam.idle > 5 && !reduceMotion) cam.th += rdt * 0.045;
  cam.target.lerp(cam.follow ? cam.follow.pos : _tgt, 1 - Math.exp(-rdt * (cam.follow ? 3 : 1.5)));
  const s = Math.sin(cam.ph);
  camera.position.set(
    cam.target.x + s * Math.cos(cam.th) * cam.dist,
    cam.target.y + Math.cos(cam.ph) * cam.dist,
    cam.target.z + s * Math.sin(cam.th) * cam.dist,
  );
  // Si une chaise (ou un autre obstacle) se trouve entre la cible et la caméra, la caméra s'arrête devant.
  if (typeof cameraBlockers !== 'undefined' && cameraBlockers.length) {
    _camDir.subVectors(camera.position, cam.target);
    const d = _camDir.length();
    _camRay.set(cam.target, _camDir.divideScalar(d));
    _camRay.far = d;
    const hit = _camRay.intersectObjects(cameraBlockers, true)[0];
    if (hit) camera.position.copy(cam.target).addScaledVector(_camDir, Math.max(2, hit.distance - 1));
  }
  if (camera.position.y < 0.6) camera.position.y = 0.6;
  if (camera.position.y > ROOM.ceiling - 2) camera.position.y = ROOM.ceiling - 2;
  camera.lookAt(cam.target);
}
