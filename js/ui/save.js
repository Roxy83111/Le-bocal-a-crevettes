/*
 * 💾 Sauvegarde de la partie dans des cookies.
 *
 * Ce qui est enregistré pour chaque crevette : nom, couleur, effets (jeb_ arc-en-ciel,
 * chapeau, costume d'Halloween), caractère, taille, nombre d'interactions et affinités
 * (qui s'entend bien avec qui).
 * Gamboo le fantôme n'est pas sauvegardé : halloween.js le fait réapparaître à chaque fois.
 *
 * - Sauvegarde automatique toutes les 30 s et quand on quitte la page ; bouton « Sauvegarder ».
 * - Chargement automatique au démarrage (js/main.js appelle loadGame()).
 * - « Nouvelle partie » efface la sauvegarde (deux clics pour confirmer).
 *
 * Un cookie est limité à ~4 Ko : la sauvegarde est découpée en plusieurs cookies
 * (bocal_save_n = nombre de morceaux, puis bocal_save_0, bocal_save_1…).
 * Si les cookies sont bloqués (par ex. Chrome quand on ouvre index.html en double-cliquant,
 * en file://), on se rabat sur le stockage local du navigateur (localStorage).
 */
'use strict';
const SAVE_KEY = 'bocal_save';
const SAVE_VERSION = 1;
const SAVE_EVERY = 30; // secondes
const SAVE_DAYS = 365;
const CHUNK = 3500; // caractères par cookie (marge sous la limite de 4096 octets)
let gameLoaded = false,
  saveDisabled = false;

