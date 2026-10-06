/*
 * Nage synchronisée : le groupe enchaîne des figures (cercle, roue, étoile, spirale, vague)
 * puis attend les notes d'un jury très sévère.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
const BALLET_FIGURES = [
  {
    name: 'le Grand Cercle',
    at: (i, n, t) => {
      const a = (i / n) * Math.PI * 2 + t * 0.4;
      return V(Math.cos(a) * 3.4, 5, Math.sin(a) * 3.4);
    },
  },
  {
    name: 'la Roue verticale',
    at: (i, n, t) => {
      const a = (i / n) * Math.PI * 2 + t * 0.6;
      return V(Math.cos(a) * 3, 5.6 + Math.sin(a) * 3, 0);
    },
  },
  {
    name: 'l’Étoile de mer',
    at: (i, n, t) => {
      const a = (i / n) * Math.PI * 2 + t * 0.3;
      const r = i % 2 ? 1.8 : 4;
      return V(Math.cos(a) * r, 4.5 + (i % 2) * 1.2, Math.sin(a) * r);
    },
  },
  {
    name: 'la Spirale',
    at: (i, n, t) => {
      const a = i * 0.9 + t * 0.8;
      return V(Math.cos(a) * 2.6, 2.4 + (i / n) * 6.5, Math.sin(a) * 2.6);
    },
  },
  {
    name: 'la Vague',
    at: (i, n, t) => V((i - (n - 1) / 2) * 1.2, 5 + Math.sin(t * 2.5 - i * 0.7) * 1.4, 0),
  },
];

GROUPS.push({
  id: 'ballet',
  label: 'Nage synchronisée',
  min: 6,
  max: 10,
  status: 'fait de la nage synchronisée',
  noGather: true,
  start(A) {
    A.data.figs = shuffle(BALLET_FIGURES.slice()).slice(0, 4);
    log(`🩰 Nage synchronisée avec ${names(A.m)}.`, 'group');
    toast('Nage synchronisée');
  },
  play(A, t, dt) {
    const D = A.data,
      n = A.m.length,
      len = 5;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('chic');
    }
    const k = Math.min(D.figs.length - 1, Math.floor(t / len));
    const fig = D.figs[k];
    at(A, t, k * len, () => {
      A.m[0].say(`Figure : ${fig.name} !`, 2);
      A.m.forEach(s => s.twirl(0.8));
    });
    A.m.forEach((s, i) => {
      s.goTo(fig.at(i, n, t), 2.6);
      s.pose.roll = Math.sin(t * 2 + i * 0.5) * 0.35;
      s.pose.curl = Math.sin(t * 1.5) * 0.4;
    });
    if (Math.random() < dt * 3) emit(pick(A.m).headPos(), '○', { cls: 'bub', v: V(0, 1, 0), life: 1.4 });
    const endT = D.figs.length * len;
    at(A, t, endT, () => {
      const notes = [rnd(9, 10), rnd(8.5, 10), rnd(2, 6)].map(x => x.toFixed(1).replace('.', ','));
      log(`🩰 Notes du jury : ${notes.join(' / ')} (le jury krill est très sévère).`);
      toast(`Notes : ${notes.join(' · ')}`);
      A.m.forEach(s => s.flip(1));
    });
    return t > endT + 2.5;
  },
});
