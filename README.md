# Le Bocal — simulation de vie de crevettes

Ouvre `index.html` dans un navigateur (double-clic). Une connexion internet est nécessaire : le moteur 3D three.js et les polices sont chargés en ligne.

## Organisation

```
index.html                 structure de la page + ordre de chargement des scripts
css/
  base.css                 palette, typographies, boutons
  scene-labels.css         bulles de dialogue, émotes, noms au-dessus de la 3D
  hud.css                  marque, journal, commandes, fiche de la crevette suivie
  responsive.css           téléphone et mouvements réduits
js/
  core/
    utils.js               outils partagés (hasard, maths, formes low poly)
    hooks.js               points d'accroche pour les extensions (Halloween…)
    scene.js               moteur de rendu, lumières, bocal, eau, sable
    data.js                noms, répliques, listes de textes  ← facile à enrichir
    sound.js               voix, « pop » et musiques générées
  ui/
    overlay.js             affichage des bulles et des noms
    camera.js              caméra orbitale et suivi d'une crevette
    interface.js           journal, liste, boutons
  shrimp/
    model.js               modèle 3D de la crevette, chapeaux, instruments
    shrimp.js              comportement et animation d'une crevette
  world/
    pellets.js             granulés de nourriture
    collisions.js          hitbox des crevettes : elles ne se traversent plus
    environment.js         vagues, bulles, cycle jour/nuit
  activities/
    core.js                moteur commun à toutes les activités
    pairs.js               interactions à deux
    props.js               accessoires (divinités, ballon, diapos…)
    groups/*.js            une activité de groupe par fichier
    scheduler.js           décide quand lancer les activités
  decors/
    helpers.js             outils de construction des décors
    themes/*.js            un décor par fichier
    manager.js             changement de décor animé
  seasonal/
    halloween.js           édition Halloween (supprimable)
  main.js                  démarrage et boucle d'animation (toujours en dernier)
```

Les scripts sont des fichiers JavaScript classiques chargés dans l'ordre de `index.html` (pas de modules), ce qui permet d'ouvrir la page directement depuis le disque. Un fichier peut utiliser ce qui est défini dans les fichiers chargés avant lui.

## Hitbox

Chaque crevette a une hitbox en forme de gélule, de la tête à la queue (`js/world/collisions.js`). Le bouton « Hitbox » les affiche. Pour les agrandir ou les réduire, change `HITBOX.radius`.

## Halloween

Tout Halloween tient dans `js/seasonal/halloween.js` : costumes, chauves-souris, fantômes, citrouilles, décor « Manoir hanté », interaction « Un bonbon ou un sort ! », trois activités de groupe et des coupures de courant. Pour le retirer, supprime ce fichier ainsi que sa ligne `<script>` dans `index.html`. Il fonctionne uniquement avec `Hooks`, donc le reste du code n'en dépend pas.

## Ajouter du contenu

- **Une activité de groupe** : copie un fichier de `js/activities/groups/`, change `id` et `label`, puis ajoute une balise `<script>` dans `index.html` avant `scheduler.js`. Elle apparaît automatiquement dans le menu « Lancer ».
- **Une extension (fête, saison…)** : inspire-toi de `js/seasonal/halloween.js` et branche-toi avec `Hooks.on(...)`.
- **Un décor** : copie un fichier de `js/decors/themes/` et ajoute sa balise `<script>` avant `manager.js`.
- **Une interaction à deux** : ajoute un objet dans la liste `PAIRS` de `js/activities/pairs.js`.
- **Des répliques ou des noms** : tout est dans `js/core/data.js`.
