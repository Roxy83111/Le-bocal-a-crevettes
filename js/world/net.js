/*
 * L'épuisette : retire une crevette du bocal (bouton « Retirer avec l'épuisette » dans sa fiche).
 * L'épuisette plonge, attrape la crevette, ressort de l'eau en s'égouttant, puis disparaît avec elle.
 */
'use strict';

function makeNet() {
  const g = new THREE.Group();
  const metal = M('#9aa5b1', { metalness: 0.6, roughness: 0.3 });
  part(g, new THREE.TorusGeometry(2.2, 0.12, 4, 14), metal, [0, 0, 0], null, [Math.PI / 2, 0, 0]);
  // Manche (incliné vers l'extérieur du bocal)
  const handle = new THREE.Group();
  handle.position.set(2.2, 0, 0);
  handle.rotation.z = -0.35;
  part(handle, Cyl(0.18, 0.2, 26, 6), M('#e9c46a'), [0, 13, 0]);
  part(handle, Cyl(0.26, 0.26, 4, 6), M('#e63946'), [0, 24, 0]);
  g.add(handle);
  // Filet : cône ouvert, semi-transparent, avec un maillage en fil de fer par-dessus
  const netGeo = Cone(2.15, 3.2, 10, true);
  netGeo.rotateX(Math.PI);
  netGeo.translate(0, -1.6, 0);
  g.add(
    new THREE.Mesh(
      netGeo,
      new THREE.MeshStandardMaterial({
        color: '#e8f1f2',
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  g.add(
    new THREE.Mesh(
      netGeo,
      new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.55 }),
    ),
  );
  g.traverse(o => (o.castShadow = false));
  return g;
}

const scoops = [];

function scoopShrimp(s) {
  if (!s || s.removed || s.scooped) return;
  if (s.busy && s.busy.finish) s.busy.finish();
  s.scooped = true;
  s.noCollide = true;
  s.busy = { scoop: true };
  s.status = 'se fait pêcher à l’épuisette';
  s.say(pick(['Hé ! Lâchez-moi !', 'Au revoir les amis…', 'Je reviendrai !', 'C’est injuste !']), 2);
  shrimps.forEach(o => {
    if (o !== s && !o.busy && Math.random() < 0.3)
      o.say(pick(['Nooon !', 'Adieu…', '😢', 'Pas elle !']), 1.6);
  });
  const net = makeNet();
  net.position.set(s.pos.x, WATER_Y + 12, s.pos.z);
  scene.add(net);
  const out = V(s.pos.x, 0, s.pos.z);
  if (out.lengthSq() < 0.01) out.set(1, 0, 0);
  out.normalize();
  scoops.push({ s, net, t: 0, out, splashed: false });
  log(`🥅 ${s.name} est retiré·e du bocal avec l’épuisette.`);
}

Hooks.on('frame', (dt, rdt) => {
  for (let i = scoops.length - 1; i >= 0; i--) {
    const c = scoops[i],
      s = c.s,
      net = c.net;
    c.t += rdt;
    const t = c.t;
    if (t < 1.3) {
      // L'épuisette plonge vers la crevette
      const u = t / 1.3;
      const e = 1 - Math.pow(1 - u, 3);
      net.position.set(s.pos.x, WATER_Y + 12 + (s.pos.y + 0.6 - WATER_Y - 12) * e, s.pos.z);
      if (!c.splashed && net.position.y < WATER_Y) {
        c.splashed = true;
        for (let k = 0; k < 6; k++)
          emit(V(s.pos.x, WATER_Y, s.pos.z), '💦', {
            v: V(rnd(-1.5, 1.5), rnd(1, 2), rnd(-1.5, 1.5)),
            life: 1,
          });
      }
    } else if (t < 3.6) {
      // Remontée et sortie du bocal, la crevette dans le filet
      const u = (t - 1.3) / 2.3;
      const e = u * u * (3 - 2 * u);
      const y0 = c.y0 ?? (c.y0 = net.position.y);
      net.position.set(
        c.out.x * (c.x0 ?? (c.x0 = Math.hypot(s.pos.x, s.pos.z))) + c.out.x * e * 14,
        y0 + (WATER_Y + 9 - y0) * e,
        c.out.z * c.x0 + c.out.z * e * 14,
      );
      net.rotation.z = -c.out.x * e * 0.4;
      net.rotation.x = c.out.z * e * 0.4;
      s.pos.copy(net.position).add(V(0, -1.4, 0));
      s.root.rotation.z = Math.sin(t * 18) * 0.5;
      if (net.position.y > WATER_Y && Math.random() < 0.3)
        emit(net.position.clone().add(V(rnd(-1, 1), -2, rnd(-1, 1))), '💧', { v: V(0, -3, 0), life: 0.6 });
    } else if (t < 4.3) {
      // Disparition
      const k = Math.max(0.001, 1 - (t - 3.6) / 0.7);
      net.scale.setScalar(k);
      s.root.scale.setScalar(s.size * k);
      s.pos.copy(net.position).add(V(0, -1.4 * k, 0));
    } else {
      scene.remove(net);
      disposeObj(net);
      removeShrimp(s);
      scoops.splice(i, 1);
    }
  }
});
