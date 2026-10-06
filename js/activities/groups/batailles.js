/*
 * Bataille de bulles : deux équipes retranchées derrière des coquillages se lancent des bulles.
 * Une crevette touchée fait un salto et perd un point de vie ; la dernière équipe debout gagne.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'bataille',
  label: 'Bataille de bulles',
  min: 6,
  max: 10,
  status: 'fait une bataille de bulles',
  gatherFrac: 0.8,
  gatherMax: 9,
  start(A) {
    const m = A.m;
    const teams = [
      { name: 'les Rouges', color: '#e63946', side: -1, list: [] },
      { name: 'les Bleus', color: '#3a86ff', side: 1, list: [] },
    ];
    m.forEach((s, i) => {
      const T = teams[i % 2];
      T.list.push(s);
      s.team = T;
      s.hp = 3;
      s.cd = rnd(0.5, 2);
      const k = T.list.length - 1;
      s.home = V(T.side * rnd(4, 5.5), 2.2 + (k % 3) * 1.1, -2.4 + k * 1.3);
      s.goTo(s.home, 1.6);
      s.faceObj = V(-T.side * 20, s.home.y, s.home.z);
      const band = mk(new THREE.TorusGeometry(0.3, 0.06, 4, 8), M(T.color));
      band.rotation.x = Math.PI / 2;
      band.position.set(0, 0.08, 0.28);
      s.addTemp(band);
    });
    // Remparts en coquillages
    for (const T of teams)
      for (let i = 0; i < 3; i++) {
        const w = A.prop(
          mk(
            new THREE.SphereGeometry(0.9, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2),
            M(T.side < 0 ? '#ffadad' : '#a0c4ff', { side: THREE.DoubleSide }),
          ),
        );
        w.position.set(T.side * 3.2, 1.1, -2 + i * 2);
        w.scale.set(0.6, 1.2, 1);
      }
    Object.assign(A.data, { teams, shots: [] });
    log(`🫧 Bataille de bulles : ${names(teams[0].list)} contre ${names(teams[1].list)}.`, 'group');
    toast('Bataille de bulles');
  },
  play(A, t, dt) {
    const D = A.data;
    const alive = T => T.list.filter(s => s.hp > 0);
    if (!D.over) {
      // Chacun esquive un peu sur place et tire quand il est prêt.
      D.teams.forEach(T =>
        alive(T).forEach(s => {
          s.goTo(
            s.home.clone().add(V(0, Math.sin(t * 2 + s.phase) * 0.5, Math.cos(t * 1.5 + s.phase) * 0.6)),
            2,
          );
          s.cd -= dt;
          s.throwT = (s.throwT || 0) - dt;
          s.pose.flip = s.throwT > 0 ? -0.4 : 0;
          const foes = alive(D.teams.find(o => o !== T));
          if (s.cd <= 0 && foes.length) {
            s.cd = rnd(1.2, 2.6);
            const target = pick(foes);
            const b = A.prop(
              mk(
                Ico(0.22, 1),
                new THREE.MeshStandardMaterial({
                  color: '#e8fbff',
                  transparent: true,
                  opacity: 0.6,
                  flatShading: true,
                  roughness: 0.05,
                }),
              ),
            );
            b.position.copy(s.pos).add(V(0, 0.3, 0));
            const v = target.pos.clone().sub(b.position).normalize().multiplyScalar(6);
            v.y += rnd(-0.6, 0.8);
            v.z += rnd(-0.8, 0.8);
            D.shots.push({ b, v, from: T, life: 2.5 });
            s.throwT = 0.25; // petit geste de lancer
          }
        }),
      );
    }
    // Trajectoire des bulles et impacts
    for (let i = D.shots.length - 1; i >= 0; i--) {
      const sh = D.shots[i];
      sh.life -= dt;
      sh.b.position.addScaledVector(sh.v, dt);
      const enemy = D.teams.find(o => o !== sh.from);
      const hit = alive(enemy).find(s => s.pos.distanceTo(sh.b.position) < 0.7);
      if (hit || sh.life <= 0) {
        sh.b.visible = false;
        D.shots.splice(i, 1);
        emit(sh.b.position, '○', { cls: 'bub', v: V(0, 0.8, 0), life: 0.8 });
        if (hit && !D.over) {
          hit.hp--;
          hit.flip(0.6);
          hit.say(
            hit.hp > 0
              ? pick(['Touché·e !', 'Aïe !', 'Pfff…'])
              : pick(['Je suis éliminé·e !', 'Adieu, monde cruel…']),
            1.3,
          );
          if (hit.hp <= 0) {
            hit.goTo(V(hit.home.x * 1.25, YMIN + 0.3, hit.home.z), 1.2);
            hit.pose.roll = Math.PI;
          }
        }
      }
    }
    if (!D.over) {
      const winner = D.teams.find(T => !alive(D.teams.find(o => o !== T)).length);
      if (winner || t > 30) {
        const w = winner || (alive(D.teams[0]).length >= alive(D.teams[1]).length ? D.teams[0] : D.teams[1]);
        D.over = t;
        alive(w).forEach(s => {
          s.say('🏆 Victoire !', 2);
          s.flip(0.9);
        });
        log(`🫧 Ce sont ${w.name} qui gagnent la bataille de bulles !`);
        toast(`Victoire pour ${w.name} !`);
      }
    }
    return D.over && t > D.over + 3;
  },
  end(A) {
    A.m.forEach(s => {
      delete s.team;
      delete s.hp;
      delete s.cd;
      delete s.home;
      delete s.throwT;
    });
  },
});
