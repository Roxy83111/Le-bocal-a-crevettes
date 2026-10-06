/*
 * Bowling : une piste sur le sable, dix quilles en triangle. Chaque joueur lance une boule
 * qui roule (un peu de travers) ; les quilles touchées s'envolent. Le meilleur score gagne.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makePin() {
  const g = new THREE.Group();
  const w = M('#f8f9fa', { roughness: 0.4 });
  part(g, Cyl(0.12, 0.2, 0.55, 8), w, [0, 0.28, 0]);
  part(g, Cyl(0.08, 0.12, 0.3, 8), w, [0, 0.7, 0]);
  part(g, Ico(0.11, 1), w, [0, 0.9, 0]);
  part(g, Cyl(0.09, 0.09, 0.06, 8), M('#e63946'), [0, 0.68, 0]);
  return g;
}

GROUPS.push({
  id: 'bowling',
  label: 'Bowling',
  min: 6,
  max: 10,
  status: 'joue au bowling',
  gatherFrac: 0.8,
  gatherMax: 9,
  start(A) {
    const lane = new THREE.Group();
    part(lane, Box(10, 0.1, 1.8), M('#d9a066', { roughness: 0.4 }), [0, 0, 0]);
    for (const z of [-1, 1]) part(lane, Box(10, 0.25, 0.2), M('#5c3a21'), [0, 0.1, z]);
    for (let i = 0; i < 5; i++)
      part(lane, Cone(0.1, 0.25, 3), M('#5c3a21'), [-2.5, 0.06, -0.6 + i * 0.3], null, [
        -Math.PI / 2,
        0,
        Math.PI / 2,
      ]);
    lane.position.set(0, 1.25, 0);
    A.prop(lane);
    const players = A.m.slice(0, Math.min(5, A.m.length - 1)),
      fans = A.m.slice(players.length);
    players.forEach((s, i) => {
      s.score = 0;
      s.goTo(V(-6 + (i % 2) * 0.8, 2.4 + i * 0.6, 2), 1.4);
      s.faceObj = V(5, 2, 0);
    });
    fans.forEach((s, i) => {
      s.goTo(V(-1 + i * 1.4, 3.2, -2.6), 1.4);
      s.faceObj = V(0, 1.6, 0);
    });
    const ball = A.prop(mk(Ico(0.32, 1), M('#3a0ca3', { roughness: 0.2, metalness: 0.3 })));
    ball.visible = false;
    Object.assign(A.data, { players, fans, ball, pins: [], turn: -1, phase: 'setup', pt: 0 });
    log(`🎳 Partie de bowling avec ${names(players)}.`, 'group');
    toast('Bowling');
  },
  // Replace les 10 quilles en triangle au bout de la piste.
  setPins(A) {
    const D = A.data;
    D.pins.forEach(p => {
      scene.remove(p.g);
      disposeObj(p.g);
    });
    D.pins = [];
    let k = 0;
    for (let row = 0; row < 4; row++)
      for (let j = 0; j <= row; j++) {
        const g = makePin();
        g.position.set(3 + row * 0.42, 1.3, (j - row / 2) * 0.42);
        A.prop(g);
        D.pins.push({ g, down: false, v: V(), spin: V() });
        k++;
      }
  },
  play(A, t, dt) {
    const D = A.data,
      ball = D.ball;
    D.pt += dt;
    if (D.phase === 'setup') {
      D.turn++;
      if (D.turn >= D.players.length) {
        D.phase = 'over';
        D.pt = 0;
        const best = D.players.reduce((a, b) => (a.score >= b.score ? a : b));
        best.say(best.score === 10 ? 'STRIKE PARFAIT ! 🏆' : `🏆 ${best.score} quilles !`, 2.2);
        best.flip(1);
        log(`🎳 ${best.name} gagne le bowling avec ${best.score} quille${best.score > 1 ? 's' : ''}.`);
        toast(`Bowling : ${best.name} gagne`);
        return false;
      }
      this.setPins(A);
      D.cur = D.players[D.turn];
      D.cur.goTo(V(-4.6, 1.9, 0), 2);
      D.cur.faceObj = V(10, 1.9, 0);
      D.phase = 'aim';
      D.pt = 0;
      ball.visible = false;
    } else if (D.phase === 'aim') {
      D.cur.pose.curl = -0.3 - Math.sin(D.pt * 3) * 0.3;
      if (D.pt > 1.6) {
        D.phase = 'roll';
        D.pt = 0;
        ball.visible = true;
        ball.position.set(-4, 1.62, 0);
        D.bv = V(rnd(5, 7), 0, rnd(-0.45, 0.45));
        D.cur.say(pick(['Hop !', 'Regardez ça !', 'Allez…', 'Tout en finesse.']), 1.2);
        D.cur.flip(0.6);
      }
    } else if (D.phase === 'roll') {
      ball.position.addScaledVector(D.bv, dt);
      ball.position.z = clamp(ball.position.z, -0.75, 0.75);
      ball.rotation.z -= D.bv.x * dt * 3;
      // Les quilles touchées par la boule (ou par une autre quille) tombent.
      D.pins.forEach(p => {
        if (p.down) return;
        const near =
          ball.position.distanceTo(p.g.position.clone().setY(1.62)) < 0.5 ||
          D.pins.some(o => o.down && o.g.position.distanceTo(p.g.position) < 0.45 && Math.random() < 0.08);
        if (near) {
          p.down = true;
          p.v.set(rnd(1.5, 3.5), rnd(1, 2.5), rnd(-2, 2));
          p.spin.set(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6));
        }
      });
      if (ball.position.x > 5.5 || D.pt > 3) {
        D.phase = 'count';
        D.pt = 0;
      }
    } else if (D.phase === 'count') {
      if (D.pt > 1.4 && !D.counted) {
        D.counted = true;
        const n = D.pins.filter(p => p.down).length;
        D.cur.score = n;
        D.cur.say(n === 10 ? '💥 STRIKE !' : n === 0 ? 'Gouttière… 😭' : `${n} quilles !`, 1.6);
        if (n >= 7) D.fans.forEach(s => s.say(pick(['Ouaaais !', '👏', 'Quel lancer !']), 1.3));
      }
      if (D.pt > 2.6) {
        D.counted = false;
        D.cur.faceObj = V(5, 2, 0);
        D.cur.goTo(V(-6, 2.4 + D.turn * 0.6, 2), 1.4);
        D.phase = 'setup';
      }
    } else if (D.phase === 'over') {
      return D.pt > 3;
    }
    // Animation des quilles qui volent
    D.pins.forEach(p => {
      if (!p.down) return;
      p.v.y -= 6 * dt;
      p.g.position.addScaledVector(p.v, dt);
      if (p.g.position.y < 1.3) {
        p.g.position.y = 1.3;
        p.v.multiplyScalar(0.4);
        p.v.y = Math.abs(p.v.y) * 0.3;
      }
      p.g.rotation.x += p.spin.x * dt;
      p.g.rotation.z += p.spin.z * dt;
      p.spin.multiplyScalar(Math.exp(-dt * 2));
    });
    D.fans.forEach((s, i) => (s.pose.hop = Math.abs(Math.sin(t * 3 + i)) * 0.1));
    return false;
  },
  end(A) {
    A.m.forEach(s => delete s.score);
  },
});
