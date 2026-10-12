// Builds the animated SVGs the README uses, out of the same code the page
// runs. Serve the repo, open readme/build.html and save the three files it
// offers into this folder.

import { RAMPS } from "../js/glyph.js";
import { HEAD, TAIL, SCENES } from "../js/scenes.js";
import { nameplate } from "../js/name.js";
import { chimes } from "../js/data.js";

// one character cell, in svg units
const CW = 6;
const CH = 10;
const INK = "#dedede";
const DIM = "#6a6a6a";
const PAPER = "#0b0b0b";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
const HAN = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif';

// Everything is drawn a hair under full opacity. Browsers colour-fringe small
// text on a solid ground otherwise, and it shows on glyphs this dense.
const OPEN = '<g opacity="0.99">';

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const blank = (cols, rows) => Array.from({ length: rows }, () => new Array(cols).fill(" "));

// One line of characters as svg text. Each piece is pinned to its column and
// given the width it should take up, so the picture holds together whatever
// monospace font the reader's machine has. A sparse line goes out as separate
// runs and a busy one whole, whichever comes to less.
function line(text, r) {
  const pin = (s, col) => `<text x="${col * CW}" y="${(r + 1) * CH - 2}" textLength="${s.length * CW}">${esc(s)}</text>`;
  const whole = text.trim() ? pin(text.trim(), text.length - text.trimStart().length) : "";
  const runs = [...text.matchAll(/\S+(?: \S+)*/g)].map((run) => pin(run[0], run.index)).join("");
  return runs.length < whole.length ? runs : whole;
}

