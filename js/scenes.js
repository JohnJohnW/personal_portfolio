// The four figures: a robot arm, a bee, a hummingbird and a pair of hands.
// Each one is a signed distance field built by hand and raymarched in a
// fragment shader. A scene supplies prep(), map() and tone(); the camera,
// marcher and lighting are shared.
//
// Joint positions and rotations are worked out here in js and written into
// the shader as plain numbers. Leaving that maths in GLSL made the shaders
// take seconds to compile.

const RAD = Math.PI / 180;

const num = (v) => {
  const s = v.toFixed(4).replace(/0+$/, "");
  return s.endsWith(".") ? s + "0" : s;
};
const v3 = (a) => `vec3(${num(a[0])}, ${num(a[1])}, ${num(a[2])})`;
// cos and sin of an angle, for the rotation helpers in the shader
const cs = (deg) => `vec2(${num(Math.cos(deg * RAD))}, ${num(Math.sin(deg * RAD))})`;

// A run of tapered segments bending in the xy plane (fingers, legs), written
// out as nested cone() calls. Angles are in degrees from the +x axis.
function limb(start, angles, lengths, radii, blend) {
  let at = start;
  const parts = angles.map((a, i) => {
    const to = [at[0] + Math.cos(a * RAD) * lengths[i], at[1] + Math.sin(a * RAD) * lengths[i], at[2]];
    const part = `cone(p, ${v3(at)}, ${v3(to)}, ${num(radii[i])}, ${num(radii[i + 1])})`;
    at = to;
    return part;
  });
  return parts.reduce((all, part) => (blend ? `smin(${all}, ${part}, ${num(blend)})` : `min(${all}, ${part})`));
}

export const HEAD = `
precision highp float;
uniform vec2 uRes;
uniform float uAspect, uFit, uTime, uAmt;
uniform vec2 uLook;
uniform vec4 uPose;
uniform vec3 uObj[3];

float sph(vec3 p, float r) { return length(p) - r; }

float ell(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float cone(vec3 p, vec3 a, vec3 b, float ra, float rb) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - mix(ra, rb, h);
}

float cyl(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// rotate v by the angle whose (cos, sin) is r, and the other way
vec2 turn(vec2 v, vec2 r) { return vec2(r.x * v.x - r.y * v.y, r.y * v.x + r.x * v.y); }
vec2 back(vec2 v, vec2 r) { return vec2(r.x * v.x + r.y * v.y, r.x * v.y - r.y * v.x); }

vec2 pick(vec2 a, vec2 b) { return a.x < b.x ? a : b; }
`;

export const TAIL = `
void main() {
  prep();
  vec2 f = gl_FragCoord.xy / uRes;
  vec2 uv = (f * 2.0 - 1.0) * uFit;
  uv.x *= uAspect;
  float dist = HALF * 4.0;
  float yaw = YAW + uLook.x;
  float pit = PITCH + uLook.y;
  vec3 ro = TARGET + dist * vec3(sin(yaw) * cos(pit), sin(pit), cos(yaw) * cos(pit));
  vec3 fw = normalize(TARGET - ro);
  vec3 rt = normalize(cross(fw, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(rt, fw);
#ifdef FLAT
  // No perspective, so with a level camera anything level in the scene is
  // level on screen. The view is also nudged by part of a row so that the
  // height FLAT falls exactly between two rows of characters, and whatever
  // stands on it prints with a clean bottom edge.
  float at = ((FLAT - TARGET.y) / (HALF * uFit) + 1.0) * 0.5 * uRes.y;
  uv.y += (at - 2.0 * floor(at * 0.5)) * 2.0 * uFit / uRes.y;
  ro += (uv.x * rt + uv.y * up) * HALF;
  vec3 rd = normalize(fw + vec3(0.0, 0.0001, 0.0));
#else
  vec3 rd = normalize(uv.x * rt + uv.y * up + 4.0 * fw);
#endif

  // Most rays never come near the figure. Clip each one to the bounding box
  // and only march the stretch inside it.
  vec3 inv = 1.0 / rd;
  vec3 ta = (BMIN - ro) * inv;
  vec3 tb = (BMAX - ro) * inv;
  vec3 lo = min(ta, tb);
  vec3 hi = max(ta, tb);
  float t = max(max(lo.x, lo.y), max(lo.z, 0.0));
  float tEnd = min(min(hi.x, hi.y), hi.z);

  vec2 h = vec2(1.0, 0.0);
  float hit = 0.0;
  if (tEnd > t) {
    for (int i = 0; i < 56; i++) {
      h = map(ro + rd * t);
      if (h.x < 0.002) { hit = 1.0; break; }
      t += h.x * 0.9;
      if (t > tEnd) break;
    }
  }

  float v = 0.0;
  if (hit > 0.5) {
    vec3 p = ro + rd * t;
    // forward differences against the distance the march ended on
    vec3 n = normalize(vec3(map(p + vec3(0.004, 0.0, 0.0)).x, map(p + vec3(0.0, 0.004, 0.0)).x, map(p + vec3(0.0, 0.0, 0.004)).x) - h.x);
    vec3 l = normalize(LIGHT.x * rt + LIGHT.y * up - LIGHT.z * fw);
    float dif = max(dot(n, l), 0.0);
    // a second, weaker light from the other side keeps the far half readable
    float fill = max(dot(n, normalize(0.7 * rt + 0.2 * up - 0.6 * fw)), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    float alb = tone(p, h.y);
    v = alb * (0.1 + 0.72 * dif + 0.2 * fill + 0.12 * (0.5 + 0.5 * n.y)) + RIM * rim * alb;
  }
#ifdef FADE_BASE
  v *= smoothstep(0.0, 0.24, f.y);
#endif
#ifdef FADE_SIDES
  v *= smoothstep(0.0, 0.16, f.x) * smoothstep(1.0, 0.84, f.x);
#endif
  gl_FragColor = vec4(vec3(clamp(v, 0.0, 1.0)), 1.0);
}
`;

