/*
 * Match de foot : deux équipes, un ballon, des buts et parfois un arbitre.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'foot',
  label: 'Match de foot',
  min: 6,
  max: 12,
  status: 'joue au foot',
  noGather: true,
  start(A) {
    let m = A.m;
    if (m.length % 2) {
      A.data.ref = m[m.length - 1];
      m = m.slice(0, -1);
    }
    const tA = m.filter((_, i) => i % 2 === 0),
      tB = m.filter((_, i) => i % 2 === 1);
    const [nA, nB] = shuffle(TEAMS.slice());
    A.data.teams = [
      { name: nA, list: tA, goal: -6, attack: 6, score: 0, color: '#e63946' },
      { name: nB, list: tB, goal: 6, attack: -6, score: 0, color: '#3a86ff' },
    ];
    A.data.teams.forEach(T =>
      T.list.forEach((s, i) => {
        s.team = T;
        s.role = i === 0 ? 'gk' : i % 2 ? 'att' : 'def';
        const band = mk(new THREE.TorusGeometry(0.3, 0.06, 4, 8), M(T.color));
        band.rotation.x = Math.PI / 2;
        band.position.set(0, 0.08, 0.28);
        s.addTemp(band);
        s.kickCd = 0;
        s.status = s.role === 'gk' ? 'garde les buts' : 'joue au foot';
      }),
    );
    if (A.data.ref) {
      A.data.ref.status = 'arbitre le match';
      A.data.ref.addTemp(Object.assign(makeHat('cotillon'), {}));
    }
    const ball = A.prop(makeBall());
    ball.position.set(0, 2.6, 0);
    Object.assign(A.data, { ball, bv: V(), pause: 0 });
    for (const gx of [-6, 6]) {
      const g = makeGoal();
      g.position.set(gx, 0, 0);
      g.rotation.y = gx > 0 ? Math.PI : 0;
      A.prop(g);
    }
    log(`⚽ Coup d’envoi : ${nA} (rouge) contre ${nB} (bleu) !`, 'group');
    toast(`${nA} – ${nB}`);
  },
  play(A, t, dt) {
    const D = A.data,
      ball = D.ball,
      bv = D.bv,
      bp = ball.position;
    if (D.pause > 0) {
      D.pause -= dt;
      if (D.pause <= 0) {
        bp.set(0, 2.6, 0);
        bv.set(0, 0, 0);
      }
    }
    bv.y -= 3 * dt;
    bv.multiplyScalar(Math.exp(-0.5 * dt));
    bp.addScaledVector(bv, dt);
    ball.rotation.x += bv.z * dt * 2;
    ball.rotation.z -= bv.x * dt * 2;
    if (bp.y < YMIN - 0.25) {
      bp.y = YMIN - 0.25;
      bv.y = Math.abs(bv.y) * 0.55;
    }
    if (bp.y > YMAX) {
      bp.y = YMAX;
      bv.y = -Math.abs(bv.y) * 0.5;
    }
    const h = Math.hypot(bp.x, bp.z),
      rm = rAt(bp.y) - 0.6;
    if (h > rm) {
      const nx = bp.x / h,
        nz = bp.z / h;
      bp.x = nx * rm;
      bp.z = nz * rm;
      const dot = bv.x * nx + bv.z * nz;
      if (dot > 0) {
        bv.x -= 1.8 * dot * nx;
        bv.z -= 1.8 * dot * nz;
      }
    }
    if (D.pause <= 0 && Math.abs(bp.x) > 5.6 && Math.abs(bp.z) < 1.3 && bp.y < 3.7) {
      const T = D.teams.find(T => Math.sign(T.attack) === Math.sign(bp.x));
      T.score++;
      D.pause = 2.5;
      const scorer = D.lastKick && D.lastKick.team === T ? D.lastKick : pick(T.list);
      const sc = `${D.teams[0].score} – ${D.teams[1].score}`;
      log(`⚽ BUUUT de ${scorer.name} pour ${T.name} ! (${sc})`);
      toast(`BUT ! ${sc}`);
      T.list.forEach(s => {
        s.say(pick(['BUUUT !', '⚽🔥', 'Ouiii !']), 1.6);
        s.flip(0.9);
      });
      emit(bp, '🎉');
      bv.multiplyScalar(0.2);
    }
    D.teams.forEach(T =>
      T.list.forEach(s => {
        s.kickCd -= dt;
        const toGoal = V(T.attack - bp.x, 0, -bp.z).normalize();
        const ownHalf = Math.sign(bp.x) === Math.sign(T.goal);
        if (s.role === 'gk') {
          s.goTo(V(T.goal * 0.9, clamp(bp.y, YMIN, 3.2), clamp(bp.z, -1.2, 1.2)), 1.6);
          s.faceObj = bp;
        } else if (s.role === 'def' && !ownHalf) {
          s.goTo(V(T.goal * 0.5, 2.2, 0).lerp(bp, 0.3), 1.8);
        } else {
          const near = T.list
            .filter(o => o.role !== 'gk')
            .sort((x, y) => x.pos.distanceTo(bp) - y.pos.distanceTo(bp));
          if (near[0] === s) s.goTo(bp.clone().addScaledVector(toGoal, -0.5), 2.4);
          else {
            const k = near.indexOf(s);
            s.goTo(
              bp
                .clone()
                .addScaledVector(toGoal, -1.6 - k * 0.6)
                .add(V(0, 0.3, (k % 2 ? 1 : -1) * 1.4)),
              2,
            );
          }
        }
        if (D.pause <= 0 && s.kickCd <= 0 && s.pos.distanceTo(bp) < 0.85) {
          bv.copy(toGoal).multiplyScalar(rnd(4, 7));
          bv.z += rnd(-1, 1) - bp.z * 0.4;
          bv.y = rnd(0.3, 1.2);
          s.kickCd = 0.7;
          D.lastKick = s;
          if (Math.random() < 0.15) s.say(pick(['Tir !', 'À moi !', 'Passe !', 'Hop !']), 1.1);
        }
      }),
    );
    if (D.ref) {
      const r = D.ref;
      r.goTo(bp.clone().add(V(0, 1.5, 2.5)), 1.5);
      r.faceObj = bp;
      if (Math.random() < dt * 0.08)
        r.say(
          pick(['Faute !', 'Carton jaune !', 'Hors-jeu ! …je crois.', 'Pas de pinces sur le ballon !']),
          1.6,
        );
    }
    at(A, t, 16, () =>
      log(`⏱️ Mi-temps : ${D.teams[0].name} ${D.teams[0].score} – ${D.teams[1].score} ${D.teams[1].name}.`),
    );
    return t > 32;
  },
  end(A) {
    const [a, b] = A.data.teams;
    let msg;
    if (a.score === b.score) msg = `🤝 Match nul ${a.score} – ${b.score} entre ${a.name} et ${b.name}.`;
    else {
      const w = a.score > b.score ? a : b;
      msg = `🏆 ${w.name} gagne ${Math.max(a.score, b.score)} – ${Math.min(a.score, b.score)} !`;
      w.list.forEach(s => s.say('🏆 Champions !', 2));
    }
    log(msg, 'group');
    A.m.forEach(s => {
      delete s.team;
      delete s.role;
    });
  },
});
