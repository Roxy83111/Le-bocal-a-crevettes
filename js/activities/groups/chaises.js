/*
 * Coquillages musicaux (chaises musicales) : on tourne en musique autour des coquillages,
 * la musique s'arrête, chacun fonce sur un coquillage… et celle qui n'en a pas est éliminée.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makeShell(color) {
  const g = new THREE.Group();
  const shell = part(
    g,
    new THREE.SphereGeometry(0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
    M(color, { side: THREE.DoubleSide, roughness: 0.5 }),
    [0, 0, 0],
    [1, 0.55, 1],
  );
  part(g, Ico(0.12), M('#fff8ec', { roughness: 0.2 }), [0, 0.1, 0.25]);
  shell.castShadow = true;
  return g;
}

GROUPS.push({
  id: 'chaises',
  label: 'Coquillages musicaux',
  min: 6,
  max: 7,
  status: 'joue aux coquillages musicaux',
  gatherFrac: 0.8,
  gatherMax: 9,
  start(A) {
    const D = Object.assign(A.data, {
      alive: A.m.slice(),
      out: [],
      shells: [],
      phase: 'music',
      pt: 0,
      round: 1,
    });
    const n = A.m.length - 1;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const sh = A.prop(makeShell(pick(['#ffafcc', '#ffd6a5', '#caffbf', '#bde0fe', '#e0c3fc'])));
      sh.position.set(Math.cos(a) * 2.6, 1.15, Math.sin(a) * 2.6);
      D.shells.push(sh);
    }
    A.m.forEach((s, i) => {
      const a = (i / A.m.length) * Math.PI * 2;
      s.goTo(V(Math.cos(a) * 4.3, 2.2, Math.sin(a) * 4.3), 1.6);
    });
    D.dur = rnd(4, 6.5);
    log(`🐚 Coquillages musicaux avec ${names(A.m)} !`, 'group');
    toast('Coquillages musicaux');
  },
  play(A, t, dt) {
    const D = A.data;
    D.pt += dt;
    if (D.phase === 'music') {
      if (!A.music) {
        A.music = true;
        Sound.startMusic('conga');
      }
      D.alive.forEach((s, i) => {
        const a = (i / D.alive.length) * Math.PI * 2 + D.pt * 0.55;
        s.goTo(V(Math.cos(a) * 4.3, 2.2 + Math.sin(D.pt * 3 + i) * 0.2, Math.sin(a) * 4.3), 2.4);
        s.pose.roll = Math.sin(D.pt * 5 + i) * 0.3;
        if (Math.random() < dt * 0.6) emit(s.headPos(), pick(NOTES));
      });
      if (D.pt > D.dur) {
        // La musique s'arrête : chacun vise le coquillage libre le plus proche.
        Sound.stopMusic();
        A.music = false;
        D.phase = 'rush';
        D.pt = 0;
        toast('Stop !');
        const free = D.shells.slice();
        const order = D.alive.slice().sort(() => Math.random() - 0.5);
        D.loser = null;
        for (const s of order) {
          s.pose.roll = 0;
          if (!free.length) {
            D.loser = s;
            break;
          }
          free.sort((x, y) => x.position.distanceTo(s.pos) - y.position.distanceTo(s.pos));
          s.shell = free.shift();
          s.goTo(s.shell.position.clone().add(V(0, 0.75, 0)), 3.2);
        }
      }
    } else if (D.phase === 'rush') {
      if (D.loser) D.loser.goTo(V(0, 2.2, 0), 2);
      if (D.pt > 1.6 && !D.announced) {
        D.announced = true;
        const l = D.loser;
        l.say(pick(['Nooon !', 'Ils étaient tous pris !', 'C’est truqué…']), 1.8);
        log(`🐚 Manche ${D.round} : ${l.name} est éliminé·e.`);
        D.alive.splice(D.alive.indexOf(l), 1);
        D.out.push(l);
        const k = D.out.length;
        l.goTo(V(-6 + k * 1.3, 4.5, -4), 1.4);
        l.faceObj = V(0, 2, 0);
        l.status = 'regarde la partie';
        // On retire un coquillage pour la manche suivante.
        const sh = D.shells.pop();
        sh.visible = false;
      }
      if (D.pt > 3.2) {
        D.announced = false;
        D.alive.forEach(s => (s.shell = null));
        if (D.alive.length === 1) {
          const w = D.alive[0];
          D.done = t;
          w.say('👑 Le coquillage est à moi !', 2.5);
          w.flip(1);
          log(`👑 ${w.name} remporte les coquillages musicaux !`);
          toast(`Victoire de ${w.name}`);
          D.phase = 'over';
        } else {
          D.round++;
          D.phase = 'music';
          D.pt = 0;
          D.dur = rnd(3, 6);
        }
      }
    }
    D.out.forEach(s => {
      if (Math.random() < dt * 0.05) s.say(pick(['Allez !', 'Plus vite !', 'Je boude.']), 1.4);
    });
    return (D.phase === 'over' && t > D.done + 2.5) || t > 80;
  },
  end(A) {
    A.m.forEach(s => delete s.shell);
  },
});