// The robot arm: a pedestal, two links and a gripper, working in the xy plane,
// with a bench under it and three things on the bench to pick up.
// uPose is (shoulder angle, elbow angle, how far the gripper is open, how far
// the bench runs either side of the shoulder).
// uObj holds x, y and rotation for each of the three things.
const UPPER = 1.15;
const FORE = 1.0;
const SHOULDER = [0.2, -0.72, 0];
const FLOOR = -1.66;
// shoulder to elbow is one link; elbow to fingertips is the other, since the
// hand is fixed in line with the forearm
const HAND = FORE + 0.38;
// the mounting plate and the pedestal standing on it
const PLATE = 0.75;
const POST = 0.3;

// Framed so the arm fits standing straight up with something in its hand,
// and seen level and without perspective so the bench prints as one line.
const armCam = { half: 2.0, target: [SHOULDER[0], 0.11, 0], yaw: 0.3, pitch: 0, flat: true };

// r: size, mass, bounce: how much speed survives a landing, grip: how hard the floor holds on
const THINGS = [
  { r: 0.17, mass: 9, bounce: 0.04, grip: 0.9, square: true, x: 1.6 },
  { r: 0.15, mass: 0.35, bounce: 0.8, grip: 0.1, x: -1.2 },
  { r: 0.16, mass: 1.6, bounce: 0.42, grip: 0.28, x: 1.2 },
];

const arm = `
#define HALF ${num(armCam.half)}
#define TARGET ${v3(armCam.target)}
#define YAW ${num(armCam.yaw)}
#define PITCH ${num(armCam.pitch)}
#define FLAT ${num(FLOOR)}
#define BMIN vec3(-3.1, -1.9, -0.62)
#define BMAX vec3(3.1, 2.3, 0.62)
#define LIGHT vec3(-0.5, 0.65, 0.6)
#define RIM 0.3

vec3 elbow;
vec3 wrist;
vec2 reach;
vec2 across;
vec2 tumble;
vec2 roll;
float jaw;
float row;

void prep() {
  vec3 s = ${v3(SHOULDER)};
  elbow = s + vec3(cos(uPose.x), sin(uPose.x), 0.0) * ${num(UPPER)};
  reach = vec2(cos(uPose.x + uPose.y), sin(uPose.x + uPose.y));
  wrist = elbow + vec3(reach, 0.0) * ${num(FORE)};
  across = vec2(-reach.y, reach.x);
  jaw = 0.05 + 0.15 * uPose.z;
  // how tall one row of characters is in the scene
  row = 4.0 * HALF * uFit / uRes.y;
  tumble = vec2(cos(uObj[0].z), sin(uObj[0].z));
  roll = vec2(cos(uObj[2].z), sin(uObj[2].z));
}

// a drum lying along z, for the joints
float drum(vec3 p, float r, float h) {
  vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - 0.015;
}

float box(vec3 p, vec3 h, float r) {
  vec3 d = abs(p) - h;
  return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0) - r;
}

vec2 map(vec3 p) {
  vec3 s = ${v3(SHOULDER)};

  // mounting plate, pedestal and turret
  float base = box(p - vec3(s.x, ${num(FLOOR)} + row, 0.0), vec3(${num(PLATE - 0.05)}, row, 0.2), 0.0);
  base = min(base, cyl(p - vec3(s.x, -1.44, 0.0), 0.1, 0.4));
  base = smin(base, cyl(p - vec3(s.x, -1.12, 0.0), 0.24, 0.26), 0.06);

  // links, each with a rib along the top so they do not read as plain tubes
  float links = cone(p, s, elbow, 0.13, 0.105);
  links = min(links, cone(p + vec3(0.0, 0.0, 0.17), s, elbow, 0.035, 0.035));
  links = min(links, cone(p, elbow, wrist, 0.095, 0.075));

  // joints
  float joints = drum(p - s, 0.25, 0.24);
  joints = min(joints, drum(p - elbow, 0.19, 0.2));
  joints = min(joints, drum(p - wrist, 0.125, 0.14));

  // gripper: a palm bar and two fingers
  vec3 hand = wrist + vec3(reach, 0.0) * 0.16;
  vec3 side = vec3(across, 0.0);
  float grip = cone(p, hand - side * 0.23, hand + side * 0.23, 0.045, 0.045);
  vec3 tip = hand + vec3(reach, 0.0) * 0.3;
  grip = min(grip, cone(p, hand + side * (jaw + 0.03), tip + side * jaw, 0.04, 0.026));
  grip = min(grip, cone(p, hand - side * (jaw + 0.03), tip - side * jaw, 0.04, 0.026));

  // the bench is exactly one row of characters deep, with a lip at each end
  float ground = box(p - vec3(s.x, ${num(FLOOR)} - row * 0.5, 0.0), vec3(uPose.w + 0.07, row * 0.5, 0.06), 0.0);
  ground = min(ground, box(vec3(abs(p.x - s.x) - uPose.w - 0.04, p.y - ${num(FLOOR)}, p.z), vec3(0.03, row, 0.06), 0.0));

  // a steel block, a rubber ball, and a ring with a bar across it so you can see it roll
  vec3 q = p - vec3(uObj[0].xy, 0.0);
  q.xy = back(q.xy, tumble);
  float block = box(q, vec3(0.14), 0.03);
  float ball = sph(p - vec3(uObj[1].xy, 0.0), 0.15);
  vec3 w = p - vec3(uObj[2].xy, 0.0);
  w.xy = back(w.xy, roll);
  float ring = min(length(vec2(length(w.xy) - 0.115, w.z)) - 0.045, box(w, vec3(0.11, 0.028, 0.028), 0.0));

  vec2 r = vec2(base, 1.0);
  r = pick(r, vec2(links, 2.0));
  r = pick(r, vec2(joints, 3.0));
  r = pick(r, vec2(grip, 4.0));
  r = pick(r, vec2(ground, 5.0));
  r = pick(r, vec2(block, 6.0));
  r = pick(r, vec2(ball, 7.0));
  return pick(r, vec2(ring, 8.0));
}

float tone(vec3 p, float m) {
  if (m > 7.5) return 0.86;
  if (m > 6.5) return 0.7;
  if (m > 5.5) return 1.0;
  if (m > 4.5) return 0.28;
  if (m > 3.5) return 0.98;
  if (m > 2.5) return 0.95;
  if (m > 1.5) return 0.8;
  return 0.62;
}
`;

