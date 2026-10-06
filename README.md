# 🦐 Le Bocal — simulation de vie de crevettes

Une simulation en 3D, entièrement en **low poly**, où une quinzaine de crevettes vivent dans un bocal
posé sur la table d'une cuisine. Elles se baladent, mangent, dorment, interagissent à deux au hasard et se
lancent dans des activités de groupe absurdes (concert, cache-cache, cours de cuisine, meurtre au bocal…).
Le décor du bocal change régulièrement, et le chat de la maison passe parfois les surveiller.

---

## Sommaire

1. [Lancer l'application](#lancer-lapplication)
2. [Ce que fait l'application](#ce-que-fait-lapplication)
3. [Commandes](#commandes)
4. [Organisation des fichiers](#organisation-des-fichiers)
5. [Fonctionnement général](#fonctionnement-général)
6. [Description détaillée des fichiers](#description-détaillée-des-fichiers)
   - [index.html](#indexhtml)
   - [CSS](#css)
   - [js/core](#jscore)
   - [js/ui](#jsui)
   - [js/shrimp](#jsshrimp)
   - [js/world](#jsworld)
   - [js/activities](#jsactivities)
   - [js/decors](#jsdecors)
   - [js/seasonal](#jsseasonal)
   - [js/main.js](#jsmainjs)
7. [Formats à connaître](#formats-à-connaître)
8. [Ajouter du contenu](#ajouter-du-contenu)
9. [Limites connues](#limites-connues)
10. [Licence](#licence)

---

## Lancer l'application

Double-clique sur `index.html` : la page s'ouvre dans ton navigateur.

- Une **connexion internet** est nécessaire, car le moteur 3D [three.js](https://threejs.org/) (version r128) et les polices sont chargés en ligne.
- Aucune installation ni serveur n'est nécessaire.

---

## Ce que fait l'application

| Domaine | Contenu |
|---|---|
| **Crevettes** | 14 au départ (30 au maximum). Chacune a un nom, une couleur, une taille, un caractère et parfois un chapeau. Les noms se modifient dans `js/core/names.js` ou directement dans la fiche (« Renommer »). |
| **jeb_** | Crevette arc-en-ciel rarissime (1 chance sur 100 à chaque nouvelle crevette) dont la couleur passe d'une teinture à l'autre. |
| **Épuisette** | Retire définitivement la crevette sélectionnée, avec une petite animation. |
| **Vie libre** | Se balader, picorer le sable, faire la sieste (plus souvent la nuit), regarder à travers la vitre, foncer sur les granulés. |
| **Interactions à deux** | 11 interactions aléatoires : salut, tango, dispute pour une miette, potins, saltos, câlin, pierre-feuille-ciseaux, toupie, course, philosophie, concours de regard. |
| **Activités de groupe** | 24 activités pour 6 crevettes ou plus : concert, cache-cache, chenille, pyramide, foot, rituel, yoga, défilé, bulle géante, conférence, 1-2-3 soleil, coquillages musicaux, photo de classe, nage synchronisée, magie, anniversaire, danse classique, cours de cuisine, tir à la corde, karaoké, bowling, feu d'artifice, bataille de bulles, parcours d'obstacles. |
| **Décors** | 17 décors (+ 1 avec Halloween) qui changent toutes les 90 secondes simulées : récif, épave, temple, base lunaire, bonbons, disco, jardin zen, bureau, volcan sous-marin, forêt de champignons, avant-poste galactique, île tropicale, fête foraine, banquise, laboratoire secret, Far West, ville engloutie. |
| **Cuisine** | Le bocal est posé sur une table à pieds, dans une cuisine low poly : carrelage, plan de travail, gazinière qui fume, frigo, fenêtre dont le ciel suit l'heure, horloge qui tourne, suspension. |
| **Chat** | De temps en temps, le chat saute sur le plan de travail, fixe le bocal, miaule… et les crevettes paniquent. |
| **Physique** | Chaque crevette a une hitbox en forme de gélule, donc les crevettes ne peuvent pas se traverser. |
| **Ambiance** | Vagues à la surface, bulles, rayons de lumière, cycle jour/nuit (1 seconde réelle = 2 minutes simulées). |
| **Son** | Voix, « pop » et musiques générées en direct, sans aucun fichier audio. |
| **Halloween** | Extension supprimable : costumes, chauves-souris, fantômes, Gamboo la crevette fantôme, décor hanté, 1 interaction et 4 activités, dont le **meurtre au bocal** (morts définitives, seulement à plus de 15 crevettes). |

---

## Commandes

| Action | Effet |
|---|---|
| Glisser (souris ou doigt) | Tourner autour du bocal |
| Molette / pincer | Zoomer |
| Clic sur une crevette | La caméra la suit et sa fiche s'affiche |
| Fiche → **Renommer** | Donne un nouveau nom à la crevette suivie |
| Fiche → **Épuisette** | Retire définitivement la crevette suivie du bocal |
| Clic dans le vide / `Échap` | Lâcher la caméra |
| `Espace` | Pause / reprise |
| **❚❚ ×1 ×2 ×4** | Vitesse de la simulation |
| **Nourrir** | Verse 10 granulés |
| **Changer de décor** | Passe tout de suite au décor suivant |
| **Menu + Lancer** | Démarre l'activité de groupe choisie (en interrompant les activités en cours) |
| **+ Crevette** | Ajoute une crevette (plouf) |
| **Noms** | Affiche le nom de toutes les crevettes |
| **Hitbox** | Affiche les hitbox en fil de fer |
| **Son** | Active ou coupe le son |
| Onglets **Journal / Crevettes** | Historique des événements, liste des crevettes (clic pour suivre) |

---

## Organisation des fichiers

```
shrimp/
├── index.html                   Structure de la page + ordre de chargement des scripts
├── README.md                    Ce document
├── LICENSE                      Licence MIT
├── css/
│   ├── base.css                 Palette, polices, boutons
│   ├── scene-labels.css         Bulles de dialogue, émotes, noms au-dessus de la 3D
│   ├── hud.css                  Marque, journal, commandes, fiche, annonces
│   └── responsive.css           Écran de téléphone, mouvements réduits
└── js/
    ├── core/                    Socle (chargé en premier)
    │   ├── utils.js             Outils : hasard, maths, fabrication de formes
    │   ├── hooks.js             Système d'accroche pour les extensions
│   ├── names.js             📝 Liste des noms des crevettes (à modifier librement)
    │   ├── scene.js             Moteur 3D, lumières, bocal, eau, sable
    │   ├── data.js              Tous les textes et listes (noms, répliques…)
    │   └── sound.js             Son génératif
    ├── ui/
    │   ├── overlay.js           Bulles, émotes et noms en HTML
    │   ├── camera.js            Caméra orbitale et suivi
    │   └── interface.js         Journal, liste, fiche, boutons
    ├── shrimp/
    │   ├── model.js             Modèles 3D : crevette, chapeaux, instruments
    │   ├── shrimp.js            Classe Shrimp : mouvement, animation, vie libre, retrait, renommage
│   └── jeb.js               jeb_, la crevette arc-en-ciel rarissime
    ├── world/
    │   ├── pellets.js           Granulés de nourriture
    │   ├── collisions.js        Hitbox et collisions entre crevettes
│   ├── kitchen.js           La cuisine, la table et ses pieds
│   ├── cat.js               Le chat qui passe de temps en temps
│   ├── net.js               L'épuisette
    │   └── environment.js       Vagues, bulles, jour/nuit
    ├── activities/
    │   ├── core.js              Moteur commun à toutes les activités
    │   ├── pairs.js             Interactions à deux
    │   ├── props.js             Accessoires partagés (divinités, ballon…)
    │   ├── groups/              Une activité de groupe par fichier
    │   └── scheduler.js         Décide quand lancer quoi
    ├── decors/
    │   ├── helpers.js           Outils de construction de décor
    │   ├── themes/              Un décor par fichier
    │   └── manager.js           Changement de décor animé
    ├── seasonal/
    │   └── halloween.js         Extension Halloween (supprimable)
    └── main.js                  Démarrage et boucle d'animation
```

---

## Fonctionnement général

### Scripts classiques, chargés dans l'ordre

Les fichiers JavaScript sont des **scripts classiques**, pas des modules ES. C'est ce qui permet d'ouvrir `index.html` directement depuis le disque : avec des modules, le navigateur refuserait de les charger hors serveur.

Conséquences :

- Toutes les fonctions et constantes déclarées au premier niveau d'un fichier sont **visibles dans les fichiers suivants**.
- **L'ordre des balises `<script>` dans `index.html` compte** : un fichier ne peut utiliser au chargement que ce qui a été défini avant lui. À l'exécution (dans la boucle), tout est disponible.
- Chaque fichier commence par `'use strict';`.

### La boucle d'animation (`js/main.js`)

À chaque image (environ 60 fois par seconde) :

1. Le temps écoulé est multiplié par la vitesse choisie, puis découpé en **pas de simulation** de 0,05 s maximum.
2. À chaque pas :
   1. `separation()` : les crevettes libres s'écartent un peu les unes des autres.
   2. `schedule(dt)` : on lance éventuellement une interaction à deux ou une activité de groupe.
   3. `act.step(dt)` : chaque activité en cours avance.
   4. `shrimp.update(dt)` : chaque crevette se déplace et s'anime.
   5. `resolveCollisions()` : les hitbox qui se chevauchent sont écartées.
   6. `updatePellets(dt)` et `environment(dt)` : granulés, vagues, bulles, lumière (avec le variateur `lightDim`).
   7. Hook `tick` (le chat s'y anime), puis changement de décor si le minuteur est écoulé.
3. `decorUpdate()` : transitions de décor et de couleurs.
4. Hook `frame` (horloge et fenêtre de la cuisine, épuisette, couleurs de jeb_…), puis `updateCamera()`, rendu 3D et `overlay()` (bulles HTML).
5. Toutes les 0,4 s : mise à jour de l'horloge, de la barre de décor, de la liste et de la fiche.

### Une crevette : vie libre ou occupée

- Une crevette **libre** (`busy === null`) décide elle-même quoi faire dans `think()` : se balader, picorer, dormir, regarder dehors, manger.
- Quand une activité la prend, `busy` pointe vers cette activité. C'est alors l'activité qui la pilote, en appelant `goTo()`, en modifiant `pose`, `faceObj`, `say()`…
- À la fin de l'activité, `release()` lui rend sa liberté et retire ses accessoires temporaires.

### Une activité : rassemblement puis jeu

Chaque activité (classe `Act`) suit le même cycle :

1. **`start(A)`** : on place les participants et on crée les accessoires.
2. **Rassemblement** : on attend qu'une part suffisante des participants (`gatherFrac`) soit arrivée, ou que le délai `gatherMax` soit écoulé.
3. **`play(A, t, dt)`** : appelé à chaque pas, avec `t` le temps écoulé depuis le début du jeu. L'activité se termine quand `play` renvoie `true`.
4. **`end(A)`**, puis nettoyage automatique des accessoires et libération des crevettes.

---

## Description détaillée des fichiers

### `index.html`

- Squelette de la page : `<canvas id="scene">` pour la 3D, `#labels` pour les bulles HTML, la marque (`#brand`), le panneau latéral (`#side`), la fiche (`#focus`), l'annonce (`#toast`) et la barre de commandes (`#controls`).
- Charge three.js, les polices Google Fonts, les 4 fichiers CSS, puis tous les scripts dans l'ordre, regroupés par commentaires.

### CSS

| Fichier | Contenu |
|---|---|
| `base.css` | Variables de couleur et de police (`--abyss`, `--coral`, `--sand`, `--f-display`…), règles de base de la page, style des boutons et des listes déroulantes. Thème sombre unique, celui d'un aquarium la nuit. |
| `scene-labels.css` | `.say` (bulle de dialogue), `.say.god` (bulle de divinité), `.tag` (étiquette de nom), `.fl` (émotes flottantes : notes, bulles, « z », « POP », cœurs). |
| `hud.css` | Marque et horloge, carte du décor avec sa barre de progression, panneau Journal/Crevettes, barre de commandes, fiche de la crevette suivie, annonce centrale. |
| `responsive.css` | Sous 760 px de large : panneau en bas, commandes compactes. Désactive les animations d'interface si l'utilisateur préfère réduire les mouvements. |

---

### `js/core`

#### `utils.js` — outils partagés

Vérifie d'abord que three.js est bien chargé, sinon il affiche un message d'erreur.

| Nom | Rôle |
|---|---|
| `$(id)` | Raccourci pour `document.getElementById`. |
| `rnd(a, b)` | Nombre décimal aléatoire entre `a` et `b`. |
| `rint(a, b)` | Entier aléatoire entre `a` et `b` (inclus). |
| `pick(liste)` | Élément au hasard. |
| `shuffle(liste)` | Mélange une liste (sur place) et la renvoie. |
| `clamp(x, a, b)` | Borne `x` entre `a` et `b`. |
| `V(x, y, z)` | Crée un `THREE.Vector3`. |
| `wrapA(angle)` | Ramène un angle entre -π et π. |
| `easeOutBack(x)` | Courbe d'animation avec léger rebond (apparition des décors). |
| `names(crevettes)` | Liste lisible : « A, B et C ». |
| `UP`, `ZERO` | Vecteurs constants (haut, origine). |
| `reduceMotion` | `true` si l'utilisateur préfère réduire les animations. |
| `M(couleur, options)` | Matériau mat en *flat shading* (le rendu low poly). |
| `E(couleur, intensité)` | Matériau lumineux (émissif). |
| `mk(géométrie, matériau, x, y, z)` | Crée un objet 3D qui projette et reçoit les ombres. |
| `part(groupe, géométrie, matériau, position, échelle, rotation)` | Crée une pièce et l'ajoute à un groupe en une ligne. C'est la brique de tous les modèles. |
| `jitter(géométrie, quantité)` | Décale légèrement chaque sommet, pour un aspect « taillé à la main » sans trous. |
| `Ico`, `Cyl`, `Box`, `Cone` | Raccourcis vers les géométries three.js (icosaèdre, cylindre, boîte, cône). |
| `disposeObj(objet)` | Libère la mémoire GPU d'un objet retiré de la scène. |

#### `hooks.js` — points d'accroche

Objet `Hooks` qui permet à une extension de réagir aux événements sans modifier le reste du code.

| Méthode | Rôle |
|---|---|
| `Hooks.on(nom, fonction)` | S'abonner à un événement. |
| `Hooks.emit(nom, ...args)` | Déclencher un événement. Les erreurs d'un abonné ne cassent pas l'application. |

| Événement | Arguments | Quand |
|---|---|---|
| `start` | — | Une fois, quand le bocal est prêt. |
| `shrimp:create` | `shrimp` | À chaque nouvelle crevette. |
| `shrimp:remove` | `shrimp` | Quand une crevette quitte le bocal (épuisette, meurtre). |
| `decor:change` | `D, theme` | À chaque nouveau décor. |
| `tick` | `dt` | À chaque pas de simulation. |
| `frame` | `dt, rdt` | À chaque image, avant le rendu. |

#### `scene.js` — le monde 3D

| Nom | Rôle |
|---|---|
| `PROFILE` | Profil du bocal : liste de paires (rayon, hauteur), qu'on fait tourner pour former le verre. |
| `rAt(y)` | Rayon intérieur du bocal à la hauteur `y`. |
| `WATER_Y`, `YMIN`, `YMAX` | Niveau de l'eau, hauteurs minimale et maximale de nage. |
| `clampInside(p, marge)` | Ramène un point à l'intérieur du bocal. |
| `randInside()` | Point aléatoire où une crevette peut nager. |
| `renderer`, `scene`, `camera` | Moteur de rendu, scène et caméra three.js. |
| `resize()` | Adapte le rendu à la taille de la fenêtre (champ de vision plus large en portrait). |
| `hemi`, `sun` | Lumière d'ambiance (ciel/sol) et soleil qui projette les ombres. |
| `table`, `glass`, `glassEdges`, `water`, `surf` | Table, verre, arêtes du verre, volume d'eau, surface de l'eau. |
| `discGeo(R, anneaux, segments, hauteur)` | Crée un disque low poly à relief (sable, surface de l'eau). |
| `sand`, `sandMat`, `sandAmp`, `applySand()` | Fond de sable et son relief, réglable selon le décor. |
| `rays`, `rayMat` | Rayons de lumière qui descendent de la surface. |
| `BUBBLER`, `airBubbles` | Pierre à bulles et ses bulles. |

La table et la cuisine sont dans `js/world/kitchen.js`.

#### `data.js` — textes et listes

Tout le contenu textuel, facile à enrichir.

| Nom | Contenu |
|---|---|
| `COLORS` | Couleurs possibles des crevettes. |
| `NAMES`, `nextName()` | Noms de `names.js` mélangés, et distribution du prochain nom libre. |
| `TRAITS` | Caractères (fêtard·e, philosophe, timide…). |
| `HATS` | Types de chapeaux. |
| `MIAM`, `NOTES` | Réactions en mangeant, notes de musique. |
| `HELLO`, `HELLO_R` | Salutations et réponses (`%` = nom de l'autre). |
| `GOSSIP` | Potins (`%` = crevette visée). |
| `QUESTIONS`, `ANSWERS` | Débats philosophiques. |
| `CROWD`, `BANDS` | Cris du public et noms de groupes de musique. |
| `TEAMS` | Équipes de foot. |
| `TOPICS`, `SLIDES` | Sujets et diapos de conférence. |
| `YOGA` | Postures de yoga (nom + angles du corps). |
| `INSTR` | Instruments et statut affiché (« joue de la guitare »…). |

#### `names.js` — 📝 les noms des crevettes

Une simple liste `SHRIMP_NAMES`, un nom par ligne, faite pour être modifiée à la main. Les nouvelles crevettes piochent dedans sans doublon ; quand la liste est épuisée, elles s'appellent « Crevette n°… ».

#### `sound.js` — son génératif

Objet `Sound`, basé sur la Web Audio API. Aucun fichier son.

| Méthode | Rôle |
|---|---|
| `init()` | Crée le contexte audio et un tampon de bruit. |
| `toggle()` | Active ou coupe le son (l'audio ne démarre qu'après un clic). |
| `env()`, `tone()`, `noise()`, `kick()` | Briques de synthèse : enveloppe, note, bruit filtré, grosse caisse. |
| `chirp(hauteur)` | Petite voix de crevette (« blblbl »). |
| `pop()` | Bruit de bulle qui éclate. |
| `STY` | Styles musicaux : `rock`, `conga`, `mystic`, `chic`, `valse` (+ `spooky` ajouté par Halloween). Chacun a un tempo, une tonalité, une gamme, une suite d'accords et des percussions ou non. |
| `startMusic(style, instruments)`, `stopMusic()` | Lance ou arrête une musique. Les instruments présents changent le son (trompette, guitare, maracas…). |
| `schedule()`, `step()` | Séquenceur appelé toutes les 50 ms : batterie, basse, mélodie improvisée. |

---

### `js/ui`

#### `overlay.js` — bulles et noms

Les textes ne sont pas dessinés en 3D : ce sont des éléments HTML repositionnés à chaque image au-dessus des objets 3D.

| Nom | Rôle |
|---|---|
| `proj(v)` | Convertit une position 3D en position à l'écran (ou `null` si elle est hors champ). |
| `speakAt(getPos, texte, durée, classe)` | Crée une bulle qui suit une position. |
| `emit(pos, texte, options)` | Émote flottante qui s'élève et s'efface (notes, cœurs, ✨, 💨…). |
| `overlay(dt)` | Met à jour toutes les bulles, émotes et étiquettes de noms. |

#### `camera.js` — caméra

| Nom | Rôle |
|---|---|
| `cam` | État de la caméra : angles, distance, cible, crevette suivie. |
| `pickShrimp(event)` | Trouve la crevette sous le curseur (lancer de rayon). |
| `follow(crevette)` | Suit une crevette (ou `null` pour arrêter) et affiche sa fiche. |
| `endPointer()` | Fin d'un glisser ou d'un clic. |
| `updateCamera(rdt)` | Place la caméra (sans traverser les chaises, voir `cameraBlockers`). Elle tourne lentement toute seule après 5 s d'inactivité. |

Gère aussi la souris, le tactile (pincer pour zoomer), la molette, `Échap` et `Espace`.

#### `interface.js` — journal et boutons

| Nom | Rôle |
|---|---|
| `clockStr()` | Jour et heure simulés (« Jour 1 · 08:00 »). |
| `log(texte, type)` | Ajoute une ligne au journal (`group` en sable, `decor` en corail). Garde 90 lignes. |
| `toast(message)` | Grande annonce temporaire au centre de l'écran. |
| `renderList()` | Reconstruit la liste des crevettes. |
| `updateFocus()` | Remplit la fiche : caractère, accessoire, activité, nombre d'interactions, meilleur·e ami·e. |
| `setSpeed(v)` | Change la vitesse (0 = pause). |
| `fillGroupSelect()` | Remplit le menu des activités (au démarrage, pour inclure celles des extensions). |

Il branche aussi tous les boutons : Nourrir, Changer de décor, Lancer, + Crevette, Noms, Hitbox, Son, les onglets, et dans la fiche « Renommer » et « Épuisette ».

---

### `js/shrimp`

#### `model.js` — modèles 3D

| Nom | Rôle |
|---|---|
| `buildShrimp(couleur)` | Construit une crevette : carapace, rostre, yeux sur pédoncules, 2 antennes, 8 pattes, abdomen en 6 segments articulés (chacun accroché au précédent, pour que la queue se courbe), nageoires et éventail de queue. Renvoie les pièces animables (`segs`, `ants`, `eyes`, `legs`, `swims`) et les matériaux (`mats`). |
| `makeHat(type)` | Haut-de-forme, cotillon, couronne, béret, nœud ou chapeau de paille. |
| `makeInstrument(type)` | Guitare, batterie, trompette, maracas, micro, triangle ou keytar. |
| `animInstrument(crevette, temps)` | Anime l'instrument en rythme (baguettes, maracas secouées…). |

#### `shrimp.js` — la classe `Shrimp`

`shrimps` est la liste de toutes les crevettes.

**Principales propriétés**

| Propriété | Signification |
|---|---|
| `name`, `color`, `trait`, `size`, `hatKind` | Identité. |
| `pos`, `vel`, `target`, `speed`, `speedMul` | Position, vitesse, destination, vitesse de base et multiplicateur. |
| `busy` | Activité en cours (ou `null` si la crevette est libre). |
| `faceObj` | Ce que la crevette regarde une fois arrivée (un point ou une autre crevette). |
| `pose` | Posture voulue : `flip` (tangage), `roll` (roulis), `spin` (lacet), `hop` (rebond), `curl` (queue repliée), `ant` (antennes qui frétillent). |
| `mode`, `status` | Comportement libre en cours et texte affiché. |
| `friends`, `inter` | Compteur d'amitiés et nombre d'interactions. |

**Méthodes**

| Méthode | Rôle |
|---|---|
| `constructor(options)` | Crée la crevette (nom, couleur, chapeau éventuel, position) et déclenche `shrimp:create`. |
| `headPos()` | Position au-dessus de la tête, où s'affichent les bulles. |
| `say(texte, durée)` | Parle (bulle + petite voix). |
| `goTo(point, multiplicateur)` | Fixe la destination (toujours ramenée dans le bocal). |
| `flip(durée)`, `twirl(durée)` | Salto complet ou pirouette complète. |
| `addTemp(objet)` | Ajoute un accessoire temporaire, retiré par `release()`. |
| `cancelFree()` | Interrompt la vie libre quand une activité la recrute. |
| `release()` | Fin d'activité : remet la posture à zéro, retire les accessoires et rend la crevette visible. |
| `think(dt, t)` | Vie libre : manger, se balader, picorer, dormir, regarder dehors, rêvasser. |
| `update(dt, t)` | Déplacement fluide, orientation vers la direction ou la cible, posture et animation du corps (queue qui ondule, pattes, antennes). Une crevette prise dans l'épuisette ne fait plus que gigoter. |

| Fonction | Rôle |
|---|---|
| `separation()` | Petite répulsion entre crevettes libres, pour qu'elles évitent de se coller. |
| `removeShrimp(s, exceptAct)` | Retire définitivement une crevette : arrête son activité (sauf `exceptAct`), l'enlève de la scène, de la liste et de la caméra, puis déclenche `shrimp:remove`. |
| `renameShrimp(s, nom)` | Renomme une crevette (ses amitiés suivent) et l'écrit dans le journal. |

Propriétés spéciales : `noCollide` (ignorée par les hitbox), `scooped` (prise dans l'épuisette), `removed` (a quitté le bocal), `isJeb`, `isGhost`.

#### `jeb.js` — 🌈 jeb_

| Nom | Rôle |
|---|---|
| `JEB_CHANCE` | Probabilité qu'une nouvelle crevette soit jeb_ (1/100). Une seule jeb_ à la fois. |
| `JEB_DYES`, `JEB_STEP` | Les 16 teintures parcourues dans l'ordre, et la durée de chacune (1 s). |
| `makeJeb(s)` | Transforme une crevette en jeb_ (nom, caractère « légendaire », annonce). |
| `spawnJeb()` | Fait apparaître jeb_ tout de suite (à taper dans la console du navigateur pour tester). |
| Hook `frame` | Fait passer en douceur la couleur du corps d'une teinture à la suivante. |

---

### `js/world`

#### `pellets.js` — granulés

| Nom | Rôle |
|---|---|
| `pellets` | Granulés présents (ils descendent, puis restent 50 s sur le sable). |
| `dropPellets(n, centre)` | Verse `n` granulés autour d'un point. |
| `eatPellet(p)` | Retire un granulé mangé. |
| `nearestPellet(pos)` | Granulé le plus proche que deux crevettes au plus convoitent déjà. |
| `updatePellets(dt)` | Chute, rotation et disparition des granulés. |

#### `collisions.js` — hitbox

Chaque crevette a une **gélule** (un segment avec un rayon) qui va de la tête jusqu'au bout de la queue et suit son orientation.

| Nom | Rôle |
|---|---|
| `HITBOX` | Dimensions de la gélule (`front`, `back`, `radius`), multipliées par la taille de la crevette. |
| `COLLISION_PASSES` | Nombre de passes de correction par pas (3). |
| `updateCapsule(s)` | Calcule les deux extrémités de la gélule dans le monde. |
| `closestSegments(...)` | Points les plus proches entre deux segments (méthode d'Ericson). |
| `resolveCollisions()` | Écarte les gélules qui se chevauchent et annule la vitesse qui les rapproche. Les crevettes invisibles (tour de magie) sont ignorées. |
| `makeHitboxMesh()`, `setHitboxesVisible(on)` | Affichage en fil de fer (bouton « Hitbox »). |

#### `kitchen.js` — la cuisine

| Nom | Rôle |
|---|---|
| `ROOM` | Dimensions de la pièce : sol (`floor`), plafond (`ceiling`), demi-largeur (`half`). Le dessus de la table est à y = 0. |
| `K(couleur)`, `KE(couleur)` | Matériaux de la cuisine (insensibles au brouillard de l'eau), mat ou lumineux. |
| `kitchen` | Groupe qui contient toute la pièce. |
| `COUNTER` | Position et hauteur du plan de travail (le chat marche dessus). |
| `OVEN` | Niche du four sous la gazinière : les portes de placard s'arrêtent de part et d'autre. |
| `cameraBlockers` | Objets que la caméra ne traverse pas (les chaises) : elle s'arrête devant. |
| Contenu | Sol en damier, murs et plinthes, crédence carrelée, plan de travail avec placards, évier, gazinière et casserole qui fume, planche à découper, bouilloire, placards hauts, hotte, frigo avec magnets, fenêtre à rideaux, étagère à bocaux, horloge, suspension, table à 4 pieds, 2 chaises, boîte de granulés, plante, torchon. |
| Hook `frame` | Le ciel de la fenêtre suit l'heure (nuit, aube, jour, crépuscule), l'horloge affiche l'heure simulée, la vapeur monte de la casserole. |

#### `cat.js` — le chat

| Nom | Rôle |
|---|---|
| `CAT_COATS`, `CAT_NAMES` | Robes (roux, noir, gris, blanc) et noms possibles. |
| `buildCat(robe)` | Modèle low poly : corps, tête avec oreilles, yeux et moustaches, 4 pattes articulées, queue en 7 segments. |
| `Cat` | État du chat : `away` → `jump` → `walk` → `sit` → `leave` → `down`, plus le délai avant la prochaine visite (`nextIn`, 80 à 150 s simulées). |
| `catVisit()` | Fait venir le chat tout de suite (utilisable dans la console). |
| `catMeow()` | Miaulement synthétisé (si le son est activé). |
| Hook `tick` | Saut sur le plan de travail, marche, s'assoit face au bocal, fixe les crevettes (qui paniquent), miaule, repart et saute derrière. |

#### `net.js` — l'épuisette

| Nom | Rôle |
|---|---|
| `makeNet()` | Épuisette : cerclage, manche, filet semi-transparent. |
| `scoopShrimp(s)` | Lance l'animation de retrait d'une crevette (bouton « Épuisette » de la fiche). |
| Hook `frame` | Plongée (éclaboussures), capture, remontée en s'égouttant, disparition, puis `removeShrimp()`. |

#### `environment.js` — vie du bocal

| Nom | Rôle |
|---|---|
| `simTime` | Temps simulé écoulé (en secondes). |
| `hourNow()`, `isNight()` | Heure simulée et nuit (22 h – 6 h). |
| `environment(dt)` | Vagues de surface, bulles du bulleur, intensité des lumières selon l'heure, rayons qui ondulent. |
| `lightDim`, `lightDimTarget` | Variateur de lumière : une activité règle `lightDimTarget` (1 = normal, 0,3 = nuit noire), la lumière suit en douceur. |

---

### `js/activities`

#### `core.js` — moteur des activités

| Nom | Rôle |
|---|---|
| `acts` | Activités en cours. |
| `at(A, t, moment, fonction)` | Exécute une fonction **une seule fois** quand le temps `t` atteint `moment`. Sert à écrire des scénarios minutés. |
| `class Act` | Une activité en cours : `m` (participants), `data` (mémoire libre), `t` (temps), `props` (accessoires). |
| `Act.prop(objet)` | Ajoute un accessoire à la scène, supprimé automatiquement à la fin. |
| `Act.step(dt)` | Rassemblement, puis appel de `play` et fin si nécessaire. |
| `Act.finish()` | Appelle `end`, nettoie les accessoires, libère les crevettes et coupe la musique. |
| `pairStart(A, def)` | Démarrage commun aux interactions à deux : point de rencontre, face à face, ligne de journal. |
| `GROUPS` | Liste des activités de groupe (remplie par les fichiers de `groups/`). |

#### `pairs.js` — interactions à deux

`PAIRS` contient 11 interactions : `salut`, `tango`, `miette`, `potins`, `saltos`, `calin`, `shifumi`, `toupie`, `course`, `philo`, `regard`. `HAND` contient les trois signes de pierre-feuille-ciseaux.

#### `props.js` — accessoires partagés

| Nom | Rôle |
|---|---|
| `eyesOn(groupe, ...)` | Ajoute deux yeux expressifs à un objet. |
| `DEITIES` | Divinités du rituel (Grand Canard Cosmique, Tartine Sacrée, Patate Ancestrale, Ananas de l'Au-delà) : nom, répliques et `make()` pour le modèle. |
| `slideTex(titre, texte)` | Dessine une diapo sur un canvas et la transforme en texture 3D. |
| `makeBall()`, `makeGoal()` | Ballon facetté noir et blanc, cage de but avec filet. |

#### `groups/` — activités de groupe

Chaque fichier ajoute une activité à `GROUPS`. Elles demandent toutes au moins 6 crevettes.

| Fichier | Activité | Déroulement |
|---|---|---|
| `concert.js` | Concert | 3 à 5 musiciens sur scène avec instruments, public qui danse et fait des saltos, musique rock. |
| `cache.js` | Cache-cache | Une crevette compte jusqu'à 10, les autres se cachent derrière le décor (`D.hide`), puis elle les cherche, parfois en suivant une fausse piste. |
| `chenille.js` | La chenille | Farandole qui suit un chemin dans tout le bocal. |
| `pyramide.js` | Pyramide | Pyramide 3-2-1 qui vacille de plus en plus puis s'effondre, avec des supporters. |
| `foot.js` | Match de foot | Deux équipes avec bandeaux, gardiens, défenseurs, attaquants, arbitre si le nombre est impair ; ballon physique, buts, mi-temps, score. |
| `rituel.js` | Rituel mystique | Cercle qui tourne autour d'un cristal, apparition d'une divinité, pluie de granulés. |
| `yoga.js` | Yoga synchronisé | Un coach enchaîne 5 postures, avec parfois un élève maladroit. |
| `defile.js` | Défilé de mode | Mannequins sur le podium avec chapeaux, public avec flashs, remise de la Carapace d'Or. |
| `bulle.js` | Bulle géante | On souffle une bulle qui grossit, emporte une crevette vers le haut puis éclate. |
| `conf.js` | Conférence | Diapos absurdes sur un écran, public qui réagit, question finale. |
| `soleil.js` | 1, 2, 3, soleil ! | Celle qui compte se retourne : les retardataires repartent au départ. Le premier qui la touche gagne. |
| `chaises.js` | Coquillages musicaux | Chaises musicales avec des coquillages : un éliminé par manche jusqu'au vainqueur. Contient `makeShell()`. |
| `photo.js` | Photo de classe | Trois prises (yeux fermés, oreilles de lapin, réussite), avec flash. Contient `makePhotoCamera()`. |
| `ballet.js` | Nage synchronisée | 4 figures tirées parmi `BALLET_FIGURES` (cercle, roue, étoile, spirale, vague) puis notes du jury. |
| `magie.js` | Spectacle de magie | Disparition dans une armoire et réapparition ailleurs, puis un granulé sorti du chapeau. Contient `makeMagicCabinet()` et `makeWand()`. |
| `anniversaire.js` | Anniversaire | Chanson, gâteau avec une bougie par mue, confettis, cadeau (`GIFTS`). Contient `makeCake()`. |
| `classique.js` | Danse classique | « Le Lac des Crevettes » : tutus, danse sur la pointe de la queue, pirouettes, grands jetés, pas de deux avec porté, révérence et pluie de roses. Musique `valse`. Contient `makeTutu()`. |
| `cuisine.js` | Cours de cuisine | Un chef en toque explique une recette (`RECIPES`), les élèves remuent leur poêle, les ingrédients tombent, une poêle prend feu, dégustation et Toque d'or. Contient `makeToque()`, `makePan()`. |
| `corde.js` | Tir à la corde | Deux équipes de chaque côté d'une corde, un arbitre si le nombre est impair. Le ruban oscille au gré des efforts jusqu'à ce qu'une équipe entraîne l'autre, qui tombe en vrac. |
| `karaoke.js` | Karaoké | Trois crevettes passent au micro devant un écran qui affiche les paroles (chansons inventées dans `KARAOKE_SONGS`), le public se balance, chaque passage reçoit une note, la meilleure gagne. |
| `bowling.js` | Bowling | Piste sur le sable, 10 quilles en triangle remises à chaque tour. Chaque joueur lance une boule un peu de travers, les quilles touchées s'envolent et tombent en cascade. Contient `makePin()` et `setPins()`. |
| `artifice.js` | Feu d'artifice | La lumière baisse, deux artificières lancent des fusées qui éclatent en gerbes de couleurs près de la surface (avec un éclair de lumière), puis bouquet final. Contient `makeRocket()`. |
| `batailles.js` | Bataille de bulles | Deux équipes à bandeaux derrière des remparts de coquillages se lancent des bulles. Chaque crevette a 3 points de vie ; la dernière équipe debout gagne. |
| `parcours.js` | Parcours d'obstacles | Départ arrêté, anneaux lumineux à traverser, slalom entre des bouées, arche d'arrivée en damier. Chrono et podium à l'arrivée. |

#### `scheduler.js` — planificateur

| Nom | Rôle |
|---|---|
| `startPair(def, a, b)`, `startGroup(def, crevettes)` | Lancent une activité. |
| `schedule(dt)` | Toutes les 1,4 à 3,2 s, peut lancer une interaction à deux, souvent avec une voisine. Toutes les 35 à 55 s, lance une activité de groupe différente de la précédente. |
| `pickWeighted(liste)` | Tirage au sort qui tient compte du `weight` de chaque activité. |
| `forceGroup(def)` | Utilisé par le bouton « Lancer » : vérifie `canStart` (sinon affiche `cannotStart`), interrompt tout et démarre l'activité choisie. |

---

### `js/decors`

#### `helpers.js` — outils de décor

| Nom | Rôle |
|---|---|
| `put(groupe, objet, angle, rayon, y)` | Pose un objet autour du centre du bocal. |
| `behind(angle, rayon)` | Crée une cachette derrière un objet (utilisée par le cache-cache). |
| `face(objet, y)` | Tourne un objet vers le centre du bocal. |
| `rock(taille, couleur)` | Rocher irrégulier. |
| `coral(matériau, longueur, rayon, profondeur)` | Corail ramifié, construit de façon récursive (sert aussi d'arbre mort à Halloween). |
| `seaweed(hauteur, matériau)`, `sway(algue, t)` | Algue articulée et son ondulation. |
| `anemone(couleur)`, `starfish(couleur)` | Anémone à tentacules, étoile de mer. |
| `THEMES` | Liste des décors (remplie par les fichiers de `themes/`). |

#### `themes/` — décors

| Fichier | Décor | Éléments |
|---|---|---|
| `recif.js` | Récif de corail | Coraux, algues, anémones, rochers, étoiles de mer. |
| `epave.js` | Épave du Capitaine Pince | Bateau échoué avec voile, coffre au trésor qui scintille, tonneaux, ancre. |
| `temple.js` | Temple englouti de Krillantis | Colonnes, colonne tombée, tête de statue aux yeux lumineux, autel avec un orbe, runes. |
| `lune.js` | Base lunaire Crustacé-1 | Cratères, fusée avec flamme, OVNI en orbite avec rayon, plantes extraterrestres lumineuses, drapeau, antenne parabolique. |
| `bonbons.js` | Pays des bonbons | Sucettes, sucres d'orge, bonbons gélifiés, cupcake, donut, nuages de barbe à papa. |
| `disco.js` | Discothèque des Abysses | Piste qui clignote, boule à facettes, faisceaux colorés, lumières mobiles, enceintes qui pulsent. |
| `zen.js` | Jardin zen | Sable ratissé, torii, bonsaï qui perd des pétales, lanternes, pont. |
| `bureau.js` | Bureau du stagiaire | Bureau, ordinateur avec un tableur rempli de `#REF!`, mug, agrafeuse, chaise, plante, corbeille, post-it volant. |
| `volcan.js` | Volcan sous-marin | Volcan avec cratère et coulées de lave lumineuses, fumée, cheminées hydrothermales, roches fissurées, cristaux d'obsidienne. |
| `champignons.js` | Forêt de champignons | Champignons géants à pois, champignons lumineux qui pulsent, maison-champignon fumante, barrière, mousse, lucioles. Contient `mushroom()`. |
| `avantposte.js` | Avant-poste Galactique Delta-7 | Petit robot-marcheur original au grand œil, capsule de secours écrasée qui fume, radar qui tourne, panneaux solaires, caisses, tour de guet avec gyrophare. |
| `tropical.js` | Île tropicale | Îlot de sable avec palmiers qui ondulent, hamac qui se balance, parasol rayé et serviette, torches tiki, glacière, coquillages. Contient `palmTree()`. |
| `foraine.js` | Fête foraine | Grande roue qui tourne (les nacelles restent droites), manège dont les chevaux montent et descendent, stand de barbe à papa, guirlande d'ampoules qui clignote, ballons. |
| `banquise.js` | Banquise | Igloo avec tunnel d'entrée, blocs de glace translucides, stalactites sous la surface, bonhomme de neige, petit pingouin qui se dandine, flocons qui tombent. |
| `labo.js` | Laboratoire secret | Paillasse aux fioles fluo qui bouillonnent, bobine électrique qui lance des éclairs, cuve où flotte une créature, vieil ordinateur dont l'écran vert affiche des messages. |
| `farwest.js` | Far West | Saloon aux portes battantes, cactus, château d'eau, chariot bâché, buisson qui traverse le bocal en roulant, crâne et rochers rouges. Contient `cactus()`. |
| `ville.js` | Ville engloutie | Rue avec immeubles aux fenêtres qui s'allument et s'éteignent, lampadaires, feu tricolore qui change de couleur, voiture et bus couverts d'algues, panneau STOP tordu. |

#### `manager.js` — changement de décor

| Nom | Rôle |
|---|---|
| `curDecor`, `oldDecor`, `decorIdx`, `decorT` | Décor actuel, décor qui disparaît, numéro et minuteur. |
| `DECOR_PERIOD` | Durée d'un décor (90 s simulées). |
| `setDecor(i, instantané)` | Construit le décor `i`, fait rétrécir l'ancien et lance la transition de couleurs. Déclenche `decor:change`. |
| `nextDecor()` | Décor au hasard, différent de l'actuel. |
| `decorUpdate(dt, rdt)` | Animations du décor, apparition avec rebond, fondu des couleurs (eau, sable, fond, lumière) et du relief du sable. |

---

### `js/seasonal`

#### `halloween.js` — extension Halloween

Tout le fichier est enfermé dans une fonction, donc il ne crée aucun nom global. Il se branche uniquement via `Hooks` et les listes `PAIRS`, `GROUPS` et `THEMES`.

| Nom | Rôle |
|---|---|
| `makePumpkin()`, `makeGhost()`, `makeBat()`, `makeCandy()` | Citrouille (lumineuse ou non), fantôme translucide, chauve-souris aux ailes animées, bonbon emballé. |
| `makeWitchHat()`, `makeHorns()`, `makePumpkinHead()`, `makeCape()`, `COSTUMES` | Costumes. Environ 45 % des crevettes en reçoivent un à leur création. |
| `Sound.STY.spooky` | Musique inquiétante pour le bal. |
| Hooks `start`, `shrimp:create`, `decor:change`, `tick`, `frame` | Mention « édition Halloween », costumes, citrouilles dans chaque décor, coupures de courant, animation des chauves-souris et des fantômes. |
| `setCurse(s, on)` | Rend une crevette verte pendant 14 s (sort raté). |
| `spawnGhostShrimp()` | Gamboo, la crevette fantôme : translucide, flottante, elle traverse les autres (`noCollide`) et ne peut pas être victime du meurtre. |
| Meurtre au bocal | La lumière baisse et une tueuse secrète est tirée au sort. Chaque nuit, elle tue une crevette **définitivement** (`removeShrimp`). Au matin, débat puis vote : si le vote la désigne, elle part en prison ; sinon, l'innocent·e est mis·e à l'écart. Au bout de 2 nuits (`MURDER_NIGHTS`), la tueuse s'en sort. Ne se lance que s'il y a **plus de 15 crevettes** (`MURDER_MIN_SHRIMPS`), même avec le bouton « Lancer », et sort plus rarement que les autres activités (`weight: 0.35`). |
| `trick` | Interaction à deux « Un bonbon ou un sort ! », ajoutée à `PAIRS`. |
| Décor | « Manoir hanté de Pincevania » : manoir aux fenêtres qui clignotent, tombes, arbres morts, chaudron bouillonnant, toile d'araignée, citrouilles. |
| Activités | `bal-monstres` (danse costumée avec un fantôme), `chasse-bonbons` (3 bonbons par participant), `histoires` (veillée autour d'une citrouille et fantôme surprise), `meurtre` (voir ci-dessus). |

Le fichier modifie aussi `Shrimp.prototype.addTemp` et `release` pour qu'un chapeau temporaire cache le costume de tête pendant une activité.

**Pour retirer Halloween** : supprime `js/seasonal/halloween.js` et sa ligne `<script>` dans `index.html`. Le reste fonctionne à l'identique.

---

### `js/main.js`

- Remplit le menu des activités, crée les 14 crevettes, choisit un premier décor, affiche le message de bienvenue et déclenche `start`.
- `frame(now)` : boucle d'animation décrite dans [Fonctionnement général](#la-boucle-danimation-jsmainjs).

---

## Formats à connaître

### Activité de groupe

```js
GROUPS.push({
  id: 'mon-activite',          // identifiant unique
  label: 'Mon activité',       // texte du menu « Lancer »
  min: 6, max: 10,             // nombre de participants
  status: 'fait mon activité', // statut affiché dans la liste et la fiche
  weight: 1,                   // facultatif : fréquence relative (0.5 = deux fois plus rare)
  canStart: () => true,        // facultatif : condition pour la lancer (hasard ET bouton « Lancer »)
  cannotStart: () => '…',      // facultatif : message affiché si le bouton « Lancer » est refusé
  noGather: false,             // true = pas d'attente de rassemblement
  gatherFrac: 0.8,             // part des participants à attendre
  gatherMax: 10,               // attente maximale (secondes simulées)
  start(A) { /* placer A.m, créer des accessoires avec A.prop(...) */ },
  play(A, t, dt) { /* scénario ; renvoyer true pour terminer */ },
  end(A) { /* facultatif */ },
});
```

Dans `play`, les outils les plus utiles sont :

- `at(A, t, 3, () => ...)` : exécuter quelque chose une seule fois à 3 s.
- `s.goTo(V(x, y, z), vitesse)` pour déplacer une crevette, `s.faceObj = ...` pour l'orienter.
- `s.pose.roll = ...` pour la posture, `s.flip()` et `s.twirl()` pour les figures.
- `s.say('…')` pour parler, `emit(pos, '✨')` pour une émote.
- `log('…')` et `toast('…')` pour le journal et les annonces.
- `A.music = true; Sound.startMusic('rock')` pour la musique, coupée automatiquement à la fin.

### Interaction à deux

```js
const def = {
  id: 'mon-interaction',
  status: 'fait quelque chose',
  gap: 0.9, // demi-distance entre les deux crevettes (facultatif)
  log: (a, b) => `${a} et ${b} font quelque chose.`,
  play(A, t) { const [a, b] = A.m; /* A.data.mid, A.data.dir */ return t > 5; },
};
def.start = A => pairStart(A, def); // automatique pour ce qui est déclaré dans pairs.js
PAIRS.push(def);
```

### Décor

```js
THEMES.push({
  name: 'Mon décor',
  water: '#2aa7c9', sand: '#dcc488', bg: '#0f3a52', // eau, sable, fond
  sky: '#c9f1ff', ground: '#7a6a44',                 // lumière d'ambiance
  amp: 1,                                            // relief du sable (0 = plat)
  build(g, D) {
    // g : groupe à remplir (put, part, rock, coral…)
    // D.hide.push(behind(angle, rayon)) : cachettes pour le cache-cache
    // D.ticks.push((t, dt) => ...) : animations du décor
  },
});
```

Pour que les cachettes soient utiles, place les gros objets entre 4,5 et 7,5 unités du centre : le milieu reste libre pour les activités.

---

## Ajouter du contenu

| Je veux ajouter… | Comment |
|---|---|
| Des noms de crevettes | Modifier `js/core/names.js` (un nom par ligne). |
| Des répliques, potins, groupes, équipes | Modifier les listes de `js/core/data.js`. |
| Une interaction à deux | Ajouter un objet dans `PAIRS` (`js/activities/pairs.js`). |
| Une activité de groupe | Copier un fichier de `js/activities/groups/`, changer `id` et `label`, puis ajouter sa balise `<script>` dans `index.html` **avant** `scheduler.js`. |
| Un décor | Copier un fichier de `js/decors/themes/` et ajouter sa balise **avant** `manager.js`. |
| Un chapeau | Ajouter un nom dans `HATS` (`data.js`) et sa forme dans `makeHat()` (`model.js`). |
| Une extension (Noël, été…) | Créer `js/seasonal/mon-extension.js` sur le modèle de `halloween.js`, puis l'ajouter juste **avant** `main.js`. |
| Régler la taille des hitbox | `HITBOX.radius` dans `js/world/collisions.js`. |
| Changer la durée d'un décor | `DECOR_PERIOD` dans `js/decors/manager.js`. |
| Changer le nombre de crevettes au départ | La boucle `for` au début de `js/main.js`. |
| Rendre jeb_ plus ou moins rare | `JEB_CHANCE` dans `js/shrimp/jeb.js`. |
| Faire venir le chat plus souvent | `Cat.nextIn` dans `js/world/cat.js`. |
| Réarranger la cuisine | `js/world/kitchen.js` (dimensions dans `ROOM`). |

---

## Limites connues

- Il faut une connexion internet pour charger three.js et les polices.
- Les crevettes entrent en collision entre elles, mais pas avec les objets du décor : elles peuvent nager à travers un rocher ou une colonne.
- En vitesse ×4 sur un ordinateur peu puissant, la simulation peut ralentir, car elle calcule plusieurs pas par image.
- La musique suit l'horloge réelle : elle ne s'accélère pas en ×2 ou ×4.
- Les victimes du meurtre et les crevettes retirées à l'épuisette ne reviennent pas : recharger la page repart de zéro.

---

## Licence

Projet sous licence **MIT** (voir `LICENSE`), © 2026 Roxy83111.
Le moteur 3D [three.js](https://threejs.org/) (licence MIT) et les polices Google Fonts sont chargés en ligne ; ils ne font pas partie du dépôt.
