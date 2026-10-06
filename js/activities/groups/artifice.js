/*
 * Feu d'artifice : la lumière baisse, deux artificières allument des fusées qui montent
 * vers la surface et éclatent en gerbes de couleurs. Le public fait « Oooooh ! ».
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makeRocket(color) {
  const g = new THREE.Group();
  part(g, Cyl(0.1, 0.1, 0.6, 6), M(color), [0, 0.3, 0]);
  part(g, Cone(0.12, 0.25, 6), M('#ffffff'), [0, 0.72, 0]);
  part(g, Cyl(0.01, 0.01, 0.8, 3), M('#8d6e63'), [0, -0.3, 0]);
  return g;
}

GROUPS.push({
  id: 'artifice',
  label: 'Feu d’artifice',
  min: 6,
  max: 12,
  status: 'regarde le feu d’artifice',
  gatherFrac: 0.8,
  gatherMax: 9,
  start(A) {
    const crew = A.m.slice(0, 2),
      crowd = A.m.slice(2);
    crew.forEach((s, i) => {
      s.goTo(V(-1.5 + i * 3, 2, -4.4), 1.4);
      s.faceObj = V(0, 6, 0);
      s.status = 'tire le feu d’artifice';
    });
    crowd.forEach((s, i) => {
      const a = Math.PI * 0.25 + (i / Math.max(1, crowd.length - 1)) * Math.PI * 0.5;
      s.goTo(V(Math.cos(a) * 4.6, 2.3 + (i % 2) * 0.7, Math.sin(a) * 4.6), 1.4);
      s.faceObj = V(0, 8, -2);
    });
    Object.assign(A.data, { crew, crowd, rockets: [], next: 0, lights: [] });
    lightDimTarget = 0.35;
    log(`🎆 Feu d’artifice tiré par ${names(crew)}.`, 'group');
    toast('Feu d’artifice');
  },
  play(A, t, dt) {
    const D = A.data;
    // Lancement d'une nouvelle fusée de temps en temps
    if (t > 1 && t < 15 && t > D.next) {
      D.next = t + rnd(0.5, 1.3);
      const s = pick(D.crew);
      const color = pick(['#ff006e', '#ffbe0b', '#3a86ff', '#06d6a0', '#c77dff', '#fb5607']);
      const r = makeRocket(color);
      r.position.copy(s.pos).add(V(0, 0.5, 0.5));
      A.prop(r);
      const light = new THREE.PointLight(color, 0, 14);
      A.prop(light);
      D.rockets.push({
        r,
        color,
        light,
        vy: rnd(4, 6),
        vx: rnd(-1, 1),
        vz: rnd(-0.3, 1.2),
        burstY: rnd(7.5, 10.5),
        burst: false,
        bt: 0,
      });
      s.say(pick(['Allumage !', 'Attention…', 'Et une !', '3, 2, 1…']), 1);
      s.flip(0.6);
    }
    D.rockets.forEach(k => {
      if (!k.burst) {
        k.r.position.x += k.vx * dt;
        k.r.position.y += k.vy * dt;
        k.r.position.z += k.vz * dt;
        if (Math.random() < 0.6) emit(k.r.position, '·', { color: '#ffd166', v: V(0, -0.6, 0), life: 0.5 });
        if (k.r.position.y >= k.burstY) {
          k.burst = true;
          k.r.visible = false;
          k.light.position.copy(k.r.position);
          k.light.intensity = 3;
          Sound.pop();
          for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2,
              b = rnd(-0.6, 0.6);
            emit(k.r.position, pick(['✦', '✧', '•', '*']), {
              color: k.color,
              v: V(Math.cos(a) * Math.cos(b) * 3, Math.sin(b) * 3 + 0.3, Math.sin(a) * Math.cos(b) * 3),
              life: 1.4,
            });
          }
          if (Math.random() < 0.5)
            pick(D.crowd).say(
              pick(['Oooooh !', 'Aaaaah !', 'Magnifique !', 'La bleue !', 'La rouge !']),
              1.2,
            );
        }
      } else {
        k.bt += dt;
        k.light.intensity = Math.max(0, 3 - k.bt * 3);
      }
    });
    D.crowd.forEach((s, i) => (s.pose.flip = -0.35 + Math.sin(t + i) * 0.05));
    // Bouquet final
    at(A, t, 15.5, () => {
      for (let n = 0; n < 4; n++) {
        const color = pick(['#ff006e', '#ffbe0b', '#3a86ff', '#06d6a0']);
        const p = V(rnd(-4, 4), rnd(8, 10.5), rnd(-3, 2));
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          emit(p, '✦', { color, v: V(Math.cos(a) * 3.5, rnd(-1, 1.5), Math.sin(a) * 3.5), life: 1.8 });
        }
      }
      Sound.pop();
      D.crowd.forEach(s => s.say(pick(['BRAVO !', '👏👏', 'Le bouquet final !']), 1.8));
      log('🎆 Bouquet final ! Le bocal applaudit.');
    });
    return t > 18.5;
  },
  end() {
    lightDimTarget = 1;
  },
});
