/*
 * 🌈 jeb_ : la crevette arc-en-ciel, rarissime.
 * Chaque nouvelle crevette a 1 chance sur 100 d'être jeb_ (une seule à la fois dans le bocal).
 * Comme le célèbre mouton de Minecraft, sa couleur passe en douceur d'une teinture à la suivante.
 * Pour en faire apparaître une tout de suite, tape spawnJeb() dans la console du navigateur.
 */
'use strict';

const JEB_CHANCE = 1 / 100;
const JEB_NAME = 'jeb_';
// Les 16 teintures, dans l'ordre où le mouton les parcourt.
const JEB_DYES = [
  '#f9fffe',
  '#f9801d',
  '#c74ebd',
  '#3ab3da',
  '#fed83d',
  '#80c71f',
  '#f38baa',
  '#474f52',
  '#9d9d97',
  '#169c9c',
  '#8932b8',
  '#3c44aa',
  '#835432',
  '#5e7c16',
  '#b02e26',
  '#1d1d21',
].map(c => new THREE.Color(c));
const JEB_STEP = 1; // secondes par couleur

function makeJeb(s) {
  s.isJeb = true;
  s.name = JEB_NAME;
  s.tag.textContent = JEB_NAME;
  s.trait = 'légendaire (1 chance sur 100)';
  s.color = '#ff00aa';
  log('🌈 Une crevette rarissime apparaît : jeb_ !', 'decor');
  toast('🌈 jeb_ est dans le bocal !');
  setTimeout(() => s.say('🌈 Salut, je suis jeb_.', 2.5), 400);
}

Hooks.on('shrimp:create', s => {
  if (Math.random() < JEB_CHANCE && !shrimps.some(o => o !== s && o.isJeb)) makeJeb(s);
});

// Pour tester : crée une crevette jeb_ tout de suite.
function spawnJeb() {
  if (shrimps.some(o => o.isJeb)) return;
  const s = new Shrimp({ pos: V(0, YMAX, 0) });
  if (!s.isJeb) makeJeb(s);
  renderList();
}

const _jc = new THREE.Color();
Hooks.on('frame', () => {
  for (const s of shrimps) {
    if (!s.isJeb) continue;
    const x = simTime / JEB_STEP,
      i = Math.floor(x) % JEB_DYES.length;
    const k = x - Math.floor(x);
    _jc.copy(JEB_DYES[i]).lerp(JEB_DYES[(i + 1) % JEB_DYES.length], k * k * (3 - 2 * k));
    s.mats.body.color.copy(_jc);
    s.mats.dark.color.copy(_jc).multiplyScalar(0.78);
    s.mats.pale.color.copy(_jc).lerp(new THREE.Color('#ffffff'), 0.45);
    if (s.listStatus)
      s.listStatus.previousSibling.previousSibling.style.background = '#' + _jc.getHexString();
  }
});
