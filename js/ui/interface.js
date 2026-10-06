/*
 * Interface : journal, liste des crevettes, fiche, boutons et annonces.
 */
'use strict';
const logEl = $('log');
function clockStr() {
  const m = Math.floor(8 * 60 + simTime * 2);
  return {
    d: Math.floor(m / 1440) + 1,
    hh: String(Math.floor((m % 1440) / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'),
  };
}
function log(text, kind) {
  const li = document.createElement('li');
  if (kind) li.className = kind;
  const tm = document.createElement('time');
  tm.textContent = clockStr().hh;
  const sp = document.createElement('span');
  sp.textContent = text;
  li.append(tm, sp);
  logEl.prepend(li);
  while (logEl.children.length > 90) logEl.lastChild.remove();
}
let toastT = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
const listEl = $('list');
function renderList() {
  listEl.innerHTML = '';
  shrimps.forEach(s => {
    const li = document.createElement('li'),
      b = document.createElement('button'),
      i = document.createElement('i'),
      n = document.createElement('b'),
      st = document.createElement('small');
    i.style.background = s.color;
    n.textContent = s.name;
    st.textContent = s.status;
    b.append(i, n, st);
    b.addEventListener('click', () => follow(s));
    s.listStatus = st;
    li.append(b);
    listEl.append(li);
  });
  $('pop').textContent = `${shrimps.length} crevettes`;
}
function updateFocus() {
  const s = cam.follow;
  if (!s) return;
  $('fName').textContent = s.name;
  $('fTrait').textContent = s.trait;
  $('fHat').textContent = s.hatKind || 'aucun';
  $('fStatus').textContent = s.status;
  $('fCount').textContent = s.inter;
  let best = null,
    bv = 0;
  for (const k in s.friends)
    if (s.friends[k] > bv) {
      bv = s.friends[k];
      best = k;
    }
  $('fFriend').textContent = best ? `${best} (${bv})` : 'pas encore';
  $('fName').style.color = s.color;
}
$('tabLog').onclick = () => {
  $('tabLog').classList.add('on');
  $('tabList').classList.remove('on');
  logEl.hidden = false;
  listEl.hidden = true;
};
$('tabList').onclick = () => {
  $('tabList').classList.add('on');
  $('tabLog').classList.remove('on');
  logEl.hidden = true;
  listEl.hidden = false;
};
$('sideClose').onclick = () => document.body.classList.add('side-closed');
$('sideOpen').onclick = () => document.body.classList.remove('side-closed');
if (window.innerWidth < 760) document.body.classList.add('side-closed');
let speed = 1;
function setSpeed(v) {
  speed = v;
  document.querySelectorAll('#speed button').forEach(b => b.classList.toggle('on', +b.dataset.s === v));
}
document.querySelectorAll('#speed button').forEach(b => (b.onclick = () => setSpeed(+b.dataset.s)));
$('feed').onclick = () => {
  dropPellets(10, randInside());
  log('🍽️ Le géant derrière la vitre verse des granulés.');
};
$('nextDecor').onclick = () => nextDecor();
const sel = $('grpSel');
// Rempli au démarrage (main.js) pour inclure les activités ajoutées par les extensions.
function fillGroupSelect() {
  sel.innerHTML = '';
  GROUPS.forEach((g, i) => {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = g.label;
    sel.append(o);
  });
}
$('grpGo').onclick = () => forceGroup(GROUPS[+sel.value]);
$('add').onclick = () => {
  if (shrimps.length >= 30) {
    toast('Le bocal est plein (30 crevettes)');
    return;
  }
  const p = randInside();
  p.y = YMAX;
  const s = new Shrimp({ pos: p });
  s.say('Plouf ! Bonjour tout le monde !', 2.2);
  for (let i = 0; i < 6; i++) emit(p, '○', { cls: 'bub', life: 1.4 });
  log(`🦐 ${s.name} arrive dans le bocal. Plouf.`);
  renderList();
};
$('names').onclick = e => {
  showNames = !showNames;
  e.currentTarget.setAttribute('aria-pressed', showNames);
};
$('sound').onclick = e => {
  const on = Sound.toggle();
  e.currentTarget.setAttribute('aria-pressed', !!on);
  e.currentTarget.textContent = on ? 'Son activé' : 'Son';
};
$('unfollow').onclick = () => follow(null);
$('renameForm').addEventListener('submit', e => {
  e.preventDefault();
  if (cam.follow) renameShrimp(cam.follow, $('fRename').value);
  $('fRename').value = '';
});
$('scoop').onclick = () => {
  if (cam.follow) scoopShrimp(cam.follow);
};
$('hitbox').onclick = e => {
  setHitboxesVisible(!hitboxesVisible);
  e.currentTarget.setAttribute('aria-pressed', hitboxesVisible);
};
