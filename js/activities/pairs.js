/*
 * Interactions aléatoires entre deux crevettes (salut, tango, dispute, potins…).
 * Pour en ajouter une : un objet {id, status, log, play} dans PAIRS.
 */
'use strict';
const HAND = ['✊ Pierre !', '✋ Feuille !', '✌️ Ciseaux !'];
const PAIRS = [
  {
    id: 'salut',
    status: 'dit bonjour',
    log: (a, b) => `👋 ${a} et ${b} se saluent d’un coup d’antenne.`,
    play(A, t) {
      const [a, b] = A.m;
      a.pose.ant = b.pose.ant = 1;
      at(A, t, 0, () => a.say(pick(HELLO).replace('%', b.name)));
      at(A, t, 1.4, () => b.say(pick(HELLO_R)));
      return t > 3.6;
    },
  },
  {
    id: 'tango',
    status: 'danse le tango',
    log: (a, b) => `💃 ${a} et ${b} improvisent un tango passionné.`,
    play(A, t, dt) {
      const [a, b] = A.m,
        mid = A.data.mid;
      const ang = t * 1.6;
      const o = V(Math.cos(ang) * 0.8, Math.sin(t * 2) * 0.3, Math.sin(ang) * 0.8);
      a.goTo(mid.clone().add(o), 3);
      b.goTo(mid.clone().sub(o), 3);
      a.pose.roll = Math.sin(t * 3) * 0.4;
      b.pose.roll = -Math.sin(t * 3) * 0.4;
      if (Math.random() < dt * 2.5) emit(mid, pick(NOTES));
      at(A, t, 0.4, () => a.say('💃 Olé !', 1.5));
      at(A, t, 3.5, () => b.say('Plus de passion !', 1.6));
      return t > 7;
    },
  },
  {
    id: 'miette',
    status: 'se dispute une miette',
    gap: 0.85,
    log: (a, b) => `😠 ${a} et ${b} se disputent une miette.`,
    init(A) {
      const c = A.prop(mk(jitter(Ico(0.14, 0), 0.04), M('#c08a4a')));
      c.position.copy(A.data.mid);
      A.data.crumb = c;
    },
    play(A, t) {
      const [a, b] = A.m,
        { mid, dir } = A.data,
        s = Math.sin(t * 5.5);
      a.goTo(mid.clone().addScaledVector(dir, -(0.85 - 0.45 * Math.max(0, s))), 3);
      b.goTo(mid.clone().addScaledVector(dir, 0.85 - 0.45 * Math.max(0, -s)), 3);
      A.data.crumb.rotation.y += 0.05;
      at(A, t, 0.2, () => a.say('C’est MA miette !', 1.4));
      at(A, t, 1.7, () => b.say('Absolument pas !', 1.4));
      at(A, t, 3.2, () => a.say('Je l’ai vue en premier !', 1.4));
      at(A, t, 4.6, () => b.say('Prouve-le !', 1.3));
      at(A, t, 6, () => {
        const w = Math.random() < 0.5 ? a : b,
          l = w === a ? b : a;
        A.data.crumb.visible = false;
        w.say('😋 Miam.', 1.6);
        l.say('😤 Injustice !', 1.6);
        log(`🍞 ${w.name} remporte la miette. ${l.name} boude.`);
      });
      return t > 7.6;
    },
  },
  {
    id: 'potins',
    status: 'échange des potins',
    gap: 0.7,
    log: (a, b) => `🤫 ${a} glisse un potin à ${b}.`,
    play(A, t) {
      const [a, b] = A.m;
      if (!A.data.v) {
        const others = shrimps.filter(s => s !== a && s !== b);
        A.data.v = others.length ? pick(others).name : 'le caillou';
      }
      const v = A.data.v;
      at(A, t, 0, () => a.say(`🤫 T’as entendu pour ${v} ?`, 1.6));
      at(A, t, 1.7, () => b.say('Non, quoi ?!', 1.4));
      at(A, t, 3.2, () => a.say(pick(GOSSIP).replace('%', v), 2.4));
      at(A, t, 5.7, () =>
        b.say(pick(['😱 Nooon !', 'J’en étais sûr·e !', 'Ça ne m’étonne pas…', 'Incroyable…']), 1.6),
      );
      a.pose.ant = 1;
      return t > 7.5;
    },
  },
  {
    id: 'saltos',
    status: 'fait un concours de saltos',
    log: (a, b) => `🤸 ${a} défie ${b} à un concours de saltos.`,
    play(A, t) {
      const [a, b] = A.m;
      at(A, t, 0, () => a.say('Regarde ça !', 1.2));
      at(A, t, 0.6, () => a.flip(1.1));
      at(A, t, 2.2, () => b.say('Pfff, facile.', 1.2));
      at(A, t, 2.8, () => b.flip(0.8));
      at(A, t, 3.7, () => b.flip(0.8));
      at(A, t, 4.8, () => a.say(pick(['Match nul.', 'Tu as triché.', 'OK, t’es bon·ne.']), 1.6));
      return t > 6;
    },
  },
  {
    id: 'calin',
    status: 'fait un câlin',
    gap: 0.72,
    log: (a, b) => `🥰 ${a} et ${b} se font un gros câlin.`,
    play(A, t, dt) {
      const [a, b] = A.m;
      if (Math.random() < dt * 3) emit(A.data.mid, '❤', { cls: 'heart' });
      a.pose.roll = 0.25;
      b.pose.roll = -0.25;
      at(A, t, 0.3, () => a.say('🥰', 1.5));
      at(A, t, 1.8, () => b.say('T’es mon crustacé préféré.', 2));
      return t > 4.5;
    },
  },
  {
    id: 'shifumi',
    status: 'joue à pierre-feuille-ciseaux',
    log: (a, b) => `✊ ${a} et ${b} règlent un différend à pierre-feuille-ciseaux.`,
    play(A, t) {
      const [a, b] = A.m,
        D = A.data;
      at(A, t, 0.2, () => a.say('Pierre…', 0.8));
      at(A, t, 0.9, () => b.say('…feuille…', 0.8));
      at(A, t, 1.6, () => a.say('…ciseaux !', 0.8));
      at(A, t, 2.4, () => {
        D.ca = rint(0, 2);
        D.cb = rint(0, 2);
        a.say(HAND[D.ca], 1.4);
        b.say(HAND[D.cb], 1.4);
        a.pose.hop = b.pose.hop = 0.15;
      });
      at(A, t, 3.9, () => {
        a.pose.hop = b.pose.hop = 0;
        if (D.ca === D.cb) {
          a.say('😐 Égalité.', 1.4);
          b.say('On rejoue ?', 1.4);
        } else {
          const w = (D.ca - D.cb + 3) % 3 === 1 ? a : b,
            l = w === a ? b : a;
          w.say('🏆 Gagné !', 1.6);
          l.say('😩', 1.4);
          w.flip(0.8);
        }
      });
      return t > 5.4;
    },
  },
  {
    id: 'toupie',
    status: 'tourne comme une toupie',
    log: (a, b) => `🌀 ${a} et ${b} tournent comme des toupies, pour aucune raison.`,
    play(A, t) {
      const [a, b] = A.m;
      const s = Math.min(t, 4);
      a.pose.spin = s * s * 1.2;
      b.pose.spin = -s * s * 1.2;
      at(A, t, 0.3, () => a.say('Wiiiiii !', 1.4));
      if (t > 4) {
        a.pose.roll = Math.sin(t * 7) * 0.5;
        b.pose.roll = Math.cos(t * 7) * 0.5;
      }
      at(A, t, 4.3, () => a.say('🥴 J’ai le tournis…', 1.6));
      at(A, t, 4.9, () => b.say('Le bocal tourne encore ?', 1.6));
      return t > 6;
    },
  },
  {
    id: 'course',
    status: 'fait la course',
    log: (a, b) => `🏁 ${a} lance une course contre ${b}.`,
    play(A, t) {
      const [a, b] = A.m,
        D = A.data;
      if (!D.fin) {
        const m = D.mid;
        D.fin = V(-m.x, rnd(2.5, 7), -m.z);
        clampInside(D.fin, 1.6);
        if (D.fin.distanceTo(m) < 4) {
          D.fin = m.clone().addScaledVector(D.dir.clone().applyAxisAngle(UP, Math.PI / 2), 7);
          clampInside(D.fin, 1.6);
        }
        D.sa = rnd(2, 3);
        D.sb = rnd(2, 3);
        a.faceObj = b.faceObj = null;
        a.say('Premier·e au bout a gagné ! 3, 2, 1…', 1.2);
      }
      if (t > 1.2) {
        a.goTo(D.fin, D.sa);
        b.goTo(D.fin.clone().add(V(0, 0.6, 0)), D.sb);
      }
      if (!D.win && t > 1.2) {
        const da = a.pos.distanceTo(D.fin),
          db = b.pos.distanceTo(D.fin);
        if (da < 0.9 || db < 1.1) {
          D.win = da < db ? a : b;
          D.wt = t;
          const l = D.win === a ? b : a;
          D.win.say('🏁 Victoire !', 1.6);
          l.say(pick(['😮‍💨 Triche !', 'Revanche !', 'J’avais une crampe.']), 1.6);
          log(`🏁 ${D.win.name} bat ${l.name} à la course.`);
        }
      }
      return (D.win && t > D.wt + 2) || t > 14;
    },
  },
  {
    id: 'philo',
    status: 'philosophe',
    log: (a, b) => `🤔 ${a} et ${b} philosophent sur le sens du bocal.`,
    play(A, t) {
      const [a, b] = A.m;
      a.pose.ant = 1;
      at(A, t, 0, () => a.say(pick(QUESTIONS), 3.2));
      at(A, t, 3.4, () => b.say(pick(ANSWERS), 2.8));
      at(A, t, 6.4, () => a.say(pick(['…profond.', '🤯', 'Hmm.', 'Je note.']), 1.5));
      return t > 8;
    },
  },
  {
    id: 'regard',
    status: 'fait un concours de regard',
    gap: 0.75,
    log: (a, b) => `👁️ ${a} et ${b} font un concours de regard.`,
    play(A, t) {
      const [a, b] = A.m,
        D = A.data;
      [a, b].forEach(s => s.eyes.forEach(e => e.scale.setScalar(1.35)));
      at(A, t, 0.2, () => a.say('Le premier qui cligne a perdu.', 1.8));
      at(A, t, 2.2, () => b.say('👁️ 👁️', 1.6));
      at(A, t, 4.6, () => {
        D.l = Math.random() < 0.5 ? a : b;
        D.w = D.l === a ? b : a;
        D.l.say('Zut, j’ai cligné !', 1.6);
        D.w.say('😎', 1.6);
      });
      if (D.l && t < 5) D.l.eyes.forEach(e => e.scale.set(1.35, 0.15, 1.35));
      return t > 6.5;
    },
  },
];
PAIRS.forEach(d => {
  d.start = A => pairStart(A, d);
});