// The arm runs on two numbers: phi, the direction of the hand from the
// shoulder measured from straight up, and b, the elbow angle, which sets how
// far out the hand is. Each has its own motor with a top speed, so no joint
// can jump. Changing sides means swinging over the top and straightening out
// on the way, never cutting through the base.
const FULL = UPPER + HAND;
// as far as it reaches on purpose, a little short of dead straight
const REACH = FULL - 0.12;
// as close in as the hand comes, so the forearm never folds onto the upper arm
const NEAR = 1.05;
// the lowest the hand goes, measured from the shoulder: low enough for the
// fingers to close round something on the bench without going through it
const DROP = FLOOR + 0.24 - SHOULDER[1];
// the hand keeps this far inside the frame, to leave room for what it carries
const PAD = 0.36;
// changing sides counts as done once the elbow is bent this far the new way
const DONE = 0.5;
const GRAVITY = 11;

const within = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// the elbow angle that puts the hand a given distance out, and the distance a given angle puts it at
const flex = (d) => Math.acos(within((d * d - UPPER * UPPER - HAND * HAND) / (2 * UPPER * HAND), -1, 1));
const span = (b) => Math.hypot(UPPER + HAND * Math.cos(b), HAND * Math.sin(b));
// how far round from vertical the hand can go, at a given distance, before it meets the floor
const fan = (d) => Math.acos(within(DROP / d, -1, 1));
// half the width of a square frame, measured along the plane the arm works
// in, which the camera sees slightly from one side
const ACROSS = armCam.half / Math.cos(armCam.yaw);

// how long the arm can be in a given direction before the hand leaves the frame or meets the floor
function room(wall, phi) {
  const x = Math.abs(Math.sin(phi));
  const y = Math.cos(phi);
  let r = FULL;
  if (x * r > wall) r = wall / x;
  if (y * r < DROP) r = DROP / y;
  return r;
}

// Move s[key] towards a goal on a critically damped spring, the way a motor
// would. top is the fastest it ever turns and cap the fastest it may turn
// just now. It brakes harder than it pulls away, but neither is instant, so
// the speed never steps.
function chase(s, key, goal, stiffness, top, dt, cap = top) {
  const v = s[key + "V"] || 0;
  const aim = within(v + (stiffness * (goal - s[key]) - 2 * Math.sqrt(stiffness) * v) * dt, -cap, cap);
  const most = (Math.abs(aim) > Math.abs(v) ? 6 : 14) * top * dt;
  s[key + "V"] = v + within(aim - v, -most, most);
  s[key] += s[key + "V"] * dt;
}

