/*
 * 🎃 ÉDITION HALLOWEEN 🎃
 *
 * Tout ce qui concerne Halloween est dans ce seul fichier. Pour le retirer :
 * supprime ce fichier (et, si tu veux éviter un message dans la console,
 * la ligne <script src="js/seasonal/halloween.js"> dans index.html).
 *
 * Contenu :
 *   - costumes pour certaines crevettes (chapeau de sorcière, cornes, citrouille, cape)
 *   - chauves-souris autour du bocal, fantômes qui flottent, citrouilles sur la table
 *   - petites citrouilles cachées dans chaque décor
 *   - un décor « Manoir hanté de Pincevania »
 *   - une interaction à deux : « Un bonbon ou un sort ! »
 *   - quatre activités de groupe : Bal des monstres, Chasse aux bonbons, Histoires qui font peur, Meurtre au bocal
 *   - un événement aléatoire : la coupure de courant (avec fantôme)
 *   - Gamboo, la crevette fantôme : translucide, elle traverse les autres crevettes
 *   - le « Meurtre au bocal » (uniquement s'il y a plus de 15 crevettes)
 */
'use strict';
(function halloween() {
  /* ---------- Fabrication des objets ---------- */
  const ORANGE = '#ff7b1c';

  function makePumpkin(size = 0.5, lit = true) {
    const g = new THREE.Group();
    const body = part(
      g,
      jitter(Ico(size, 1), size * 0.06),
      M(ORANGE, { roughness: 0.6 }),
      [0, 0, 0],
      [1.15, 0.85, 1.15],
    );
    body.castShadow = true;
    part(
      g,
      Cyl(size * 0.09, size * 0.12, size * 0.4, 5),
      M('#3a5a2a'),
      [0, size * 0.9, 0],
      null,
      [0.2, 0, 0.15],
    );
    const glow = lit ? E('#ffd23f', 1.3) : M('#2b1a0f');
    // Visage : deux yeux triangulaires et une bouche, sur la face avant (+z)
    for (const s of [-1, 1])
      part(
        g,
        Cone(size * 0.18, size * 0.22, 3),
        glow,
        [s * size * 0.35, size * 0.2, size * 1.06],
        [1, 1, 0.4],
        [Math.PI / 2, 0, 0],
      );
    part(g, Box(size * 0.7, size * 0.14, size * 0.1), glow, [0, -size * 0.22, size * 1.06]);
    g.userData.glow = lit ? glow : null;
    return g;
  }
  function makeGhost(size = 1) {
    const g = new THREE.Group();
    const sheet = new THREE.MeshStandardMaterial({
      color: '#f1f5ff',
      emissive: '#9db4ff',
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.72,
      flatShading: true,
      depthWrite: false,
    });
    part(g, Ico(0.5 * size, 1), sheet, [0, 0.55 * size, 0]);
    part(g, jitter(Cone(0.55 * size, 1.2 * size, 8, true), 0.04 * size), sheet, [0, -0.1 * size, 0], null, [
      Math.PI,
      0,
      0,
    ]);
    for (const s of [-1, 1])
      part(g, Ico(0.08 * size), M('#111'), [s * 0.17 * size, 0.62 * size, 0.44 * size], [1, 1.4, 0.6]);
    part(g, Ico(0.09 * size), M('#111'), [0, 0.38 * size, 0.46 * size], [1, 1.3, 0.5]);
    g.traverse(o => (o.castShadow = false));
    return g;
  }
  function makeBat() {
    const g = new THREE.Group(),
      black = M('#1a1423');
    part(g, Ico(0.16), black, [0, 0, 0], [1, 0.9, 1.3]);
    for (const s of [-1, 1]) part(g, Cone(0.05, 0.12, 3), black, [s * 0.07, 0.15, 0.05]);
    for (const s of [-1, 1]) part(g, Ico(0.025), E('#ff3b3b', 1), [s * 0.06, 0.04, 0.17]);
    const wings = [];
    for (const s of [-1, 1]) {
      const p = new THREE.Group();
      p.position.x = s * 0.1;
      const w = part(p, Cone(0.22, 0.6, 3), black, [s * 0.3, 0, 0], [1, 1, 0.12], [0, 0, (s * Math.PI) / 2]);
      w.rotation.y = Math.PI / 2;
      g.add(p);
      wings.push(p);
    }
    g.userData.wings = wings;
    return g;
  }
  function makeWitchHat() {
    const g = new THREE.Group();
    part(g, Cyl(0.32, 0.32, 0.03, 8), M('#1b1325'));
    const tip = part(g, Cone(0.17, 0.55, 7), M('#2a1b3d'), [0, 0.28, 0]);
    tip.rotation.z = 0.25;
    part(g, Cyl(0.175, 0.175, 0.06, 7), M('#7b2cbf'), [0, 0.05, 0]);
    part(g, Box(0.08, 0.06, 0.02), E('#ffd23f', 0.6), [0, 0.05, 0.17]);
    g.position.set(0, 0.27, 0.3);
    return g;
  }
  function makeHorns() {
    const g = new THREE.Group();
    for (const s of [-1, 1])
      part(g, Cone(0.06, 0.22, 5), E('#d00000', 0.3), [s * 0.14, 0.1, 0], null, [0, 0, -s * 0.35]);
    g.position.set(0, 0.25, 0.35);
    return g;
  }
  function makePumpkinHead() {
    const g = makePumpkin(0.24, true);
    g.position.set(0, 0.38, 0.32);
    return g;
  }
  function makeCape() {
    const g = new THREE.Group();
    part(
      g,
      Cone(0.42, 0.9, 6, true),
      M('#1b1325', { side: THREE.DoubleSide }),
      [0, -0.05, -0.55],
      [1, 1, 0.5],
      [-Math.PI / 2 + 0.35, 0, 0],
    );
    part(
      g,
      Cone(0.4, 0.86, 6, true),
      M('#9d0208', { side: THREE.DoubleSide }),
      [0, -0.06, -0.54],
      [0.95, 0.95, 0.45],
      [-Math.PI / 2 + 0.35, 0, 0],
    );
    g.position.set(0, 0.15, 0.1);
    return g;
  }
  const COSTUMES = [
    { name: 'chapeau de sorcière', make: makeWitchHat, onHead: true },
    { name: 'cornes de diablotin', make: makeHorns, onHead: false },
    { name: 'tête de citrouille', make: makePumpkinHead, onHead: true },
    { name: 'cape de vampire', make: makeCape, onHead: false },
  ];
  function makeCandy() {
    const g = new THREE.Group(),
      col = pick(['#ff006e', '#8338ec', '#06d6a0', '#ffbe0b', ORANGE]);
    part(g, Cyl(0.11, 0.11, 0.22, 8), M(col, { roughness: 0.3 }), [0, 0, 0], null, [0, 0, Math.PI / 2]);
    for (const s of [-1, 1])
      part(g, Cone(0.1, 0.16, 5), M(col), [s * 0.18, 0, 0], null, [0, 0, (s * Math.PI) / 2]);
    return g;
  }

  /* ---------- Sons ---------- */
  Sound.STY.spooky = { bpm: 96, root: 92.5, scale: [0, 1, 4, 5, 7, 8, 11], prog: [0, 1, 0, 8], drums: 1 };

  /* ---------- Costumes des crevettes ---------- */
  Hooks.on('shrimp:create', s => {
    if (Math.random() > 0.45) return;
    const c = pick(COSTUMES);
    if (c.onHead && s.hat) s.hat.visible = false;
    s.costume = c.make();
    s.model.add(s.costume);
    if (c.onHead && s.hat) {
      // On garde la place pour que le costume reste affiché après les activités.
      s.model.remove(s.hat);
      s.hat = null;
    }
    s.costumeOnHead = c.onHead;
    s.hatKind = s.hatKind && !c.onHead ? `${s.hatKind} + ${c.name}` : c.name;
  });

  // Pendant une activité, un chapeau temporaire remplace le costume de tête ; il revient après.
  const baseAddTemp = Shrimp.prototype.addTemp,
    baseRelease = Shrimp.prototype.release;
  Shrimp.prototype.addTemp = function (o) {
    baseAddTemp.call(this, o);
    if (this.costume && this.costumeOnHead && o.position.y > 0.2) this.costume.visible = false;
  };
  Shrimp.prototype.release = function () {
    baseRelease.call(this);
    if (this.costume) this.costume.visible = true;
  };

  /* ---------- Ambiance : chauves-souris, fantômes, citrouilles ---------- */
  const bats = [],
    ghosts = [],
    tablePumpkins = [];
  const flicker = new THREE.PointLight(ORANGE, 1.2, 22);
  flicker.position.set(-12, 2.5, 6);
  scene.add(flicker);
  [
    [-12, 6, 0.9],
    [12.5, 5, 0.7],
    [-9.5, 9, 0.55],
  ].forEach(([x, z, s]) => {
    const p = makePumpkin(s * 1.4, true);
    p.position.set(x, s * 1.2, z);
    p.lookAt(0, s, 0);
    scene.add(p);
    tablePumpkins.push(p);
  });
  for (let i = 0; i < 4; i++) {
    const b = makeBat();
    b.userData.r = rnd(12, 16);
    b.userData.h = rnd(9, 15);
    b.userData.sp = rnd(0.25, 0.45) * (i % 2 ? 1 : -1);
    b.userData.ph = rnd(0, 6.28);
    scene.add(b);
    bats.push(b);
  }
  for (let i = 0; i < 2; i++) {
    const g = makeGhost(rnd(0.6, 0.85));
    g.userData.ph = rnd(0, 6.28);
    g.userData.sp = rnd(0.12, 0.2);
    scene.add(g);
    ghosts.push(g);
  }

  // Une ou deux petites citrouilles dans chaque nouveau décor (elles partent avec lui).
  Hooks.on('decor:change', D => {
    const n = rint(1, 2);
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2),
        r = rnd(3.5, 6.5);
      const p = makePumpkin(rnd(0.3, 0.45), true);
      put(D.group, p, a, r, 1.15);
      p.lookAt(0, 1.2, 0);
      D.hide.push(behind(a, r));
      D.ticks.push(t => (p.userData.glow.emissiveIntensity = 1 + Math.sin(t * 9 + i) * 0.35));
    }
  });

  /* ---------- Coupure de courant ---------- */
  let blackoutIn = rnd(70, 120),
    blackout = 0,
    swoop = null;
  Hooks.on('tick', dt => {
    blackoutIn -= dt;
    if (blackoutIn <= 0 && !blackout) {
      blackoutIn = rnd(100, 160);
      blackout = 6;
      swoop = { g: makeGhost(1.3), t: 0 };
      scene.add(swoop.g);
      log('🕯️ Coupure de courant dans le bocal… quelque chose passe dans le noir.', 'decor');
      toast('Coupure de courant…');
      shrimps.forEach(s => {
        if (!s.busy && Math.random() < 0.5)
          s.say(
            pick(['😱', 'Qui a éteint ?!', 'Maman…', 'J’ai rien vu !', 'BOUH ? …non, c’est pas drôle.']),
            1.8,
          );
      });
      Sound.pop();
    }
    if (blackout > 0) {
      blackout = Math.max(0, blackout - dt);
      if (swoop) {
        swoop.t += dt;
        const u = swoop.t / 6;
        swoop.g.position.set(-9 + u * 18, 4 + Math.sin(u * Math.PI) * 4, Math.sin(u * 7) * 2);
        swoop.g.rotation.y = Math.PI / 2;
        if (blackout === 0) {
          scene.remove(swoop.g);
          disposeObj(swoop.g);
          swoop = null;
        }
      }
    }
    // Sorts « Un bonbon ou un sort » qui s'estompent
    for (const s of shrimps) {
      if (s.cursedT > 0) {
        s.cursedT -= dt;
        if (s.cursedT <= 0) setCurse(s, false);
      }
    }
  });

  // Animation de l'ambiance + assombrissement pendant la coupure.
  Hooks.on('frame', dt => {
    const t = simTime;
    bats.forEach(b => {
      const u = b.userData,
        a = u.ph + t * u.sp;
      b.position.set(Math.cos(a) * u.r, u.h + Math.sin(t * 1.3 + u.ph) * 1.2, Math.sin(a) * u.r);
      b.rotation.y = -a + (u.sp > 0 ? 0 : Math.PI);
      const f = Math.sin(t * 16 + u.ph) * 0.8;
      u.wings[0].rotation.z = f;
      u.wings[1].rotation.z = -f;
    });
    ghosts.forEach((g, i) => {
      const u = g.userData,
        a = u.ph + t * u.sp;
      g.position.set(Math.cos(a) * 5.5, 6.5 + Math.sin(t * 0.8 + i) * 2, Math.sin(a) * 5.5);
      g.rotation.y = -a;
    });
    tablePumpkins.forEach(
      (p, i) =>
        (p.userData.glow.emissiveIntensity = 1.1 + Math.sin(t * 11 + i * 2) * 0.3 + Math.random() * 0.15),
    );
    flicker.intensity = 1 + Math.sin(t * 13) * 0.2 + Math.random() * 0.2;
    if (blackout > 0 && dt > 0) {
      const k = blackout > 5 ? 6 - blackout : blackout < 1 ? 1 - blackout : 1;
      const dim = 1 - k * 0.85 + (Math.random() < 0.04 ? 0.5 : 0);
      sun.intensity *= dim;
      hemi.intensity *= dim;
      rayMat.opacity *= dim;
    }
  });

  Hooks.on('start', () => {
    const tag = document.querySelector('.logo small');
    if (tag) tag.textContent += ' · édition Halloween';
    log('🎃 Édition Halloween : costumes, chauves-souris et fantômes sont de sortie.', 'decor');
    setTimeout(() => toast('🎃 Joyeux Halloween !'), 600);
    spawnGhostShrimp();
  });

  /* ---------- Gamboo, la crevette fantôme ---------- */
  let ghostShrimp = null;
  function spawnGhostShrimp() {
    if (ghostShrimp && !ghostShrimp.removed) return;
    const s = new Shrimp({ name: 'Gamboo le fantôme', color: '#e8f0ff', pos: V(0, YMAX - 1, 0) });
    // Pas de costume pour un fantôme (il en est déjà un).
    if (s.costume) {
      s.model.remove(s.costume);
      s.costume = null;
    }
    if (s.hat) {
      s.model.remove(s.hat);
      s.hat = null;
    }
    s.hatKind = 'un drap (c’est un fantôme)';
    s.isGhost = true;
    s.noCollide = true; // il traverse les autres crevettes
    s.trait = 'fantôme (traverse tout)';
    s.model.traverse(o => {
      if (!o.isMesh) return;
      o.material = o.material.clone();
      Object.assign(o.material, { transparent: true, opacity: 0.45, depthWrite: false });
      if (o.material.emissive) {
        o.material.emissive.set('#9db4ff');
        o.material.emissiveIntensity = 0.6;
      }
      o.castShadow = false;
    });
    ghostShrimp = s;
    renderList();
    log('👻 Une crevette fantôme hante le bocal : Gamboo. Elle traverse tout le monde.', 'decor');
  }
  Hooks.on('frame', dt => {
    const g = ghostShrimp;
    if (!g || g.removed) return;
    if (dt > 0) g.model.position.y += Math.sin(simTime * 2.2) * 0.25;
    const op = 0.3 + 0.2 * Math.sin(simTime * 1.5);
    g.model.traverse(o => o.isMesh && (o.material.opacity = op));
    if (dt > 0 && !g.busy && Math.random() < dt * 0.04)
      g.say(pick(['Bouuuh…', 'Je traverse les murs, moi.', '👻', 'Qui veut un câlin glacé ?']), 2);
  });

  /* ---------- Sort : la crevette devient verte un moment ---------- */
  function setCurse(s, on) {
    s.model.traverse(o => {
      if (!o.isMesh || !o.material || o.material.userData.keep) return;
      const m = o.material;
      if (on) {
        if (!m.userData.origEmissive) m.userData.origEmissive = m.emissive.clone();
        m.emissive.set('#3cff5a');
        m.emissiveIntensity = 0.55;
      } else if (m.userData.origEmissive) {
        m.emissive.copy(m.userData.origEmissive);
        m.emissiveIntensity = 1;
      }
    });
    s.cursedT = on ? 14 : 0;
  }

  /* ---------- Interaction à deux : Un bonbon ou un sort ! ---------- */
  const trick = {
    id: 'bonbon-sort',
    status: 'joue à « un bonbon ou un sort »',
    log: (a, b) => `🎃 ${a} frappe chez ${b} : « Un bonbon ou un sort ! »`,
    play(A, t) {
      const [a, b] = A.m,
        D = A.data;
      at(A, t, 0, () => a.say('🎃 Un bonbon ou un sort !', 1.8));
      at(A, t, 1.9, () => {
        D.gives = Math.random() < 0.55;
        b.say(D.gives ? 'Tiens, un bonbon 🍬' : 'Euh… j’ai tout mangé.', 1.8);
      });
      at(A, t, 3.8, () => {
        if (D.gives) {
          a.say('Merci ! Miam.', 1.4);
          emit(D.mid, '🍬');
        } else {
          a.say('Alors… UN SORT ! 🪄', 1.6);
          a.flip(0.7);
          for (let i = 0; i < 6; i++) emit(b.headPos(), '✨', { life: 1.2 });
          setCurse(b, true);
          log(`🪄 ${b.name} a été transformé·e en crevette verte par ${a.name}.`);
        }
      });
      at(A, t, 5.2, () => !D.gives && b.say('Je suis… VERT·E ?!', 1.6));
      return t > 6.6;
    },
  };
  trick.start = A => pairStart(A, trick);
  PAIRS.push(trick);

  /* ---------- Décor : Manoir hanté ---------- */
  THEMES.push({
    name: 'Manoir hanté de Pincevania',
    water: '#3a2a5e',
    sand: '#4a3f55',
    bg: '#120a1f',
    sky: '#c9a7ff',
    ground: '#2a1d33',
    amp: 1.1,
    build(g, D) {
      const off = rnd(0, 6.28),
        wall = M('#3c2f52', { roughness: 0.95 }),
        roof = M('#1b1325');
      // Le manoir
      const manor = new THREE.Group();
      part(manor, jitter(Box(2.6, 2, 1.8), 0.05), wall, [0, 1, 0]);
      part(manor, Cone(1.9, 1.4, 4), roof, [0, 2.7, 0], [1, 1, 0.75], [0, Math.PI / 4, 0]);
      part(manor, Cyl(0.5, 0.55, 3.2, 6), wall, [1.4, 1.6, 0.2]);
      part(manor, Cone(0.7, 1.3, 6), roof, [1.4, 3.85, 0.2]);
      const windows = E('#ffd23f', 1);
      for (const [x, y] of [
        [-0.7, 1.3],
        [0.2, 1.3],
        [-0.7, 0.5],
        [1.4, 2.3],
      ])
        part(manor, Box(0.35, 0.45, 0.05), windows, [x, y, x === 1.4 ? 0.73 : 0.92]);
      part(manor, Box(0.5, 0.8, 0.05), M('#120a1a'), [0.2, 0.4, 0.92]);
      put(g, manor, off, 6, 0.85);
      face(manor, 1.5);
      D.hide.push(behind(off, 6), V(Math.cos(off) * 6, 2, Math.sin(off) * 6));
      D.ticks.push(
        t => (windows.emissiveIntensity = Math.random() < 0.03 ? 0.1 : 0.9 + Math.sin(t * 3) * 0.1),
      );
      // Tombes
      const stone = M('#7d7a8c', { roughness: 0.95 });
      for (let i = 0; i < 5; i++) {
        const tomb = new THREE.Group();
        part(tomb, Box(0.7, 0.8, 0.18), stone, [0, 0.4, 0]);
        part(tomb, Cyl(0.35, 0.35, 0.18, 8, false), stone, [0, 0.8, 0], null, [Math.PI / 2, 0, 0]);
        part(tomb, Box(0.35, 0.06, 0.02), M('#4a4757'), [0, 0.6, 0.1]);
        part(tomb, Box(0.06, 0.3, 0.02), M('#4a4757'), [0, 0.6, 0.1]);
        const a = off + 1.2 + i * 0.55;
        put(g, tomb, a, rnd(5, 7.2), 0.9);
        face(tomb, 1.2);
        tomb.rotation.z = rnd(-0.15, 0.15);
      }
      D.hide.push(behind(off + 2, 6.5));
      // Arbres morts (on réutilise les coraux, en brun foncé)
      for (let i = 0; i < 3; i++) {
        const tree = coral(M('#3b2a20'), 1.1, 0.2, 3);
        tree.scale.setScalar(rnd(1.1, 1.5));
        const a = off + 3.6 + i * 0.9;
        put(g, tree, a, rnd(6, 7.4));
        D.hide.push(behind(a, 6.8));
      }
      // Chaudron qui bouillonne
      const caul = new THREE.Group();
      part(caul, Cyl(0.7, 0.5, 0.9, 8), M('#222'), [0, 0.45, 0]);
      part(caul, new THREE.TorusGeometry(0.7, 0.08, 4, 8), M('#333'), [0, 0.9, 0], null, [Math.PI / 2, 0, 0]);
      const brew = part(caul, Cyl(0.66, 0.66, 0.05, 8), E('#3cff5a', 0.9), [0, 0.86, 0]);
      for (let i = 0; i < 3; i++)
        part(caul, Cyl(0.06, 0.06, 0.4, 4), M('#222'), [
          Math.cos(i * 2.1) * 0.45,
          0,
          Math.sin(i * 2.1) * 0.45,
        ]);
      const ca = off - 1.3;
      put(g, caul, ca, 5.2, 1.1);
      D.ticks.push((t, dt) => {
        brew.material.emissiveIntensity = 0.8 + Math.sin(t * 4) * 0.2;
        if (Math.random() < dt * 2)
          emit(V(Math.cos(ca) * 5.2, 2.2, Math.sin(ca) * 5.2), '○', {
            color: '#7dff8a',
            v: V(rnd(-0.2, 0.2), 1, rnd(-0.2, 0.2)),
            life: 1.6,
          });
      });
      // Toile d'araignée entre deux tombes
      const web = new THREE.Group();
      const wm = new THREE.LineBasicMaterial({ color: '#d9d9e8', transparent: true, opacity: 0.55 });
      const pts = [];
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        pts.push(0, 0, 0, Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0);
        for (let r = 1; r <= 3; r++) {
          const r0 = r * 0.3,
            a2 = ((k + 1) / 8) * Math.PI * 2;
          pts.push(Math.cos(a) * r0, Math.sin(a) * r0, 0, Math.cos(a2) * r0, Math.sin(a2) * r0, 0);
        }
      }
      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      web.add(new THREE.LineSegments(wg, wm));
      put(g, web, off + 0.7, 7.2, 3.2);
      face(web, 3.2);
      // Citrouilles
      for (let i = 0; i < 3; i++) {
        const p = makePumpkin(rnd(0.4, 0.6), true);
        put(g, p, off + 5 + i * 0.4, rnd(4.5, 6.5), 1.2);
        p.lookAt(0, 1.2, 0);
        D.ticks.push(t => (p.userData.glow.emissiveIntensity = 1.1 + Math.sin(t * 10 + i) * 0.35));
      }
    },
  });

  /* ---------- Activités de groupe ---------- */
  GROUPS.push({
    id: 'bal-monstres',
    label: '🎃 Bal des monstres',
    min: 6,
    max: 12,
    status: 'danse au bal des monstres',
    gatherFrac: 0.8,
    gatherMax: 9,
    start(A) {
      const n = A.m.length;
      A.m.forEach((s, i) => {
        const a = (i / n) * Math.PI * 2;
        s.goTo(V(Math.cos(a) * 3.4, 3, Math.sin(a) * 3.4), 1.5);
        if (!s.costume) s.addTemp(pick(COSTUMES).make());
      });
      const gh = A.prop(makeGhost(0.9));
      A.data.gh = gh;
      log(`🧛 Bal des monstres ! ${names(A.m)} sortent leurs plus beaux costumes.`, 'group');
      toast('Bal des monstres');
    },
    play(A, t, dt) {
      if (!A.music) {
        A.music = true;
        Sound.startMusic('spooky', ['clavier']);
      }
      const n = A.m.length;
      A.m.forEach((s, i) => {
        const dir = i % 2 ? 1 : -1;
        const a = (i / n) * Math.PI * 2 + t * 0.5 * dir;
        const r = 3.4 + (i % 2) * 1.1;
        s.goTo(V(Math.cos(a) * r, 3 + Math.sin(t * 3 + i) * 0.4, Math.sin(a) * r), 2.4);
        s.pose.roll = Math.sin(t * 4 + i) * 0.4;
        s.pose.ant = 1;
        if (Math.random() < dt * 0.1) s.flip(0.9);
        if (Math.random() < dt * 0.08)
          s.say(pick(['Mouahahaha !', 'Bouh !', '🧛', 'Je suis terrifiant·e', 'Belle cape !', '🦇']), 1.5);
      });
      A.data.gh.position.set(Math.sin(t * 0.7) * 2, 4.5 + Math.sin(t * 2) * 0.5, Math.cos(t * 0.7) * 2);
      A.data.gh.rotation.y = t;
      at(A, t, 6, () =>
        speakAt(() => A.data.gh.position.clone().add(V(0, 1.6, 0)), 'Je peux danser aussi ? Bouuuh…', 2.5),
      );
      if (Math.random() < dt * 1.5) emit(pick(A.m).headPos(), pick(['🦇', '♪', '🎃']));
      return t > 22;
    },
    end() {
      log('🧛 Le bal se termine. Le fantôme repart sans dire au revoir.');
    },
  });

  GROUPS.push({
    id: 'chasse-bonbons',
    label: '🍬 Chasse aux bonbons',
    min: 6,
    max: 10,
    status: 'chasse les bonbons',
    noGather: true,
    start(A) {
      const candies = [];
      for (let i = 0; i < A.m.length * 3; i++) {
        const c = A.prop(makeCandy());
        const p = randInside();
        if (Math.random() < 0.5) p.y = YMIN - 0.3;
        c.position.copy(p);
        c.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
        candies.push(c);
      }
      A.m.forEach(s => (s.candies = 0));
      A.data.candies = candies;
      log(`🍬 Chasse aux bonbons ! ${candies.length} bonbons sont cachés dans le bocal.`, 'group');
      toast('Chasse aux bonbons');
    },
    play(A, t, dt) {
      const D = A.data,
        left = D.candies.filter(c => c.visible);
      left.forEach(c => (c.rotation.y += dt * 2));
      A.m.forEach(s => {
        if (!s.goal || !s.goal.visible) {
          const free = left.filter(c => !A.m.some(o => o !== s && o.goal === c));
          const pool = free.length ? free : left;
          s.goal =
            pool.sort((x, y) => x.position.distanceTo(s.pos) - y.position.distanceTo(s.pos))[0] || null;
        }
        if (s.goal) {
          s.goTo(s.goal.position, 2.3);
          if (s.pos.distanceTo(s.goal.position) < 0.9) {
            s.goal.visible = false;
            s.candies++;
            s.goal = null;
            if (Math.random() < 0.35)
              s.say(pick(['🍬 Un de plus !', 'Miam', 'À moi !', `${s.candies} !`]), 1.2);
          }
        }
      });
      if (!left.length || t > 35) {
        if (!D.over) {
          D.over = t;
          const best = A.m.reduce((a, b) => (a.candies > b.candies ? a : b));
          best.say(`${best.candies} bonbons ! …j’ai mal au ventre.`, 2.4);
          best.flip(1);
          log(`🍬 ${best.name} ramasse ${best.candies} bonbons et gagne la chasse (et une indigestion).`);
          toast(`${best.name} : ${best.candies} bonbons`);
        }
        return t > D.over + 2.5;
      }
      return false;
    },
    end(A) {
      A.m.forEach(s => {
        delete s.candies;
        delete s.goal;
      });
    },
  });

  GROUPS.push({
    id: 'histoires',
    label: '👻 Histoires qui font peur',
    min: 6,
    max: 10,
    status: 'écoute une histoire qui fait peur',
    gatherFrac: 0.85,
    gatherMax: 9,
    start(A) {
      const lantern = A.prop(makePumpkin(0.55, true));
      lantern.position.set(0, 1.5, 0);
      const light = new THREE.PointLight(ORANGE, 1.5, 9);
      light.position.set(0, 2.6, 0);
      A.prop(light);
      const gh = A.prop(makeGhost(1.1));
      gh.position.set(0, 1, 0);
      gh.visible = false;
      Object.assign(A.data, { lantern, light, gh, teller: A.m[0] });
      const n = A.m.length;
      A.m.forEach((s, i) => {
        const a = (i / n) * Math.PI * 2;
        s.goTo(V(Math.cos(a) * 2.7, 2.2, Math.sin(a) * 2.7), 1.4);
        s.faceObj = V(0, 2, 0);
      });
      log(`👻 Veillée autour de la citrouille : ${A.m[0].name} raconte une histoire qui fait peur.`, 'group');
      toast('Histoires qui font peur');
    },
    play(A, t, dt) {
      const D = A.data,
        T = D.teller;
      D.light.intensity = 1.3 + Math.sin(t * 12) * 0.25 + Math.random() * 0.2;
      D.lantern.rotation.y = t * 0.3;
      at(A, t, 0.3, () => T.say('C’était une nuit sombre dans le bocal…', 2.6));
      at(A, t, 3.2, () => T.say('On raconte qu’une main GÉANTE plonge parfois du ciel…', 2.8));
      at(A, t, 6.2, () => pick(A.m.slice(1)).say('(chuchote) …c’est vrai, je l’ai vue', 2));
      at(A, t, 8.4, () => T.say('…et elle cherche… LA CREVETTE LA PLUS JUTEUSE !', 2.4));
      if (t > 3 && t < 10.6) A.m.slice(1).forEach(s => (s.pose.curl = -0.4));
      at(A, t, 10.6, () => {
        D.gh.visible = true;
        speakAt(() => D.gh.position.clone().add(V(0, 1.9, 0)), 'BOUUUH !', 2, 'say god');
        Sound.pop();
        A.m.forEach(s => {
          s.pose.curl = 0;
          s.flip(0.8);
          s.say(pick(['AAAAAH !', '😱', 'MAMAN !', 'Je m’en vais !']), 1.6);
          s.faceObj = null;
          s.goTo(s.pos.clone().add(V(rnd(-4, 4), rnd(0, 3), rnd(-4, 4))), 3.2);
        });
        log('👻 Un fantôme sort de la citrouille. Tout le monde s’enfuit en hurlant.');
      });
      if (D.gh.visible) {
        D.gh.position.y = Math.min(5, D.gh.position.y + dt * 4);
        D.gh.rotation.y += dt * 3;
      }
      at(A, t, 13.5, () =>
        speakAt(
          () => D.gh.position.clone().add(V(0, 1.9, 0)),
          '…c’était pour rire. Quelqu’un a des bonbons ?',
          2.5,
          'say god',
        ),
      );
      return t > 16;
    },
  });

  /* ---------- Activité de groupe : Meurtre au bocal ----------
   * La lumière baisse, une crevette tirée au sort devient secrètement tueuse.
   * Chaque nuit, elle peut éliminer une crevette DÉFINITIVEMENT (elle quitte le bocal).
   * Au matin, tout le monde débat et vote. Si le vote tombe sur la tueuse, elle part en prison ;
   * sinon, l'innocent·e accusé·e est mis·e à l'écart et la nuit suivante commence.
   * Au bout de MURDER_NIGHTS nuits sans arrestation, la tueuse s'en sort… et reste parmi les crevettes.
   * Ne se lance que s'il y a plus de MURDER_MIN_SHRIMPS crevettes, et plus rarement que les autres (weight 0.35).
   */
  const MURDER_NIGHTS = 2;
  // Le meurtre ne se lance que s'il y a PLUS de MURDER_MIN_SHRIMPS crevettes dans le bocal.
  const MURDER_MIN_SHRIMPS = 15;

  GROUPS.push({
    id: 'meurtre',
    label: '🔪 Meurtre au bocal',
    min: 7,
    max: 12,
    weight: 0.35,
    canStart: () => shrimps.length > MURDER_MIN_SHRIMPS,
    cannotStart: () => `Il faut plus de ${MURDER_MIN_SHRIMPS} crevettes dans le bocal pour un meurtre.`,
    status: 'est suspect·e dans une affaire de meurtre',
    noGather: true,
    start(A) {
      const pool = A.m.filter(s => !s.isGhost);
      const killer = pick(pool.length ? pool : A.m);
      Object.assign(A.data, {
        killer,
        alive: A.m.slice(),
        jailed: [],
        night: 0,
        phase: 'night',
        pt: 0,
        victims: [],
      });
      killer.secretKiller = true;
      lightDimTarget = 0.3;
      log(`🔪 La nuit tombe sur le bocal. Parmi ${A.m.length} crevettes se cache un·e tueur·se…`, 'group');
      toast('Meurtre au bocal');
      this.startNight(A);
    },
    startNight(A) {
      const D = A.data;
      D.night++;
      D.phase = 'night';
      D.pt = 0;
      D.target = null;
      D.killed = false;
      lightDimTarget = 0.3;
      // Chacun s'endort à un endroit différent, près du sable.
      D.alive.forEach((s, i) => {
        const a = (i / D.alive.length) * Math.PI * 2 + rnd(-0.2, 0.2);
        s.bed = V(Math.cos(a) * rnd(3, 6.5), YMIN + rnd(0, 0.8), Math.sin(a) * rnd(3, 6.5));
        s.goTo(s.bed, 1.4);
        s.faceObj = null;
        s.status = 'dort (enfin… normalement)';
      });
      toast(`Nuit ${D.night}`);
    },
    play(A, t, dt) {
      const D = A.data,
        K = D.killer;
      D.pt += dt;
      // Prisonniers : à l'écart, en haut du bocal
      D.jailed.forEach((s, i) => {
        s.goTo(V(-5 + i * 1.6, YMAX - 0.5, -3), 1.2);
        s.pose.curl = -0.3;
      });

      if (D.phase === 'night') {
        D.alive.forEach(s => {
          if (s !== K || !D.target) {
            s.pose.curl = -0.5;
            if (Math.random() < dt * 0.2) emit(s.headPos(), 'z', { cls: 'zz', v: V(0.2, 0.5, 0) });
          }
        });
        if (D.pt > 2.5 && !D.target) {
          const victims = D.alive.filter(s => s !== K && !s.isGhost);
          if (victims.length) {
            D.target = pick(victims);
            K.pose.curl = 0;
            K.status = 'dort (enfin… normalement)';
          }
        }
        if (D.target && !D.killed) {
          // La tueuse s'approche lentement…
          K.goTo(D.target.pos, 0.9);
          K.faceObj = D.target;
          if (K.pos.distanceTo(D.target.pos) < 1.4) {
            D.killed = true;
            const v = D.target;
            v.dead = true;
            v.status = 'est mort·e';
            for (let i = 0; i < 4; i++) emit(v.headPos(), pick(['🔪', '💥']), { life: 1 });
            Sound.pop();
            v.say('…!', 1);
            D.alive.splice(D.alive.indexOf(v), 1);
            D.victims.push(v);
            D.deadT = D.pt;
            K.goTo(K.bed, 1.4);
            K.faceObj = null;
          }
        }
        // La victime remonte lentement, ventre en l'air, puis quitte le bocal pour toujours.
        if (D.killed) {
          const v = D.victims[D.victims.length - 1];
          if (!v.removed) {
            v.pose.roll = Math.PI;
            v.pose.curl = -0.8;
            v.goTo(V(v.pos.x, YMAX, v.pos.z), 0.35);
            if (D.pt - D.deadT > 3.5) removeShrimp(v, A);
          }
          if (D.pt - D.deadT > 4.5) {
            D.phase = 'day';
            D.pt = 0;
            lightDimTarget = 1;
            D.alive.forEach(s => (s.pose.curl = 0));
            log(`💀 Au petit matin, ${v.name} a été retrouvé·e sans vie.`);
            toast(`${v.name} a été tué·e !`);
          }
        }
        if (!D.target && D.pt > 6) {
          D.phase = 'day';
          D.pt = 0;
        }
        return false;
      }

      if (D.phase === 'day') {
        // Débat en cercle
        const n = D.alive.length;
        D.alive.forEach((s, i) => {
          const a = (i / n) * Math.PI * 2;
          s.goTo(V(Math.cos(a) * 3, 3, Math.sin(a) * 3), 1.6);
          s.faceObj = V(0, 3, 0);
          s.status = 'mène l’enquête';
        });
        if (D.pt > 1.5 && D.pt < 7 && Math.random() < dt * 1.3) {
          const s = pick(D.alive),
            other = pick(D.alive.filter(o => o !== s)) || s;
          s.say(
            pick([
              `C’est forcément ${other.name} !`,
              'Moi je dormais, je le jure.',
              `${other.name} avait l’air louche hier…`,
              'Et si c’était le chat ?',
              'Je dis que c’est le caillou.',
              'Personne ne quitte le bocal !',
            ]),
            1.8,
          );
        }
        if (D.pt > 8 && !D.voted) {
          D.voted = true;
          // Plus les nuits passent, plus la tueuse est soupçonnée.
          const p = 0.3 + 0.2 * D.night;
          const accused = Math.random() < p ? K : pick(D.alive.filter(s => s !== K));
          D.accused = accused;
          D.alive.forEach(s => s !== accused && (s.faceObj = accused));
          accused.say('Quoi ?! Moi ?!', 1.8);
          log(`🗳️ Le bocal vote : ${accused.name} est accusé·e.`);
        }
        if (D.voted && D.pt > 10.5 && !D.resolved) {
          D.resolved = true;
          const a = D.accused;
          if (a === K) {
            K.say('…D’accord. C’était moi.', 2.4);
            log(`🎯 ${K.name} était bien le/la tueur·se ! Direction la prison du bocal.`, 'group');
            toast(`${K.name} était le/la tueur·se !`);
            D.caught = true;
          } else {
            a.say('Je suis innocent·e !!', 2);
            log(`😬 ${a.name} était innocent·e… et le/la tueur·se court toujours.`);
          }
          D.alive.splice(D.alive.indexOf(a), 1);
          D.jailed.push(a);
          a.status = a === K ? 'est en prison' : 'est mis·e à l’écart (innocent·e)';
          D.resT = D.pt;
        }
        if (D.resolved && D.pt > D.resT + 2.5) {
          D.voted = D.resolved = false;
          if (D.caught) return true;
          if (D.night >= MURDER_NIGHTS || D.alive.length <= 3) {
            log(`🕵️ Le/la tueur·se n’a jamais été démasqué·e… et vit toujours parmi vous.`, 'group');
            toast('Le tueur court toujours…');
            K.secretKiller = true;
            return true;
          }
          this.startNight(A);
        }
        return false;
      }
      return false;
    },
    end(A) {
      lightDimTarget = 1;
      A.m.forEach(s => {
        delete s.bed;
        if (A.data.caught) delete s.secretKiller;
      });
    },
  });
})();
