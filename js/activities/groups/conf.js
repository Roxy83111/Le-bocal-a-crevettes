/*
 * Conférence : une crevette présente des diapos absurdes.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'conf',
  label: 'Conférence',
  min: 6,
  max: 12,
  status: 'écoute une conférence',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const [sp, ...aud] = A.m;
    const topic = pick(TOPICS);
    Object.assign(A.data, { sp, aud, topic, lines: shuffle(SLIDES.slice()).slice(0, 4) });
    const scr = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ map: slideTex(topic, 'par ' + sp.name) });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.36), mat);
    pl.position.z = 0.06;
    scr.add(pl);
    scr.add(mk(Box(4.5, 2.6, 0.1), M('#2b2b33')));
    scr.position.set(0, 5.2, -4.2);
    A.prop(scr);
    A.data.scr = mat;
    sp.goTo(V(2.9, 3.6, -3.4), 1.4);
    sp.faceObj = V(0, 3, 10);
    sp.status = 'donne une conférence';
    aud.forEach((s, i) => {
      const row = Math.floor(i / 4),
        col = i % 4;
      s.goTo(V((col - 1.5) * 1.6, 2.3 + row * 0.8, 1.4 + row * 1.5), 1.4);
      s.faceObj = V(0, 4.8, -4.2);
    });
    log(`🎤 ${sp.name} donne une conférence : « ${topic} ».`, 'group');
    toast('Conférence');
  },
  play(A, t, dt) {
    const D = A.data,
      k = Math.floor(t / 3.2);
    if (k < 4)
      at(A, t, k * 3.2, () => {
        D.scr.map.dispose();
        D.scr.map = slideTex(D.topic, D.lines[k]);
        D.scr.needsUpdate = true;
        D.sp.say(D.lines[k], 3);
      });
    D.sp.pose.ant = 1;
    D.sp.pose.roll = Math.sin(t * 2) * 0.15;
    D.aud.forEach(s => {
      if (Math.random() < dt * 0.07)
        s.say(pick(['🤔', 'Fascinant.', 'Je prends des notes.', 'ZzZz…', '👏', 'Hmm hmm.']), 1.4);
    });
    at(A, t, 13, () => pick(D.aud).say('Question : est-ce qu’on aura des granulés ?', 2.4));
    at(A, t, 15, () => D.sp.say('Excellente question. Suivante !', 2));
    return t > 17;
  },
  end(A) {
    log(`👏 Standing ovation (enfin, nageante) pour ${A.data.sp.name}.`);
  },
});
