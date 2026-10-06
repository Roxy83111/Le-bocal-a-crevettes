/*
 * Décor « Laboratoire secret » : paillasse avec fioles qui bouillonnent, bobine électrique
 * qui lance des éclairs, cuve de liquide fluo et vieil ordinateur à l'écran vert.
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Laboratoire secret',
  water: '#2f7d6d',
  sand: '#55606b',
  bg: '#0b1418',
  sky: '#c8ffe6',
  ground: '#2b3238',
  amp: 0.2,
  build(g, D) {
    const off = rnd(0, 6.28);
    const metal = M('#9aa5b1', { metalness: 0.6, roughness: 0.3 }),
      glass = M('#e3f2fd', { transparent: true, opacity: 0.4, roughness: 0.05 });

    // Carrelage de laboratoire au sol (dalles claires)
    for (let x = -4; x <= 4; x += 2)
      for (let z = -4; z <= 4; z += 2)
        if (Math.hypot(x, z) < 5.2)
          part(g, Box(1.9, 0.08, 1.9), M((x + z) % 4 ? '#c8d1d9' : '#e5ebf0'), [x, 1.05, z]);

    // Paillasse avec fioles
    const bench = new THREE.Group();
    part(bench, Box(4, 0.2, 1.4), M('#e5e5e5'), [0, 1.6, 0]);
    for (const s of [-1, 1]) part(bench, Box(0.2, 1.6, 1.3), metal, [s * 1.85, 0.8, 0]);
    const liquids = [];
    const cols = ['#39ff14', '#ff3bd4', '#00e5ff', '#ffe600'];
    for (let i = 0; i < 4; i++) {
      const x = -1.4 + i * 0.95;
      part(bench, Cyl(0.08, 0.3, 0.6, 8), glass, [x, 2.0, 0]);
      part(bench, Cyl(0.08, 0.08, 0.4, 6), glass, [x, 2.5, 0]);
      liquids.push(part(bench, Cyl(0.06, 0.26, 0.35, 8), E(cols[i], 0.9), [x, 1.88, 0]));
    }
    const ba = off;
    put(g, bench, ba, 6, 0.9);
    face(bench, 2);
    D.hide.push(behind(ba, 6));
    D.ticks.push((t, dt) => {
      liquids.forEach((l, i) => (l.material.emissiveIntensity = 0.7 + Math.sin(t * 3 + i) * 0.3));
      if (Math.random() < dt * 3) {
        const l = pick(liquids);
        emit(l.getWorldPosition(V()).add(V(0, 0.8, 0)), '○', { color: '#c8ffe6', v: V(0, 1, 0), life: 1.2 });
      }
    });

    // Bobine électrique avec éclairs
    const coil = new THREE.Group();
    part(coil, Cyl(0.6, 0.8, 0.5, 8), M('#3a3a3a'), [0, 0.25, 0]);
    part(coil, Cyl(0.3, 0.3, 2.4, 10), M('#b87333', { metalness: 0.6, roughness: 0.3 }), [0, 1.7, 0]);
    for (let i = 0; i < 6; i++)
      part(
        coil,
        new THREE.TorusGeometry(0.33, 0.04, 4, 10),
        M('#d4a373', { metalness: 0.7 }),
        [0, 0.8 + i * 0.35, 0],
        null,
        [Math.PI / 2, 0, 0],
      );
    part(coil, new THREE.TorusGeometry(0.6, 0.2, 6, 12), metal, [0, 3.1, 0], null, [Math.PI / 2, 0, 0]);
    const sparkMat = new THREE.LineBasicMaterial({ color: '#b5f5ff' });
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Array(8 * 3).fill(0), 3));
    const spark = new THREE.Line(sparkGeo, sparkMat);
    coil.add(spark);
    const coilLight = new THREE.PointLight('#9be7ff', 0, 8);
    coilLight.position.y = 3.2;
    coil.add(coilLight);
    const ca = off + 1.8;
    put(g, coil, ca, 6.2, 0.9);
    D.hide.push(behind(ca, 6.2));
    D.ticks.push(() => {
      const on = Math.random() < 0.25;
      spark.visible = on;
      coilLight.intensity = on ? 1.6 : 0;
      if (!on) return;
      const p = sparkGeo.attributes.position;
      const ang = rnd(0, 6.28);
      for (let k = 0; k < 8; k++) {
        const u = k / 7;
        p.setXYZ(
          k,
          Math.cos(ang) * (0.7 + u * 1.6) + rnd(-0.2, 0.2),
          3.1 + rnd(-0.3, 0.3) - u * 0.6,
          Math.sin(ang) * (0.7 + u * 1.6) + rnd(-0.2, 0.2),
        );
      }
      p.needsUpdate = true;
    });

    // Cuve de liquide fluo avec quelque chose qui flotte dedans
    const tank = new THREE.Group();
    part(tank, Cyl(0.9, 0.9, 0.3, 10), metal, [0, 0.15, 0]);
    part(tank, Cyl(0.85, 0.85, 3, 10, true), glass, [0, 1.8, 0]);
    const goo = part(
      tank,
      Cyl(0.8, 0.8, 2.6, 10),
      M('#39ff14', { transparent: true, opacity: 0.35, emissive: '#39ff14', emissiveIntensity: 0.4 }),
      [0, 1.6, 0],
    );
    part(tank, Cyl(0.9, 0.9, 0.3, 10), metal, [0, 3.35, 0]);
    const blob = part(tank, jitter(Ico(0.35, 1), 0.1), M('#ff8fab'), [0, 1.8, 0]);
    for (const s of [-1, 1]) part(blob, Ico(0.08), M('#111'), [s * 0.12, 0.08, 0.3]);
    const ta = off - 1.7;
    put(g, tank, ta, 6, 0.9);
    D.ticks.push(t => {
      blob.position.y = 1.8 + Math.sin(t * 1.2) * 0.4;
      blob.rotation.y = t * 0.5;
      goo.material.emissiveIntensity = 0.35 + Math.sin(t * 2) * 0.1;
    });

    // Vieil ordinateur à l'écran vert qui affiche des lignes
    const pc = new THREE.Group();
    part(pc, Box(1.8, 1.4, 1.4), M('#d6ccc2'), [0, 0.9, 0]);
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 96;
    const tex = new THREE.CanvasTexture(c);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.05), new THREE.MeshBasicMaterial({ map: tex }));
    scr.position.set(0, 0.95, 0.71);
    pc.add(scr);
    part(pc, Box(1.6, 0.15, 0.7), M('#bfb5aa'), [0, 0.1, 1.1]);
    const pa = off + 3.2;
    put(g, pc, pa, 6.4, 0.9);
    face(pc, 1);
    D.hide.push(behind(pa, 6.4));
    const lines = [
      '> ANALYSE CREVETTE…',
      '> ADN : 98% CRUSTACÉ',
      '> 2% MYSTÈRE',
      '> EXPÉRIENCE N°42',
      '> NE PAS TAPOTER',
      '> LE VERRE',
    ];
    let lastLine = -1;
    D.ticks.push(t => {
      const k = Math.floor(t * 1.5);
      if (k === lastLine) return;
      lastLine = k;
      const x = c.getContext('2d');
      x.fillStyle = '#04140a';
      x.fillRect(0, 0, 128, 96);
      x.fillStyle = '#39ff14';
      x.font = '10px monospace';
      for (let i = 0; i < 6; i++) if (i <= k % 8) x.fillText(lines[i], 4, 14 + i * 14);
      if (k % 2) x.fillRect(4 + (k % 8 > 5 ? 90 : 0), 86, 6, 2);
      tex.needsUpdate = true;
    });
  },
});
