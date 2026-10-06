/*
 * Karaoké : trois crevettes passent au micro chacune leur tour devant un écran qui affiche
 * les paroles (inventées), le public agite des lumières et un jury donne des notes.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
const KARAOKE_SONGS = [
  {
    title: 'La Ballade du Plancton',
    lines: ['Je flotte, je flotte…', 'Petit plancton de mon cœur', 'Dans le bocal du bonheur !'],
  },
  {
    title: 'Carapace Fever',
    lines: ['Mue-mue-muer ce soir…', 'Ma carapace brille au néon', 'Tout le monde sur le sable !'],
  },
  {
    title: 'Granulé d’amour',
    lines: ['Tu es tombé du ciel', 'Comme un granulé doré', 'Je t’ai mangé tout de suite…'],
  },
  {
    title: 'Bulle, bulle, bulle',
    lines: ['Bulle par-ci, bulle par-là', 'Le bulleur fait boum-boum', 'Et mes antennes font la ola !'],
  },
];

GROUPS.push({
  id: 'karaoke',
  label: 'Karaoké',
  min: 6,
  max: 12,
  status: 'est au karaoké',
  gatherFrac: 0.8,
  gatherMax: 9,
  start(A) {
    const singers = A.m.slice(0, 3),
      crowd = A.m.slice(3);
    const scr = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ map: slideTex('Karaoké', '♪ ♪ ♪') });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2), mat);
    pl.position.z = 0.06;
    scr.add(pl);
    scr.add(mk(Box(3.9, 2.3, 0.1), M('#2b2b33')));
    scr.position.set(0, 5.6, -4.2);
    A.prop(scr);
    const mic = new THREE.Group();
    part(mic, Cyl(0.04, 0.04, 2.4, 5), M('#222'), [0, 1.2, 0]);
    part(mic, Cyl(0.4, 0.5, 0.1, 6), M('#222'), [0, 0, 0]);
    part(mic, Ico(0.14, 0), M('#666', { metalness: 0.6 }), [0, 2.45, 0.15]);
    mic.position.set(0, 1.1, -2.2);
    A.prop(mic);
    const spot = new THREE.PointLight('#ffd6f5', 1.2, 8);
    spot.position.set(0, 6, -1);
    A.prop(spot);
    singers.forEach((s, i) => {
      s.goTo(V(-3 + i * 3, 2.5, -3.4), 1.4);
      s.faceObj = V(0, 2.5, 6);
    });
    crowd.forEach((s, i) => {
      const row = Math.floor(i / 5),
        col = i % 5;
      s.goTo(V((col - 2) * 1.5, 2.3 + row * 0.8, 1.8 + row * 1.4), 1.4);
      s.faceObj = V(0, 3, -3);
    });
    Object.assign(A.data, { singers, crowd, mat, scores: [] });
    log(`🎤 Soirée karaoké ! Au micro : ${names(singers)}.`, 'group');
    toast('Karaoké');
  },
  play(A, t, dt) {
    const D = A.data,
      slot = 7;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('conga');
    }
    const k = Math.floor(t / slot);
    if (k < D.singers.length) {
      const s = D.singers[k],
        lt = t - k * slot;
      if (!D.song || D.songFor !== s) {
        D.song = pick(KARAOKE_SONGS);
        D.songFor = s;
      }
      // Le chanteur vient au micro, les autres attendent sur le côté.
      D.singers.forEach((o, i) => {
        if (o === s) {
          o.goTo(V(0, 2.6, -1.6), 2);
          o.faceObj = V(0, 2.6, 8);
          o.pose.roll = Math.sin(t * 4) * 0.25;
          o.pose.ant = 1;
        } else {
          o.goTo(V(i < k ? -4.5 : 4.5, 2.6 + i * 0.4, -3.6), 1.4);
          o.pose.roll = 0;
          o.pose.ant = 0;
        }
      });
      at(A, t, k * slot, () => {
        D.mat.map.dispose();
        D.mat.map = slideTex(D.song.title, `par ${s.name}`);
        D.mat.needsUpdate = true;
      });
      D.song.lines.forEach((line, i) =>
        at(A, t, k * slot + 1 + i * 1.8, () => {
          s.say('🎶 ' + line, 1.8);
          D.mat.map.dispose();
          D.mat.map = slideTex(D.song.title, line);
          D.mat.needsUpdate = true;
        }),
      );
      if (Math.random() < dt * 2) emit(s.headPos(), pick(NOTES), { color: `hsl(${(t * 60) % 360},90%,70%)` });
      if (lt > 6.4)
        at(A, t, k * slot + 6.4, () => {
          const sc = rint(4, 10);
          D.scores.push({ s, sc, title: D.song.title });
          pick(D.crowd).say(
            sc > 7 ? `${sc}/10 ! Bravo !` : sc > 5 ? `${sc}/10, pas mal.` : `${sc}/10… aïe.`,
            1.6,
          );
        });
    }
    // Le public se balance et agite des briquets (petites lumières)
    D.crowd.forEach((s, i) => {
      s.pose.roll = Math.sin(t * 2 + i) * 0.3;
      if (Math.random() < dt * 0.3) emit(s.headPos(), pick(['✦', '👏', '🔥']), { life: 1 });
    });
    const endT = D.singers.length * slot;
    at(A, t, endT, () => {
      const best = D.scores.reduce((a, b) => (a.sc >= b.sc ? a : b));
      best.s.say('🏆 Merci, merci !', 2);
      best.s.flip(1);
      log(`🎤 ${best.s.name} gagne le karaoké avec « ${best.title} » (${best.sc}/10).`);
      toast(`Karaoké : ${best.s.name} gagne !`);
    });
    return t > endT + 2.5;
  },
});
