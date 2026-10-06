/*
 * Concert : un groupe joue sur scène, le public danse.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'concert',
  label: 'Concert',
  min: 6,
  max: 14,
  status: 'va au concert',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const m = A.m,
      nb = clamp(m.length - 3, 3, 5),
      band = m.slice(0, nb),
      crowd = m.slice(nb);
    const kinds = shuffle(Object.keys(INSTR)).slice(0, nb);
    Object.assign(A.data, { band, crowd, kinds, name: pick(BANDS) });
    const stage = A.prop(mk(jitter(Cyl(3.6, 3.9, 0.5, 7), 0.05), M('#3b2a4a'), 0, 1.15, -3.6));
    stage.scale.x = 1.5;
    band.forEach((s, i) => {
      const x = (i - (nb - 1) / 2) * 1.7;
      s.goTo(V(x, 2.5 + (i % 2) * 0.5, -3.6), 1.8);
      s.faceObj = V(x, 2.8, 8);
      s.inst = makeInstrument(kinds[i]);
      s.addTemp(s.inst);
      s.status = INSTR[kinds[i]];
    });
    crowd.forEach((s, i) => {
      const a = (crowd.length > 1 ? i / (crowd.length - 1) - 0.5 : 0) * 2.2 + Math.PI / 2,
        r = 2.4 + (i % 2) * 1.6;
      s.goTo(V(Math.cos(a) * r, 2.4 + rnd(0, 1.6), Math.sin(a) * r + 0.6), 1.6);
      s.faceObj = V(0, 3, -3.6);
      s.status = 'danse au concert';
    });
    log(`🎸 Concert surprise de « ${A.data.name} » avec ${names(band)} !`, 'group');
    toast(`Concert : ${A.data.name}`);
  },
  play(A, t, dt) {
    const D = A.data;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('rock', D.kinds);
    }
    const beat = (t * Sound.bpm('rock')) / 60;
    D.band.forEach((s, i) => {
      s.pose.hop = Math.abs(Math.sin(beat * Math.PI)) * 0.16;
      s.pose.roll = Math.sin(beat * Math.PI * 0.5 + i) * 0.15;
      animInstrument(s, beat);
      if (Math.random() < dt * 1.6)
        emit(s.headPos(), pick(NOTES), { color: `hsl(${(i * 70 + t * 40) % 360},90%,72%)` });
    });
    D.crowd.forEach((s, i) => {
      s.pose.hop = Math.abs(Math.sin(beat * Math.PI + i * 0.3)) * 0.28;
      if (Math.random() < dt * 0.06) s.flip(1);
      if (Math.random() < dt * 0.07) s.say(pick(CROWD), 1.8);
    });
    at(A, t, 0.5, () =>
      D.band[0].say(
        pick(['Bonsoir le bocal !!', 'Un, deux, un deux trois quatre !', 'Ça va le bocal ?!']),
        2,
      ),
    );
    return t > 22;
  },
  end(A) {
    A.data.crowd.forEach(s => s.say('👏👏👏', 2));
    A.data.band[0].say('Merci, vous êtes magnifiques !', 2.5);
    log(`👏 Fin du concert de « ${A.data.name} ». Le public en redemande.`);
  },
});