// One step of the world the arm works in: gravity, the bench, the pedestal,
// and the things knocking into each other. A heavy thing keeps almost none of
// its speed when it lands. A light one keeps most of it.
function settle(s, dt) {
  for (const o of s.things) {
    if (o === s.held) continue;
    const k = o.kind;
    o.vy -= GRAVITY * dt;
    o.x += o.vx * dt;
    o.y += o.vy * dt;
    o.a += o.w * dt;

    // a square stands taller on a corner than on a face
    const rest = FLOOR + (k.square ? k.r * (Math.abs(Math.cos(o.a)) + Math.abs(Math.sin(o.a))) : k.r);
    if (o.y < rest) {
      o.y = rest;
      if (o.vy < -0.8) s.hits.push([o.x, FLOOR, k.mass, -o.vy]);
      o.vy = o.vy < -0.5 ? -o.vy * k.bounce : 0;
      o.vx *= Math.exp(-k.grip * 7 * dt);
      if (k.square) {
        // drop onto the nearest face
        const flat = Math.round(o.a / (Math.PI / 2)) * (Math.PI / 2);
        o.w = (o.w + (flat - o.a) * 70 * dt) * Math.exp(-16 * dt);
      } else {
        o.w = -o.vx / k.r;
      }
    }

    // the pedestal is a post with a round top, and things glance off it
    const px = o.x - SHOULDER[0] || 1e-3;
    const py = o.y - within(o.y, FLOOR, SHOULDER[1]);
    const d = Math.hypot(px, py);
    if (d < POST + k.r) {
      const nx = px / d;
      const ny = py / d;
      o.x += nx * (POST + k.r - d);
      o.y += ny * (POST + k.r - d);
      const into = o.vx * nx + o.vy * ny;
      if (into < 0) {
        o.vx -= (1 + k.bounce) * into * nx;
        o.vy -= (1 + k.bounce) * into * ny;
      }
    }
    // nothing comes to rest on the mounting plate, where the hand cannot reach
    if (Math.abs(px) < PLATE + k.r && o.y < rest + 0.05) o.vx += Math.sign(px) * 9 * dt;
  }

  for (let i = 0; i < s.things.length; i++) {
    for (let j = i + 1; j < s.things.length; j++) {
      const a = s.things[i];
      const b = s.things[j];
      if (a === s.held || b === s.held) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-3;
      const gap = a.kind.r + b.kind.r - d;
      if (gap <= 0) continue;
      const nx = dx / d;
      const ny = dy / d;
      const ia = 1 / a.kind.mass;
      const ib = 1 / b.kind.mass;
      // the lighter one does most of the moving
      a.x -= (nx * gap * ia) / (ia + ib);
      a.y -= (ny * gap * ia) / (ia + ib);
      b.x += (nx * gap * ib) / (ia + ib);
      b.y += (ny * gap * ib) / (ia + ib);
      const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (closing >= 0) continue;
      const push = (-(1 + Math.min(a.kind.bounce, b.kind.bounce)) * closing) / (ia + ib);
      a.vx -= push * ia * nx;
      a.vy -= push * ia * ny;
      b.vx += push * ib * nx;
      b.vy += push * ib * ny;
    }
  }

  // The bench and the lips at either end of it are checked last, so that
  // being shoved by a neighbour is no way through them.
  for (const o of s.things) {
    if (o === s.held) continue;
    o.y = Math.max(o.y, FLOOR + o.kind.r);
    const off = o.x - SHOULDER[0];
    const edge = s.bench - o.kind.r;
    if (Math.abs(off) <= edge) continue;
    o.x = SHOULDER[0] + Math.sign(off) * edge;
    if (o.vx * off > 0) o.vx = -o.vx * o.kind.bounce;
  }
}

// What the arm does when nobody is driving: pick something, go over it, come
// down, take hold, carry it somewhere else and let go.
function routine(s, t) {
  // left holding something, it finishes the job: carries it off and puts it down
  const j = s.job || (s.job = s.held ? { step: 3, until: t, thing: s.held } : { step: 0, until: t + 1.5, x: s.gx, y: s.gy });
  const reached = (x, y, slack) => Math.hypot(s.gx - x, s.gy - y) < slack || t > j.until;
  const next = (step, wait) => {
    j.step = step;
    j.until = t + wait;
  };
  if (j.step === 0) {
    if (t > j.until) {
      j.thing = s.things[(Math.random() * s.things.length) | 0];
      next(1, 5);
    }
    return [j.x, j.y, false];
  }
  const o = j.thing;
  if (j.step === 1) {
    if (reached(o.x, o.y + 0.45, 0.12)) next(2, 2.5);
    return [o.x, o.y + 0.45, false];
  }
  if (j.step === 2) {
    if (reached(o.x, o.y, 0.08)) next(3, 0.45);
    return [o.x, o.y, false];
  }
  if (j.step === 3) {
    if (t > j.until) {
      // somewhere over the bench, well clear of the other two things
      let clear = -1;
      for (let i = 0; i < 6; i++) {
        const x = SHOULDER[0] + (Math.random() < 0.5 ? -1 : 1) * (PLATE + 0.3 + Math.random() * (s.bench - PLATE - 0.6));
        const gap = Math.min(...s.things.map((q) => (q === o ? 9 : Math.abs(q.x - x))));
        if (gap > clear) {
          clear = gap;
          j.x = x;
        }
      }
      j.y = FLOOR + 1.2 + Math.random() * 1.4;
      next(4, 6);
    }
    return [o.x, o.y, true];
  }
  if (j.step === 4) {
    if (reached(j.x, j.y, 0.12)) next(5, 0.5);
    return [j.x, j.y, true];
  }
  if (t > j.until) next(0, 1.6);
  return [j.x, j.y, false];
}

