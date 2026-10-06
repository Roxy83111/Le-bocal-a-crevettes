/*
 * 1, 2, 3, soleil ! : une crevette compte face au verre, les autres avancent.
 * Quand elle se retourne, il faut s'immobiliser… les retardataires repartent au départ.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'soleil',
  label: '1, 2, 3, soleil !',
  min: 6,
  max: 10,
  status: 'joue à 1, 2, 3, soleil',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const [it, ...players] = A.m;
    const D = Object.assign(A.data, { it, players, phase: 'count', pt: 0, dur: rnd(2, 3.5), winner: null });
    it.goTo(V(5.6, 2.6, 0), 1.6);
    it.faceObj = V(30, 2.6, 0);
    it.status = 'compte face au mur';
    players.forEach((s, i) => {
      const z = (i - (players.length - 1) / 2) * 1.25;
      s.startPos = V(-5.6, 2.3 + (i % 2) * 0.5, z);
      s.px = s.startPos.x;
      s.pace = rnd(0.5, 1.1);
      s.goTo(s.startPos, 1.6);
      s.faceObj = V(30, s.startPos.y, z);
    });
    log(`☀️ 1, 2, 3, soleil ! ${it.name} compte, ${names(players)} avancent en douce.`, 'group');
    toast('1, 2, 3, soleil !');
  },
  play(A, t, dt) {
    const D = A.data;
    if (D.winner) return t > D.wt + 3;
    D.pt += dt;
    if (D.phase === 'count') {
      if (!D.said) {
        D.said = true;
        D.it.say('1, 2, 3…', D.dur);
      }
      D.it.faceObj.set(30, 2.6, 0);
      D.players.forEach(s => {
        s.px += s.pace * dt;
        s.goTo(V(s.px, s.startPos.y, s.startPos.z), 2.2);
        s.pose.roll = Math.sin(t * 6 + s.phase) * 0.2;
      });
      if (D.pt > D.dur) {
        D.phase = 'look';
        D.pt = 0;
        D.it.say('…SOLEIL !', 1.4);
        D.it.faceObj.set(-30, 2.6, 0);
        D.it.twirl(0.4);
        // Chacun réagit plus ou moins vite.
        D.players.forEach(s => (s.react = Math.random() < 0.22 ? rnd(0.5, 0.9) : rnd(0, 0.3)));
        D.caught = false;
      }
    } else {
      D.players.forEach(s => {
        s.pose.roll = 0;
        if (D.pt < s.react) {
          s.px += s.pace * dt;
          s.goTo(V(s.px, s.startPos.y, s.startPos.z), 2.2);
        } else s.goTo(V(s.px, s.startPos.y, s.startPos.z), 3);
        // Pris en train de bouger ?
        if (!D.caught && s.react > 0.45 && D.pt > 0.5) {
          D.caught = true;
          D.it.say(`Je t’ai vu·e bouger, ${s.name} ! Retour au départ !`, 2);
          s.say(pick(['Quoi ?! Moi ?', 'J’avais une crampe…', 'Injuste !']), 1.6);
          s.px = s.startPos.x;
        }
      });
      if (D.pt > 2.2) {
        D.phase = 'count';
        D.pt = 0;
        D.dur = rnd(1.5, 3.5);
        D.it.say('1, 2, 3…', D.dur);
      }
    }
    const first = D.players.reduce((a, b) => (a.px > b.px ? a : b));
    if (first.px > 4.4) {
      D.winner = first;
      D.wt = t;
      first.say('Touché ! J’ai gagné !', 2);
      first.flip(0.9);
      D.it.say('Nooon !', 1.5);
      log(`🏆 ${first.name} touche ${D.it.name} et gagne à 1, 2, 3, soleil !`);
    }
    if (t > 50) {
      log('☀️ Fin de partie : personne n’a réussi à toucher le mur.');
      return true;
    }
    return false;
  },
  end(A) {
    A.data.players.forEach(s => {
      delete s.startPos;
      delete s.px;
      delete s.pace;
      delete s.react;
    });
  },
});
