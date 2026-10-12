import { grid, mouse, drift, prng, watch, clamp } from "./glyph.js";
import { chime } from "./sound.js";

const CJK = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif';
const STEP = 1 / 60;
const REACH = 90;

// Wind chimes. Every word hangs off the rail on its own thread, and each
// thread is a small verlet chain with one node per character. The cursor
// pushes them around and so does the wind.
export function strands(canvas, words, still) {
  // the sheet holds just the characters these words use, plus the rigging
  const set = { chars: " " + [...new Set("|+o.=" + words.join(""))].join(""), family: CJK };
  const g = grid(canvas, (w) => (w < 640 ? 13 : 15), { sprites: true, set });
  const THREAD = g.index("|");
  const KNOT = g.index("+");
  const BOB = g.index("o");
  const BEAD = g.index(".");
  const RAIL = g.index("=");
  let S = [];
  let top = 0;
  let acc = 0;
  let last = -1;
  let ptr = { x: -1e4, y: -1e4, vx: 0, vy: 0, inside: false };

  function build() {
    g.fit();
    if (!g.w || !g.h) return;
    const rnd = prng(41);
    const gap = 2;
    top = g.ch * 1.5;
    const depth = Math.floor((g.h - top) / g.ch) - 3;
    const slots = Math.max(1, Math.floor((g.cols - 2) / gap));
    const x0 = (g.w - (slots - 1) * gap * g.cw) / 2;

    const hung = words
      .filter((t) => t.length <= depth - 3)
      .map((t) => [rnd(), t])
      .sort((a, b) => a[0] - b[0])
      .map((p) => p[1]);

    // spread the words across the slots and pad the rest with bare threads
    const plan = new Array(slots).fill(null);
    const count = Math.min(hung.length, slots);
    for (let i = 0; i < count; i++) plan[Math.floor(((i + 0.5) * slots) / count)] = hung[i];

    S = [];
    for (let s = 0; s < slots; s++) {
      const word = plan[s];
      const swell = 0.5 + 0.5 * Math.sin(s * 0.37 + 1.3) * Math.cos(s * 0.11);
      let chars;
      if (word) {
        const room = depth - word.length - 1;
        const lead = clamp(Math.round(1 + room * (0.15 + 0.6 * swell) + (rnd() - 0.5) * 3), 1, room);
        chars = new Array(lead).fill(THREAD);
        chars[lead - 1] = KNOT;
        for (const c of word) chars.push(g.index(c));
        chars.push(BOB);
      } else {
        const len = 2 + Math.round(depth * (0.08 + 0.3 * swell * rnd()));
        chars = new Array(len).fill(THREAD);
        chars.push(BEAD);
      }
      const n = chars.length;
      const x = new Float32Array(n);
      const y = new Float32Array(n);
      const ax = x0 + s * gap * g.cw;
      for (let i = 0; i < n; i++) {
        x[i] = ax;
        y[i] = top + i * g.ch;
      }
      S.push({
        word,
        chars,
        n,
        ax,
        x,
        y,
        px: Float32Array.from(x),
        py: Float32Array.from(y),
        first: word ? chars.indexOf(KNOT) + 1 : n,
        energy: 0,
        rung: 0,
        phase: rnd() * 6.28,
      });
    }
  }

  function step(t) {
    const rest = g.ch;
    const mvx = clamp(ptr.vx, -1800, 1800);
    const mvy = clamp(ptr.vy, -1800, 1800);
    // a gust crosses the curtain every so often
    const front = (((t * 0.07) % 1.8) - 0.4) * g.w;

    for (const s of S) {
      const { n, x, y, px, py } = s;
      const gust = Math.exp(-(((s.ax - front) / 220) ** 2)) * 0.034;
      const wind = 0.007 * Math.sin(t * 0.8 + s.ax * 0.006) + 0.003 * Math.sin(t * 1.9 + s.phase) + gust;
      let hit = 0;

      for (let i = 1; i < n; i++) {
        let vx = (x[i] - px[i]) * 0.986;
        let vy = (y[i] - py[i]) * 0.986;
        px[i] = x[i];
        py[i] = y[i];
        vx += wind;
        vy += 0.36;
        if (ptr.inside) {
          const dx = x[i] - ptr.x;
          const dy = y[i] - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REACH * REACH) {
            const d = Math.sqrt(d2) + 0.01;
            const f = 1 - d / REACH;
            vx += mvx * f * 0.0022 + (dx / d) * f * 0.5;
            vy += mvy * f * 0.0012;
            if (f > hit) hit = f;
          }
        }
        x[i] += vx;
        y[i] += vy;
      }

      for (let it = 0; it < 5; it++) {
        x[0] = s.ax;
        y[0] = top;
        for (let i = 1; i < n; i++) {
          const dx = x[i] - x[i - 1];
          const dy = y[i] - y[i - 1];
          const d = Math.sqrt(dx * dx + dy * dy) + 1e-4;
          const m = (d - rest) / d;
          if (i === 1) {
            x[i] -= dx * m;
            y[i] -= dy * m;
          } else {
            x[i] -= dx * m * 0.5;
            y[i] -= dy * m * 0.5;
            x[i - 1] += dx * m * 0.5;
            y[i - 1] += dy * m * 0.5;
          }
        }
      }

      const tip = n - 1;
      const speed = Math.abs(x[tip] - px[tip]) + Math.abs(y[tip] - py[tip]);
      s.energy += (Math.min(1, speed / 5) - s.energy) * 0.12;

      if (!s.word || t - s.rung < 0.5) continue;
      if (hit > 0.25 && speed > 1.6) {
        s.rung = t;
        chime(s.n, Math.min(1, speed / 9));
      } else if (gust > 0.03 && Math.random() < 0.004) {
        // the odd one rings quietly as a gust goes through
        s.rung = t;
        chime(s.n, 0.18);
      }
    }
  }

  function draw() {
    g.clear();
    const y0 = top - g.ch;
    for (let c = 0; c < g.cols; c++) g.put(RAIL, c * g.cw + g.cw / 2, y0, 0.22);

    let near = null;
    let best = 26;
    if (ptr.inside) {
      for (const s of S) {
        if (!s.word) continue;
        const mid = (s.first + s.n - 1) >> 1;
        const d = Math.abs(s.x[mid] - ptr.x) + Math.max(0, Math.abs(s.y[mid] - ptr.y) - (s.n - s.first) * g.ch * 0.5);
        if (d < best) {
          best = d;
          near = s;
        }
      }
    }

    for (const s of S) {
      const { n, x, y, chars, first, energy } = s;
      const lit = s === near ? 1 : 0;
      for (let i = 0; i < n; i++) {
        const c = chars[i];
        let a;
        if (i >= first && i < n - 1 && c !== THREAD) a = 0.55 + 0.45 * Math.max(energy, lit);
        else if (c === THREAD || c === BEAD) a = s.word ? 0.2 + 0.2 * lit : 0.13;
        else a = 0.55 + 0.4 * lit;
        g.put(c, x[i], y[i], a);
      }
    }

  }

  function frame(t) {
    if (!S.length) return;
    const dt = last < 0 ? STEP : Math.min(0.05, t - last);
    last = t;
    const r = canvas.getBoundingClientRect();
    const [vx, vy] = drift();
    const x = mouse.x - r.left;
    const y = mouse.y - r.top;
    ptr = { x, y, vx, vy, inside: x >= 0 && y >= 0 && x <= r.width && y <= r.height };
    if (!still) {
      acc = Math.min(acc + dt, STEP * 3);
      while (acc >= STEP) {
        step(t);
        acc -= STEP;
      }
    }
    draw();
    g.flush();
  }

  watch(() => g.fit());

  return { el: canvas, frame, resize: build };
}
