/*
 * Tir à la corde : deux équipes tirent de chaque côté d'une corde avec un ruban au milieu.
 * Le ruban oscille, puis une équipe finit par entraîner l'autre… qui tombe en vrac.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'corde',
  label: 'Tir à la corde',
  min: 6,
  max: 10,
  status: 'joue au tir à la corde',
  gatherFrac: 0.8,
  gatherMax: 9,
  start(A) {
    const m = A.m.slice(0, A.m.length - (A.m.length % 2));
    const left = m.filter((_, i) => i % 2 === 0),
      right = m.filter((_, i) => i % 2 === 1);
    const ref = A.m.length % 2 ? A.m[A.m.length - 1] : null;
    const rope = new THREE.Group();
    const ropeMesh = part(rope, Cyl(0.07, 0.07, 12, 6), M('#d4a373'), [0, 0, 0], null, [0, 0, Math.PI / 2]);
    const ribbon = part(rope, Box(0.12, 0.6, 0.12), M('#e63946'), [0, -0.3, 0]);
    rope.position.set(0, 2.8, 0);
    A.prop(rope);
    Object.assign(A.data, {
      left,
      right,
      ref,
      rope,
      ribbon,
      x: 0,
      v: 0,
      strengthL: rnd(0.9, 1.1),
      strengthR: rnd(0.9, 1.1),
    });
    const place = (team, side) =>
      team.forEach((s, i) => {
        s.slot = i;
        s.side = side;
        s.goTo(V(side * (1.3 + i * 1.25), 2.8, 0), 1.6);
        s.faceObj = V(-side * 20, 2.8, 0);
      });
    place(left, -1);
    place(right, 1);
    if (ref) {
      ref.goTo(V(0, 4.6, 1.5), 1.4);
      ref.faceObj = V(0, 2.8, 0);
      ref.status = 'arbitre le tir à la corde';
    }
    log(`🪢 Tir à la corde : ${names(left)} contre ${names(right)}.`, 'group');
    toast('Tir à la corde');
  },
  play(A, t, dt) {
    const D = A.data;
    at(A, t, 0.2, () => (D.ref || D.left[0]).say('Prêts ? Tirez !', 1.6));
    if (!D.winner) {
      // Le ruban est tiré par la somme des forces, avec des à-coups aléatoires.
      const pull = Math.sin(t * 1.7) * 0.6 + (D.strengthR - D.strengthL) * 0.8 + rnd(-0.6, 0.6);
      D.v += pull * dt;
      D.v *= Math.exp(-dt * 1.2);
      D.x = clamp(D.x + D.v * dt, -2.2, 2.2);
      if (t > 4) D.strengthR += (D.strengthR > D.strengthL ? 1 : -1) * dt * 0.05;
      if (Math.abs(D.x) >= 2.2 || t > 18) {
        D.winner = D.x > 0 ? D.right : D.left;
        D.loser = D.winner === D.right ? D.left : D.right;
        D.wt = t;
        D.winner.forEach(s => s.say(pick(['Victoire !', '💪', 'Trop facile !']), 1.8));
        D.loser.forEach(s => {
          s.flip(0.8);
          s.goTo(s.pos.clone().add(V(D.x > 0 ? 2.5 : -2.5, rnd(-0.5, 1), rnd(-1.5, 1.5))), 2.5);
          s.say(pick(['Aaah !', 'Ma pince a glissé !', 'Revanche !']), 1.6);
        });
        log(`🪢 L’équipe de ${D.winner[0].name} gagne le tir à la corde.`);
      }
    }
    D.rope.position.x = D.x;
    if (!D.winner || t < D.wt + 0.2)
      [...D.left, ...D.right].forEach(s => {
        s.goTo(V(D.x + s.side * (1.3 + s.slot * 1.25), 2.8, 0), 3);
        s.pose.flip = -0.25;
        s.pose.curl = -0.3 + Math.sin(t * 6 + s.slot) * 0.15;
      });
    if (Math.random() < dt * 0.6 && !D.winner)
      pick([...D.left, ...D.right]).say(
        pick(['Hissez !', 'Ho hisse !', 'Tirez plus fort !', 'Je glisse !']),
        1.2,
      );
    return D.winner && t > D.wt + 3;
  },
  end(A) {
    A.m.forEach(s => {
      delete s.slot;
      delete s.side;
    });
  },
});
