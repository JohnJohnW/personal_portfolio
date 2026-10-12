import { shade, clamp } from "./glyph.js";

const LINES = ["JOHN", "WYNTER"];
const DISPLAY = '"Anton", Impact, "Arial Narrow", sans-serif';
const TRACK = 7;

// The name, set in a display face off screen and read back as cell coverage,
// then drawn out of characters on the hero stage. It never quite sits still:
// the fill drifts, odd cells flicker, and now and then a band of rows tears
// sideways for a moment.
export function nameplate(box) {
  let key = "";
  let n = 0;
  let hx = null;
  let hy = null;
  let cov = null;
  let sx = null;
  let sy = null;
  let tear = { until: 0, next: 2, y0: 0, y1: 0, dx: 0 };

  function layout(g, rect) {
    const width = box.clientWidth;
    const k0 = width + ":" + g.cw + ":" + g.ch;
    const b0 = box.getBoundingClientRect();
    const at = k0 + ":" + Math.round(b0.left - rect.left) + ":" + Math.round(b0.top - rect.top);
    if (at === key || !width) return;

    const probe = document.createElement("canvas").getContext("2d");
    probe.font = `100px ${DISPLAY}`;
    // tracked out by hand, otherwise neighbouring letters fuse at cell resolution
    const span = (s) => [...s].reduce((w, c) => w + probe.measureText(c).width + TRACK, -TRACK);
    const widest = Math.max(...LINES.map(span));
    const cap = probe.measureText("H").actualBoundingBoxAscent;
    const step = cap * 1.13;
    const block = cap + (LINES.length - 1) * step;
    const size = Math.min((100 * width) / widest, (100 * window.innerHeight * 0.36) / block);
    const k = size / 100;

    const cols = Math.max(1, Math.round((widest * k) / g.cw));
    const rows = Math.max(1, Math.ceil((block * k) / g.ch));
    box.style.height = rows * g.ch + "px";

    const ss = 3;
    const c = document.createElement("canvas");
    c.width = cols * ss;
    c.height = rows * ss;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.setTransform(ss / g.cw, 0, 0, ss / g.ch, 0, 0);
    x.font = `${size}px ${DISPLAY}`;
    x.fillStyle = "#fff";
    LINES.forEach((s, i) => {
      let pen = 0;
      for (const ch of s) {
        x.fillText(ch, pen, (cap + i * step) * k);
        pen += x.measureText(ch).width + TRACK * k;
      }
    });
    const d = x.getImageData(0, 0, c.width, c.height).data;

    const b = box.getBoundingClientRect();
    const x0 = Math.round((b.left - rect.left) / g.cw) * g.cw + g.cw / 2;
    const y0 = Math.round((b.top - rect.top) / g.ch) * g.ch + g.ch / 2;
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        let sum = 0;
        for (let j = 0; j < ss; j++) {
          for (let i = 0; i < ss; i++) sum += d[((r * ss + j) * c.width + q * ss + i) * 4 + 3];
        }
        const v = sum / (ss * ss * 255);
        if (v > 0.1) list.push(x0 + q * g.cw, y0 + r * g.ch, v);
      }
    }

    n = list.length / 3;
    hx = new Float32Array(n);
    hy = new Float32Array(n);
    cov = new Float32Array(n);
    sx = new Float32Array(n);
    sy = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      hx[i] = list[i * 3];
      hy[i] = list[i * 3 + 1];
      cov[i] = list[i * 3 + 2];
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
      const m = 140 + Math.random() * 460;
      sx[i] = Math.cos(a) * m;
      sy[i] = Math.sin(a) * m;
    }
    const b1 = box.getBoundingClientRect();
    key = k0 + ":" + Math.round(b1.left - rect.left) + ":" + Math.round(b1.top - rect.top);
  }

  // fx: { spread, fade, warp(x, y, out), out } supplied by the stage
  function draw(g, t, fx) {
    if (!n) return;
    if (t > tear.next) {
      const h = 2 + Math.floor(Math.random() * 5);
      const top = hy[0] + Math.random() * (hy[n - 1] - hy[0]);
      tear = {
        until: t + 0.09 + Math.random() * 0.1,
        next: t + 1.6 + Math.random() * 3.4,
        y0: top,
        y1: top + h * g.ch,
        dx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.floor(Math.random() * 6)) * g.cw,
      };
    }
    const torn = t < tear.until;
    const { spread, fade, out } = fx;

    for (let i = 0; i < n; i++) {
      let x = hx[i];
      let y = hy[i];
      // keep the fill inside the dense end of the ramp so the letterforms hold
      let l = cov[i] * cov[i] * (0.86 + 0.14 * Math.sin(x * 0.021 + t * 0.9 + Math.sin(y * 0.05 - t * 0.6) * 1.6));
      let loose = Math.random() < 0.006;

      if (torn && y >= tear.y0 && y < tear.y1) {
        x += tear.dx;
        loose = true;
      }
      if (spread > 0.001) {
        x += sx[i] * spread;
        y += sy[i] * spread;
        loose = true;
      }
      fx.warp(x, y, out);
      if (loose || out.loose) l = clamp(l + (Math.random() - 0.5) * 0.6, 0.06, 1);
      g.put(shade(l), out.x, out.y, (0.3 + 0.7 * l) * fade);
    }
  }

  return { layout, draw };
}
