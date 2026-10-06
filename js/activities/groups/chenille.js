/*
 * La chenille : tout le monde se suit en farandole.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'chenille',
  label: 'La chenille',
  min: 6,
  max: 12,
  status: 'fait la chenille',
  noGather: true,
  start(A) {
    log(`🐛 ${A.m[0].name} lance une chenille géante ! ${A.m.length} crevettes suivent.`, 'group');
    toast('La chenille !');
  },
  play(A, t, dt) {
    if (!A.music) {
      A.music = true;
      Sound.startMusic('conga');
    }
    const path = u => {
      const a = u * 0.45,
        r = 4.6 + 1.2 * Math.sin(u * 0.3);
      return V(Math.cos(a) * r, 4.2 + Math.sin(u * 0.9) * 2, Math.sin(a) * r);
    };
    A.m.forEach((s, i) => {
      s.goTo(path(t - i * 0.6), 2.6);
      s.pose.roll = Math.sin(t * 5 + i * 0.7) * 0.35;
      s.pose.hop = Math.abs(Math.sin(t * 5 + i * 0.7)) * 0.12;
    });
    at(A, t, 0.8, () => A.m[0].say('🎶 C’est la chenille qui redémarre…', 3));
    if (Math.random() < dt * 0.5)
      pick(A.m).say(
        pick(['Ohé ! Ohé !', '🎶 la la la', 'Attendez-moi !', 'Je ne sens plus mes pattes !']),
        1.6,
      );
    if (Math.random() < dt * 2) emit(pick(A.m).headPos(), pick(NOTES));
    return t > 22;
  },
  end() {
    log('🐛 La chenille se disperse, tout le monde est essoufflé.');
  },
});
