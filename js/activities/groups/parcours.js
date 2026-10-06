/*
 * Parcours d'obstacles : des anneaux flottants à traverser, un slalom entre des bouées
 * et une arche d'arrivée. Les crevettes partent toutes ensemble, le chrono tourne.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'parcours',
  label: 'Parcours d’obstacles',
  min: 6,
  max: 10,
  status: 'fait le parcours d’obstacles',
  noGather: true,
  start(A) {
    // Points de passage : départ → anneaux → slalom → arrivée (un tour du bocal)
    const way = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 1.7 + 0.3;
      const r = 5 + Math.sin(i * 1.3) * 0.8;
      way.push(V(Math.cos(a) * r, 2.6 + Math.sin(i * 0.9) * 2 + (i > 2 && i < 6 ? 2 : 0), Math.sin(a) * r));
    }
    const pal = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'];
    way.forEach((p, i) => {
      if (i === 0) return;
      const next = way[Math.min(i + 1, way.length - 1)];
      if (i < way.length - 1 && i % 2 === 1) {
        // Anneau tourné dans le sens de la course
        const ring = A.prop(mk(new THREE.TorusGeometry(1, 0.1, 6, 16), E(pal[i % pal.length], 0.4)));
        ring.position.copy(p);
        ring.lookAt(next);
      } else if (i < way.length - 1) {
        // Bouées de slalom
        for (const s of [-1, 1]) {
          const buoy = A.prop(new THREE.Group());
          part(buoy, Cyl(0.03, 0.03, p.y - 1, 4), M('#ffffff'), [0, -(p.y - 1) / 2, 0]);
          part(buoy, Ico(0.3, 1), M(s < 0 ? '#ef476f' : '#ffffff'), [0, 0, 0]);
          buoy.position.copy(p).add(V(s * 0.9, 0, 0));
        }
      }
    });
    // Arche d'arrivée en damier
    const goal = way[way.length - 1];
    const arch = A.prop(new THREE.Group());
    for (const s of [-1, 1]) part(arch, Cyl(0.08, 0.08, 3, 5), M('#111'), [s * 1.2, -1.2, 0]);
    for (let i = 0; i < 6; i++)
      part(arch, Box(0.4, 0.4, 0.1), M(i % 2 ? '#111' : '#ffffff'), [-1 + i * 0.4, 0.3, 0]);
    arch.position.copy(goal);
    arch.lookAt(way[way.length - 2]);
    A.m.forEach((s, i) => {
      s.wp = 0;
      s.pace = rnd(2.2, 3.2);
      s.lane = V(rnd(-0.4, 0.4), rnd(-0.4, 0.4), rnd(-0.4, 0.4));
      s.goTo(way[0].clone().add(V(0, i * 0.6, 0)), 2);
    });
    Object.assign(A.data, { way, ranking: [], go: false });
    log(`🏃 Parcours d’obstacles : ${names(A.m)} sur la ligne de départ.`, 'group');
    toast('Parcours d’obstacles');
  },
  play(A, t, dt) {
    const D = A.data;
    at(A, t, 1.5, () => A.m[0].say('À vos marques…', 1));
    at(A, t, 2.5, () => A.m[1].say('Prêts…', 1));
    at(A, t, 3.5, () => {
      A.m[2].say('PARTEZ !', 1.2);
      D.go = true;
      D.t0 = t;
    });
    if (!D.go) return false;
    A.m.forEach(s => {
      if (s.wp >= D.way.length) return;
      const target = D.way[s.wp].clone().add(s.lane);
      s.goTo(target, s.pace * (0.85 + Math.random() * 0.3));
      s.pose.roll = Math.sin(t * 6 + s.phase) * 0.2;
      if (s.pos.distanceTo(target) < 1.1) {
        s.wp++;
        if (s.wp === D.way.length) {
          D.ranking.push(s);
          const rank = D.ranking.length;
          const time = (t - D.t0).toFixed(1).replace('.', ',');
          s.say(rank === 1 ? `🥇 ${time} s !` : rank === 2 ? '🥈' : rank === 3 ? '🥉' : 'Arrivé·e !', 1.6);
          if (rank === 1) {
            s.flip(1);
            log(`🏃 ${s.name} remporte le parcours d’obstacles en ${time} secondes.`);
            toast(`${s.name} : ${time} s`);
          }
        } else if (Math.random() < 0.08) s.say(pick(['Hop !', 'Pardon !', 'Je double !', 'Plus vite !']), 1);
      }
    });
    if (D.ranking.length === A.m.length && !D.done) D.done = t;
    if (t > 40 && !D.done) D.done = t;
    return D.done && t > D.done + 2.5;
  },
  end(A) {
    if (A.data.ranking.length >= 3)
      log(
        `🏅 Podium : ${A.data.ranking
          .slice(0, 3)
          .map(s => s.name)
          .join(', ')}.`,
      );
    A.m.forEach(s => {
      delete s.wp;
      delete s.pace;
      delete s.lane;
    });
  },
});
