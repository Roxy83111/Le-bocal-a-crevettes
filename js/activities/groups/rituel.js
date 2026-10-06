/*
 * Rituel mystique : invocation d’une divinité qui fait pleuvoir des granulés.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'rituel',
  label: 'Rituel mystique',
  min: 6,
  max: 10,
  status: 'participe à un rituel',
  gatherFrac: 0.85,
  gatherMax: 10,
  start(A) {
    const n = A.m.length,
      c = V(0, 2.8, 0);
    A.data.c = c;
    A.m.forEach((s, i) => {
      const a = (i / n) * Math.PI * 2;
      s.goTo(V(Math.cos(a) * 3.2, 2.8, Math.sin(a) * 3.2), 1.5);
      s.faceObj = c;
    });
    const cr = A.prop(mk(new THREE.OctahedronGeometry(0.5, 0), E('#c77dff', 0.8, { roughness: 0.2 })));
    cr.position.copy(c);
    cr.scale.setScalar(0.01);
    const gl = new THREE.PointLight('#c77dff', 0, 10);
    gl.position.copy(c);
    A.prop(gl);
    Object.assign(A.data, { cr, gl, god: pick(DEITIES) });
    log(`🕯️ ${names(A.m)} forment un cercle et invoquent ${A.data.god.name}.`, 'group');
    toast('Rituel mystique');
  },
  play(A, t, dt) {
    const D = A.data,
      n = A.m.length;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('mystic');
    }
    A.m.forEach((s, i) => {
      const a = (i / n) * Math.PI * 2 + t * 0.25;
      s.goTo(V(Math.cos(a) * 3.2, 2.8 + Math.sin(t * 1.5 + i) * 0.15, Math.sin(a) * 3.2), 2);
      s.pose.flip = t < 7 ? Math.max(0, Math.sin(t * 2 + i * 0.3)) * 0.45 : 0;
    });
    const g = Math.min(1, t / 5);
    D.cr.scale.setScalar(0.01 + g);
    D.cr.rotation.y += dt * 1.5;
    D.gl.intensity = g * 1.5;
    if (t < 7 && Math.random() < dt * 0.9)
      pick(A.m).say(pick(['Ommmm…', `Ô ${D.god.short}…`, '🕯️', 'Hmmmmm…']), 1.4);
    at(A, t, 7, () => {
      const m = D.god.make();
      m.position.set(0, YMAX - 1.2, 0);
      m.scale.setScalar(0.01);
      m.traverse(c => {
        if (c.isMesh) c.castShadow = true;
      });
      A.prop(m);
      D.m = m;
      D.mt = 0;
      log(`✨ ${D.god.name.charAt(0).toUpperCase() + D.god.name.slice(1)} apparaît dans le bocal !`);
      toast(D.god.name.charAt(0).toUpperCase() + D.god.name.slice(1));
      A.m.forEach(s => s.say(pick(['😱', '🙏', 'Ça a marché ?!', 'Ooooh']), 1.8));
    });
    if (D.m) {
      D.mt += dt;
      const s =
        t < 14 ? easeOutBack(Math.min(1, D.mt / 1.5)) * 1.6 : Math.max(0.01, 1.6 * (1 - (t - 14) / 1.5));
      D.m.scale.setScalar(Math.max(0.01, s));
      D.m.rotation.y += dt * 0.8;
      D.m.position.y = YMAX - 1.4 + Math.sin(t * 1.5) * 0.3 + (t > 14 ? (t - 14) * 2 : 0);
    }
    at(A, t, 9, () => speakAt(() => _a.copy(D.m.position).add(V(0, 2, 0)), pick(D.god.lines), 3, 'say god'));
    at(A, t, 10.5, () => {
      dropPellets(14, V(0, 0, 0));
      A.m.forEach(s => s.flip(1));
      log('🌧️ Il pleut des granulés. Le rituel est un succès.');
    });
    if (t > 14) {
      D.cr.scale.setScalar(Math.max(0.01, 1 - (t - 14)));
      D.gl.intensity = Math.max(0, 1.5 - (t - 14) * 1.5);
    }
    return t > 16;
  },
});
