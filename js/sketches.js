import { grid, watch } from "./glyph.js";

// One small animated drawing per project, each about what the project does.
// A sketch draws onto a 46 x 12 character stage through s.put(x, y, text, alpha).
const W = 46;
const H = 12;
const FIRST = 32;

const rows = (s, x, y, lines, a) => lines.forEach((line, i) => s.put(x, y + i, line, a));
const cycle = (t, rate, n) => Math.floor(t * rate) % n;
const blink = (t, rate = 2) => (Math.floor(t * rate) % 2 ? 1 : 0.35);

const SKETCHES = {
  // An agent asks to pay. Each request walks the layers to the vault on
  // chain: inside the mandate it goes through, over the cap the chain
  // reverts it, and nothing the agent says can change that.
  vault(s, t) {
    const asks = [
      { amt: "0.001 ETH", to: "alice", ok: true },
      { amt: "0.0005 ETH", to: "oracle", ok: true },
      { amt: "0.9 ETH", to: "0xbad..", ok: false },
    ];
    const a = asks[Math.floor(t / 4) % asks.length];
    // how far this request has travelled, 0 to 1
    const p = (t % 4) / 4;
    const col = Math.floor(p * 36);

    s.put(0, 1, "[ agent ]", 0.9);
    s.put(2, 2, "plan", 0.4);
    s.put(9, 1, "->", 0.4);
    s.put(11, 1, "[policy]", col >= 9 ? 0.9 : 0.5);
    s.put(19, 1, "->", 0.4);
    s.put(21, 1, "[ sim ]", col >= 19 ? 0.9 : 0.5);
    s.put(28, 1, "->", 0.4);
    rows(s, 30, 0, ["+----------+", "|  VAULT   |", "| on-chain |", "+----------+"], 0.9);

    // the request moves right along the row under the boxes
    s.put(Math.min(col, 25), 4, a.amt + " to " + a.to, 1);

    // the mandate the chain enforces, stated under the vault
    s.put(30, 5, "cap 0.001/tx", 0.5);
    s.put(30, 6, "window 0.005", 0.5);
    s.put(30, 7, "allowlist", 0.5);

    if (p >= 0.8) {
      if (a.ok) s.put(0, 9, "ok: inside the mandate, executed", 0.9);
      else {
        s.put(0, 9, "! reverted: AbovePerTxCap", blink(t, 3));
        s.put(0, 10, "the chain does not trust the agent", 0.6);
      }
    } else {
      const stage = ["policy", "simulate", "vault"][Math.min(2, Math.floor(p * 3.75))];
      s.put(0, 9, "checking " + stage + "...", 0.4);
    }
    s.put(0, 11, "[kill switch]", blink(t, 0.5));
  },

  // a law degree fanning out into the careers the guide covers
  pathways(s, t) {
    const ends = ["clerkship", "in-house", "policy", "legal tech", "community law"];
    const on = cycle(t, 0.7, ends.length);
    s.put(0, 5, "law degree --", 0.9);
    ends.forEach((e, i) => {
      const y = 1 + i * 2;
      s.put(13, y, "+" + "-".repeat(11), 0.4);
      if (i < ends.length - 1) s.put(13, y + 1, "|", 0.4);
      s.put(26, y, e, i === on ? 1 : 0.5);
    });
    s.put(14 + Math.floor(((t * 0.7) % 1) * 11), 1 + on * 2, ">", 1);
  },

  // A statute read line by line. The provisions that matter land on the
  // index's data pillars, 6 and 7, with the section they came from, and a
  // person signs each one off.
  statute(s, t) {
    const page = ["Part 3 =======", "== ==== ======", "=== ====== ===", "==== == ======", "= ===== ======", "=== ==== === =", "====== == ===="];
    const finds = [
      { line: 2, sec: "s.26(1)", pillar: 6, what: "cross-border transfer" },
      { line: 5, sec: "s.13(2)", pillar: 7, what: "consent to process" },
    ];
    const f = finds[Math.floor(t / 4) % finds.length];
    // how far through reading this provision, 0 to 1
    const p = (t % 4) / 4;
    const read = Math.min(page.length - 1, Math.floor(p * 14));

    s.put(0, 0, "+-- statute ---+", 0.6);
    page.forEach((line, i) => {
      const found = i === f.line && read >= i;
      s.put(0, 1 + i, "|", 0.6);
      s.put(1, 1 + i, found ? (f.sec + " " + line).slice(0, 14) : line, found ? 1 : i === read ? 0.8 : 0.3);
      s.put(15, 1 + i, "|", 0.6);
    });
    s.put(0, 8, "+" + "-".repeat(14) + "+", 0.6);

    // the provision travels across to its pillar
    if (p > 0.45 && p < 0.62) {
      const head = Math.floor(((p - 0.45) / 0.17) * 6);
      s.put(17, 1 + f.line, "-".repeat(head) + ">", 0.9);
    }

    s.put(25, 0, "RDTII pillars", 0.6);
    for (let i = 0; i < 12; i++) {
      const n = String(i + 1).padStart(2, "0");
      const lit = p >= 0.62 && i + 1 === f.pillar;
      const ours = i === 5 || i === 6;
      s.put(25 + (i % 4) * 5, 2 + Math.floor(i / 4) * 2, lit ? "[" + n + "]" : " " + n + " ", lit ? 1 : ours ? 0.6 : 0.3);
    }

    if (p >= 0.62) s.put(0, 10, "cite " + f.sec + " -> P" + f.pillar + " " + f.what, 0.9);
    if (p >= 0.8) s.put(0, 11, "[review]", 1);
    s.put(p >= 0.8 ? 9 : 0, 11, p >= 0.8 ? "signed off" : "80% by the tool, 20% by a person", p >= 0.8 ? blink(t, 3) : 0.35);
  },

  // an ownership chart with one holder that does not add up
  graph(s, t) {
    const hot = blink(t, 1.5);
    s.put(16, 0, "[ HOLDCO ]", 0.9);
    s.put(15, 1, "/          \\", 0.5);
    s.put(11, 2, "60%            40%", 0.6);
    s.put(12, 3, "/                \\", 0.5);
    s.put(4, 4, "[ ALPHA PTY ]", 0.9);
    s.put(26, 4, cycle(t, 0.5, 4) ? "[ NOMINEE ]" : "[ ??????? ]", hot);
    s.put(12, 5, "\\                /", 0.5);
    s.put(15, 6, "\\          /", 0.5);
    s.put(13, 7, "[ TARGET PTY LTD ]", 0.9);
    s.put(2, 9, "register != constitution", 0.5);
    s.put(2, 10, "! undisclosed beneficial owner", hot);
  },

  // controls being ticked off against each framework
  audit(s, t) {
    const names = ["ISO 27001", "SOC 2", "GDPR", "NIST CSF", "PCI DSS"];
    const done = Math.min(30, cycle(t, 5, 44));
    names.forEach((n, r) => {
      s.put(0, r * 2, n, 0.7);
      for (let c = 0; c < 6; c++) {
        const k = c * 5 + r;
        s.put(12 + c * 4, r * 2, k < done ? "[x]" : "[ ]", k < done ? 1 : 0.35);
      }
    });
    const score = Math.round((done / 30) * 63);
    s.put(0, 10, "evidence " + "#".repeat(Math.round(done * 0.7)).padEnd(21, "."), 0.8);
    s.put(32, 10, String(score).padStart(2, "0") + "/63 controls", 0.9);
  },

  // the club site: a browser frame with the slideshow turning over
  browser(s, t) {
    const slides = ["law", "innovation", "technology", "society"];
    const n = cycle(t, 0.5, slides.length);
    s.put(0, 0, "+--[ qutlitsociety.com ]" + "-".repeat(21) + "+", 0.6);
    for (let y = 1; y < 10; y++) {
      s.put(0, y, "|", 0.6);
      s.put(45, y, "|", 0.6);
    }
    s.put(0, 10, "+" + "-".repeat(44) + "+", 0.6);
    s.put(2, 1, "LITS", 1);
    s.put(22, 1, "home  events  join", 0.5);
    for (let x = 2; x < 44; x++) {
      const v = Math.sin(x * 0.4 + t * 2) + Math.sin(x * 0.17 - t * 1.3);
      s.put(x, v > 0.6 ? 3 : v > -0.6 ? 4 : 5, "~", 0.45);
    }
    s.put(23 - (slides[n].length >> 1), 7, slides[n].toUpperCase(), 1);
    slides.forEach((_, i) => s.put(19 + i * 2, 9, i === n ? "o" : ".", i === n ? 1 : 0.5));
  },

  // documents pulled onto a timeline by the dates found inside them
  timeline(s, t) {
    const docs = [".pdf", ".docx", ".eml", ".msg", ".pdf"];
    const years = ["2019", "2020", "2021", "2022", "2023"];
    const scan = ((t * 0.35) % 1) * 46;
    s.put(0, 6, "-".repeat(45) + ">", 0.5);
    docs.forEach((d, i) => {
      const x = 3 + i * 9;
      const found = scan > x;
      s.put(x - 1, 1, "+---+", found ? 0.9 : 0.3);
      s.put(x - 1, 2, "|" + (found ? "===" : "   ") + "|", found ? 0.9 : 0.3);
      s.put(x - 1, 3, "+---+", found ? 0.9 : 0.3);
      s.put(x - 1, 4, d, 0.5);
      s.put(x + 1, 5, "|", found ? 0.8 : 0.25);
      s.put(x + 1, 6, "o", found ? 1 : 0.4);
      if (found) s.put(x - 1, 7, years[i], 0.9);
    });
    s.put(Math.floor(scan), 8, "^", 1);
    s.put(0, 10, "extracting dates, linking to claims", 0.5);
  },

  // swipe left or right on a dog
  paw(s, t) {
    const beat = blink(t, 2.4);
    rows(s, 16, 0, ["  _     _", " ( )   ( )", "  '  _  '", " _  ( )  _", "( )  '  ( )"], beat);
    rows(s, 17, 5, [" .-----.", "(       )", " '-----'"], beat);
    const like = cycle(t, 0.6, 2);
    s.put(1, 4, "<- naw", like ? 0.35 : 1);
    s.put(37, 4, "paw ->", like ? 1 : 0.35);
    s.put(like ? 39 : 3, 6, like ? "<3" : "x", 1);
    s.put(12, 10, like ? "it's a match. say hi." : "maybe the next one.", 0.6);
  },

  // jurisdictions stacked up, with a citation dropping through them
  layers(s, t) {
    const tiers = ["commonwealth", "state", "local"];
    const drop = cycle(t, 1.2, 8);
    tiers.forEach((name, i) => {
      const y = 1 + i * 3;
      s.put(6 - i, y, "/" + "-".repeat(22) + "/", drop >= i * 2 + 1 ? 1 : 0.45);
      s.put(31, y, name, 0.6);
    });
    s.put(15, Math.min(9, 1 + drop), "|", 0.9);
    s.put(11, 10, "[ s 12(3) ]", 1);
    s.put(24, 10, "source kept in view", 0.5);
  },

  // what the helmet camera sees: detections boxed and marked
  scope(s, t) {
    const y = cycle(t, 4, 9);
    s.put(0, 0, "+" + "-".repeat(44) + "+", 0.5);
    for (let r = 1; r < 10; r++) {
      s.put(0, r, "|", 0.5);
      s.put(45, r, "|", 0.5);
    }
    s.put(0, 10, "+" + "-".repeat(44) + "+", 0.5);
    s.put(1, 1 + y, "-".repeat(44), 0.18);
    const lock = cycle(t, 0.4, 3);
    rows(s, 6, 2, ["+-------+", "|   o   |", "|  /|\\  |", "|  / \\  |", "+-------+"], lock > 0 ? 1 : 0.4);
    if (lock > 0) s.put(6, 7, "person 0.92", 0.8);
    rows(s, 29, 3, ["+-----+", "| /!\\ |", "+-----+"], lock > 1 ? blink(t, 3) : 0.3);
    if (lock > 1) s.put(28, 6, "hazard 0.81", 0.8);
    s.put(2, 9, lock > 1 ? "> 2 markers sent to map" : "> snapshot every 5s", 0.6);
  },

  // a site being checked against the rules that protect what lives on it
  habitat(s, t) {
    const scan = ((t * 0.3) % 1) * 30;
    rows(s, 2, 0, ["   /\\", "  /  \\", " /____\\", "   ||"], 0.8);
    rows(s, 11, 1, ["  /\\", " /  \\", "/____\\", "  ||"], 0.6);
    rows(s, 19, 0, ["   /\\", "  /  \\", " /____\\", "   ||"], 0.8);
    s.put(0, 5, "_".repeat(28), 0.5);
    for (let x = 0; x < 28; x += 2) s.put(x + (cycle(t, 2, 2) ? 1 : 0), 6, "~", 0.4);
    s.put(Math.floor(scan), 7, "^ survey", 1);
    const rules = [
      ["vegetation", 4, 0],
      ["protected spp", 12, 1],
      ["waterway", 20, 1],
      ["offsets", 27, 0],
    ];
    rules.forEach(([name, at, risk], i) => {
      const checked = scan > at;
      s.put(30, i * 2, name, checked ? 0.9 : 0.4);
      s.put(44, i * 2, checked ? (risk ? "!!" : "ok") : "..", checked && risk ? blink(t, 3) : checked ? 0.9 : 0.4);
    });
    s.put(0, 10, "checked against qld legislation + tern data", 0.5);
  },

  // an hourglass and the countdown until the capsule opens
  capsule(s, t) {
    const left = 4000 - Math.floor(t * 9) % 4000;
    const f = (t * 0.25) % 1;
    const top = Math.round((1 - f) * 3);
    const fill = (n, w) => ":".repeat(Math.max(0, n)).padStart((w + Math.max(0, n)) >> 1).padEnd(w);
    s.put(6, 0, "+-------+", 0.8);
    s.put(6, 1, " \\" + fill(top > 2 ? 5 : top > 1 ? 3 : top, 5) + "/", 0.9);
    s.put(6, 2, "  \\" + fill(top > 0 ? 3 : 0, 3) + "/", 0.9);
    s.put(6, 3, "   \\" + (f < 0.98 ? ":" : " ") + "/", 0.9);
    s.put(6, 4, "   /" + (cycle(t, 6, 2) ? "." : " ") + "\\", 0.9);
    s.put(6, 5, "  /" + fill(f > 0.3 ? 3 : 1, 3) + "\\", 0.9);
    s.put(6, 6, " /" + fill(f > 0.7 ? 5 : f > 0.3 ? 3 : 1, 5) + "\\", 0.9);
    s.put(6, 7, "+-------+", 0.8);
    s.put(22, 1, "message   [ sealed ]", 0.6);
    s.put(22, 3, "opens in", 0.5);
    const d = String(Math.floor(left / 600)).padStart(2, "0");
    const m = String(Math.floor(left / 10) % 60).padStart(2, "0");
    s.put(22, 4, `${d}d 14h ${m}m`, 1);
    s.put(22, 6, "key  " + "*".repeat(6 + cycle(t, 3, 6)), blink(t, 3));
    s.put(6, 10, "encrypted now, readable later", 0.5);
  },

  // judgments arriving on the feed and coming out summarised
  feed(s, t) {
    // offset so the row arithmetic never goes negative in the first second
    const n = Math.floor(t * 0.8) + 40;
    s.put(0, 0, "rss >", 0.6);
    for (let i = 0; i < 4; i++) {
      const fresh = i === 0 && (t * 0.8) % 1 < 0.5;
      s.put(6, i * 2, `[2025] FCA ${1140 + ((n - i) % 40)}`, fresh ? 1 : 0.7 - i * 0.14);
      s.put(23, i * 2, ".".repeat(8 + (((n - i) * 7) % 12)), 0.3);
    }
    s.put(12, 8, "|", 0.5);
    s.put(8, 9, "[ agent ]", blink(t, 1.6));
    s.put(18, 9, "->", 0.6);
    s.put(21, 9, "daily summary, 07:00", 0.9);
  },

  // a contract template filling itself in
  template(s, t) {
    const fields = [
      ["customer", "ACME PTY LTD"],
      ["term", "36 months"],
      ["module", "SaaS, hosting"],
      ["liability", "2x contract value"],
    ];
    const step = (t * 3.2) % 64;
    s.put(0, 0, "+" + "-".repeat(44) + "+", 0.5);
    s.put(2, 1, "QITC comprehensive contract", 0.9);
    fields.forEach(([k, v], i) => {
      const typed = Math.max(0, Math.min(v.length, Math.floor(step - i * 13)));
      s.put(2, 3 + i * 2, k.padEnd(10) + ":", 0.6);
      s.put(14, 3 + i * 2, typed ? v.slice(0, typed) + (typed < v.length ? "_" : "") : "{{ " + k + " }}", typed ? 1 : 0.35);
    });
    s.put(0, 11, "+" + "-".repeat(44) + "+", 0.5);
  },

  // a tower putting out signal
  tower(s, t) {
    const ring = cycle(t, 3, 4);
    const waves = ["(", "((", "(((", "(((("];
    s.put(22, 0, "A", 1);
    for (let i = 0; i < 4; i++) {
      const a = i === ring ? 1 : 0.25;
      s.put(20 - i * 4, 0, waves[0], a);
      s.put(24 + i * 4, 0, ")", a);
    }
    rows(s, 17, 1, ["    /|\\", "   / | \\", "  /--+--\\", " /   |   \\", "/----+----\\"], 0.8);
    s.put(1, 7, "licence   spectrum   privacy   tio", 0.6);
    s.put(1 + [0, 10, 21, 31][cycle(t, 0.8, 4)], 8, "^", 1);
    s.put(1, 10, "quick lookup for the rules that apply", 0.5);
  },

  // a shelf of clauses, one pulled out at a time
  shelf(s, t) {
    const names = ["indemnity", "liability", "warranty", "confidentiality", "termination", "ip", "notices", "governing law"];
    const n = cycle(t, 0.9, names.length);
    s.put(2, 0, "+" + "-".repeat(40) + "+", 0.5);
    names.forEach((name, i) => {
      const x = 4 + i * 5;
      const a = i === n ? 1 : 0.5;
      const lift = i === n ? 1 : 2;
      for (let y = lift; y < 6; y++) s.put(x, y, "|" + (y === lift ? "--" : y === 3 ? name[0].toUpperCase() + " " : "  ") + "|", a);
    });
    s.put(2, 6, "+" + "-".repeat(40) + "+", 0.5);
    s.put(4, 8, "> " + names[n], 1);
    s.put(4, 9, "  copy clause", blink(t, 2) * 0.7);
  },

  // an entity relationship diagram built from an investigation
  erd(s, t) {
    const hot = cycle(t, 1, 4);
    const box = (x, y, name, on) => rows(s, x, y, ["+----------+", "| " + name.padEnd(9) + "|", "+----------+"], on ? 1 : 0.6);
    box(2, 0, "PERSON", hot === 0);
    box(30, 0, "COMPANY", hot === 1);
    box(2, 7, "ADDRESS", hot === 3);
    box(30, 7, "FILING", hot === 2);
    s.put(13, 1, "1 -------------- n", hot < 2 ? 1 : 0.45);
    s.put(7, 3, "|", 0.45);
    s.put(7, 4, "n", 0.6);
    s.put(7, 5, "|", 0.45);
    s.put(35, 3, "|", 0.45);
    s.put(35, 4, "1", 0.6);
    s.put(35, 5, "|", 0.45);
    s.put(15, 10, "generated from records", 0.5);
  },

  // businesses being checked for signs of life
  pulse(s, t) {
    const firms = ["acme pty ltd", "bravo holdings", "corvus trading", "delta imports"];
    const alive = [1, 0, 1, 1];
    firms.forEach((name, i) => {
      const y = i * 2 + 1;
      s.put(0, y, name, 0.7);
      let line = "";
      for (let x = 0; x < 20; x++) {
        const k = (x + Math.floor(t * 8) + i * 5) % 10;
        line += !alive[i] ? "_" : k === 0 ? "/" : k === 1 ? "\\" : "_";
      }
      s.put(16, y, line, alive[i] ? 0.9 : 0.3);
      s.put(38, y, alive[i] ? "active" : "silent", alive[i] ? 0.8 : blink(t, 2));
    });
    s.put(0, 10, "status checked daily during the matter", 0.5);
  },
};

