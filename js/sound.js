import { settings } from "./glyph.js";

let ac = null;
let out = null;

function start() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  out = ac.createGain();
  out.gain.value = 0.11;
  out.connect(ac.destination);
}

// Browsers only let a page make sound after a click, tap or key press, so
// the context is created on the first one of those.
function wake() {
  if (!ac) start();
  if (ac && ac.state === "suspended") ac.resume();
}
window.addEventListener("pointerdown", wake, { passive: true });
window.addEventListener("keydown", wake, { passive: true });

// Something landing on the floor: a low thump for the heavy things, a short
// knock for the light ones.
export function thud(mass, speed) {
  if (!settings.sound || !ac || ac.state !== "running") return;
  const heavy = mass > 3;
  const now = ac.currentTime;
  const last = heavy ? 0.3 : 0.09;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = heavy ? "sine" : "triangle";
  osc.frequency.setValueAtTime(heavy ? 130 : 480, now);
  osc.frequency.exponentialRampToValueAtTime(heavy ? 40 : 240, now + last * 0.6);
  env.gain.setValueAtTime(Math.min(1, speed / 6) * (heavy ? 2.2 : 0.5), now);
  env.gain.exponentialRampToValueAtTime(0.0001, now + last);
  osc.connect(env).connect(out);
  osc.start(now);
  osc.stop(now + last + 0.02);
}
