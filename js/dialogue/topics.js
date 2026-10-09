/*
 * 💬 Sujets de discussion. Chaque sujet :
 *   id      identifiant
 *   label   complète « X et Y discutent … » (ex. 'de nourriture')
 *   weight  nombre ou fonction (ctx) → chance d'être choisi (selon caractère, humeur…)
 *   can     (optionnel) fonction (ctx) → false si le sujet n'a pas de sens maintenant
 *   lines   fonction (ctx) → liste de modèles de phrases, dites tour à tour par a puis b
 *           (le moteur ajoute parfois une salutation au début et un au revoir à la fin)
 *   chain   (optionnel) false = ce sujet n'est jamais enchaîné avec un autre (disputes…)
 *   ctx.delta (optionnel) : à augmenter/diminuer dans lines() pour changer l'affinité à la fin
 *             (toujours avec += ou -=, car deux sujets peuvent se suivre).
 *
 * ctx contient : A et B (les crevettes), xs/x (une autre crevette et son nom), decor,
 * decorAge (secondes depuis le changement de décor), hour, night.
 */
'use strict';
(() => {
  const { addTopic, moodOf, hasTrait, hobbyKey, memoriesFor } = Dialogue;
  const both = (c, k) => hasTrait(c.A, k) || hasTrait(c.B, k);

  addTopic({
    id: 'nourriture',
    label: 'de nourriture',
    weight: c => (both(c, 'gourmand') ? 4 : 1.2),
    lines: () => ['#food_open#', '#food_reply#', '#food_end#'],
  });

  addTopic({
    id: 'decor',
    label: 'du décor',
    weight: c => (c.decorAge < 40 ? 3.5 : 1),
    lines: c => {
      // B donne son avis, A est d'accord… ou pas (selon leur affinité).
      const agree = Math.random() < { warm: 0.85, neutral: 0.6, cold: 0.25 }[moodOf(c.A, c.B)];
      if (!agree) c.delta -= 1;
      return ['#decor_open#', Math.random() < 0.6 ? '#decor_like#' : '#decor_hate#', agree ? '#agree#' : '#disagree#', '#decor_end#'];
    },
  });

  addTopic({
    id: 'heure',
    label: 'de l’heure qu’il est',
    weight: c => (c.night ? 1.6 : 0.7),
    lines: c => (c.night ? ['#night_open#', '#night_reply#', '#time_end#'] : ['#day_open#', '#day_reply#', '#time_end#']),
  });

  addTopic({
    id: 'potins',
    label: 'des autres crevettes',
    weight: 2,
    can: c => !!c.xs,
    lines: c => {
      const x = c.xs;
      let open;
      if (x.isJeb) open = 'Tu as vu {x} ? Sa carapace change de couleur toutes les secondes !';
      else if (x.isGhost) open = '{x} m’a traversé·e ce matin. Brrr.';
      else open = (c.A.friends[x.name] || 0) >= 3 ? '#praise_open#' : '#gossip_open#';
      // La réponse dépend de ce que B pense de cette crevette.
      return [open, `#about_x_${moodOf(c.B, x)}#`, '#gossip_end#'];
    },
  });

  addTopic({
    id: 'philo',
    label: 'du sens de la vie',
    weight: c => (both(c, 'philosophe') ? 4 : both(c, 'rêveur') ? 2 : 0.9),
    lines: () => ['#philo_q#', '#philo_a#', '#philo_end#'],
  });

  addTopic({
    id: 'reves',
    label: 'de leurs rêves',
    weight: c => (hasTrait(c.A, 'rêveur') ? 4 : 0.8),
    lines: () => ['Cette nuit, j’ai rêvé que #dream#.', '#dream_reply#', '#dream_end#'],
  });

  addTopic({
    id: 'projets',
    label: 'de leurs projets',
    weight: c => (hasTrait(c.A, 'sportif') || hasTrait(c.A, 'fêtard') ? 2.5 : 1),
    lines: () => ['Demain, #plan#.', '#plan_reply#', '#plan_end#'],
  });

  addTopic({
    id: 'hobby',
    label: 'de ce qu’elles font de beau',
    weight: 1.5,
    lines: c => ['#hobby_open#', `#hobby_${hobbyKey(c.B)}#`, '#hobby_reply#'],
  });

  addTopic({
    id: 'geant',
    label: 'du géant derrière la vitre',
    weight: 0.8,
    lines: () => ['#giant_open#', '#giant_reply#', '#giant_end#'],
  });

  addTopic({
    id: 'compliment',
    label: 'de leur amitié',
    weight: 2.5,
    can: c => moodOf(c.A, c.B) === 'warm',
    lines: c => {
      c.delta += 1;
      return ['#compliment_open#', '#compliment_reply#', '#compliment_end#'];
    },
  });

  addTopic({
    id: 'dispute',
    label: 'sur un ton… tendu',
    chain: false,
    weight: c => {
      const m = moodOf(c.A, c.B);
      if (m === 'cold') return 2;
      if (m === 'warm') return 0;
      return both(c, 'grognon') || both(c, 'dramatique') ? 0.6 : 0.2;
    },
    lines: c => {
      c.delta -= 2;
      return ['#dispute_open#', '#dispute_reply#', '#dispute_more#', '#dispute_end#'];
    },
  });

  addTopic({
    id: 'paix',
    label: 'pour faire la paix',
    chain: false,
    weight: 1.2,
    can: c => moodOf(c.A, c.B) === 'cold' || moodOf(c.B, c.A) === 'cold',
    noGreet: true,
    lines: c => {
      c.delta += 3;
      return ['#peace_open#', '#peace_reply#', '#peace_end#'];
    },
  });

  // Une remarque sur un détail du décor actuel (DIALOGUE_DECOR dans lexicon.js).
  addTopic({
    id: 'decor-detail',
    label: 'du décor',
    weight: c => (c.decorAge < 60 ? 3 : 1.5),
    can: c => !!DIALOGUE_DECOR[c.decor],
    lines: c => [pick(DIALOGUE_DECOR[c.decor]), '#decor_spec_reply#', '#decor_spec_end#'],
  });

  // Blagues : « question|chute » dans la liste joke. On évite de raconter deux fois la même d'affilée.
  const lastJokes = [];
  addTopic({
    id: 'blague',
    label: 'en se racontant des blagues',
    weight: c => (both(c, 'fêtard') ? 3 : 1.3),
    lines: () => {
      const all = Dialogue.words.joke;
      const fresh = all.filter(j => !lastJokes.includes(j));
      const joke = pick(fresh.length ? fresh : all);
      lastJokes.push(joke);
      if (lastJokes.length > Math.floor(all.length / 2)) lastJokes.shift();
      const [question, chute] = joke.split('|');
      return [question, '#joke_guess#', chute, '#joke_react#'];
    },
  });

  addTopic({
    id: 'defi',
    label: 'en se lançant des défis',
    weight: c => (both(c, 'sportif') ? 3 : 1),
    lines: () => ['#challenge_open#', '#challenge_reply#', '#challenge_end#'],
  });

  addTopic({
    id: 'mue',
    label: 'de leur mue',
    weight: 0.9,
    lines: () => ['#molt_open#', '#molt_reply#', '#molt_end#'],
  });

  addTopic({
    id: 'musique',
    label: 'de musique',
    weight: c => (both(c, 'artiste') || both(c, 'fêtard') ? 2.5 : 1),
    lines: () => ['#music_open#', '#music_reply#', '#music_end#'],
  });

  addTopic({
    id: 'secret',
    label: 'à voix basse',
    weight: c => (moodOf(c.A, c.B) === 'warm' ? 2 : 0.6),
    can: c => moodOf(c.A, c.B) !== 'cold',
    lines: c => {
      c.delta += 1;
      return ['#secret_ask#', '#secret_ok#', '#secret#', '#secret_react#'];
    },
  });

  addTopic({
    id: 'conseil',
    label: 'pour se donner des conseils',
    weight: c => (hasTrait(c.B, 'très sérieux') || hasTrait(c.B, 'philosophe') ? 2 : 1),
    lines: () => ['#advice_open#', '#advice#', '#advice_end#'],
  });

  addTopic({
    id: 'cuisine',
    label: 'de la cuisine du géant',
    weight: 1,
    lines: () => ['#kitchen_open#', '#kitchen_reply#', '#kitchen_end#'],
  });

  addTopic({
    id: 'enfance',
    label: 'de leur enfance',
    weight: c => (both(c, 'rêveur') || both(c, 'dramatique') ? 2 : 0.8),
    lines: () => ['Quand j’étais petite larve, #childhood#.', '#childhood_reply#', '#childhood_end#'],
  });

  addTopic({
    id: 'chat',
    label: 'du chat',
    weight: 0.8,
    lines: () => ['#cat_open#', '#cat_reply#', '#cat_end#'],
  });

  // Souvenirs : décor précédent, crevette partie ou arrivée, chat, activité de groupe…
  addTopic({
    id: 'souvenirs',
    label: 'des dernières nouvelles',
    weight: c => {
      const m = memoriesFor(c.A, c.B);
      if (!m.length) return 0;
      return simTime - m[m.length - 1].t < 60 ? 4 : 1.2;
    },
    lines: c => {
      const list = memoriesFor(c.A, c.B).slice(-5);
      const m = list.length > 1 && Math.random() < 0.5 ? list[list.length - 1] : pick(list);
      c.ev = m.ev;
      c.ev2 = m.ev2;
      const out = {
        decor: ['#mem_decor#', '#mem_decor_reply#'],
        gone: ['#mem_gone#', `#mem_gone_${m.how}#`],
        new: ['#mem_new#', '#mem_new_reply#'],
        cat: ['#mem_cat#', '#mem_cat_reply#'],
        act: ['#mem_act#', m.members && m.members.includes(c.B) ? '#mem_act_was#' : '#mem_act_missed#'],
        feed: ['#mem_feed#', '#mem_feed_reply#'],
        rename: ['#mem_rename#', '#mem_rename_reply#'],
      }[m.kind];
      if (Math.random() < 0.5) out.push('#mem_end#');
      return out;
    },
  });
})();
