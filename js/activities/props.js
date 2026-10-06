/*
 * Accessoires des activités : divinités du rituel, diapos de conférence, ballon et cages de foot.
 */
'use strict';
function eyesOn(g, y, z, sp = 0.3, r = 0.1) {
  for (const s of [-1, 1]) {
    part(g, Ico(r), M('#111'), [s * sp, y, z]);
    part(g, Ico(r * 0.35), M('#fff'), [s * sp + 0.03, y + 0.03, z + r * 0.8]);
  }
}
const DEITIES = [
  {
    name: 'le Grand Canard Cosmique',
    short: 'Grand Canard',
    lines: ['COIN.', 'JE VOUS ACCORDE… DES GRANULÉS. COIN.', 'SOYEZ GENTILS AVEC LE SABLE.'],
    make() {
      const g = new THREE.Group(),
        y = E('#ffd23f', 0.25);
      part(g, jitter(Ico(1, 0), 0.08), y, [0, 0, 0], [1.2, 0.85, 1.3]);
      part(g, Ico(0.62, 0), y, [0, 0.9, 0.75]);
      part(g, Cone(0.22, 0.55, 4), E('#ff8c1a', 0.3), [0, 0.82, 1.4], null, [Math.PI / 2, 0, 0]);
      eyesOn(g, 1.05, 1.2, 0.28);
      part(g, Ico(0.5, 0), y, [0, 0.1, -1.1], [1, 0.6, 1]);
      for (const s of [-1, 1]) part(g, Ico(0.5, 0), y, [s * 1.05, 0.15, 0], [0.3, 0.6, 1]);
      return g;
    },
  },
  {
    name: 'la Tartine Sacrée',
    short: 'Tartine',
    lines: ['JE SUIS BEURRÉE. VOUS ÊTES BÉNIS.', 'MANGEZ VOS GRANULÉS.', 'NE TOMBEZ JAMAIS DU MAUVAIS CÔTÉ.'],
    make() {
      const g = new THREE.Group();
      part(g, jitter(Box(2.2, 0.4, 2.2), 0.06), E('#d9a066', 0.2));
      part(g, Box(1.2, 0.16, 1.2), E('#ffe066', 0.35), [0, 0.28, 0]);
      eyesOn(g, 0.28, 1.12, 0.35, 0.12);
      part(g, new THREE.TorusGeometry(0.25, 0.05, 4, 8, Math.PI), M('#3b2412'), [0, 0, 1.13], null, [
        0,
        0,
        Math.PI,
      ]);
      return g;
    },
  },
  {
    name: 'la Patate Ancestrale',
    short: 'Patate',
    lines: ['JE SUIS TRÈS VIEILLE. ET TRÈS PATATE.', 'LA PATIENCE EST UN TUBERCULE.', 'SOYEZ FÉCULENTS.'],
    make() {
      const g = new THREE.Group();
      part(g, jitter(Ico(1, 1), 0.22), E('#a0703c', 0.15), [0, 0, 0], [1.25, 0.95, 1]);
      eyesOn(g, 0.25, 0.92, 0.32, 0.11);
      for (let i = 0; i < 4; i++)
        part(g, Cone(0.08, 0.35, 4), M('#7cb518'), [rnd(-0.6, 0.6), 0.85, rnd(-0.4, 0.4)], null, [
          rnd(-0.5, 0.5),
          0,
          rnd(-0.5, 0.5),
        ]);
      return g;
    },
  },
  {
    name: 'l’Ananas de l’Au-delà',
    short: 'Ananas',
    lines: ['JE VIENS DU RAYON FRUITS ET LÉGUMES.', 'L’AU-DELÀ EST SUCRÉ.', 'SOYEZ PIQUANTS MAIS JUTEUX.'],
    make() {
      const g = new THREE.Group();
      part(g, jitter(Ico(0.9, 1), 0.1), E('#f4b400', 0.25), [0, 0, 0], [1, 1.35, 1]);
      eyesOn(g, 0.25, 0.85, 0.3, 0.1);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        part(g, Cone(0.14, 1, 4), M('#2d9b4f'), [Math.cos(a) * 0.18, 1.6, Math.sin(a) * 0.18], null, [
          Math.sin(a) * 0.5,
          0,
          -Math.cos(a) * 0.5,
        ]);
      }
      return g;
    },
  },
];
function slideTex(title, line) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 288;
  const g = c.getContext('2d');
  g.fillStyle = '#fff8ec';
  g.fillRect(0, 0, 512, 288);
  g.fillStyle = '#ff7b5c';
  g.fillRect(0, 0, 512, 62);
  g.fillStyle = '#ffffff';
  g.font = '600 24px Lexend, sans-serif';
  g.fillText(title, 22, 40);
  g.fillStyle = '#1d2b2a';
  g.font = '22px Lexend, sans-serif';
  const words = line.split(' ');
  let l = '',
    y = 110;
  for (const w of words) {
    const tt = l ? l + ' ' + w : w;
    if (g.measureText(tt).width > 468) {
      g.fillText(l, 22, y);
      y += 32;
      l = w;
    } else l = tt;
  }
  g.fillText(l, 22, y);
  g.fillStyle = '#ff7b5c';
  for (let i = 0; i < 5; i++) g.fillRect(360 + i * 26, 250 - i * 14 - 10, 18, i * 14 + 10);
  return new THREE.CanvasTexture(c);
}
function makeBall() {
  const geo = Ico(0.32, 1);
  const n = geo.attributes.position.count,
    cols = [];
  for (let f = 0; f < n / 3; f++) {
    const c = f % 5 === 0 ? [0.1, 0.1, 0.1] : [0.95, 0.95, 0.95];
    for (let k = 0; k < 3; k++) cols.push(c[0], c[1], c[2]);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  return mk(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.6 }));
}
function makeGoal() {
  const g = new THREE.Group(),
    w = M('#f1faee');
  for (const z of [-1.3, 1.3]) {
    part(g, Cyl(0.07, 0.07, 2.6, 5), w, [0, 2.3, z]);
    part(g, Cyl(0.05, 0.05, 2.6, 5), w, [-0.8, 2.3, z]);
  }
  part(g, Cyl(0.07, 0.07, 2.7, 5), w, [0, 3.6, 0], null, [Math.PI / 2, 0, 0]);
  const net = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6, 6, 6),
    new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.35 }),
  );
  net.position.set(-0.8, 2.3, 0);
  net.rotation.y = Math.PI / 2;
  g.add(net);
  return g;
}
