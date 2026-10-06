/*
 * Bulle géante : on souffle, ça grossit, quelqu’un reste coincé dedans.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
GROUPS.push({
  id: 'bulle',
  label: 'Bulle géante',
  min: 6,
  max: 8,
  status: 'souffle une bulle géante',
  gatherFrac: 0.85,
  gatherMax: 9,
  start(A) {
    const c = V(0, 2.6, 0),
      n = A.m.length;
    A.data.c = c;
    A.m.forEach((s, i) => {
      const a = (i / n) * Math.PI * 2;
      s.goTo(V(Math.cos(a) * 2.6, 2.4, Math.sin(a) * 2.6), 1.5);
      s.faceObj = c;
    });
    const b = A.prop(
      new THREE.Mesh(
        Ico(1, 1),
        new THREE.MeshStandardMaterial({
          color: '#bdefff',
          emissive: '#5fd0ff',
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.4,
          roughness: 0.05,
          metalness: 0.3,
          flatShading: true,
          depthWrite: false,
        }),
      ),
    );
    b.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(Ico(1, 1)),
        new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 }),
      ),
    );
    b.position.copy(c);
    b.scale.setScalar(0.05);
    b.renderOrder = 5;
    Object.assign(A.data, { b, victim: pick(A.m) });
    log(`🫧 ${names(A.m)} essaient de souffler la plus grosse bulle du bocal.`, 'group');
    toast('Bulle géante');
  },
  play(A, t, dt) {
    const D = A.data,
      b = D.b;
    if (t < 6) {
      const s = 0.05 + (t / 6) * 1.6;
      b.scale.set(s * (1 + Math.sin(t * 5) * 0.05), s * (1 - Math.sin(t * 5) * 0.05), s);
      if (Math.random() < dt * 1.2)
        pick(A.m).say(pick(['Fffffff…', 'Plus fort !', 'Elle grossit !', 'Fffff…']), 1.2);
      A.m.forEach(s => (s.pose.hop = Math.sin(t * 3 + s.phase) * 0.05));
    }
    at(A, t, 6, () => {
      D.victim.say('Euh… je suis coincé·e dedans ?', 2);
      D.victim.faceObj = null;
    });
    if (t >= 6 && t < 11.5) {
      const v = D.victim,
        rise = Math.min(1, (t - 6) / 5);
      b.position.set(Math.sin(t * 1.3) * 0.6, D.c.y + rise * (YMAX - 1 - D.c.y), Math.cos(t * 1.1) * 0.6);
      v.goTo(b.position, 4);
      v.pose.roll = Math.sin(t * 2) * 0.4;
      A.m.forEach(s => {
        if (s !== v) s.faceObj = b.position;
      });
    }
    at(A, t, 8.5, () => D.victim.say('Au secours ! …enfin non, c’est génial !', 2.5));
    at(A, t, 11.5, () => {
      b.visible = false;
      Sound.pop();
      for (let i = 0; i < 12; i++)
        emit(b.position, '○', { cls: 'bub', v: V(rnd(-2, 2), rnd(-1, 2), rnd(-2, 2)), life: 1.2 });
      emit(b.position, 'POP', { cls: 'pop', v: V(0, 0.4, 0) });
      D.victim.say('Aaaaah !', 1.5);
      D.victim.flip(1.2);
      D.victim.pose.roll = 0;
      log(`💥 La bulle éclate. ${D.victim.name} a vu le bocal d’en haut.`);
    });
    if (t > 11.5) D.victim.goTo(V(0, 3, 0), 1.5);
    return t > 14;
  },
});
