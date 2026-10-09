/*
 * La classe Shrimp : déplacement, orientation, animation du corps et comportement libre
 * (balade, sieste, picorer, regarder dehors, manger).
 */
'use strict';
const shrimps = [];
const _a = V(),
  _b = V(),
  _m = new THREE.Matrix4(),
  _q = new THREE.Quaternion();
class Shrimp {
  // o.saved : fiche venant d'une sauvegarde (js/ui/save.js) → mêmes nom, couleur, caractère, chapeau…
  constructor(o = {}) {
    const L = o.saved || null;
    this.loaded = L;
    this.name = o.name || (L && L.name) || nextName();
    this.color = o.color || (L && L.color) || pick(COLORS);
    this.trait = (L && L.trait) || pick(TRAITS);
    Object.assign(this, buildShrimp(this.color));
    this.size = (L && L.size) || rnd(0.68, 0.88);
    this.root.scale.setScalar(this.size);
    this.root.userData.shrimp = this;
    this.pos = this.root.position;
    this.pos.copy(o.pos || randInside());
    this.vel = V();
    this.target = this.pos.clone();
    this.speed = rnd(1.3, 1.8);
    this.speedMul = 1;
    this.dist = 0;
    this.arrived = true;
    this.pose = { flip: 0, roll: 0, spin: 0, hop: 0, curl: 0, ant: 0 };
    this.rot = { flip: 0, roll: 0, spin: 0, hop: 0, curl: 0 };
    this.flipT = 0;
    this.flipDur = 1;
    this.twirlT = 0;
    this.twirlDur = 1;
    this.phase = rnd(0, 6.28);
    this.swim = 0;
    this.wanderT = rnd(0, 2);
    this.busy = null;
    this.faceObj = null;
    this.mode = 'swim';
    this.status = 'se balade';
    this.voice = 900 * (0.62 / this.size);
    this.friends = {}; // affinité : nom → score (monte quand on s'entend bien, baisse lors des disputes)
    this.inter = (L && L.inter) || 0;
    this.temp = [];
    this.food = null;
    this.bub = null;
    this._hp = V();
    this.hatKind = null;
    this.hat = null;
    if (L ? L.hat : Math.random() < 0.5) {
      this.hatKind = L ? L.hat : pick(HATS);
      this.hat = makeHat(this.hatKind);
      this.model.add(this.hat);
    }
    this.baseHat = this.hatKind; // chapeau d'origine (sauvegardé), sans costume saisonnier
    this.root.rotation.y = rnd(0, 6.28);
    scene.add(this.root);
    this.root.traverse(c => {
      if (c.isMesh) {
        c.castShadow = true;
      }
    });
    this.tag = document.createElement('div');
    this.tag.className = 'tag';
    this.tag.textContent = this.name;
    this.tag.hidden = true;
    labels.appendChild(this.tag);
    shrimps.push(this);
    Hooks.emit('shrimp:create', this);
  }
  headPos() {
    return this.root.localToWorld(this._hp.set(0, 1.05, 0.45));
  }
  say(text, dur = 2.6) {
    if (this.bub) this.bub.life = 0;
    this.bub = speakAt(() => this.headPos(), text, dur, 'say', this);
    Sound.chirp(this.voice);
  }
  goTo(v, mul) {
    this.target.copy(v);
    clampInside(this.target, 1.1);
    if (mul != null) this.speedMul = mul;
  }
  flip(d = 1) {
    this.flipT = d;
    this.flipDur = d;
  }
  twirl(d = 1) {
    this.twirlT = d;
    this.twirlDur = d;
  }
  addTemp(o) {
    this.model.add(o);
    this.temp.push(o);
    if (this.hat && o.userData.isHat !== false && o.position.y > 0.2) this.hat.visible = false;
  }
  cancelFree() {
    if (this.food) {
      this.food.claims--;
      this.food = null;
    }
    this.faceObj = null;
    this.mode = 'busy';
    const P = this.pose;
    for (const k in P) P[k] = 0;
  }
  release() {
    this.busy = null;
    this.faceObj = null;
    this.speedMul = 1;
    this.mode = 'swim';
    this.wanderT = rnd(0.5, 2);
    this.status = 'se balade';
    const P = this.pose;
    for (const k in P) P[k] = 0;
    const r = this.rot;
    r.flip = wrapA(r.flip);
    r.spin = wrapA(r.spin);
    r.roll = wrapA(r.roll);
    this.temp.forEach(o => {
      this.model.remove(o);
      disposeObj(o);
    });
    this.temp = [];
    this.inst = null;
    if (this.hat) this.hat.visible = true;
    this.eyes.forEach(e => e.scale.setScalar(1));
    this.root.visible = true;
  }
  think(dt, t) {
    const P = this.pose;
    P.flip = P.roll = P.hop = P.curl = P.spin = P.ant = 0;
    if (this.food) {
      if (this.food.gone) {
        this.food = null;
        this.wanderT = 0;
      } else {
        this.target.copy(this.food.mesh.position);
        this.speedMul = 1.7;
        if (this.pos.distanceTo(this.food.mesh.position) < 0.85) {
          eatPellet(this.food);
          this.food = null;
          this.say(pick(MIAM), 1.5);
          this.wanderT = rnd(1, 2);
          this.mode = 'hover';
          this.status = 'digère';
        }
        return;
      }
    }
    if (pellets.length && Math.random() < dt * 0.9) {
      const p = nearestPellet(this.pos);
      if (p) {
        this.food = p;
        p.claims++;
        this.status = 'fonce sur un granulé';
        this.faceObj = null;
        return;
      }
    }
    this.wanderT -= dt;
    if (this.mode === 'graze' && this.arrived) P.flip = 0.55 + Math.sin(t * 9 + this.phase) * 0.15;
    if (this.mode === 'sleep') {
      P.curl = -0.55;
      P.hop = -0.05;
      if (Math.random() < dt * 0.5) emit(this.headPos(), 'z', { cls: 'zz', v: V(0.2, 0.5, 0) });
    }
    if (this.mode === 'look' && this.arrived && !this.lookSaid) {
      this.lookSaid = true;
      if (Math.random() < 0.5)
        this.say(
          pick([
            '👀 Il y a quelqu’un ?',
            'Coucou le géant !',
            'Tu as des granulés ?',
            'On se voit à travers le verre…',
          ]),
          2.4,
        );
    }
    if (this.wanderT <= 0) {
      this.faceObj = null;
      this.lookSaid = false;
      const r = Math.random();
      if (r < (isNight() ? 0.35 : 0.08)) {
        this.mode = 'sleep';
        this.status = 'fait la sieste';
        const p = this.pos.clone();
        p.y = YMIN;
        this.goTo(p, 0.4);
        this.wanderT = rnd(6, 12);
      } else if (r < 0.5) {
        this.mode = 'swim';
        this.status = pick(['se balade', 'nage sans but', 'explore le bocal', 'fait des longueurs']);
        this.goTo(randInside(), rnd(0.5, 1));
        this.wanderT = rnd(3, 7);
      } else if (r < 0.78) {
        this.mode = 'graze';
        this.status = 'picore le sable';
        const p = randInside();
        p.y = YMIN;
        this.goTo(p, 0.7);
        this.wanderT = rnd(5, 9);
      } else if (r < 0.9) {
        this.mode = 'look';
        this.status = 'regarde dehors';
        const a = Math.atan2(camera.position.z, camera.position.x) + rnd(-0.6, 0.6),
          y = rnd(3, 8),
          rr = rAt(y) - 1.3;
        this.goTo(V(Math.cos(a) * rr, y, Math.sin(a) * rr), 0.8);
        this.faceObj = camera.position;
        this.wanderT = rnd(4, 7);
      } else {
        this.mode = 'hover';
        this.status = pick(['réfléchit', 'contemple une bulle', 'rêvasse']);
        this.wanderT = rnd(3, 5);
      }
    }
  }
  update(dt, t) {
    // Prise dans l'épuisette (js/world/net.js) : elle ne fait plus que gigoter.
    if (this.scooped) {
      this.model.rotation.x = Math.sin(t * 20) * 0.4;
      return;
    }
    if (!this.busy) this.think(dt, t);
    const to = _a.subVectors(this.target, this.pos);
    const d = to.length();
    this.dist = d;
    const sp = this.speed * this.speedMul * Math.min(1, d / 1.2);
    if (d > 1e-4) to.multiplyScalar(sp / d);
    else to.set(0, 0, 0);
    if (this.sep) to.add(this.sep);
    this.vel.lerp(to, 1 - Math.exp(-dt * 3.2));
    this.pos.addScaledVector(this.vel, dt);
    clampInside(this.pos, 1.05);
    this.arrived = d < 0.3;
    let dir = null;
    if (this.faceObj && d < 1.5) {
      const f = this.faceObj.isVector3 ? this.faceObj : this.faceObj.pos;
      dir = _b.subVectors(f, this.pos);
    } else if (this.vel.lengthSq() > 0.02) dir = _b.copy(this.vel);
    if (dir) {
      const h = Math.hypot(dir.x, dir.z);
      if (h > 0.01) {
        dir.y = clamp(dir.y, -h * 0.7, h * 0.7);
        _m.lookAt(dir, ZERO, UP);
        _q.setFromRotationMatrix(_m);
        this.root.quaternion.slerp(_q, 1 - Math.exp(-dt * 4));
      }
    }
    const k = 1 - Math.exp(-dt * 6);
    for (const key in this.rot) this.rot[key] += (this.pose[key] - this.rot[key]) * k;
    let fx = 0,
      sx = 0;
    if (this.flipT > 0) {
      this.flipT = Math.max(0, this.flipT - dt);
      const u = 1 - this.flipT / this.flipDur;
      fx = -(u * u * (3 - 2 * u)) * Math.PI * 2;
    }
    if (this.twirlT > 0) {
      this.twirlT = Math.max(0, this.twirlT - dt);
      const u = 1 - this.twirlT / this.twirlDur;
      sx = u * u * (3 - 2 * u) * Math.PI * 2;
    }
    const v = this.vel.length();
    this.swim += dt * (3 + v * 5);
    this.model.rotation.set(this.rot.flip + fx, this.rot.spin + sx, this.rot.roll);
    this.model.position.y = Math.sin(t * 1.7 + this.phase) * 0.06 + this.rot.hop;
    const wig = 0.05 + Math.min(v, 2) * 0.05;
    for (let i = 0; i < this.segs.length; i++)
      this.segs[i].rotation.x =
        -0.2 + this.rot.curl * (0.5 + i * 0.12) + Math.sin(this.swim * 1.3 - i * 0.8) * wig;
    for (let i = 0; i < this.swims.length; i++)
      this.swims[i].rotation.x = Math.sin(this.swim * 3 + i * 0.9) * 0.6;
    for (let i = 0; i < this.legs.length; i++) this.legs[i].rotation.x = Math.sin(this.swim * 2 + i) * 0.25;
    const aw = this.pose.ant ? Math.sin(t * 18) * 0.25 : Math.sin(t * 1.3 + this.phase) * 0.1;
    this.ants[0].rotation.x = -0.35 - aw;
    this.ants[1].rotation.x = -0.35 + aw;
  }
}
function separation() {
  for (const s of shrimps) s.sep = null;
  for (let i = 0; i < shrimps.length; i++)
    for (let j = i + 1; j < shrimps.length; j++) {
      const a = shrimps[i],
        b = shrimps[j];
      if (a.busy && b.busy) continue;
      const dx = a.pos.x - b.pos.x,
        dy = a.pos.y - b.pos.y,
        dz = a.pos.z - b.pos.z,
        d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 1.7 && d2 > 1e-6) {
        const d = Math.sqrt(d2),
          f = ((1.3 - d) * 1.8) / d;
        if (!a.busy) {
          a.sep = a.sep || V();
          a.sep.x += dx * f;
          a.sep.y += dy * f;
          a.sep.z += dz * f;
        }
        if (!b.busy) {
          b.sep = b.sep || V();
          b.sep.x -= dx * f;
          b.sep.y -= dy * f;
          b.sep.z -= dz * f;
        }
      }
    }
}

