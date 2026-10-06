/*
 * Yoga synchronisé : enchaînement de postures guidé par un coach.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'yoga',
  label: 'Yoga synchronisé',
  min: 6,
  max: 10,
  status: 'fait du yoga',
  gatherFrac: 0.85,
  gatherMax: 10,
  start(A) {
    const [coach, ...cls] = A.m;
    Object.assign(A.data, { coach, cls });
    coach.goTo(V(0, 3.2, 3.4), 1.4);
    coach.faceObj = V(0, 3, -10);
    coach.status = 'donne un cours de yoga';
    const per = Math.ceil(cls.length / 2);
    cls.forEach((s, i) => {
      const row = Math.floor(i / per),
        col = i % per,
        cnt = row ? cls.length - per : per;
      const x = (col - (cnt - 1) / 2) * 1.6;
      s.goTo(V(x, 2.6 + row * 0.9, -0.2 - row * 1.8), 1.4);
      s.faceObj = V(x, 2.8, 20);
    });
    log(`🧘 Cours de yoga synchronisé mené par ${coach.name}.`, 'group');
    toast('Yoga synchronisé');
  },
  play(A, t, dt) {
    const D = A.data;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('mystic');
    }
    const idx = Math.floor(t / 3.4),
      P = YOGA[Math.min(idx, YOGA.length - 1)];
    if (idx < YOGA.length)
      at(A, t, idx * 3.4, () => {
        D.coach.say(`Et maintenant… ${P.n} !`, 2.6);
        D.clumsy = Math.random() < 0.5 ? pick(D.cls) : null;
      });
    [D.coach, ...D.cls].forEach(s => {
      s.pose.flip = P.flip || 0;
      s.pose.curl = P.curl || 0;
      s.pose.roll = P.roll || 0;
      s.pose.spin = P.spin || 0;
    });
    if (D.clumsy && t % 3.4 > 1.6 && idx < YOGA.length) {
      D.clumsy.pose.roll = 1.7;
      at(A, t, idx * 3.4 + 1.6, () =>
        D.clumsy.say(pick(['Oups…', 'Aïe, ma carapace.', 'C’est une variante.']), 1.6),
      );
    }
    at(A, t, YOGA.length * 3.4, () => D.coach.say('Namasté, les crustacés. 🙏', 2.5));
    return t > YOGA.length * 3.4 + 1.5;
  },
  end() {
    log('🧘 Fin du cours. Tout le monde se sent très aligné.');
  },
});
