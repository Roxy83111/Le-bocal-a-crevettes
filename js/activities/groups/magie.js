/*
 * Spectacle de magie : un·e magicien·ne fait disparaître son assistant·e dans une armoire…
 * puis la/le fait réapparaître à l'autre bout du bocal.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makeMagicCabinet() {
  const g = new THREE.Group();
  const purple = M('#5a189a'),
    gold = M('#ffd23f', { metalness: 0.6, roughness: 0.3 });
  part(g, Box(1.5, 0.12, 1.2), gold, [0, 0, 0]);
  part(g, Box(1.5, 2.2, 0.1), purple, [0, 1.1, -0.55]);
  part(g, Box(0.1, 2.2, 1.2), purple, [-0.72, 1.1, 0]);
  part(g, Box(0.1, 2.2, 1.2), purple, [0.72, 1.1, 0]);
  part(g, Box(1.6, 0.14, 1.3), gold, [0, 2.25, 0]);
  for (let i = 0; i < 4; i++)
    part(g, new THREE.OctahedronGeometry(0.1), E('#ffd23f', 0.8), [rnd(-0.5, 0.5), rnd(0.4, 1.9), -0.49]);
  // Porte qui pivote
  const door = new THREE.Group();
  door.position.set(-0.72, 1.1, 0.6);
  part(door, Box(1.44, 2.2, 0.08), M('#7b2cbf'), [0.72, 0, 0]);
  part(door, new THREE.OctahedronGeometry(0.18), E('#ffd23f', 0.8), [0.72, 0.4, 0.06]);
  g.add(door);
  g.userData.door = door;
  return g;
}
function makeWand() {
  const g = new THREE.Group();
  part(g, Cyl(0.025, 0.025, 0.6, 5), M('#111'), [0, 0, 0], null, [Math.PI / 2.4, 0, 0]);
  part(g, Cyl(0.03, 0.03, 0.1, 5), M('#ffffff'), [0, 0.24, 0.11], null, [Math.PI / 2.4, 0, 0]);
  g.position.set(0.3, -0.1, 0.9);
  return g;
}

GROUPS.push({
  id: 'magie',
  label: 'Spectacle de magie',
  min: 6,
  max: 12,
  status: 'regarde un spectacle de magie',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const [mag, asst, ...aud] = A.m;
    const cab = A.prop(makeMagicCabinet());
    cab.position.set(1.4, 1.15, -3.4);
    Object.assign(A.data, { mag, asst, aud, cab, doorT: 0 });
    mag.goTo(V(-1, 2.8, -3), 1.4);
    mag.faceObj = V(0, 2.8, 10);
    mag.status = 'fait de la magie';
    const top = makeHat('haut-de-forme');
    mag.addTemp(top);
    mag.addTemp(makeWand());
    asst.goTo(V(0.2, 2.4, -2.4), 1.4);
    asst.faceObj = V(0, 2.4, 10);
    asst.status = 'assiste le magicien';
    aud.forEach((s, i) => {
      const row = Math.floor(i / 5),
        col = i % 5;
      s.goTo(V((col - 2) * 1.5, 2.3 + row * 0.9, 2.2 + row * 1.4), 1.4);
      s.faceObj = V(0, 2.8, -3);
    });
    log(`🎩 Spectacle de magie du Grand ${mag.name}, avec ${asst.name} comme assistant·e.`, 'group');
    toast(`Le Grand ${mag.name}`);
  },
  play(A, t, dt) {
    const D = A.data,
      door = D.cab.userData.door;
    // La porte s'ouvre (doorT = 1) ou se ferme (doorT = 0) en douceur.
    door.rotation.y += (-D.doorT * 1.9 - door.rotation.y) * (1 - Math.exp(-dt * 6));
    D.mag.pose.ant = 1;
    at(A, t, 0.3, () => D.mag.say('Mesdames et messieurs les crustacés !', 2.2));
    at(A, t, 2.4, () => {
      D.doorT = 1;
      D.mag.say(`Mon assistant·e ${D.asst.name} va entrer dans l’armoire…`, 2.2);
    });
    if (t > 3 && t < 5.2) D.asst.goTo(V(1.4, 2.2, -3.5), 1.8);
    at(A, t, 4.6, () => D.asst.say('Euh… vous êtes sûr·e ?', 1.4));
    at(A, t, 5.3, () => {
      D.doorT = 0;
      D.asst.root.visible = false;
    });
    at(A, t, 6.2, () => {
      D.mag.say('Abracadabra… CREVETTUS DISPARITUS !', 2);
      D.mag.flip(0.8);
      for (let i = 0; i < 8; i++) emit(V(1.4, rnd(2, 3.5), -3), '✨', { life: 1.4 });
    });
    at(A, t, 7.6, () => {
      for (let i = 0; i < 6; i++) emit(V(1.4 + rnd(-0.6, 0.6), rnd(1.6, 3), -3), '💨', { life: 1.2 });
      Sound.pop();
    });
    at(A, t, 8.4, () => {
      D.doorT = 1;
      D.aud.forEach(s => s.say(pick(['😱', 'Disparu·e !', 'Comment ?!', 'C’est un trucage']), 1.8));
    });
    at(A, t, 10.5, () => {
      const p = V(rnd(-1, 1), YMAX - 1, rnd(-1, 1) + 1);
      D.asst.pos.copy(p);
      D.asst.target.copy(p);
      D.asst.root.visible = true;
      for (let i = 0; i < 8; i++) emit(p, '✨', { life: 1.4 });
      D.asst.say('Ta-daaa ! …je suis où ?', 2);
      D.aud.forEach(s => (s.faceObj = D.asst));
    });
    at(A, t, 12.5, () => {
      D.doorT = 0;
      D.mag.say('Et pour finir… un granulé sorti du chapeau !', 2);
    });
    at(A, t, 14, () => {
      dropPellets(6, V(-1, 0, -2));
      D.aud.forEach(s => s.say('👏', 1.5));
      log(`👏 Triomphe pour le Grand ${D.mag.name}. ${D.asst.name} cherche encore comment c’est arrivé.`);
    });
    return t > 16;
  },
  end(A) {
    A.data.asst.root.visible = true;
  },
});
