// Glyph plumbing shared by everything that draws: density ramps, a sprite
// atlas per font size, and a thin wrapper around a 2d canvas that draws by
// index.

const FAMILY = '"IBM Plex Mono", ui-monospace, "Cascadia Mono", Menlo, Consolas, monospace';

export const RAMPS = {
  standard: " .`,:;-~=+*ox0OSH#M@",
  letters: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  sharp: " .:-=+*#%@",
  binary: " .:;1010",
};

export const settings = { ramp: "standard", light: false, sound: true };

const FIRST = 32;
const COUNT = 95;
const LEAD = 1.18;
const LEVELS = 10;
const INK = { dark: "#f4f4f4", light: "#0d0d0d" };

// Thousands of small sprite copies per frame are much quicker on a canvas
// that is rasterised on the cpu than queued one by one to the gpu process.
const SOFT = { willReadFrequently: true };

const subs = [];
const atlases = new Map();
let lut = buildLut();

export function watch(fn) {
  subs.push(fn);
}

export function set(key, value) {
  settings[key] = value;
  if (key === "ramp") lut = buildLut();
  if (key === "light") atlases.clear();
  for (const fn of subs) fn(key, value);
}

function buildLut() {
  const r = RAMPS[settings.ramp];
  const t = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    t[i] = r.charCodeAt(Math.min(r.length - 1, ((i / 256) * r.length) | 0)) - FIRST;
  }
  return t;
}

// the whole ramp as 256 atlas indices, for shaders that look glyphs up in a texture
export const rampTable = () => lut;

// luminance 0..1 -> atlas index
export function shade(l) {
  return lut[l <= 0 ? 0 : l >= 1 ? 255 : (l * 255) | 0];
}

export const idx = (ch) => ch.charCodeAt(0) - FIRST;

// The glyph sheet for one font size. For the 2d path it holds a row per
// brightness step in the page's ink colour. The WebGL path tints and fades in
// the shader, so it wants a single white row.
function atlas(px, dpr, sprite, set) {
  const key = px + ":" + dpr + ":" + (sprite ? "gl" : settings.light) + ":" + (set ? set.chars : "");
  let a = atlases.get(key);
  if (a) return a;

  const levels = sprite ? 1 : LEVELS;
  const count = set ? set.chars.length : COUNT;
  const font = `${px * dpr}px ${set ? set.family : FAMILY}`;
  const c = document.createElement("canvas");
  const x = c.getContext("2d", SOFT);
  x.font = font;
  // a custom sheet is cut to its widest glyph
  const adv = set ? Math.max(...[...set.chars].map((ch) => x.measureText(ch).width)) : x.measureText("M").width;
  const gw = Math.ceil(adv) + 2;
  const gh = Math.ceil(px * dpr * 1.3) + 2;
  c.width = gw * count;
  c.height = gh * levels;
  x.font = font;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillStyle = sprite ? "#fff" : settings.light ? INK.light : INK.dark;
  for (let v = 0; v < levels; v++) {
    x.globalAlpha = (v + 1) / levels;
    for (let i = 0; i < count; i++) {
      x.fillText(set ? set.chars[i] : String.fromCharCode(FIRST + i), i * gw + gw / 2, v * gh + gh / 2);
    }
  }
  a = { c, gw, gh, count, cw: adv / dpr, ch: Math.round(px * LEAD) };
  atlases.set(key, a);
  return a;
}

const SPRITE_VERT = `
attribute vec4 a;
uniform vec2 uView;
uniform float uSize;
varying vec2 v;
void main() {
  gl_Position = vec4(a.x / uView.x * 2.0 - 1.0, 1.0 - a.y / uView.y * 2.0, 0.0, 1.0);
  gl_PointSize = uSize;
  v = a.zw;
}`;

const SPRITE_FRAG = `
precision mediump float;
uniform sampler2D uAtlas;
uniform float uWide, uCount;
uniform vec3 uInk;
varying vec2 v;
void main() {
  // a point is square but a glyph is not, so only the middle strip is used
  float x = (gl_PointCoord.x - 0.5) / uWide;
  if (abs(x) > 0.5) discard;
  float alpha = texture2D(uAtlas, vec2((v.x + x + 0.5) / uCount, gl_PointCoord.y)).a * v.y;
  gl_FragColor = vec4(uInk * alpha, alpha);
}`;

// Draws every glyph as a point sprite in one call. Much cheaper than a 2d
// canvas once there are thousands of characters moving every frame.
function sprites(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, depth: false, premultipliedAlpha: true });
  if (!gl) return null;
  const make = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, make(gl.VERTEX_SHADER, SPRITE_VERT));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, SPRITE_FRAG));
  gl.bindAttribLocation(p, 0, "a");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.enableVertexAttribArray(0);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
  for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
  const U = (name) => gl.getUniformLocation(p, name);
  return { gl, p, tex, vbo: gl.createBuffer(), uView: U("uView"), uSize: U("uSize"), uWide: U("uWide"), uInk: U("uInk"), uCount: U("uCount"), sheet: null };
}

