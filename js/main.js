import { me, projects, experience, education, certs, toolkit, chimes } from "./data.js";
import { settings, set, watch, RAMPS } from "./glyph.js";
import { plate } from "./plate.js";
import { strands } from "./strands.js";
import { sketch } from "./sketches.js";
import { nameplate } from "./name.js";

const FORM_KEY = "e3f86196-c795-4d77-b6a4-b03183583b4d";
// how many projects are listed before the rest are asked for; fewer on a phone
const SHOWN = matchMedia("(max-width: 640px)").matches ? 5 : 8;
const LINK_NAMES = { live: "Live site", repo: "Source", demo: "Demo", video: "Video", govhack: "GovHack page" };
const NOISE = "/\\|-_=+*#<>[]";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n, w = 2) => String(n).padStart(w, "0");
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const ext = (href) => (href.startsWith("http") ? ' target="_blank" rel="noopener"' : "");

// settle a piece of text out of noise, left to right
function scramble(el) {
  const to = el.dataset.text ?? (el.dataset.text = el.textContent);
  cancelAnimationFrame(el.raf);
  if (still) return;
  const start = performance.now();
  const dur = 300 + to.length * 28;
  const step = (now) => {
    const k = (now - start) / dur;
    let out = "";
    for (let i = 0; i < to.length; i++) {
      const c = to[i];
      out += c === " " || k * to.length > i + Math.random() * 3 ? c : NOISE[(Math.random() * NOISE.length) | 0];
    }
    el.textContent = out;
    if (k < 1.2) el.raf = requestAnimationFrame(step);
    else el.textContent = to;
  };
  el.raf = requestAnimationFrame(step);
}

