/*
 * Défilé de mode : mannequins sur le podium et remise de la Carapace d’Or.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'defile',
  label: 'Défilé de mode',
  min: 7,
  max: 12,
  status: 'assiste au défilé',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const nm = Math.min(4, A.m.length - 3),
      models = A.m.slice(0, nm),
      aud = A.m.slice(nm);
    Object.assign(A.data, { models, aud });
    A.prop(mk(Box(11, 0.12, 1.3), M('#ff5d8f'), 0, 1.45, 0));
    models.forEach((s, i) => {
      s.wait = V(-6.2, 2.2 + i * 0.7, (i % 2 ? 1 : -1) * 0.7);
      s.goTo(s.wait, 1.4);
      s.faceObj = V(10, 2.2, 0);
      s.status = 'défile';
      s.addTemp(makeHat(pick(HATS)));
    });
    aud.forEach((s, i) => {
      const side = i % 2 ? 1 : -1,
        k = Math.floor(i / 2),
        cnt = Math.ceil(aud.length / 2),
        x = (k - (cnt - 1) / 2) * 1.8;
      s.goTo(V(x, 2.3 + (k % 2) * 0.4, side * 2.4), 1.4);
      s.faceObj = V(x, 2, 0);
    });
    log(`👗 Défilé « Collection Automne-Marée » avec ${names(models)}.`, 'group');
    toast('Défilé de mode');
  },
  play(A, t, dt) {
    const D = A.data,
      slot = 5;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('chic');
    }
    D.models.forEach((s, i) => {
      const lt = t - i * slot;
      if (lt < 0 || lt > slot + 1.5) {
        s.goTo(s.wait, 1.4);
        s.pose.roll = 0;
        return;
      }
      if (lt < 3) {
        s.faceObj = null;
        s.goTo(V(-5 + (lt / 3) * 10, 1.95, 0), 3);
        s.pose.roll = Math.sin(lt * 6) * 0.3;
      } else if (lt < 4.2) {
        s.goTo(V(5, 1.95, 0), 3);
        s.pose.roll = 0;
        at(A, t, i * slot + 3, () => {
          s.twirl(1);
          s.say(
            pick([
              '💅',
              'Je suis iconique.',
              'Carapace signée Lagerkrill.',
              'Collection Automne-Marée.',
              'Merci, merci.',
            ]),
            1.8,
          );
        });
      } else s.goTo(s.wait, 1.6);
    });
    D.aud.forEach(s => {
      if (Math.random() < dt * 0.1)
        s.say(
          pick(['Sublime !', 'Quelle carapace !', '👏', 'Ces antennes…', 'Je veux le même chapeau.']),
          1.5,
        );
      if (Math.random() < dt * 0.4) emit(s.headPos(), '📸', { life: 0.8 });
    });
    const endT = D.models.length * slot + 1;
    at(A, t, endT, () => {
      const w = pick(D.models);
      w.say('Je voudrais remercier le sable…', 2.6);
      log(`👑 La Carapace d’Or est attribuée à ${w.name}.`);
      toast(`Carapace d’Or : ${w.name}`);
      w.flip(1);
    });
    return t > endT + 3;
  },
  end(A) {
    A.data.models.forEach(s => delete s.wait);
  },
});
