/*
 * 💬 Moteur de discussions générées (procédural, 100 % local et hors ligne).
 *
 * Comment ça marche :
 *   1. Deux crevettes se croisent → l'interaction « discussion » (ajoutée à PAIRS) démarre.
 *   2. Le moteur choisit un SUJET (js/dialogue/topics.js) selon le contexte : caractère des
 *      crevettes, affinité entre elles, décor, heure, souvenirs récents du bocal…
 *   3. Le sujet donne une suite de modèles de phrases ; le moteur les remplit avec le
 *      vocabulaire de js/dialogue/lexicon.js (grammaire à symboles #liste#, {variables}).
 *   4. Chaque réplique passe par la « voix » de la crevette (son caractère) et s'affiche
 *      dans une bulle. Si la caméra suit l'une des deux, la discussion s'écrit aussi dans le journal.
 *   5. À la fin, l'affinité change : on s'entend bien (+), on se dispute (−), on se réconcilie…
 *
 * Les crevettes seules pensent aussi à voix haute de temps en temps.
 *
 * Dans la console : Dialogue.preview('Nom1', 'Nom2') affiche une discussion générée.
 */
'use strict';
const Dialogue = (() => {
  const W = DIALOGUE_WORDS;
  if (!W.band && typeof BANDS !== 'undefined') W.band = BANDS; // groupes de musique de data.js
  const CHAIN_CHANCE = 0.3; // chance d'enchaîner sur un 2e sujet dans la même discussion
  const topics = [];
  const memory = []; // souvenirs récents du bocal : { kind, ev, ev2, how, who, t }
  const recent = []; // dernières phrases dites (pour éviter les répétitions)
  let decorName = '',
    decorT = -999,
    started = false,
    thoughtT = 8,
    lastLabel = '';

  /* ---------- Affinité et caractère ---------- */
  // Humeur de s envers o : 'warm' (ami·es), 'neutral' ou 'cold' (en froid).
  function moodOf(s, o) {
    if (!o) return 'neutral';
    const v = s.friends[o.name] || 0;
    return v >= 4 ? 'warm' : v < 0 ? 'cold' : 'neutral';
  }
  function traitKey(s) {
    for (const k in DIALOGUE_VOICES) if (s.trait && s.trait.startsWith(k)) return k;
    return null;
  }
  const HOBBY_KEYS = {
    fêtard: 'fetard',
    philosophe: 'philosophe',
    timide: 'timide',
    grognon: 'grognon',
    sportif: 'sportif',
    artiste: 'artiste',
    rêveur: 'reveur',
    gourmand: 'gourmand',
    dramatique: 'dramatique',
    'très sérieux': 'serieux',
  };
  const hobbyKey = s => HOBBY_KEYS[traitKey(s)] || 'autre';
  const hasTrait = (s, k) => !!s.trait && s.trait.startsWith(k);
  function addAffinity(a, b, d) {
    if (!d) return;
    a.friends[b.name] = (a.friends[b.name] || 0) + d;
    b.friends[a.name] = (b.friends[a.name] || 0) + d;
  }

  /* ---------- Grammaire ---------- */
  // Cherche d'abord la version liée à l'humeur (ex. greet_warm), sinon la liste simple.
  const lookup = (key, ctx) => W[key + '_' + ctx.mood] || W[key];
  function expand(str, ctx, depth = 0) {
    if (depth > 8) return str;
    str = str.replace(/\{(\w+)\}/g, (m, k) => (ctx[k] != null ? ctx[k] : m));
    return str.replace(/#(\w+)(\.cap)?#/g, (m, key, cap) => {
      const list = lookup(key, ctx);
      if (!list || !list.length) return m;
      // Dans une même discussion, on évite de tirer deux fois le même élément.
      const used = (ctx.used[key] = ctx.used[key] || []);
      const fresh = list.filter(x => !used.includes(x));
      const pickd = pick(fresh.length ? fresh : list);
      used.push(pickd);
      const r = expand(pickd, ctx, depth + 1);
      return cap ? r.charAt(0).toUpperCase() + r.slice(1) : r;
    });
  }
  // Ajoute parfois un tic de langage selon le caractère : au plus un par crevette et par
  // discussion, et pas de fin ajoutée aux salutations.
  function voice(s, text, ctx, short = false) {
    const v = DIALOGUE_VOICES[traitKey(s)];
    if (!v || ctx.tics.has(s)) return text;
    if (v.pre.length && Math.random() < 0.3) {
      ctx.tics.add(s);
      return pick(v.pre) + text;
    }
    if (!short && v.post.length && Math.random() < 0.3 && !/\?\s*$/.test(text)) {
      ctx.tics.add(s);
      const p = pick(v.post);
      return (p.startsWith('…') ? text.replace(/[.!…]+\s*$/, '') : text.trimEnd()) + p;
    }
    return text;
  }

  /* ---------- Contexte d'une discussion ---------- */
  function makeCtx(a, b) {
    const pool = shrimps.filter(s => s !== a && s !== b && !s.removed && !s.scooped);
    // On parle plus volontiers de ses ami·es… et de ses ennemi·es.
    const x = pool.length
      ? pickWeighted(pool.map(s => ({ s, weight: 1 + Math.abs(a.friends[s.name] || 0) }))).s
      : null;
    return {
      A: a,
      B: b,
      xs: x,
      x: x ? x.name : 'le caillou du fond',
      decor: decorName || $('decorName').textContent,
      decorAge: simTime - decorT,
      hour: clockStr().hh,
      night: isNight(),
      used: {},
      tics: new Set(),
      delta: 0,
    };
  }
  function line(ctx, sp, li, tpl) {
    ctx.me = sp.name;
    ctx.you = li.name;
    ctx.mood = moodOf(sp, li);
    if (typeof tpl === 'function') tpl = tpl(ctx);
    let text = '';
    for (let k = 0; k < 4; k++) {
      text = expand(tpl, ctx);
      if (!recent.includes(text)) break;
    }
    recent.push(text);
    if (recent.length > 80) recent.shift();
    return voice(sp, text, ctx, /^#(greet|greetback|bye)#$/.test(tpl));
  }

  /* ---------- Génération d'une discussion complète ---------- */
  function pickTopic(ctx, filter = () => true) {
    const cands = topics
      .filter(t => filter(t) && (!t.can || t.can(ctx)))
      .map(t => ({ t, weight: typeof t.weight === 'function' ? t.weight(ctx) : t.weight ?? 1 }))
      .filter(c => c.weight > 0);
    return cands.length ? pickWeighted(cands).t : null;
  }
  function converse(a, b) {
    const ctx = makeCtx(a, b);
    const topic = pickTopic(ctx);
    const script = topic.lines(ctx); // modèles de phrases, alternativement a puis b
    const turns = [];
    if (!topic.noGreet && Math.random() < 0.55) {
      turns.push([a, b, '#greet#']);
      if (Math.random() < 0.55) turns.push([b, a, '#greetback#']);
    }
    script.forEach((tpl, i) => turns.push(i % 2 ? [b, a, tpl] : [a, b, tpl]));
    // Parfois, la discussion rebondit sur un deuxième sujet (« Au fait… »).
    let label = topic.label;
    const topic2 =
      topic.chain !== false && Math.random() < CHAIN_CHANCE
        ? pickTopic(ctx, t => t !== topic && t.chain !== false)
        : null;
    if (topic2) {
      const first = turns[turns.length - 1][0] === a ? b : a,
        second = first === a ? b : a;
      topic2.lines(ctx).forEach((tpl, i) =>
        turns.push(i % 2 ? [second, first, tpl] : [first, second, i === 0 ? '#transition#' + tpl : tpl]),
      );
      label += `, puis ${topic2.label}`;
    }
    if (Math.random() < 0.5) {
      const sp = turns[turns.length - 1][0] === a ? b : a;
      turns.push([sp, sp === a ? b : a, '#bye#']);
    }
    const lines = turns.map(([sp, li, tpl]) => ({ s: sp, text: line(ctx, sp, li, tpl) }));
    return { topic: topic.id + (topic2 ? '+' + topic2.id : ''), label, lines, delta: ctx.delta };
  }
  // Une pensée à voix haute pour une crevette seule.
  function thought(s) {
    const ctx = makeCtx(s, null);
    ctx.B = s;
    return line(ctx, s, s, '#thought#');
  }

  /* ---------- Souvenirs : ce qui s'est passé récemment dans le bocal ---------- */
  function remember(kind, data) {
    memory.push(Object.assign({ kind, t: simTime }, data));
    if (memory.length > 14) memory.shift();
  }
  Hooks.on('start', () => (started = true));
  Hooks.on('decor:change', (D, T) => {
    if (decorName && decorName !== T.name) remember('decor', { ev: decorName });
    decorName = T.name;
    decorT = simTime;
  });
  Hooks.on('shrimp:create', s => {
    if (started) remember('new', { ev: s.name, who: s });
  });
  Hooks.on('shrimp:remove', s => {
    for (let i = memory.length - 1; i >= 0; i--) if (memory[i].who === s) memory.splice(i, 1);
    remember('gone', { ev: s.name, how: s.dead ? 'murder' : s.scooped ? 'scoop' : 'other' });
  });
  Hooks.on('shrimp:rename', (s, old) => {
    for (const m of memory) if (m.who === s) m.ev = s.name;
    remember('rename', { ev: old, ev2: s.name, who: s });
  });
  Hooks.on('act:end', act => {
    if (act.group) remember('act', { ev: act.def.label, members: act.m.slice() });
  });
  Hooks.on('cat:visit', Cat => remember('cat', { ev: Cat.name }));
  Hooks.on('feed', () => {
    const last = memory.filter(m => m.kind === 'feed').pop();
    if (!last || simTime - last.t > 20) remember('feed', {});
  });
  // Souvenirs dont on peut parler entre a et b (pas d'eux-mêmes).
  function memoriesFor(a, b) {
    return memory.filter(m => m.who !== a && m.who !== b);
  }

  /* ---------- L'interaction « discussion » ---------- */
  PAIRS.push({
    id: 'discussion',
    weight: 5, // revient plus souvent que les autres interactions à deux (poids 1)
    status: 'discute',
    gap: 0.8,
    log: (a, b) => `💬 ${a} et ${b} discutent ${lastLabel}.`,
    start(A) {
      pairStart(A, this);
    },
    init(A) {
      const conv = converse(A.m[0], A.m[1]);
      lastLabel = conv.label;
      let t = 0.3;
      for (const l of conv.lines) {
        l.at = t;
        l.dur = clamp(1.3 + l.text.length * 0.045, 1.8, 4.8);
        t += l.dur + 0.25;
      }
      A.data.conv = conv;
      A.data.total = t;
      A.m.forEach(s => (s.status = `discute ${conv.label}`));
    },
    play(A, t) {
      const D = A.data;
      D.conv.lines.forEach(l =>
        at(A, t, l.at, () => {
          l.s.say(l.text, l.dur);
          D.cur = l.s;
          // Si la caméra suit l'une des deux, la discussion s'écrit dans le journal.
          if (A.m.includes(cam.follow)) log(`${l.s.name} : « ${l.text} »`, 'chat');
        }),
      );
      A.m.forEach(s => {
        const speaking = s === D.cur;
        s.pose.ant = speaking ? 1 : 0;
        s.pose.roll = speaking ? Math.sin(t * 5 + s.phase) * 0.12 : 0;
      });
      return t > D.total + 0.3;
    },
    end(A) {
      const [a, b] = A.m;
      if (a.removed || b.removed) return;
      addAffinity(a, b, A.data.conv.delta);
      if (A.data.conv.delta <= -2) log(`💢 ${a.name} et ${b.name} sont fâché·es.`);
      if (A.data.conv.delta >= 3) log(`🤝 ${a.name} et ${b.name} se réconcilient.`);
    },
  });

  /* ---------- Pensées à voix haute ---------- */
  Hooks.on('tick', dt => {
    thoughtT -= dt;
    if (thoughtT > 0) return;
    thoughtT = rnd(6, 14);
    const free = shrimps.filter(
      s => !s.busy && !s.scooped && !s.isGhost && s.mode !== 'sleep' && !(s.bub && s.bub.life > 0),
    );
    if (free.length) {
      const s = pick(free);
      s.say(thought(s), 3);
    }
  });

  return {
    words: W,
    topics,
    memory,
    moodOf,
    hasTrait,
    hobbyKey,
    memoriesFor,
    converse,
    thought,
    remember,
    addTopic: t => topics.push(t),
    // Pour tester dans la console : Dialogue.preview() ou Dialogue.preview('Nom1', 'Nom2')
    preview(n1, n2) {
      const find = n => shrimps.find(s => s.name === n);
      const a = find(n1) || pick(shrimps),
        b = find(n2) || pick(shrimps.filter(s => s !== a));
      const c = converse(a, b);
      console.log(`— ${a.name} & ${b.name}, ${c.label} —\n` + c.lines.map(l => `${l.s.name} : ${l.text}`).join('\n'));
      return c;
    },
  };
})();
