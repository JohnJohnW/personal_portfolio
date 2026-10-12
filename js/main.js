import { me, projects, experience, education, certs, toolkit } from "./data.js";

const FORM_KEY = "e3f86196-c795-4d77-b6a4-b03183583b4d";
const SHOWN = 8;
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
</li>`;
}

function role(e) {
  if (e.roles) {
    const sub = e.roles
      .map((r) => `<li><h4>${esc(r.role)}<span>${r.when}</span></h4><p>${esc(r.note)}</p></li>`)
      .join("");
    return `<li class="role"><p class="r-when">${e.when}</p><div><h3>${esc(e.org)}</h3><ul class="r-sub">${sub}</ul></div></li>`;
  }
  const detail = e.points
    ? `<ul class="r-points">${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
    : e.note
      ? `<p class="r-note">${esc(e.note)}</p>`
      : "";
  return `<li class="role"><p class="r-when">${e.when}</p><div><h3>${esc(e.role)}</h3><p class="r-org">${esc(e.org)}</p>${detail}</div></li>`;
}

function render() {
  const years = projects.map((p) => p.year);
  $("#work-note").textContent = `${projects.length} projects, ${Math.min(...years)} to ${Math.max(...years)}. Security and compliance tooling, legal tech and hackathon builds.`;
  $("#projects").innerHTML = projects.map(project).join("");
  for (const li of $$("#projects .project")) {
    li.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && scramble($(".p-title", li)));
  }

  const more = $("#more");
  if (projects.length > SHOWN) {
    more.textContent = `Show all ${projects.length} projects`;
    more.addEventListener("click", () => {
      const hidden = $$("#projects [hidden]");
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
    .map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join("<br>")}</dd></div>`)
    .join("");

  $("#roles").innerHTML = experience.map(role).join("");

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

render();
chrome();
contact();
