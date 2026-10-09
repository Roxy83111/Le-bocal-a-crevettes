/*
 * Points d'accroche pour les extensions (ex. js/seasonal/halloween.js).
 * Une extension s'abonne avec Hooks.on('nom', fonction) sans modifier le reste du code.
 *
 * Événements disponibles :
 *   'start'                     une fois, quand le bocal est prêt
 *   'shrimp:create' (shrimp)    à chaque nouvelle crevette
 *   'shrimp:remove' (shrimp)    quand une crevette quitte le bocal (épuisette, meurtre…)
 *   'shrimp:rename' (shrimp, ancienNom)  quand on renomme une crevette
 *   'decor:change'  (D, theme)  à chaque nouveau décor (D.group, D.hide, D.ticks)
 *   'act:end'       (act)       à la fin d'une activité (act.def, act.m, act.group)
 *   'cat:visit'     (Cat)       quand le chat arrive dans la cuisine
 *   'feed'          (n)         quand des granulés tombent dans le bocal
 *   'tick'          (dt)        à chaque pas de simulation (temps simulé)
 *   'frame'         (dt, rdt)   à chaque image, juste avant le rendu
 */
'use strict';
const Hooks = {
  _handlers: {},
  on(name, fn) {
    (this._handlers[name] = this._handlers[name] || []).push(fn);
  },
  emit(name, ...args) {
    for (const fn of this._handlers[name] || []) {
      try {
        fn(...args);
      } catch (e) {
        console.error(`[Hooks:${name}]`, e);
      }
    }
  },
};