// view is the frame the arm is drawn in: how many scene units wide and tall
// it is, where the pointer is across it, whether the button is down, and for
// a finger, how many taps there have been.
function follow(s, t, dt, view, still) {
  if (!s.things) {
    Object.assign(s, { phi: 0.9, b: -flex(1.9), side: 1, from: 0, g: 0.6, gx: 1.69, gy: 0.46, held: null, job: null, hits: [] });
    s.things = THINGS.map((kind) => ({ kind, x: kind.x, y: FLOOR + kind.r, vx: 0, vy: 0, a: 0, w: 0 }));
    s.objs = new Float32Array(THINGS.length * 3);
  }
  // how far either side of the shoulder the hand may go, and the bench with it
  const wall = Math.min(2.1, view.wide * ACROSS - PAD);
  s.bench = wall + 0.1;

  // where the hand should go and whether the gripper should be shut
  let tx;
  let ty;
  let closed;
  if (view.over && !still) {
    tx = armCam.target[0] + (view.u * 2 - 1) * view.wide * ACROSS;
    ty = armCam.target[1] + (1 - view.v * 2) * view.tall * armCam.half;
    closed = view.down;
    s.job = null;
  } else {
    [tx, ty, closed] = still ? [1.5, 0.6, false] : routine(s, t);
  }

  const dx = within(tx - SHOULDER[0], -wall, wall);
  const dy = Math.max(ty - SHOULDER[1], DROP);
  const rad = within(Math.hypot(dx, dy), NEAR, REACH);
  const phi = within(Math.atan2(dx, dy), -fan(rad), fan(rad));

  // A finger cannot hold a button down, so a tap is an order instead: go
  // there and take what is there or, with something already in hand, carry
  // it there and put it down.
  if (view.over && view.touch && !still) {
    if (view.taps !== s.taps) {
      s.taps = view.taps;
      s.put = !!s.held;
    }
    const there = Math.abs(s.phi - phi) < 0.06 && Math.abs(span(s.b) - rad) < 0.1;
    closed = s.put ? !there : there || !!s.held;
  }

  // Closing on something takes hold of it, opening lets it go. It does not
  // have to close at the right moment: a shut hand takes the first thing it
  // comes to, so pressing before the arm has arrived still works.
  let near = null;
  let gap = 0.75;
  if (!s.held) {
    for (const o of s.things) {
      const d = Math.hypot(o.x - s.gx, o.y - s.gy);
      if (d < gap) {
        gap = d;
        near = o;
      }
    }
  }
  if (closed && gap < 0.3) {
    s.held = near;
    s.took = t;
  } else if (!closed && s.held) {
    const o = s.held;
    const speed = Math.hypot(o.vx, o.vy);
    if (speed > 7) {
      o.vx *= 7 / speed;
      o.vy *= 7 / speed;
    }
    s.held = null;
  }

  // a heavy load slows every joint down
  const strain = 1 / (1 + (s.held ? s.held.kind.mass : 0) * 0.12);

  // The elbow sits above the line from shoulder to hand, so it has to change
  // sides when the hand does. It only starts once the arm is inside the band
  // around upright where there is room to straighten right out.
  const band = Math.min(0.6, Math.asin(Math.min(1, wall / FULL)) - 0.15);
  const want = phi > 0.3 ? 1 : phi < -0.3 ? -1 : s.side;
  if (still) {
    s.side = phi < 0 ? -1 : 1;
  } else if (want !== s.side && Math.abs(s.phi) < band) {
    s.side = want;
    s.from = Math.max(0, s.b * want);
  }

  if (still) {
    s.phi = phi;
    s.b = -s.side * flex(rad);
  } else {
    // While the elbow is changing sides the arm crosses the top in step with
    // it, so that it is upright at the moment it is straight.
    const bent = -s.b * s.side;
    let aim = phi;
    if (bent < DONE) {
      const start = -s.side * (band - 0.05);
      const done = within((bent + s.from) / (s.from + DONE), 0, 1);
      aim = start + (s.side * Math.min(band - 0.05, Math.abs(phi)) - start) * done;
    }

    // Look a little way along the swing still to come: how short the arm
    // has to be to fit there, and how far it can go at the length it is.
    const ext = span(s.b);
    const left = aim - s.phi;
    let fits = room(wall, s.phi);
    let free = 0;
    let open = true;
    for (let k = 1; k <= 10; k++) {
      const r = room(wall, s.phi + Math.sign(left) * Math.min(k * 0.03, Math.abs(left)));
      open = open && r > ext - 0.02;
      if (open) free = k / 10;
      fits = Math.min(fits, r);
    }
    // the elbow tucks in ahead of a wall, and the swing waits for it
    chase(s, "b", -s.side * flex(within(Math.min(rad, fits), NEAR, REACH)), 60 * strain, 3.4 * strain, dt);
    chase(s, "phi", aim, 60 * strain, 2.8 * strain, dt, 2.8 * strain * free);
  }

  const a = Math.PI / 2 - s.phi - Math.atan2(HAND * Math.sin(s.b), UPPER + HAND * Math.cos(s.b));
  // where the gripper has ended up, for holding things and for the routine
  s.gx = SHOULDER[0] + Math.cos(a) * UPPER + Math.cos(a + s.b) * HAND;
  s.gy = SHOULDER[1] + Math.sin(a) * UPPER + Math.sin(a + s.b) * HAND;

  if (!still && dt > 0) {
    if (s.held) {
      // drawn into the gripper over the first moment rather than snapped to
      // it, and it keeps the hand's speed so letting go mid-swing throws it
      const o = s.held;
      const pull = Math.min(1, dt * 16 + (t - s.took) * 5);
      const nx = o.x + (s.gx - o.x) * pull;
      const ny = o.y + (s.gy - o.y) * pull;
      o.vx += ((nx - o.x) / dt - o.vx) * 0.35;
      o.vy += ((ny - o.y) / dt - o.vy) * 0.35;
      o.x = nx;
      o.y = ny;
      // and it turns to sit square between the fingers
      const turn = o.kind.square ? Math.PI / 2 : Math.PI;
      const lean = a + s.b - o.a;
      o.a += (lean - turn * Math.round(lean / turn)) * pull;
      o.w = 0;
    }
    const steps = Math.max(1, Math.ceil(dt / 0.008));
    for (let i = 0; i < steps; i++) settle(s, dt / steps);
  }
  s.things.forEach((o, i) => s.objs.set([o.x, o.y, o.a], i * 3));

  // the gripper closes on whatever it holds and no further, and a shut hand
  // opens again as it comes up to something it could take
  const gape = s.held ? within((s.held.kind.r - 0.03) / 0.15, 0, 1) : closed && !near ? 0 : 1;
  s.g = still ? gape : s.g + (gape - s.g) * Math.min(1, dt * 9);
  return [a, s.b, s.g, s.bench];
}

