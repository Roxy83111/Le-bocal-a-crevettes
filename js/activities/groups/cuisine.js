/*
 * Cours de cuisine : un·e chef en toque explique une recette absurde, les élèves cuisinent chacun·e
 * dans leur poêle, quelqu'un met le feu, puis le chef goûte et décerne la Toque d'or.
 * Activité de groupe (6 crevettes et plus).
 */
'use strict';
function makeToque() {
  const g = new THREE.Group(),
    w = M('#ffffff', { roughness: 0.8 });
  part(g, Cyl(0.2, 0.2, 0.2, 8), w, [0, 0.08, 0]);
  part(g, jitter(Ico(0.28, 0), 0.03), w, [0, 0.32, 0], [1, 0.75, 1]);
  g.position.set(0, 0.27, 0.3);
  return g;
}
function makePan() {
  const g = new THREE.Group(),
    iron = M('#2b2d33', { metalness: 0.4, roughness: 0.4 });
  part(g, Cyl(0.32, 0.26, 0.1, 10), iron, [0, 0, 0]);
  part(g, Box(0.08, 0.05, 0.45), M('#6b4226'), [0, 0.02, -0.45]);
  const food = part(
    g,
    jitter(Ico(0.2, 0), 0.05),
    M(pick(['#f4a261', '#90be6d', '#e76f51', '#ffd166'])),
    [0, 0.1, 0],
    [1, 0.5, 1],
  );
  g.userData.food = food;
  g.position.set(0, -0.32, 0.95);
  return g;
}
const RECIPES = [
  {
    name: 'Soufflé de plancton',
    steps: [
      'Battez les bulles en neige…',
      'Incorporez le plancton délicatement…',
      'Cuisson : 3 secondes, pas une de plus !',
    ],
  },
  {
    name: 'Tarte aux algues',
    steps: ['Étalez la pâte de sable fin…', 'Disposez les algues en rosace…', 'Enfournez près du bulleur !'],
  },
  {
    name: 'Granulé flambé',
    steps: ['Prenez un granulé de qualité…', 'Ajoutez une pincée de mystère…', 'Et maintenant… on flambe !'],
  },
  {
    name: 'Velouté de caillou',
    steps: [
      'Choisissez un caillou bien mûr…',
      'Faites-le mijoter très, très longtemps…',
      'Assaisonnez avec une larme de mer.',
    ],
  },
];
const INGREDIENTS = ['🥕', '🧂', '🌿', '🧄', '🍋', '🫧'];

GROUPS.push({
  id: 'cuisine',
  label: 'Cours de cuisine',
  min: 6,
  max: 9,
  status: 'suit un cours de cuisine',
  gatherFrac: 0.8,
  gatherMax: 10,
  start(A) {
    const [chef, ...students] = A.m;
    const recipe = pick(RECIPES);
    Object.assign(A.data, { chef, students, recipe, fire: null });
    // Grand plan de travail au milieu du bocal
    const bench = new THREE.Group();
    part(bench, Box(students.length * 1.6 + 1.5, 0.3, 2), M('#d4a373'), [0, 0, 0]);
    part(bench, Box(students.length * 1.6 + 1.2, 1.2, 1.7), M('#bc6c25'), [0, -0.75, 0]);
    bench.position.set(0, 1.9, -0.2);
    A.prop(bench);
    chef.addTemp(makeToque());
    chef.goTo(V(0, 3.4, 3.4), 1.4);
    chef.faceObj = V(0, 3, -10);
    chef.status = 'enseigne la cuisine';
    students.forEach((s, i) => {
      const x = (i - (students.length - 1) / 2) * 1.6;
      s.goTo(V(x, 2.65, -1.2), 1.4);
      s.faceObj = V(x, 2.7, 10);
      s.pan = makePan();
      s.addTemp(s.pan);
      s.score = rnd(4, 10);
    });
    log(`👩‍🍳 Cours de cuisine du chef ${chef.name} : « ${recipe.name} ».`, 'group');
    toast(`Cours de cuisine : ${recipe.name}`);
  },
  play(A, t, dt) {
    const D = A.data;
    if (!A.music) {
      A.music = true;
      Sound.startMusic('chic');
    }
    D.chef.pose.ant = 1;
    at(A, t, 0.3, () => D.chef.say(`Aujourd’hui : ${D.recipe.name} !`, 2.2));
    D.recipe.steps.forEach((line, i) => at(A, t, 2.6 + i * 2.6, () => D.chef.say(line, 2.3)));
    // Les élèves remuent leur poêle et les ingrédients tombent dedans.
    D.students.forEach((s, i) => {
      if (t > 2.5 && t < 10.5) {
        s.pan.rotation.z = Math.sin(t * 6 + i) * 0.15;
        s.pan.userData.food.rotation.y += dt * 4;
        if (Math.random() < dt * 0.5)
          emit(
            s
              .headPos()
              .clone()
              .add(V(0, 1, 0)),
            pick(INGREDIENTS),
            { v: V(0, -1.2, 0), life: 1 },
          );
      }
    });
    // Incident : une poêle prend feu !
    at(A, t, 9, () => {
      const s = pick(D.students);
      const fire = part(s.pan, Cone(0.25, 0.6, 6), E('#ff7b1c', 1.4), [0, 0.4, 0]);
      D.fire = { s, fire };
      s.say('🔥 AU FEU !', 1.6);
      s.score -= 3;
      D.chef.say('Pas de panique ! On couvre !', 1.8);
      log(`🔥 La poêle de ${s.name} prend feu. Le chef garde son calme (presque).`);
    });
    if (D.fire) {
      D.fire.fire.scale.setScalar(t < 11.5 ? 0.8 + Math.random() * 0.5 : Math.max(0.01, 1 - (t - 11.5) * 2));
      if (t < 11.5 && Math.random() < dt * 4) emit(D.fire.s.headPos(), '💨', { life: 1 });
    }
    // Dégustation : le chef passe devant chaque élève.
    if (t > 12.5) {
      const k = Math.min(D.students.length - 1, Math.floor((t - 12.5) / 1.4));
      const s = D.students[k];
      D.chef.goTo(s.pos.clone().add(V(0, 0.2, 1.6)), 2.2);
      D.chef.faceObj = s;
      at(A, t, 13 + k * 1.4, () =>
        D.chef.say(
          s.score > 8
            ? 'Divin !'
            : s.score > 6
              ? 'Pas mal du tout.'
              : s.score > 4
                ? 'Hmm… original.'
                : 'C’est… brûlé.',
          1.2,
        ),
      );
    }
    const endT = 13 + D.students.length * 1.4 + 1;
    at(A, t, endT, () => {
      const w = D.students.reduce((a, b) => (a.score > b.score ? a : b));
      w.say('🏆 La Toque d’or !', 2);
      w.flip(0.9);
      log(`🏆 ${w.name} remporte la Toque d’or avec son « ${D.recipe.name} ».`);
      toast(`Toque d’or : ${w.name}`);
    });
    return t > endT + 2.5;
  },
  end(A) {
    A.data.students.forEach(s => {
      delete s.pan;
      delete s.score;
    });
  },
});