/* ---------- Stockage : cookies, sinon localStorage ---------- */
const cookiePath = () => location.pathname.replace(/[^/]*$/, '') || '/';
function readCookies() {
  const out = {};
  for (const part of document.cookie.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}
function setCookie(name, value, days) {
  document.cookie = `${name}=${value};max-age=${Math.round(days * 86400)};path=${cookiePath()};SameSite=Lax`;
}
const cookiesWork = (() => {
  try {
    setCookie('bocal_test', '1', 1);
    const ok = readCookies().bocal_test === '1';
    setCookie('bocal_test', '', 0);
    return ok;
  } catch (e) {
    return false;
  }
})();
const SAVE_WHERE = cookiesWork ? 'cookie' : 'stockage local';

function storeWrite(str) {
  if (cookiesWork) {
    const enc = encodeURIComponent(str);
    const n = Math.ceil(enc.length / CHUNK);
    const old = +readCookies()[SAVE_KEY + '_n'] || 0;
    for (let i = 0; i < n; i++) setCookie(`${SAVE_KEY}_${i}`, enc.slice(i * CHUNK, (i + 1) * CHUNK), SAVE_DAYS);
    for (let i = n; i < old; i++) setCookie(`${SAVE_KEY}_${i}`, '', 0);
    setCookie(SAVE_KEY + '_n', n, SAVE_DAYS);
    // On vérifie que le navigateur a bien tout gardé.
    return readCookies()[SAVE_KEY + '_n'] === String(n);
  }
  try {
    localStorage.setItem(SAVE_KEY, str);
    return true;
  } catch (e) {
    return false;
  }
}
function storeRead() {
  if (cookiesWork) {
    const c = readCookies(),
      n = +c[SAVE_KEY + '_n'] || 0;
    if (!n) return null;
    let enc = '';
    for (let i = 0; i < n; i++) {
      if (c[`${SAVE_KEY}_${i}`] == null) return null;
      enc += c[`${SAVE_KEY}_${i}`];
    }
    try {
      return decodeURIComponent(enc);
    } catch (e) {
      return null;
    }
  }
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch (e) {
    return null;
  }
}
function storeClear() {
  if (cookiesWork) {
    const n = +readCookies()[SAVE_KEY + '_n'] || 0;
    for (let i = 0; i < n; i++) setCookie(`${SAVE_KEY}_${i}`, '', 0);
    setCookie(SAVE_KEY + '_n', '', 0);
  }
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
}

/* ---------- Format compact ----------
 * { v: 1, s: [ [nom, couleur, caractère, chapeau, taille×100, jeb, costume, interactions, affinités], … ] }
 * caractère et chapeau : index dans TRAITS / HATS (ou texte), 0 = pas de chapeau.
 * affinités : { indexDeLAutre: score } ; pour une crevette non sauvegardée (Gamboo) : { '~Nom': score }.
 */
function serialize() {
  const list = shrimps.filter(s => !s.isGhost && !s.removed && !s.scooped && !s.dead);
  const idx = new Map(list.map((s, i) => [s.name, i]));
  const code = (arr, v) => (arr.indexOf(v) >= 0 ? arr.indexOf(v) : v);
  return JSON.stringify({
    v: SAVE_VERSION,
    s: list.map(s => {
      const f = {};
      for (const name in s.friends) {
        const v = s.friends[name];
        if (!v) continue;
        f[idx.has(name) ? idx.get(name) : '~' + name] = v;
      }
      return [
        s.name,
        s.isJeb ? '#ff00aa' : s.color,
        s.isJeb ? 0 : code(TRAITS, s.trait),
        s.baseHat ? (HATS.includes(s.baseHat) ? HATS.indexOf(s.baseHat) + 1 : s.baseHat) : 0,
        Math.round(s.size * 100),
        s.isJeb ? 1 : 0,
        s.costumeName || 0,
        s.inter,
        f,
      ];
    }),
  });
}
function deserialize(str) {
  const d = JSON.parse(str);
  if (!d || d.v !== SAVE_VERSION || !Array.isArray(d.s)) return null;
  const decode = (arr, v) => (typeof v === 'number' ? arr[v] : v);
  const recs = d.s.map(r => ({
    name: String(r[0]).slice(0, 28),
    color: /^#[0-9a-f]{6}$/i.test(r[1]) ? r[1] : pick(COLORS),
    trait: decode(TRAITS, r[2]) || pick(TRAITS),
    hat: (r[3] && HATS.find(h => h === decode(HATS, typeof r[3] === 'number' ? r[3] - 1 : r[3]))) || null,
    size: clamp((+r[4] || 78) / 100, 0.6, 0.95),
    jeb: !!r[5],
    costume: r[6] || null,
    inter: +r[7] || 0,
    rawFriends: r[8] || {},
  }));
  for (const r of recs) {
    r.friends = {};
    for (const k in r.rawFriends) {
      const name = k[0] === '~' ? k.slice(1) : recs[+k] && recs[+k].name;
      if (name) r.friends[name] = +r.rawFriends[k] || 0;
    }
  }
  return recs;
}

/* ---------- API ---------- */
function saveGame(manual = false) {
  if (saveDisabled) return false;
  const ok = storeWrite(serialize());
  if (manual) toast(ok ? `💾 Partie sauvegardée (${SAVE_WHERE})` : '⚠️ Sauvegarde impossible dans ce navigateur');
  return ok;
}
function loadGame() {
  let recs = null;
  try {
    const str = storeRead();
    if (str) recs = deserialize(str);
  } catch (e) {
    console.warn('Sauvegarde illisible, nouvelle partie.', e);
  }
  if (!recs || !recs.length) return false;
  for (const r of recs) {
    const s = new Shrimp({ saved: r });
    s.friends = Object.assign({}, r.friends);
  }
  gameLoaded = true;
  log(`💾 Partie chargée : ${shrimps.length} crevettes retrouvent leur bocal.`, 'decor');
  return true;
}
function newGame() {
  saveDisabled = true;
  storeClear();
  location.reload();
}

/* ---------- Boutons et sauvegarde automatique ---------- */
$('saveBtn').onclick = () => saveGame(true);
let resetArmed = null;
$('resetBtn').onclick = e => {
  const b = e.currentTarget;
  if (resetArmed) {
    clearTimeout(resetArmed);
    newGame();
    return;
  }
  b.textContent = 'Sûr ? Re-cliquer';
  b.classList.add('danger');
  resetArmed = setTimeout(() => {
    resetArmed = null;
    b.textContent = 'Nouvelle partie';
    b.classList.remove('danger');
  }, 3000);
};
setInterval(() => saveGame(), SAVE_EVERY * 1000);
addEventListener('pagehide', () => saveGame());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveGame();
});