// Joint angles, like a controller readout. Given as fractions of the figure's
// box rather than points in the scene, so they do not wander with the camera.
function readout(pose) {
  const deg = (r) => String(Math.round((r * 180) / Math.PI)).padStart(4, " ");
  return [
    ["J1" + deg(pose[0]), [0.12, 0.06]],
    ["J2" + deg(pose[1]), [0.12, 0.1]],
  ];
}

const finger = (k, a, l, r) => limb(k, a, l, [r, r * 0.92, r * 0.82, r * 0.68], 0.02);
const thumb = (k, a, l) => limb(k, a, l, [0.07, 0.055, 0.042], 0.02);

const hands = `
#define HALF 0.76
#define TARGET vec3(0.0, 0.3, 0.0)
#define YAW 0.0
#define PITCH 0.05
#define BMIN vec3(-3.5, -0.46, -0.42)
#define BMAX vec3(3.5, 1.3, 0.36)
#define LIGHT vec3(-0.5, 0.7, 0.5)
#define RIM 0.2
#define FADE_SIDES

float gap;

// uAmt closes the gap until the fingertips meet
void prep() {
  gap = mix(0.07, -0.038, uAmt);
}

// the hand that reaches: index out straight, the rest folded under
float reaching(vec3 p) {
  float d = ${finger([0.62, 0.13, 0.02], [186, 191, 197], [0.25, 0.17, 0.14], 0.052)};
  d = smin(d, ${finger([0.64, 0.1, -0.07], [214, 266, 318], [0.25, 0.18, 0.14], 0.054)}, 0.03);
  d = smin(d, ${finger([0.67, 0.08, -0.15], [224, 278, 332], [0.23, 0.17, 0.13], 0.05)}, 0.03);
  d = smin(d, ${finger([0.71, 0.06, -0.22], [234, 290, 345], [0.19, 0.14, 0.11], 0.044)}, 0.03);
  d = smin(d, ${thumb([0.9, -0.02, 0.11], [198, 212], [0.22, 0.17])}, 0.04);
  vec3 q = p - vec3(0.86, 0.1, -0.06);
  q.xy = back(q.xy, ${cs(8)});
  d = smin(d, ell(q, vec3(0.3, 0.19, 0.15)), 0.06);
  return smin(d, cone(p, vec3(1.08, 0.13, -0.06), vec3(3.4, 0.52, -0.12), 0.15, 0.28), 0.08);
}

// the hand that waits: wrist dropped, fingers hanging
float waiting(vec3 p) {
  float d = ${finger([-0.6, 0.15, 0.02], [-8, -22, -32], [0.24, 0.17, 0.14], 0.05)};
  d = smin(d, ${finger([-0.62, 0.11, -0.07], [-28, -58, -84], [0.25, 0.18, 0.14], 0.052)}, 0.03);
  d = smin(d, ${finger([-0.65, 0.08, -0.15], [-38, -72, -100], [0.23, 0.17, 0.13], 0.048)}, 0.03);
  d = smin(d, ${finger([-0.69, 0.06, -0.22], [-46, -84, -112], [0.19, 0.14, 0.11], 0.042)}, 0.03);
  d = smin(d, ${thumb([-0.9, 0.02, 0.11], [-22, -36], [0.22, 0.17])}, 0.04);
  vec3 q = p - vec3(-0.87, 0.16, -0.06);
  q.xy = turn(q.xy, ${cs(14)});
  d = smin(d, ell(q, vec3(0.3, 0.19, 0.15)), 0.06);
  return smin(d, cone(p, vec3(-1.08, 0.24, -0.06), vec3(-3.4, 0.98, -0.12), 0.15, 0.28), 0.08);
}

vec2 map(vec3 p) {
  // each hand only needs evaluating on its own side of the gap
  float a = p.x < 0.3 ? waiting(p + vec3(gap, 0.0, 0.0)) : p.x - 0.12;
  float b = p.x > -0.3 ? reaching(p - vec3(gap, 0.0, 0.0)) : -p.x - 0.12;
  return vec2(min(a, b), 1.0);
}

float tone(vec3 p, float m) { return 0.92; }
`;

const leg = (k, a, l) => limb(k, a, l, [0.03, 0.022, 0.016, 0.01], 0);

