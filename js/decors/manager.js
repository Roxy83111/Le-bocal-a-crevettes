/*
 * Gestion des décors : apparition/disparition animée et transition des couleurs.
 */
'use strict';
let curDecor = null,
  oldDecor = null,
  decorIdx = -1,
  decorT = 0;
const DECOR_PERIOD = 90;
const colT = {
  water: new THREE.Color(),
  sand: new THREE.Color(),
  bg: new THREE.Color(),
  sky: new THREE.Color(),
  ground: new THREE.Color(),
  surf: new THREE.Color(),
};
function setDecor(i, instant) {
  decorIdx = i;
  const T = THEMES[i];
  const g = new THREE.Group();
  const D = { hide: [], ticks: [], group: g, theme: T, grow: instant ? 1 : 0 };
  T.build(g, D);
  g.traverse(o => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  g.scale.setScalar(instant ? 1 : 0.001);
  scene.add(g);
  if (curDecor) {
    if (oldDecor) {
      scene.remove(oldDecor.group);
      disposeObj(oldDecor.group);
    }
    oldDecor = curDecor;
    oldDecor.shrink = 1;
  }
  curDecor = D;
  decorT = 0;
  colT.water.set(T.water);
  colT.sand.set(T.sand);
  colT.bg.set(T.bg);
  colT.sky.set(T.sky);
  colT.ground.set(T.ground);
  colT.surf.set(T.water).lerp(new THREE.Color('#ffffff'), 0.4);
  sandAmpT = T.amp;
  if (instant) {
    waterMat.color.copy(colT.water);
    sandMat.color.copy(colT.sand);
    scene.background.copy(colT.bg);
    scene.fog.color.copy(colT.bg);
    hemi.color.copy(colT.sky);
    hemi.groundColor.copy(colT.ground);
    surfMat.color.copy(colT.surf);
    sandAmp = sandAmpT;
    applySand();
  }
  $('decorName').textContent = T.name;
  Hooks.emit('decor:change', D, T);
  if (!instant) {
    log(`🎨 Nouveau décor : ${T.name}.`, 'decor');
    toast(T.name);
    for (let k = 0; k < 16; k++)
      emit(V(rnd(-6, 6), rnd(1.5, 4), rnd(-6, 6)), '○', { cls: 'bub', v: V(0, rnd(1, 2), 0), life: 2.2 });
  }
}
function nextDecor() {
  let i;
  do {
    i = rint(0, THEMES.length - 1);
  } while (i === decorIdx && THEMES.length > 1);
  setDecor(i);
}
function decorUpdate(dt, rdt) {
  if (curDecor) curDecor.ticks.forEach(f => f(simTime, dt));
  if (oldDecor) {
    oldDecor.shrink -= rdt / 0.9;
    const s = Math.max(0.001, oldDecor.shrink);
    oldDecor.group.scale.set(s, s * s, s);
    if (oldDecor.shrink <= 0) {
      scene.remove(oldDecor.group);
      disposeObj(oldDecor.group);
      oldDecor = null;
    }
  } else if (curDecor && curDecor.grow < 1) {
    curDecor.grow = Math.min(1, curDecor.grow + rdt / 1.5);
    curDecor.group.scale.setScalar(Math.max(0.001, easeOutBack(curDecor.grow)));
  }
  const k = 1 - Math.exp(-rdt * 1.5);
  waterMat.color.lerp(colT.water, k);
  sandMat.color.lerp(colT.sand, k);
  scene.background.lerp(colT.bg, k);
  scene.fog.color.lerp(colT.bg, k);
  hemi.color.lerp(colT.sky, k);
  hemi.groundColor.lerp(colT.ground, k);
  surfMat.color.lerp(colT.surf, k);
  if (Math.abs(sandAmp - sandAmpT) > 0.005) {
    sandAmp += (sandAmpT - sandAmp) * k;
    applySand();
  }
}