/*
 * Retire définitivement une crevette du bocal (épuisette, meurtre…).
 * Si elle participe à une activité, celle-ci est arrêtée, sauf `exceptAct`
 * (l'activité qui demande le retrait et qui continue sans elle).
 */
function removeShrimp(s, exceptAct = null) {
  const i = shrimps.indexOf(s);
  if (i < 0) return;
  if (s.busy && s.busy !== exceptAct && s.busy.finish) s.busy.finish();
  if (s.food) s.food.claims--;
  shrimps.splice(i, 1);
  scene.remove(s.root);
  s.temp = [];
  disposeObj(s.root);
  s.tag.remove();
  if (s.bub) s.bub.life = 0;
  if (cam.follow === s) follow(null);
  if (hovered === s) hovered = null;
  s.removed = true;
  renderList();
  Hooks.emit('shrimp:remove', s);
}

// Change le nom d'une crevette (fiche « Renommer »).
function renameShrimp(s, name) {
  name = name.trim().slice(0, 28);
  if (!name || name === s.name) return;
  const old = s.name;
  s.name = name;
  s.tag.textContent = name;
  for (const o of shrimps) {
    if (o.friends[old] != null) {
      o.friends[name] = o.friends[old];
      delete o.friends[old];
    }
  }
  log(`✏️ ${old} s’appelle désormais ${name}.`);
  Hooks.emit('shrimp:rename', s, old);
  renderList();
}