const bee = `
#define HALF 1.02
#define TARGET vec3(0.1, 0.05, 0.0)
#define YAW -0.25
#define PITCH 0.08
#define BMIN vec3(-1.3, -0.98, -0.62)
#define BMAX vec3(1.36, 1.02, 0.62)
#define LIGHT vec3(-0.45, 0.75, 0.5)
#define RIM 0.5

vec2 beat;
float bob;

void prep() {
  float b = 0.3 * sin(uTime * 5.0);
  beat = vec2(cos(b), sin(b));
  bob = 0.04 * sin(uTime * 1.6);
}

// face left, hover, nose up a little
vec3 pose(vec3 p) {
  p.x = -p.x;
  p.y -= bob;
  p.xy = back(p.xy, ${cs(11.5)});
  return p;
}

// abdomen space: x runs from the waist to the sting
vec3 belly(vec3 p) {
  vec3 q = p - vec3(-0.16, -0.01, 0.0);
  q.xy = back(q.xy, ${cs(202)});
  return q;
}

float wing(vec3 p, vec3 root, vec2 splay, vec2 ang, float len, float wid) {
  vec3 q = p - root;
  q.yz = turn(q.yz, splay);
  q.xy = back(back(q.xy, beat), ang);
  q.x -= len;
  return ell(q, vec3(len, wid, 0.012));
}

vec2 map(vec3 p0) {
  vec3 p = pose(p0);
  vec3 m = vec3(p.xy, abs(p.z));

  float fur = 0.012 * sin(p.x * 38.0) * sin(p.y * 41.0) * sin(p.z * 36.0);
  float body = ell(p - vec3(0.12, 0.04, 0.0), vec3(0.3, 0.27, 0.27)) + fur;
  body = smin(body, ell(p - vec3(0.5, -0.03, 0.0), vec3(0.19, 0.21, 0.2)) + fur * 0.5, 0.05);
  body = min(body, cone(p, vec3(0.6, -0.17, 0.0), vec3(0.65, -0.37, 0.0), 0.032, 0.012));

  vec3 q = belly(p);
  float taper = 1.0 - 0.5 * smoothstep(0.35, 1.05, q.x);
  float abdomen = ell(vec3(q.x - 0.5, q.yz / taper), vec3(0.54, 0.275, 0.275)) * taper;
  abdomen = min(abdomen, cone(q, vec3(0.98, 0.0, 0.0), vec3(1.13, 0.0, 0.0), 0.025, 0.004));

  float eye = ell(m - vec3(0.56, 0.02, 0.125), vec3(0.1, 0.14, 0.085));

  float thin = min(cone(m, vec3(0.62, 0.14, 0.06), vec3(0.77, 0.36, 0.11), 0.018, 0.015),
                   cone(m, vec3(0.77, 0.36, 0.11), vec3(0.93, 0.25, 0.15), 0.015, 0.012));
  // legs only exist below the body, wings only above it
  if (p.y > -0.06) {
    thin = min(thin, p.y + 0.14);
  } else {
    thin = min(thin, ${leg([0.3, -0.16, 0.14], [-65, -115, -70], [0.2, 0.2, 0.12])});
    thin = min(thin, ${leg([0.12, -0.2, 0.15], [-95, -65, -105], [0.24, 0.24, 0.13])});
    thin = min(thin, ${leg([-0.04, -0.18, 0.14], [-125, -80, -120], [0.3, 0.3, 0.16])});
    thin = min(thin, ${leg([0.3, -0.16, -0.14], [-55, -105, -62], [0.2, 0.2, 0.12])});
    thin = min(thin, ${leg([0.12, -0.2, -0.15], [-84, -56, -96], [0.24, 0.24, 0.13])});
    thin = min(thin, ${leg([-0.04, -0.18, -0.14], [-114, -70, -110], [0.3, 0.3, 0.16])});
  }

  float wings = 0.12 - p.y;
  if (p.y > 0.05) {
    wings = wing(p, vec3(0.08, 0.26, 0.1), ${cs(28.6)}, ${cs(140)}, 0.43, 0.17);
    wings = min(wings, wing(p, vec3(0.0, 0.24, 0.1), ${cs(22.9)}, ${cs(164)}, 0.3, 0.13));
    wings = min(wings, wing(p, vec3(0.08, 0.26, -0.1), ${cs(-28.6)}, ${cs(127)}, 0.43, 0.17));
    wings = min(wings, wing(p, vec3(0.0, 0.24, -0.1), ${cs(-22.9)}, ${cs(150)}, 0.3, 0.13));
  }

  vec2 r = vec2(body, 1.0);
  r = pick(r, vec2(abdomen, 2.0));
  r = pick(r, vec2(eye, 3.0));
  r = pick(r, vec2(thin, 4.0));
  r = pick(r, vec2(wings, 5.0));
  return r;
}

float tone(vec3 p0, float m) {
  vec3 p = pose(p0);
  if (m > 4.5) return 0.5 + 0.2 * sin(p.x * 26.0 - p.y * 34.0) * sin(p.y * 9.0);
  if (m > 3.5) return 0.75;
  if (m > 2.5) return 0.32;
  if (m > 1.5) return mix(0.2, 0.98, smoothstep(0.38, 0.62, fract(belly(p).x * 4.4 + 0.15)));
  return 0.66 + 0.22 * sin(p.x * 61.0) * sin(p.y * 57.0) * sin(p.z * 63.0);
}
`;

