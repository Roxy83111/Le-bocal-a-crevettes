/*
 * Planificateur : décide quand lancer une interaction à deux ou une activité de groupe.
 */
'use strict';
function startPair(def, a, b) {
  new Act(def, [a, b], false);
}
function startGroup(def, members) {
  new Act(def, members, true);
  lastGroup = def.id;
}
let lastGroup = null,
  pairTimer = 1.5,
  groupTimer = 18;
function schedule(dt) {
  pairTimer -= dt;
  if (pairTimer <= 0) {
    pairTimer = rnd(1.4, 3.2);
    const free = shrimps.filter(s => !s.busy);
    const active = acts.filter(a => !a.group).length;
    if (free.length >= 2 && active < Math.max(1, Math.floor(shrimps.length / 5))) {
      const a = pick(free);
      let b;
      const others = free.filter(s => s !== a);
      if (Math.random() < 0.6) {
        others.sort((x, y) => x.pos.distanceTo(a.pos) - y.pos.distanceTo(a.pos));
        b = others[0];
      } else b = pick(others);
      startPair(pickWeighted(PAIRS), a, b);
    }
  }
  groupTimer -= dt;
  if (groupTimer <= 0) {
    if (acts.some(a => a.group)) {
      groupTimer = 8;
      return;
    }
    const free = shrimps.filter(s => !s.busy);
    const cands = GROUPS.filter(
      g => free.length >= g.min && g.id !== lastGroup && (!g.canStart || g.canStart()),
    );
    if (cands.length) {
      const def = pickWeighted(cands);
      const n = clamp(rint(def.min, def.max), def.min, free.length);
      startGroup(def, shuffle(free).slice(0, n));
      groupTimer = rnd(35, 55);
    } else groupTimer = 5;
  }
}
// Tirage au sort pondéré : une activité avec weight: 0.3 sort 3 fois moins souvent (1 par défaut).
function pickWeighted(list) {
  const total = list.reduce((s, g) => s + (g.weight ?? 1), 0);
  let r = Math.random() * total;
  for (const g of list) {
    r -= g.weight ?? 1;
    if (r <= 0) return g;
  }
  return list[list.length - 1];
}
function forceGroup(def) {
  if (shrimps.length < def.min) {
    toast(`Il faut au moins ${def.min} crevettes`);
    return;
  }
  if (def.canStart && !def.canStart()) {
    toast(def.cannotStart ? def.cannotStart() : 'Impossible de lancer cette activité maintenant');
    return;
  }
  acts.slice().forEach(a => a.finish());
  const all = shuffle(shrimps.filter(s => !s.scooped));
  const n = clamp(rint(def.min, def.max), def.min, all.length);
  startGroup(def, all.slice(0, n));
  groupTimer = rnd(40, 60);
}
