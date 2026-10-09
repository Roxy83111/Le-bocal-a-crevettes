/*
 * Textes et listes : noms, caractères, répliques, groupes de musique, équipes…
 * C’est ici qu’on ajoute facilement du contenu.
 */
'use strict';
const COLORS = [
  '#e63946',
  '#ff6b35',
  '#f4a261',
  '#ffd23f',
  '#3a86ff',
  '#00b4d8',
  '#8338ec',
  '#ff006e',
  '#2ec4b6',
  '#7cb518',
  '#ff9f1c',
  '#c77dff',
  '#ff595e',
  '#06d6a0',
];
// Les noms sont dans js/core/names.js (facile à modifier).
const NAMES = shuffle(SHRIMP_NAMES.filter(n => n.trim()).slice());
let nameIdx = 0;
// Prochain nom libre (saute ceux déjà portés, par exemple après le chargement d'une sauvegarde).
function nextName() {
  while (nameIdx < NAMES.length) {
    const n = NAMES[nameIdx++];
    if (!shrimps.some(s => s.name === n)) return n;
  }
  let k = 1;
  while (shrimps.some(s => s.name === 'Crevette n°' + k)) k++;
  return 'Crevette n°' + k;
}
const TRAITS = [
  'fêtard·e',
  'philosophe',
  'timide',
  'grognon·ne',
  'sportif·ve',
  'artiste',
  'rêveur·se',
  'gourmand·e',
  'dramatique',
  'très sérieux·se',
];
const HATS = ['haut-de-forme', 'cotillon', 'couronne', 'béret', 'nœud', 'chapeau de paille'];
const MIAM = ['Miam !', '😋', 'Crunch.', 'Délicieux.', 'Encore !'];
const NOTES = ['♪', '♫', '♬', '♩'];
const HELLO = [
  'Salut %, bien nagé ?',
  'Yo % !',
  'Tiens, % ! Ça mue ?',
  'Bonjour très cher %.',
  '% ! Ça faisait 3 minutes !',
];
const HELLO_R = ['Salut toi !', 'Tranquille, et toi ?', 'On se connaît ?', 'Bulle sur toi !', 'Yo.'];
const GOSSIP = [
  'Il paraît que % a mué deux fois cette semaine.',
  '% dort la tête en bas, je te jure.',
  '% parle aux cailloux la nuit.',
  '% a mangé le granulé de quelqu’un d’autre.',
  '% prépare un album de rap sous-marin.',
  '% s’est coincé·e dans un coquillage hier.',
  '% croit que le bocal est le monde entier.',
  '% a un poster de homard dans sa chambre.',
];
const QUESTIONS = [
  'Si un granulé tombe et que personne ne le mange, existe-t-il ?',
  'Et si l’eau était mouillée seulement de l’intérieur ?',
  'Le monde derrière le verre… est-ce un bocal plus grand ?',
  'Pourquoi le décor change quand on cligne des yeux ?',
  'Un homard, c’est juste une crevette qui a réussi ?',
  'Est-ce que les bulles ont des sentiments ?',
];
const ANSWERS = [
  'Moi je pense surtout au déjeuner.',
  'Seul le plancton connaît la réponse.',
  'Tu as encore mangé du sable bizarre.',
  'Le grand œil derrière la vitre nous observe…',
  'Arrête, tu me donnes mal aux antennes.',
  '42 granulés. C’est toujours 42 granulés.',
];
const CROWD = [
  '🤘 Ouais !',
  'Bis !',
  'Je pleure…',
  'Mon groupe préféré !',
  'Plus fort !',
  '🔥',
  'Je connais les paroles !',
];
const BANDS = [
  'Les Gambas Hurlantes',
  'Krill Bill & le Plancton',
  'Carapace Sonore',
  'Les Antennes Rebelles',
  'Crustacé Mood',
  'Pince-moi j’hallucine',
];
const TEAMS = [
  'FC Carapace',
  'Olympique de Krill',
  'Real Gambas',
  'AS Antennes',
  'Plancton United',
  'Racing Scampi',
];
const TOPICS = [
  'Le plancton : ami ou ennemi ?',
  'Muer sans stress en 5 étapes',
  'Économie du granulé',
  'Le géant derrière la vitre existe-t-il ?',
  'Histoire du bocal, des origines à mardi',
];
const SLIDES = [
  'Diapo 1 : moi, bébé crevette. Trop mignon·ne.',
  'Comme disait ma grand-mère : « Nage. »',
  '87 % du bocal est mouillé. Les 13 % restants nous mentent.',
  'Il y a 10 types de crevettes : celles qui comprennent le binaire et les autres.',
  'Question ouverte : qui a pris mon caillou ?',
  'Graphique : la courbe monte. Pourquoi ? Mystère.',
  'Le verre n’est pas un mur. C’est une fenêtre sur le géant.',
  'Conclusion : on est bien, ici.',
];
const YOGA = [
  { n: 'la Crevette qui salue le Soleil', flip: -0.9, curl: 0.35 },
  { n: 'le Krill Tranquille', curl: -1 },
  { n: 'la Gambas Penchée', roll: 0.9, curl: -0.3 },
  { n: 'le Homard Inversé', flip: Math.PI, curl: 0.2 },
  { n: 'le Scampi Méditatif', flip: 0.25, curl: -0.6, spin: Math.PI },
];
const INSTR = {
  guitare: 'joue de la guitare',
  batterie: 'joue de la batterie',
  trompette: 'joue de la trompette',
  maracas: 'secoue des maracas',
  micro: 'chante au micro',
  triangle: 'joue du triangle (avec passion)',
  clavier: 'joue du keytar',
};