export function sketch(canvas, kind, still) {
  const g = grid(canvas, 9);
  const draw = SKETCHES[kind] || SKETCHES.pulse;
  let ox = 0;
  let oy = 0;
  let last = -1;
  let clock = 0;
  let hot = false;

  const s = {
    put(x, y, text, alpha = 0.8) {
      const py = (oy + y) * g.ch + g.ch / 2;
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i) - FIRST;
        if (code > 0) g.put(code, (ox + x + i) * g.cw + g.cw / 2, py, alpha);
      }
    },
  };

  const row = canvas.closest("li");
  row.addEventListener("pointerenter", () => (hot = true));
  row.addEventListener("pointerleave", () => (hot = false));

  function resize() {
    g.fit();
    ox = Math.max(0, (g.cols - W) >> 1);
    oy = Math.max(0, (g.rows - H) >> 1);
    last = -1;
  }

  // slow by default, livelier while the row is hovered
  function frame(t) {
    if (!g.cols || (!still && last >= 0 && t - last < (hot ? 0.05 : 0.12))) return;
    if (last >= 0) clock += Math.min(0.25, t - last) * (hot ? 1.8 : 1);
    last = t;
    g.clear();
    draw(s, still ? 3 : clock);
  }

  watch(resize);

  return { el: canvas, frame, resize };
}
