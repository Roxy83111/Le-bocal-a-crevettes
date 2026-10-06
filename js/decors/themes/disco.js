/*
 * Décor « Discothèque des Abysses ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Discothèque des Abysses',
  water: '#5a2d8c',
  sand: '#2a2238',
  bg: '#0d0618',
  sky: '#d8b4fe',
  ground: '#2a1840',
  amp: 0.3,
  build(g, D) {
    const tiles = [];
    for (let x = -5; x <= 5; x++)
      for (let z = -5; z <= 5; z++) {
        if (Math.hypot(x, z) > 5.4) continue;
        const m = M('#222', { emissive: '#000', roughness: 0.4 });
        const t = mk(Box(0.95, 0.12, 0.95), m, x, 1.2, z);
        g.add(t);
        tiles.push(t);
      }
    const ball = mk(
      Ico(1, 1),
      M('#e8e8f0', { metalness: 0.35, roughness: 0.15, emissive: '#8a8aa0', emissiveIntensity: 0.35 }),
      0,
      9.6,
      0,
    );
    g.add(ball);
    g.add(mk(Cyl(0.03, 0.03, 2, 4), M('#999'), 0, 11, 0));
    const beams = new THREE.Group();
    beams.position.set(0, 9.6, 0);
    g.add(beams);
    const bcols = ['#ff00c8', '#00f0ff', '#fff200', '#7cff00', '#ff6a00', '#9d4edd'];
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Group();
      p.rotation.set(0.55, (i / 6) * Math.PI * 2, 0);
      const bg = Cone(0.7, 8, 6, true);
      bg.translate(0, -4, 0);
      p.add(
        new THREE.Mesh(
          bg,
          new THREE.MeshBasicMaterial({
            color: bcols[i],
            transparent: true,
            opacity: 0.09,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        ),
      );
      beams.add(p);
    }
    const pls = ['#ff00c8', '#00f0ff', '#fff200'].map(c => {
      const l = new THREE.PointLight(c, 1.3, 16);
      g.add(l);
      return l;
    });
    const spk = [];
    for (let i = 0; i < 2; i++) {
      const s = new THREE.Group();
      part(s, Box(1.4, 2.2, 1.1), M('#16161c'), [0, 1.1, 0]);
      part(s, Cyl(0.42, 0.42, 0.1, 10), M('#444'), [0, 0.75, 0.56], null, [Math.PI / 2, 0, 0]);
      part(s, Cyl(0.22, 0.22, 0.1, 10), M('#444'), [0, 1.7, 0.56], null, [Math.PI / 2, 0, 0]);
      const a = i * Math.PI + 0.6;
      put(g, s, a, 7, 0.9);
      face(s);
      spk.push(s);
      D.hide.push(behind(a, 7));
    }
    D.ticks.push(t => {
      ball.rotation.y = t * 0.6;
      beams.rotation.y = t * 0.4;
      const k = Math.floor(t * 2.2);
      tiles.forEach((tl, i) => {
        const on = (i + k) % 3 === 0;
        tl.material.emissive.setHSL((i * 0.137 + k * 0.21) % 1, 0.9, 0.5);
        tl.material.emissiveIntensity = on ? 0.9 : 0.05;
      });
      pls.forEach((l, i) =>
        l.position.set(
          Math.cos(t * 0.8 + i * 2.1) * 5,
          4 + Math.sin(t + i) * 2,
          Math.sin(t * 0.8 + i * 2.1) * 5,
        ),
      );
      const b = 1 + Math.abs(Math.sin(t * Math.PI * 2)) * 0.04;
      spk.forEach(s => s.scale.set(b, b, b));
    });
  },
});