// both wings are fans of blades hinged at the shoulder; a is the near one
function blades() {
  const lines = [];
  for (let i = 0; i < 9; i++) {
    const f = i / 8;
    const len = 1.02 + (0.46 - 1.02) * f * f;
    const z = num(f * 0.02);
    lines.push(`    wingA = min(wingA, blade(a - vec3(0.0, 0.0, ${z}), ${cs(74 + f * 80)}, ${num(len)}, 0.07));`);
    lines.push(`    wingB = min(wingB, blade(b + vec3(0.0, 0.0, ${z}), ${cs(58 + f * 66)}, ${num(len * 0.94)}, 0.07));`);
  }
  return lines.join("\n");
}

function plume() {
  const lines = [];
  for (let i = 0; i < 5; i++) {
    const at = [-0.34, -0.04, i * 0.008 - 0.016];
    lines.push(`  tail = min(tail, blade(p - ${v3(at)}, ${cs(186 + i * 9)}, ${num(0.64 - Math.abs(i - 2) * 0.05)}, 0.075));`);
  }
  return lines.join("\n");
}

const bird = `
#define HALF 1.06
#define TARGET vec3(-0.12, 0.26, 0.0)
#define YAW -0.2
#define PITCH 0.05
#define BMIN vec3(-1.45, -0.98, -0.52)
#define BMAX vec3(1.2, 1.42, 0.52)
#define LIGHT vec3(-0.5, 0.7, 0.5)
#define RIM 0.45

vec2 beat;
float bob;

void prep() {
  float b = 0.26 * sin(uTime * 2.4);
  beat = vec2(cos(b), sin(b));
  bob = 0.035 * sin(uTime * 1.3);
}

// face left, hover, beak tipped up
vec3 pose(vec3 p) {
  p.x = -p.x;
  p.y -= bob;
  p.xy = back(p.xy, ${cs(20.6)});
  return p;
}

// one feather: a flat blade lying along the given direction from the origin
float blade(vec3 q, vec2 ang, float len, float wid) {
  q.xy = back(q.xy, ang);
  q.x -= len * 0.5;
  return ell(q, vec3(len * 0.5, wid, 0.014));
}

vec2 map(vec3 p0) {
  vec3 p = pose(p0);

  float body = smin(ell(p, vec3(0.46, 0.25, 0.23)), ell(p - vec3(0.16, -0.04, 0.0), vec3(0.3, 0.26, 0.23)), 0.08);
  body = smin(body, sph(p - vec3(0.5, 0.17, 0.0), 0.185), 0.09);
  float beak = cone(p, vec3(0.64, 0.19, 0.0), vec3(1.34, 0.21, 0.0), 0.04, 0.008);
  float eye = sph(vec3(p.xy, abs(p.z)) - vec3(0.57, 0.22, 0.15), 0.036);

  float tail = 1e3;
${plume()}

  float wingA = 1e3;
  float wingB = 1e3;
  if (length(p - vec3(0.0, 0.62, 0.0)) < 1.3) {
    // swing each wing about its shoulder once, then lay the blades out at fixed angles
    vec3 a = p - vec3(0.12, 0.17, 0.17);
    vec3 b = p - vec3(0.2, 0.17, -0.17);
    a.xy = back(a.xy, beat);
    b.xy = back(b.xy, beat);
${blades()}
  } else {
    wingA = length(p - vec3(0.0, 0.62, 0.0)) - 1.15;
  }

  vec2 r = vec2(body, 1.0);
  r = pick(r, vec2(beak, 4.0));
  r = pick(r, vec2(eye, 3.0));
  r = pick(r, vec2(tail, 2.0));
  r = pick(r, vec2(wingA, 2.0));
  r = pick(r, vec2(wingB, 5.0));
  return r;
}

float tone(vec3 p0, float m) {
  vec3 p = pose(p0);
  if (m > 4.5) return 0.42 + 0.14 * sin(atan(p.y - 0.17, p.x - 0.2) * 58.0);
  if (m > 3.5) return 0.5;
  if (m > 2.5) return 0.22;
  if (m > 1.5) return 0.7 + 0.28 * sin(atan(p.y - 0.17, p.x - 0.12) * 62.0);
  return 0.76 + 0.1 * sin(p.x * 46.0 + 2.0 * sin(p.y * 30.0)) * sin(p.y * 42.0 + p.z * 20.0);
}
`;

// aspect: the width to height ratio each figure is composed for
// sway: how far the camera follows the cursor, in radians
// gamma, gain: lift applied before the ramp, since thin parts shade dark
// moving: false means the shader only needs running again when the camera or uAmt changes
// drive: optional physics that feeds uPose each frame
// labels: optional words pinned to points on the figure
export const SCENES = {
  arm: { src: arm, aspect: 1.0, sway: [0.05, 0], gamma: 0.7, gain: 1.2, moving: true, cam: armCam, drive: follow, labels: readout },
  hands: { src: hands, aspect: 3.2, sway: [0.14, 0.08], gamma: 0.8, gain: 1.1, moving: false },
  bee: { src: bee, aspect: 1.3, sway: [0.35, 0.15], gamma: 0.62, gain: 1.25, moving: true },
  bird: { src: bird, aspect: 1.3, sway: [0.3, 0.14], gamma: 0.62, gain: 1.25, moving: true },
};
