/*
 * Fabrication des modèles low poly : la crevette, ses chapeaux et les instruments de musique.
 */
'use strict';
const eyeMat = M('#111', { roughness: 0.3 });
eyeMat.userData.keep = true;
function buildShrimp(color) {
  const root = new THREE.Group(),
    model = new THREE.Group();
  root.add(model);
  const c = new THREE.Color(color);
  const body = M(c, { roughness: 0.45 });
  const dark = M(c.clone().multiplyScalar(0.78), { roughness: 0.5 });
  const pale = M(c.clone().lerp(new THREE.Color('#ffffff'), 0.45), { roughness: 0.5 });
  const head = mk(jitter(Ico(0.34, 0), 0.025), body, 0, 0.02, 0.28);
  head.scale.set(0.8, 0.78, 1.45);
  model.add(head);
  part(model, Cone(0.06, 0.55, 4), body, [0, 0.13, 0.85], null, [Math.PI / 2, 0, 0]);
  const eyes = [],
    ants = [],
    legs = [],
    swims = [];
  for (const s of [-1, 1]) {
    part(model, Cyl(0.03, 0.04, 0.18, 4), body, [s * 0.16, 0.16, 0.66], null, [0, 0, -s * 0.7]);
    const eye = mk(Ico(0.075, 0), eyeMat, s * 0.23, 0.22, 0.68);
    model.add(eye);
    eyes.push(eye);
    const ap = new THREE.Group();
    ap.position.set(s * 0.08, 0.06, 0.72);
    model.add(ap);
    const ag = Cyl(0.008, 0.022, 1.7, 3);
    ag.translate(0, 0.85, 0);
    ag.rotateX(Math.PI / 2);
    ap.add(mk(ag, pale));
    ap.rotation.set(-0.35, s * 0.45, 0);
    ants.push(ap);
    for (let i = 0; i < 4; i++) {
      const lp = new THREE.Group();
      lp.position.set(s * 0.17, -0.14, 0.45 - i * 0.13);
      lp.rotation.z = s * 0.55;
      const lg = Cyl(0.015, 0.025, 0.42, 3);
      lg.translate(0, -0.21, 0);
      lp.add(mk(lg, pale));
      model.add(lp);
      legs.push(lp);
    }
  }
  const segs = [];
  let parent = model;
  const sizes = [0.27, 0.25, 0.22, 0.18, 0.14, 0.11];
  for (let i = 0; i < sizes.length; i++) {
    const p = new THREE.Group();
    p.position.set(0, i ? 0 : 0.02, i ? -0.27 : -0.08);
    parent.add(p);
    const g = Cyl(sizes[i], sizes[i + 1] || 0.08, 0.3, 6);
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, -0.14);
    g.scale(1, 0.85, 1);
    p.add(mk(g, i % 2 ? body : dark));
    if (i < 5)
      for (const s of [-1, 1]) {
        const sp = new THREE.Group();
        sp.position.set(s * sizes[i] * 0.5, -sizes[i] * 0.75, -0.14);
        const sg = Cyl(0.012, 0.02, 0.22, 3);
        sg.translate(0, -0.11, 0);
        sp.add(mk(sg, pale));
        sp.rotation.z = s * 0.25;
        p.add(sp);
        swims.push(sp);
      }
    segs.push(p);
    parent = p;
  }
  const fan = new THREE.Group();
  fan.position.z = -0.27;
  parent.add(fan);
  for (const a of [-0.6, 0, 0.6]) {
    const g = Cone(0.14, 0.48, 4);
    g.rotateX(Math.PI / 2);
    g.translate(0, 0, -0.24);
    g.scale(1, 0.22, 1);
    const f = mk(g, a ? pale : body);
    f.rotation.y = a;
    fan.add(f);
  }
  return { root, model, segs, ants, eyes, legs, swims, mats: { body, dark, pale } };
}
function makeHat(kind) {
  const g = new THREE.Group();
  if (kind === 'haut-de-forme') {
    const k = M('#1b1b22');
    part(g, Cyl(0.27, 0.27, 0.03, 8), k);
    part(g, Cyl(0.16, 0.17, 0.34, 8), k, [0, 0.18, 0]);
    part(g, Cyl(0.172, 0.172, 0.07, 8), M('#e63946'), [0, 0.06, 0]);
  } else if (kind === 'cotillon') {
    const col = pick(['#ff006e', '#3a86ff', '#ffd23f', '#06d6a0']);
    part(g, Cone(0.15, 0.42, 6), M(col), [0, 0.2, 0]);
    part(g, Ico(0.06), M('#ffffff'), [0, 0.43, 0]);
  } else if (kind === 'couronne') {
    const gd = M('#ffcf33', { metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide });
    part(g, Cyl(0.18, 0.16, 0.14, 6, true), gd, [0, 0.06, 0]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      part(g, Cone(0.05, 0.13, 4), gd, [Math.cos(a) * 0.17, 0.19, Math.sin(a) * 0.17]);
    }
    part(g, Ico(0.04), E('#e63946', 0.5), [0, 0.08, 0.17]);
  } else if (kind === 'béret') {
    const col = pick(['#7b2cbf', '#1d3557', '#9d0208']);
    part(g, Cyl(0.25, 0.22, 0.08, 8), M(col), [0, 0.04, 0], [1, 1, 1], [0.2, 0, 0]);
    part(g, Cyl(0.02, 0.02, 0.08, 4), M(col), [0, 0.12, -0.02]);
  } else if (kind === 'nœud') {
    const p = M('#ff70a6');
    part(g, Cone(0.1, 0.2, 4), p, [-0.11, 0.06, 0], null, [0, 0, Math.PI / 2]);
    part(g, Cone(0.1, 0.2, 4), p, [0.11, 0.06, 0], null, [0, 0, -Math.PI / 2]);
    part(g, Ico(0.05), p, [0, 0.06, 0]);
  } else {
    const st = M('#e9c46a');
    part(g, Cyl(0.4, 0.4, 0.03, 8), st);
    part(g, Cyl(0.18, 0.2, 0.16, 8), st, [0, 0.09, 0]);
    part(g, Cyl(0.205, 0.205, 0.05, 8), M('#e63946'), [0, 0.04, 0]);
  }
  g.position.set(0, 0.27, 0.3);
  return g;
}
function makeInstrument(k) {
  const g = new THREE.Group();
  const gold = M('#f2c14e', { metalness: 0.6, roughness: 0.3 });
  if (k === 'guitare') {
    const r = M('#e76f51');
    part(g, Ico(0.22), r, [0, 0, 0], [1, 1, 0.35]);
    part(g, Ico(0.17), r, [0, 0.25, 0], [1, 1, 0.35]);
    part(g, Ico(0.06), M('#222'), [0, 0.12, 0.06]);
    part(g, Box(0.06, 0.7, 0.04), M('#6b4226'), [0, 0.65, 0]);
    part(g, Box(0.1, 0.14, 0.05), M('#333'), [0, 1.05, 0]);
    g.position.set(0.05, -0.3, 0.8);
    g.rotation.set(0.2, 0, -1.0);
  } else if (k === 'batterie') {
    part(g, Cyl(0.3, 0.3, 0.28, 8), M('#d62828'), [0, 0, 0]);
    part(g, Cyl(0.29, 0.29, 0.02, 8), M('#f1faee'), [0, 0.15, 0]);
    g.userData.sticks = [];
    for (const s of [-1, 1]) {
      const p = new THREE.Group();
      p.position.set(s * 0.2, 0.35, -0.25);
      const st = Cyl(0.015, 0.02, 0.45, 4);
      st.translate(0, 0.225, 0);
      st.rotateX(Math.PI / 2);
      p.add(mk(st, M('#e9c46a')));
      g.add(p);
      g.userData.sticks.push(p);
    }
    g.position.set(0, -0.5, 1.05);
  } else if (k === 'trompette') {
    part(g, Cyl(0.03, 0.03, 0.55, 5), gold, [0, 0, 0.27], null, [Math.PI / 2, 0, 0]);
    part(g, Cone(0.13, 0.22, 8, true), gold, [0, 0, 0.62], null, [-Math.PI / 2, 0, 0]);
    for (let i = 0; i < 3; i++) part(g, Box(0.04, 0.1, 0.04), gold, [0, 0.07, 0.18 + i * 0.08]);
    g.position.set(0, 0, 0.8);
  } else if (k === 'maracas') {
    for (const s of [-1, 1]) {
      const p = new THREE.Group();
      p.position.set(s * 0.38, -0.1, 0.55);
      part(p, Cyl(0.02, 0.02, 0.3, 4), M('#6b4226'), [0, -0.15, 0]);
      part(p, Ico(0.11), M(s > 0 ? '#06d6a0' : '#ff006e'), [0, 0.04, 0]);
      g.add(p);
    }
  } else if (k === 'micro') {
    part(g, Ico(0.09), M('#444', { metalness: 0.5, roughness: 0.3 }), [0, 0, 0]);
    part(g, Cyl(0.025, 0.025, 1.4, 4), M('#222'), [0, -0.75, 0]);
    g.position.set(0, 0.05, 1.0);
  } else if (k === 'triangle') {
    part(
      g,
      new THREE.TorusGeometry(0.2, 0.025, 3, 3),
      M('#d9d9d9', { metalness: 0.8, roughness: 0.2 }),
      [0, 0, 0],
      null,
      [0, 0, Math.PI / 2],
    );
    part(g, Cyl(0.012, 0.012, 0.35, 4), M('#d9d9d9'), [0.25, 0.1, 0], null, [0, 0, 0.8]);
    g.position.set(0.2, -0.15, 0.95);
  } else {
    part(g, Box(0.85, 0.08, 0.24), M('#f1faee'), [0, 0, 0]);
    for (let i = 0; i < 7; i++)
      part(g, Box(0.08, 0.03, 0.1), M(i % 2 ? '#111' : '#ddd'), [-0.33 + i * 0.11, 0.05, 0.04]);
    part(g, Box(0.4, 0.07, 0.08), M('#ff006e'), [0.6, 0.02, 0]);
    g.position.set(0, -0.32, 0.8);
    g.rotation.z = 0.3;
  }
  g.userData.r0 = g.rotation.clone();
  g.userData.kind = k;
  return g;
}
function animInstrument(s, beat) {
  const g = s.inst;
  if (!g) return;
  const r0 = g.userData.r0;
  switch (g.userData.kind) {
    case 'batterie':
      g.userData.sticks.forEach(
        (p, i) => (p.rotation.x = -Math.abs(Math.sin(beat * Math.PI + (i * Math.PI) / 2)) * 0.9),
      );
      break;
    case 'maracas':
      g.rotation.z = Math.sin(beat * Math.PI * 4) * 0.35;
      break;
    case 'guitare':
      g.rotation.z = r0.z + Math.sin(beat * Math.PI) * 0.12;
      break;
    case 'trompette':
      g.rotation.x = -0.15 + Math.sin(beat * Math.PI) * 0.12;
      break;
    default:
      g.rotation.z = r0.z + Math.sin(beat * Math.PI * 2) * 0.12;
  }
}
