/*
 * Moteur des activités : une activité réunit des crevettes, attend qu’elles soient en place,
 * puis joue sa chorégraphie jusqu’à la fin. Toutes les activités (à deux ou en groupe) passent par Act.
 */
'use strict';
const acts = [];
const at = (A, t, time, fn) => {
  const k = '@' + time;
  if (t >= time && !A.data[k]) {
    A.data[k] = 1;
    fn();
  }
};
class Act {
  constructor(def, members, group) {
    this.def = def;
    this.m = members;
    this.group = group;
    this.t = 0;
    this.data = {};
    this.props = [];
    this.p0 = def.noGather ? 0 : null;
    this.music = false;
    members.forEach(s => {
      s.cancelFree();
      s.busy = this;
      s.status = def.status;
      s.inter++;
    });
    if (!group) {
      const [a, b] = members;
      a.friends[b.name] = (a.friends[b.name] || 0) + 1;
      b.friends[a.name] = (b.friends[a.name] || 0) + 1;
    }
    acts.push(this);
    def.start(this);
  }
  prop(o) {
    scene.add(o);
    this.props.push(o);
    return o;
  }
  step(dt) {
    if (this.done) return;
    this.t += dt;
    if (this.p0 === null) {
      const arr = this.m.filter(s => s.arrived).length;
      if (arr >= this.m.length * (this.def.gatherFrac || 1) || this.t > (this.def.gatherMax || 8))
        this.p0 = this.t;
      else return;
    }
    let done = false;
    try {
      done = this.def.play(this, this.t - this.p0, dt);
    } catch (e) {
      console.error(e);
      done = true;
    }
    if (done) this.finish();
  }
  finish() {
    if (this.done) return;
    this.done = true;
    try {
      this.def.end && this.def.end(this);
    } catch (e) {
      console.error(e);
    }
    this.props.forEach(p => {
      scene.remove(p);
      disposeObj(p);
    });
    this.m.forEach(s => {
      if (s.busy === this) s.release();
    });
    const i = acts.indexOf(this);
    if (i >= 0) acts.splice(i, 1);
    if (this.music) Sound.stopMusic();
    Hooks.emit('act:end', this);
  }
}
function pairStart(A, def) {
  const [a, b] = A.m;
  const mid = a.pos.clone().add(b.pos).multiplyScalar(0.5);
  clampInside(mid, 2.3);
  const dir = b.pos.clone().sub(a.pos);
  dir.y = 0;
  if (dir.lengthSq() < 0.01) dir.set(1, 0, 0);
  dir.normalize();
  A.data.mid = mid;
  A.data.dir = dir;
  const gap = def.gap || 0.9;
  a.goTo(mid.clone().addScaledVector(dir, -gap), 1.4);
  b.goTo(mid.clone().addScaledVector(dir, gap), 1.4);
  a.faceObj = b;
  b.faceObj = a;
  if (def.init) def.init(A);
  log(def.log(a.name, b.name), 'pair');
}

// Liste des activités de groupe : chaque fichier de js/activities/groups/ y ajoute la sienne.
const GROUPS = [];