// opts.sprites asks for the WebGL path; it falls back to 2d if that fails.
// opts.set swaps the printable ascii sheet for { chars, family }, where the
// first character is the blank one.
// Callers draw with put() and finish the frame with flush().
export function grid(canvas, size, opts = {}) {
  const fast = opts.sprites ? sprites(canvas) : null;
  const ctx = fast ? null : canvas.getContext("2d", SOFT);
  const g = { canvas, w: 0, h: 0, px: 0, dpr: 1, cw: 1, ch: 1, cols: 0, rows: 0 };
  let a = null;
  let batch = new Float32Array(4096 * 4);
  let count = 0;

  g.fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const px = typeof size === "function" ? size(w, h) : size;
    a = atlas(px, dpr, !!fast, opts.set);
    if (w !== g.w || h !== g.h || dpr !== g.dpr) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    g.w = w;
    g.h = h;
    g.px = px;
    g.dpr = dpr;
    g.cw = a.cw;
    g.ch = a.ch;
    g.cols = Math.floor(w / a.cw);
    g.rows = Math.floor(h / a.ch);
    if (!fast || fast.sheet === a) return;
    const { gl } = fast;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fast.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a.c);
    fast.sheet = a;
  };

  // for callers that run their own passes in the same context
  g.gl = fast ? fast.gl : null;
  g.atlas = () => ({ tex: fast.tex, gw: a.gw, gh: a.gh });
  g.ink = () => (settings.light ? 0.05 : 0.96);
  // where a character sits on this grid's sheet
  g.index = opts.set ? (ch) => Math.max(0, opts.set.chars.indexOf(ch)) : idx;

  g.clear = () => {
    if (!fast) ctx.clearRect(0, 0, canvas.width, canvas.height);
    count = 0;
  };

  // i: atlas index, (x, y): glyph centre in css px
  g.put = fast
    ? (i, x, y, alpha) => {
        if (i === 0 || alpha < 0.04) return;
        if (count * 4 === batch.length) {
          const grown = new Float32Array(batch.length * 2);
          grown.set(batch);
          batch = grown;
        }
        const k = count++ * 4;
        batch[k] = Math.round(x * g.dpr);
        batch[k + 1] = Math.round(y * g.dpr);
        batch[k + 2] = i;
        batch[k + 3] = alpha > 1 ? 1 : alpha;
      }
    : (i, x, y, alpha) => {
        const v = alpha >= 1 ? LEVELS - 1 : ((alpha * LEVELS) | 0) - 1;
        if (i === 0 || v < 0) return;
        ctx.drawImage(a.c, i * a.gw, v * a.gh, a.gw, a.gh, (x * g.dpr - a.gw / 2) | 0, (y * g.dpr - a.gh / 2) | 0, a.gw, a.gh);
      };

  g.text = (str, x, y, alpha) => {
    for (let k = 0; k < str.length; k++) g.put(str.charCodeAt(k) - FIRST, x + k * g.cw, y, alpha);
  };

  // Send the frame; the 2d path has already drawn as it went. Pass keep to
  // draw over whatever is already in the canvas instead of clearing it.
  g.flush = (keep) => {
    if (!fast) return;
    const { gl } = fast;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (!keep) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    if (!count) return;
    gl.useProgram(fast.p);
    gl.enable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fast.tex);
    gl.uniform2f(fast.uView, canvas.width, canvas.height);
    gl.uniform1f(fast.uSize, a.gh);
    gl.uniform1f(fast.uWide, a.gw / a.gh);
    gl.uniform1f(fast.uCount, a.count);
    gl.uniform3f(fast.uInk, g.ink(), g.ink(), g.ink());
    gl.bindBuffer(gl.ARRAY_BUFFER, fast.vbo);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, batch.subarray(0, count * 4), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, count);
    count = 0;
  };

  return g;
}

// Where the pointer is in window coordinates, and how fast it is moving.
// It sits far off screen when there is no pointer.
export const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, at: 0, down: false };

const away = () => {
  mouse.x = mouse.y = -1e4;
  mouse.vx = mouse.vy = 0;
};

const track = (e) => {
  const now = performance.now();
  if (mouse.x > -1e3 && now - mouse.at < 200) {
    const dt = Math.max(8, now - mouse.at) / 1000;
    mouse.vx += ((e.clientX - mouse.x) / dt - mouse.vx) * 0.5;
    mouse.vy += ((e.clientY - mouse.y) / dt - mouse.vy) * 0.5;
  } else {
    mouse.vx = mouse.vy = 0;
  }
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.at = now;
};

window.addEventListener("pointermove", track, { passive: true });
window.addEventListener("pointerdown", track, { passive: true });
// a lifted finger should not keep pushing things around
window.addEventListener("pointerup", (e) => e.pointerType !== "mouse" && away(), { passive: true });
window.addEventListener("pointercancel", away, { passive: true });
document.documentElement.addEventListener("pointerleave", away);
window.addEventListener("pointerdown", () => (mouse.down = true), { passive: true });
window.addEventListener("pointerup", () => (mouse.down = false), { passive: true });
window.addEventListener("pointercancel", () => (mouse.down = false), { passive: true });

// pointer velocity, fading out once it stops moving
export function drift() {
  const k = Math.exp(-(performance.now() - mouse.at) / 160);
  return [mouse.vx * k, mouse.vy * k];
}

export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
