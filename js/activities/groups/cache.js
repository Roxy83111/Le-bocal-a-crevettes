/*
 * Cache-cache : une crevette compte, les autres se cachent dans le décor.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'cache',
  label: 'Cache-cache',
  min: 6,
  max: 9,
  status: 'joue à cache-cache',
  noGather: true,
  start(A) {
    const [seeker, ...hiders] = A.m;
    Object.assign(A.data, { seeker, hiders, found: [] });
    const spots = shuffle((curDecor ? curDecor.hide : []).map(v => v.clone()));
    hiders.forEach((h, i) => {
      let p = spots[i];
      if (!p) {
        const a = rnd(0, 6.28),
          y = rnd(YMIN, 4),
          r = rAt(y) - 1.25;
        p = V(Math.cos(a) * r, y, Math.sin(a) * r);
      }
      h.hideSpot = p;
      h.found = false;
      h.goTo(p, 2.2);
      h.status = 'se cache';
    });
    seeker.goTo(V(0, 2.4, 0), 1.5);
    seeker.status = 'compte jusqu’à 10';
    log(`🙈 Cache-cache ! ${seeker.name} compte, ${names(hiders)} filent se cacher.`, 'group');
    toast('Cache-cache !');
  },
  play(A, t, dt) {
    const D = A.data,
      S = D.seeker;
    if (t < 9) {
      S.pose.curl = -0.6;
      S.pose.flip = 0.5;
      for (let i = 0; i < 10; i++) at(A, t, 0.6 + i * 0.8, () => S.say(`${i + 1}…`, 0.7));
      at(A, t, 0.3, () => pick(D.hiders).say('Vite, vite !', 1.2));
      D.hiders.forEach(h => {
        if (h.arrived) {
          h.pose.curl = -0.45;
          h.pose.hop = -0.05;
        }
      });
      return false;
    }
    at(A, t, 9, () => {
      S.say('Prêt·es ou pas, j’arrive !', 2);
      S.status = 'cherche';
    });
    S.pose.curl = 0;
    S.pose.flip = 0;
    const left = D.hiders.filter(h => !h.found);
    left.forEach(h => {
      h.pose.curl = -0.45;
      h.goTo(h.hideSpot, 1.5);
      if (Math.random() < dt * 0.04)
        h.say(pick(['(chut…)', 'Il ne me trouvera jamais.', 'J’ai envie d’éternuer…']), 1.5);
    });
    if (left.length) {
      if (!D.cur || D.cur.found) {
        left.sort((x, y) => x.pos.distanceTo(S.pos) - y.pos.distanceTo(S.pos));
        D.cur = left[0];
        D.decoy = Math.random() < 0.45 ? randInside() : null;
      }
      if (D.decoy) {
        S.goTo(D.decoy, 1.3);
        if (S.arrived) {
          S.say(pick(['Hmm… pas là.', 'Je sens une présence…', 'Tu es dans le corail ?']), 1.5);
          D.decoy = null;
        }
      } else {
        const h = D.cur;
        S.goTo(h.pos, 1.4);
        if (S.pos.distanceTo(h.pos) < 1.15) {
          h.found = true;
          S.say(`Trouvé·e, ${h.name} !`, 1.6);
          h.say(pick(['😅 Zut !', 'Comment tu m’as vu·e ?!', 'J’étais trop bien caché·e…']), 1.8);
          const k = D.found.length;
          D.found.push(h);
          h.status = 'a été trouvé·e';
          const a = k * 1.1;
          h.goTo(V(Math.cos(a) * 1.6, 2.3, Math.sin(a) * 1.6), 1.2);
          h.faceObj = S;
          h.pose.curl = 0;
          if (!D.hiders.some(x => !x.found)) {
            D.ended = t;
            log(`🏆 ${h.name} a été trouvé·e en dernier : champion·ne de cache-cache !`);
            h.say('🏆 Personne ne se cache mieux que moi.', 2.5);
          }
        }
      }
    }
    D.found.forEach(h => {
      h.pose.curl = 0;
    });
    if (t > 70 && left.length) {
      left.forEach(h => h.say('Je suis toujours là !', 2));
      log(`🪨 ${names(left)} reste introuvable… sûrement devenu·e un caillou.`);
      return true;
    }
    return D.ended != null && t > D.ended + 3;
  },
  end(A) {
    A.data.hiders.forEach(h => {
      delete h.found;
      delete h.hideSpot;
    });
  },
});