// A run of frames as one svg. Each frame is a group that is only visible for
// its own slice of the loop. Lines that never change are written once.
function film(frames, fps, label) {
  const rows = frames[0].length;
  const cols = frames[0][0].length;
  const text = frames.map((f) => f.map((cells) => cells.join("").trimEnd()));
  const fixed = text[0].map((first, r) => text.every((f) => f[r] === first));
  const loop = (frames.length / fps).toFixed(2);
  const groups = text
    .map((f, i) => `<g style="animation-delay:${(i / fps).toFixed(2)}s">${f.map((t, r) => (fixed[r] ? "" : line(t, r))).join("")}</g>`)
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 ${cols * CW} ${rows * CH}" role="img" aria-label="${label}">
<style>
text { font: ${CH}px ${MONO}; fill: ${INK}; white-space: pre; }
.f g { visibility: hidden; animation: f ${loop}s step-end infinite; }
@keyframes f { 0% { visibility: visible; } ${(100 / frames.length).toFixed(3)}% { visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .f g { animation: none; } .f g:first-child { visibility: visible; } }
</style>
<rect width="100%" height="100%" fill="${PAPER}"/>
${OPEN}
${text[0].map((t, r) => (fixed[r] ? line(t, r) : "")).join("")}
<g class="f">
${groups}
</g>
</g>
</svg>
`;
}

// The arm, run through a short routine: it lifts the ball and lets it bounce,
// then does the same with the block, which does not. Everything ends up back
// where it began, so the loop has no seam. The scene is raymarched exactly as
// it is on the page, read back, and turned into characters here instead of
// on the GPU.
function arm(cols, rows, fps) {
  const scene = SCENES.arm;
  const ramp = RAMPS.standard;
  const w = cols * 2;
  const h = rows * 2;
  const canvas = Object.assign(document.createElement("canvas"), { width: w, height: h });
  const gl = canvas.getContext("webgl");
  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, "attribute vec4 a; void main() { gl_Position = vec4(a.xy, 0.0, 1.0); }"));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, HEAD + scene.src + TAIL));
  gl.bindAttribLocation(prog, 0, "a");
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 3, -1, 0, 0, -1, 3, 0, 0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
  const at = (name) => gl.getUniformLocation(prog, name);

  const aspect = (cols * CW) / (rows * CH);
  const fit = Math.max(1, scene.aspect / aspect);
  gl.uniform2f(at("uRes"), w, h);
  gl.uniform1f(at("uAspect"), aspect);
  gl.uniform1f(at("uFit"), fit);

  // where the cursor goes: seconds, then across and down the picture, then
  // whether the button is held
  const path = [
    [0.0, 0.766, 0.41, 0],
    [0.3, 0.248, 0.93, 0],
    [2.4, 0.248, 0.93, 1],
    [2.7, 0.248, 0.22, 1],
    [4.3, 0.248, 0.22, 0],
    [4.5, 0.752, 0.93, 0],
    [6.8, 0.752, 0.93, 1],
    [7.1, 0.752, 0.22, 1],
    [9.2, 0.752, 0.22, 0],
    [9.5, 0.766, 0.41, 0],
    [11.2, 0.766, 0.41, 0],
  ];
  const state = {};
  const view = { wide: aspect * fit, tall: fit, u: 0.5, v: 0.3, over: true, down: false };
  const px = new Uint8Array(w * h * 4);
  const frames = [];
  const end = path[path.length - 1][0];

  for (let i = 0, leg = 0; i / 60 < end; i++) {
    const t = i / 60;
    while (path[leg + 1][0] <= t) leg++;
    const [t0, u0, v0, held] = path[leg];
    const [t1, u1, v1] = path[leg + 1];
    const k = Math.min(1, (t - t0) / Math.min(0.5, t1 - t0));
    view.u = u0 + (u1 - u0) * k;
    view.v = v0 + (v1 - v0) * k;
    view.down = held > 0;
    const pose = scene.drive(state, t, 1 / 60, view, false);
    state.hits.length = 0;
    if (i % (60 / fps)) continue;

    gl.uniform1f(at("uTime"), t);
    gl.uniform1f(at("uAmt"), 0);
    gl.uniform2f(at("uLook"), 0, 0);
    gl.uniform4f(at("uPose"), pose[0], pose[1], pose[2], pose[3]);
    gl.uniform3fv(at("uObj"), state.objs);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);

    const cells = blank(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // four samples to a cell, the picture's first row being the buffer's last
        const y = h - 2 - r * 2;
        const sum = px[(y * w + c * 2) * 4] + px[(y * w + c * 2 + 1) * 4] + px[((y + 1) * w + c * 2) * 4] + px[((y + 1) * w + c * 2 + 1) * 4];
        const l = Math.min(1, Math.pow(sum / 1020, scene.gamma) * scene.gain);
        cells[r][c] = ramp[Math.min(ramp.length - 1, Math.floor(l * ramp.length))];
      }
    }
    frames.push(cells);
  }
  return film(frames, fps, "A robot arm drawn in characters picks up a ball and a block and drops them");
}

// The name, from the page's own name plate. It draws through a stand-in for
// the stage that writes into a grid of characters instead of a canvas. The
// plate sizes itself off the window as well as its box, so build this in a
// window at least 900 tall or it comes out small.
function name(cols, fps, seconds) {
  const box = document.body.appendChild(document.createElement("div"));
  box.style.cssText = `position: absolute; left: 0; top: 0; width: ${cols * CW}px; visibility: hidden;`;
  const plate = nameplate(box);
  let cells = null;
  const stage = {
    cw: CW,
    ch: CH,
    put(i, x, y) {
      const c = Math.round(x / CW - 0.5);
      const r = Math.round(y / CH - 0.5);
      if (cells[r] && c >= 0 && c < cols) cells[r][c] = String.fromCharCode(32 + i);
    },
  };
  plate.layout(stage, { left: 0, top: 0 });
  const rows = Math.round(box.offsetHeight / CH);
  box.remove();

  const out = { x: 0, y: 0, loose: false };
  const fx = { spread: 0, fade: 1, out, warp: (x, y, o) => Object.assign(o, { x, y, loose: false }) };
  const frames = [];
  for (let i = 0; i < seconds * fps; i++) {
    cells = blank(cols, rows);
    plate.draw(stage, i / fps, fx);
    frames.push(cells);
  }
  return film(frames, fps, "John Wynter, set in characters that flicker and tear");
}

// The wind chimes. On the page each thread is a chain with its own physics.
// Here each one just swings from the rail at its own pace.
function hang(width, height) {
  const step = 14;
  const gap = 22;
  const top = 14;
  const slots = Math.floor((width - 16) / gap);
  const x0 = (width - (slots - 1) * gap) / 2;
  const depth = Math.floor((height - top) / step) - 2;
  const words = chimes.filter((w) => w.length <= depth - 3);
  let threads = "";
  for (let s = 0; s < slots; s++) {
    const word = s % 2 ? words[(s >> 1) % words.length] : "";
    const swell = 0.5 + 0.5 * Math.sin(s * 0.37 + 1.3) * Math.cos(s * 0.11);
    const lead = word ? 1 + Math.round((depth - word.length - 2) * (0.1 + 0.7 * swell)) : 2 + Math.round(depth * 0.3 * swell);
    const x = x0 + s * gap;
    // the thread is a dashed line, which stays crisp where a column of bars would not
    const chars = word ? ["+", ...word, "o"] : ["."];
    const body =
      `<line x1="${x}" y1="${top + 4}" x2="${x}" y2="${top + lead * step + 2}"/>` +
      chars.map((c, i) => `<text x="${x}" y="${top + (lead + i + 1) * step}" class="${c > "~" ? "h" : "d"}">${c}</text>`).join("");
    const pace = (3.2 + 2.4 * ((s * 0.618) % 1)).toFixed(2);
    threads += `<g class="t" style="transform-origin:${x}px ${top}px;animation-duration:${pace}s;animation-delay:-${((s * 1.37) % 5).toFixed(2)}s">${body}</g>\n`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Chinese characters hanging on threads like wind chimes, swaying">
<style>
text { font: 12px ${MONO}; fill: ${INK}; text-anchor: middle; }
.d { fill: ${DIM}; }
.h { font-family: ${HAN}; }
line { stroke: ${DIM}; stroke-dasharray: 8 6; }
.t { animation: sway 4s ease-in-out infinite alternate; }
@keyframes sway { from { transform: rotate(-2.4deg); } to { transform: rotate(2.8deg); } }
@media (prefers-reduced-motion: reduce) { .t { animation: none; } }
</style>
<rect width="100%" height="100%" fill="${PAPER}"/>
${OPEN}
<text x="${width / 2}" y="${top}" class="d" textLength="${width - 12}">${"=".repeat(Math.floor(width / 7))}</text>
${threads}</g>
</svg>
`;
}

await document.fonts.load('100px "Anton"', "JOHNWYTER");
const files = { "name.svg": name(100, 8, 2.75), "arm.svg": arm(84, 38, 10), "chimes.svg": hang(840, 300) };
for (const [file, svg] of Object.entries(files)) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const kb = (svg.length / 1024).toFixed(0);
  document.body.insertAdjacentHTML("beforeend", `<p><a href="${url}" download="${file}">${file}</a> ${kb} kB</p><img src="${url}" alt="">`);
}
