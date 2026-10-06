/*
 * Danse classique : « Le Lac des Crevettes ». Les danseuses enfilent un tutu, se dressent sur la pointe
 * de la queue, enchaînent pirouettes, grands jetés et un pas de deux, puis saluent sous une pluie de roses.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makeTutu() {
  const g = new THREE.Group();
  const tulle = M(pick(['#ffc8dd', '#ffffff', '#cdb4db', '#bde0fe']), {
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    roughness: 0.6,
  });
  const ring = jitter(new THREE.RingGeometry(0.22, 0.75, 12, 1), 0.04);
  ring.rotateX(-Math.PI / 2);
  part(g, ring, tulle, [0, 0, 0]);
  part(g, ring.clone(), tulle, [0, -0.06, 0], [0.85, 1, 0.85], [0, 0.3, 0]);
  g.position.set(0, -0.05, -0.15);
  g.userData.isHat = false;
  return g;
}

GROUPS.push({
  id: 'classique',
  label: 'Danse classique',
  min: 6,
  max: 10,
  status: 'danse « Le Lac des Crevettes »',
  gatherFrac: 0.8,
  gatherMax: 9,
  start(A) {
    const [star, partner, ...corps] = A.m;
    Object.assign(A.data, { star, partner, corps });
    A.m.forEach((s, i) => {
      s.addTemp(makeTutu());
      const a = Math.PI * 0.15 + (i / (A.m.length - 1)) * Math.PI * 0.7;
      s.home = V(Math.cos(a) * 4.2, 3, -Math.sin(a) * 3);
      s.goTo(s.home, 1.6);
      s.faceObj = V(0, 3, 8);
    });
    log(`🩰 Ballet : « Le Lac des Crevettes », avec ${star.name} en danseuse étoile.`, 'group');
    toast('Le Lac des Crevettes');
  },
  play(A, t, dt) {
    const D = A.data;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('valse');
    }
    // Tout le monde est « sur pointes » : dressé sur la queue.
    A.m.forEach(s => {
      s.pose.flip = -1.15;
      s.pose.curl = 0.25;
    });
    if (t < 5) {
      // 1. Pirouettes en cascade
      A.m.forEach((s, i) => {
        at(A, t, 0.6 + i * 0.35, () => s.twirl(0.7));
        at(A, t, 2.8 + i * 0.25 + 0.001, () => s.twirl(0.6));
        s.goTo(s.home, 1.4);
      });
      at(A, t, 0.2, () => D.star.say('Et un, et deux, et trois…', 2));
    } else if (t < 10) {
      // 2. Grands jetés : chacun traverse la scène en arc
      A.m.forEach((s, i) => {
        const u = clamp((t - 5 - i * 0.3) / 2.5, 0, 1);
        const from = s.home,
          to = V(-s.home.x, s.home.y, s.home.z);
        const p = from.clone().lerp(to, u);
        p.y += Math.sin(u * Math.PI) * 3;
        s.goTo(p, 3.5);
        s.pose.flip = -0.4;
      });
      at(A, t, 5.2, () => pick(D.corps).say('Grand jeté !', 1.4));
      if (Math.random() < dt * 3) emit(pick(A.m).headPos(), pick(['♪', '♫', '✧']));
    } else if (t < 16) {
      // 3. Pas de deux : le partenaire soulève l'étoile au centre
      D.corps.forEach((s, i) => {
        const a = (i / D.corps.length) * Math.PI * 2 + t * 0.3;
        s.goTo(V(Math.cos(a) * 4.6, 2.6, Math.sin(a) * 4.6), 2);
        s.faceObj = D.star;
        s.pose.roll = Math.sin(t * 2 + i) * 0.2;
      });
      D.partner.goTo(V(0, 2.6, 0), 2);
      D.partner.faceObj = V(0, 2.6, 8);
      const lift = clamp((t - 11) / 1.5, 0, 1);
      D.star.goTo(V(0, 2.7 + lift * 1.6, 0.3), 2.5);
      D.star.faceObj = V(0, 5, 8);
      if (lift > 0.5) {
        D.star.pose.flip = -0.3;
        D.star.pose.roll = Math.sin(t * 3) * 0.2;
      }
      at(A, t, 12.5, () => D.star.twirl(1.2));
      at(A, t, 13, () => D.star.say('✨ Magnifique…', 1.8));
    } else {
      // 4. Révérence et pluie de roses
      A.m.forEach((s, i) => {
        s.goTo(s.home, 1.6);
        s.faceObj = V(0, 3, 8);
        s.pose.flip = 0.45;
        s.pose.curl = 0;
      });
      at(A, t, 16.3, () => {
        for (let i = 0; i < 12; i++)
          emit(V(rnd(-4, 4), YMAX - 1, rnd(-2, 2)), '🌹', { v: V(rnd(-0.3, 0.3), -rnd(1, 2), 0), life: 3 });
        log('🌹 Standing ovation : des roses pleuvent sur la scène.');
      });
    }
    return t > 19.5;
  },
  end(A) {
    A.m.forEach(s => delete s.home);
  },
});
