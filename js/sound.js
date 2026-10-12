import { settings } from "./glyph.js";

// A pentatonic set of tubes, high like real wind chimes. Longer threads ring lower.
const SCALE = [2093.0, 1760.0, 1567.98, 1318.51, 1174.66, 1046.5, 880.0, 783.99, 659.25, 587.33, 523.25];
// A struck tube rings at these multiples of its fundamental, not at whole
// harmonics, which is what makes it sound like metal. [ratio, level, seconds]
const PARTIALS = [
  [1, 1, 3.2],
  [2.756, 0.45, 1.9],
  [5.404, 0.2, 0.9],
  [8.933, 0.08, 0.4],
];

let ac = null;
let out = null;
let voices = 0;

function start() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  out = ac.createGain();
  out.gain.value = 0.11;

  // two short feedback delays stand in for a bit of air around the chimes
  const wet = ac.createGain();
  wet.gain.value = 0.3;
  for (const [time, feedback] of [
    [0.19, 0.34],
    [0.31, 0.28],
  ]) {
    const delay = ac.createDelay(1);
    const loop = ac.createGain();
    delay.delayTime.value = time;
    loop.gain.value = feedback;
    out.connect(delay);
    delay.connect(loop).connect(delay);
    delay.connect(wet);
  }
  out.connect(ac.destination);
  wet.connect(ac.destination);
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

export function chime(length, force = 0.5) {
  if (!settings.sound || !ac || ac.state !== "running" || voices > 36) return;
  const f = SCALE[Math.min(SCALE.length - 1, Math.max(0, Math.round((length - 5) / 2)))];
  // no two tubes are cut quite the same
  const tune = 1 + (Math.random() - 0.5) * 0.006;
  const now = ac.currentTime;
  for (const [ratio, level, decay] of PARTIALS) {
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.frequency.value = f * ratio * tune;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(level * (0.2 + 0.8 * force), now + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(env).connect(out);
    osc.start(now);
    osc.stop(now + decay + 0.05);
    voices++;
    osc.onended = () => voices--;
  }
}
