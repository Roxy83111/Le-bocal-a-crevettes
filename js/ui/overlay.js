/*
 * Couche HTML au-dessus de la 3D : bulles de dialogue, émotes flottantes et étiquettes de noms.
 */
'use strict';
const labels = $('labels');
const bubbles = [],
  floaters = [];
const _pp = V();
function proj(v) {
  _pp.copy(v).project(camera);
  if (_pp.z > 1 || _pp.z < -1) return null;
  return [((_pp.x + 1) / 2) * W, ((1 - _pp.y) / 2) * H];
}
function speakAt(get, text, dur = 2.8, cls = 'say', owner = null) {
  const el = document.createElement('div');
  el.className = cls;
  el.textContent = text;
  labels.appendChild(el);
  const b = { el, get, life: dur, owner };
  bubbles.push(b);
  return b;
}
function emit(pos, text, o = {}) {
  if (floaters.length > 90) return;
  const el = document.createElement('div');
  el.className = 'fl ' + (o.cls || '');
  el.textContent = text;
  if (o.color) el.style.color = o.color;
  labels.appendChild(el);
  const life = o.life || 1.8;
  floaters.push({
    el,
    p: pos.clone(),
    v: o.v ? o.v.clone() : V(rnd(-0.3, 0.3), rnd(0.6, 1.1), rnd(-0.3, 0.3)),
    life,
    max: life,
  });
}
function overlay(dt) {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.life -= dt;
    if (b.life <= 0) {
      b.el.remove();
      bubbles.splice(i, 1);
      if (b.owner && b.owner.bub === b) b.owner.bub = null;
      continue;
    }
    const sp = proj(b.get());
    if (!sp) {
      b.el.hidden = true;
      continue;
    }
    b.el.hidden = false;
    b.el.style.transform = `translate(${sp[0].toFixed(1)}px,${(sp[1] - 10).toFixed(1)}px) translate(-50%,-100%)`;
    b.el.style.opacity = Math.min(1, b.life * 3);
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.life -= dt;
    if (f.life <= 0) {
      f.el.remove();
      floaters.splice(i, 1);
      continue;
    }
    f.p.addScaledVector(f.v, dt);
    const sp = proj(f.p);
    if (!sp) {
      f.el.hidden = true;
      continue;
    }
    f.el.hidden = false;
    f.el.style.transform = `translate(${sp[0].toFixed(1)}px,${sp[1].toFixed(1)}px) translate(-50%,-50%)`;
    f.el.style.opacity = Math.min(1, (f.life / f.max) * 2);
  }
  for (const s of shrimps) {
    const show = showNames || s === hovered || s === cam.follow;
    s.tag.hidden = !show;
    if (!show) continue;
    const sp = proj(_tp.copy(s.pos).add(_tagOff));
    if (!sp) {
      s.tag.hidden = true;
      continue;
    }
    s.tag.style.transform = `translate(${sp[0].toFixed(1)}px,${sp[1].toFixed(1)}px) translate(-50%,0)`;
    s.tag.classList.toggle('me', s === cam.follow);
  }
}
const _tp = V(),
  _tagOff = V(0, -0.75, 0);
