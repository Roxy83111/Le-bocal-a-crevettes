/*
 * Photo de classe : une crevette photographe tente de faire LA photo parfaite.
 * Il y a toujours quelqu'un qui cligne des yeux ou fait des oreilles de lapin.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makePhotoCamera() {
  const g = new THREE.Group();
  part(g, Box(0.5, 0.32, 0.25), M('#2b2d42'));
  part(g, Cyl(0.11, 0.13, 0.22, 8), M('#8d99ae', { metalness: 0.6, roughness: 0.3 }), [0, 0, 0.2], null, [
    Math.PI / 2,
    0,
    0,
  ]);
  part(g, Box(0.12, 0.08, 0.08), M('#ef233c'), [0.17, 0.2, 0]);
  g.position.set(0, 0.05, 1.05);
  return g;
}

GROUPS.push({
  id: 'photo',
  label: 'Photo de classe',
  min: 6,
  max: 12,
  status: 'pose pour la photo de classe',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const [ph, ...kids] = A.m;
    Object.assign(A.data, { ph, kids });
    ph.goTo(V(0, 3.1, 5.4), 1.4);
    ph.faceObj = V(0, 3, 0);
    ph.status = 'prend la photo';
    ph.addTemp(makePhotoCamera());
    const per = Math.ceil(kids.length / 2);
    kids.forEach((s, i) => {
      const row = Math.floor(i / per),
        col = i % per,
        cnt = row ? kids.length - per : per;
      const x = (col - (cnt - 1) / 2) * 1.35;
      s.goTo(V(x, 2.3 + row * 1.05, -0.6 - row * 0.9), 1.5);
      s.faceObj = V(x * 0.3, 3, 8);
    });
    const flash = new THREE.PointLight('#ffffff', 0, 18);
    flash.position.set(0, 3.6, 4.6);
    A.data.flash = A.prop(flash);
    log(`📸 Photo de classe ! ${ph.name} sort l’appareil.`, 'group');
    toast('Photo de classe');
  },
  play(A, t, dt) {
    const D = A.data;
    D.flash.intensity = Math.max(0, D.flash.intensity - dt * 12);
    const shoot = () => {
      D.flash.intensity = 5;
      emit(D.ph.headPos(), '📸', { life: 1 });
      Sound.pop();
    };
    at(A, t, 0.5, () => D.ph.say('Tout le monde dit… « Plancton ! »', 2));
    at(A, t, 2.6, () => pick(D.kids).say('Plancton !', 1.2));
    at(A, t, 2.9, () => pick(D.kids).say('Planctooon !', 1.2));
    at(A, t, 3.2, shoot);
    at(A, t, 4, () => {
      D.v1 = pick(D.kids);
      D.ph.say(`Raté, ${D.v1.name} a cligné des yeux. On recommence !`, 2.4);
      D.v1.say('Pas fait exprès…', 1.6);
    });
    if (D.v1 && t > 3.1 && t < 3.6) D.v1.eyes.forEach(e => e.scale.set(1, 0.15, 1));
    else D.kids.forEach(s => s.eyes.forEach(e => e.scale.setScalar(1)));
    at(A, t, 6.5, () => D.ph.say('Souriez… 3, 2, 1…', 1.6));
    at(A, t, 7.2, () => {
      D.v2 = pick(D.kids.filter(s => s !== D.v1));
      D.v2.pose.flip = -0.5;
      D.v2.pose.ant = 1;
    });
    at(A, t, 8, shoot);
    at(A, t, 8.6, () => {
      D.ph.say(`${D.v2.name}, arrête les oreilles de lapin avec tes antennes !`, 2.4);
      D.v2.say('😇 Quoi ?', 1.6);
    });
    at(A, t, 10.5, () => {
      D.v2.pose.flip = 0;
      D.v2.pose.ant = 0;
      D.ph.say('Dernière ! Personne ne bouge…', 1.6);
      D.kids.forEach(s => (s.pose.hop = 0.05));
    });
    at(A, t, 11.8, shoot);
    at(A, t, 12.6, () => {
      D.ph.say('Parfaite ! Celle-là, on l’encadre.', 2.2);
      D.kids.forEach(s => s.say(pick(['🎉', 'Enfin !', 'Je suis bien dessus ?', 'Envoie-la-moi !']), 1.6));
      log('🖼️ La photo de classe est réussie (au troisième essai).');
    });
    return t > 15;
  },
});
