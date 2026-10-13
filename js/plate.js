import { grid, idx, mouse, rampTable, watch, prng, clamp } from "./glyph.js";
import { HEAD, TAIL, SCENES } from "./scenes.js";
import { thud } from "./sound.js";

// A plate is one figure printed in characters. It all happens on the GPU:
//   1. the scene's shader raymarches the figure into a small texture,
//      two samples per character cell each way
//   2. one point sprite per cell reads its brightness from that texture,
//      picks a glyph off the ramp and draws it, shoved about by the cursor
// Nothing is read back to js, so a frame costs the main thread next to nothing.

const LENS = 86;
// seconds a figure takes to come together when it first appears
const INTRO = 1.1;
const DUST = [".", ",", ":", "`", "."].map(idx);
const SCENE_UNIFORMS = ["uRes", "uAspect", "uFit", "uTime", "uAmt", "uLook", "uPose", "uObj"];
const CELL_UNIFORMS = ["uGrid", "uOrigin", "uCell", "uView", "uDpr", "uSize", "uWide", "uSpread", "uFront", "uMouse", "uRing", "uLum", "uAtlas", "uRamp", "uGamma", "uGain", "uFade", "uTime", "uScan", "uInk"];

const QUAD_VERT = "attribute vec4 a; void main() { gl_Position = vec4(a.xy, 0.0, 1.0); }";

const CELL_VERT = `
attribute vec4 a;      // column, row, and two random numbers per cell
uniform vec2 uGrid, uOrigin, uCell, uView;
uniform float uDpr, uSize, uSpread, uFront;
uniform vec3 uMouse;   // x, y in css px, then 1 when the cursor is over the canvas
uniform vec3 uRing[3]; // x, y and age of each click ring, age below zero when unused
varying vec2 vUv;
varying vec3 vCell;    // loose flag, random number, y in css px

void main() {
  vec2 p = uOrigin + a.xy * uCell;
  float loose = 0.0;

  // blown apart: every cell has somewhere of its own to be, mostly upwards
  if (uSpread > 0.001) {
    float ang = -1.5708 + (a.z - 0.5) * 2.6;
    p += vec2(cos(ang), sin(ang)) * (160.0 + a.w * 520.0) * uSpread;
    loose = 1.0;
  }
  if (uMouse.z > 0.5) {
    vec2 d = p - uMouse.xy;
    float len = length(d) + 0.01;
    float f = 1.0 - len / ${LENS}.0;
    if (f > 0.0) {
      p += d / len * f * f * 22.0;
      if (f > 0.3) loose = 1.0;
    }
  }
  for (int i = 0; i < 3; i++) {
    if (uRing[i].z < 0.0) continue;
    vec2 d = p - uRing[i].xy;
    float len = length(d) + 0.01;
    float ring = 1.0 - abs(len - uRing[i].z * 560.0) / 52.0;
    if (ring > 0.0) {
      p += d / len * ring * 20.0 * (1.0 - uRing[i].z / 1.1);
      loose = 1.0;
    }
  }
  // the rows nearest the printing edge have not settled yet
  if (uFront - a.y < 4.0 && uFront < uGrid.y + 5.0) loose = 1.0;

  vUv = vec2((a.x + 0.5) / uGrid.x, 1.0 - (a.y + 0.5) / uGrid.y);
  vCell = vec3(loose, a.z, uOrigin.y + a.y * uCell.y);
  vec2 q = floor(p * uDpr + 0.5);
  gl_Position = a.y > uFront ? vec4(2.0, 2.0, 0.0, 1.0) : vec4(q.x / uView.x * 2.0 - 1.0, 1.0 - q.y / uView.y * 2.0, 0.0, 1.0);
  gl_PointSize = uSize;
}`;

const CELL_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uLum, uAtlas, uRamp;
uniform float uWide, uGamma, uGain, uFade, uTime, uScan;
uniform vec3 uInk;
varying vec2 vUv;
varying vec3 vCell;

