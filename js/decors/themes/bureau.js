/*
 * Décor « Bureau du stagiaire ».
 * water/sand/bg/sky/ground = couleurs, amp = relief du sable, build() = objets du décor.
 * D.hide reçoit les cachettes (cache-cache), D.ticks les animations du décor.
 */
'use strict';
THEMES.push({
  name: 'Bureau du stagiaire',
  water: '#6bb2d6',
  sand: '#bfae92',
  bg: '#2a3340',
  sky: '#eef3f7',
  ground: '#6d6658',
  amp: 0.5,
  build(g, D) {
    const off = rnd(0, 6.28),
      wood = M('#c9a27e'),
      grey = M('#8d99ae', { metalness: 0.4, roughness: 0.4 });
    const desk = new THREE.Group();
    part(desk, Box(3.8, 0.18, 1.9), wood, [0, 1.6, 0]);
    for (const x of [-1.75, 1.75])
      for (const z of [-0.8, 0.8]) part(desk, Box(0.14, 1.6, 0.14), wood, [x, 0.8, z]);
    const lap = new THREE.Group();
    part(lap, Box(1.2, 0.06, 0.8), grey);
    const scr = new THREE.Group();
    scr.position.set(0, 0.03, -0.4);
    scr.rotation.x = -0.25;
    part(scr, Box(1.2, 0.8, 0.05), grey, [0, 0.4, 0]);
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 160;
    const x = c.getContext('2d');
    x.fillStyle = '#e8f1ff';
    x.fillRect(0, 0, 256, 160);
    x.fillStyle = '#217346';
    x.fillRect(0, 0, 256, 22);
    x.fillStyle = '#fff';
    x.font = '600 13px sans-serif';
    x.fillText('Rapport_FINAL_v7(2).xlsx', 8, 15);
    x.strokeStyle = '#b8c4d6';
    for (let i = 0; i < 8; i++) {
      x.beginPath();
      x.moveTo(0, 22 + i * 17);
      x.lineTo(256, 22 + i * 17);
      x.stroke();
    }
    for (let i = 0; i < 5; i++) {
      x.beginPath();
      x.moveTo(i * 52, 22);
      x.lineTo(i * 52, 160);
      x.stroke();
    }
    x.fillStyle = '#d00000';
    x.font = 'bold 14px sans-serif';
    x.fillText('#REF!', 62, 70);
    x.fillText('#REF!', 114, 104);
    const sm = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.7),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }),
    );
    sm.position.set(0, 0.4, 0.03);
    scr.add(sm);
    lap.add(scr);
    lap.position.set(-0.5, 1.72, 0);
    desk.add(lap);
    const mug = new THREE.Group();
    part(mug, Cyl(0.25, 0.22, 0.5, 10), M('#ffffff'), [0, 0.25, 0]);
    part(mug, Cyl(0.255, 0.255, 0.12, 10), M('#ff7b5c'), [0, 0.3, 0]);
    part(mug, new THREE.TorusGeometry(0.14, 0.04, 4, 8), M('#ffffff'), [0.3, 0.27, 0]);
    part(mug, Cyl(0.21, 0.21, 0.02, 10), M('#3b2412'), [0, 0.45, 0]);
    mug.position.set(1, 1.7, 0.3);
    desk.add(mug);
    const stp = new THREE.Group();
    part(stp, Box(0.6, 0.1, 0.18), M('#222'));
    part(stp, Box(0.58, 0.1, 0.16), M('#e63946'), [0, 0.11, 0], null, [0, 0, 0.08]);
    stp.position.set(1.2, 1.75, -0.4);
    desk.add(stp);
    for (let i = 0; i < 3; i++)
      part(
        desk,
        Box(0.3, 0.02, 0.3),
        M(pick(['#ffd23f', '#ff70a6', '#90e0ef'])),
        [0.3 + i * 0.35, 1.7, 0.6],
        null,
        [0, rnd(-0.4, 0.4), 0],
      );
    const da = off;
    put(g, desk, da, 5.6, 0.9);
    face(desk, 1.6);
    desk.rotation.y += Math.PI;
    D.hide.push(V(Math.cos(da) * 5.6, YMIN + 0.1, Math.sin(da) * 5.6), behind(da, 5.6));
    const ch = new THREE.Group(),
      blue = M('#1d3557');
    part(ch, Box(1, 0.15, 1), blue, [0, 1.1, 0]);
    part(ch, Box(1, 1.1, 0.12), blue, [0, 1.7, -0.45]);
    part(ch, Cyl(0.06, 0.06, 0.9, 6), grey, [0, 0.6, 0]);
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Group();
      p.rotation.y = (i / 5) * Math.PI * 2;
      part(p, Box(0.08, 0.06, 0.5), grey, [0, 0.15, 0.25]);
      part(p, Ico(0.07), M('#111'), [0, 0.08, 0.5]);
      ch.add(p);
    }
    const cha = off + 0.9;
    put(g, ch, cha, 5.2, 0.9);
    ch.rotation.y = rnd(0, 6);
    D.hide.push(behind(cha, 5.2));
    const pl = new THREE.Group();
    part(pl, Cyl(0.4, 0.3, 0.7, 8), M('#c4693d'), [0, 0.35, 0]);
    for (let i = 0; i < 7; i++) {
      const l = part(pl, Cone(0.16, 1.4, 4), M(pick(['#3f8f4a', '#58a65c'])), [0, 1.2, 0], [1, 1, 0.35]);
      l.rotation.set(rnd(-0.6, 0.6), rnd(0, 6), rnd(-0.6, 0.6));
    }
    const pa = off - 1.2;
    put(g, pl, pa, 6.4, 0.9);
    D.hide.push(behind(pa, 6.4));
    const bin = new THREE.Group();
    part(bin, Cyl(0.5, 0.4, 1, 8, true), M('#9aa5b1', { side: THREE.DoubleSide }), [0, 0.5, 0]);
    for (let i = 0; i < 5; i++)
      part(bin, jitter(Ico(0.15, 0), 0.04), M('#f8f9fa'), [
        rnd(-0.25, 0.25),
        0.8 + rnd(0, 0.2),
        rnd(-0.25, 0.25),
      ]);
    part(bin, jitter(Ico(0.15, 0), 0.04), M('#f8f9fa'), [0.8, 0.15, 0.3]);
    const bna = off + 2.2;
    put(g, bin, bna, 6.3, 0.9);
    D.hide.push(behind(bna, 6.3));
    const note = mk(Box(0.35, 0.02, 0.35), M('#ffd23f'));
    g.add(note);
    D.ticks.push(t => {
      note.position.set(Math.cos(t * 0.2) * 4, 6 + Math.sin(t * 0.5) * 1.5, Math.sin(t * 0.2) * 4);
      note.rotation.set(Math.sin(t) * 0.6, t * 0.5, Math.cos(t * 0.8) * 0.5);
    });
  },
});