function project(p, i) {
  const tags = p.stack.length ? `<ul class="tags">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : "";
  const links = p.links.length
    ? `<p class="p-links">${p.links.map((l) => `<a href="${l.href}"${ext(l.href)}>${LINK_NAMES[l.label] || l.label}</a>`).join("")}</p>`
    : "";
  return `<li class="project"${i >= SHOWN ? " hidden" : ""}>
<p class="p-no">${pad(i + 1)}</p>
<div>
<h3><span class="p-title">${esc(p.title)}</span><span class="p-year">${p.year}</span></h3>
<p class="p-desc">${esc(p.desc)}</p>
${tags}
${links}
</div>
<canvas class="plot" data-kind="${p.sketch}" aria-hidden="true"></canvas>
</li>`;
}

// The detail of a role sits in a <details>. On a phone it folds away behind
// its heading; on anything wider it is held open and the toggle is hidden.
const fold = (inner) => (inner ? `<details class="r-more"><summary>details</summary>${inner}</details>` : "");

function role(e) {
  if (e.roles) {
    const sub = e.roles
      .map((r) => `<li><h4>${esc(r.role)}<span>${r.when}</span></h4><p>${esc(r.note)}</p></li>`)
      .join("");
    return `<li class="role"><p class="r-when">${e.when}</p><div><h3>${esc(e.org)}</h3>${fold(`<ul class="r-sub">${sub}</ul>`)}</div></li>`;
  }
  const detail = e.points
    ? `<ul class="r-points">${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
    : e.note
      ? `<p class="r-note">${esc(e.note)}</p>`
      : "";
  return `<li class="role"><p class="r-when">${e.when}</p><div><h3>${esc(e.role)}</h3><p class="r-org">${esc(e.org)}</p>${fold(detail)}</div></li>`;
}

function render() {
  const years = projects.map((p) => p.year);
  $("#projects-note").textContent = `${projects.length} projects, ${Math.min(...years)} to ${Math.max(...years)}. Security and compliance tooling, legal tech and hackathon builds.`;
  $("#project-list").innerHTML = projects.map(project).join("");
  for (const li of $$("#project-list .project")) {
    li.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && scramble($(".p-title", li)));
  }

  const more = $("#more");
  if (projects.length > SHOWN) {
    more.textContent = `Show all ${projects.length} projects`;
    more.addEventListener("click", () => {
      const hidden = $$("#project-list [hidden]");
      hidden.forEach((li) => (li.hidden = false));
      more.hidden = true;
      // keep keyboard users where the new entries start
      hidden[0].tabIndex = -1;
      hidden[0].focus({ preventScroll: true });
    });
  } else {
    more.hidden = true;
  }

  $("#tools").innerHTML = toolkit
    .map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map((i) => `<span>${esc(i)}</span>`).join(" ")}</dd></div>`)
    .join("");

  $("#roles").innerHTML = experience.map(role).join("");
  const phone = matchMedia("(max-width: 640px)");
  const unfold = () => $$(".r-more").forEach((d, i) => (d.open = !phone.matches || i === 0));
  phone.addEventListener("change", unfold);
  unfold();

  $("#education").innerHTML = education
    .map((e) => `<li class="role"><div><h3>${esc(e.degree)}</h3><p class="r-org">${esc(e.org)}</p><p class="r-when">${e.when}</p></div></li>`)
    .join("");

  $("#certs").innerHTML = certs
    .map(
      (c) =>
        `<li class="role"><div><h3>${c.href ? `<a href="${c.href}"${ext(c.href)}>${esc(c.name)}</a>` : esc(c.name)}</h3><p class="r-org">${esc(c.org)}${c.code ? ", " + c.code : ""}</p><p class="r-when">${c.when}</p></div></li>`
    )
    .join("");

  $("#socials").innerHTML = me.socials
    .map((s) => {
      const row = `<span>${s.label}</span><span>${esc(s.text)}</span>`;
      // not everything has somewhere to link to
      return s.href ? `<li><a href="${s.href}"${ext(s.href)}>${row}</a></li>` : `<li><div>${row}</div></li>`;
    })
    .join("");

  $("#year").textContent = new Date().getFullYear();
}

function chrome() {
  const fmt = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const clock = $("#clock");
  const beat = () => (clock.textContent = fmt.format(new Date()));
  beat();
  setInterval(beat, 1000);

  const pos = $("#pos");
  window.addEventListener(
    "pointermove",
    (e) => {
      pos.textContent = `col ${pad((e.clientX / 4.8) | 0, 3)} row ${pad(((e.clientY + scrollY) / 9) | 0, 3)}`;
    },
    { passive: true }
  );

  const where = $("#where");
  const links = $$(".top nav a");
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const n = links.findIndex((a) => a.hash === "#" + e.target.id);
        links.forEach((a, i) => a.classList.toggle("on", i === n));
        where.textContent = `${pad(n + 1)} ${e.target.id}`;
      }
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main > section").forEach((s) => spy.observe(s));

  // headings settle out of noise the first time they scroll into view
  const heads = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        scramble(e.target);
        heads.unobserve(e.target);
      }
    },
    { threshold: 0.6 }
  );
  $$("[data-scramble]").forEach((h) => heads.observe(h));
}

function controls() {
  const buttons = Object.fromEntries($$(".bar [data-set]").map((b) => [b.dataset.set, b]));
  const names = Object.keys(RAMPS);
  const actions = {
    ramp: () => set("ramp", names[(names.indexOf(settings.ramp) + 1) % names.length]),
    light: () => set("light", !settings.light),
    sound: () => set("sound", !settings.sound),
  };

  watch((key, value) => {
    $("b", buttons[key]).textContent = typeof value === "boolean" ? (value ? "on" : "off") : value;
    if (key === "light") {
      document.documentElement.toggleAttribute("data-light", value);
      $('meta[name="theme-color"]').content = value ? "#ebebeb" : "#0b0b0b";
    }
  });

  for (const [key, b] of Object.entries(buttons)) b.addEventListener("click", actions[key]);

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest("input, textarea, select")) return;
    const k = e.key.toLowerCase();
    if (k === "r") actions.ramp();
    else if (k === "i") actions.light();
    else if (k === "s") actions.sound();
  });
}

function contact() {
  const form = $("#form");
  const status = $("#form-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get("botcheck")) return;
    const body = new URLSearchParams();
    body.append("access_key", FORM_KEY);
    for (const k of ["name", "email", "message"]) body.append(k, fd.get(k) || "");
    status.textContent = "Sending...";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = "Sent. Thanks, I will get back to you.";
    } catch {
      status.textContent = `That did not send. Please email ${me.email} instead.`;
    }
  });
}

// The fonts the drawings are cut from. Their stylesheet loads on the side, so
// it has to have landed before the faces in it can be asked for.
async function fonts() {
  const sheet = $("#fonts");
  if (sheet.media !== "all") await new Promise((done) => sheet.addEventListener("load", done, { once: true }));
  await Promise.all([document.fonts.load('12px "IBM Plex Mono"'), document.fonts.load('100px "Anton"', "JOHNWYTER")]);
}

async function stage() {
  const form = $("#form");
  const pieces = [];

  // Building a figure sets its shaders compiling, which is the slow part, so
  // that starts now and runs while the fonts are still on their way.

  for (const canvas of $$("canvas.plate")) {
    const scene = canvas.dataset.scene;
    const opts = { still };
    // the arm shares a stage the size of the whole hero with the name
    if (scene === "arm") Object.assign(opts, { box: $(".hero-figure"), scatter: true, overlay: nameplate($(".hero-name")) });
    // the hands close the gap while someone is writing a message
    if (scene === "hands") opts.pull = () => form.contains(document.activeElement);
    pieces.push(plate(canvas, scene, opts));
  }

  pieces.push(strands($(".threads"), chimes, still));

  for (const canvas of $$("canvas.plot")) pieces.push(sketch(canvas, canvas.dataset.kind, still));

  // The glyph sheets are cut from the page fonts, so nothing is sized or
  // drawn until those are in, or have had long enough.
  if (document.fonts) await Promise.race([fonts(), new Promise((r) => setTimeout(r, 1800))]).catch(() => {});

  // One drawing failing must not take the others down with it, so a piece
  // that throws is reported once and then left alone.
  const run = (p, t) => {
    try {
      p.frame(t);
    } catch (err) {
      p.on = false;
      p.broken = true;
      console.error(err);
    }
  };
  const paint = (p) => run(p, performance.now() / 1000);
  const find = (el) => pieces.find((p) => p.el === el);
  const seen = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const p = find(e.target);
        p.on = e.isIntersecting && !p.broken;
        if (still && p.on) paint(p);
      }
    },
    { rootMargin: "100px" }
  );
  const sized = new ResizeObserver((entries) => {
    for (const e of entries) {
      const p = find(e.target);
      p.resize();
      if (still) paint(p);
    }
  });
  for (const p of pieces) {
    p.resize();
    seen.observe(p.el);
    sized.observe(p.el);
  }

  if (still) {
    const all = () => pieces.forEach((p) => p.on && paint(p));
    watch(all);
    // a figure whose shaders were still compiling drew nothing the first
    // time it was asked, so ask again for a few seconds
    let asks = 0;
    const again = setInterval(() => {
      all();
      if (++asks === 12) clearInterval(again);
    }, 400);
    return;
  }
  const tick = (now) => {
    for (const p of pieces) if (p.on) run(p, now / 1000);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

render();
chrome();
controls();
contact();
stage();