void main() {
  float x = (gl_PointCoord.x - 0.5) / uWide;
  if (abs(x) > 0.5) discard;
  float l = texture2D(uLum, vUv).r;
  if (l < 0.02) discard;
  l = min(1.0, pow(l, uGamma) * uGain);
  // a soft bright band travels down the figure
  float band = (vCell.z - uScan) / 60.0;
  l = min(1.0, l * (1.0 + 0.22 * exp(-band * band)));
  // loose characters flicker through whatever is near their own weight
  if (vCell.x > 0.5) {
    float r = fract(sin(dot(vec2(vCell.y, floor(uTime * 24.0)), vec2(12.9898, 78.233))) * 43758.5453);
    l = clamp(l + (r - 0.5) * 0.6, 0.06, 1.0);
  }
  float glyph = floor(texture2D(uRamp, vec2(l * 0.998, 0.5)).r * 255.0 + 0.5);
  float alpha = texture2D(uAtlas, vec2((glyph + x + 0.5) / 95.0, gl_PointCoord.y)).a * (0.2 + 0.8 * l) * uFade;
  gl_FragColor = vec4(uInk * alpha, alpha);
}`;

const unit = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// opts.still    draw once, no motion
// opts.pull     function returning true while the figure should lean in (uAmt)
// opts.box      element marking where the figure sits when the canvas is bigger than it
// opts.scatter  the figure assembles out of loose characters when it first appears
// opts.overlay  something else to draw on the same canvas, sharing the cursor effects
export function plate(canvas, name, opts = {}) {
  const { still = false, pull = null, box = null, scatter = false, overlay = null } = opts;
  const scene = SCENES[name];
  const g = grid(canvas, () => (window.innerWidth < 520 ? 6 : window.innerWidth < 1000 ? 7 : 8), { sprites: true });
  const gl = g.gl;
  const ripples = [];
  const drive = {};
  const out = { x: 0, y: 0, loose: false };
  const rings = new Float32Array(9);
  const grit = [];
  const view = { wide: 1, tall: 1, u: 0, v: 0, over: false, down: false };

  let cols = 0;
  let rows = 0;
  let fx = 0;
  let fy = 0;
  let aspect = 1;
  let rect = null;
  let motes = [];
  let lookX = 0;
  let lookY = 0;
  let amt = 0;
  let pose = [0, 0, 0, 0];
  let last = -1;
  let born = -1;
  let shown = -1;
  let clock = 0;
  let sceneProg = null;
  let cellProg = null;
  let target = null;
  let cells = null;
  let ramp = null;
  let rampFor = "";
  let parallel = null;

  const compile = (vert, frag, names) => {
    const make = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const p = gl.createProgram();
    const fs = make(gl.FRAGMENT_SHADER, frag);
    gl.attachShader(p, make(gl.VERTEX_SHADER, vert));
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "a");
    gl.linkProgram(p);
    return { p, fs, names, state: "building" };
  };

  // Returns true once a program has linked. Where the browser can compile off
  // the main thread we do not ask until it says it is done, so a slow compile
  // cannot freeze the page.
  const ready = (e) => {
    if (e.state === "building") {
      if (parallel && !gl.getProgramParameter(e.p, parallel.COMPLETION_STATUS_KHR)) return false;
      if (gl.getProgramParameter(e.p, gl.LINK_STATUS)) {
        for (const u of e.names) e[u] = gl.getUniformLocation(e.p, u);
        e.state = "ready";
      } else {
        console.warn(name + " shader:", gl.getShaderInfoLog(e.fs) || gl.getProgramInfoLog(e.p));
        e.state = "failed";
      }
    }
    return e.state === "ready";
  };

  const texture = (unit, filter) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
    for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, filter);
    return t;
  };

  if (gl) {
    parallel = gl.getExtension("KHR_parallel_shader_compile");
    // both start building now so the figure is ready before it scrolls into view
    sceneProg = compile(QUAD_VERT, HEAD + scene.src + TAIL, SCENE_UNIFORMS);
    cellProg = compile(CELL_VERT, CELL_FRAG, CELL_UNIFORMS);
    target = { tex: texture(1, gl.LINEAR), fbo: gl.createFramebuffer(), quad: gl.createBuffer() };
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, target.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 3, -1, 0, 0, -1, 3, 0, 0]), gl.STATIC_DRAW);
    cells = gl.createBuffer();
    ramp = texture(2, gl.NEAREST);
  }

  function resize() {
    g.fit();
    cols = rows = 0;
    const rnd = prng(name.length * 7919 + g.cols);
    motes = [];
    const count = Math.round(clamp((g.w * g.h) / 8000, 12, 110));
    for (let i = 0; i < count; i++) motes.push([rnd() * g.w, rnd() * g.h, rnd(), rnd()]);
  }

  // work out which cells the figure covers; cheap enough to do every frame
  function measure() {
    rect = canvas.getBoundingClientRect();
    if (overlay) overlay.layout(g, rect);
    const b = box ? box.getBoundingClientRect() : rect;
    const c = Math.max(1, Math.floor(b.width / g.cw));
    const r = Math.max(1, Math.floor(b.height / g.ch));
    fx = b.left - rect.left + (b.width - c * g.cw) / 2 + g.cw / 2;
    fy = b.top - rect.top + (b.height - r * g.ch) / 2 + g.ch / 2;
    aspect = b.width / Math.max(1, b.height);
    if (c === cols && r === rows) return;
    cols = c;
    rows = r;

    // the texture the scene renders into, two samples per cell each way
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, c * 2, r * 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // one point per cell: where it is in the grid, and two random numbers
    const rnd = prng(c * 31 + r);
    const data = new Float32Array(c * r * 4);
    for (let i = 0; i < c * r; i++) {
      data[i * 4] = i % c;
      data[i * 4 + 1] = (i / c) | 0;
      data[i * 4 + 2] = rnd();
      data[i * 4 + 3] = rnd();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cells);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }

  // the same camera as the shader, for pinning words to points on the figure
  function project(P) {
    const cam = scene.cam;
    const dist = cam.half * 4;
    const yaw = cam.yaw + lookX;
    const pit = cam.pitch + lookY;
    const ro = [
      cam.target[0] + dist * Math.sin(yaw) * Math.cos(pit),
      cam.target[1] + dist * Math.sin(pit),
      cam.target[2] + dist * Math.cos(yaw) * Math.cos(pit),
    ];
    const fw = unit([cam.target[0] - ro[0], cam.target[1] - ro[1], cam.target[2] - ro[2]]);
    const rt = unit([-fw[2], 0, fw[0]]);
    const up = [-rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1]];
    const v = [P[0] - ro[0], P[1] - ro[1], P[2] - ro[2]];
    // a flat camera has no perspective, so depth does not come into it
    const scale = cam.flat ? 1 / cam.half : 4 / dot(v, fw);
    const fit = Math.max(1, scene.aspect / aspect);
    return [(dot(v, rt) * scale) / (aspect * fit) / 2 + 0.5, 0.5 - (dot(v, up) * scale) / fit / 2];
  }

  function frame(t) {
    if (!gl) return;
    // The figure needs its shaders, and those can take a moment to compile.
    // Anything drawn over it, like the name, does not, so that goes up first.
    const whole = ready(sceneProg) && ready(cellProg);
    if (!whole && !overlay) return;
    const dt = last < 0 ? 1 / 60 : Math.min(0.1, t - last);
    last = t;
    clock = t;
    if (born < 0) born = t;
    if (whole && shown < 0) shown = t;
    measure();
    const tt = still ? 2 : t;
    const { cw, ch } = g;
    const fit = Math.max(1, scene.aspect / aspect);

    const mx = mouse.x - rect.left;
    const my = mouse.y - rect.top;
    const here = mouse.x > -1e3 && !still;
    const over = here && mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height;
    // u, v: pointer position across the figure itself
    const u = (mx - fx + cw / 2) / (cols * cw);
    const v = (my - fy + ch / 2) / (rows * ch);
    const onFigure = here && u >= 0 && u <= 1 && v >= 0 && v <= 1;

    // the camera drifts a little towards wherever the cursor is on the page
    const tx = here ? clamp(((u - 0.5) * cols * cw) / window.innerWidth, -0.5, 0.5) * 2 : 0;
    const ty = here ? clamp(((v - 0.5) * rows * ch) / window.innerHeight, -0.5, 0.5) * 2 : 0;
    const ease = Math.min(1, dt * 3);
    lookX += (tx * scene.sway[0] - lookX) * ease;
    lookY += (ty * scene.sway[1] - lookY) * ease;
    const want = !still && (onFigure || (pull && pull())) ? 1 : 0;
    amt += (want - amt) * Math.min(1, dt * 2.2);
    if (scene.drive && whole) {
      Object.assign(view, { wide: aspect * fit, tall: fit, u, v, over, down: mouse.down });
      pose = scene.drive(drive, tt, dt, view, still);
    }

    // things landing in the scene make a sound and kick up some grit
    if (drive.hits) {
      for (const [hx, hy, mass, speed] of drive.hits.splice(0)) {
        thud(mass, speed);
        const [du, dv] = project([hx, hy, 0]);
        const count = Math.min(10, Math.round(Math.sqrt(mass) * speed * 0.6));
        for (let i = 0; i < count; i++) {
          grit.push({ x: fx - cw / 2 + du * cols * cw, y: fy - ch / 2 + dv * rows * ch, vx: (Math.random() - 0.5) * 170, vy: -30 - Math.random() * 110, t });
        }
      }
    }

    // 0 when the figure is whole, 1 when its characters are fully blown apart
    let spread = 0;
    let front = rows + 6;
    // the same for what is drawn over it, which may well have got here first
    let loose = 0;
    if (!still) {
      const burst = (age) => (age < 1 ? (1 - age) * (1 - age) * (1 - age) : 0);
      const age = whole ? (t - shown) / INTRO : 0;
      if (scatter) spread = burst(age);
      // smaller figures print in from the top instead
      else front = clamp(age * 1.4, 0, 1) * (rows + 6);
      if (scatter) loose = burst((t - born) / INTRO);
    }
    const fade = 1 - spread;
    while (ripples.length && t - ripples[0].t > 1.1) ripples.shift();
    for (let i = 0; i < 3; i++) {
      const rp = ripples[i];
      rings[i * 3] = rp ? rp.x : 0;
      rings[i * 3 + 1] = rp ? rp.y : 0;
      rings[i * 3 + 2] = rp ? t - rp.t : -1;
    }

    if (whole) {
      // pass 1: the scene, into its texture
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, cols * 2, rows * 2);
      gl.useProgram(sceneProg.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, target.quad);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
      gl.uniform2f(sceneProg.uRes, cols * 2, rows * 2);
      gl.uniform1f(sceneProg.uAspect, aspect);
      gl.uniform1f(sceneProg.uFit, fit);
      gl.uniform1f(sceneProg.uTime, tt);
      gl.uniform1f(sceneProg.uAmt, amt);
      gl.uniform2f(sceneProg.uLook, lookX, lookY);
      gl.uniform4f(sceneProg.uPose, pose[0], pose[1], pose[2], pose[3]);
      if (drive.objs) gl.uniform3fv(sceneProg.uObj, drive.objs);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // pass 2: one sprite per cell
      if (rampFor !== rampTable()) {
        rampFor = rampTable();
        const bytes = new Uint8Array(256 * 4);
        for (let i = 0; i < 256; i++) bytes[i * 4] = rampFor[i];
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, ramp);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      }
      const sheet = g.atlas();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.useProgram(cellProg.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sheet.tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, target.tex);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, ramp);
      gl.bindBuffer(gl.ARRAY_BUFFER, cells);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
      gl.uniform2f(cellProg.uGrid, cols, rows);
      gl.uniform2f(cellProg.uOrigin, fx, fy);
      gl.uniform2f(cellProg.uCell, cw, ch);
      gl.uniform2f(cellProg.uView, canvas.width, canvas.height);
      gl.uniform1f(cellProg.uDpr, g.dpr);
      gl.uniform1f(cellProg.uSize, sheet.gh);
      gl.uniform1f(cellProg.uWide, sheet.gw / sheet.gh);
      gl.uniform1f(cellProg.uSpread, spread);
      gl.uniform1f(cellProg.uFront, front);
      // a figure that chases the cursor would only ever be pushing itself out of the way
      gl.uniform3f(cellProg.uMouse, mx, my, over && !scene.drive ? 1 : 0);
      gl.uniform3fv(cellProg.uRing, rings);
      gl.uniform1i(cellProg.uAtlas, 0);
      gl.uniform1i(cellProg.uLum, 1);
      gl.uniform1i(cellProg.uRamp, 2);
      gl.uniform1f(cellProg.uGamma, scene.gamma);
      gl.uniform1f(cellProg.uGain, scene.gain);
      gl.uniform1f(cellProg.uFade, fade);
      gl.uniform1f(cellProg.uTime, tt);
      gl.uniform1f(cellProg.uScan, (((tt * 0.14) % 1.6) - 0.3) * rows * ch + fy);
      gl.uniform3f(cellProg.uInk, g.ink(), g.ink(), g.ink());
      gl.drawArrays(gl.POINTS, 0, cols * rows);
    }

    // everything else goes through the ordinary sprite batch on top
    g.clear();
    if (overlay) {
      // the same push the cells get in their shader, for things drawn from js
      const warp = (x, y, o) => {
        o.loose = false;
        if (over) {
          const dx = x - mx;
          const dy = y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < LENS * LENS) {
            const d = Math.sqrt(d2) + 0.01;
            const f = 1 - d / LENS;
            x += (dx / d) * f * f * 22;
            y += (dy / d) * f * f * 22;
            if (f > 0.3) o.loose = true;
          }
        }
        for (let n = 0; n < ripples.length; n++) {
          const rp = ripples[n];
          const dx = x - rp.x;
          const dy = y - rp.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
          const age = t - rp.t;
          const ring = 1 - Math.abs(d - age * 560) / 52;
          if (ring > 0) {
            const shove = ring * 20 * (1 - age / 1.1);
            x += (dx / d) * shove;
            y += (dy / d) * shove;
            o.loose = true;
          }
        }
        o.x = x;
        o.y = y;
      };
      overlay.draw(g, still ? 0 : t, { spread: loose, fade: 1 - loose, warp, out });
    }

    if (whole && scene.labels && spread < 0.15 && front > rows) {
      for (const [text, P] of scene.labels(pose, tt)) {
        const [lu, lv] = P.length === 2 ? P : project(P);
        const col = Math.round(lu * cols - text.length / 2);
        const row = Math.round(lv * rows);
        g.text(text, fx + col * cw, fy + row * ch, (1 - spread * 6) * fade);
      }
    }

    for (let i = grit.length - 1; i >= 0; i--) {
      const p = grit[i];
      const age = t - p.t;
      if (age > 0.5) grit.splice(i, 1);
      else g.put(DUST[i % DUST.length], p.x + p.vx * age, p.y + p.vy * age + 260 * age * age, 0.9 * (1 - age / 0.5));
    }

    const md = still ? 0 : t;
    for (const [x, y, a, b] of motes) {
      g.put(DUST[(a * DUST.length) | 0], x + 9 * Math.sin(md * 0.21 + a * 40), y + 7 * Math.cos(md * 0.17 + b * 31), 0.1 + 0.22 * b);
    }
    g.flush(whole);
  }

  // a click sends a ring out through the characters
  window.addEventListener(
    "pointerdown",
    (e) => {
      // on a figure you drive, a click means grab, so it gets no ring
      if (still || scene.drive || !rect || !e.target.closest || e.target.closest("a, button, input, textarea, label")) return;
      const r = canvas.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: clock });
      if (ripples.length > 3) ripples.shift();
    },
    { passive: true }
  );

  watch(() => g.fit());

  return { el: canvas, frame, resize };
}
